const TIMEOUT_MS = 120_000
const POINTS = 5000

const handler = async (m, { conn, usedPrefix = '.' }) => {
	conn.tebakgambar = conn.tebakgambar && typeof conn.tebakgambar === 'object' ? conn.tebakgambar : {}
	const id = m.chat
	if (conn.tebakgambar[id]) return conn.reply(m.chat, 'Masih ada soal Tebak Gambar yang belum selesai di chat ini.', conn.tebakgambar[id][0] || m)

	let session
	try {
		const { tebakgambar } = await import('@bochilteam/scraper')
		const data = await tebakgambar()
		if (!data || typeof data.jawaban !== 'string' || !data.jawaban.trim() || !data.img) throw new Error('Data soal Tebak Gambar tidak valid.')
		const buttons = [['Petunjuk', `${usedPrefix}hint`], ['Menyerah', 'menyerah']]
		const caption = [
			'*Tebak Gambar*',
			typeof data.deskripsi === 'string' && data.deskripsi.trim() ? data.deskripsi.trim() : 'Tebak gambar berikut!',
			`Waktu: ${TIMEOUT_MS / 1000} detik | Hadiah: ${POINTS} XP`,
			`Balas soal ini dengan jawabanmu, atau ketik *${usedPrefix}hint* untuk petunjuk.`
		].join('\n')
		const question = await conn.sendButton(m.chat, caption, global.author || '', data.img, buttons, m)
		session = [question, data, POINTS, null, usedPrefix]
		conn.tebakgambar[id] = session
		session[3] = setTimeout(async () => {
			if (conn.tebakgambar?.[id] !== session) return
			delete conn.tebakgambar[id]
			await conn.sendButton(m.chat, `Waktu habis!\nJawabannya: *${data.jawaban}*`, global.author || '', null, [['Main lagi', `${usedPrefix}tebakgambar`]], question || m)
				.catch(error => conn.logger?.error?.({ err: error }, 'Gagal mengirim hasil Tebak Gambar'))
		}, TIMEOUT_MS)
		return question
	} catch (error) {
		if (session && conn.tebakgambar[id] === session) delete conn.tebakgambar[id]
		conn.logger?.error?.({ err: error, chat: m.chat }, 'Gagal memulai Tebak Gambar')
		return conn.reply(m.chat, 'Soal Tebak Gambar gagal dimulai. Coba lagi sebentar.', m)
	}
}

handler.help = ['tebakgambar']
handler.tags = ['game']
handler.command = /^tebakgambar$/i
module.exports = handler
