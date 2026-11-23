// The .cjs plugin is the canonical implementation; disable this legacy duplicate
// so one challenge command cannot create competing rooms.
const handler = async m => m.reply('Gunakan perintah suitpvp untuk menantang pemain.')
handler.tags = ['game']
handler.help = ['suitpvp @tag', 'suit2 @tag']
handler.command = /^suit(pvp|2)$/i
handler.disabled = true
export default handler
