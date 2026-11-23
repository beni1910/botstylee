const MODES = {
	noob: [-3, 3, -3, 3, '+-', 18000, 1000],
	easy: [-10, 10, -10, 10, '*/+-', 20000, 2000],
	medium: [-40, 40, -20, 20, '*/+-', 40000, 2500],
	hard: [-100, 100, -70, 70, '*/+-', 60000, 4000],
	extreme: [-9999, 9999, -9999, 9999, '*/', 80000, 7000],
	impossible: [-999999, 999999, -999999, 999999, '*/', 100000, 12000],
	impossible2: [-9999999, 9999999, -9999, 9999, '/', 120000, 15000]
}
const OPERATORS = { '+': '+', '-': '−', '*': '×', '/': '÷' }

const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min
const pickRandom = values => values[Math.floor(Math.random() * values.length)]

function generateMath(mode) {
	const [aMin, aMax, bMin, bMax, allowed, time, bonus] = MODES[mode]
	let a = randomInt(aMin, aMax)
	let b = randomInt(bMin, bMax)
	const op = pickRandom([...allowed])
	let result

	if (op === '/') {
		b = randomInt(Math.max(1, Math.abs(bMin)), Math.max(1, Math.abs(bMax)))
		const quotient = randomInt(Math.min(aMin, aMax), Math.max(aMin, aMax))
		a = b * quotient
		result = quotient
	} else if (op === '+') result = a + b
	else if (op === '-') result = a - b
	else result = a * b

	return { str: `${a} ${OPERATORS[op]} ${b}`, mode, time, bonus, result }
}

async function handler(m, { conn, args = [], usedPrefix = '.', command = 'math' }) {
	conn.math = conn.math && typeof conn.math === 'object' ? conn.math : {}
	const modes = Object.keys(MODES)
	const help = `Mode tersedia: ${modes.join(', ')}\nContoh: ${usedPrefix}${command} hard`
	const mode = String(args[0] || '').toLowerCase()
	if (!Object.prototype.hasOwnProperty.call(MODES, mode)) return conn.reply(m.chat, help, m)

	const id = m.chat
	if (conn.math[id]) return conn.reply(m.chat, 'Masih ada soal belum terjawab di chat ini.', conn.math[id][0] || m)

	const math = generateMath(mode)
	const question = await conn.reply(m.chat, `Berapa hasil dari *${math.str}*?\n\nTimeout: ${(math.time / 1000).toFixed(0)} detik\nBonus Jawaban Benar: ${math.bonus} MP`, m)
	const session = [question, math, 4, null]
	conn.math[id] = session
	session[3] = setTimeout(async () => {
		if (conn.math?.[id] !== session) return
		delete conn.math[id]
		await conn.reply(m.chat, `Waktu habis!\nJawabannya adalah ${math.result}`, question || m).catch(error => conn.logger?.error?.({ err: error }, 'Gagal mengirim hasil soal matematika'))
	}, math.time)
}

handler.help = ['math <mode>']
handler.tags = ['game']
handler.command = /^math$/i
export default handler
