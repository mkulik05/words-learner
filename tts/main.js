import fetch from 'node-fetch';
import fs from 'fs'
import jsdom from 'jsdom';
const { JSDOM } = jsdom;

let i = 1939
let data = JSON.parse(fs.readFileSync("../data/data.json", "utf8"))
let words = data['all']
console.log(words.length)
let e = []

let get_audio_url = async (word) => {
    let response = await fetch(`https://dictionary.cambridge.org/dictionary/english/${word}`)
    let html = await response.text()
    const dom = new JSDOM(html);
    let urls = dom.window.document.getElementsByTagName('source');
    return urls[0]?.src
}

let get_audio = async (word) => {
    try {
        let url = await get_audio_url(word);
        console.log(url)
        if (url !== undefined) {
            let res = await fetch(`https://dictionary.cambridge.org${url}`, {
                "headers": {
                    "accept": "*/*",
                    "accept-language": "en-US,en;q=0.9,ru;q=0.8,ceb;q=0.7",
                    "range": "bytes=0-",
                    "sec-ch-ua": "\"Google Chrome\";v=\"95\", \"Chromium\";v=\"95\", \";Not A Brand\";v=\"99\"",
                    "sec-ch-ua-mobile": "?0",
                    "sec-ch-ua-platform": "\"Linux\"",
                    "sec-fetch-dest": "audio",
                    "sec-fetch-mode": "no-cors",
                    "sec-fetch-site": "same-origin",
                    "cookie": "amp-access=amp-5VxHgLX1dNoyZdsIXgc7eg; preferredDictionaries=\"english-russian,english,british-grammar,english-polish\"; _pbjs_userid_consent_data=3524755945110770; _sharedID=2a97fa38-7488-4976-b9cc-0c9956111f7e; _lr_env_src_ats=false; gig_bootstrap_3_ilxJxYRotasZ-TPa01uiX3b8mqBqCacWOQAwcXBW0942jFIXadk2WjeDMV0-Mgxv=login_ver4; ssc=6; XSRF-TOKEN=813fd759-03bc-42c0-addb-90ff3f59ef0d; _lr_retry_request=true; loginPopup=15; OptanonConsent=isGpcEnabled=0&datestamp=Tue+Oct+05+2021+16%3A52%3A09+GMT%2B0300+(Moscow+Standard+Time)&version=6.23.0&isIABGlobal=false&hosts=&landingPath=NotLandingPage&groups=C0001%3A1%2CC0002%3A1%2CC0003%3A1%2CC0004%3A1&AwaitingReconsent=false&geolocation=BY%3BHM; OptanonAlertBoxClosed=2021-10-05T13:52:09.899Z",
                    "Referer": "https://dictionary.cambridge.org/dictionary/english-russian/relief",
                    "Referrer-Policy": "strict-origin-when-cross-origin"
                },
                "body": null,
                "method": "GET"
            });
            if (res.status !== 404) {
                i+=1
                console.log(word, "- ", "OK", i)
                let stream = fs.createWriteStream(`speech/${word}.mp3`)
                await res.body.pipe(stream);
                get_audio(words[i])
            } else {
                e.push(word)
                console.log(`${word} - ERROR ERROR`, e)
            }
        }
    } catch (e) {
        get_audio(word)
    }
}

get_audio(words[i])
