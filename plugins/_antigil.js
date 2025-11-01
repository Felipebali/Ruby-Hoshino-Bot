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
  const texto = (m.text || '').toLowerCase()
  const chat = m.chat
  const sender = m.sender

  // Detectar si el mensaje parece un bloque citado (comienza con "> ", "›", o contiene "@")
  const esCita = texto.startsWith('>') || texto.startsWith('›') || texto.includes('> @') || texto.includes('⁩ será')

  if (esCita && frasesProhibidas.some(f => texto.includes(f))) {
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

handler.command = new RegExp // no es comando, escucha todo
export default handler
