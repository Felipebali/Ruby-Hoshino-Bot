import { downloadContentFromMessage } from '@whiskeysockets/baileys'

// Números de dueños
const ownerNumbers = ['59898719147@s.whatsapp.net', '59896026646@s.whatsapp.net']

let handler = async (m, { conn }) => {
    try {
        // Verificar si el usuario es owner
        if (!ownerNumbers.includes(m.sender)) 
            return conn.reply(m.chat, '❌ Este comando solo puede ser usado por los dueños del bot.', m)

        let quoted = m.quoted
        if (!quoted) return conn.reply(m.chat, '⚠️ Responde a un mensaje *ViewOnce* (de imagen, video o audio).', m)

        // Detectar si es un mensaje ViewOnce
        let viewOnceMsg = quoted.message?.viewOnceMessageV2 || quoted.message?.viewOnceMessage || null
        if (!viewOnceMsg) return conn.reply(m.chat, '❌ No es un mensaje ViewOnce.', m)

        // Obtener tipo de mensaje (imagen, video o audio)
        const inner = viewOnceMsg.message
        const type = Object.keys(inner)[0]
        const media = inner[type]

        const mime = media.mimetype || ''
        const stream = await downloadContentFromMessage(media, mime.split('/')[0])
        let buffer = Buffer.from([])

        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk])
        }

        // Enviar según el tipo de contenido
        if (mime.includes('image')) {
            await conn.sendMessage(m.chat, { image: buffer, caption: media.caption || '' }, { quoted: m })
        } else if (mime.includes('video')) {
            await conn.sendMessage(m.chat, { video: buffer, caption: media.caption || '', mimetype: 'video/mp4' }, { quoted: m })
        } else if (mime.includes('audio')) {
            await conn.sendMessage(m.chat, { audio: buffer, mimetype: 'audio/ogg; codecs=opus', ptt: media.ptt || false }, { quoted: m })
        } else {
            return conn.reply(m.chat, '❌ Tipo de contenido no compatible.', m)
        }

    } catch (e) {
        console.error(e)
        return conn.reply(m.chat, '⚠️ Error al intentar ver el contenido ViewOnce.', m)
    }
}

handler.help = ['verviewonce', 'viewonce', 'ver']
handler.tags = ['owner', 'tools']
handler.command = /^(ver|viewonce|readviewonce)$/i
handler.owner = true // Solo dueños

export default handler
