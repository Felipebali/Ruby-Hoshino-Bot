let handler = async (m, { conn, text, groupMetadata }) => {
  if (!m.isGroup) return conn.reply(m.chat, '❌ Este comando solo funciona en grupos.', m)

  // Tomar participantes del grupo
  let participants = groupMetadata.participants.map(p => p.id)
  if (participants.length === 0) return conn.reply(m.chat, '❌ No hay participantes para sortear.', m)

  // Opcional: permitir mencionar usuarios específicos
  let mentions = m.mentionedJid.length > 0 ? m.mentionedJid : participants

  // Elegir uno al azar
  let ganador = mentions[Math.floor(Math.random() * mentions.length)]
  let nombreGanador = await conn.getName(ganador)

  await conn.sendMessage(
    m.chat,
    { text: `🎉 ¡El ganador del sorteo es @${ganador.split('@')[0]}! 🎉`, mentions: [ganador] },
    { quoted: m }
  )
}

handler.help = ['sortear']
handler.tags = ['grupo']
handler.command = ['sortear']
export default handler 
