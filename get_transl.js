import fetch from 'node-fetch';
import fs from 'fs'
import jsdom from 'jsdom';
const { JSDOM } = jsdom;

let get_translation = async (word) => {
    try {
        let answ = {status: "", message:"", translations: [], examples: []}
        let response = await fetch(`https://dictionary.cambridge.org/dictionary/english-russian/${word}`)
        let html = await response.text()
        if (response.statusCode === 404) {
            answ.status = "err"
            answ.message = word +  " translation wasn't found"
        } else {
            const dom = new JSDOM(html);
            let translations = dom.window.document.getElementsByClassName('trans');
            let res_translations = []
            for (let translation of translations) {
                res_translations.push(translation.textContent)
                // console.log(translation.textContent, i)
                 
            }
            answ.status = "ok"
            answ.translations = res_translations

            let examples = dom.window.document.getElementsByClassName('eg deg');
            let res_examples = []
            for (let example of examples) {
                res_examples.push(example.textContent)
                // console.log(example.textContent, i)
            }
            answ.examples = res_examples
            return answ
        }
    } catch (err) {
        return {status: "error", message:err}
    }
}


export {get_translation}