const FIELDS = ['level', 'exp', 'limit', 'mp', 'coin', 'ruby']
const PAGE_SIZE = 25

const jidKey = jid => String(jid || '').split(':')[0]
const isSameJid = (left, right) => jidKey(left) === jidKey(right)
const numeric = value => {
	const number = Number(value)
	return Number.isFinite(number) ? number : 0
}

const handler = async (m, { conn, args = [], participants = [], usedPrefix = '.', command = 'leaderboard' }) => {
	const usersObject = db.data?.users || {}
	const users = Object.entries(usersObject)
		.filter(([jid, user]) => jid && user && typeof user === 'object')
		.map(([jid, user]) => ({ jid, value: user }))
	const fields = FIELDS.filter(field => users.some(user => Object.prototype.hasOwnProperty.call(user.value, field)))
	const type = String(args[0] || '').toLowerCase()
	if (!fields.includes(type)) {
		return m.reply(`Format: *${usedPrefix}${command} <${fields.join('|')}> [halaman]*\nContoh: *${usedPrefix}${command} exp 1*`)
	}

	const sorted = users.sort((a, b) => numeric(b.value[type]) - numeric(a.value[type]) || a.jid.localeCompare(b.jid))
	const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE))
	const requested = /^\d+$/.test(String(args[1] || '')) ? Number(args[1]) : 1
	const page = Math.min(Math.max(requested, 1), totalPages)
	const start = (page - 1) * PAGE_SIZE
	const current = sorted.slice(start, start + PAGE_SIZE)
	const rank = sorted.findIndex(user => isSameJid(user.jid, m.sender))
	const mentionJids = current.map(user => user.jid)
	const lines = current.map((user, index) => {
		const participant = participants.find(item => isSameJid(item.id, user.jid))
		const name = participant ? conn.getName(user.jid) : `@${user.jid.split('@')[0]}`
		return `${start + index + 1}. ${name} — ${numeric(user.value[type]).toLocaleString('id-ID')} ${type}`
	})

	const text = [`*Leaderboard ${type}* — halaman ${page}/${totalPages}`, `Peringkat kamu: ${rank < 0 ? 'belum tercatat' : rank + 1} dari ${sorted.length}`, '', ...lines].join('\n')
	return m.reply(text, null, { mentions: mentionJids })
}

handler.help = ['leaderboard', 'lb', 'topglobal', 'toplocal'].map(name => `${name} <type> [halaman]`)
handler.tags = ['game']
handler.command = /^(leaderboard|lb|topglobal|toplocal|toplokal)$/i
module.exports = handler
