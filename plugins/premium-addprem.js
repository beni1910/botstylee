const handler = async (m, { conn, text = '', usedPrefix = '.', command = 'addprem' }) => {
	const parts = text.trim().split(/\s+/).filter(Boolean)
	let target = m.mentionedJid?.[0] || m.quoted?.sender
	let durationText

	if (target) {
		durationText = parts.find(part => /\d/.test(part))
	} else {
		const rawTarget = parts.shift()
		durationText = parts.shift()
		if (rawTarget) {
			const digits = rawTarget.replace(/\D/g, '')
			if (digits) target = `${digits}@s.whatsapp.net`
		}
	}

	if (!target || !durationText) {
		return conn.reply(m.chat, `Format: ${usedPrefix}${command} <nomor/@tag> <durasi>\nContoh: ${usedPrefix}${command} 6281234567890 30d atau ${usedPrefix}${command} @tag 2w`, m)
	}

	const durationMatch = durationText.match(/^(\d+)(d|w|m|y)?$/i)
	if (!durationMatch || Number(durationMatch[1]) < 1) {
		return conn.reply(m.chat, 'Durasi harus bilangan positif dengan satuan d (hari), w (minggu), m (30 hari), atau y (365 hari).', m)
	}

	const amount = Number(durationMatch[1])
	const unit = (durationMatch[2] || 'd').toLowerCase()
	const unitMs = { d: 86400000, w: 7 * 86400000, m: 30 * 86400000, y: 365 * 86400000 }
	const durationMs = amount * unitMs[unit]
	if (!Number.isSafeInteger(durationMs) || durationMs <= 0) return conn.reply(m.chat, 'Durasi terlalu besar atau tidak valid.', m)

	const users = db.data?.users
	const user = users?.[target]
	if (!user) return conn.reply(m.chat, `Data pengguna ${target} belum ada di database. Pengguna harus mengirim pesan ke bot terlebih dahulu.`, m)

	const now = Date.now()
	const currentExpiry = user.premium && Number(user.expired) > now ? Number(user.expired) : now
	user.expired = currentExpiry + durationMs
	user.premium = true

	const expiryText = new Intl.DateTimeFormat('id-ID', { dateStyle: 'full', timeStyle: 'short' }).format(new Date(user.expired))
	const name = await conn.getName(target).catch(() => user.name || target.split('@')[0])
	await conn.reply(m.chat, `Premium berhasil diberikan kepada *${name}* selama ${amount}${unit}.\nBerlaku sampai: ${expiryText}`, m)
	await conn.sendMessage(target, { text: `Premium akunmu telah diaktifkan sampai ${expiryText}.` }).catch(error => conn.logger?.error?.({ err: error }, 'Gagal memberi notifikasi premium'))
}

handler.help = ['addprem <nomor/@tag> <durasi>']
handler.tags = ['owner', 'premium']
handler.command = /^(add|tambah|\+)p(rem)?$/i
handler.owner = true
export default handler
