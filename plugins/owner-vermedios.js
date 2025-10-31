import { downloadContentFromMessage } from '@whiskeysockets/baileys'

const ownerNumbers = ['59898719147@s.whatsapp.net', '59896026646@s.whatsapp.net'] // Dueños

let handler = async (m, { conn }) => {
  try {
    if (!ownerNumbers.includes(m.sender))
      return conn.reply(m.chat, '❌ Este comando solo lo pueden usar los dueños del bot.', m)

    const quoted = m.quoted
    if (!quoted) return conn.reply(m.chat, '🐾 Responde a un mensaje *ViewOnce* (ver una vez) para mostrarlo.', m)

    const viewOnceMsg = quoted.msg?.viewOnceMessageV2 ||
                        quoted.msg?.viewOnceMessage ||
                        quoted.message?.viewOnceMessageV2 ||
                        quoted.message?.viewOnceMessage

    if (!viewOnceMsg) return conn.reply(m.chat, '⚠️ No es un mensaje de ver una vez.', m)

    const innerMsg = viewOnceMsg.message
    const type = Object.keys(innerMsg)[0]
    const mediaMsg = innerMsg[type]

    const mime = mediaMsg.mimetype || ''
    const mediaType = mime.split('/')[0]

    const stream = await downloadContentFromMessage(mediaMsg, mediaType)
    let buffer = Buffer.from([])

    for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk])

    if (mediaType === 'image') {
      await conn.sendMessage(m.chat, { image: buffer, caption: mediaMsg.caption || '' }, { quoted: m })
    } else if (mediaType === 'video') {
      await conn.sendMessage(m.chat, { video: buffer, caption: mediaMsg.caption || '', mimetype: 'video/mp4' }, { quoted: m })
    } else if (mediaType === 'audio') {
      await conn.sendMessage(m.chat, { audio: buffer, mimetype: 'audio/ogg; codecs=opus', ptt: mediaMsg.ptt || false }, { quoted: m })
    } else {
      conn.reply(m.chat, '❌ Tipo de contenido no soportado.', m)
    }

  } catch (e) {
    console.log(e)
    conn.reply(m.chat, '⚠️ Error al intentar obtener el mensaje ViewOnce.', m)
  }
}

handler.command = /^(ver|viewonce|readviewonce)$/i
handler.help = ['verviewonce']
handler.tags = ['owner']
handler.owner = true

export default handler
