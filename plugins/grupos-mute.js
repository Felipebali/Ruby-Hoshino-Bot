// 📂 plugins/mute.js
function normalizeJid(jid = '') {
  jid = jid.trim()
  const num = jid.replace(/\D/g, '')
  if (!num) return null
  return `${num}@s.whatsapp.net`
}

let mutedUsers = new Set()

let handler = async (m, { conn, command }) => {
  if (!m.isGroup) return m.reply('❌ Este comando solo funciona en grupos.')

  // ✅ Obtener metadata del grupo
  let groupMetadata
  try {
    groupMetadata = await conn.groupMetadata(m.chat)
  } catch {
    return m.reply('⚠️ No se pudo obtener la información del grupo.')
  }

  // 🧠 Asegurarse de que los IDs estén en formato correcto
  const admins = groupMetadata.participants
    .filter(p => p.admin)
    .map(p => normalizeJid(p.id))

  const senderJid = normalizeJid(m.sender)

  // 🔍 Depuración opcional (puedes quitar esto)
  console.log('Admins del grupo:', admins)
  console.log('Tú eres:', senderJid)

  // 🚫 Verificación segura
  if (!admins.includes(senderJid)) {
    return m.reply('🚫 Solo los administradores del grupo pueden usar este comando.')
  }

  // 🎯 Obtener usuario objetivo
  let userJid = null
  if (m.quoted?.sender) userJid = normalizeJid(m.quoted.sender)
  else if (m.mentionedJid?.length) userJid = normalizeJid(m.mentionedJid[0])
  else if (m.text) {
    const num = m.text.match(/\d{5,}/)?.[0]
    if (num) userJid = normalizeJid(num)
  }

  if (!userJid) return m.reply('⚠️ Debes citar, mencionar o escribir el número del usuario.')

  // 🚷 No se puede mutear a otro admin
  if (admins.includes(userJid)) {
    return m.reply(`⚠️ No puedes mutear a otro administrador.`)
  }

  // 🔇 Mutear
  if (['mute', 'silenciar'].includes(command)) {
    if (mutedUsers.has(userJid)) return m.reply(`⚠️ @${userJid.split('@')[0]} ya está muteado.`, null, { mentions: [userJid] })
    mutedUsers.add(userJid)
    return m.reply(`🔇 Usuario muteado: @${userJid.split('@')[0]}`, null, { mentions: [userJid] })
  }

  // 🔊 Desmutear
  if (['unmute', 'desilenciar'].includes(command)) {
    if (!mutedUsers.has(userJid)) return m.reply(`⚠️ @${userJid.split('@')[0]} no está muteado.`, null, { mentions: [userJid] })
    mutedUsers.delete(userJid)
    return m.reply(`🔊 Usuario desmuteado: @${userJid.split('@')[0]}`, null, { mentions: [userJid] })
  }
}

// 🔕 Antes de procesar mensajes: borrar los del usuario muteado
handler.before = async (m, { conn }) => {
  const sender = normalizeJid(m.sender)
  if (mutedUsers.has(sender)) {
    try {
      await conn.sendMessage(m.chat, { delete: m.key })
    } catch (e) {
      console.error('❌ Error al eliminar mensaje muteado:', e.message)
    }
    return true
  }
}

handler.help = ['mute', 'unmute', 'silenciar', 'desilenciar']
handler.tags = ['grupo']
handler.command = ['mute', 'unmute', 'silenciar', 'desilenciar']
handler.group = true
handler.botAdmin = true

export default handler
