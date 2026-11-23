const REWARDS = { exp: 500, mp: 500 }
const COOLDOWN_MS = 24 * 60 * 60 * 1000

function formatRemaining(ms) {
	const hours = Math.floor(ms / 3600000)
	const minutes = Math.floor((ms % 3600000) / 60000)
	return `${hours} jam ${minutes} menit`
}

const handler = async m => {
	const user = db.data?.users?.[m.sender]
	if (!user) return m.reply('Data pengguna belum tersedia. Coba lagi sebentar.')
	user.game = user.game && typeof user.game === 'object' ? user.game : {}

	const now = Date.now()
	const lastClaim = Number(user.game.lastclaim) || 0
	const remaining = lastClaim + COOLDOWN_MS - now
	if (remaining > 0) return m.reply(`Klaim harian sudah digunakan. Coba lagi dalam *${formatRemaining(remaining)}*.`)

	const granted = []
	for (const [key, amount] of Object.entries(REWARDS)) {
		user[key] = (Number(user[key]) || 0) + amount
		granted.push(`*+${amount}* ${key.toUpperCase()}`)
	}
	user.game.lastclaim = now
	return m.reply(`*Klaim harian berhasil!*\n\n${granted.join('\n')}`)
}

handler.help = ['daily', 'claim']
handler.tags = ['game']
handler.command = /^(daily|claim)$/i
export default handler
