const fish = [
	['🦀', 'kepiting', 'Kepiting'],
	['🦞', 'lobster', 'Lobster'],
	['🦐', 'udang', 'Udang'],
	['🦑', 'cumi', 'Cumi'],
	['🐙', 'gurita', 'Gurita'],
	['🐡', 'buntal', 'Buntal'],
	['🐠', 'dory', 'Dory'],
	['🐟', 'ikan', 'Ikan'],
	['🐬', 'lumba', 'Lumba-lumba'],
	['🐳', 'paus', 'Paus'],
	['🦈', 'hiu', 'Hiu'],
	['🐋', 'orca', 'Orca']
]

const handler = async (m, { conn }) => {
	const user = global.db?.data?.users?.[m.sender]
	if (!user) return conn.reply(m.chat, 'Data pengguna belum tersedia. Coba lagi sebentar.', m)

	const inventory = fish
		.map(([emoji, key, label]) => `➡️ ${emoji} = [ ${Number(user[key]) || 0} ] ekor ${label}`)
		.join('\n')
	const message = `*《 KOLAM MU 》*\n\n${inventory}\n\n*${global.author || ''}*`
	return conn.reply(m.chat, message, m)
}

handler.help = ['kolam']
handler.customPrefix = ['kolam']
handler.command = new RegExp

module.exports = handler
