"""
Rebuild certificate gallery slides — v5 FINAL:
  1. All 31 certificates audited and placed in correct vendor
  2. Grouped by vendor, sorted oldest->newest within each vendor
  3. Dynamic grid: NO empty slots — cells pack tightly
     - 1 cert  → 1 column, centered, large
     - 2 certs → 2 columns, centered
     - 3 certs → 3 columns (full row)
     - 4 certs → 2x2 grid (2 cols x 2 rows)
     - 5 certs → 3+2 (row1=3, row2=2 centered)
     - 6 certs → 3x2 grid (full)
     - 7–9     → spillover to next slide (max 6 per slide)
"""

import copy, os
from io import BytesIO
from pptx import Presentation
from pptx.util import Emu, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN

IMG_DIR   = r"c:\Users\EEHC\.gemini\antigravity-ide\scratch\arabia-live-tv\certs\images"
CERTS_DIR = r"c:\Users\EEHC\.gemini\antigravity-ide\scratch\arabia-live-tv\certs"

# ─── Slide canvas dimensions ───────────────────────────────────────────────
SLIDE_W = 12188952  # EMU
SLIDE_H = 6858000   # EMU

# ─── Safe drawing area (below the header chrome, above bottom edge) ─────────
DRAW_TOP    = 1207008   # top of cert grid area
DRAW_BOTTOM = 6750000   # max bottom
DRAW_LEFT   = 274320    # left margin
DRAW_RIGHT  = 11914632  # right margin
DRAW_W      = DRAW_RIGHT - DRAW_LEFT
DRAW_H      = DRAW_BOTTOM - DRAW_TOP

IMG_ASPECT  = 2240280 / 3694176   # original h/w ratio ≈ 0.606
CAPTION_H   = 320000              # height for date+label text
GAP_X       = 120000              # horizontal gap between cards
GAP_Y       = 200000              # vertical gap between rows
DATE_H      = 130000              # height of date badge strip


# ─── VENDOR DEFINITIONS ────────────────────────────────────────────────────
VENDORS = [
    {
        "id":    "esri",
        "label": "ESRI / ARCGIS CERTIFIED TRAINING",
        "color": RGBColor(0x00, 0x7A, 0xFF),
        "certs": [
            # Oldest -> Newest
            {"date": "Nov 2022", "label": "Designing Maps with ArcGIS",               "img": "DesigningMapsWithArcGIS.jpg",                 "root": True},
            {"date": "May 2023", "label": "Geometric Networks for Utilities",          "img": "WorkingwithGeometricNetworksforUtilities.png"},
            {"date": "Aug 2023", "label": "CAD Data in ArcGIS Desktop",               "img": "WorkingwithCADdatainArcGIS_DeskTop.png"},
            {"date": "Nov 2023", "label": "ArcGIS Schematics",                        "img": "WorkingwithArcGIS_Schematics.png"},
            {"date": "Aug 2024", "label": "Sharing GIS Content on the Web",           "img": "SharingGIS_ContentOnTheWeb.png"},
            {"date": "Dec 2024", "label": "Performing Analysis in ArcGIS",            "img": "PerformingAnalysisInArcGIS.png"},
            {"date": "Jan 2025", "label": "Intro to Data Reviewer",                   "img": "IntroDataReviewerForDataQuality.png"},
            {"date": "Jan 2025", "label": "Versioned Workflows in Multiuser GDB",     "img": "ImplementVersionedWorkFlowsInMultiuserGeodatabase.png"},
            {"date": "Jan 2025", "label": "GeoDatabase On-Job Training",              "img": "GeoDataBaseOnJobTraining.png"},
            {"date": "Feb 2025", "label": "Field Data Collection & Management",       "img": "FieldDataCollection_ManagementUsingArcGIS.png"},
            {"date": "Feb 2025", "label": "Essential Workflows in ArcGIS",            "img": "EssentialworkflowsInArcGIS.png"},
            {"date": "Feb 2025", "label": "Editing Data with ArcGIS Desktop",         "img": "EditingDatawithArcGIS_Desktop.png"},
            {"date": "Feb 2025", "label": "Geodatabase Replication",                  "img": "DistributingDataUsingGeodatabaseReplication.png"},
            {"date": "Feb 2025", "label": "Multiuser Geodatabase Deployment",         "img": "Deploy_MaintainMultiuserGeodatabase.png"},
            {"date": "Feb 2025", "label": "Building Geodatabases",                    "img": "BuildingGeoDataBases.png"},
        ],
    },
    {
        "id":    "arcfm",
        "label": "SCHNEIDER ELECTRIC / ARCFM CERTIFIED TRAINING",
        "color": RGBColor(0x00, 0xB4, 0x5A),
        "certs": [
            {"date": "Jan 2023", "label": "ArcFM Web Portal",                         "img": "WorkwithArcFMweb.png"},
            {"date": "Mar 2023", "label": "ArcFM Mobile Suite",                       "img": "WorkwithArcFM_Mobile.png"},
            {"date": "Mar 2024", "label": "ArcFM Electric & Advanced ArcFM",          "img": "WorkingwithArcFMelectric_AdvancedArcFM.png"},
            {"date": "Apr 2024", "label": "ArcFM Designer Express",                   "img": "WorkingwithArcFMDesignerExpress.png"},
            {"date": "Sep 2024", "label": "Schematic / SLD Generation",               "img": "SchematicSLDgeneration.png"},
            {"date": "Jan 2025", "label": "Integrated Document Management",           "img": "IntegratedDocumentManagementSys.png"},
        ],
    },
    {
        "id":    "fortinet",
        "label": "FORTINET — NETWORK SECURITY CERTIFICATIONS",
        "color": RGBColor(0xE4, 0x30, 0x30),
        "certs": [
            {"date": "Jan 2025", "label": "FortiGate Infrastructure",                 "img": "FortiGateInfrastructure.png"},
            {"date": "Jan 2025", "label": "FortiADC Load Balancer",                   "img": "FortiADC_LoadBalancer.png"},
        ],
    },
    {
        "id":    "scada",
        "label": "SCADA & INDUSTRIAL CONTROL SYSTEMS",
        "color": RGBColor(0x88, 0x44, 0xDD),
        "certs": [
            {"date": "Oct 2024", "label": "SCADA / ADMS Training",                    "img": "SCADA-ADMS.png"},
            {"date": "Nov 2024", "label": "SCADA / WinCC (Siemens)",                  "img": "SCADA(WinCC).png"},
        ],
    },
    {
        "id":    "it",
        "label": "INFORMATION TECHNOLOGY & WEB DEVELOPMENT",
        "color": RGBColor(0xFF, 0x88, 0x00),
        "certs": [
            # Oldest -> Newest
            {"date": "Prior 2020", "label": "Application Software",                   "img": "ApplicationSoftware.jpeg"},
            {"date": "Prior 2020", "label": "E-Commerce & Digital Business",          "img": "E-Commerce.jpg"},
            {"date": "Jun 2024",   "label": "Full-Stack Web Development",             "img": "Web-Developer.png"},
        ],
    },
    {
        "id":    "language",
        "label": "LANGUAGE & PROFESSIONAL DEVELOPMENT",
        "color": RGBColor(0x00, 0xC8, 0xC8),
        "certs": [
            {"date": "Prior 2020", "label": "English Language Diploma",               "img": "English-Diploma.jpg"},
            {"date": "Prior 2020", "label": "Appreciation Certificate",               "img": "Appreciation Certificate.jpg"},
        ],
    },
    {
        "id":    "academic",
        "label": "ACADEMIC GRADUATION CERTIFICATE",
        "color": RGBColor(0xFF, 0xAA, 0x00),
        "certs": [
            {"date": "Jun 2026", "label": "B.Sc. Computer & Systems Engineering\nAl-Azhar University", "img": "G.png"},
        ],
    },
]


# ─── Image loader ───────────────────────────────────────────────────────────
def load_img(cert):
    """Return raw bytes for a certificate image, checking both dirs."""
    in_root = cert.get("root", False)
    if in_root:
        p = os.path.join(CERTS_DIR, cert["img"])
        if os.path.exists(p):
            with open(p, "rb") as f:
                return f.read()
    p = os.path.join(IMG_DIR, cert["img"])
    if os.path.exists(p):
        with open(p, "rb") as f:
            return f.read()
    # try root as fallback
    p2 = os.path.join(CERTS_DIR, cert["img"])
    if os.path.exists(p2):
        with open(p2, "rb") as f:
            return f.read()
    print(f"  [WARN] Missing: {cert['img']}")
    return None


# ─── Dynamic grid calculator ────────────────────────────────────────────────
def calc_positions(n):
    """
    Return list of (left, top, w, h) tuples for n certificates.
    No empty cells — cards are scaled to fill the space evenly.
    Max 6 per call (caller splits into pages of 6).
    """
    if n == 0:
        return []

    # Decide grid shape
    if n == 1:
        cols, rows = 1, 1
    elif n == 2:
        cols, rows = 2, 1
    elif n == 3:
        cols, rows = 3, 1
    elif n == 4:
        cols, rows = 2, 2
    elif n == 5:
        cols, rows = 3, 2   # last row will have 2 centred
    else:  # 6
        cols, rows = 3, 2

    # Card dimensions
    card_w = (DRAW_W - GAP_X * (cols - 1)) // cols
    img_h  = int(card_w * IMG_ASPECT)
    card_h = img_h + DATE_H + CAPTION_H

    total_cards_h = rows * card_h + (rows - 1) * GAP_Y

    # Vertical centering
    v_start = DRAW_TOP + (DRAW_H - total_cards_h) // 2

    positions = []
    for i in range(n):
        row = i // cols
        col = i % cols

        # For the last row of n==5, centre the 2 remaining cards
        row_n   = min(cols, n - row * cols)   # cards in this row
        row_w   = row_n * card_w + (row_n - 1) * GAP_X
        h_start = DRAW_LEFT + (DRAW_W - row_w) // 2

        left = h_start + col * (card_w + GAP_X)
        top  = v_start + row * (card_h + GAP_Y)
        positions.append((left, top, card_w, img_h))

    return positions


# ─── Slide builder ──────────────────────────────────────────────────────────
def add_gallery_slide(prs_obj, certs_on_slide, section_title, subtitle,
                      vendor_color, template_slide):
    slide = prs_obj.slides.add_slide(prs_obj.slide_layouts[6])

    # Copy chrome background
    for shape in template_slide.shapes:
        if not hasattr(shape, "image"):
            slide.shapes._spTree.append(copy.deepcopy(shape.element))

    # Update header texts
    patched_title = False
    patched_sub   = False
    for s in slide.shapes:
        if not s.has_text_frame:
            continue
        ft = s.text_frame.text.strip()

        if not patched_title and any(
            kw in ft for kw in ["ESRI", "SCHNEIDER", "ADDITIONAL",
                                  "ACADEMIC", "CERTIFICATES", "FORTINET",
                                  "SCADA", "WEB", "INFORMATION", "LANGUAGE"]
        ):
            for p in s.text_frame.paragraphs:
                for r in p.runs:
                    r.text = ""
            p0 = s.text_frame.paragraphs[0]
            r0 = p0.add_run() if not p0.runs else p0.runs[0]
            r0.text = section_title
            r0.font.color.rgb = vendor_color
            patched_title = True

        elif not patched_sub and (
            "Certificate Gallery" in ft or "Chronological" in ft
            or "Oldest" in ft or "Gallery -" in ft
        ):
            for p in s.text_frame.paragraphs:
                for r in p.runs:
                    r.text = ""
            p0 = s.text_frame.paragraphs[0]
            r0 = p0.add_run() if not p0.runs else p0.runs[0]
            r0.text = subtitle
            patched_sub = True

    # Place cert cards
    positions = calc_positions(len(certs_on_slide))
    for idx, cert in enumerate(certs_on_slide):
        left, top, card_w, img_h = positions[idx]

        img_bytes = load_img(cert)
        if img_bytes:
            slide.shapes.add_picture(
                BytesIO(img_bytes), left=left, top=top,
                width=card_w, height=img_h,
            )

        # Date badge
        db = slide.shapes.add_textbox(
            left=left, top=top + img_h + 8000,
            width=card_w, height=DATE_H,
        )
        tf = db.text_frame
        tf.word_wrap = False
        p = tf.paragraphs[0]
        p.alignment = PP_ALIGN.CENTER
        r = p.add_run()
        r.text = cert["date"]
        r.font.size = Pt(9)
        r.font.bold = True
        r.font.color.rgb = vendor_color

        # Caption
        cb = slide.shapes.add_textbox(
            left=left, top=top + img_h + DATE_H + 12000,
            width=card_w, height=CAPTION_H,
        )
        tf2 = cb.text_frame
        tf2.word_wrap = True
        p2 = tf2.paragraphs[0]
        p2.alignment = PP_ALIGN.CENTER
        r2 = p2.add_run()
        r2.text = cert["label"]
        r2.font.size = Pt(10 if len(cert["label"]) > 30 else 11)
        r2.font.bold = True
        r2.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)

    return slide


# ─── MAIN ───────────────────────────────────────────────────────────────────
PER_PAGE = 6

prs      = Presentation("Eslam_Abdelazeem_Presentation_v4.pptx")
prs_orig = Presentation("Eslam_Abdelazeem_Presentation_v4.pptx")
template = prs_orig.slides[14]   # slide 15 – cert gallery chrome

# Remove old gallery slides (indexes 14-19)
sldIdLst = prs.slides._sldIdLst
for i in range(19, 13, -1):
    sldId = sldIdLst[i]
    rId = sldId.get("{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id")
    sldIdLst.remove(sldId)
    rel = prs.part.rels.get(rId)
    if rel:
        prs.part.drop_rel(rId)

total_certs = sum(len(v["certs"]) for v in VENDORS)
print(f"Base slides: {len(prs.slides)} | Total certs: {total_certs}")

slide_num = 0
for vendor in VENDORS:
    certs  = vendor["certs"]
    label  = vendor["label"]
    color  = vendor["color"]
    n      = len(certs)
    pages  = (n + PER_PAGE - 1) // PER_PAGE

    print(f"\n  {label}  ({n} certs, {pages} slide(s))")

    for pg in range(pages):
        start      = pg * PER_PAGE
        end        = min(start + PER_PAGE, n)
        page_certs = certs[start:end]
        suffix     = f"  ({pg+1}/{pages})" if pages > 1 else ""
        sub        = f"Oldest to Newest{suffix}  |  {n} Certificates"

        add_gallery_slide(prs, page_certs, label, sub, color, template)
        slide_num += 1
        labs = [c["label"] for c in page_certs]
        print(f"    Slide {slide_num}: {labs}")

out = "Eslam_Abdelazeem_Presentation_v5.pptx"
prs.save(out)
print(f"\nSaved: {out}  |  Total slides: {len(prs.slides)}")
