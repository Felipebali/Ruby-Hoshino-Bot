// 📂 plugins/pareja.js
let propuestas = {}

let handler = async (m, { conn, args, participants }) => {
  const chat = global.db.data.chats[m.chat] || {}
  if (chat.games === false) return m.reply('❌ Los mini-juegos están desactivados en este chat.')

  if (!m.isGroup) return m.reply('👥 Este comando solo funciona en grupos.')

  const user = m.sender
  const mentioned = m.mentionedJid?.[0]
  if (!mentioned) return m.reply('💞 Usa el comando así: *.pareja @usuario*')

  if (mentioned === user) return m.reply('😹 No puedes emparejarte contigo mismo.')

  if (propuestas[m.chat]) return m.reply('⏳ Ya hay una propuesta pendiente en este grupo. Espera que termine.')

  const userTag = '@' + user.split('@')[0]
  const mentionTag = '@' + mentioned.split('@')[0]

  // Guardar la propuesta activa
  propuestas[m.chat] = { proposer: user, target: mentioned }

  await conn.sendMessage(m.chat, {
    text: `💘 *Propuesta de pareja en curso*\n\n${userTag} quiere ser pareja de ${mentionTag} 💞\n\nResponde con *.acepto* o *.rechazo* dentro de 30 segundos.`,
    mentions: [user, mentioned]
  })

  // Esperar 30 segundos por respuesta
  setTimeout(() => {
    if (propuestas[m.chat]) {
      conn.sendMessage(m.chat, {
        text: `⏰ Tiempo agotado. ${mentionTag} no respondió 😿\nPropuesta cancelada.`,
        mentions: [mentioned]
      })
      delete propuestas[m.chat]
    }
  }, 30000)
}

handler.command = ['pareja']
handler.group = true

export default handler

// 📂 plugins/pareja-respuesta.js
let handler2 = async (m, { conn }) => {
  const chat = m.chat
  const propuesta = propuestas[chat]
  if (!propuesta) return

  const user = m.sender

  if (user !== propuesta.target) return // Solo la persona mencionada puede responder

  if (/^\.acepto$/i.test(m.text)) {
    const proposerTag = '@' + propuesta.proposer.split('@')[0]
    const targetTag = '@' + user.split('@')[0]
    await conn.sendMessage(chat, {
      text: `💞 *¡Confirmado!* 💞\n${proposerTag} y ${targetTag} ahora son pareja oficial 😻💍`,
      mentions: [propuesta.proposer, user]
    })
    delete propuestas[chat]
  }

  if (/^\.rechazo$/i.test(m.text)) {
    const proposerTag = '@' + propuesta.proposer.split('@')[0]
    const targetTag = '@' + user.split('@')[0]
    await conn.sendMessage(chat, {
      text: `💔 ${targetTag} rechazó a ${proposerTag} 😿\nNo hubo match esta vez...`,
      mentions: [propuesta.proposer, user]
    })
    delete propuestas[chat]
  }
}

handler2.customPrefix = /^(\.acepto|\.rechazo)$/i
handler2.command = new RegExp()

export { handler2 as parejaRespuesta }
