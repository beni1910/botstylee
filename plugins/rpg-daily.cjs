const REWARDS = { exp: 10000, money: 5000, potion: 5 }
const COOLDOWN_MS = 24 * 60 * 60 * 1000
const formatRemaining = ms => `${Math.floor(ms / 3600000)} jam ${Math.floor(ms / 60000) % 60} menit`

const handler = async m => {
	const user = global.db?.data?.users?.[m.sender]
	if (!user) return m.reply('Data pemain belum tersedia.')
	const now = Date.now()
	const last = Number(user.lastclaim) || 0
	const remaining = COOLDOWN_MS - (now - last)
	if (remaining > 0) return m.reply(`Klaim harian sudah digunakan. Coba lagi dalam *${formatRemaining(remaining)}*.`)
	const granted = []
	for (const [item, amount] of Object.entries(REWARDS)) {
		user[item] = (Number(user[item]) || 0) + amount
		const emoji = global.rpg?.emoticon?.(item) || ''
		granted.push(`*+${amount}* ${emoji}${item}`)
	}
	user.lastclaim = now
	return m.reply(`🎁 *Klaim harian berhasil!*\n${granted.join('\n')}`)
}

handler.help = ['daily', 'claim']
handler.tags = ['xp']
handler.command = /^(daily|claim)$/i
handler.cooldown = COOLDOWN_MS
module.exports = handler
