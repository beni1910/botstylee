const similarity = require('similarity')
const THRESHOLD = 0.72

const normalize = value => String(value || '')
	.normalize('NFD')
	.replace(/[\u0300-\u036f]/g, '')
	.toLowerCase()
	.replace(/[^\p{L}\p{N}\s-]/gu, ' ')
	.replace(/\s+/g, ' ')
	.trim()

const handler = m => m
handler.before = async function (m) {
	if (!m || typeof m.text !== 'string' || !m.text.trim()) return false
	const session = this.siapakahaku?.[m.chat]
	if (!Array.isArray(session) || !session[0]?.key?.id || typeof session[1]?.jawaban !== 'string') return false
	const quotedId = m.quoted?.id || m.quoted?.key?.id
	if (quotedId !== session[0].key.id) return false

	const answer = normalize(m.text)
	if (/^(nyerah|menyerah|surrender)$/i.test(answer)) {
		clearTimeout(session[3])
		delete this.siapakahaku[m.chat]
		await this.sendButton(m.chat, `Jawabannya: *${session[1].jawaban}*`, global.author || '', ['Main lagi', `${session[4] || '.'}siapakahaku`], m)
		return true
	}

	const expected = normalize(session[1].jawaban)
	if (answer === expected) {
		clearTimeout(session[3])
		delete this.siapakahaku[m.chat]
		const user = db.data?.users?.[m.sender]
		if (user) user.exp = (Number(user.exp) || 0) + (Number(session[2]) || 0)
		await this.sendButton(m.chat, `*Benar!*\n+${Number(session[2]) || 0} XP`, global.author || '', ['Main lagi', `${session[4] || '.'}siapakahaku`], m)
	} else if (typeof similarity === 'function' && similarity(answer, expected) >= THRESHOLD) {
		await m.reply('*Dikit lagi!*')
	} else {
		await m.reply('*Jawaban belum tepat.*')
	}
	return true
}

module.exports = handler
