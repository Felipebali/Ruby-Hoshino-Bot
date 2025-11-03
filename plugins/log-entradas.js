// 📂 plugins/joinlog.js

function normalizeJid(jid = '') {
  return jid.replace(/@c\.us$/, '@s.whatsapp.net')
}

const ownerNumbers = ['59898719147@s.whatsapp.net', '59896026646@s.whatsapp.net']

const handler = async (m, { conn, command }) => {
  if (!m.isGroup) return conn.sendMessage(m.chat, { text: '❗ Este comando solo funciona en grupos.' })

  const chatData = global.db.data.chats[m.chat] || {}
  if (typeof chatData.joinLog !== 'boolean') chatData.joinLog = true // activo por defecto

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

// before hook para registrar ingresos de miembros
handler.before = async (m, { conn }) => {
  if (!m.isGroup) return
  if (!m.messageStubType) return

  const chatData = global.db.data.chats[m.chat] || {}
  if (chatData.joinLog === false) return

  try {
    // 7 = agregado por admin, 8 = entró por link
    if (m.messageStubType === 7 || m.messageStubType === 8) {
      let user = m.messageStubParameters ? m.messageStubParameters[0] : m.participant
      user = normalizeJid(user)

      let agregadoPor = m.participant && m.participant !== user
        ? await conn.getName(m.participant)
        : 'link de invitación'

      const texto = `🎉 ¡@${user.split('@')[0]} se unió al grupo!\n➕ Agregado por: ${agregadoPor}`
      await conn.sendMessage(m.chat, { text: texto, mentions: [user] })

      // Guardar historial (últimas 20 entradas)
      if (!chatData.joinHistory) chatData.joinHistory = []
      chatData.joinHistory.push({
        fecha: new Date().toLocaleString('es-UY', { timeZone: 'America/Montevideo', hour12: false }),
        user,
        agregadoPor
      })
      if (chatData.joinHistory.length > 20) chatData.joinHistory.shift()

      global.db.data.chats[m.chat] = chatData
    }
  } catch (e) {
    console.error('Error en joinlog.js:', e)
  }
}

export default handler
