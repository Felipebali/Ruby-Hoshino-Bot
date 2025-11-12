// 🐾 FelixCat_Bot — Gestión dinámica de Owners (addowner, delowner, listowner, clrowner)
function normalizeJid(jid = '') {
  if (!jid || typeof jid !== 'string') return null
  return jid.replace(/@c\.us$/, '@s.whatsapp.net')
            .replace(/@s\.whatsapp\.net$/, '@s.whatsapp.net')
}

const handler = async (m, { conn, command, text }) => {
  const reactions = { addowner: '👑', delowner: '🗑️', listowner: '📜', clrowner: '🧹' }
  if (reactions[command]) await conn.sendMessage(m.chat, { react: { text: reactions[command], key: m.key } })

  // --- Base de datos persistente ---
  const db = global.db.data.owners || (global.db.data.owners = {})

  // --- Verificar permiso solo para owners ---
  const sender = normalizeJid(m.sender)
  const fixedOwners = (global.owner || []).map(j => normalizeJid(j)).filter(j => j)
  const isOwner = fixedOwners.includes(sender) || !!db[sender]
  if (!isOwner) return conn.reply(m.chat, '🚫 Solo los owners pueden usar este comando.', m)

  // --- Detectar usuario ---
  let userJid = null
  if (m.quoted) userJid = normalizeJid(m.quoted.sender)
  else if (m.mentionedJid?.length) userJid = normalizeJid(m.mentionedJid[0])
  else if (text) {
    const match = text.match(/(\d{5,})/)
    if (match) userJid = `${match[1]}@s.whatsapp.net`
  }

  // --- ACCIONES ---
  if (command === 'addowner') {
    if (!userJid) return conn.reply(m.chat, '💬 Usa: *.addowner @usuario* o *.addowner número*', m)
    if (db[userJid]) return conn.reply(m.chat, `⚠️ @${userJid.split('@')[0]} ya es owner.`, m, { mentions: [userJid] })

    db[userJid] = { addedBy: sender, addedAt: new Date().toISOString() }
    await conn.reply(m.chat, `✅ @${userJid.split('@')[0]} ahora es *OWNER* del bot.`, m, { mentions: [userJid] })
  } 
  else if (command === 'delowner') {
    if (!userJid) return conn.reply(m.chat, '💬 Usa: *.delowner @usuario* o *.delowner número*', m)
    if (!db[userJid]) return conn.reply(m.chat, `⚠️ @${userJid.split('@')[0]} no está en la lista de owners.`, m, { mentions: [userJid] })

    delete db[userJid]
    await conn.reply(m.chat, `🗑️ @${userJid.split('@')[0]} fue eliminado de los owners.`, m, { mentions: [userJid] })
  } 
  else if (command === 'listowner') {
    const list = Object.keys(db)
    if (list.length === 0) return conn.reply(m.chat, '📭 No hay owners registrados actualmente.', m)

    let msg = '👑 *Lista de Owners registrados:*\n\n'
    const mentions = []
    for (const jid of list) {
      if (!db[jid]) continue
      msg += `• @${jid.split('@')[0]}\n  ➥ Agregado por: @${db[jid].addedBy.split('@')[0]}\n  ➥ Fecha: ${db[jid].addedAt}\n\n`
      mentions.push(jid, db[jid].addedBy)
    }
    await conn.sendMessage(m.chat, { text: msg.trim(), mentions })
  } 
  else if (command === 'clrowner') {
    const total = Object.keys(db).length
    for (const jid in db) delete db[jid]
    await conn.reply(m.chat, `🧹 Se eliminaron *${total}* owners registrados.`, m)
  }

  // --- Guardar cambios en base de datos ---
  if (global.db.write) await global.db.write()
}

// --- Configuración de comandos ---
handler.help = ['addowner', 'delowner', 'listowner', 'clrowner']
handler.tags = ['owner']
handler.command = ['addowner', 'delowner', 'listowner', 'clrowner']
handler.rowner = true

export default handler
