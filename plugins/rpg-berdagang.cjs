const COOLDOWN_MS = 8 * 60 * 60 * 1000
const STAKE = 5000
const MAX_PROFIT = 5000
const formatRemaining = ms => `${Math.floor(ms / 3600000)} jam ${Math.floor(ms / 60000) % 60} menit`

const handler = async (m, { conn }) => {
	const target = m.mentionedJid?.[0] || m.quoted?.sender
	if (!target) return m.reply('Tag atau balas pesan partner dagang. Contoh: .berdagang @tag')
	if (target === m.sender) return m.reply('Kamu tidak bisa berdagang dengan dirimu sendiri.')
	const users = global.db?.data?.users
	const trader = users?.[m.sender]
	const partner = users?.[target]
	if (!trader || !partner) return m.reply('Data kamu atau partner belum tersedia di database.')
	const now = Date.now()
	const traderRemaining = COOLDOWN_MS - (now - (Number(trader.lastdagang) || 0))
	const partnerRemaining = COOLDOWN_MS - (now - (Number(partner.lastdagang) || 0))
	if (traderRemaining > 0) return m.reply(`Kamu baru saja berdagang. Coba lagi dalam ${formatRemaining(traderRemaining)}.`)
	if (partnerRemaining > 0) return m.reply(`Partner baru saja berdagang. Coba lagi dalam ${formatRemaining(partnerRemaining)}.`)
	if ((Number(trader.money) || 0) < STAKE || (Number(partner.money) || 0) < STAKE) return m.reply(`Kalian berdua harus memiliki modal minimal ${STAKE} money.`)

	// Both players contribute the same stake; settle immediately so a process restart
	// cannot lose pending timer-based payouts or duplicate a payout.
	const profit = Math.floor(Math.random() * (MAX_PROFIT + 1))
	trader.money = (Number(trader.money) || 0) - STAKE + STAKE + profit
	partner.money = (Number(partner.money) || 0) - STAKE + STAKE + profit
	trader.lastdagang = now
	partner.lastdagang = now
	const traderName = await conn.getName(m.sender).catch(() => m.sender.split('@')[0])
	const partnerName = await conn.getName(target).catch(() => target.split('@')[0])
	return conn.sendMessage(m.chat, {
		text: `🤝 *Dagang selesai!*\n${traderName} dan ${partnerName} mendapat profit masing-masing +${profit} money.\nModal ${STAKE} money telah dikembalikan. Cooldown: 8 jam.`,
		mentions: [m.sender, target]
	}, { quoted: m })
}

handler.help = ['berdagang @tag']
handler.tags = ['rpg']
handler.command = /^berdagang$/i
handler.register = true
module.exports = handler
