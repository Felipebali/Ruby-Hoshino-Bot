import { sticker } from '../lib/sticker.js'
import uploadFile from '../lib/uploadFile.js'
import uploadImage from '../lib/uploadImage.js'
import { webp2png } from '../lib/webp2mp4.js'

let handler = async (m, { conn, args }) => {
    const owners = global.owner.map(o => o[0])
    const senderNumber = m.sender.replace(/[^0-9]/g, '')

    // --- Solo owners pueden usar ---
    if (!owners.includes(senderNumber)) {
        return conn.reply(m.chat, '❌ Solo los owners pueden usar este comando.', m)
    }

    let stiker = false
    let userId = m.sender
    let packstickers = global.db.data.users[userId] || {}
    let texto1 = packstickers.text1 || global.packsticker
    let texto2 = packstickers.text2 || global.packsticker2

    try {
        let q = m.quoted ? m.quoted : m
        let mime = (q.msg || q).mimetype || q.mediaType || ''
        let txt = args.join(' ')

        if (/webp|image|video/g.test(mime) && q.download) {
            if (/video/.test(mime) && (q.msg || q).seconds > 16)
                return conn.reply(m.chat, '❌ El video no puede durar más de *15 segundos*', m)
            let buffer = await q.download()
            await m.react('🧃')

            let marca = txt ? txt.split(/[\u2022|]/).map(part => part.trim()) : [texto1, texto2]
            stiker = await sticker(buffer, false, marca[0], marca[1])
        } else if (args[0] && isUrl(args[0])) {
            let buffer = await sticker(false, args[0], texto1, texto2)
            stiker = buffer
        } else {
            return conn.reply(m.chat, '❌ 𝙍𝙚𝙨𝙥𝙤𝙣𝙙𝙚 𝙖 𝙪𝙣 𝙫𝙞𝙙𝙚𝙤/𝙜𝙞𝙛/𝙞𝙢𝙖𝙜𝙚𝙣 𝙤 𝙚𝙩𝙞𝙦𝙪𝙚𝙩𝙖 𝙪𝙣𝙖 𝙞𝙢𝙖𝙜𝙚𝙣/𝙜𝙞𝙛/𝙫𝙞𝙙𝙚𝙤 𝙥𝙖𝙧𝙖 𝙘𝙤𝙣𝙫𝙚𝙧𝙩𝙞𝙧𝙡𝙤 𝙚𝙣 𝙨𝙩𝙞𝙘𝙠𝙚𝙧.', m)
        }
    } catch (e) {
        await conn.reply(m.chat, '⚠︎ Ocurrió un Error: ' + e.message, m)
        await m.react('✖️')
    } finally {
        if (stiker) {
            conn.sendFile(m.chat, stiker, 'sticker.webp', '', m)
            await m.react('🧃')
        }
    }
}

handler.help = ['sticker']
handler.tags = ['sticker']
handler.command = ['s', 'sticker']
handler.owner = true // Bloquea automáticamente para usuarios que no son owners

export default handler

const isUrl = (text) => {
    return text.match(new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)(jpe?g|gif|png)/, 'gi'))
}
