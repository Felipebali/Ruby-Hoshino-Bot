// 📂 plugins/owners.js — Gestión de Owners persistente
import fs from 'fs'
import path from 'path'

const filePath = path.join('./db', 'owners.json')

// --- Cargar o inicializar base de datos ---
let ownersDB = {}
try {
  if (fs.existsSync(filePath)) {
    ownersDB = JSON.parse(fs.readFileSync(filePath))
  } else {
    fs.writeFileSync(filePath, JSON.stringify({}))
  }
} catch (e) {
  console.error('Error cargando owners.json:', e)
}

// --- Normalizar JID ---
function normalizeJid(jid = '') {
  if (!jid) return null
  return jid.replace(/@c\.us$/, '@s.whatsapp.net').replace(/@s\.whatsapp.net$/, '@s.whatsapp.net')
}

// --- Guardar DB ---
function saveDB() {
  fs.writeFileSync(filePath, JSON.stringify(ownersDB, null, 2))
}

const handler = async (m, { conn, command, text }) => {
  const reactions = { addowner: '👑', delowner: '🗑️', listowner: '📜', clrowner: '🧹' }
  if (reactions[command]) await conn.sendMessage(m.chat, { react: { text: reactions[command], key: m.key } })

  // --- Validar permiso solo para owners ---
  const sender = normalizeJid(m.sender)
  const fixedOwners = (global.owner || []).map(j => normalizeJid(j))
  const isOwner = fixedOwners.includes(sender) || !!ownersDB[sender]
  if (!isOwner) return conn.reply(m.chat, '🚫 Solo los owners pueden usar este comando.', m)

  // --- Detectar usuario ---
  let userJid = null
  if (m.quoted) userJid = normalizeJid(m.quoted.sender)
  else if (m.mentionedJid?.length) userJid = normalizeJid(m.mentionedJid[0])
  else if (text) {
    const match = text.match(/(\d{5,})/)
    if (match) userJid = `${match[1]}@s.whatsapp.net`
    else if (text.includes('@')) {
      const mention = text.replace(/[^0-9]/g, '')
      if (mention.length > 5) userJid = `${mention}@s.whatsapp.net`
    }
  }

  // --- ACCIONES ---
  if (command === 'addowner') {
    if (!userJid) return conn.reply(m.chat, '💬 Usa: *.addowner @usuario* o *.addowner número*', m)
    if (ownersDB[userJid] || fixedOwners.includes(userJid))
      return conn.reply(m.chat, `⚠️ @${userJid.split('@')[0]} ya es owner.`, m, { mentions: [userJid] })

    ownersDB[userJid] = { addedBy: sender, addedAt: new Date().toISOString() }
    saveDB()
    await conn.reply(m.chat, `✅ @${userJid.split('@')[0]} ahora es *OWNER* del bot.`, m, { mentions: [userJid] })
  } 
  else if (command === 'delowner') {
    if (!userJid) return conn.reply(m.chat, '💬 Usa: *.delowner @usuario* o *.delowner número*', m)
    if (!ownersDB[userJid])
      return conn.reply(m.chat, `⚠️ @${userJid.split('@')[0]} no está en la lista de owners dinámicos.`, m, { mentions: [userJid] })

    delete ownersDB[userJid]
    saveDB()
    await conn.reply(m.chat, `🗑️ @${userJid.split('@')[0]} fue eliminado de los owners.`, m, { mentions: [userJid] })
  } 
  else if (command === 'listowner') {
    const dynamicOwners = Object.keys(ownersDB)
    const allOwners = [...fixedOwners, ...dynamicOwners]
    if (allOwners.length === 0) return conn.reply(m.chat, '📭 No hay owners registrados actualmente.', m)

    let msg = '👑 *Lista de Owners actuales:*\n\n'
    const mentions = []

    for (const jid of allOwners) {
      const addedBy = ownersDB[jid]?.addedBy ? `Agregado por: @${ownersDB[jid].addedBy.split('@')[0]}` : 'Owner fijo'
      msg += `• @${jid.split('@')[0]}\n  ➥ ${addedBy}\n\n`
      mentions.push(jid)
      if (ownersDB[jid]?.addedBy) mentions.push(ownersDB[jid].addedBy)
    }

    await conn.sendMessage(m.chat, { text: msg.trim(), mentions })
  } 
  else if (command === 'clrowner') {
    const total = Object.keys(ownersDB).length
    ownersDB = {}
    saveDB()
    await conn.reply(m.chat, `🧹 Se eliminaron *${total}* owners dinámicos.`, m)
  }
}

// --- Configuración de comandos ---
handler.help = ['addowner', 'delowner', 'listowner', 'clrowner']
handler.tags = ['owner']
handler.command = ['addowner', 'delowner', 'listowner', 'clrowner']
handler.rowner = true

export default handler
