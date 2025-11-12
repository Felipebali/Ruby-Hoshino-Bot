// 🧩 plugins/mute.js — Solo para administradores del grupo

function normalizeJid(jid) {
  if (!jid) return null
  jid = String(jid).trim()
  const onlyDigits = jid.replace(/\D/g, '')
  if (/^\d{5,}$/.test(onlyDigits) && !jid.includes('@')) {
    return `${onlyDigits}@s.whatsapp.net`
  }
  return jid
    .replace(/@c\.us$/, '@s.whatsapp.net')
    .replace(/@s\.whatsapp\.net$/, '@s.whatsapp.net')
}

let mutedUsers = new Set()

let handler = async (m, { conn, command }) => {
  if (!m.isGroup) return m.reply('❌ Este comando solo puede usarse en grupos.')

  // Obtener metadata del grupo
  const groupMetadata = await conn.groupMetadata(m.chat)
  const admins = groupMetadata.participants
    .filter(p => p.admin)
    .map(p => normalizeJid(p.id))

  // Solo los administradores pueden usar el comando
  if (!admins.includes(normalizeJid(m.sender))) {
    return conn.reply(m.chat, '❌ Solo los *administradores* pueden usar este comando.', m)
  }

  // Validar usuario objetivo
  if (!m.quoted && !m.mentionedJid?.length && !/\d{5,}/.test(m.text || '')) {
    return conn.reply(m.chat, '⚠️ Debes *citar, mencionar o escribir el número* del usuario a mutear/desmutear.', m)
  }

  let userJid = null
  if (m.quoted?.sender) userJid = normalizeJid(m.quoted.sender)
  else if (m.mentionedJid?.length > 0) userJid = normalizeJid(m.mentionedJid[0])
  else if (m.text) {
    const num = m.text.match(/\d{5,}/)?.[0]
    if (num) userJid = normalizeJid(num)
  }

  if (!userJid) return

  if (['mute', 'silenciar'].includes(command)) {
    if (mutedUsers.has(userJid)) {
      return conn.sendMessage(m.chat, {
        text: `⚠️ @${userJid.split('@')[0]} ya está muteado.`,
        mentions: [userJid],
        quoted: m
      })
    }
    mutedUsers.add(userJid)
    await conn.sendMessage(m.chat, {
      text: `✅ Usuario muteado: @${userJid.split('@')[0]}`,
      mentions: [userJid],
      quoted: m
    })
  } else if (['unmute', 'desilenciar'].includes(command)) {
    if (!mutedUsers.has(userJid)) {
      return conn.sendMessage(m.chat, {
        text: `⚠️ @${userJid.split('@')[0]} no está muteado.`,
        mentions: [userJid],
        quoted: m
      })
    }
    mutedUsers.delete(userJid)
    await conn.sendMessage(m.chat, {
      text: `✅ Usuario desmuteado: @${userJid.split('@')[0]}`,
      mentions: [userJid],
      quoted: m
    })
  }
}

// 🐾 Bloquea mensajes de usuarios muteados
handler.before = async (m, { conn }) => {
  try {
    const sender = normalizeJid(m.sender)
    if (!sender) return
    if (mutedUsers.has(sender)) {
      try {
        await conn.sendMessage(m.chat, { delete: m.key })
      } catch (e) {
        console.error('❌ No se pudo eliminar mensaje muteado:', e?.message || e)
      }
      return true
    }
  } catch (e) {
    console.error(e)
  }
}

handler.help = ['mute', 'unmute', 'silenciar', 'desilenciar']
handler.tags = ['grupo']
handler.command = ['mute', 'unmute', 'silenciar', 'desilenciar']
handler.group = true
handler.botAdmin = true // El bot debe ser admin para poder borrar mensajes

export default handler
