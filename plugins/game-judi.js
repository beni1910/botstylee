const pending = new Map()
const CHOICES = ['🍷', '🥃', '☄️', '🍄', '🌹', '🌷', '🎄', '🌲', '⚡', '🌬️', '💫', '🥂', '🍸', '🥤', '🧊', '♟️', '🎯', '🎮', '🛰️', '🛸', '🗿']
const parseAmount = (value, balance) => {
	if (/^(all|semua)$/i.test(String(value || ''))) return Math.floor(balance)
	if (value == null || value === '') return 100
	if (!/^\d+$/.test(String(value))) return NaN
	return Number(value)
}

async function handler(m, { conn, args = [] }) {
	const user = db.data?.users?.[m.sender]
	if (!user) return conn.reply(m.chat, 'Data pengguna belum tersedia.', m)
	if (pending.has(m.sender)) return conn.reply(m.chat, 'Kamu masih memiliki taruhan yang menunggu konfirmasi.', m)

	const balance = Number(user.mp) || 0
	const amount = parseAmount(args[0], balance)
	if (!Number.isSafeInteger(amount) || amount <= 0) return conn.reply(m.chat, 'Masukkan jumlah MP yang valid. Contoh: .judi 100 atau .judi all', m)
	if (amount > balance) return conn.reply(m.chat, 'MP kamu tidak cukup untuk jumlah taruhan itu.', m)

	const entry = { amount, chat: m.chat, timeout: null }
	entry.timeout = setTimeout(() => {
		if (pending.get(m.sender) !== entry) return
		pending.delete(m.sender)
		conn.reply(entry.chat, 'Konfirmasi judi kedaluwarsa; taruhan dibatalkan.', m).catch(() => {})
	}, 60_000)
	pending.set(m.sender, entry)
	return conn.reply(m.chat, `⚠️ Taruhan ${amount.toLocaleString('id-ID')} MP. Ketik *y* untuk lanjut atau *n* untuk batal (60 detik).`, m)
}

handler.before = async function (m) {
	const entry = pending.get(m.sender)
	if (!entry || m.isBaileys || typeof m.text !== 'string') return false
	const answer = (m.msg?.selectedDisplayText || m.text).trim().toLowerCase()
	if (!/^(y|yes|ya|n|no|tidak|batal)$/i.test(answer)) return false

	clearTimeout(entry.timeout)
	pending.delete(m.sender)
	if (/^(n|no|tidak|batal)$/i.test(answer)) {
		await m.reply('Taruhan dibatalkan; MP tidak berubah.')
		return true
	}

	const user = db.data?.users?.[m.sender]
	if (!user) {
		await m.reply('Data pengguna tidak tersedia; taruhan dibatalkan.')
		return true
	}
	const balance = Number(user.mp) || 0
	if (balance < entry.amount) {
		await m.reply('MP kamu sudah tidak cukup; taruhan dibatalkan.')
		return true
	}

	const player = Math.floor(Math.random() * 100)
	const computer = Math.floor(Math.random() * 100)
	const emoji = CHOICES[Math.floor(Math.random() * CHOICES.length)]
	let result
	if (player > computer) {
		user.mp = balance + entry.amount
		result = `MENANG! Kamu mendapat +${entry.amount.toLocaleString('id-ID')} MP.`
	} else if (player < computer) {
		user.mp = balance - entry.amount
		result = `KALAH! MP kamu berkurang ${entry.amount.toLocaleString('id-ID')}.`
	} else {
		result = 'SERI! MP kamu tidak berubah.'
	}
	await this.reply(entry.chat, `[ CASINO ]\n\nKamu: ${player} ${emoji}\nKomputer: ${computer} ${emoji}\n\n${result}`, m)
	return true
}

handler.help = ['judi <jumlah|all>']
handler.tags = ['game']
handler.command = /^judi$/i
handler.level = 18
export default handler
