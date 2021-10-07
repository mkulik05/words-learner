import fetch from 'node-fetch';
import fs from 'fs'
import jsdom from 'jsdom';
const { JSDOM } = jsdom;

let i = 744
let data = JSON.parse(fs.readFileSync("../data/data.json", "utf8"))
let words = data['all']
let e = []

let get_examples = async (word) => {
    try {
        let response = await fetch(`https://dictionary.cambridge.org/dictionary/english/${word}`)
        let html = await response.text()
        const dom = new JSDOM(html);
        let examples = dom.window.document.getElementsByClassName('eg deg');
        let res = []
        for (let example of examples) {
            res.push(example.textContent)
            console.log(example.textContent, i)
             
        }
        if (Object.keys(data).includes(word)) {
            data[word]['examples'] = res
            fs.writeFileSync("data.json", JSON.stringify(data))
        }
        i+=1
        if (i < words.length) {
            get_examples(words[i])
        } else {
            console.log("\n\n\n", e, "\n\n")
        }
    } catch (err) {
        console.log("\n\n", word)
        e.push(word)
    }
}

get_examples(words[i])