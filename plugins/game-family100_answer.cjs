const similarity = require('similarity')
const THRESHOLD = 0.72

const normalizeAnswer = value => String(value || '')
	.normalize('NFD')
	.replace(/[\u0300-\u036f]/g, '')
	.toLowerCase()
	.replace(/[^\p{L}\p{N}\s-]/gu, ' ')
	.replace(/\s+/g, ' ')
	.trim()

const handler = m => m
handler.before = async function (m) {
	if (!m || typeof m.chat !== 'string' || typeof m.text !== 'string' || !m.text.trim()) return false

	this.game = this.game && typeof this.game === 'object' ? this.game : {}
	const room = this.game[`family100_${m.chat}`]
	if (!room || !Array.isArray(room.jawaban) || !Array.isArray(room.terjawab)) return false

	const answer = normalizeAnswer(m.text)
	const isSurrender = /^(nyerah|menyerah|surrender)$/i.test(answer)
	if (!isSurrender) {
		const index = room.jawaban.findIndex((value, i) => !room.terjawab[i] && normalizeAnswer(value) === answer)
		if (index < 0) {
			const unfinished = room.jawaban.filter((_, i) => !room.terjawab[i])
			if (unfinished.length && typeof similarity === 'function') {
				const best = Math.max(...unfinished.map(value => similarity(normalizeAnswer(value), answer)))
				if (best >= THRESHOLD) await m.reply('Dikit lagi!')
			}
			return false
		}

		// Record the winner before awarding to prevent simultaneous duplicate answers.
		room.terjawab[index] = m.sender
		const user = db.data?.users?.[m.sender]
		if (user) user.exp = (Number(user.exp) || 0) + (Number(room.winScore) || 0)
	}

	const complete = room.jawaban.every((_, index) => Boolean(room.terjawab[index]))
	const ended = isSurrender || complete
	const answersText = room.jawaban.map((value, index) => {
		const winner = room.terjawab[index]
		return `${index + 1}. ${value}${winner ? ` — @${winner.split('@')[0]}` : ''}`
	}).join('\n')
	const title = isSurrender ? 'Kuis Family 100 dihentikan.' : complete ? 'Semua jawaban terjawab! Kuis selesai.' : 'Jawaban benar!'
	const mentions = room.terjawab.filter(Boolean)

	if (ended) {
		clearTimeout(room.timeout)
		delete this.game[room.id || `family100_${m.chat}`]
	}

	await this.sendMessage(m.chat, {
		text: `${title}\n${answersText}`,
		mentions
	}, { quoted: m }).catch(async error => {
		this.logger?.error?.({ err: error, chat: m.chat }, 'Gagal mengirim pembaruan Family 100')
		await m.reply(title)
	})
	return true
}

module.exports = handler
