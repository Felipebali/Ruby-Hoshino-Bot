// 🐾 FelixCat_Bot - AutoKick si no es admin (chequeo automático cada 1 min)
import { delay } from '@whiskeysockets/baileys'

let handler = async (m, { conn }) => {
  if (!m.isGroup) return // solo en grupos

  try {
    const botNumber = conn.user.id.split(':')[0] + '@s.whatsapp.net'
    const metadata = await conn.groupMetadata(m.chat)
    const botInfo = metadata.participants.find(p => p.id === botNumber)

    if (!botInfo?.admin) {
      await conn.sendMessage(m.chat, { text: '😿 Ya no soy admin, así que me autokickeo...' })
      await delay(2000)
      await conn.groupParticipantsUpdate(m.chat, [botNumber], 'remove')
      console.log(`[FelixCat_Bot] Me autokickeo del grupo "${metadata.subject}" (${m.chat}) por no tener admin.`)
    }
  } catch (e) {
    console.log('Error en autokick-check:', e)
  }
}

// 🕒 Ejecutar cada 60 segundos cuando el bot recibe mensajes
handler.all = async (m, { conn }) => {
  if (!m.isGroup) return
  if (Math.random() < 0.1) { // revisa aleatoriamente (10 % de los mensajes)
    await handler(m, { conn })
  }
}

export default handler
