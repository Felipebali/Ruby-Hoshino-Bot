// plugins/anti-mensaje-gris.js

const frasesProhibidas = [
  'será baneado',
  'sera baneado',
  'será expulsado',
  'sera expulsado',
  'baneado temporalmente',
  'baneada temporalmente',
  'baneado por spam',
  'baneada por spam',
  'expulsado por spam',
  'será baneada temporalmente',
  'sera baneada temporalmente'
]

let advertencias = {}

const handler = async (m, { conn }) => {
  const chat = m.chat
  const sender = m.sender

  // Obtener texto del mensaje principal
  const texto = (m.text || m.message?.conversation || '').toLowerCase()

  // Obtener texto del mensaje citado (si existe)
  let textoCitado = ''
  if (m.quoted && m.quoted.text) {
    textoCitado = m.quoted.text.toLowerCase()
  } else if (m.message?.extendedTextMessage?.contextInfo?.quotedMessage?.conversation) {
    textoCitado = m.message.extendedTextMessage.contextInfo.quotedMessage.conversation.toLowerCase()
  }

  // Revisar si el mensaje citado contiene frases prohibidas
  const esProhibido = frasesProhibidas.some(f => textoCitado.includes(f) || texto.includes(f))

  if (esProhibido) {
    advertencias[sender] = (advertencias[sender] || 0) + 1

    if (advertencias[sender] === 1) {
      return conn.sendMessage(chat, {
        text: `🚫 *Mensaje prohibido detectado.*\nNo puedes usar advertencias o baneos manuales.\nSi lo vuelves a hacer, podrías ser expulsado.`,
      }, { quoted: m })
    }

    if (advertencias[sender] === 2) {
      return conn.sendMessage(chat, {
        text: `⚠️ *Advertencia final para @${sender.split('@')[0]}.*\nUna más y serás expulsado del grupo.`,
        mentions: [sender]
      }, { quoted: m })
    }

    if (advertencias[sender] >= 3) {
      advertencias[sender] = 0
      try {
        await conn.groupParticipantsUpdate(chat, [sender], 'remove')
        await conn.sendMessage(chat, {
          text: `🛑 *${m.pushName || 'El usuario'} ha sido expulsado automáticamente por usar mensajes prohibidos.*`
        })
      } catch {
        await conn.sendMessage(chat, {
          text: `❌ No pude expulsar a @${sender.split('@')[0]}, pero tiene baneos bloqueados.`,
          mentions: [sender]
        })
      }
    }
  }
}

handler.command = new RegExp // escucha todo
export default handler
