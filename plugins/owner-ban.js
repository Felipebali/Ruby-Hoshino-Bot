// 📂 plugins/propietario-re.js
function normalizeJid(jid = '') {
if (!jid) return null
return jid.replace(/@c.us$/, '@s.whatsapp.net').replace(/@s.whatsapp.net$/, '@s.whatsapp.net')
}

const handler = async (m, { conn, command, text }) => {
const EMOJIS = {
re: '✅',       // agregar a lista negra
unre: '☢️',    // quitar de lista negra
clre: '👀',    // consultar estado
verre: '📜',   // ver lista completa
usre: '🧹',    // vaciar lista
error: '🚫'    // error o aviso
}

const db = global.db.data.users || (global.db.data.users = {})

// Reacción automática
if (EMOJIS[command]) await conn.sendMessage(m.chat, { react: { text: EMOJIS[command], key: m.key } })

// --- DETECTAR USUARIO ---
let userJid = null
if (m.quoted) userJid = normalizeJid(m.quoted.sender)
else if (m.mentionedJid?.length) userJid = normalizeJid(m.mentionedJid[0])
else if (text) {
const num = text.match(/\d{5,}/)?.[0]
if (num) userJid = "${num}@s.whatsapp.net"
}

let reason = text ? text.replace(/@/g, '').replace(userJid?.split('@')[0] || '', '').trim() : ''
if (!reason) reason = 'No especificado'

if (!userJid && !['verre','usre','clre'].includes(command))
return conn.sendMessage(m.chat, { text: "${EMOJIS.error} Debes responder, mencionar o escribir el número del usuario." })

if (userJid && !db[userJid]) db[userJid] = {}

// --- AGREGAR A LISTA NEGRA ---
if (command === 're') {
db[userJid].banned = true
db[userJid].banReason = reason
db[userJid].bannedBy = m.sender

await conn.sendMessage(m.chat, { text: `${EMOJIS.re} @${userJid.split('@')[0]} fue agregado a la lista negra.\n📝 Motivo: ${reason}`, mentions: [userJid] })

// AUTO-KICK en grupos
const groups = Object.keys(await conn.groupFetchAllParticipating()).slice(0, 15)
for (const jid of groups) {
  await new Promise(r => setTimeout(r, 3000))
  try {
    const group = await conn.groupMetadata(jid)
    const member = group.participants.find(p => normalizeJid(p.id) === normalizeJid(userJid))
    if (member) {
      await conn.sendMessage(jid, { text: `🚫 @${userJid.split('@')[0]} está en la lista negra y será eliminado automáticamente.\n📝 Motivo: ${reason}`, mentions: [userJid] })
      await new Promise(r => setTimeout(r, 2500))
      await conn.groupParticipantsUpdate(jid, [member.id], 'remove')
      console.log(`[AUTO-KICK] Expulsado ${userJid} de ${group.subject}`)
    }
  } catch (e) {
    if (e.data === 429 || e.message.includes('rate-overlimit')) {
      await new Promise(r => setTimeout(r, 10000))
      continue
    }
    console.log(`⚠️ No se pudo expulsar de ${jid}: ${e.message}`)
  }
}

}

// --- QUITAR DE LISTA NEGRA ---
else if (command === 'unre') {
if (!db[userJid]?.banned)
return conn.sendMessage(m.chat, { text: "${EMOJIS.error} @${userJid.split('@')[0]} no está en la lista negra.", mentions: [userJid] })

db[userJid].banned = false
db[userJid].banReason = ''
db[userJid].bannedBy = null

await conn.sendMessage(m.chat, { text: `${EMOJIS.unre} @${userJid.split('@')[0]} fue eliminado de la lista negra.`, mentions: [userJid] })

}

// --- CONSULTAR ESTADO ---
else if (command === 'clre') {
if (!db[userJid]?.banned)
return conn.sendMessage(m.chat, { text: "${EMOJIS.re} @${userJid.split('@')[0]} no está en la lista negra.", mentions: [userJid] })

await conn.sendMessage(m.chat, { text: `${EMOJIS.clre} @${userJid.split('@')[0]} está en la lista negra.\n📝 Motivo: ${db[userJid].banReason || 'No especificado'}`, mentions: [userJid] })

}

// --- VER LISTA COMPLETA ---
else if (command === 'verre') {
const bannedUsers = Object.entries(db).filter(([_, data]) => data?.banned)
if (!bannedUsers.length)
return conn.sendMessage(m.chat, { text: "${EMOJIS.re} No hay usuarios en la lista negra." })

let list = '🚫 *Lista negra actual:*\n\n'
const mentions = []
for (const [jid, data] of bannedUsers) {
  list += `• @${jid.split('@')[0]}\n  Motivo: ${data.banReason || 'No especificado'}\n\n`
  mentions.push(jid)
}
await conn.sendMessage(m.chat, { text: list.trim(), mentions })

}

// --- VACIAR LISTA (solo owner) ---
else if (command === 'usre') {
for (const jid in db) {
if (db[jid]?.banned) {
db[jid].banned = false
db[jid].banReason = ''
db[jid].bannedBy = null
}
}
await conn.sendMessage(m.chat, { text: "${EMOJIS.usre} La lista negra ha sido vaciada." })
}

if (global.db.write) await global.db.write()
}

handler.help = ['re', 'unre', 'clre', 'verre', 'usre']
handler.tags = ['owner']
handler.command = ['re', 'unre', 'clre', 'verre', 'usre']
handler.rowner = true

export default handler
