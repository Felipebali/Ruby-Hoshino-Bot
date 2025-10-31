import { downloadContentFromMessage } from '@whiskeysockets/baileys'

const ownerNumbers = ['59898719147@s.whatsapp.net', '59896026646@s.whatsapp.net'] // dueños del bot

let handler = async (m, { conn }) => {
  try {
    if (!ownerNumbers.includes(m.sender))
      return conn.reply(m.chat, '❌ Este comando solo lo pueden usar los dueños del bot.', m)

    const quoted = m.quoted
    if (!quoted) return conn.reply(m.chat, '🐾 Responde a un mensaje *ver una vez* (ViewOnce) para recuperarlo.', m)

    // Buscar estructura ViewOnce (según tipo de cifrado)
    const viewOnce = quoted.msg?.viewOnceMessageV2 ||
                     quoted.msg?.viewOnceMessage ||
                     quoted.message?.viewOnceMessageV2 ||
                     quoted.message?.viewOnceMessage

    if (!viewOnce) return conn.reply(m.chat, '⚠️ El mensaje citado no es de tipo *ver una vez*.', m)

    const msg = viewOnce.message
    const tipo = Object.keys(msg)[0]
    const media = msg[tipo]

    const mime = media.mimetype || ''
    const tipoArchivo = mime.split('/')[0]
    const stream = await downloadContentFromMessage(media, tipoArchivo)

    let buffer = Buffer.from([])
    for await (const chunk of stream) {
      buffer = Buffer.concat([buffer, chunk])
    }

    // reenviar según el tipo de contenido
    if (tipoArchivo === 'image') {
      await conn.sendMessage(m.chat, { image: buffer, caption: media.caption || '📸 Recuperado de ViewOnce' }, { quoted: m })
    } else if (tipoArchivo === 'video') {
      await conn.sendMessage(m.chat, { video: buffer, caption: media.caption || '🎥 Recuperado de ViewOnce', mimetype: 'video/mp4' }, { quoted: m })
    } else if (tipoArchivo === 'audio') {
      await conn.sendMessage(m.chat, { audio: buffer, mimetype: 'audio/ogg; codecs=opus', ptt: media.ptt || false }, { quoted: m })
    } else {
      conn.reply(m.chat, '❌ Tipo de contenido no soportado.', m)
    }

  } catch (e) {
    console.error(e)
    conn.reply(m.chat, '⚠️ Error al intentar recuperar el contenido.', m)
  }
}

handler.help = ['recuperar', 'veruna']
handler.tags = ['owner']
handler.command = /^(recuperar|veruna|recovery|recover)$/i
handler.owner = true

export default handler
