// plugins/grupo-bienvenida_despedida.js
// Sistema combinado de bienvenida y despedida — compatible con ES Modules (Ruby-Hoshino-Bot)

let handler = async (m, { conn, isAdmin }) => {
  if (!m.isGroup) return m.reply('❗ Este comando solo funciona en grupos.')
  if (!isAdmin) return m.reply('❌ Solo los administradores pueden usar este comando.')

  if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {}
  const chat = global.db.data.chats[m.chat]

  const command = m.text.toLowerCase()

  if (command.includes('bienvenida')) {
    chat.bienvenida = !chat.bienvenida
    return m.reply(`🎉 Bienvenida *${chat.bienvenida ? 'activada ✅' : 'desactivada ❌'}* en este grupo.`)
  }

  if (command.includes('despedida')) {
    chat.despedida = !chat.despedida
    return m.reply(`👋 Despedida *${chat.despedida ? 'activada ✅' : 'desactivada ❌'}* en este grupo.`)
  }
}

handler.command = /^(bienvenida|despedida)$/i
handler.group = true
handler.admin = true

export default handler

// 🪄 Evento automático de entradas y salidas
export async function setupWelcomeBye(conn) {
  conn.ev.on('group-participants.update', async (update) => {
    const chat = update.id
    const chatData = global.db.data.chats[chat] || {}
    const grupo = (await conn.groupMetadata(chat)).subject

    for (const user of update.participants) {
      const userId = user

      // Bienvenida
      if (update.action === 'add' && chatData.bienvenida) {
        const mensajes = [
          `🎉 ¡Bienvenido/a @${userId.split('@')[0]} al grupo *${grupo}*!`,
          `👋 @${userId.split('@')[0]}, nos alegra tenerte en *${grupo}*!`,
          `🐾 @${userId.split('@')[0]} se ha unido. ¡Pásalo genial en *${grupo}*!`
        ]
        const texto = mensajes[Math.floor(Math.random() * mensajes.length)]
        await conn.sendMessage(chat, { text: texto, mentions: [userId] })
      }

      // Despedida
      if (update.action === 'remove' && chatData.despedida) {
        const mensajes = [
          `😢 Adiós @${userId.split('@')[0]}! Te extrañaremos en el grupo.`,
          `👋 @${userId.split('@')[0]} ha salido del grupo. ¡Que te vaya bien!`,
          `💔 @${userId.split('@')[0]} ha abandonado el grupo.`
        ]
        const texto = mensajes[Math.floor(Math.random() * mensajes.length)]
        await conn.sendMessage(chat, { text: texto, mentions: [userId] })
      }
    }
  })
}
