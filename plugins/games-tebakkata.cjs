const TIMEOUT_MS = 120000
const POINTS = 5000

const handler = async (m, { conn, usedPrefix = '.' }) => {
	conn.tebakkata = conn.tebakkata && typeof conn.tebakkata === 'object' ? conn.tebakkata : {}
	const id = m.chat
	if (conn.tebakkata[id]) {
		return conn.reply(m.chat, 'Masih ada soal Tebak Kata yang belum terjawab di chat ini.', conn.tebakkata[id][0] || m)
	}

	let session
	try {
		const { tebakkata } = await import('@bochilteam/scraper')
		const data = await tebakkata()
		if (!data || typeof data.soal !== 'string' || typeof data.jawaban !== 'string' || !data.jawaban.trim()) {
			throw new Error('Data soal Tebak Kata tidak valid.')
		}

		const caption = [
			data.soal,
			`Timeout: ${TIMEOUT_MS / 1000} detik`,
			`Ketik *${usedPrefix}teka* untuk petunjuk atau *nyerah* untuk menyerah.`,
			`Bonus: ${POINTS} XP`
		].join('\n')
		const question = await conn.sendButton(m.chat, caption, global.author || '', ['Petunjuk', `${usedPrefix}teka`], m)
		session = [question, data, POINTS, null, usedPrefix]
		conn.tebakkata[id] = session
		session[3] = setTimeout(async () => {
			if (conn.tebakkata?.[id] !== session) return
			delete conn.tebakkata[id]
			await conn.sendButton(m.chat, `Waktu habis!\nJawabannya adalah *${data.jawaban}*`, global.author || '', ['Main lagi', `${usedPrefix}tebakkata`], question || m)
				.catch(error => conn.logger?.error?.({ err: error }, 'Gagal mengirim hasil Tebak Kata'))
		}, TIMEOUT_MS)
		return question
	} catch (error) {
		if (session && conn.tebakkata[id] === session) delete conn.tebakkata[id]
		conn.logger?.error?.({ err: error, chat: m.chat }, 'Gagal memulai Tebak Kata')
		return conn.reply(m.chat, 'Soal Tebak Kata gagal dimulai. Coba lagi sebentar.', m)
	}
}

handler.help = ['tebakkata']
handler.tags = ['game']
handler.command = /^tebakkata$/i
module.exports = handler
