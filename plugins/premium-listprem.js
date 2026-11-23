const handler = async (m, { conn, args = [] }) => {
	const users = Object.entries(db.data?.users || {})
		.filter(([, user]) => user && user.premium && Number(user.expired) > Date.now())
		.sort(([, a], [, b]) => Number(a.expired) - Number(b.expired))

	const requested = /^\d+$/.test(String(args[0] || '')) ? Number(args[0]) : 10
	const limit = Math.min(Math.max(requested, 1), 50)
	const now = Date.now()
	const entries = users.slice(0, limit)
	const lines = await Promise.all(entries.map(async ([jid, user], index) => {
		const name = user.name || await conn.getName(jid).catch(() => jid.split('@')[0])
		const remaining = Math.max(0, Number(user.expired) - now)
		const days = Math.floor(remaining / 86400000)
		const hours = Math.floor((remaining % 86400000) / 3600000)
		return `${index + 1}. ${name} — ${days} hari ${hours} jam tersisa`
	}))

	const self = db.data?.users?.[m.sender]
	const selfActive = Boolean(self?.premium) && Number(self.expired) > now
	const selfRemaining = selfActive ? Math.max(0, Number(self.expired) - now) : 0
	const selfLine = selfActive
		? `Status kamu: Aktif (${Math.floor(selfRemaining / 86400000)} hari tersisa)\n\n`
		: 'Status kamu: tidak aktif\n\n'
	const text = `*Daftar Premium Aktif* (${users.length})\n${selfLine}${lines.length ? lines.join('\n') : 'Belum ada pengguna Premium aktif.'}`
	return conn.reply(m.chat, text, m)
}

handler.help = ['premlist [jumlah]']
handler.tags = ['premium']
handler.command = /^(listprem|premlist|listpremium)$/i
export default handler
