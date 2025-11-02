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

// Owners protegidos
const BOT_OWNERS = ['59896026646','59898719147']
const ownersJids = BOT_OWNERS.map(n => normalizeJid(n))

let mutedUsers = new Set()

let handler = async (m, { conn, command, isAdmin, isBotAdmin }) => {
  if (!isBotAdmin) return await conn.sendMessage(m.chat, { text: '❌ El bot necesita ser admin para mutear.' })
  if (!isAdmin) return await conn.sendMessage(m.chat, { text: '❌ Solo administradores pueden usar este comando.' })

  let userJid = null

  // 1) si citó mensaje
  if (m.quoted?.sender) userJid = normalizeJid(m.quoted.sender)
  // 2) si mencionó
  else if (m.mentionedJid?.length > 0) userJid = normalizeJid(m.mentionedJid[0])
  // 3) si escribió un número en el texto
  else if (m.text) {
    const num = m.text.match(/\d{5,}/)?.[0]
    if (num) userJid = normalizeJid(num)
  }

  if (!userJid) return await conn.sendMessage(m.chat, { text: '⚠️ Debes mencionar, citar o escribir el número del usuario.' })

  const nombre = userJid.split('@')[0]

  if (ownersJids.includes(userJid)) {
    return await conn.sendMessage(m.chat, { text: `❌ No puedes mutear a un owner protegido.` })
  }

  if (["mute", "silenciar"].includes(command)) {
    if (mutedUsers.has(userJid)) {
      await conn.sendMessage(m.chat, { text: `⚠️ Usuario @${nombre} ya está muteado.`, mentions: [userJid] })
    } else {
      mutedUsers.add(userJid)
      await conn.sendMessage(m.chat, { text: `🔇 Usuario @${nombre} ha sido muteado.`, mentions: [userJid] })
    }
  } else if (["unmute", "desilenciar"].includes(command)) {
    if (!mutedUsers.has(userJid)) {
      await conn.sendMessage(m.chat, { text: `⚠️ Usuario @${nombre} no estaba muteado.`, mentions: [userJid] })
    } else {
      mutedUsers.delete(userJid)
      await conn.sendMessage(m.chat, { text: `🔊 Usuario @${nombre} ha sido desmuteado.`, mentions: [userJid] })
    }
  }
}

// Antes de procesar mensajes: eliminar si el remitente está muteado
handler.before = async (m, { conn }) => {
  try {
    const sender = normalizeJid(m.sender)
    if (!sender) return
    if (mutedUsers.has(sender)) {
      try {
        await conn.sendMessage(m.chat, { delete: m.key })
      } catch (e) {
        console.error('No se pudo eliminar mensaje muteado:', e?.message || e)
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
handler.admin = true
handler.botAdmin = true

export default handler
