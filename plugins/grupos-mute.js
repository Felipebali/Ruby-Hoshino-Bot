// plugins/mute.js
function normalizeJid(jid) {
  if (!jid) return null
  jid = String(jid).trim()
  const onlyDigits = jid.replace(/\D/g, '')
  if (/^\d{5,}$/.test(onlyDigits) && !jid.includes('@')) {
    return `${onlyDigits}@s.whatsapp.net`
  }
  return jid.replace(/@c\.us$/, '@s.whatsapp.net').replace(/@s\.whatsapp.net$/, '@s.whatsapp.net')
}

// Números de owners protegidos
const BOT_OWNERS = ['59896026646','59898719147']
const ownersJids = BOT_OWNERS.map(n => normalizeJid(n))

let mutedUsers = new Set()

let handler = async (m, { conn, command }) => {
  if (!m.isGroup) return

  // Obtener metadata del grupo
  const groupMetadata = await conn.groupMetadata(m.chat)
  const admins = groupMetadata.participants
    .filter(p => p.admin === 'admin' || p.admin === 'superadmin')
    .map(p => p.id)

  // Solo admins o owners pueden usarlo
  if (!admins.includes(m.sender) && !ownersJids.includes(m.sender)) {
    return conn.sendMessage(m.chat, { text: '❌ Solo administradores o owners pueden usar este comando.', quoted: m })
  }

  if (!m.quoted && !m.mentionedJid && !/\d{5,}/.test(m.text || '')) {
    return conn.sendMessage(m.chat, { text: '⚠️ Debes citar, mencionar o escribir el número del usuario a mutear/desmutear.', quoted: m })
  }

  let userJid = null
  if (m.quoted?.sender) userJid = normalizeJid(m.quoted.sender)
  else if (m.mentionedJid?.length > 0) userJid = normalizeJid(m.mentionedJid[0])
  else if (m.text) {
    const num = m.text.match(/\d{5,}/)?.[0]
    if (num) userJid = normalizeJid(num)
  }

  if (!userJid) return

  // Proteger owners
  if (ownersJids.includes(userJid)) {
    return conn.sendMessage(m.chat, { text: `❌ No puedes mutear a un owner protegido.`, quoted: m })
  }

  if (['mute','silenciar'].includes(command)) {
    if (mutedUsers.has(userJid)) {
      return conn.sendMessage(m.chat, { text: `⚠️ @${userJid.split('@')[0]} ya está muteado.`, mentions: [userJid], quoted: m })
    }
    mutedUsers.add(userJid)
    await conn.sendMessage(m.chat, { text: `✅ Usuario muteado: @${userJid.split('@')[0]}`, mentions: [userJid], quoted: m })
  } else if (['unmute','desilenciar'].includes(command)) {
    if (!mutedUsers.has(userJid)) {
      return conn.sendMessage(m.chat, { text: `⚠️ @${userJid.split('@')[0]} no está muteado.`, mentions: [userJid], quoted: m })
    }
    mutedUsers.delete(userJid)
    await conn.sendMessage(m.chat, { text: `✅ Usuario desmuteado: @${userJid.split('@')[0]}`, mentions: [userJid], quoted: m })
  }
}

// Antes de procesar mensajes: eliminar si el remitente está muteado
handler.before = async (m, { conn }) => {
  try {
    const sender = normalizeJid(m.sender)
    if (!sender) return
    if (mutedUsers.has(sender)) {
      try { await conn.sendMessage(m.chat, { delete: m.key }) } 
      catch(e) { console.error('No se pudo eliminar mensaje muteado:', e?.message || e) }
      return true
    }
  } catch(e) {
    console.error(e)
  }
}

handler.help = ['mute', 'unmute', 'silenciar', 'desilenciar']
handler.tags = ['grupo']
handler.command = ['mute', 'unmute', 'silenciar', 'desilenciar']
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler
