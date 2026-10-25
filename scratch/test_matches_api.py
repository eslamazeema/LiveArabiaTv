import urllib.request
import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

def test_api():
    # 1. Test get matches
    req = urllib.request.urlopen('http://localhost:8085/api/matches')
    res = json.loads(req.read().decode())
    print('Initial matches count:', len(res['data']))

    # 2. Login as admin
    login_data = json.dumps({'username': 'admin', 'password': 'admin123'}).encode()
    login_req = urllib.request.Request('http://localhost:8085/api/auth/login', data=login_data, headers={'Content-Type': 'application/json'})
    l_res = json.loads(urllib.request.urlopen(login_req).read().decode())
    token = l_res['token']
    print('Logged in successfully. Token:', token[:15] + '...')

    headers = {'Content-Type': 'application/json', 'Authorization': f'Bearer {token}'}

    # 3. Create a test match with future date & embed script
    new_match = {
        'league': 'دوري أبطال أوروبا',
        'homeTeam': 'ريال مدريد',
        'awayTeam': 'مانشستر سيتي',
        'time': '22:00',
        'date': 'الخميس 15 أكتوبر 2026',
        'status': 'upcoming',
        'score': 'vs',
        'channelName': 'بي إن سبورتس 1 HD',
        'commentator': 'حفيظ دراجي',
        'streamUrl': '<iframe src="https://example.com/live/real-city" width="100%" height="100%"></iframe>',
        'streamUrl2': 'https://shoof.alkass.net/live/ch1.m3u8'
    }
    create_req = urllib.request.Request('http://localhost:8085/api/matches', data=json.dumps(new_match).encode(), headers=headers)
    c_res = json.loads(urllib.request.urlopen(create_req).read().decode())
    match_id = c_res['data']['id']
    print('Created match:', match_id, c_res['data']['homeTeam'], 'vs', c_res['data']['awayTeam'])
    print('Date:', c_res['data']['date'])
    print('Servers:', c_res['data']['servers'])

    # 4. Edit match stream script, status, and score
    update_data = {
        'score': '2 - 1',
        'status': 'live',
        'streamUrl': '<iframe src="https://example.com/updated-stream" allowfullscreen></iframe>'
    }
    put_req = urllib.request.Request(f'http://localhost:8085/api/matches/{match_id}', data=json.dumps(update_data).encode(), headers=headers, method='PUT')
    u_res = json.loads(urllib.request.urlopen(put_req).read().decode())
    print('Updated match:', u_res['message'])
    print('Score:', u_res['data']['score'], 'Status:', u_res['data']['status'])
    print('Updated server 1:', u_res['data']['servers'][0])

    # 5. Quick score update
    score_req = urllib.request.Request(f'http://localhost:8085/api/matches/{match_id}/score', data=json.dumps({'score': '3 - 1'}).encode(), headers=headers, method='PATCH')
    s_res = json.loads(urllib.request.urlopen(score_req).read().decode())
    print('Quick score update:', s_res['message'])

    # 6. Change status to ended
    end_req = urllib.request.Request(f'http://localhost:8085/api/matches/{match_id}', data=json.dumps({'status': 'ended'}).encode(), headers=headers, method='PUT')
    urllib.request.urlopen(end_req)
    print('Marked match as ended.')

    # 7. Clear ended matches
    clear_req = urllib.request.Request('http://localhost:8085/api/matches/clear-ended', data=b'{}', headers=headers)
    cl_res = json.loads(urllib.request.urlopen(clear_req).read().decode())
    print('Clear ended matches response:', cl_res)

    # 8. Verify match is gone
    req = urllib.request.urlopen('http://localhost:8085/api/matches')
    res = json.loads(req.read().decode())
    found = any(m['id'] == match_id for m in res['data'])
    print('Is deleted match still present?', found)
    assert not found, 'Ended match was not deleted!'
    print('ALL BACKEND MATCHES TESTS PASSED SUCCESSFULLY! ✅')

if __name__ == '__main__':
    test_api()
