const FOODS = {
	ayamgoreng: { label: 'Ayam Goreng', stamina: 20 }, ayambakar: { label: 'Ayam Bakar', stamina: 20 }, oporayam: { label: 'Opor Ayam', stamina: 20 },
	rendang: { label: 'Rendang', stamina: 30 }, steak: { label: 'Steak', stamina: 30 }, gulai: { label: 'Gulai Ayam', stamina: 25 }, gulaiayam: { label: 'Gulai Ayam', stamina: 25 },
	babipanggang: { label: 'Babi Panggang', stamina: 25 }, soda: { label: 'Soda', stamina: 20 }, vodka: { label: 'Vodka', stamina: 25 }, sushi: { label: 'Sushi', stamina: 20 }, roti: { label: 'Roti', stamina: 15 },
	gadogado: { label: 'Gado-gado', stamina: 50 }, jagungbakar: { label: 'Jagung Bakar', stamina: 20 }, kentanggoreng: { label: 'Kentang Goreng', stamina: 20 }, suplabu: { label: 'Sup Labu', stamina: 20 }, tumiskangkung: { label: 'Tumis Kangkung', stamina: 20 }, popcorn: { label: 'Pop Corn', stamina: 20 }
}
const FOODS_LIST = Object.entries(FOODS).filter(([key]) => key !== 'gulaiayam').map(([key, food]) => `• ${key} — ${food.label} (+${food.stamina} stamina)`).concat(['• bandage — memulihkan 25 health', '• ganja — memulihkan 90 health']).join('\n')

const handler = async (m, { conn, args = [], usedPrefix = '.' }) => {
	const user = global.db?.data?.users?.[m.sender]
	if (!user) return m.reply('Data pemain belum tersedia.')
	const item = String(args[0] || '').toLowerCase()
	if (!item) return m.reply(`*Menu makan*\n${FOODS_LIST}\n\nContoh: ${usedPrefix}eat roti 2`)
	const quantity = args[1] == null ? 1 : Number(args[1])
	if (!Number.isSafeInteger(quantity) || quantity < 1 || quantity > 99) return m.reply('Jumlah harus bilangan bulat antara 1–99.')

	if (item === 'bandage' || item === 'ganja') {
		const health = Number(user.health) || 0
		if (health >= 100) return m.reply('Health kamu sudah penuh.')
		const inventory = Number(user[item]) || 0
		if (inventory < quantity) return m.reply(`${item} tidak cukup. Kamu punya ${inventory}.`)
		const restore = item === 'bandage' ? 25 : 90
		const restored = Math.min(100 - health, restore * quantity)
		user[item] = inventory - quantity
		user.health = health + restored
		return conn.reply(m.chat, `Menggunakan ${quantity} ${item}. Health +${restored} (sekarang ${user.health}/100).`, m)
	}

	const food = FOODS[item]
	if (!food || item === 'gulaiayam') {
		const canonical = item === 'gulaiayam' ? 'gulai' : item
		if (!FOODS[canonical]) return m.reply(`Makanan tidak dikenal.\n${FOODS_LIST}`)
	}
	const key = item === 'gulaiayam' ? 'gulai' : item
	const stamina = Number(user.stamina) || 0
	if (stamina >= 100) return m.reply('Stamina kamu sudah penuh.')
	const inventory = Number(user[key]) || 0
	if (inventory < quantity) return m.reply(`Persediaan ${food.label} tidak cukup. Kamu punya ${inventory}.`)
	const restored = Math.min(100 - stamina, food.stamina * quantity)
	user[key] = inventory - quantity
	user.stamina = stamina + restored
	return conn.reply(m.chat, `Nyam nyam! Makan ${quantity} ${food.label}. Stamina +${restored} (sekarang ${user.stamina}/100).`, m)
}

handler.help = ['eat <makanan> [jumlah]', 'makan <makanan> [jumlah]']
handler.tags = ['rpg']
handler.register = true
handler.command = /^(eat|makan)$/i
module.exports = handler
