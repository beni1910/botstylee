const DAY_MS = 24 * 60 * 60 * 1000
const DURATION_UNITS = {
	d: DAY_MS,
	w: 7 * DAY_MS,
	m: 30 * DAY_MS,
	y: 365 * DAY_MS
}

const helpText = (prefix, command) => `Format: ${prefix}${command} <nomor/@tag> <durasi>\nContoh: ${prefix}${command} 6281234567890 30d atau ${prefix}${command} @tag 2w\nSatuan: d=hari, w=minggu, m=30 hari, y=365 hari.`

const getDisplayName = async (conn, jid, user) => {
	if (user?.name) return user.name
	try {
		return await conn.getName(jid)
	} catch {
		return jid.split('@')[0]
	}
}

const handler = async (m, { conn, text = '', usedPrefix = '.', command = 'addprem' }) => {
	const parts = text.trim().split(/\s+/).filter(Boolean)
	let target = m.mentionedJid?.[0] || m.quoted?.sender || null
	let durationText

	if (target) {
		durationText = parts.find(part => /^\d+[dwmy]?$/i.test(part))
	} else {
		const rawTarget = parts.shift()
		durationText = parts.shift()
		const digits = String(rawTarget || '').replace(/\D/g, '')
		if (digits) target = `${digits}@s.whatsapp.net`
	}

	if (!target || !durationText) return conn.reply(m.chat, helpText(usedPrefix, command), m)

	const match = String(durationText).match(/^(\d+)([dwmy])?$/i)
	if (!match) return conn.reply(m.chat, `Durasi tidak valid.\n${helpText(usedPrefix, command)}`, m)
	const amount = Number(match[1])
	const unit = (match[2] || 'd').toLowerCase()
	const durationMs = amount * DURATION_UNITS[unit]
	if (!Number.isSafeInteger(amount) || amount < 1 || !Number.isSafeInteger(durationMs) || durationMs <= 0) {
		return conn.reply(m.chat, 'Durasi harus bilangan positif dan tidak terlalu besar.', m)
	}

	const user = db.data?.users?.[target]
	if (!user) return conn.reply(m.chat, `Data pengguna ${target.split('@')[0]} belum ada di database. Minta pengguna mengirim pesan ke bot terlebih dahulu.`, m)

	const now = Date.now()
	const previousExpiry = Number(user.expired) || 0
	const baseExpiry = user.premium && previousExpiry > now ? previousExpiry : now
	const newExpiry = baseExpiry + durationMs
	if (!Number.isSafeInteger(newExpiry)) return conn.reply(m.chat, 'Tanggal kedaluwarsa terlalu jauh.', m)

	// Preserve the join-quota rewards used by this bot's premium system.
	if (durationMs <= 7 * DAY_MS) {
		user.limitjoinfree = (Number(user.limitjoinfree) || 0) + 2
	} else if (durationMs <= 14 * DAY_MS) {
		user.limitjoinprem = (Number(user.limitjoinprem) || 0) + 1
	} else {
		user.limitjoinprem = (Number(user.limitjoinprem) || 0) + 2
	}

	user.expired = newExpiry
	user.premium = true
	const expiryText = new Intl.DateTimeFormat('id-ID', { dateStyle: 'full', timeStyle: 'short' }).format(new Date(newExpiry))
	const name = await getDisplayName(conn, target, user)
	await conn.reply(m.chat, `Premium berhasil diberikan kepada *${name}* selama ${amount}${unit}.\nBerlaku sampai: ${expiryText}`, m)
	await conn.sendMessage(target, {
		text: `Premium akunmu telah diaktifkan oleh owner sampai ${expiryText}. Kuota join bot juga telah diperbarui.`
	}).catch(error => conn.logger?.error?.({ err: error }, 'Gagal memberi notifikasi premium'))
}

handler.help = ['addprem <nomor/@tag> <durasi>']
handler.tags = ['owner', 'premium']
handler.command = /^(add|tambah|\+)p(rem)?$/i
handler.owner = true
export default handler
