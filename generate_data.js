import {get_translation}  from "./get_transl.js"
import {get_audio}  from "./get_audio.js"
import fs from 'fs'

let words = fs.readFileSync('data/words.txt', 'utf8').split("\n")
let data_file = "./data/data.json"
for (let line = 0; line < words.length; line++) {
  words[line] = words[line].split(" ")[0]
}
console.log("Imported words list")

let translate = async (wds) => {
    console.log("Started translation, use CTRL+C to stop it safely")
    let translated_words = []
    let existing_data = {}
    if (fs.existsSync(data_file)) {
        existing_data = JSON.parse(fs.readFileSync(data_file))
        translated_words = Object.keys(existing_data)
    } 
    let words = []
    for (let word of wds) {
        if (!translated_words.includes(word)){
            words.push(word)
        }
    }
    let i = 0
    let data = {}
    let errored = []
    process.on('SIGINT', function() {
        console.log("Caught interrupt signal, saving progress");
        fs.writeFileSync(data_file, JSON.stringify({...existing_data, ...data}) , 'utf-8');
        process.exit();
    });
    for (let word of words) {
        if (i % 10 == 0) {
            console.log(`Translated ${i} words`)
        }
        let res = await get_translation(word) 
        if(res.status == "ok") {
            data[word] = {}
            data[word].translations = res.translations
            data[word].examples = res.examples
        } else {
            errored.push([word, res.message])
        }
        i++
    }
    console.log("Writting to file")
    fs.writeFileSync(data_file, JSON.stringify({...existing_data, ...data}) , 'utf-8');
    
    console.log("Errors: ", errored)
}

let audio = async (wds) => {
    let audios = fs.readdirSync('audios');
    for (let i = 0; i < audios.length; i++) {
        audios[i] = audios[i].split(".")[0]
    }
    for (let word of wds) {
        if (!audios.includes(word)) {
            let res = await get_audio(word, "audios")
            console.log(res.status, res.message)
        }
    }
}

translate(words)
audio(words)
