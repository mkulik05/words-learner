import fetch from 'node-fetch';
import fs from 'fs'
import jsdom from 'jsdom';
const { JSDOM } = jsdom;

let i = 1183
let data = JSON.parse(fs.readFileSync("../data/data.json", "utf8"))
let words = data['all']
let e = []

let get_translations = async (word) => {
    try {
        let response = await fetch(`https://dictionary.cambridge.org/dictionary/english-russian/${word}`)
        let html = await response.text()
        if (response.statusCode === 404) {
            console.log(i, word)
        } else {
            const dom = new JSDOM(html);
            let translations = dom.window.document.getElementsByClassName('trans');
            let res = []
            for (let translation of translations) {
                res.push(translation.textContent)
                console.log(translation.textContent, i)
                 
            }
            if (Object.keys(data).includes(word)) {
                data[word]['translations'] = res
                fs.writeFileSync("data.json", JSON.stringify(data))
            }
            i+=1
            if (i < words.length) {
                get_translations(words[i])
            } else {
                console.log("\n\n\n", e, "\n\n")
            }   
        }
    } catch (err) {
        console.log("\n\n", word)
        e.push(word)
    }
}

get_translations(words[i])