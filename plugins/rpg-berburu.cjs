const COOLDOWN_MS = 500000
const ANIMALS = [
	['banteng', '🐂'], ['harimau', '🐅'], ['gajah', '🐘'], ['kambing', '🐐'],
	['panda', '🐼'], ['buaya', '🐊'], ['kerbau', '🐃'], ['sapi', '🐮'],
	['monyet', '🐒'], ['babihutan', '🐗'], ['babi', '🐖'], ['ayam', '🐓']
]
const formatTime = ms => `${Math.floor(ms / 60000)} menit ${Math.floor(ms / 1000) % 60} detik`

const handler = async (m, { usedPrefix = '.' }) => {
	const user = global.db?.data?.users?.[m.sender]
	if (!user) return m.reply('Data pemain belum tersedia. Coba lagi sebentar.')
	const now = Date.now()
	const remaining = COOLDOWN_MS - (now - (Number(user.lasthunt) || 0))
	if (remaining > 0) return m.reply(`Kamu masih lelah berburu. Tunggu *${formatTime(remaining)}* lagi.`)
	if ((Number(user.stamina) || 0) < 20) return m.reply(`Stamina minimal 20 diperlukan. Pulihkan dengan *${usedPrefix}eat*.`)
	if ((Number(user.sword) || 0) < 1) return m.reply(`Kamu belum memiliki sword. Buat melalui *${usedPrefix}craft sword*.`)
	if ((Number(user.sworddurability) || 0) < 10) return m.reply(`Durability sword kurang dari 10. Perbaiki dengan *${usedPrefix}repair sword*.`)

	const loot = ANIMALS.map(([key]) => [key, Math.floor(Math.random() * 10)])
	for (const [key, amount] of loot) user[key] = (Number(user[key]) || 0) + amount
	user.stamina = Math.max(0, (Number(user.stamina) || 0) - 20)
	user.sworddurability = Math.max(0, (Number(user.sworddurability) || 0) - 10)
	user.lasthunt = now

	const results = loot.filter(([, count]) => count > 0).map(([key, count]) => {
		const emoji = ANIMALS.find(([animal]) => animal === key)?.[1] || ''
		return `${emoji} ${key}: +${count}`
	})
	return m.reply(`*Hasil berburu*\n${results.length ? results.join('\n') : 'Belum mendapatkan hewan kali ini.'}\n\nStamina -20 | Durability sword -10`)
}

handler.help = ['berburu']
handler.tags = ['rpg']
handler.command = /^berburu$/i
handler.register = true
handler.cooldown = COOLDOWN_MS
module.exports = handler
