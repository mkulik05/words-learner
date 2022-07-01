import { get_translation } from "./get_transl.js"
import { get_audio } from "./get_audio.js"
import fs from 'fs'
import cliProgress from 'cli-progress';
import { Console } from "console";

let words = fs.readFileSync('data/words.txt', 'utf8').split("\n")
let data_file = "./data/data.json"
for (let line = 0; line < words.length; line++) {
    words[line] = words[line].split(" ")[0]
}

let translate = async (wds) => {
    console.log("Started translation, use CTRL+C to stop it safely")
    console.log("Translated: ")
    const translated_progress_bar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
    translated_progress_bar.start(wds.length, 0);
    let translated_words = []
    let existing_data = {}
    if (fs.existsSync(data_file)) {
        existing_data = JSON.parse(fs.readFileSync(data_file))
        translated_words = Object.keys(existing_data)
    }

    let data = {}
    let errored = []
    process.on('SIGINT', function () {
        console.log("Caught interrupt signal, saving progress");
        fs.writeFileSync(data_file, JSON.stringify({ ...existing_data, ...data }), 'utf-8');
        process.exit();
    });

    for (let i = 0; i < wds.length; i++) {
        let word = wds[i]
        translated_progress_bar.update(i)
        if (!translated_words.includes(word)) {
            let res = await get_translation(word)
            if (res.status == "ok") {
                data[word] = {}
                data[word].translations = res.translations
                data[word].examples = res.examples
            } else {
                errored.push([word, res.message])
            }
        }
        i++
    }
    translated_progress_bar.stop()
    console.log("Writting to file")
    fs.writeFileSync(data_file, JSON.stringify({ ...existing_data, ...data }), 'utf-8');

    console.log("Errors: ", errored)
}

let audio = async (wds) => {
    console.log("\n\nDownloaded audios")
    const audio_progress_bar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
    let audios = fs.readdirSync('audios');
    for (let i = 0; i < audios.length; i++) {
        audios[i] = audios[i].split(".")[0]
    }
    audio_progress_bar.start(wds.length, 0);
    for (let i = 0; i < wds.length; i++) {
        audio_progress_bar.update(i);
        let word = wds[i]
        if (!audios.includes(word)) {
            let res = await get_audio(word, "audios")
            // console.log(res.status, res.message)
        }
    }
    audio_progress_bar.stop()
}

translate(words).then(() => audio(words))
