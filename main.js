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
const keyboard_learning_en_ru = Markup.inlineKeyboard([
	[

		Markup.button.callback('-3', 'change_rating-3'),
		Markup.button.callback('-2', 'change_rating-2'),
		Markup.button.callback('+2', 'change_rating2'),
		Markup.button.callback('+3', 'change_rating3'),

	],
	[
		Markup.button.callback('Примеры', 'get_example'),
		Markup.button.callback('Не знаю', 'get_translation'),
	],
	[
		Markup.button.callback('Озвучить', 'hear_word')
	]
])
const keyboard_learning_ru_en = Markup.inlineKeyboard([
	[
		Markup.button.callback('-3', 'change_rating-3'),
		Markup.button.callback('-2', 'change_rating-2'),
		Markup.button.callback('+2', 'change_rating2'),
		Markup.button.callback('+3', 'change_rating3'),
	],
	[
		Markup.button.callback('Примеры', 'get_example'),
		Markup.button.callback('Не знаю', 'get_translation')
	],

])

const keyboard_statistics = Markup.inlineKeyboard([[
	Markup.button.callback('Список изученных слов', 'learned_list'),
],
[
	Markup.button.callback('Список изучаемых слов', 'learning_list')
]
])

let question_history = [{ question: {} }]
let mode = ""
let sort_words = (ctx) => {
	mode = 'new'
	let data = JSON.parse(fs.readFileSync("data/data.json"))
	let user = { "learned": [], "spelling": {}, "need_to_learn": { "words": [], "k": {}, "current_group": 1, 'ru_to_en': {} }, "new": data.all.sort(() => Math.random() - 0.5) }
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
	console.log("\n\n", mode)
	if (question_history[question_history.length - 1] !== { question: {} }) {
		let answ = ctx.message.text.toLocaleLowerCase()
		let correct = 0
		let user = JSON.parse(fs.readFileSync(`user_configs/${ctx.chat.id}.json`))
		let translations = question_history[question_history.length - 1]['question']['translations']
		if (translations === undefined || question_history[question_history.length - 1].question.word === undefined) {
			ctx.reply("Перевод этого слова отсутствует")
			correct = 1
		} else {
			if (question_history[question_history.length - 1]['question']['should_translate_to'] === 'ru') {
				for (let i = 0; i < translations.length; i++) {
					let translation = translations[i]
					while (answ.includes("ё")) {
						answ[answ.indexOf("ё")] = "е"
					}
					while (translation.includes("ё")) {
						translation[translation.indexOf("ё")] = "е"
					}
					console.log(answ, translation, )
						if (answ === translation || translation.split(" ").includes(answ) || translation.split(", ").includes(answ)) {
							correct = 1
						}
				
				}
			} else {
				console.log(translations[0], translations)
				if (answ === translations[0][0]) {
					correct = 1
				}

			}
		}

		if (!correct) {
			if (mode === "learning") {
				let answ = question_history[question_history.length - 1].question.word + " - " + question_history[question_history.length - 1].question.translations.join('; ')
				if (question_history[question_history.length - 1]['question']['should_translate_to'] === 'ru') {
					user['need_to_learn']['k'][question_history[question_history.length - 1].question.word] -= 1
				} else {
					user['need_to_learn']['k'][question_history[question_history.length - 1].question.translations[0]] -= 1
				}

				fs.writeFileSync(`user_configs/${ctx.chat.id}.json`, JSON.stringify(user))
				await ctx.reply(answ)
				learn_words(ctx)
			}
			if (mode === "spelling") {
				let err = question_history[question_history.length - 1].question
				err['your_answ'] = ctx.message.text.toLocaleLowerCase()
				console.log(err)
				user.spelling.errors.push(err)
				user.spelling.i += 1
				fs.writeFileSync(`user_configs/${ctx.chat.id}.json`, JSON.stringify(user))
				spelling(ctx)
			}
		} else {
			if (mode === "learning") {
				console.log("+1", question_history[question_history.length - 1].question.word)
				if (question_history[question_history.length - 1]['question']['should_translate_to'] === 'ru') {
					user['need_to_learn']['k'][question_history[question_history.length - 1].question.word] += 1
				} else {
					user['need_to_learn']['k'][translations[0]] += 1
				}
				user['need_to_learn']['k'][question_history[question_history.length - 1].question.word] += 1
				fs.writeFileSync(`user_configs/${ctx.chat.id}.json`, JSON.stringify(user))
				learn_words(ctx)
			}

			if (mode === "spelling") {
				user.spelling.i += 1
				fs.writeFileSync(`user_configs/${ctx.chat.id}.json`, JSON.stringify(user))
				console.log("\n\n\n1 --- yes")
				spelling(ctx)
			}
		}
	}
}

let learn_words = (ctx) => {
	console.log("learn_words")
	let data = JSON.parse(fs.readFileSync("data/data.json"))
	let user = { "learned": [], "spelling": {}, "need_to_learn": { "words": [], "k": {}, "current_group": 1, 'ru_to_en': {} }, "new": data.all.sort(() => Math.random() - 0.5) }
	if (!fs.existsSync(`user_configs/${ctx.chat.id}.json`)) {
		fs.writeFileSync(`user_configs/${ctx.chat.id}.json`, JSON.stringify(user))
	} else {
		user = JSON.parse(fs.readFileSync(`user_configs/${ctx.chat.id}.json`))
	}
	let need_to_learn = user['need_to_learn']
	let current_group = need_to_learn['current_group']
	question_history.push({})
	mode = 'learning'
	if (need_to_learn.words.length > 0) {
		let portion = need_to_learn.words.slice(current_group * 10 - 10, current_group * 10)
		if (!Object.keys(user['need_to_learn']).includes('k')) {
			user['need_to_learn']['k'] = {}
		}
		// console.log(portion, need_to_learn, user['need_to_learn'], [current_group * 10 - 10, current_group * 10])
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
		en_word = all_k[0][0]
		let word = ""
		console.log(data[en_word], en_word)
		if (data[en_word] !== undefined) {
			if (Math.random() > 0.5) {
				word = en_word
				console.log('en to ru')
				question_history[question_history.length - 1]['question'] = { translations: data[en_word]['translations'], word: en_word, should_translate_to: 'ru' }
				ctx.reply(word, keyboard_learning_en_ru)
			} else {
				let question = data[en_word]['translations'][0]
				user.need_to_learn.ru_to_en[question.trim()] = en_word
				fs.writeFileSync(`user_configs/${ctx.chat.id}.json`, JSON.stringify(user))
				word = question
				console.log('ru to en')
				question_history[question_history.length - 1]['question'] = { translations: [[en_word]], word: question, should_translate_to: 'en' }
				ctx.reply(word, keyboard_learning_ru_en)
			}
		} else {
			user['need_to_learn']['k'][en_word] += 1
			fs.writeFileSync(`user_configs/${ctx.chat.id}.json`, JSON.stringify(user))
			learn_words(ctx)
		}
	} else {
		ctx.reply('Вы выучили все слова, которые не знали')
	}

}

let statistics = (ctx) => {
	if (fs.existsSync(`user_configs/${ctx.chat.id}.json`)) {
		let user = JSON.parse(fs.readFileSync(`user_configs/${ctx.chat.id}.json`))
		let learned = user['learned'].length
		let learning = user['need_to_learn']['words'].length
		ctx.reply(`You know ${learned} words\nYou are learning ${learning} words`, keyboard_statistics)
	} else {
		ctx.reply("Для начала начните сортировать слова")
	}
}



let actions = [sort_words, learn_words]
for (let i of [0, 1]) {
	bot.action(`add_to_learned${i}`, (ctx) => {
		let word = ctx.update.callback_query.message.text
		let user = JSON.parse(fs.readFileSync(`user_configs/${ctx.chat.id}.json`))
		try {
			ctx.deleteMessage()
		} catch (err) {
		}
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
	let current_word = question_history[question_history.length - 1]['question']['translations']
	let answ = question_history[question_history.length - 1].question.word + " - " + current_word.join('; ')
	await ctx.reply(answ)
	learn_words(ctx)
})

bot.action(`get_example`, async (ctx) => {
	let word = ctx.update.callback_query.message.text
	let data = JSON.parse(fs.readFileSync("data/data.json"))
	let user = JSON.parse(fs.readFileSync(`user_configs/${ctx.chat.id}.json`))
	if (typeof user.need_to_learn.ru_to_en == "object" && Object.keys(user.need_to_learn.ru_to_en).includes(word)) {
		word = user.need_to_learn.ru_to_en[word]
	}
	if (Object.keys(data).includes(word) && Object.keys(data[word]).includes('examples')) {
		let examples = data[word]['examples']
		let answ = ""
		for (let example of examples) {
			answ += example
			answ += '\n\n'
		}
		await ctx.reply(answ)
	} else {
		await ctx.reply("Примеров нет")
	}
})

let rating_changes = [-3, -2, 2, 3]
for (let rating of rating_changes) {
	bot.action(`change_rating${rating}`, async (ctx) => {
		let user = JSON.parse(fs.readFileSync(`user_configs/${ctx.chat.id}.json`))
		let question = ctx.update.callback_query.message.text.toLowerCase()
		let translate_to = 'en'
		let eng = "abcdefghijklmnopqrstuvwxyz"
		if (eng.includes(question[0])) {
			translate_to = 'ru'
		}
		if (translate_to === 'en') {
			let word = user.need_to_learn.ru_to_en[question]
			user['need_to_learn']['k'][word] += rating
		} else {
			user['need_to_learn']['k'][question] += rating
		}
		fs.writeFileSync(`user_configs/${ctx.chat.id}.json`, JSON.stringify(user))
		console.log(user['need_to_learn']['k'])
		ctx.reply('Рейтинг изменён, но бот всё ещё ждёт Вашего ответа')
	})
}


let init_spelling = async (ctx, borders, from) => {
	let user = JSON.parse(fs.readFileSync(`user_configs/${ctx.chat.id}.json`))
	await ctx.reply(`Диктант начался, группа ${borders[0]} - ${borders[1]}`, Keyboard.make(['|Выйти|']).reply())
	let words = user.need_to_learn.words.slice(borders[0] * 10 - 10, borders[1] * 10)
	user.spelling.len = words.length
	user.spelling.errors = []
	user.spelling.from = from
	user.spelling.i = 0
	user.spelling.groups = {}
	for (let word of words) {
		user.spelling.groups[word] = Math.floor((words.indexOf(word) + borders[0] * 10 - 10) / 10) + 1
	}
	user.spelling.words = words.sort(() => Math.random() - 0.5)
	fs.writeFileSync(`user_configs/${ctx.chat.id}.json`, JSON.stringify(user))
	spelling(ctx)
}

// { translations: [[en_word]], word: question, should_translate_to: 'en' }
// let err = question_history[question_history.length - 1].question
// err['your_answ'] = ctx.message.text.toLocaleLowerCase()

let spelling_result = (ctx) => {
	let user = JSON.parse(fs.readFileSync(`user_configs/${ctx.chat.id}.json`))
	let errors = user.spelling.errors
	if (errors.length !== 0) {
		let res = "Повторите эти слова:\n\n"
		for (let error of errors) {
			console.log(user.spelling.groups)
			let group_n = 0
			if (question_history[question_history.length - 1]['question']['should_translate_to'] === 'ru') {
				group_n = user.spelling.groups[error.word]
			} else {
				group_n = user.spelling.groups[error.translations[0]]
			}
			res += error.word + `(${group_n}) - `
			let translations = error.translations
			res += translations.join('; ')
			res += ` (ваш ответ - ${error.your_answ})\n`
		}
		mode = "learning"
		ctx.reply(res, Keyboard.make([['←', '|Перейти к группе|', '→'], ['|Диктант|', '|Повторение|'], ['|Главная|', '|Перемешать слова|']]).reply())
	} else {
		ctx.reply("Вы ответили правильно на все вопросы", Keyboard.make([['←', '|Перейти к группе|', '→'], ['|Диктант|', '|Повторение|'], ['|Главная|', '|Перемешать слова|']]).reply())
	}
	learn_words(ctx)
	
}

let spelling = async (ctx) => {
	let user = JSON.parse(fs.readFileSync(`user_configs/${ctx.chat.id}.json`))
	let data = JSON.parse(fs.readFileSync("data/data.json"))
	let words = user.spelling.words
	if (user.spelling.i < words.length) {
		let word = words[user.spelling.i]
		console.log(user.spelling)
		fs.writeFileSync(`user_configs/${ctx.chat.id}.json`, JSON.stringify(user))
		question_history.push({})
		if (user.spelling.from === 'ru') {
			if (data[word] !== undefined && (typeof data[word] === 'object' && data[word]['translations'].length > 0 && data[word]['translations'][0].length)) {
				question_history[question_history.length - 1]['question'] = { translations: [[word]], word: data[word]['translations'][0], should_translate_to: 'en' }
				ctx.reply(data[word]['translations'][0])
			} else {
				await ctx.reply("Перевод слова отсутствует")
				user.spelling.i += 1
				fs.writeFileSync(`user_configs/${ctx.chat.id}.json`, JSON.stringify(user))
				spelling(ctx)
			}
		} else {
			question_history[question_history.length - 1]['question'] = { translations: data[word]['translations'], word: word, should_translate_to: 'ru' }
			ctx.reply(word)
		}
	} else {
		spelling_result(ctx)
	}
}

bot.action(`hear_word`, async (ctx) => {
	let word = ctx.update.callback_query.message.text
	if (fs.existsSync(`tts/speech/${word}.mp3`)) {
		await ctx.replyWithVoice({
			source: fs.createReadStream(`tts/speech/${word}.mp3`)
		})
	} else {
		await ctx.reply("Запись отсутствует")
	}
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
	try {
		ctx.deleteMessage()
	} catch (err) {
	}
	let word = ctx.update.callback_query.message.text
	let user = JSON.parse(fs.readFileSync(`user_configs/${ctx.chat.id}.json`))
	user.need_to_learn.words.push(word)
	if (user.new.includes(word)) {
		user.new.pop()
	}
	fs.writeFileSync(`user_configs/${ctx.chat.id}.json`, JSON.stringify(user))
	sort_words(ctx)

})


let select_group = async (ctx, group) => {
	let user = JSON.parse(fs.readFileSync(`user_configs/${ctx.chat.id}.json`))
	await ctx.reply(`${user.need_to_learn.current_group} → ${group}`)
	user.need_to_learn.current_group = group
	fs.writeFileSync(`user_configs/${ctx.chat.id}.json`, JSON.stringify(user))
	learn_words(ctx)

}

let repeat = (ctx) => {
	let user = JSON.parse(fs.readFileSync(`user_configs/${ctx.chat.id}.json`))
	let data = JSON.parse(fs.readFileSync("data/data.json"))
	let group = user.need_to_learn.current_group
	group = user.need_to_learn.words.slice(group * 10 - 10, group * 10)
	let res = ""
	for (let word of group) {
		res += word + ' - '
		console.log(word, data[word]?.translations)
		let translations = data[word]?.translations
		if (translations !== undefined) {
			for (let translation of translations) {
				res += translation
			}
		} else {
			res += "ПЕРЕВОД ОТСУТСТВУЕТ"
		}

		res += "\n"
	}
	if (res != "") {
		ctx.reply(res)
	}

}

bot.start((ctx) => {
	ctx.reply("Воспульзуйтесь клавиатурой чтобы начать учить слова", Keyboard.make([['|Сортировать слова|', '|Учить слова|'], ['|Статистика|']]).reply())
})

bot.on('text', async (ctx) => {
	let user = JSON.parse(fs.readFileSync(`user_configs/${ctx.chat.id}.json`))
	switch (ctx.message.text) {
		case '|Главная|':
			ctx.reply("Главная", Keyboard.make([['|Сортировать слова|', '|Учить слова|'], ['|Статистика|']]).reply())
			break
		case '|Сортировать слова|':
			sort_words(ctx)
			break;
		case '|Учить слова|':
			await ctx.reply('Успехов!!!', Keyboard.make([['←', '|Перейти к группе|', '→'], ['|Диктант|', '|Повторение|'], ['|Главная|', '|Перемешать слова|']]).reply())
			learn_words(ctx)
			break;
		case '|Статистика|':
			statistics(ctx)
			break;
		case '|Повторение|':
			repeat(ctx)
			break;
		case '|Диктант|':
			ctx.reply("Выберите с какого языка переводить", Keyboard.make([["|Английский|", "|Русский|"], ['|Главная|']]).reply())
			break;
		case '|Английский|':
			if (user.need_to_learn.words.length > 0) {
				mode = "select_groups_for_spelling_en"
				ctx.reply("Выберите группы в формате '1-5'")
			}
			break;
		case '|Русский|':
			if (user.need_to_learn.words.length > 0) {
				mode = "select_groups_for_spelling_ru"
				ctx.reply("Выберите группы в формате '1-5'")
			}
			break;
		case '|Перейти к группе|':
			mode = "to_n_group"
			ctx.reply('Введите номер группы')
			break
		case '|Перемешать слова|':
			ctx.reply('Вы действительно хотите перемешать ВСЕ слова?\n\n ЭТО НЕОБРАТИМОЕ ДЕЙСТВИЕ! \n\nЭто изменит все группы слов.\n Для подтверждения введите "Да, я действительно хочу перемешать ВСЕ слова"')
			break
		case 'Да, я действительно хочу перейти к 1 группе':
			select_group(ctx, 1)
			break
		case 'Да, я действительно хочу перемешать ВСЕ слова':
			user.need_to_learn.words.sort(() => Math.random() - 0.5)
			fs.writeFileSync(`user_configs/${ctx.chat.id}.json`, JSON.stringify(user))
			select_group(ctx, 1)
			break
		case '←':
			let group = JSON.parse(fs.readFileSync(`user_configs/${ctx.chat.id}.json`)).need_to_learn.current_group - 1
			if (group > 0) {
				select_group(ctx, group)
			} else {
				select_group(ctx, 1)
			}
			break
		case '→':
			let c_group = user.need_to_learn.current_group
			if (c_group < user.need_to_learn.words.length / 10) {
				select_group(ctx, c_group + 1)
			} else {
				select_group(ctx, c_group)
			}
			break
		case '|Выйти|':
			ctx.reply("Вы действительно хотите выйти? \n\n ЭТО ПОЛНОСТЬЮ УНИЧТОЖИТ ВАШ ПРОГРЕСС В ДИКТАНТЕ \n\n Для подтверждения введите 'Да, я действительно хочу выйти'", Keyboard.make([['|Вернуться к диктанту|']]).reply())
			break
		case '|Вернуться к диктанту|':
			await ctx.reply('Диктант', Keyboard.make(['|Выйти|']).reply())
			spelling(ctx)
			break
		case 'Да, я действительно хочу выйти':
			ctx.reply("Главная", Keyboard.make([['|Сортировать слова|', '|Учить слова|'], ['|Статистика|']]).reply())
			break
		default:
			console.log("text", mode)
			if (mode === 'learning' || mode === "spelling") {
				check(ctx);
				break;
			}
			if (mode === "to_n_group") {
				let text = ctx.message.text.toLowerCase()
				if (!isNaN(parseInt(text))) {
					let group = parseInt(text)
					mode = "learning"
					if (group < 1) group = 1
					if (group > Math.floor(user.need_to_learn.words.length / 10)) group = Math.floor(user.need_to_learn.words.length / 10)
					select_group(ctx, group)
				} else {
					ctx.reply("Введите корректный ответ")
				}
			}
			if (mode.includes("select_groups_for_spelling")) {
				let lang = ""
				if (mode.includes("_ru")) {
					lang = "ru"
				} else {
					lang = "en"
				}
				let text = ctx.message.text.toLowerCase()
				let borders = text.split("-")
				let res = []
				for (let i = 0; i < 2; i++) {
					let b = borders[i]
					if (!isNaN(parseInt(b))) {
						res[i] = parseInt(b)
					}

				}
				if (res.length === 2 || res[0] > res[1]) {
					if (res[0] < 1) res[0] = 1
					mode = "spelling"
					init_spelling(ctx, res, lang)
				} else {
					ctx.reply("Укажите корректный промежуток")
				}
			}

	}
});

bot.launch()