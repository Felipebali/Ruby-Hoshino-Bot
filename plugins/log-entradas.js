// 📂 plugins/joinlog.js

function normalizeJid(jid = '') {
  return jid.replace(/@c\.us$/, '@s.whatsapp.net')
}

const ownerNumbers = ['59898719147@s.whatsapp.net', '59896026646@s.whatsapp.net']

const handler = async (m, { conn, command }) => {
  if (!m.isGroup) return conn.sendMessage(m.chat, { text: '❗ Este comando solo funciona en grupos.' })

  const chatData = global.db.data.chats[m.chat] || {}
  if (typeof chatData.joinLog !== 'boolean') chatData.joinLog = true

  if (command === 'joinlog') {
    chatData.joinLog = !chatData.joinLog
    const estado = chatData.joinLog
      ? '✅ *LOG DE ENTRADAS ACTIVADO*'
      : '❌ *LOG DE ENTRADAS DESACTIVADO*'
    const emoji = chatData.joinLog ? '🟢' : '🔴'
    await conn.sendMessage(m.chat, { text: `🎯 ${estado} para este grupo ${emoji}` })
    await conn.sendMessage(m.chat, { react: { text: emoji, key: m.key } })
  }

  if (command === 'joinh') {
    const history = chatData.joinHistory || []
    if (history.length === 0) return conn.sendMessage(m.chat, { text: '📋 No hay historial de ingresos en este grupo.' })

    let texto = '📋 *Historial de Ingresos*\n━━━━━━━━━━━━━━━━━━━━━━━━\n\n'
    texto += history
      .map((h, i) => {
        return `✨ *${i + 1}.* [${h.fecha}]
🎉 @${h.user.split('@')[0]} se unió al grupo
➕ Agregado por: ${h.agregadoPor}
━━━━━━━━━━━━━━━━━━━━━━━━`
      })
      .join('\n')

    await conn.sendMessage(m.chat, { text: texto, mentions: history.flatMap(h => [h.user]) })
  }

  if (command === 'joinclear') {
    chatData.joinHistory = []
    await conn.sendMessage(m.chat, { text: '🗑️ *Historial de ingresos borrado exitosamente.*' })
  }

  global.db.data.chats[m.chat] = chatData
}

handler.command = ['joinlog', 'joinh', 'joinclear']
handler.group = true
handler.admin = false
handler.owner = true

// ===== Plugin de log de entradas real =====
export default async function joinLogger(conn) {
  conn.ev.on('group-participants.update', async (update) => {
    const { id: chatId, participants, action, invoker } = update
    const chatData = global.db.data.chats[chatId] || {}
    if (chatData.joinLog === false) return
    if (action !== 'add') return

    for (let user of participants) {
      const nombre = await conn.getName(user)
      const agregadoPor = invoker ? await conn.getName(invoker) : 'link de invitación'

      // Mensaje al grupo
      await conn.sendMessage(chatId, {
        text: `🎉 ¡@${user.split('@')[0]} se unió al grupo!\n➕ Agregado por: ${agregadoPor}`,
        mentions: invoker ? [user, invoker] : [user]
      })

      // Guardar historial (últimas 20 entradas)
      if (!chatData.joinHistory) chatData.joinHistory = []
      chatData.joinHistory.push({
        fecha: new Date().toLocaleString('es-UY', { timeZone: 'America/Montevideo', hour12: false }),
        user,
        agregadoPor
      })
      if (chatData.joinHistory.length > 20) chatData.joinHistory.shift()

      global.db.data.chats[chatId] = chatData
    }
  })
}
