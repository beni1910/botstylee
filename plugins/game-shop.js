const PETS = {
	ayam: { emoji: '🐓', price: 10, production: [100, 250, 350, 450, 600], upgradePrices: [15, 20, 25, 30] },
	kucing: { emoji: '🐈', price: 20, production: [200, 350, 450, 500, 700], upgradePrices: [20, 25, 30, 35] },
	kambing: { emoji: '🐐', price: 30, production: [300, 450, 550, 600, 800], upgradePrices: [30, 35, 40, 45] },
	sapi: { emoji: '🐂', price: 40, production: [400, 550, 650, 700, 900], upgradePrices: [40, 45, 50, 55] },
	kuda: { emoji: '🐎', price: 50, production: [500, 650, 750, 800, 1000], upgradePrices: [50, 55, 60, 65] }
}
const INTERVAL_MS = 30 * 60 * 1000

function getInventory(user) {
	if (!Array.isArray(user.petInventory)) user.petInventory = Object.keys(PETS).map(petname => ({ petname, level: 0, production: 0, active: false }))
	for (const petname of Object.keys(PETS)) {
		if (!user.petInventory.some(pet => pet?.petname === petname)) {
			user.petInventory.push({ petname, level: 0, production: 0, active: false })
		}
	}
	return user.petInventory
}

function collectProduction(user, inventory) {
	const now = Date.now()
	const last = Number(user.petLastCollect) || now
	const active = inventory.find(pet => pet.active && pet.level > 0)
	const intervals = Math.floor(Math.max(0, now - last) / INTERVAL_MS)
	const earned = active ? intervals * (Number(active.production) || 0) : 0
	if (earned > 0) user.mp = (Number(user.mp) || 0) + earned
	user.petLastCollect = now
	return earned
}

const handler = async (m, { command = '', args = [], usedPrefix = '.' }) => {
	const user = db.data?.users?.[m.sender]
	if (!user) return m.reply('Data pengguna belum tersedia. Coba lagi sebentar.')
	const inventory = getInventory(user)
	const earned = collectProduction(user, inventory)
	const action = String(command).toLowerCase()
	const name = String(args[0] || '').toLowerCase()
	const pet = PETS[name]
	const petData = inventory.find(item => item.petname === name)
	const prefix = usedPrefix || '.'
	const status = earned ? `\nProduksi pet diklaim otomatis: +${earned} MP.` : ''

	if (action === 'petshop') {
		if (!pet) {
			const list = Object.entries(PETS).map(([key, value]) => `${value.emoji} *${key}*: ${value.price} coin — ${value.production[0]} MP/30 menit, maksimal ${value.production[4]} MP`).join('\n')
			return m.reply(`*PET STORE*\n${list}\n\nBeli: *${prefix}petshop ayam*${status}`)
		}
		if (petData.level > 0) return m.reply(`Kamu sudah memiliki pet *${name}*.${status}`)
		const coins = Number(user.coin) || 0
		if (coins < pet.price) return m.reply(`Coin kurang ${pet.price - coins}. Saldo kamu: ${coins}.${status}`)
		user.coin = coins - pet.price
		petData.level = 1
		petData.production = pet.production[0]
		user.petLastCollect = Date.now()
		return m.reply(`${pet.emoji} Pet *${name}* berhasil dibeli. Aktifkan dengan *${prefix}setpet ${name}*.${status}`)
	}

	if (!pet) return m.reply(`Nama pet tidak dikenal. Pilih: ${Object.keys(PETS).join(', ')}.${status}`)
	if (action === 'setpet') {
		if (petData.level <= 0) return m.reply(`Kamu belum memiliki *${name}*. Beli dengan *${prefix}petshop ${name}*.${status}`)
		for (const item of inventory) item.active = item.petname === name
		user.petLastCollect = Date.now()
		return m.reply(`${pet.emoji} Pet *${name}* aktif, produksi ${petData.production} MP setiap 30 menit.${status}`)
	}

	if (action === 'petup' || action === 'uppet') {
		if (petData.level <= 0) return m.reply(`Kamu belum memiliki *${name}*. Beli dengan *${prefix}petshop ${name}*.${status}`)
		if (petData.level >= 5) return m.reply(`Pet *${name}* sudah level maksimum.${status}`)
		const nextLevel = petData.level + 1
		const price = pet.upgradePrices[nextLevel - 2]
		const coins = Number(user.coin) || 0
		if (coins < price) return m.reply(`Coin kurang ${price - coins}. Saldo kamu: ${coins}.${status}`)
		user.coin = coins - price
		petData.level = nextLevel
		petData.production = pet.production[nextLevel - 1]
		return m.reply(`${pet.emoji} Pet *${name}* naik ke level ${nextLevel}; produksi ${petData.production} MP/30 menit.${status}`)
	}

	return m.reply(`Gunakan ${prefix}petshop, ${prefix}setpet <nama>, atau ${prefix}petup <nama>.${status}`)
}

handler.help = ['petshop [nama]', 'setpet <nama>', 'petup <nama>']
handler.tags = ['game']
handler.command = ['petshop', 'setpet', 'petup', 'uppet']
handler.level = 25
export default handler
