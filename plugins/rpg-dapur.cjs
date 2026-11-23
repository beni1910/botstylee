// Dapur is an inventory/help alias for recipes implemented in rpg-cook.cjs.
// This keeps the legacy plugin filename valid without registering duplicate
// cooking commands or mutating inventory through a second code path.
const handler = async (m, { conn, usedPrefix = '.' }) => conn.reply(m.chat, `Gunakan *${usedPrefix}cook <masakan> [jumlah]* untuk memasak.\nContoh: *${usedPrefix}cook ayambakar 2*`, m)
handler.help = ['dapur']
handler.tags = ['rpg']
handler.command = /^dapur$/i
handler.register = true
module.exports = handler
