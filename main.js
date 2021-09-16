import { Telegraf, Markup } from 'telegraf';
import fs from 'fs'
const token = JSON.parse(fs.readFileSync("configs/bot_token.json")).token
const bot = new Telegraf(token);
import { Keyboard } from 'telegram-keyboard';


// fs.writeFileSync(filename, data)

const keyboard_discovering = Markup.inlineKeyboard([[
	Markup.button.callback('Знаю', 'add_to_learned0'),
	Markup.button.callback('Не знаю', 'add_to_need_to_learn'),
],

[
	Markup.button.callback('Озвучить', 'hear_word')
]


])
const keyboard_learning_en_ru = Markup.inlineKeyboard([[
 Markup.button.callback('Не знаю', 'get_translation'),
],
[
	Markup.button.callback('Озвучить', 'hear_word')
]
])
const keyboard_learning_ru_en = Markup.inlineKeyboard([[
 Markup.button.callback('Не знаю', 'get_translation'),
]
])

const keyboard_statistics = Markup.inlineKeyboard([[
	Markup.button.callback('Список изученных слов', 'learned_list'),
],

[
	Markup.button.callback('Список изучаемых слов', 'learning_list')
]


])

let current = { mode: "", question: {} }

let sort_words = (ctx) => {
	console.log("sort_words")
	current['mode'] = 'new'
	let data = JSON.parse(fs.readFileSync("data/data.json"))
	let user = { "learned": [], "need_to_learn": {"words": [], "k": {}}, "new": data.all.sort(() => Math.random() - 0.5) }
	if (!fs.existsSync(`user_configs/${ctx.chat.id}.json`)) {
		fs.writeFileSync(`user_configs/${ctx.chat.id}.json`, JSON.stringify(user))
	} else {
		user = JSON.parse(fs.readFileSync(`user_configs/${ctx.chat.id}.json`))
	}
	if (user.new.length > 0) {
		let word = user.new.pop()
		ctx.reply(word, keyboard_discovering)
	} else {
		ctx.reply('Вы ознакомились со всеми словами')
	}

}

let check = async (ctx) => {
	if (current !== { mode: "", question: {} }) {
		let answ = ctx.message.text.toLocaleLowerCase()
		let correct = 0
		let user = JSON.parse(fs.readFileSync(`user_configs/${ctx.chat.id}.json`))
		let translations = current['question']['translations']
		if (current['question']['should_translate_to'] === 'ru') {
			for (let i = 0; i < translations.length; i++) {
				let line = translations[i]
				for (let word of line) {
					if (answ === word) {
						correct = 1
						console.log("+1", current.question.word)
						user['need_to_learn']['k'][current.question.word] += 1
						fs.writeFileSync(`user_configs/${ctx.chat.id}.json`, JSON.stringify(user))
						learn_words(ctx)
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
								console.log("+1", current.question.word)
								user['need_to_learn']['k'][current.question.word] += 1
								fs.writeFileSync(`user_configs/${ctx.chat.id}.json`, JSON.stringify(user))
								learn_words(ctx)
							}
						}
					}
				}
			}
		} else {
			if (answ === translations[0][0]) {
				correct = 1
				user['need_to_learn']['k'][translations[0][0]] += 1
				console.log("+1",translations[0][0], user['need_to_learn']['k'][translations[0][0]])
				fs.writeFileSync(`user_configs/${ctx.chat.id}.json`, JSON.stringify(user))
				console.log(JSON.parse(fs.readFileSync(`user_configs/${ctx.chat.id}.json`)).need_to_learn.k[translations[0][0]])
				learn_words(ctx)
			}
		}


		if (!correct) {
			let answ = current.question.word + " - "
			for (let line = 0; line < current.question.translations.length; line++) {
				answ += current.question.translations[line].join(', ')
				answ += '\n\n'
			}
			user['need_to_learn']['k'][current.question.word] -= 1
			fs.writeFileSync(`user_configs/${ctx.chat.id}.json`, JSON.stringify(user))
			await ctx.reply(answ)
			learn_words(ctx)
		}
	}


}

let learn_words = (ctx) => {
	console.log("learn_words")
	let data = JSON.parse(fs.readFileSync("data/data.json"))
	let user = { "learned": [], "need_to_learn": {"words": [], "k": {}}, "new": data.all.sort(() => Math.random() - 0.5) }
	if (!fs.existsSync(`user_configs/${ctx.chat.id}.json`)) {
		fs.writeFileSync(`user_configs/${ctx.chat.id}.json`, JSON.stringify(user))
	} else {
		user = JSON.parse(fs.readFileSync(`user_configs/${ctx.chat.id}.json`))
	}
	let need_to_learn = user['need_to_learn']
	current['mode'] = 'repeating'
	if (need_to_learn.words.length > 0) {
		let portion = need_to_learn.words.slice(0, 10)
		if (!Object.keys(user['need_to_learn']).includes('k')) {
			user['need_to_learn']['k'] = {}
		}
		for (let i = 0; i < portion.length; i++) {
			if (!Object.keys(user['need_to_learn']['k']).includes(portion[i])) {
				user['need_to_learn']['k'][portion[i]] = 0
			}

		}
		fs.writeFileSync(`user_configs/${ctx.chat.id}.json`, JSON.stringify(user))
		let en_word = ""
		let all_k = []
		for (let word of portion) {
			let k = user['need_to_learn']['k'][word]
			all_k.push([word, k])
		}
		all_k.sort((a, b) => {
			if (a[1] < b[1]) {

				return -1;
			}
			if (a[1] > b[1]) {
				return 1;
			}
			return 0;
		});
		console.log(all_k)
		en_word = all_k[0][0]
		let word = ""
		if (Math.random() > 0.5) {
			word = en_word
			console.log('en to ru')
			current['question'] = { translations: data[en_word], word: en_word, should_translate_to: 'ru' }
			console.log(current['question'])
			ctx.reply(word, keyboard_learning_en_ru)
		} else {
			let question = data[en_word][0][0]
			word = question
			console.log('ru to en')
			current['question'] = { translations: [[en_word]], word: question, should_translate_to: 'en' }
			console.log(current['question'])
			ctx.reply(word, keyboard_learning_ru_en)
		}
	} else {
		ctx.reply('Вы выучили все слова, которые не знали')
	}

}

let statistics = (ctx) => {
	let user = JSON.parse(fs.readFileSync(`user_configs/${ctx.chat.id}.json`))
	let learned = user['learned'].length
	let learning = user['need_to_learn']['words'].length
	ctx.reply(`You know ${learned} words\nYou are learning ${learning} words`, keyboard_statistics)
}



let actions = [sort_words, learn_words]
for (let i of [0, 1]) {
	bot.action(`add_to_learned${i}`, (ctx) => {
		let word = ctx.update.callback_query.message.text
		let user = JSON.parse(fs.readFileSync(`user_configs/${ctx.chat.id}.json`))
		ctx.deleteMessage()
		user.learned.push(word)
		if (user.need_to_learn.words.includes(word)) {
			user.need_to_learn.words.splice(user.need_to_learn.indexOf(word), 1);
		}
		if (user.new.includes(word)) {
			user.new.pop()
		}
		fs.writeFileSync(`user_configs/${ctx.chat.id}.json`, JSON.stringify(user))
		actions[i](ctx)

	})
}

bot.action(`get_translation`, async (ctx) => {
	let current_word = current['question']['translations']
	let answ = current.question.word + " - "
	for (let line = 0; line < current_word.length; line++) {
		answ += current_word[line].join(', ')
		answ += '\n\n'
	}
	await ctx.reply(answ)
	learn_words(ctx)
})


bot.action(`hear_word`, async (ctx) => {
	let word = ctx.update.callback_query.message.text
	await ctx.replyWithVoice({
		source: fs.createReadStream(`tts/speech/${word}.wav`)
	})
})

bot.action(`learned_list`, async (ctx) => {
	let user = JSON.parse(fs.readFileSync(`user_configs/${ctx.chat.id}.json`))
	let tmp_file_name = Math.floor(Math.random() * 1000) + '.txt'
	if (user.learned.length > 0) {
		let data = user.learned.join('\n')
		fs.writeFileSync(tmp_file_name, data)
		await ctx.replyWithDocument({ 'source': fs.createReadStream(tmp_file_name) })
		fs.unlinkSync(tmp_file_name)
	} else {
		ctx.reply('Список пуст')
	}

})

bot.action(`learning_list`, async (ctx) => {
	let user = JSON.parse(fs.readFileSync(`user_configs/${ctx.chat.id}.json`))
	let tmp_file_name = Math.floor(Math.random() * 1000) + '.txt'
	if (user.need_to_learn.words.length > 0) {
		let data = user.need_to_learn.words.join('\n')
		fs.writeFileSync(tmp_file_name, data)
		await ctx.replyWithDocument({ 'source': fs.createReadStream(tmp_file_name) })
		fs.unlinkSync(tmp_file_name)
	} else {
		ctx.reply('Список пуст')
	}
})

bot.action('add_to_need_to_learn', (ctx) => {
	ctx.deleteMessage()
	let word = ctx.update.callback_query.message.text
	let user = JSON.parse(fs.readFileSync(`user_configs/${ctx.chat.id}.json`))
	console.log(user)
	user.need_to_learn.words.push(word)
	if (user.new.includes(word)) {
		user.new.pop()
	}
	fs.writeFileSync(`user_configs/${ctx.chat.id}.json`, JSON.stringify(user))
	sort_words(ctx)

})




bot.start((ctx) => {
	ctx.reply("Воспульзуйтесь клавиатурой чтобы начать учить слова", Keyboard.make([['Сортировать слова', 'Учить слова'], ['Статистика']]).reply())
})
bot.on('text', async (ctx) => {
	switch (ctx.message.text) {
		case 'Главная':
			ctx.reply("Главная", Keyboard.make([['Сортировать слова', 'Учить слова'], ['Статистика']]).reply())
			break
		case 'Сортировать слова':
			sort_words(ctx)
			break;
		case 'Учить слова':
			await ctx.reply('Успехов!!!', Keyboard.make([['Я выучил эту группу', 'Повторение слов'], ['Главная', 'Перемешать слова']]).reply())
			learn_words(ctx)
			break;
		case 'Статистика':
			statistics(ctx)
			break;
		default:
			console.log(current.mode, '---')
			if (current['mode'] === 'repeating') {
				check(ctx);
				break;
			}


	}
});

bot.launch()