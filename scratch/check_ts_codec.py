import urllib.request

url = 'http://185.9.2.18/chid_352/tracks-v1a1/mono.m3u8'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
content = urllib.request.urlopen(req).read().decode('utf-8')
ts_line = [l.strip() for l in content.splitlines() if l.strip() and not l.startswith('#')][-1]
ts_url = f'http://185.9.2.18/chid_352/tracks-v1a1/{ts_line}'

ts_data = urllib.request.urlopen(urllib.request.Request(ts_url, headers={'User-Agent': 'Mozilla/5.0'})).read(50000)

# Scan TS packets (188 bytes each)
pmt_pid = None
stream_types = []

for i in range(0, len(ts_data) - 188, 188):
    pkt = ts_data[i:i+188]
    if pkt[0] != 0x47:
        continue
    pid = ((pkt[1] & 0x1F) << 8) | pkt[2]
    payload_start = (pkt[1] & 0x40) != 0
    adaptation = (pkt[3] & 0x30) >> 4
    
    offset = 4
    if adaptation in (2, 3):
        adapt_len = pkt[4]
        offset += 1 + adapt_len
    if offset >= 188:
        continue
        
    payload = pkt[offset:]
    if payload_start and len(payload) > 0:
        pointer = payload[0]
        table_data = payload[1 + pointer:]
        if len(table_data) > 0 and table_data[0] == 0x02: # PMT
            section_len = ((table_data[1] & 0x0F) << 8) | table_data[2]
            program_info_len = ((table_data[10] & 0x0F) << 8) | table_data[11]
            es_info = table_data[12 + program_info_len : 3 + section_len - 4]
            idx = 0
            while idx < len(es_info):
                stype = es_info[idx]
                epid = ((es_info[idx+1] & 0x1F) << 8) | es_info[idx+2]
                es_len = ((es_info[idx+3] & 0x0F) << 8) | es_info[idx+4]
                stream_types.append((hex(stype), epid))
                idx += 5 + es_len
            break

print("Identified PMT Stream Types:")
CODEC_NAMES = {
    '0x1': 'MPEG-1 Video',
    '0x2': 'MPEG-2 Video (Not natively supported by HTML5/Chrome without H.264!)',
    '0x3': 'MPEG-1 Audio',
    '0x4': 'MPEG-2 Audio',
    '0x1b': 'H.264 / AVC (Supported by browser)',
    '0x24': 'H.265 / HEVC',
    '0xf': 'AAC Audio'
}
for st, pid in stream_types:
    print(f"  Stream Type: {st} ({CODEC_NAMES.get(st, 'Unknown')}) - PID: {pid}")
