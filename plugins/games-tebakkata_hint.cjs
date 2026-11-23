const handler = async (m, { conn }) => {
	const session = conn.tebakkata?.[m.chat]
	if (!Array.isArray(session) || typeof session[1]?.jawaban !== 'string') {
		return conn.reply(m.chat, 'Tidak ada soal Tebak Kata yang aktif di chat ini.', m)
	}

	const answer = session[1].jawaban.trim()
	const clue = [...answer].map((char, index) => /[aiueo]/i.test(char) && index % 2 === 0 ? '_' : char).join('')
	return conn.reply(m.chat, `Petunjuk: ${clue}`, m)
}

handler.help = ['teka']
handler.tags = ['game']
handler.command = /^teka$/i
handler.limit = true
module.exports = handler
