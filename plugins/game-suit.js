const choices = ['batu', 'gunting', 'kertas']
const beats = { batu: 'gunting', gunting: 'kertas', kertas: 'batu' }
const label = value => value[0].toUpperCase() + value.slice(1)

const handler = async (m, { text = '', usedPrefix = '.' }) => {
	const choice = text.trim().toLowerCase()
	if (!choices.includes(choice)) {
		return m.reply(`Pilihan: batu, gunting, atau kertas.\nContoh: *${usedPrefix}suit batu*`)
	}
	const user = db.data?.users?.[m.sender]
	if (!user) return m.reply('Data pengguna belum tersedia.')
	const balance = Number(user.mp) || 0
	const stake = 1000
	if (balance < stake) return m.reply(`MP tidak cukup. Minimal saldo untuk bermain: ${stake} MP.`)

	const computer = choices[Math.floor(Math.random() * choices.length)]
	if (choice === computer) {
		return m.reply(`*Seri!*\nKamu: ${label(choice)}\nBot: ${label(computer)}\nMP tidak berubah.`)
	}
	if (beats[choice] === computer) {
		user.mp = balance + 1500
		return m.reply(`*Kamu menang!*\nKamu: ${label(choice)}\nBot: ${label(computer)}\nHadiah: +1.500 MP.`)
	}
	user.mp = Math.max(0, balance - 900)
	return m.reply(`*Kamu kalah.*\nKamu: ${label(choice)}\nBot: ${label(computer)}\nMP berkurang 900.`)
}

handler.help = ['suit <gunting|batu|kertas>']
handler.tags = ['game']
handler.level = 15
handler.command = /^suit$/i
export default handler
