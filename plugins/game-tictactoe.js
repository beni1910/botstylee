import TicTacToe from '../lib/tictactoe.js'

const renderBoard = game => {
	const symbols = { X: '❌', O: '⭕', 1: '1️⃣', 2: '2️⃣', 3: '3️⃣', 4: '4️⃣', 5: '5���⃣', 6: '6️⃣', 7: '7️⃣', 8: '8️⃣', 9: '9️⃣' }
	const cells = game.render().map(value => symbols[value] || '⬜')
	return `${cells.slice(0, 3).join('')}\n${cells.slice(3, 6).join('')}\n${cells.slice(6).join('')}`
}

const sendRoomBoard = async (conn, room, quoted) => {
	const text = `Room: ${room.id}\n${renderBoard(room.game)}\n\nGiliran: @${room.game.currentTurn.split('@')[0]}\n❌ @${room.game.playerX.split('@')[0]}\n⭕ @${room.game.playerO.split('@')[0]}\nKetik angka 1–9 untuk melangkah atau *nyerah* untuk menyerah.`
	for (const chat of new Set([room.x, room.o].filter(Boolean))) {
		await conn.sendMessage(chat, { text, mentions: [room.game.playerX, room.game.playerO, room.game.currentTurn] }, quoted ? { quoted } : undefined)
	}
}

const handler = async (m, { conn, usedPrefix = '.', command = 'ttt', text = '' }) => {
	conn.game = conn.game && typeof conn.game === 'object' ? conn.game : {}
	const rooms = Object.values(conn.game)
	const current = rooms.find(room => room?.id?.startsWith('tictactoe-') && room.game && [room.game.playerX, room.game.playerO].includes(m.sender))
	if (current) return conn.reply(m.chat, 'Kamu masih berada di game Tic-Tac-Toe.', m)

	const name = text.trim()
	const waiting = rooms.find(room => room?.id?.startsWith('tictactoe-') && room.state === 'WAITING' && room.game.playerX !== m.sender && (name ? room.name === name : !room.name))
	if (waiting) {
		clearTimeout(waiting.waitTimeout)
		waiting.o = m.chat
		waiting.game.playerO = m.sender
		waiting.state = 'PLAYING'
		waiting.turnTimeout = setTimeout(async () => {
			if (conn.game?.[waiting.id] !== waiting) return
			delete conn.game[waiting.id]
			for (const chat of new Set([waiting.x, waiting.o].filter(Boolean))) await conn.sendMessage(chat, { text: `Room ${waiting.id} kedaluwarsa karena tidak ada langkah.` }).catch(() => {})
		}, 5 * 60 * 1000)
		await conn.reply(m.chat, 'Partner ditemukan! Game dimulai.', m)
		await sendRoomBoard(conn, waiting, m)
		return
	}

	const id = `tictactoe-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
	const room = { id, x: m.chat, o: '', name: name || null, game: new TicTacToe(m.sender, 'pending'), state: 'WAITING', waitTimeout: null, turnTimeout: null }
	room.waitTimeout = setTimeout(async () => {
		if (conn.game?.[id] !== room || room.state !== 'WAITING') return
		delete conn.game[id]
		await conn.sendMessage(room.x, { text: `Room ${id} kedaluwarsa karena tidak ada lawan bergabung.` }).catch(() => {})
	}, 2 * 60 * 1000)
	conn.game[id] = room
	const hint = name ? `\nLawan dapat bergabung dengan *${usedPrefix}${command} ${name}*.` : `\nLawan dapat bergabung dengan *${usedPrefix}${command}*.`
	return conn.reply(m.chat, `Room Tic-Tac-Toe dibuat: *${id}*. Menunggu lawan selama 2 menit.${hint}`, m)
}

handler.help = ['tictactoe [nama-room]', 'ttt [nama-room]']
handler.tags = ['game']
handler.command = /^(tictactoe|ttt)$/i
handler.level = 12
export default handler
