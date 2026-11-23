const handler = async (m, { conn, usedPrefix = '.' }) => {
	const sessions = conn.caklontong
	const session = sessions?.[m.chat]
	if (!Array.isArray(session) || !session[1] || typeof session[1].jawaban !== 'string') {
		return conn.reply(m.chat, 'Tidak ada soal Cak Lontong yang aktif di chat ini.', m)
	}

	const answer = session[1].jawaban.trim()
	const clue = answer.replace(/[aiueo]/gi, '_')
	return conn.reply(m.chat, `Petunjuk: ${clue}`, m)
}

handler.help = ['calo']
handler.tags = ['game']
handler.command = /^calo$/i
handler.limit = true

module.exports = handler
