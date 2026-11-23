var handler = m => m
handler.before = async function (m) {
	if (!m || typeof m.text !== 'string' || !/^-?\d+(?:\.\d+)?$/.test(m.text.trim())) return false
	const id = m.chat
	this.math = this.math && typeof this.math === 'object' ? this.math : {}
	const session = this.math[id]
	if (!Array.isArray(session) || !session[1] || !Number.isFinite(Number(session[1].result))) return false

	const game = session[1]
	const user = db.data?.users?.[m.sender]
	if (Number(m.text.trim()) === Number(game.result)) {
		clearTimeout(session[3])
		delete this.math[id]
		if (user) user.mp = (Number(user.mp) || 0) + (Number(game.bonus) || 0)
		await this.sendButton(m.chat, `*Jawaban Benar!*\n+${Number(game.bonus) || 0} MP`, global.author || '', null, [
			['Coba lagi', `/math ${game.mode}`]
		], m)
		return true
	}

	session[2] = Math.max(0, (Number(session[2]) || 0) - 1)
	if (session[2] === 0) {
		clearTimeout(session[3])
		delete this.math[id]
		await this.sendButton(m.chat, `*Kesempatan habis!*\nJawaban: *${game.result}*`, global.author || '', null, [
			['Coba lagi', `/math ${game.mode}`]
		], m)
	} else {
		await m.reply(`*Jawaban Salah!*\nMasih ada ${session[2]} kesempatan`)
	}
	return true
}

module.exports = handler
