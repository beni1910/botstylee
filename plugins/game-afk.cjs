const handler = async (m, { conn, text = '' }) => {
	const user = global.db?.data?.users?.[m.sender]
	if (!user) return conn.reply(m.chat, 'Data pengguna belum tersedia. Coba lagi sebentar.', m)

	user.afk = Date.now()
	user.afkReason = text.trim()

	const tag = m.sender.split('@')[0]
	const reason = user.afkReason ? `\nAlasan: ${user.afkReason}` : ''
	return conn.reply(m.chat, `🚩 @${tag} sekarang AFK.${reason}`, m, {
		mentions: [m.sender]
	})
}

handler.help = ['afk [alasan]']
handler.command = ['afk']
handler.tags = ['main']

module.exports = handler
