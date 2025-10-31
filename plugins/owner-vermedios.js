import { downloadContentFromMessage } from '@whiskeysockets/baileys'

const ownerNumbers = ['59898719147@s.whatsapp.net', '59896026646@s.whatsapp.net']

let handler = async (m, { conn }) => {
  try {
    if (!ownerNumbers.includes(m.sender))
      return conn.reply(m.chat, '❌ Solo los dueños pueden usar este comando.', m)

    const q = m.quoted
    if (!q) return conn.reply(m.chat, '🐾 Responde a una foto/video/audio *ver una vez* para recuperarlo.', m)

    // Detectar estructura ViewOnce (según versión de Baileys)
    const viewOnceMsg =
      q.msg?.viewOnceMessageV2 ||
      q.msg?.viewOnceMessageV2Extension ||
      q.msg?.viewOnceMessage ||
      q.message?.viewOnceMessageV2 ||
      q.message?.viewOnceMessageV2Extension ||
      q.message?.viewOnceMessage

    if (!viewOnceMsg) return conn.reply(m.chat, '⚠️ El mensaje citado no es de tipo *ver una vez* o ya fue abierto.', m)

    // Obtener contenido interno
    const inner = viewOnceMsg.message || {}
    const tipo = Object.keys(inner)[0]
    const mediaMsg = inner[tipo]

    if (!mediaMsg) return conn.reply(m.chat, '❌ No se pudo obtener el contenido del mensaje.', m)

    // Descargar contenido
    const stream = await downloadContentFromMessage(mediaMsg, tipo.replace('Message', ''))
    let buffer = Buffer.from([])
    for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk])

    // reenviar según tipo
    if (tipo === 'imageMessage') {
      await conn.sendMessage(m.chat, { image: buffer, caption: mediaMsg.caption || '📸 Recuperado de ViewOnce' }, { quoted: m })
    } else if (tipo === 'videoMessage') {
      await conn.sendMessage(m.chat, { video: buffer, caption: mediaMsg.caption || '🎥 Recuperado de ViewOnce', mimetype: 'video/mp4' }, { quoted: m })
    } else if (tipo === 'audioMessage') {
      await conn.sendMessage(m.chat, { audio: buffer, mimetype: 'audio/ogg; codecs=opus', ptt: mediaMsg.ptt || false }, { quoted: m })
    } else {
      conn.reply(m.chat, '❌ Tipo de contenido no reconocido.', m)
    }

  } catch (e) {
    console.error(e)
    conn.reply(m.chat, '⚠️ No se pudo recuperar el mensaje (posiblemente ya fue eliminado o Baileys no lo descifró).', m)
  }
}

handler.command = /^(recuperar|veruna|readviewonce|viewonce|recovery)$/i
handler.help = ['recuperar']
handler.tags = ['owner']
handler.owner = true

export default handler
