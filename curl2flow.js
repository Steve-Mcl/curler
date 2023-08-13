const { FlowBuilder } = require('./src/FlowBuilder.js')

let curls = [
    // `curl -X 'POST' \
    // 'http://192.168.1.1/broadcast/control' \
    // -H 'accept: */*' \
    // -H 'Content-Type: application/json' \
    // -d '{"switchable": false}'`,
    // `curl -i -s -k -X 'POST' -H 'Host: 192.168.178.87' -H 'Connection: close' -H 'Accept: application/json, text/plain, */*' -H 'User-Agent: okhttp/3.10.0' -H 'Sec-Fetch-Site: same-origin' -H 'Sec-Fetch-Mode: cors' -H 'Sec-Fetch-Dest: empty' -H 'Accept-Encoding: gzip, deflate' -H 'Accept-Language: de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7' -H 'Content-Type: application/x-www-form-urlencoded;charset=UTF-8' -H 'Content-Length: 56' -H 'Origin: https://192.168.178.87' -H 'Referer: https://192.168.178.87/webui/login' --data-binary 'grant_type=password&username=<USERNAME>&password=<PASSWORD>' https://192.168.178.87/api/v1/token`,
    // `curl -i -s -k -X 'POST' -H 'Host: 192.168.178.87' -H 'Connection: close' -H 'Accept: application/json, text/plain, */*' -H 'User-Agent: okhttp/3.10.0' -H 'Sec-Fetch-Site: same-origin' -H 'Sec-Fetch-Mode: cors' -H 'Sec-Fetch-Dest: empty' -H 'Accept-Encoding: gzip, deflate' -H 'Accept-Language: de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7' -H 'Content-Type: application/x-www-form-urlencoded;charset=UTF-8' -H 'Content-Length: 30' -H 'Referer: https://192.168.178.87/webui/login' -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE2NDE2NzE3MzYsInN1YiI6IldCQWRtaW4iLCJ1aWQiOiJkYThmNzMxNi1kZmUxLTQzNjMtODU2Yi0yZmI5YjMwNzJkNTAiLCJleHAiOjE2NDE2NzUzMzZ9.EOUQkXk9Fw7vhZeFE-2TFxHqoNv5fJZo7CXs7H-be6o' -b 'node03v08nb30tz041fqxrsfye75cv502.node0' --data-binary '[{"componentId":"IGULD:SELF"}]' https://192.168.178.87/api/v1/measurements/live/`,
    // `curl -H "Authorization: Bearer token_api_oauth" \
    // "https://api.smsapi.pl/sms.do?\
    // from=pole_nadawcy&\
    // to=48500000000&\
    // message=treść_wiadomości&\
    // format=json"`,
    // `curl http://1.2.3.4/api/router/login -d "pwd=XXYYZZAABB"`,
    // `curl -X POST \
    // 'http://localhost:8080/workers' \
    // -H 'authorization: eyJhbGciOiJIUzI1NiIsInR5cCI6ImFjY2VzcyIsInR5cGUiOiJhY2Nlc3MifQ.eyJ1c2VySWQiOjEsImFjY291bnRJZCI6MSwiaWF0IjoxNTExMzMwMzg5LCJleHAiOjE1MTM5MjIzODksImF1ZCI6Imh0dHBzOi8veW91cmRvbWFpbi5jb20iLCJpc3MiOiJmZWF0aGVycyIsInN1YiI6ImFub255bW91cyJ9.HWk7qJ0uK6SEi8qSeeB6-TGslDlZOTpG51U6kVi8nYc' \
    // -H 'content-type: application/x-www-form-urlencoded' \
    // --data-binary '@/home/limitless/Downloads/iRoute Masters - Workers.csv'`,
    // `curl -i -X POST -H "Content-Type: multipart/form-data" 
    // -F "data=@test.mp3" -F "userid=1234" http://mysuperserver/media/upload/`,
    // `curl -X POST -H "Content-type:application/json" -d '{"text":"Es hat gerade geklingelt!","attachments":[{"image_url":"http://192.168.0.8:8123/local/images/FILENAME"}]}' http://192.168.147.155:3000/hooks/EBKNzvBtZbBtCCyRG/hTyvpugcp85dXnyuogm8XxD8GXH9bvEDimvdNZEyw3WCTibQ?param1=1&param2=two`,
    // `curl 'https://airnowgovapi.com/reportingarea/get_state' \
    // -H 'Connection: keep-alive' \
    // -H 'Pragma: no-cache' \
    // -H 'Cache-Control: no-cache' \
    // -H 'sec-ch-ua: " Not;A Brand";v="99", "Google Chrome";v="91", "Chromium";v="91"' \
    // -H 'Accept: */*' \
    // -H 'sec-ch-ua-mobile: ?0' \
    // -H 'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' \
    // -H 'Content-Type: application/x-www-form-urlencoded; charset=UTF-8' \
    // -H 'Origin: https://www.airnow.gov' \
    // -H 'Sec-Fetch-Site: cross-site' \
    // -H 'Sec-Fetch-Mode: cors' \
    // -H 'Sec-Fetch-Dest: empty' \
    // -H 'Referer: https://www.airnow.gov/' \
    // -H 'Accept-Language: en-GB,en-US;q=0.9,en;q=0.8,es;q=0.7' \
    // --data-raw 'state_code=NY' \
    // --compressed`,
    // 'curl -X GET -G \
    // "https://api2.smsXXXX.pl/sms" \
    // -d key=klucz \
    // -d password=haslo \
    // -d from=TEST \
    // -d to=600111222 \
    // -d msg=Wiadomosc',
    // 'curl --location --request POST \'http://ds1821:8083/api/v2/torrents/add\' --header \'Cookie: SID=nDRB9Afezq5ZvYyDAHLy7g6GRxFmQl0N\' --form \'torrents=@"/C:/temp/b1.pdf"\' --form \'pdf=@"/C:/temp/a1.pdf"\'',
    'curl --location --request POST \'http://localhost:8080/api/v1/templates/\' --header \'accept: application/json\' --header \'Content-Type: multipart/form-data\' --form \'request={ "title": "My template" };type=application/json\' --form \'file=@/tmp/archive.zip;type=application/octet-stream\'',
    'curl --location --request POST \'http://localhost:8080/api/v1/templates/\' --header \'accept: application/json\' --header \'Content-Type: multipart/form-data\' --form \'request={ "title": "My template" };type=application/json\' --form \'file=@/tmp/archive.zip;type=application/octet-stream\'',
    'curl -v POST -H \'Authorization: Bearer 98347593859843753874583745\' \
  -H \'Accept: application/json\' \
  -H \'Content-Type: multipart/form-data\' \
  --form-string \'data={"id": 42}\' \
  -F \'image=@/path/to/image.png\' \
  \'https://api.thirdparty.com/API/Endpoint.json\'',

    `curl 'http://192.168.8.1/api/sms/send-sms'
-H 'Connection: keep-alive'
-H 'Pragma: no-cache'
-H 'Cache-Control: no-cache'
-H 'Accept: /'
-H 'X-Requested-With: XMLHttpRequest'
-H '__RequestVerificationToken: 1743643931'
-H 'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
-H 'Content-Type: application/x-www-form-urlencoded; charset=UTF-8'
-H 'Origin: 192.168.8.1'
-H 'Referer: 192.168.8.1/html/smsinbox.html'
-H 'Accept-Language: fa-US,fa;q=0.9,en-US;q=0.8,en;q=0.7'
-H 'dnt: 1'
--data-raw '<?xml version="1.0" encoding="UTF-8"?>-1+239133311838text message sms1512021-07-16 18:19:51'
--compressed
--insecure`,

    `curl "http://192.168.1.14/moni_1" 
  -H "Connection: keep-alive" 
  -H "Upgrade-Insecure-Requests: 1" 
  -H "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36 Edg/90.0.818.51" 
  -H "Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9" 
  -H "Referer: http://192.168.1.14/startpage" 
  -H "Accept-Language: en-US,en;q=0.9,es;q=0.8" 
  -H "Cookie: uibuilder-namespace=elogbooks; io=-6M-3lcOPxxQ4NxEAAAL; upd_state=off; siemens_ad_session=A5E8EA2C3C713568143207F37E1F5A5C0661FF435D87A5B721812BF52944BD14; _csrf_token=E6EFF120396769EC3DB1EC39AF8F8539204A60DEA3F61747FF52E8DAA872D2E1" 
  `,
    `curl "http://192.168.1.14/login"
  -H "Connection: keep-alive"
  -H "Cache-Control: max-age=0"
  -H "Upgrade-Insecure-Requests: 1"
  -H "Origin: http://192.168.1.14"
  -H "Content-Type: application/x-www-form-urlencoded"
  -H "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36 Edg/90.0.818.51"
  -H "Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9"
  -H "Referer: http://192.168.1.14/login"
  -H "Accept-Language: en-US,en;q=0.9,es;q=0.8"
  -H "Cookie: uibuilder-namespace=elogbooks; io=-6M-3lcOPxxQ4NxEAAAL; upd_state=off; siemens_ad_session=F214B7C88481BD2E11513D93C8ACDC525F48E8D17DEFD6FABD7FBB4040652669; _csrf_token=281B2EB2E5EDDFCC761ABEF5104605B37B2395E950B8DEF82886FBBFCF7ADE9D"
  `,
    'curl -F "imagefile=@/data/image.jpg" http://localhost:5003/process',
    'curl --request POST \
  --url http://www.httpbin.org/post?param1=1&param2=two \
  -H \'cache-control: no-cache\' \
  --header \'content-type: multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW\' \
  --header \'postman-token: 81163614-974d-2fc5-4251-d9f6544f9d2c\' \
  --form hello=world \
  --form hello1=world1',
    'curl \'https://exampleserver.com/api/v5/tracktime/\' -H \'origin: https://exampleserver.com\' -H \'accept-encoding: gzip, deflate, br\' -H \'accept-language: en-GB,en-US;q=0.8,en;q=0.6\' -H \'authorization: JWT eyJiOjE1MTIyMTIyNzYsIm9yaiOjE1MTIyMTIyNzYsIm9yaJ9.eyJ2ZXJzaW9uIjoiMjciLCJleHAiOjE1MTIyMTIyNzYsIm9yaiOjE1MTIyMTIyNzYsIm9yaLCJ1c2VyX2lkIjo1MTAsImVtYWlsIjoibWFydWRodS5ndW5iOjE1MTIyMTIyNzYsIm9yam5hbWUiOiJtYXJ1ZGh1Lmd1iOjE1MTIyMTIyNzYiOjE1MTIyMTIyNzYsIm9yafQ._BuiOjE1MTIyMTIyNzYsIm9yadJ__2iOjE1MTIyMTIyNzYsIm9yaRTmNcW0\' -H \'content-type: application/json; charset=UTF-8\' -H \'accept: */*\' -H \'referer: https://exampleserver.com/timeSheetChange\' -H \'authority: exampleserver.com\' -H \'user-agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36\' --data-binary \'{"action":"Add custom time","data":"November 27, 2017 - December 03, 2017"}\' --compressed'
]

curls.forEach(e => {
    // commandLineArgs()
    let nrf = FlowBuilder.toFlow(e)
    console.log(JSON.stringify(nrf))

    // let pcc = parseCurlCommand(e);
    // console.log(pcc);

    // let c0b = parse_curl(e)
    // console.log(c0b);

    // let cp0 = new CURLParser(e);
    // let C0Parsed = cp0.parse();
    // console.log(C0Parsed);
})


