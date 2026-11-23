const PAGE_SIZE_DEFAULT = 10
const PAGE_SIZE_MAX = 50

function formatRemaining(ms) {
	if (!Number.isFinite(ms) || ms <= 0) return 'kedaluwarsa'
	const days = Math.floor(ms / 86400000)
	const hours = Math.floor((ms % 86400000) / 3600000)
	const minutes = Math.floor((ms % 3600000) / 60000)
	return `${days} hari ${hours} jam ${minutes} menit`
}

async function resolveName(conn, jid, user) {
	if (typeof user?.name === 'string' && user.name.trim()) return user.name.trim()
	try {
		return await conn.getName(jid)
	} catch {
		return jid.split('@')[0]
	}
}

const handler = async (m, { conn, args = [] }) => {
	const usersData = db.data?.users || {}
	const now = Date.now()
	const activeUsers = Object.entries(usersData)
		.filter(([, user]) => user && typeof user === 'object' && user.premium === true && Number.isFinite(Number(user.expired)) && Number(user.expired) > now)
		.sort(([, left], [, right]) => Number(left.expired) - Number(right.expired))

	const requestedSize = args[0] == null || args[0] === '' ? PAGE_SIZE_DEFAULT : Number(args[0])
	const page = args[1] == null || args[1] === '' ? 1 : Number(args[1])
	if (!Number.isSafeInteger(requestedSize) || requestedSize < 1 || !Number.isSafeInteger(page) || page < 1) {
		return m.reply('Format: .premlist [jumlah per halaman 1-50] [halaman]\nContoh: .premlist 10 1')
	}
	const pageSize = Math.min(requestedSize, PAGE_SIZE_MAX)
	const totalPages = Math.max(1, Math.ceil(activeUsers.length / pageSize))
	if (page > totalPages) return m.reply(`Halaman maksimal saat ini adalah ${totalPages}.`)

	const start = (page - 1) * pageSize
	const entries = activeUsers.slice(start, start + pageSize)
	const lines = await Promise.all(entries.map(async ([jid, user], index) => {
		const remaining = Number(user.expired) - now
		const expiry = new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(Number(user.expired)))
		const name = await resolveName(conn, jid, user)
		return `${start + index + 1}. *${name}*\n   wa.me/${jid.split('@')[0]}\n   Sisa: ${formatRemaining(remaining)} (sampai ${expiry})`
	}))

	const self = usersData[m.sender]
	const selfActive = Boolean(self?.premium) && Number(self.expired) > now
	const selfStatus = selfActive ? `Status Premium kamu: AKTIF — ${formatRemaining(Number(self.expired) - now)} tersisa.` : 'Status Premium kamu: tidak aktif.'
	const heading = `*Daftar Pengguna Premium Aktif*\nTotal: ${activeUsers.length} | Halaman ${page}/${totalPages}\n${selfStatus}`
	const body = lines.length ? lines.join('\n\n') : 'Belum ada pengguna Premium aktif.'
	return conn.reply(m.chat, `${heading}\n\n${body}`, m)
}

handler.help = ['premlist [jumlah] [halaman]']
handler.tags = ['premium']
handler.command = /^(listprem|premlist|listpremium)$/i
export default handler
