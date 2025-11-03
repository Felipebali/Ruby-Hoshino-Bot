function normalizeJid(jid = '') {
  return jid.replace(/@c\.us$/, '@s.whatsapp.net')
}

const ownerNumbers = ['59898719147@s.whatsapp.net', '59896026646@s.whatsapp.net']

const handler = async (m, { conn, usedPrefix, command }) => {
  if (!m.isGroup) return m.reply('❗ Este comando solo funciona en grupos.')

  const chatData = global.db.data.chats[m.chat] || {}
  if (!chatData.adminLog) chatData.adminLog = true // activo por defecto

  if (command === 'adminlog') {
    chatData.adminLog = !chatData.adminLog
    const estado = chatData.adminLog ? '✅ *activados*' : '❌ *desactivados*'
    await m.reply(`Logs de admin ${estado} para este grupo.`)
  }

  if (command === 'adminh') {
    const history = chatData.adminHistory || []
    if (history.length === 0) return m.reply('📋 No hay historial de cambios de admin en este grupo.')

    let texto = '*📋 Historial de cambios de administración:*\n\n'
    texto += history.map((h, i) => `${i + 1}. [${h.fecha}] ${h.rango} @${h.actor.split('@')[0]} ${h.action} a @${h.target.split('@')[0]}`).join('\n')

    await conn.sendMessage(m.chat, { text: texto, mentions: history.flatMap(h => [h.actor, h.target]) })
  }

  global.db.data.chats[m.chat] = chatData
}

handler.command = ['adminlog', 'adminh']
handler.group = true
handler.admin = true

// before hook para registrar cambios de admin
handler.before = async (m, { conn }) => {
  if (!m.isGroup) return
  if (!m.messageStubType) return

  const chatData = global.db.data.chats[m.chat] || {}
  if (chatData.adminLog === false) return

  try {
    let action = ''
    let actor = m.participant || m.key?.participant || m.sender || 'Desconocido'
    actor = normalizeJid(actor)
    let target = m.messageStubParameters ? m.messageStubParameters[0] : null
    if (!target) return

    switch (m.messageStubType) {
      case 29: action = 'promovió a admin'; break
      case 30: action = 'degradó de admin'; break
      default: return
    }

    const isOwner = ownerNumbers.includes(actor)
    const rango = isOwner ? '👑 Dueño' : '🛡️ Administrador'
    const emoji = isOwner ? '👑' : '⚙️'

    const texto = `*Cambio de administración detectado*\n\n${rango} @${actor.split('@')[0]} *${action}* a @${target.split('@')[0]}`
    await conn.sendMessage(m.chat, { text: texto, mentions: [actor, target] })
    await conn.sendMessage(m.chat, { react: { text: emoji, key: m.key } })

    // Guardar historial en la base de datos
    if (!chatData.adminHistory) chatData.adminHistory = []
    chatData.adminHistory.push({
      fecha: new Date().toLocaleString('es-UY', { timeZone: 'America/Montevideo', hour12: false }),
      actor,
      target,
      action,
      rango
    })

    global.db.data.chats[m.chat] = chatData

  } catch (e) {
    console.error('Error en grupo-adminlog.js:', e)
  }
}

export default handler
