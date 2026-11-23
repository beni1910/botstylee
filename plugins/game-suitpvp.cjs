const TIMEOUT_MS = 60_000
const WIN_POINTS = 2000
const LOSE_POINTS = 500

const handler = async (m, { conn, usedPrefix = '.' }) => {
	conn.suit = conn.suit && typeof conn.suit === 'object' ? conn.suit : {}
	const opponent = m.mentionedJid?.[0]
	if (!opponent) return m.reply(`Tag lawan untuk menantangnya.\nContoh: ${usedPrefix}suitpvp @6281234567890`)
	if (opponent === m.sender) return m.reply('Kamu tidak bisa menantang diri sendiri.')

	const active = Object.values(conn.suit).find(room => room?.id?.startsWith('suit_') && [room.p, room.p2].includes(m.sender))
	if (active) return m.reply('Selesaikan permainan suit sebelumnya terlebih dahulu.')
	const opponentActive = Object.values(conn.suit).find(room => room?.id?.startsWith('suit_') && [room.p, room.p2].includes(opponent))
	if (opponentActive) return m.reply('Lawan yang kamu tantang sedang bermain suit dengan orang lain.')

	const id = `suit_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
	const text = `*TANTANGAN SUIT PvP*\n@${m.sender.split('@')[0]} menantang @${opponent.split('@')[0]}.\n\n@${opponent.split('@')[0]}, ketik *terima* untuk menerima atau *tolak* untuk menolak. Tantangan berlaku 60 detik.`
	const sent = await conn.sendMessage(m.chat, { text, mentions: [m.sender, opponent] }, { quoted: m })
	const room = {
		id,
		chat: sent,
		p: m.sender,
		p2: opponent,
		asal: m.chat,
		status: 'wait',
		poin: WIN_POINTS,
		poin_lose: LOSE_POINTS,
		timeout: TIMEOUT_MS,
		waktu: null
	}
	room.waktu = setTimeout(async () => {
		if (conn.suit[id] !== room) return
		delete conn.suit[id]
		await conn.sendMessage(room.asal, { text: 'Waktu tantangan suit habis. Permainan dibatalkan.' }).catch(() => {})
	}, TIMEOUT_MS)
	conn.suit[id] = room
	return sent
}

handler.tags = ['game']
handler.help = ['suitpvp @tag', 'suit2 @tag']
handler.command = /^suit(pvp|2)$/i
handler.group = true
handler.level = 20
module.exports = handler
