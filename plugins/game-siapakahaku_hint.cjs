const handler = async (m, { conn }) => {
	const session = conn.siapakahaku?.[m.chat]
	if (!Array.isArray(session) || typeof session[1]?.jawaban !== 'string') {
		return conn.reply(m.chat, 'Tidak ada soal Siapakah Aku yang aktif di chat ini.', m)
	}

	const answer = session[1].jawaban.trim()
	const clue = [...answer].map((char, index) => /[\p{L}\p{N}]/u.test(char) && index % 2 === 1 ? '_' : char).join('')
	return conn.reply(m.chat, `Petunjuk: ${clue}`, m)
}

handler.help = ['who']
handler.tags = ['game']
handler.command = /^who$/i
handler.limit = true
module.exports = handler
