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

// Lista de owners protegidos
const BOT_OWNERS = ['59896026646','59898719147']
const ownersJids = BOT_OWNERS.map(n => normalizeJid(n))

let mutedUsers = new Set()

const frasesMute = [
  '🤫 Shhh… @USUARIO ahora está en silencio.',
  '🤐 @USUARIO ha sido muteado, silencio total.',
  '🛑 @USUARIO no podrá hablar por ahora.'
]

const frasesUnmute = [
  '🔊 @USUARIO vuelve a hablar libremente.',
  '🎉 @USUARIO está de vuelta y puede escribir.',
  '✅ @USUARIO ha sido desmuteado, hablemos!'
]

const frasesOwner = [
  '😎 @USUARIO es demasiado poderoso, no se puede mutear.',
  '⚡ @USUARIO está protegido por los dioses del bot.',
  '🤪 No intentes mutear a @USUARIO, eso no es posible.'
]

let handler = async (m, { conn, command, isAdmin, isBotAdmin }) => {
  if (!isBotAdmin) return conn.reply(m.chat, '⭐ El bot necesita ser administrador.', m)
  if (!isAdmin) return conn.reply(m.chat, '⭐ Solo los administradores pueden usar este comando.', m)

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

  if (!userJid) return conn.reply(m.chat, '😮‍💨 Debes citar, mencionar o escribir el número del usuario para mutear/desmutear.', m)

  // Proteger owners
  if (ownersJids.includes(userJid)) {
    const frase = frasesOwner[Math.floor(Math.random() * frasesOwner.length)].replace('@USUARIO', `@${userJid.split('@')[0]}`)
    return conn.reply(m.chat, frase, m, { mentions: [userJid] })
  }

  if (["mute", "silenciar"].includes(command)) {
    mutedUsers.add(userJid)
    const frase = frasesMute[Math.floor(Math.random() * frasesMute.length)].replace('@USUARIO', `@${userJid.split('@')[0]}`)
    await conn.reply(m.chat, frase, m, { mentions: [userJid] })
  } else if (["unmute", "desilenciar"].includes(command)) {
    if (!mutedUsers.has(userJid)) {
      return conn.reply(m.chat, `⚠️ @${userJid.split('@')[0]} no está muteado.`, m, { mentions: [userJid] })
    }
    mutedUsers.delete(userJid)
    const frase = frasesUnmute[Math.floor(Math.random() * frasesUnmute.length)].replace('@USUARIO', `@${userJid.split('@')[0]}`)
    await conn.reply(m.chat, frase, m, { mentions: [userJid] })
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
