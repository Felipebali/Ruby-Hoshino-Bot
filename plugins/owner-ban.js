// 📂 plugins/propietario-ln.js
function normalizeJid(jid = '') {
  if (!jid) return null
  jid = jid.replace(/[^0-9]/g, '') // solo números
  return `${jid}@s.whatsapp.net`
}

const handler = async (m, { conn, command, text }) => {
  const emoji = '🚫'
  const done = '✅'
  const db = global.db.data.users
  const ln = global.db.data.listasNegra || (global.db.data.listasNegra = {})

  // --- DETECTAR USUARIO ---
  let userJid = null

  if (m.quoted) {
    userJid = normalizeJid(m.quoted.sender)
  } else if (m.mentionedJid?.length) {
    userJid = normalizeJid(m.mentionedJid[0])
  } else if (text) {
    const match = text.match(/(\d{5,})/)
    if (match) userJid = normalizeJid(match[1])
  }

  // --- Motivo ---
  let reason = text
    ? text.replace(/@/g, '').replace(/\d{5,}/g, '').trim()
    : 'No especificado'
  if (!reason) reason = 'No especificado'

  // --- Validar usuario ---
  if (!userJid && !['verln', 'usre', 'clre'].includes(command))
    return conn.reply(m.chat, `${emoji} Debes responder, mencionar o escribir el número del usuario.`, m)

  // --- ACCIONES ---
  switch (command) {
    case 'ln': { // Agregar a lista negra
      if (ln[userJid])
        return conn.reply(m.chat, `${emoji} El usuario ya está en la lista negra.`, m)

      ln[userJid] = { addedBy: m.sender, reason, date: new Date().toLocaleString() }
      await conn.sendMessage(m.chat, { react: { text: done, key: m.key }})
      await conn.reply(m.chat, `🚫 Usuario agregado a la lista negra:\n> @${userJid.split('@')[0]}\n📝 Motivo: ${reason}`, m, { mentions: [userJid] })
      break
    }

    case 'unln': { // Quitar de lista negra
      if (!ln[userJid])
        return conn.reply(m.chat, `${emoji} El usuario no está en la lista negra.`, m)

      delete ln[userJid]
      await conn.sendMessage(m.chat, { react: { text: done, key: m.key }})
      await conn.reply(m.chat, `✅ Usuario eliminado de la lista negra:\n> @${userJid.split('@')[0]}`, m, { mentions: [userJid] })
      break
    }

    case 'verln': { // Ver lista completa
      const lista = Object.entries(ln)
      if (!lista.length)
        return conn.reply(m.chat, `${emoji} La lista negra está vacía.`, m)

      let msg = '🚫 *Lista Negra Actual:*\n\n'
      for (const [jid, info] of lista) {
        msg += `• @${jid.split('@')[0]}\n  Motivo: ${info.reason}\n  Por: @${info.addedBy.split('@')[0]}\n\n`
      }
      await conn.sendMessage(m.chat, { react: { text: '📜', key: m.key }})
      await conn.reply(m.chat, msg, m, { mentions: lista.map(([jid]) => jid) })
      break
    }

    case 'clre': { // Limpiar lista negra
      const count = Object.keys(ln).length
      if (count === 0)
        return conn.reply(m.chat, `${emoji} La lista negra ya está vacía.`, m)

      global.db.data.listasNegra = {}
      await conn.sendMessage(m.chat, { react: { text: '🧹', key: m.key }})
      await conn.reply(m.chat, `🧹 Lista negra limpiada correctamente (${count} usuarios eliminados).`, m)
      break
    }

    case 'usre': { // Ver cuántos hay en lista negra
      const count = Object.keys(ln).length
      await conn.sendMessage(m.chat, { react: { text: '📊', key: m.key }})
      return conn.reply(m.chat, `📊 Actualmente hay *${count}* usuario(s) en la lista negra.`, m)
    }
  }
}

handler.command = ['ln', 'unln', 'verln', 'clre', 'usre']
handler.rowner = true

export default handler
