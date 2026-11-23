const handler = async (m, { conn }) => {
	const target = m.mentionedJid?.[0] || m.quoted?.sender || (m.fromMe ? conn.user?.jid : m.sender)
	const user = db.data?.users?.[target]
	if (!target || !user) return m.reply('Data pengguna tidak ditemukan di database.')

	const expiry = Number(user.expired) || 0
	const isActive = Boolean(user.premium) && expiry > Date.now()
	if (!isActive) {
		if (user.premium && expiry > 0) {
			user.premium = false
			user.expired = 0
		}
		return conn.reply(m.chat, `@${target.split('@')[0]} tidak memiliki status Premium aktif.`, m, { mentions: [target] })
	}

	const expiresAt = new Intl.DateTimeFormat('id-ID', { dateStyle: 'full', timeStyle: 'short' }).format(new Date(expiry))
	return conn.reply(m.chat, `*Status Premium*\nNama: ${user.name || await conn.getName(target)}\nStatus: Aktif\nBerakhir: ${expiresAt}`, m, { mentions: [target] })
}

handler.help = ['checkprem [@tag]']
handler.tags = ['premium']
handler.command = /^checkprem$/i
module.exports = handler
