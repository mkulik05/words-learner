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
		Markup.button.callback('Озвучить', 'hear_word')
	]


])
const keyboard2 = Markup.inlineKeyboard([[
	Markup.button.callback('Я запомнил', 'add_to_learned1'),
],

[
	Markup.button.callback('Озвучить', 'hear_word')
]


])

const keyboard3 = Markup.inlineKeyboard([[
	Markup.button.callback('Список изученных слов', 'learned_list'),
],

[
	Markup.button.callback('Список изучаемых слов', 'learning_list')
]


])

let current_word = {}
let mode = ""

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
	ctx.reply(word, keyboard1)
}

let check = async (ctx) => {
	console.log(current_word)
	let answ = ctx.message.text.toLocaleLowerCase()
	let correct = 0
	for (let i = 0; i < current_word.length; i++) {
		let line = current_word[i]
		for (let word of line) {
			if (answ === word) {
				correct = 1
				repeat_words(ctx)
			} else {
				if (answ.length === word.length) {
					let incorrect = 0
					for (let j = 0; j < word.length; j++) {
						if (answ[j] !== word[j] && !(['е', 'ё'].includes(answ[j]) && ['е', 'ё'].includes(word[j]))) {
							incorrect = 1
							break
						}
					}
					if (!incorrect) {
						correct = 1
						repeat_words(ctx)
					}
				}
			}
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
	let user = JSON.parse(fs.readFileSync("user.json"))
	let learned = user['learned'].length
	let learning = user['need_to_repeat'].length
	ctx.reply(`You know ${learned} words\nYou are learning ${learning} words`, keyboard3)
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
}

bot.action(`hear_word`, async (ctx) => {
	let word = ctx.update.callback_query.message.text
	await ctx.replyWithVoice({
		source: fs.createReadStream(`tts/speech/${word}.wav`)
	})
})

bot.action(`learned_list`, async (ctx) => {
	let user = JSON.parse(fs.readFileSync("user.json"))
	let tmp_file_name = Math.floor(Math.random() * 1000) + '.txt'
	let data = user.learned.join('\n')
	fs.writeFileSync(tmp_file_name, data)
	await ctx.replyWithDocument({'source': fs.createReadStream(tmp_file_name)})
	fs.unlinkSync(tmp_file_name)
})

bot.action(`learning_list`, async (ctx) => {
	let user = JSON.parse(fs.readFileSync("user.json"))
	let tmp_file_name = Math.floor(Math.random() * 1000) + '.txt'
	let data = user.need_to_repeat.join('\n')
	fs.writeFileSync(tmp_file_name, data)
	await ctx.replyWithDocument({'source': fs.createReadStream(tmp_file_name)})
	fs.unlinkSync(tmp_file_name)
})

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