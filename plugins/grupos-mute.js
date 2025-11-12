// 📂 plugins/mute.js
function normalizeJid(jid = '') {
  jid = jid.trim()
  const num = jid.replace(/\D/g, '')
  if (!num) return null
  return `${num}@s.whatsapp.net`
}

let mutedUsers = new Set()

let handler = async (m, { conn, command }) => {
  if (!m.isGroup) return

  let groupMetadata
  try {
    groupMetadata = await conn.groupMetadata(m.chat)
  } catch {
    return m.reply('⚠️ No se pudo obtener la información del grupo.')
  }

  // 📋 Detectar correctamente a los administradores
  const admins = groupMetadata.participants
    .filter(p => p.admin !== null && p.admin !== undefined)
    .map(p => normalizeJid(p.id))

  const senderJid = normalizeJid(m.sender)

  // 🚫 Solo admins del grupo pueden usar el comando
  if (!admins.includes(senderJid)) {
    return conn.sendMessage(m.chat, { text: '❌ Solo los administradores del grupo pueden usar este comando.', quoted: m })
  }

  // 🎯 Determinar usuario objetivo
  let userJid = null
  if (m.quoted?.sender) userJid = normalizeJid(m.quoted.sender)
  else if (m.mentionedJid?.length) userJid = normalizeJid(m.mentionedJid[0])
  else if (m.text) {
    const num = m.text.match(/\d{5,}/)?.[0]
    if (num) userJid = normalizeJid(num)
  }

  if (!userJid) {
    return conn.sendMessage(m.chat, { text: '⚠️ Debes citar, mencionar o escribir el número del usuario a mutear/desmutear.', quoted: m })
  }

  // 🚷 No se puede mutear a otro admin
  if (admins.includes(userJid)) {
    return conn.sendMessage(m.chat, { text: `⚠️ No puedes mutear a otro administrador.`, quoted: m })
  }

  // 🔇 Mutear
  if (['mute', 'silenciar'].includes(command)) {
    if (mutedUsers.has(userJid)) {
      return conn.sendMessage(m.chat, { text: `⚠️ @${userJid.split('@')[0]} ya está muteado.`, mentions: [userJid], quoted: m })
    }
    mutedUsers.add(userJid)
    await conn.sendMessage(m.chat, { text: `🔇 Usuario muteado: @${userJid.split('@')[0]}`, mentions: [userJid], quoted: m })
  }

  // 🔊 Desmutear
  if (['unmute', 'desilenciar'].includes(command)) {
    if (!mutedUsers.has(userJid)) {
      return conn.sendMessage(m.chat, { text: `⚠️ @${userJid.split('@')[0]} no está muteado.`, mentions: [userJid], quoted: m })
    }
    mutedUsers.delete(userJid)
    await conn.sendMessage(m.chat, { text: `🔊 Usuario desmuteado: @${userJid.split('@')[0]}`, mentions: [userJid], quoted: m })
  }
}

// 🚫 Elimina los mensajes de los usuarios muteados
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
