// 📂 plugins/mute.js
function normalizeJid(jid = '') {
  jid = jid.trim()
  const num = jid.replace(/\D/g, '')
  if (!num) return null
  return `${num}@s.whatsapp.net`
}

const BOT_OWNERS = ['59896026646', '59898719147']
const ownersJids = BOT_OWNERS.map(n => normalizeJid(n))

let mutedUsers = new Set()

let handler = async (m, { conn, command }) => {
  if (!m.isGroup) return

  // Obtener metadata segura
  let groupMetadata
  try {
    groupMetadata = await conn.groupMetadata(m.chat)
  } catch {
    return m.reply('⚠️ No se pudo obtener la información del grupo.')
  }

  // Lista de admins normalizada
  const admins = groupMetadata.participants
    .filter(p => p.admin)
    .map(p => normalizeJid(p.id))

  const senderJid = normalizeJid(m.sender)

  // Solo admins o owners pueden usar
  if (!admins.includes(senderJid) && !ownersJids.includes(senderJid)) {
    return conn.sendMessage(m.chat, { text: '❌ Solo administradores o owners pueden usar este comando.', quoted: m })
  }

  // Verificar si se citó o mencionó usuario
  let userJid = null
  if (m.quoted?.sender) userJid = normalizeJid(m.quoted.sender)
  else if (m.mentionedJid?.length) userJid = normalizeJid(m.mentionedJid[0])
  else if (m.text) {
    const num = m.text.match(/\d{5,}/)?.[0]
    if (num) userJid = normalizeJid(num)
  }

  if (!userJid) {
    return conn.sendMessage(m.chat, { text: '⚠️ Debes citar, mencionar o escribir el número del usuario.', quoted: m })
  }

  // Proteger owners
  if (ownersJids.includes(userJid)) {
    return conn.sendMessage(m.chat, { text: `❌ No puedes mutear a un owner protegido.`, quoted: m })
  }

  if (['mute', 'silenciar'].includes(command)) {
    if (mutedUsers.has(userJid)) {
      return conn.sendMessage(m.chat, { text: `⚠️ @${userJid.split('@')[0]} ya está muteado.`, mentions: [userJid], quoted: m })
    }
    mutedUsers.add(userJid)
    await conn.sendMessage(m.chat, { text: `🔇 Usuario muteado: @${userJid.split('@')[0]}`, mentions: [userJid], quoted: m })
  }

  if (['unmute', 'desilenciar'].includes(command)) {
    if (!mutedUsers.has(userJid)) {
      return conn.sendMessage(m.chat, { text: `⚠️ @${userJid.split('@')[0]} no está muteado.`, mentions: [userJid], quoted: m })
    }
    mutedUsers.delete(userJid)
    await conn.sendMessage(m.chat, { text: `🔊 Usuario desmuteado: @${userJid.split('@')[0]}`, mentions: [userJid], quoted: m })
  }
}

// Bloquear mensajes de muteados
handler.before = async (m, { conn }) => {
  const sender = normalizeJid(m.sender)
  if (mutedUsers.has(sender)) {
    try {
      await conn.sendMessage(m.chat, { delete: m.key })
    } catch (e) {
      console.error('❌ Error al eliminar mensaje muteado:', e)
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
