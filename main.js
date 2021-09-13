import { Telegraf } from 'telegraf';
import fs from 'fs'
const token = JSON.parse(fs.readFileSync("configs/bot_token.json")).token
const bot = new Telegraf(token);
import { Keyboard } from 'telegram-keyboard';


// fs.writeFileSync(filename, data)

let current_word = {}

let word_type = ""
let learn_new_words = (ctx) => {
	let data = JSON.parse(fs.readFileSync("data/data.json"))
	let user = { "learned": [], "need_to_repeat": [], "new": data.all.sort(() => Math.random() - 0.5) }
	if (!fs.existsSync("user.json")) {
		fs.writeFileSync("user.json", JSON.stringify(user))
	} else {
		user = JSON.parse(fs.readFileSync("user.json"))
	}
	let word = user.new.pop()
	fs.writeFileSync("user.json", JSON.stringify(user))
	current_word = data[word]
	word_type = "new"
	ctx.reply(word)
}

let statistics = (ctx) => {

}


let check = async (ctx) => {
	console.log(current_word)
	let answ = ctx.message.text
	let correct = 0
	for (let i = 0; i < current_word.length; i++) {
		let line = current_word[i]
		if (line.includes(answ.toLocaleLowerCase())) {
			correct = 1
			learn_new_words(ctx)
		}
	}

	if (word_type == "new" && !correct) {
		let answ = ""
		for (let line = 0; line < current_word.length; line++) {
			answ+= current_word[line].join(', ')
			answ+='\n\n'
		}
		await ctx.reply(answ)
		learn_new_words(ctx)
	}
	
}

let repeat_words = (ctx) => {

}

bot.start((ctx) => {
	ctx.reply("Воспульзуйтесь клавиатурой чтобы начать учить слова", Keyboard.make([['Учить новые слова', 'Повторить слова'], ['Статистика']]).reply())
})
bot.on('text', async (ctx) => {

	switch (ctx.message.text) {
		case 'Учить новые слова':
			learn_new_words(ctx)
			break;
		case 'Повторить слова':
			repeat_words(ctx)
			break;
		case 'Статистика':
			statistics(ctx)
			break;
		default:
			check(ctx);
			break;

	}
});
bot.launch()