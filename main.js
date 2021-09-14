import { Telegraf, Markup } from 'telegraf';
import fs from 'fs'
const token = JSON.parse(fs.readFileSync("configs/bot_token.json")).token
const bot = new Telegraf(token);
import { Keyboard } from 'telegram-keyboard';


// fs.writeFileSync(filename, data)

const keyboard1 = Markup.inlineKeyboard([[
		Markup.button.callback('Знаю', 'add_to_learned0'),
		Markup.button.callback('Не знаю', 'add_to_need_to_repeat'),
	],

	[
		Markup.button.callback('Озвучить', 'hear_word0')
	]


])



const keyboard2 = Markup.inlineKeyboard([[
	Markup.button.callback('Я запомнил', 'add_to_learned1'),
],

[
	Markup.button.callback('Озвучить', 'hear_word1')
]


])

let current_word = {}
let mode = ""
let word_type = ""

let learn_new_words = (ctx) => {
	mode = 'new'
	let data = JSON.parse(fs.readFileSync("data/data.json"))
	let user = { "learned": [], "need_to_repeat": [], "new": data.all.sort(() => Math.random() - 0.5) }
	if (!fs.existsSync("user.json")) {
		fs.writeFileSync("user.json", JSON.stringify(user))
	} else {
		user = JSON.parse(fs.readFileSync("user.json"))
	}
	let word = user.new.pop()
	fs.writeFileSync("user.json", JSON.stringify(user))
	word_type = "new"
	ctx.reply(word, keyboard1)
}

let check = async (ctx) => {
	console.log(current_word)
	let answ = ctx.message.text
	let correct = 0
	for (let i = 0; i < current_word.length; i++) {
		let line = current_word[i]
		if (line.includes(answ.toLocaleLowerCase())) {
			correct = 1
			repeat_words(ctx)
		}
	}

	if (!correct) {
		let answ = ""
		for (let line = 0; line < current_word.length; line++) {
			answ += current_word[line].join(', ')
			answ += '\n\n'
		}
		await ctx.reply(answ)
		repeat_words(ctx)
	}

}

let repeat_words = (ctx) => {
	let data = JSON.parse(fs.readFileSync("data/data.json"))
	let user = JSON.parse(fs.readFileSync("user.json"))
	let need_to_repeat = user['need_to_repeat']
	mode = 'repeating'
	let word = need_to_repeat[Math.floor(Math.random()*need_to_repeat.length)]
	current_word = data[word]
	ctx.reply(word, keyboard2)
}

let statistics = (ctx) => {

}

let actions = [learn_new_words, repeat_words]
for (let i of [0, 1]) {
	bot.action(`add_to_learned${i}`, (ctx) => {
		let word = ctx.update.callback_query.message.text
		let user = JSON.parse(fs.readFileSync("user.json"))
		ctx.deleteMessage()
		user.learned.push(word)
		if (user.need_to_repeat.includes(word)) {
			user.need_to_repeat.splice(user.need_to_repeat.indexOf(word), 1);
	}
		fs.writeFileSync("user.json", JSON.stringify(user))
		actions[i](ctx)
	
	})

	bot.action(`hear_word${i}`, async(ctx) => {
		let word = ctx.update.callback_query.message.text
		await ctx.replyWithVoice({
			source: fs.createReadStream(`tts/speech/${word}.wav`)
		})
		actions[i](ctx)
	
	})
}


bot.action('add_to_need_to_repeat', (ctx) => {
	ctx.deleteMessage()
	let word = ctx.update.callback_query.message.text
	let user = JSON.parse(fs.readFileSync("user.json"))
	user.need_to_repeat.push(word)
	fs.writeFileSync("user.json", JSON.stringify(user))
	learn_new_words(ctx)

})




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
			if(mode === 'repeating'){
				check(ctx);
				break;
			}


	}
});
bot.launch()