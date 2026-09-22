"""
Re-sort Professional Experience slides 5 & 6 — Oldest to Newest.
Correctly removes ALL old text content and rebuilds cleanly.
"""

from pptx import Presentation
from pptx.util import Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
import lxml.etree as etree

NS_A   = 'http://schemas.openxmlformats.org/drawingml/2006/main'
NS_P   = 'http://schemas.openxmlformats.org/presentationml/2006/main'
NS_R   = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships'

def rgb(hex_str):
    h = hex_str.lstrip('#')
    return RGBColor(int(h[0:2],16), int(h[2:4],16), int(h[4:6],16))

C_GOLD   = rgb('D4A843')
C_CYAN   = rgb('00D4E8')
C_BLUE   = rgb('3B8BEB')
C_GREEN  = rgb('2DD48A')
C_WHITE  = rgb('FFFFFF')
C_MUTED  = rgb('8899BB')

# ── Layout constants (from the original slide geometry) ────────────────────
SECTION_LABEL = dict(left=914400,  top=164592,  w=7315200, h=320040)
COMPANY_BOX   = dict(left=914400,  top=411480,  w=8229600, h=594360)
PAGE_NUM_BOX  = dict(left=10515600,top=347472,  w=1463040, h=365760)
ROLE1_TOP     = 1417320
DATE_LEFT     = 457200;  DATE_W = 1645920; DATE_H = 320040
TITLE_LEFT    = 2286000; TITLE_W= 9144000; TITLE_H= 347472
BULLET_LEFT   = 2514600; BULLET_W=9144000; BULLET_H=274320
ROLE_GAP      = 420000    # gap between role blocks
TITLE_GAP     = 50000     # gap between title and first bullet


def purge_textboxes(slide):
    """Remove every text-containing sp element from the slide's spTree."""
    sp_tree = slide.shapes._spTree
    PPTX_SP = '{http://schemas.openxmlformats.org/presentationml/2006/main}sp'
    DML_SP  = '{http://schemas.openxmlformats.org/drawingml/2006/main}sp'

    to_remove = []
    for child in list(sp_tree):
        tag = child.tag
        # Only touch <p:sp> elements
        if 'sp' not in tag:
            continue
        # Find any text runs
        all_t = child.findall('.//{%s}t' % NS_A)
        text = ''.join((t.text or '') for t in all_t).strip()
        if text:          # has text content -> is a textbox we want to clear
            to_remove.append(child)

    for el in to_remove:
        sp_tree.remove(el)


def add_tb(slide, left, top, w, h, text, size_pt, bold, color_rgb,
           align=PP_ALIGN.LEFT, wrap=True):
    tb = slide.shapes.add_textbox(left=left, top=top, width=w, height=h)
    tf = tb.text_frame
    tf.word_wrap = wrap
    p  = tf.paragraphs[0]
    p.alignment = align
    r  = p.add_run()
    r.text           = text
    r.font.size      = Pt(size_pt)
    r.font.bold      = bold
    r.font.color.rgb = color_rgb


def build_experience_slide(slide, page_num_label, company_title, roles):
    """Purge old text and write sorted experience content."""
    purge_textboxes(slide)

    # Header
    add_tb(slide, SECTION_LABEL['left'], SECTION_LABEL['top'],
           SECTION_LABEL['w'], SECTION_LABEL['h'],
           'PROFESSIONAL EXPERIENCE', 9, True, C_GOLD)

    add_tb(slide, COMPANY_BOX['left'], COMPANY_BOX['top'],
           COMPANY_BOX['w'], COMPANY_BOX['h'],
           company_title, 24, True, C_WHITE)

    add_tb(slide, PAGE_NUM_BOX['left'], PAGE_NUM_BOX['top'],
           PAGE_NUM_BOX['w'], PAGE_NUM_BOX['h'],
           page_num_label, 10, False, C_MUTED, align=PP_ALIGN.RIGHT)

    # Role blocks
    y = ROLE1_TOP
    for role in roles:
        # Date badge
        add_tb(slide, DATE_LEFT, y, DATE_W, DATE_H,
               role['date'], 10, True, role['date_color'])
        # Job title
        add_tb(slide, TITLE_LEFT, y, TITLE_W, TITLE_H,
               role['title'], role.get('title_size', 13), True, C_WHITE)

        y += TITLE_H + TITLE_GAP

        # Bullet points
        for bullet in role['bullets']:
            add_tb(slide, BULLET_LEFT, y, BULLET_W, BULLET_H,
                   bullet, 10.5, False, C_MUTED)
            y += BULLET_H

        y += ROLE_GAP


# ─── Load fresh copy for reading (to get unmodified slides) ───────────────
prs = Presentation('Eslam_Abdelazeem_Presentation_v4.pptx')   # start from v4 base

# ─── Load v5 to edit ───────────────────────────────────────────────────────
prs5 = Presentation('Eslam_Abdelazeem_Presentation_v5.pptx')

# ══════════════════════════════════════════════════════════════════════════
# SLIDE 5  (index 4) — Early Career: 2008-2015
# ══════════════════════════════════════════════════════════════════════════
roles_slide5 = [
    {
        "date": "2008 - 2011",
        "date_color": C_GREEN,
        "title": "Electrical Engineer",
        "title_size": 13,
        "bullets": [
            "Supported operation, maintenance, and development of electrical distribution networks.",
            "Participated in network improvement initiatives and utility modernization projects.",
        ]
    },
    {
        "date": "2009 - 2015  (Part-Time)",
        "date_color": C_CYAN,
        "title": "Web Developer  -  City Light Construction & Development Company",
        "title_size": 12,
        "bullets": [
            "Designed, developed, and maintained websites using PHP and MySQL.",
            "Designed relational database structures and implemented CMS solutions.",
        ]
    },
    {
        "date": "2011 - 2015",
        "date_color": C_BLUE,
        "title": "Operations Engineer",
        "title_size": 13,
        "bullets": [
            "Managed day-to-day operation of electrical distribution networks and control room activities.",
            "Planned switching operations, outage management, emergency response & restoration.",
        ]
    },
]

build_experience_slide(
    prs5.slides[4],
    '05 / 12',
    'Egyptian Electricity Holding Company (EEHC)  |  Early Career',
    roles_slide5
)

# ══════════════════════════════════════════════════════════════════════════
# SLIDE 6  (index 5) — Advanced Career: 2015-Present
# ══════════════════════════════════════════════════════════════════════════
roles_slide6 = [
    {
        "date": "2015 - 2021",
        "date_color": C_GOLD,
        "title": "GIS Engineer",
        "title_size": 13,
        "bullets": [
            "Developed GIS automation tools using Python and VBA, improving data-processing efficiency.",
            "Managed and maintained geospatial databases of electrical distribution network assets.",
            "Implemented GIS workflows, data validation, and enterprise geodatabase management.",
            "Contributed to GIS-SCADA/ADMS integration and control center modernization initiatives.",
        ]
    },
    {
        "date": "2021 - 2024",
        "date_color": C_GOLD,
        "title": "Senior Power GIS Engineer",
        "title_size": 13,
        "bullets": [
            "Led GIS enterprise system design, data migration, and quality assurance for national distribution control center projects.",
            "Managed GIS-SCADA/ADMS integration, network model development, and end-to-end system commissioning.",
            "Developed GIS automation workflows and supervised FAT & SAT activities for multiple control centers.",
            "Coordinated with Schneider Electric, Siemens, and GE for system implementation and delivery.",
        ]
    },
    {
        "date": "2024 - Present",
        "date_color": C_CYAN,
        "title": "Digital Command Center Engineer",
        "title_size": 13,
        "bullets": [
            "Monitor & analyze operational/performance indicators for distribution companies across Egypt via the National Digital Command Center.",
            "Develop and maintain KPI monitoring frameworks, dashboards, analytical reports & performance indicators.",
            "Support enterprise-wide digital transformation through data integration, visualization & automated reporting.",
        ]
    },
]

build_experience_slide(
    prs5.slides[5],
    '06 / 12',
    'Egyptian Electricity Holding Company (EEHC)  |  Advanced Career (2015-Present)',
    roles_slide6
)

prs5.save('Eslam_Abdelazeem_Presentation_v5.pptx')
print('Done. Slides 5 & 6 rebuilt oldest to newest.')

# Quick verify
prs_check = Presentation('Eslam_Abdelazeem_Presentation_v5.pptx')
for idx in [4, 5]:
    slide = prs_check.slides[idx]
    print('--- Slide', idx+1, '---')
    items = [s.text_frame.text.strip()[:55] for s in slide.shapes
             if s.has_text_frame and s.text_frame.text.strip()]
    for it in items:
        print('  ', it)
