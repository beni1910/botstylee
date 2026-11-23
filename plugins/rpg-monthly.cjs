const REWARDS = { exp: 50000, money: 49999, potion: 10, mythic: 3, legendary: 1 }
const COOLDOWN_MS = 30 * 24 * 60 * 60 * 1000
const formatRemaining = ms => `${Math.floor(ms / 86400000)} hari ${Math.floor(ms / 3600000) % 24} jam`

const handler = async m => {
	const user = global.db?.data?.users?.[m.sender]
	if (!user) return m.reply('Data pemain belum tersedia.')
	const now = Date.now()
	const last = Number(user.lastmonthly) || 0
	const remaining = COOLDOWN_MS - (now - last)
	if (remaining > 0) return m.reply(`Klaim bulanan sudah digunakan. Coba lagi dalam *${formatRemaining(remaining)}*.`)

	const granted = []
	for (const [item, amount] of Object.entries(REWARDS)) {
		user[item] = (Number(user[item]) || 0) + amount
		const emoji = global.rpg?.emoticon?.(item) || ''
		granted.push(`*+${amount}* ${emoji}${item}`)
	}
	user.lastmonthly = now
	return m.reply(`🎁 *Klaim bulanan berhasil!*\n${granted.join('\n')}`)
}

handler.help = ['monthly']
handler.tags = ['rpg']
handler.command = /^monthly$/i
handler.cooldown = COOLDOWN_MS
module.exports = handler
