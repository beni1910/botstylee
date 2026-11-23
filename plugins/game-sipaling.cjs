const handler = async (m, { conn, text = '', participants = [], usedPrefix = '.' }) => {
	const subject = String(text).trim().replace(/\s+/g, ' ')
	if (!subject) return m.reply(`Tulis kategori setelah perintah. Contoh: *${usedPrefix}sipaling paling lucu*`)
	const members = [...new Set((participants || []).map(item => item?.id).filter(jid => typeof jid === 'string' && jid.includes('@')))]
	if (!members.length) return conn.reply(m.chat, 'Daftar anggota grup belum tersedia. Coba lagi sebentar.', m)
	const selected = members[Math.floor(Math.random() * members.length)]
	const label = subject.replace(/[\*_~`]/g, '').slice(0, 100)
	return conn.reply(m.chat, `🏆 *Si Paling ${label}*\n\nPemenangnya adalah @${selected.split('@')[0]}!`, m, { mentions: [selected] })
}

handler.help = ['sipaling <kategori>']
handler.tags = ['game']
handler.command = /^sipaling$/i
handler.group = true
module.exports = handler
