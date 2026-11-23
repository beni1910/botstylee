const RECIPES = {
	ayambakar: { ingredients: { ayam: 2, coal: 1 }, output: 'ayambakar', label: 'Ayam Bakar' },
	ayamgoreng: { ingredients: { ayam: 2, coal: 1 }, output: 'ayamgoreng', label: 'Ayam Goreng' },
	oporayam: { ingredients: { ayam: 2, coal: 1 }, output: 'oporayam', label: 'Opor Ayam' },
	gulaiayam: { ingredients: { ayam: 2, coal: 1 }, output: 'gulai', label: 'Gulai Ayam' },
	gulai: { ingredients: { ayam: 2, coal: 1 }, output: 'gulai', label: 'Gulai Ayam' },
	steak: { ingredients: { sapi: 2, coal: 1 }, output: 'steak', label: 'Steak' },
	rendang: { ingredients: { sapi: 2, coal: 1 }, output: 'rendang', label: 'Rendang' },
	babipanggang: { ingredients: { babi: 2, coal: 1 }, output: 'babipanggang', label: 'Babi Panggang' },
	gadogado: { ingredients: { bayam: 2, kubis: 2, coal: 1 }, output: 'gadogado', label: 'Gado-gado' },
	jagungbakar: { ingredients: { jagung: 2, coal: 1 }, output: 'jagungbakar', label: 'Jagung Bakar' },
	popcorn: { ingredients: { jagung: 2, coal: 1 }, output: 'popcorn', label: 'Pop Corn' },
	kentanggoreng: { ingredients: { kentang: 2, coal: 1 }, output: 'kentanggoreng', label: 'Kentang Goreng' },
	suplabu: { ingredients: { labu: 2, coal: 1 }, output: 'suplabu', label: 'Sup Labu' },
	tumiskangkung: { ingredients: { kangkung: 2, coal: 1 }, output: 'tumiskangkung', label: 'Tumis Kangkung' }
}
const listRecipes = () => Object.entries(RECIPES).filter(([name]) => name !== 'gulai').map(([name, recipe]) => `• ${name}: ${Object.entries(recipe.ingredients).map(([item, amount]) => `${amount} ${item}`).join(', ')}`).join('\n')

const handler = async (m, { conn, args = [], usedPrefix = '.', command = 'cook' }) => {
	const user = global.db?.data?.users?.[m.sender]
	if (!user) return m.reply('Data pemain belum tersedia.')
	const recipeName = String(args[0] || '').toLowerCase()
	if (!recipeName) return m.reply(`*Resep masakan*\n${listRecipes()}\n\nContoh: ${usedPrefix}${command} ayambakar 2`)
	const recipe = RECIPES[recipeName]
	if (!recipe) return m.reply(`Resep tidak dikenal.\n${listRecipes()}`)
	const rawCount = args[1] == null ? 1 : Number(args[1])
	if (!Number.isSafeInteger(rawCount) || rawCount < 1 || rawCount > 99) return m.reply('Jumlah masak harus bilangan bulat antara 1–99.')
	const missing = Object.entries(recipe.ingredients).filter(([item, amount]) => (Number(user[item]) || 0) < amount * rawCount)
	if (missing.length) return m.reply(`Bahan tidak cukup untuk memasak ${rawCount} ${recipe.label}.\nKurang: ${missing.map(([item, amount]) => `${Math.max(0, amount * rawCount - (Number(user[item]) || 0))} ${item}`).join(', ')}.`)

	for (const [item, amount] of Object.entries(recipe.ingredients)) user[item] = (Number(user[item]) || 0) - amount * rawCount
	user[recipe.output] = (Number(user[recipe.output]) || 0) + rawCount
	return conn.reply(m.chat, `🍳 Berhasil memasak *${rawCount} ${recipe.label}*.\nBahan telah dikurangi dari inventory.`, m)
}

handler.help = ['cook <masakan> [jumlah]', 'masak <masakan> [jumlah]']
handler.tags = ['rpg']
handler.register = true
handler.command = /^(masak|cook)$/i
module.exports = handler
