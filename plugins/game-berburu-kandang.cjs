const animals = [
	['🐂', 'banteng', 'Banteng'],
	['🐅', 'harimau', 'Harimau'],
	['🐘', 'gajah', 'Gajah'],
	['🐐', 'kambing', 'Kambing'],
	['🐼', 'panda', 'Panda'],
	['🐊', 'buaya', 'Buaya'],
	['🐃', 'kerbau', 'Kerbau'],
	['🐮', 'sapi', 'Sapi'],
	['🐒', 'monyet', 'Monyet'],
	['🐗', 'babihutan', 'Babi Hutan'],
	['🐖', 'babi', 'Babi'],
	['🐓', 'ayam', 'Ayam']
]

const handler = async (m, { conn }) => {
	const user = global.db?.data?.users?.[m.sender]
	if (!user) return conn.reply(m.chat, 'Data pengguna belum tersedia. Coba lagi sebentar.', m)

	const inventory = animals
		.map(([emoji, key, label]) => `➡️ ${emoji} = [ ${Number(user[key]) || 0} ] ekor ${label}`)
		.join('\n')
	const message = `*《 KANDANG MU 》*\n\n${inventory}\n\n*${global.author || ''}*`
	return conn.reply(m.chat, message, m)
}

handler.help = ['kandang']
handler.customPrefix = ['kandang']
handler.command = new RegExp

module.exports = handler
