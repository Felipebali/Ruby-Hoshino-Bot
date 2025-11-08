// 📂 plugins/pareja.js — Sistema de Parejas FelixCat 💞 (v3 estable)

let propuestas = {} // { 'usuario': 'destinatario', 'destinatario': 'usuario' }

let handler = async (m, { conn, command, args }) => {
  const chat = global.db.data.chats[m.chat] || {}
  if (chat.games === false)
    return m.reply('🎮 Los juegos están desactivados.\n\nUsá *.juegos* para activarlos 🔓')

  global.db.data.parejas = global.db.data.parejas || {}
  const parejas = global.db.data.parejas

  const user = m.sender
  const parejaActual = parejas[user]

  // 💌 PROPONER
  if (command === 'pareja') {
    if (!m.isGroup) return m.reply('❌ Este comando solo funciona en grupos.')
    if (parejaActual)
      return m.reply(
        `💞 Ya estás en una relación con @${parejaActual.split('@')[0]}.\nUsá *.terminar* para finalizarla.`,
        null,
        { mentions: [parejaActual] }
      )

    const target = m.mentionedJid?.[0]
    if (!target)
      return m.reply('💌 Mencioná a alguien para proponerle ser tu pareja.\n\nEjemplo: *.pareja @usuario*')
    if (target === user) return m.reply('😹 No podés ser tu propia pareja.')
    if (parejas[target])
      return m.reply(`💔 @${target.split('@')[0]} ya está en una relación.`, null, { mentions: [target] })

    // guardar propuesta doble
    propuestas[user] = target
    propuestas[target] = user

    await conn.sendMessage(
      m.chat,
      {
        text: `💌 *@${user.split('@')[0]}* le propuso ser su pareja a *@${target.split('@')[0]}* 💘\n\n❤️ Si aceptás, escribí *.acepto*\n💔 Si no, escribí *.rechazo*`,
        mentions: [user, target]
      },
      { quoted: m }
    )
    return
  }

  // 💞 ACEPTAR
  if (command === 'acepto') {
    const parejaPendiente = propuestas[user]
    if (!parejaPendiente)
      return m.reply('💭 No tenés ninguna propuesta pendiente.')

    parejas[user] = parejaPendiente
    parejas[parejaPendiente] = user

    delete propuestas[user]
    delete propuestas[parejaPendiente]

    await conn.sendMessage(
      m.chat,
      {
        text: `💞 *¡Felicidades!* 💞\n@${user.split('@')[0]} y @${parejaPendiente.split('@')[0]} ahora son pareja oficial 😻💍`,
        mentions: [user, parejaPendiente]
      },
      { quoted: m }
    )
    return
  }

  // 💔 RECHAZAR
  if (command === 'rechazo') {
    const parejaPendiente = propuestas[user]
    if (!parejaPendiente)
      return m.reply('💭 No tenés ninguna propuesta pendiente.')

    delete propuestas[user]
    delete propuestas[parejaPendiente]

    await conn.sendMessage(
      m.chat,
      {
        text: `💔 @${user.split('@')[0]} rechazó la propuesta de @${parejaPendiente.split('@')[0]} 😿`,
        mentions: [user, parejaPendiente]
      },
      { quoted: m }
    )
    return
  }

  // 💔 TERMINAR
  if (command === 'terminar' || command === 'divorcio') {
    if (!parejaActual)
      return m.reply('😿 No estás en ninguna relación.')

    const parejaId = parejaActual
    delete parejas[user]
    delete parejas[parejaId]

    await conn.sendMessage(
      m.chat,
      {
        text: `💔 *Ruptura confirmada*\n@${user.split('@')[0]} y @${parejaId.split('@')[0]} decidieron tomar caminos separados 😢`,
        mentions: [user, parejaId]
      },
      { quoted: m }
    )
    return
  }
}

handler.help = ['pareja', 'acepto', 'rechazo', 'terminar']
handler.tags = ['fun', 'romance']
handler.command = /^(pareja|acepto|rechazo|terminar|divorcio)$/i
handler.group = true

export default handler
