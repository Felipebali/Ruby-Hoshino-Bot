// 🐾 FelixCat_Bot — Gestión dinámica de Owners (addowner, delowner, listowner, clrowner)

function normalizeJid(jid = '') {
  if (!jid || typeof jid !== 'string') return null
  return jid.replace(/@c\.us$/, '@s.whatsapp.net').replace(/@s\.whatsapp\.net$/, '@s.whatsapp.net')
}

// Owners fijos del bot
const FIXED_OWNERS = [
  ['59898719147', 'Feli', true],  // tu número como dueño
  ['59896026646', 'G', true]
].map(o => normalizeJid(o[0] + '@s.whatsapp.net'))

const handler = async (m, { conn, command, text }) => {
  const reactions = { addowner: '👑', delowner: '🗑️', listowner: '📜', clrowner: '🧹' }
  if (reactions[command]) await conn.sendMessage(m.chat, { react: { text: reactions[command], key: m.key } })

  const db = global.db.data.owners || (global.db.data.owners = {})

  // --- Permiso solo para owners fijos o dinámicos ---
  const sender = normalizeJid(m.sender)
  const dynamicOwners = Object.keys(db).map(j => normalizeJid(j))
  const isOwner = FIXED_OWNERS.includes(sender) || dynamicOwners.includes(sender)
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
    if (FIXED_OWNERS.includes(userJid) || db[userJid]) 
      return conn.reply(m.chat, `⚠️ @${userJid.split('@')[0]} ya es owner.`, m, { mentions: [userJid] })

    db[userJid] = { addedBy: sender, addedAt: new Date().toISOString() }
    await conn.reply(m.chat, `✅ @${userJid.split('@')[0]} ahora es *OWNER* del bot.`, m, { mentions: [userJid] })
  } 
  else if (command === 'delowner') {
    if (!userJid) return conn.reply(m.chat, '💬 Usa: *.delowner @usuario* o *.delowner número*', m)
    if (FIXED_OWNERS.includes(userJid)) 
      return conn.reply(m.chat, `🚫 No puedes eliminar a un owner fijo del bot.`, m)
    if (!db[userJid]) return conn.reply(m.chat, `⚠️ @${userJid.split('@')[0]} no está en la lista de owners.`, m, { mentions: [userJid] })

    delete db[userJid]
    await conn.reply(m.chat, `🗑️ @${userJid.split('@')[0]} fue eliminado de los owners.`, m, { mentions: [userJid] })
  } 
  else if (command === 'listowner') {
    const dynamicList = Object.keys(db)
    let msg = '👑 *Owners del bot:*\n\n'

    for (const jid of FIXED_OWNERS) {
      msg += `• @${jid.split('@')[0]} ➥ Owner fijo\n`
    }
    for (const jid of dynamicList) {
      msg += `• @${jid.split('@')[0]} ➥ Agregado por @${db[jid].addedBy.split('@')[0]} el ${db[jid].addedAt}\n`
    }

    const mentions = [...FIXED_OWNERS, ...dynamicList]
    await conn.sendMessage(m.chat, { text: msg.trim(), mentions })
  } 
  else if (command === 'clrowner') {
    const dynamicList = Object.keys(db)
    for (const jid of dynamicList) delete db[jid]
    await conn.reply(m.chat, `🧹 Se eliminaron *${dynamicList.length}* owners dinámicos. Los owners fijos permanecen.`, m)
  }

  if (global.db.write) await global.db.write()
}

// --- Configuración de comandos ---
handler.help = ['addowner', 'delowner', 'listowner', 'clrowner']
handler.tags = ['owner']
handler.command = ['addowner', 'delowner', 'listowner', 'clrowner']
handler.rowner = true

export default handler
