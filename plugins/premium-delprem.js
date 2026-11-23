function targetJid(m) {
	return m.mentionedJid?.[0] || m.quoted?.sender || (!m.isGroup ? m.chat : null)
}

const handler = async (m, { conn, usedPrefix = '.', command = 'delprem' }) => {
	const jid = targetJid(m)
	if (!jid) return m.reply(`Tag atau balas pesan pengguna yang akan dihapus status Premiumnya.\nContoh: ${usedPrefix}${command} @tag`)
	const user = db.data?.users?.[jid]
	if (!user || typeof user !== 'object') return m.reply('Data pengguna tidak ditemukan di database.')

	const expiry = Number(user.expired) || 0
	const wasPremium = Boolean(user.premium) || expiry > 0
	if (!wasPremium) return m.reply('Pengguna tersebut tidak memiliki status Premium tercatat.')

	user.premium = false
	user.expired = 0
	const name = user.name || await conn.getName(jid).catch(() => jid.split('@')[0])
	return conn.reply(m.chat, `Status Premium untuk *${name}* (@${jid.split('@')[0]}) berhasil dihapus. Kuota join yang sudah ada tidak diubah.`, m, { mentions: [jid] })
}

handler.help = ['delprem @tag']
handler.tags = ['owner', 'premium']
handler.command = /^delprem$/i
handler.owner = true
export default handler
