const pending = new Map()
const MIN_BET = 1000
const MAX_BET = 100000
const CONFIRM_TIMEOUT_MS = 60_000

const handler = async (m, { conn, args = [] }) => {
	const user = global.db?.data?.users?.[m.sender]
	if (!user) return m.reply('Data pemain belum tersedia.')
	if (pending.has(m.sender)) return m.reply('Kamu masih memiliki taruhan yang menunggu konfirmasi.')
	const amountText = String(args[0] || '')
	const amount = /^all$/i.test(amountText) ? Math.floor(Number(user.money) || 0) : /^\d+$/.test(amountText) ? Number(amountText) : NaN
	if (!Number.isSafeInteger(amount) || amount < MIN_BET || amount > MAX_BET) return m.reply(`Jumlah taruhan harus antara ${MIN_BET} dan ${MAX_BET} money, atau gunakan *all* jika saldo masih dalam batas.`)
	if ((Number(user.money) || 0) < amount) return m.reply('Money kamu tidak cukup untuk taruhan tersebut.')

	const entry = { amount, chat: m.chat, timeout: null }
	entry.timeout = setTimeout(() => {
		if (pending.get(m.sender) !== entry) return
		pending.delete(m.sender)
		conn.reply(entry.chat, 'Konfirmasi taruhan kedaluwarsa; taruhan dibatalkan.', m).catch(() => {})
	}, CONFIRM_TIMEOUT_MS)
	pending.set(m.sender, entry)
	return conn.sendButton(m.chat, `Taruhan sebesar *${amount} money*. Yakin bermain? Pilih ya atau tidak.`, global.author || '', null, [['Ya', 'ya'], ['Tidak', 'tidak']], m)
}

handler.before = async function (m) {
	const entry = pending.get(m.sender)
	if (!entry || m.isBaileys || typeof m.text !== 'string') return false
	const answer = (m.msg?.selectedDisplayText || m.text).trim().toLowerCase()
	if (!/^(y|yes|ya|n|no|tidak|batal)$/i.test(answer)) return false
	clearTimeout(entry.timeout)
	pending.delete(m.sender)
	if (/^(n|no|tidak|batal)$/i.test(answer)) {
		await m.reply('Taruhan dibatalkan; saldo tidak berubah.')
		return true
	}
	const user = global.db?.data?.users?.[m.sender]
	if (!user || (Number(user.money) || 0) < entry.amount) {
		await m.reply('Saldo tidak cukup lagi. Taruhan dibatalkan.')
		return true
	}

	const player = Math.floor(Math.random() * 71)
	const bot = Math.floor(Math.random() * 80)
	let result
	if (player > bot) {
		user.money = (Number(user.money) || 0) + entry.amount
		result = `MENANG! Hadiah bersih +${entry.amount} money.`
	} else if (player < bot) {
		user.money = Math.max(0, (Number(user.money) || 0) - entry.amount)
		result = `KALAH! Money berkurang ${entry.amount}.`
	} else {
		result = 'SERI! Saldo tidak berubah.'
	}
	await this.reply(entry.chat, `Bot roll: *${bot}*\nKamu roll: *${player}*\n\n${result}`, m)
	return true
}

handler.help = ['bet <jumlah|all>']
handler.tags = ['rpg']
handler.command = /^bet$/i
module.exports = handler
