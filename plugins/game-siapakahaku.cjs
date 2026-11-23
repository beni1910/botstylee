const TIMEOUT_MS = 120000
const POINTS = 5000

const handler = async (m, { conn, usedPrefix = '.' }) => {
	conn.siapakahaku = conn.siapakahaku && typeof conn.siapakahaku === 'object' ? conn.siapakahaku : {}
	const id = m.chat
	if (conn.siapakahaku[id]) {
		return conn.reply(m.chat, 'Masih ada soal Siapakah Aku yang belum terjawab di chat ini.', conn.siapakahaku[id][0] || m)
	}

	let session
	try {
		const { siapakahaku } = await import('@bochilteam/scraper')
		const data = await siapakahaku()
		if (!data || typeof data.soal !== 'string' || typeof data.jawaban !== 'string' || !data.jawaban.trim()) {
			throw new Error('Data soal Siapakah Aku tidak valid.')
		}

		const caption = [
			`Siapakah aku? ${data.soal}`,
			`Timeout: ${TIMEOUT_MS / 1000} detik`,
			`Ketik *${usedPrefix}who* untuk petunjuk atau *nyerah* untuk menyerah.`,
			`Bonus: ${POINTS} XP`
		].join('\n')
		const question = await conn.sendButton(m.chat, caption, global.author || '', ['Petunjuk', `${usedPrefix}who`], m)
		session = [question, data, POINTS, null, usedPrefix]
		conn.siapakahaku[id] = session
		session[3] = setTimeout(async () => {
			if (conn.siapakahaku?.[id] !== session) return
			delete conn.siapakahaku[id]
			await conn.sendButton(m.chat, `Waktu habis!\nJawabannya adalah *${data.jawaban}*`, global.author || '', ['Main lagi', `${usedPrefix}siapakahaku`], question || m)
				.catch(error => conn.logger?.error?.({ err: error }, 'Gagal mengirim hasil Siapakah Aku'))
		}, TIMEOUT_MS)
		return question
	} catch (error) {
		if (session && conn.siapakahaku[id] === session) delete conn.siapakahaku[id]
		conn.logger?.error?.({ err: error, chat: m.chat }, 'Gagal memulai Siapakah Aku')
		return conn.reply(m.chat, 'Soal Siapakah Aku gagal dimulai. Coba lagi sebentar.', m)
	}
}

handler.help = ['siapakahaku']
handler.tags = ['game']
handler.command = /^siapakahaku$/i
module.exports = handler
