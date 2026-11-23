function targetJid(m, conn) {
	return m.mentionedJid?.[0] || m.quoted?.sender || (m.fromMe ? conn.user?.jid : m.sender)
}

function formatExpiry(timestamp) {
	return new Intl.DateTimeFormat('id-ID', { dateStyle: 'full', timeStyle: 'short' }).format(new Date(timestamp))
}

function formatRemaining(ms) {
	const days = Math.floor(ms / 86400000)
	const hours = Math.floor((ms % 86400000) / 3600000)
	const minutes = Math.floor((ms % 3600000) / 60000)
	return `${days} hari, ${hours} jam, ${minutes} menit`
}

const handler = async (m, { conn }) => {
	const jid = targetJid(m, conn)
	const user = db.data?.users?.[jid]
	if (!jid || !user || typeof user !== 'object') return m.reply('Data pengguna tidak ditemukan di database.')

	const now = Date.now()
	const expiry = Number(user.expired) || 0
	const active = Boolean(user.premium) && Number.isFinite(expiry) && expiry > now
	const name = user.name || await conn.getName(jid).catch(() => jid.split('@')[0])
	if (!active) {
		const lastExpiry = expiry > 0 ? `Masa Premium terakhir berakhir: ${formatExpiry(expiry)}.` : 'Belum ada masa Premium tercatat.'
		return conn.reply(m.chat, `@${jid.split('@')[0]} tidak memiliki Premium aktif.\n${lastExpiry}`, m, { mentions: [jid] })
	}

	const remaining = expiry - now
	return conn.reply(m.chat, [
		'*Status Premium*',
		`Nama: ${name}`,
		'Status: Aktif',
		`Berakhir: ${formatExpiry(expiry)}`,
		`Sisa waktu: ${formatRemaining(remaining)}`,
		`Kuota join premium: ${Number(user.limitjoinprem) || 0}`,
		`Kuota join gratis: ${Number(user.limitjoinfree) || 0}`
	].join('\n'), m, { mentions: [jid] })
}

handler.help = ['checkprem [@tag]']
handler.tags = ['premium']
handler.command = /^checkprem$/i
module.exports = handler
