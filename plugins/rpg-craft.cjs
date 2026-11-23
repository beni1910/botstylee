const RECIPES = {
	pickaxe: { ingredients: { iron: 15, stick: 10 }, item: 'pickaxe', durability: 'pickaxedurability', durabilityGain: 20 },
	axe: { ingredients: { iron: 15, stick: 10 }, item: 'axe', durability: 'axedurability', durabilityGain: 20 },
	sword: { ingredients: { iron: 10, stick: 5 }, item: 'sword', durability: 'sworddurability', durabilityGain: 20 },
	fishingrod: { ingredients: { string: 20, stick: 10 }, item: 'fishingrod', durability: 'fishingroddurability', durabilityGain: 20 }
}
const BURNS = {
	glass: { ingredients: { sand: 6, coal: 1 }, item: 'glass', output: 3 },
	brick: { ingredients: { clay: 6, coal: 1 }, item: 'brick', output: 3 }
}
const formatRecipe = recipe => Object.entries(recipe.ingredients).map(([item, amount]) => `${amount} ${item}`).join(' + ')

const handler = async (m, { conn, command = '', args = [], usedPrefix = '.' }) => {
	const user = global.db?.data?.users?.[m.sender]
	if (!user) return m.reply('Data pemain belum tersedia.')
	const action = String(command).toLowerCase()
	let type = String(args[0] || '').toLowerCase()
	let countArg = args[1]
	if (['burn', 'bakar', 'burning'].includes(type)) {
		type = String(args[1] || '').toLowerCase()
		countArg = args[2]
	}
	const count = countArg == null ? 1 : Number(countArg)
	if (!Number.isSafeInteger(count) || count < 1 || count > 999) return m.reply('Jumlah harus bilangan bulat antara 1–999.')

	const isBurn = ['burn', 'bakar', 'burning'].includes(action) || ['burn', 'bakar', 'burning'].includes(String(args[0] || '').toLowerCase())
	const recipes = isBurn ? BURNS : RECIPES
	const recipe = recipes[type]
	if (!recipe) {
		const list = Object.keys(RECIPES).map(name => `• ${name}: ${formatRecipe(RECIPES[name])}`).concat(Object.keys(BURNS).map(name => `• burn ${name}: ${formatRecipe(BURNS[name])} → ${BURNS[name].output} ${name}`)).join('\n')
		return conn.reply(m.chat, `*Crafting & Burning*\n${list}\n\nContoh: ${usedPrefix}craft sword 1 atau ${usedPrefix}burn glass 2`, m)
	}
	const missing = Object.entries(recipe.ingredients).filter(([item, amount]) => (Number(user[item]) || 0) < amount * count)
	if (missing.length) return m.reply(`Bahan tidak cukup untuk ${count} ${type}. Kurang: ${missing.map(([item, amount]) => `${Math.max(0, amount * count - (Number(user[item]) || 0))} ${item}`).join(', ')}.`)

	for (const [item, amount] of Object.entries(recipe.ingredients)) user[item] = (Number(user[item]) || 0) - amount * count
	if (isBurn) {
		user[recipe.item] = (Number(user[recipe.item]) || 0) + recipe.output * count
		return conn.reply(m.chat, `🔥 Berhasil membakar bahan menjadi ${recipe.output * count} ${type}.`, m)
	}
	user[recipe.item] = (Number(user[recipe.item]) || 0) + count
	user[recipe.durability] = (Number(user[recipe.durability]) || 0) + recipe.durabilityGain * count
	return conn.reply(m.chat, `🔨 Berhasil membuat ${count} ${type}. Durability bertambah ${recipe.durabilityGain * count}.`, m)
}

handler.help = ['craft <item> [jumlah]', 'burn <glass|brick> [jumlah]']
handler.tags = ['rpg']
handler.register = true
handler.command = /^(craft|crafting|burn|bakar)$/i
module.exports = handler
