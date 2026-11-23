const WIN_BONUS = 2000
const PLAY_BONUS = 1000
const MOVE = /^([1-9]|nyerah|menyerah|surrender)$/i

const handler = m => m
handler.before = async function (m) {
	if (!m || typeof m.text !== 'string') return false
	const text = m.text.trim().toLowerCase()
	if (!MOVE.test(text)) return false

	this.game = this.game && typeof this.game === 'object' ? this.game : {}
	const room = Object.values(this.game).find(candidate => candidate?.id?.startsWith('tictactoe-') && candidate.state === 'PLAYING' && candidate.game && [candidate.game.playerX, candidate.game.playerO].includes(m.sender))
	if (!room) return false

	const playerX = room.game.playerX
	const playerO = room.game.playerO
	const isSurrender = !/^[1-9]$/.test(text)
	if (!isSurrender && m.sender !== room.game.currentTurn) {
		await m.reply('Belum giliranmu.')
		return true
	}

	let winner = null
	let isTie = false
	if (isSurrender) {
		winner = m.sender === playerX ? playerO : playerX
	} else {
		const result = room.game.turn(m.sender === playerO, Number(text) - 1)
		if (result !== 1) {
			const errors = { '-3': 'Game sudah berakhir.', '-2': 'Bukan giliranmu.', '-1': 'Posisi tidak valid.', 0: 'Kotak itu sudah terisi.' }
			await m.reply(errors[result] || 'Langkah tidak valid.')
			return true
		}
		if (room.game.winner) winner = room.game.winner
		else if (room.game.turns >= 9) isTie = true
	}

	const symbols = { X: '❌', O: '⭕', 1: '1️⃣', 2: '2️⃣', 3: '3️⃣', 4: '4️⃣', 5: '5️⃣', 6: '6️⃣', 7: '7️⃣', 8: '8️⃣', 9: '9️⃣' }
	const cells = room.game.render().map(value => symbols[value] || '⬜')
	const board = `${cells.slice(0, 3).join('')}\n${cells.slice(3, 6).join('')}\n${cells.slice(6).join('')}`

	if (winner || isTie) {
		clearTimeout(room.waitTimeout)
		clearTimeout(room.turnTimeout)
		room.state = 'ENDED'
		const users = global.db?.data?.users || {}
		for (const jid of [playerX, playerO]) if (users[jid]) users[jid].exp = (Number(users[jid].exp) || 0) + PLAY_BONUS
		if (winner && users[winner]) users[winner].exp = (Number(users[winner].exp) || 0) + WIN_BONUS
	}

	const status = winner ? `Pemenang: @${winner.split('@')[0]} (+${PLAY_BONUS + WIN_BONUS} XP).` : isTie ? `Seri! Kedua pemain mendapat +${PLAY_BONUS} XP.` : `Giliran @${room.game.currentTurn.split('@')[0]}.`
	const output = `${board}\n\n${status}\n❌ @${playerX.split('@')[0]}\n⭕ @${playerO.split('@')[0]}${winner || isTie ? '' : '\nKetik *nyerah* untuk menyerah.'}\nRoom: ${room.id}`
	const mentions = [playerX, playerO, ...(winner ? [winner] : !isTie ? [room.game.currentTurn] : [])]
	for (const chat of new Set([room.x, room.o].filter(Boolean))) {
		await this.sendMessage(chat, { text: output, mentions }, { quoted: m }).catch(error => this.logger?.error?.({ err: error }, 'Gagal mengirim papan Tic-Tac-Toe'))
	}
	if (winner || isTie) delete this.game[room.id]
	return true
}

module.exports = handler
