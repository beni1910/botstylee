const DAY_MS = 24 * 60 * 60 * 1000
const DURATION_UNITS = { d: DAY_MS, w: 7 * DAY_MS, m: 30 * DAY_MS, y: 365 * DAY_MS }

function parseDuration(value) {
	const match = String(value || '').trim().match(/^(\d+)([dwmy])?$/i)
	if (!match) return null
	const amount = Number(match[1])
	const unit = (match[2] || 'd').toLowerCase()
	const milliseconds = amount * DURATION_UNITS[unit]
	if (!Number.isSafeInteger(amount) || amount <= 0 || !Number.isSafeInteger(milliseconds) || milliseconds <= 0) return null
	return { amount, unit, milliseconds }
}

function getTarget(m, parts) {
	const mentioned = m.mentionedJid?.[0] || m.quoted?.sender
	if (mentioned) return { jid: mentioned, duration: parts.find(part => /^\d+[dwmy]?$/i.test(part)) }

	// Accept both legacy `number 30` and `number|30d` syntax, as well as `number 30d`.
	const input = parts.join(' ')
	const legacy = input.match(/^([\d+\-\s()]+)\s*\|\s*(\d+[dwmy]?)$/i)
	const tokens = legacy ? [legacy[1], legacy[2]] : input.split(/\s+/)
	const number = String(tokens.shift() || '').replace(/\D/g, '')
	return number ? { jid: `${number}@s.whatsapp.net`, duration: tokens.find(part => /^\d+[dwmy]?$/i.test(part)) } : { jid: null, duration: null }
}

const helpText = (prefix, command) => `Format: ${prefix}${command} <nomor/@tag> <durasi>\nContoh: ${prefix}${command} 6281234567890 30d atau ${prefix}${command} @tag 2w\nSatuan: d=hari, w=minggu, m=30 hari, y=365 hari.`

async function displayName(conn, jid, user) {
	if (typeof user?.name === 'string' && user.name.trim()) return user.name.trim()
	try {
		return await conn.getName(jid)
	} catch {
		return jid.split('@')[0]
	}
}

const handler = async (m, { conn, text = '', usedPrefix = '.', command = 'addprem' }) => {
	const targetInfo = getTarget(m, String(text).trim().split(/\s+/).filter(Boolean))
	if (!targetInfo.jid || !targetInfo.duration) return conn.reply(m.chat, helpText(usedPrefix, command), m)

	const duration = parseDuration(targetInfo.duration)
	if (!duration) return conn.reply(m.chat, `Durasi tidak valid.\n${helpText(usedPrefix, command)}`, m)

	const user = db.data?.users?.[targetInfo.jid]
	if (!user || typeof user !== 'object') {
		return conn.reply(m.chat, `Data pengguna ${targetInfo.jid.split('@')[0]} belum ada di database. Minta pengguna mengirim pesan ke bot terlebih dahulu.`, m)
	}

	const now = Date.now()
	const previousExpiry = Number(user.expired) || 0
	const baseExpiry = user.premium && previousExpiry > now ? previousExpiry : now
	const expiry = baseExpiry + duration.milliseconds
	if (!Number.isSafeInteger(expiry)) return conn.reply(m.chat, 'Tanggal kedaluwarsa terlalu jauh.', m)

	// Keep the quota rewards already used by the bot's Premium flow.
	if (duration.milliseconds <= 7 * DAY_MS) {
		user.limitjoinfree = (Number(user.limitjoinfree) || 0) + 2
	} else if (duration.milliseconds <= 14 * DAY_MS) {
		user.limitjoinprem = (Number(user.limitjoinprem) || 0) + 1
	} else {
		user.limitjoinprem = (Number(user.limitjoinprem) || 0) + 2
	}

	user.expired = expiry
	user.premium = true
	const expiryLabel = new Intl.DateTimeFormat('id-ID', { dateStyle: 'full', timeStyle: 'short' }).format(new Date(expiry))
	const name = await displayName(conn, targetInfo.jid, user)
	await conn.reply(m.chat, `Premium berhasil diberikan kepada *${name}* selama ${duration.amount}${duration.unit}.\nStatus: Aktif\nBerlaku sampai: ${expiryLabel}`, m)
	await conn.sendMessage(targetInfo.jid, {
		text: `Premium akunmu telah diaktifkan oleh owner sampai ${expiryLabel}. Kuota Premium bot juga telah diperbarui.`
	}).catch(error => conn.logger?.error?.({ err: error, jid: targetInfo.jid }, 'Gagal mengirim notifikasi Premium'))
}

handler.help = ['addprem <nomor/@tag> <durasi>']
handler.tags = ['owner', 'premium']
handler.command = /^(add|tambah|\+)p(rem)?$/i
handler.owner = true
export default handler
