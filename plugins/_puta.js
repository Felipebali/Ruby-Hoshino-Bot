let handler = async (m, { conn, text }) => {
  // Si cita un mensaje, toma ese usuario; si no, toma el mencionado; y si no, responde error
  let target = m.quoted ? m.quoted.sender : m.mentionedJid && m.mentionedJid[0]
  if (!target) return m.reply('💋 Etiquetá o citá a alguien para calcular su porcentaje de "puta".')

  // Nombre de la persona
  let name = await conn.getName(target)

  // Porcentaje aleatorio entre 0 y 100
  let porcentaje = Math.floor(Math.random() * 101)

  // Mensaje de respuesta
  let msg = `💄 *${name}* tiene un *${porcentaje}% de puta* 💅`

  // Enviar respuesta
  conn.reply(m.chat, msg, m, { mentions: [target] })
}

handler.help = ['puta']
handler.tags = ['fun']
handler.command = /^puta$/i

export default handler 
