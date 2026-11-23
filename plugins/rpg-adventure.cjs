const COOLDOWN_MS = 5 * 60 * 1000
const MIN_HEALTH = 80
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min
const EMOJI = { money: '💵 ', exp: '✨ ', trash: '🗑️ ', potion: '🧪 ', rock: '🪨 ', wood: '🪵 ', string: '🧵 ', common: '📦 ', uncommon: '🛍️ ', mythic: '🎁 ', legendary: '🏆 ', iron: '⛓️ ', gold: '🪙 ', diamond: '💎 ' }
const rewardRanges = { money: [100, 500], exp: [100, 600], trash: [0, 20], potion: [0, 2], rock: [0, 3], wood: [0, 3], string: [0, 2], common: [0, 2], uncommon: [0, 1], mythic: [0, 1], legendary: [0, 1], iron: [0, 2], gold: [0, 1], diamond: [0, 1] }

const handler = async (m, { usedPrefix = '.' }) => {
	const user = db.data?.users?.[m.sender]
	if (!user) return m.reply('Data pemain belum tersedia. Coba lagi sebentar.')
	const now = Date.now()
	const last = Number(user.lastadventure) || 0
	const remaining = COOLDOWN_MS - (now - last)
	if (remaining > 0) return m.reply(`Kamu masih kelelahan. Coba lagi dalam *${Math.ceil(remaining / 60000)} menit*.`)
	const health = Number(user.health) || 0
	if (health < MIN_HEALTH) return m.reply(`Petualangan membutuhkan minimal ${MIN_HEALTH} ❤️. Pulihkan health dengan *${usedPrefix}heal* terlebih dahulu.`)

	const rewards = []
	for (const [item, [min, max]] of Object.entries(rewardRanges)) {
		const amount = randomInt(min, max)
		if (amount <= 0) continue
		user[item] = (Number(user[item]) || 0) + amount
		rewards.push(`${EMOJI[item] || ''}${item}: +${amount}`)
	}

	const catLevel = Math.max(0, Number(user.cat) || 0)
	const damage = Math.max(5, randomInt(10, 25) - Math.min(10, catLevel * 2))
	user.health = Math.max(0, health - damage)
	const armorDamage = Math.min(Math.max(0, Number(user.armordurability) || 0), randomInt(0, 10))
	if (armorDamage) user.armordurability -= armorDamage
	user.lastadventure = now

	return m.reply([
		'*Petualangan selesai!*',
		`Health: -${damage} (tersisa ${user.health})${armorDamage ? `\nDurability armor: -${armorDamage}` : ''}`,
		rewards.length ? `\nHasil petualangan:\n${rewards.join('\n')}` : '\nKali ini kamu tidak menemukan barang.'
	].join('\n'))
}

handler.help = ['adventure', 'petualang', 'berpetualang', 'mulung']
handler.tags = ['rpg']
handler.command = /^(adventure|(ber)?petualang(ang)?|mulung)$/i
handler.cooldown = COOLDOWN_MS
module.exports = handler
