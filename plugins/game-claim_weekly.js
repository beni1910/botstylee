const REWARDS = { coin: 1, mp: 5000 }
const COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000

function formatRemaining(ms) {
	const days = Math.floor(ms / 86400000)
	const hours = Math.floor((ms % 86400000) / 3600000)
	return `${days} hari ${hours} jam`
}

const handler = async m => {
	const user = db.data?.users?.[m.sender]
	if (!user) return m.reply('Data pengguna belum tersedia. Coba lagi sebentar.')
	user.game = user.game && typeof user.game === 'object' ? user.game : {}

	const now = Date.now()
	const lastClaim = Number(user.game.lastweekly) || 0
	const remaining = lastClaim + COOLDOWN_MS - now
	if (remaining > 0) return m.reply(`Klaim mingguan sudah digunakan. Coba lagi dalam *${formatRemaining(remaining)}*.`)

	const granted = []
	for (const [key, amount] of Object.entries(REWARDS)) {
		user[key] = (Number(user[key]) || 0) + amount
		granted.push(`*+${amount}* ${key.toUpperCase()}`)
	}
	user.game.lastweekly = now
	return m.reply(`*Klaim mingguan berhasil!*\n\n${granted.join('\n')}`)
}

handler.help = ['weekly']
handler.tags = ['game']
handler.command = /^weekly$/i
export default handler
