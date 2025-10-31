// plugins/grupo-bienvenida_despedida.js
// Todo en uno, compatible con Ruby-Hoshino-Bot

let handler = async (m, { conn, isAdmin }) => {
  if (!m.isGroup) return
  if (!isAdmin) return m.reply('❌ Solo admins pueden usar este comando.')

  if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {}
  const chat = global.db.data.chats[m.chat]

  if (m.text.toLowerCase().includes('bienvenida')) {
    chat.bienvenida = !chat.bienvenida
    return m.reply(`🎉 Bienvenida *${chat.bienvenida ? 'activada ✅' : 'desactivada ❌'}*`)
  }

  if (m.text.toLowerCase().includes('despedida')) {
    chat.despedida = !chat.despedida
    return m.reply(`👋 Despedida *${chat.despedida ? 'activada ✅' : 'desactivada ❌'}*`)
  }
}

handler.command = /^(bienvenida|despedida)$/i
handler.group = true
handler.admin = true

export default handler

// --- Evento de grupo ---
export async function before(m, { conn }) {
  if (!m.isGroup) return
  const chatData = global.db.data.chats[m.chat] || {}

  if (!m.isBaileys && m.messageStubType) {
    const stub = m.messageStubType
    const participantes = m.messageStubParameters || []

    for (const user of participantes) {
      const jid = user
      const grupo = (await conn.groupMetadata(m.chat)).subject

      // Bienvenida
      if ((stub === 28 || stub === 26) && chatData.bienvenida) {
        const msgs = [
          `🎉 ¡Bienvenido/a @${jid.split('@')[0]} al grupo *${grupo}*!`,
          `👋 @${jid.split('@')[0]}, nos alegra tenerte en *${grupo}*!`,
          `🐾 @${jid.split('@')[0]} se ha unido. ¡Pásalo genial en *${grupo}*!`
        ]
        await conn.sendMessage(m.chat, { text: msgs[Math.floor(Math.random() * msgs.length)], mentions: [jid] })
      }

      // Despedida
      if ((stub === 29 || stub === 27) && chatData.despedida) {
        const msgs = [
          `😢 Adiós @${jid.split('@')[0]}! Te extrañaremos en el grupo.`,
          `👋 @${jid.split('@')[0]} ha salido del grupo. ¡Que te vaya bien!`,
          `💔 @${jid.split('@')[0]} ha abandonado el grupo.`
        ]
        await conn.sendMessage(m.chat, { text: msgs[Math.floor(Math.random() * msgs.length)], mentions: [jid] })
      }
    }
  }
}
