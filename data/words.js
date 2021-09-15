import fs from 'fs'
import fetch from 'node-fetch'
let res = fs.readFileSync('words.txt', 'utf8').split("\n")
let predata = {}
let b = 0

let get_data = async (data, i) => {
  if (i < data.length) {
    console.log(i)
    let d = data[i].split(" ")

    let request_word = d[0]
    try {
      let result = await fetch("https://translate.google.by/_/TranslateWebserverUi/data/batchexecute?rpcids=MkEWBc&f.sid=-7037657782215732512&bl=boq_translate-webserver_20210908.10_p0&hl=ru&soc-app=1&soc-platform=1&soc-device=1&_reqid=1348120&rt=c", {
        "headers": {
          "accept": "*/*",
          "accept-language": "en-US,en;q=0.9,ru;q=0.8,ceb;q=0.7",
          "content-type": "application/x-www-form-urlencoded;charset=UTF-8",
          "sec-ch-ua": "\"Chromium\";v=\"94\", \"Google Chrome\";v=\"94\", \";Not A Brand\";v=\"99\"",
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": "\"Linux\"",
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "same-origin",
          "x-client-data": "CJC2yQEIprbJAQiqncoBCJPRygEIsenKAQjYnMsBCNzvywEI7vDLAQii8csBCObyywEI7/LLAQiZ88sBCIr0ywEIn/nLAQi6+csBCIr6ywEIt/vLAQjS/MsBCNP9ywEIvP7LAQiy/8sBCMH/ywEIzv/LAQjk/8sBCOn/ywEYrKnKARiKnssBGIP6ywEYgv3LAQ==",
          "x-goog-batchexecute-bgr": "[\";g524ndDQAAYTxGKAE8RfMpiwRJGeGWwmACkAIwj8RmWAaIhlLUOPM8lnupRS-CINaYxidu-LC_DNXkwjokm-jtiGER8AAACqTwAAAA51AQcXAQPLUcaFqZoGKYi0ZWKpywohdbgZXPwgiy3ajXKg2tJ59kc8Om8e6ZllZVs8NGt7Ye3F3OujXXH79-xfQI-CoDeRlcGuZt9x9kZkiapVwSkd1hxKIKeYhXnN7kDk7mDjIRyqKGAZvFQcophr6_X5R-9YExtF1fqvydCbw-f2eLT2Oul1BC3GSCxnJfb6J2raMq9wcwCGFiUXyxr0PWS4XrZpQebUvigBaZEbeozmmOEzLtoHGY5G5Ej2sNGnWpDEngKJjnR5zYpACDxqoasgAzD8_SKO5WaUsM-YmSH6jEZvLn-bs_ypaTZAUUwHjEkgcmeJ69hStqrOcKwGCruuAKgDvqqEhAImtST5ATw5MMQlzU3XwCJJVUCel-eXi5WoNDbfmNcyhS_wmsGtHoAnfWQF9qIDU0Ju5JriA61okC4Fq_XZSGWBnARSFIffgD448sA5Ye3RhU6n2GutV7yH7cRs3kMrqvY9Hyng06UM95roAX8ypcoEqxLYM3eiKTswPKIQKM3SWM3JoWPj6MHzDEaxcPRsR3ppZGxYtEHKcNA7kmYLCW4n7bYzs-kuRK5kx_rnoApcHqJ83z6r52WUwfFZmC21xZRRQoT-WNZ33ty1w6-m24aA8FKogSzZ4CJwGt8C7M-wY7fFH8JdLU6df73GrkwnhSIKoxu6oi2gHa11P-xAN90QecX77tXnnMRfZSOICOctLKEZ_1A8KmsHJjI2QDlb-2ncbzDYW9TB_2LJY7WEcX3FoJqRr6N6aI-530fncpcsO2hMJhB6rtCK4LVKB4MHVd7nnBkAhc3o_nRWdypbCY7XZWFb3bK-mz5cGglR1mNXcg29Y08EnU342y7Uc7BR2we3mI23MF3st6uMbTANJGxh7OyJn8EOfQwtFwu0KOoxidCGV4jiHixhXoApzBUBsHrmx2yj5yS8qM8y9kuHPsmLw_ZAeYgQysmHhkBy4ic9pbJWatSyB_n6GeGGUOmngTE1nVjqfjSASngkldc14--apMzKUWCByDG6I9vUs71vvVQyvYXEzW_ovsvkn1dt5WQdkuQ1mMTW73Ib6k8A50qWPaA8T6f6ug\",null,null,15,null,null,null,0,\"2\"]",
          "x-same-domain": "1",
          "cookie": "SID=BghT1avvuTy6YEMJmNGo2nTCIHJ2QxzshRzXsIh3luMQtc42RoOWRRfBxsb-BPMX8gVAWA.; __Secure-1PSID=BghT1avvuTy6YEMJmNGo2nTCIHJ2QxzshRzXsIh3luMQtc42R_b-f6KBN7QnLCcI3y2y8g.; __Secure-3PSID=BghT1avvuTy6YEMJmNGo2nTCIHJ2QxzshRzXsIh3luMQtc42MqBNdoYJcNV0__8snGDhWQ.; HSID=AmynK42RhFwu7MBlz; SSID=AqWJw6DxehOOJ5J_q; APISID=e--5ZwSvdUB6Kc_q/A8Ji8_q5axAVOvuy-; SAPISID=wEw0gLpykb7fpg-w/AEgLkjMM3b48GopU-; __Secure-1PAPISID=wEw0gLpykb7fpg-w/AEgLkjMM3b48GopU-; __Secure-3PAPISID=wEw0gLpykb7fpg-w/AEgLkjMM3b48GopU-; _ga=GA1.3.1543728939.1631351255; _gid=GA1.3.585684745.1631351255; OTZ=6150788_44_48_123840_44_436320; NID=223=XA0ZopiKlMbm7wtm3qt1RRsx7lAOzPxurjNARn42KM2pqERSEAQQxVWfP6VLjtBTvP_nKt6vORfRpeuxAJ_m5WN6FBqFaAGPz0ajFEK6t8s8lZQiblE1wmXp9Gggp5X04JgHbI7QPz2qt6KpqBckdRbt679lIK7bQvESpVv36F7YjIz38J9UI6y8bd9wS_xU2nJtIKhT-ynJfA-hhyElm-f3HlrmY_1BO3Bz2hj4C751ArEoOJnsNHN8klTGLf-GdbbqV-y7KRFSBTtfOmYgdsP312Uf"
        },
        "referrer": "https://translate.google.by/",
        "referrerPolicy": "origin",
        "body": `f.req=%5B%5B%5B%22MkEWBc%22%2C%22%5B%5B%5C%22${request_word}%5C%22%2C%5C%22en%5C%22%2C%5C%22ru%5C%22%2Ctrue%5D%2C%5Bnull%5D%5D%22%2Cnull%2C%22generic%22%5D%5D%5D&at=AD08yZleb_V8908JG_OZCgN5nQdn%3A1631355778815&`,
        "method": "POST",
        "mode": "cors"
      });
      result = await result.text()
      result = JSON.parse(result.split("\n")[3])[0]
      predata[request_word] = result
      fs.writeFileSync('predata.json', JSON.stringify(predata))
    } catch (e) {
      console.log(e)
      get_data(data, i)
    }
    setTimeout(() => {
      get_data(data, i + 1)
    }, 100)
  }
}

// get_data(res, 0)

let data = JSON.parse(fs.readFileSync("predata.json"))
let words = Object.keys(data)
let errored = []
let ready_data = {}


let parse = (word, data) => {
  console.log("\n\n")
  let all_translations = []
  try {
    let d = JSON.parse(data[2])
    let next_i = 0
    for (let i = 0; i < d.length; i++) {
      let str = `${d[i]}`
      for (let j = 0; j < str.length; j++) {
        if ("абвгдеёжзийклмнопрстуфхцчшщъыьэюя".includes(str[j])) {
          next_i = i
          break
        }
      }
    }
    d = d[next_i]
    next_i = -1
    for (let i = 0; i < d.length; i++) {
      if (typeof d[i] === "object" && d[i] !== null) {
        let str = `${d[i]}`
        for (let j = 0; j < str.length; j++) {
          if ("абвгдеёжзийклмнопрстуфхцчшщъыьэюя".includes(str[j])) {
            next_i = i
          }
        }
      }
    }
    if (next_i === -1) {
      // console.error("next_i < 0", JSON.stringify(data), typeof d[0], typeof d[1])
    } else {
      d = d[next_i]

      // d = d[0]
      // d = d[0]
      if (typeof d !== "object" || d == null) {
        errored.push(word)
        console.log(d, data)
      } else {
        d = d[0]
        if (typeof d !== "object" || d == null) {
          errored.push(word)

        } else {
          // console.log(JSON.stringify(d))
          for (let g = 0; g < d.length; g++) {
            let translations = d[g]
            for (let k = 0; k < translations.length; k++) {
              let part_of_speech = translations[k]
              let gg = []
              if (typeof part_of_speech !== "string") {
                // console.log('--', part_of_speech, '--')
                for (let m = 0; m < part_of_speech.length; m++) {
                  let result = part_of_speech[m][0]
                  console.log("--", result, '--')
                  gg.push(result)
                  
                }
              }
              if (gg.length > 0) {
                all_translations.push(gg)
              }
              

            }
          }
        }
      }
    }
    ready_data[word] = all_translations
  } catch (e) {
    console.error(e, data, word)
  }
}

for (let i = 0; i < words.length; i++) {
  parse(words[i], data[words[i]])
}
ready_data['all'] = words
fs.writeFileSync('data.json', JSON.stringify(ready_data))