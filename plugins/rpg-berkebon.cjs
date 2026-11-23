const COOLDOWN_MS = 30 * 60 * 1000
const SEEDS = [
	['seedwortel', 'wortel', 'Wortel'], ['seedkangkung', 'kangkung', 'Kangkung'],
	['seedkentang', 'kentang', 'Kentang'], ['seedkubis', 'kubis', 'Kubis'],
	['seedtomat', 'tomat', 'Tomat'], ['seedjagung', 'jagung', 'Jagung'],
	['seedbayam', 'bayam', 'Bayam'], ['seedlabu', 'labu', 'Labu']
]
const formatTime = ms => `${Math.floor(ms / 60000)} menit ${Math.floor(ms / 1000) % 60} detik`

const handler = async m => {
	const user = global.db?.data?.users?.[m.sender]
	if (!user) return m.reply('Data pemain belum tersedia. Coba lagi sebentar.')
	const now = Date.now()
	const remaining = COOLDOWN_MS - (now - (Number(user.lastberkebon) || 0))
	if (remaining > 0) return m.reply(`Kebun masih tumbuh. Panen lagi dalam *${formatTime(remaining)}*.`)
	const missing = SEEDS.filter(([seed]) => (Number(user[seed]) || 0) < 100)
	if (missing.length) return m.reply(`Untuk menanam satu kebun lengkap, siapkan 100 bibit untuk tiap jenis:\n${missing.map(([seed, , name]) => `• ${name}: ${Math.max(0, 100 - (Number(user[seed]) || 0))} bibit lagi`).join('\n')}`)

	const harvest = []
	for (const [seed, crop, name] of SEEDS) {
		user[seed] = (Number(user[seed]) || 0) - 100
		const amount = Math.floor(Math.random() * 91) + 10
		user[crop] = (Number(user[crop]) || 0) + amount
		harvest.push(`• ${name}: +${amount}`)
	}
	user.exp = (Number(user.exp) || 0) + 1500
	user.lastberkebon = now
	return m.reply(`🌱 *Panen berhasil!*\n${harvest.join('\n')}\n\nBonus: +1500 EXP. Bibit untuk kebun berikutnya harus disiapkan kembali.`)
}

handler.help = ['berkebon']
handler.tags = ['rpg']
handler.command = /^berkebon$/i
handler.register = true
handler.cooldown = COOLDOWN_MS
module.exports = handler
