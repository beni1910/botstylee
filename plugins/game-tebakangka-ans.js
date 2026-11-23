const handler = m => m
handler.before = async function (m) {
	if (!m || typeof m.text !== 'string') return false
	this.tebakangka = this.tebakangka && typeof this.tebakangka === 'object' ? this.tebakangka : {}
	const session = this.tebakangka[m.sender]
	if (!session || session.chat !== m.chat) return false

	const text = m.text.trim()
	if (/^(nyerah|menyerah|surrender)$/i.test(text)) {
		clearTimeout(session.tot)
		delete this.tebakangka[m.sender]
		await this.reply(m.chat, `Kamu menyerah. Angka yang benar: *${session.json.target}*`, m)
		return true
	}
	if (!/^\d+$/.test(text)) return false

	const guess = Number(text)
	if (!Number.isSafeInteger(guess)) {
		await m.reply('Masukkan angka bulat yang valid.')
		return true
	}
	const game = session.json
	if (guess === game.target) {
		clearTimeout(session.tot)
		delete this.tebakangka[m.sender]
		const user = global.db?.data?.users?.[m.sender]
		if (user) user.mp = (Number(user.mp) || 0) + (Number(session.poin) || 0)
		await this.reply(m.chat, `*[ MENANG ]*\nTebakanmu benar: *${game.target}*\nHadiah: *${Number(session.poin) || 0} MP*`, m)
		return true
	}

	game.attempt = Math.max(0, (Number(game.attempt) || 0) - 1)
	if (game.attempt === 0) {
		clearTimeout(session.tot)
		delete this.tebakangka[m.sender]
		await this.reply(m.chat, `Kesempatan habis. Angka yang benar: *${game.target}*`, m)
	} else {
		const hint = guess > game.target ? 'Tebakanmu terlalu tinggi.' : 'Tebakanmu terlalu rendah.'
		await m.reply(`${hint}\nSisa kesempatan: ${game.attempt}.`)
	}
	return true
}

export default handler
