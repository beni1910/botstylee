const TIMEOUT_MS = 60_000
const LEVELS = {
	normal: { min: 1, max: 10, reward: 400 },
	hard: { min: 1, max: 20, reward: 1500 },
	extreme: { min: 1, max: 30, reward: 3000 },
	crazy: { min: 1, max: 50, reward: 5000 }
}

const handler = async (m, { conn, text = '' }) => {
	conn.tebakangka = conn.tebakangka && typeof conn.tebakangka === 'object' ? conn.tebakangka : {}
	const id = m.sender
	const current = conn.tebakangka[id]
	if (current) return conn.reply(m.chat, 'Selesaikan permainan tebak angka yang sedang berjalan terlebih dahulu.', current.msg || m)

	const requested = String(text).trim().toLowerCase() || 'normal'
	const level = LEVELS[requested]
	if (!level) return conn.reply(m.chat, `Level tidak tersedia. Pilih: ${Object.keys(LEVELS).join(', ')}.`, m)

	const json = {
		target: Math.floor(Math.random() * (level.max - level.min + 1)) + level.min,
		attempt: 4,
		min: level.min,
		max: level.max,
		level: requested,
		reward: level.reward
	}
	const caption = [
		'*[ TEBAK ANGKA ]*',
		'Silakan tebak angka yang dipikirkan bot.',
		`Petunjuk angka: ${json.min}–${json.max}`,
		`Level: ${json.level} | Hadiah: ${json.reward} MP`,
		'Kesempatan: 4 | Waktu: 60 detik',
		'Kirim angka sebagai pesan biasa atau ketik *nyerah*.'
	].join('\n')

	const session = { json, poin: json.reward, chat: m.chat, msg: null, tot: null }
	conn.tebakangka[id] = session
	try {
		session.msg = await conn.reply(m.chat, caption, m)
		session.tot = setTimeout(async () => {
			if (conn.tebakangka?.[id] !== session) return
			delete conn.tebakangka[id]
			await conn.reply(session.chat, `Waktu habis. Angka yang benar: *${json.target}*`, session.msg || m).catch(error => conn.logger?.error?.({ err: error }, 'Tebak angka timeout reply failed'))
		}, TIMEOUT_MS)
		return session.msg
	} catch (error) {
		delete conn.tebakangka[id]
		throw error
	}
}

handler.help = ['tebakangka [normal|hard|extreme|crazy]']
handler.tags = ['game']
handler.command = /^tebakangka$/i
export default handler
