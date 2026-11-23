const handler = async (m, { conn, usedPrefix = '.', command = 'delprem' }) => {
	const target = m.mentionedJid?.[0] || m.quoted?.sender || (!m.isGroup ? m.chat : null)
	if (!target) return m.reply(`Tag atau balas pesan pengguna yang akan dihapus status Premiumnya.\nContoh: ${usedPrefix}${command} @tag`)

	const user = db.data?.users?.[target]
	if (!user) return m.reply('Data pengguna tidak ditemukan di database.')
	if (!user.premium && !(Number(user.expired) > 0)) return m.reply('Pengguna tersebut tidak memiliki status Premium.')

	user.premium = false
	user.expired = 0
	return conn.reply(m.chat, `Status Premium @${target.split('@')[0]} berhasil dihapus.`, m, { mentions: [target] })
}

handler.help = ['delprem @tag']
handler.tags = ['owner', 'premium']
handler.command = /^delprem$/i
handler.owner = true
export default handler
