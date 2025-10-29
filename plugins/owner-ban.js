// 📂 plugins/propietario-ln.js
// Lista negra con expulsión automática, incluso si es admin

function normalizeJid(jid = '') {
  if (!jid) return null
  jid = jid.trim()
  if (!jid.includes('@')) jid = jid + '@s.whatsapp.net'
  return jid
    .replace(/@c\.us$/, '@s.whatsapp.net')
    .replace(/@whatsapp\.net$/, '@s.whatsapp.net')
    .replace(/[^0-9@s\.]/g, '')
}

async function delay(ms) {
  return new Promise(res => setTimeout(res, ms))
}

// Intenta remover un usuario de un grupo, si es admin lo degrada primero
async function attemptRemove(conn, groupId, userJid) {
  try {
    await conn.groupParticipantsUpdate(groupId, [userJid], 'remove')
    return true
  } catch (e) {
    const msg = String(e?.message || e)
    if (/admin|demote|not authorized|permission/i.test(msg) || /403|401|forbidden/i.test(msg)) {
      try {
        await conn.groupParticipantsUpdate(groupId, [userJid], 'demote')
        await delay(1200)
        await conn.groupParticipantsUpdate(groupId, [userJid], 'remove')
        return true
      } catch {
        return false
      }
    }
    throw e
  }
}

const handler = async (m, { conn, command, text }) => {
  const emoji = '🚫'
  const done = '✅'
  const db = global.db.data.users || (global.db.data.users = {})

  // Reacciones
  const reactions = { ln: '✅', unln: '☢️', cln: '👀', verln: '📜', usln: '🧹' }
  if (reactions[command])
    await conn.sendMessage(m.chat, { react: { text: reactions[command], key: m.key } })

  // Usuario objetivo
  let userJid = null
  if (m.quoted) userJid = normalizeJid(m.quoted.sender)
  else if (m.mentionedJid?.length) userJid = normalizeJid(m.mentionedJid[0])
  else if (text) {
    const num = text.match(/\d{5,}/)?.[0]
    if (num) userJid = `${num}@s.whatsapp.net`
  }

  let reason = text
    ? text.replace(/@/g, '').replace(userJid?.split('@')[0] || '', '').trim()
    : ''
  if (!reason) reason = 'No especificado'

  if (!userJid && !['verln', 'usln'].includes(command))
    return conn.reply(m.chat, `${emoji} Debes responder, mencionar o escribir el número del usuario.`, m)

  if (userJid && !db[userJid]) db[userJid] = {}

  // --- AGREGAR A LISTA NEGRA ---
  if (command === 'ln') {
    db[userJid].banned = true
    db[userJid].banReason = reason
    db[userJid].bannedBy = m.sender

    await conn.sendMessage(m.chat, {
      text: `${done} @${userJid.split('@')[0]} fue agregado a la lista negra.\n📝 Motivo: ${reason}`,
      mentions: [userJid],
    })

    const groupsObj = await conn.groupFetchAllParticipating().catch(() => ({}))
    const groups = Object.keys(groupsObj)
    for (const jid of groups) {
      await delay(1500)
      try {
        const group = await conn.groupMetadata(jid).catch(() => null)
        if (!group?.participants) continue

        const member = group.participants.find(p => normalizeJid(p.id || p.jid) === normalizeJid(userJid))
        if (member) {
          const botJid = conn.user?.id || conn.user?.jid
          const botIsAdmin = group.participants.some(p => (p.id || p.jid) === botJid && p.admin)

          if (!botIsAdmin) continue

          await attemptRemove(conn, jid, member.id || member.jid)

          await conn.sendMessage(jid, {
            text: `🚫 @${userJid.split('@')[0]} está en la lista negra y ha sido eliminado automáticamente.\n📝 Motivo: ${reason}`,
            mentions: [userJid],
          })
          console.log(`[AUTO-KICK] Expulsado ${userJid} de ${group.subject}`)
        }
      } catch (e) {
        const em = String(e?.message || e)
        if (em.includes('rate-overlimit') || /429/.test(em)) {
          await delay(3000)
          continue
        }
        console.log(`⚠️ Error expulsando a ${userJid} de ${jid}: ${em}`)
      }
    }
  }

  // --- QUITAR DE LISTA NEGRA ---
  else if (command === 'unln') {
    if (!db[userJid]?.banned)
      return conn.sendMessage(m.chat, { text: `${emoji} @${userJid.split('@')[0]} no está en la lista negra.`, mentions: [userJid] })

    db[userJid].banned = false
    db[userJid].banReason = ''
    db[userJid].bannedBy = null

    await conn.sendMessage(m.chat, { text: `${done} @${userJid.split('@')[0]} fue eliminado de la lista negra.`, mentions: [userJid] })
  }

  // --- CONSULTAR ESTADO ---
  else if (command === 'cln') {
    if (!db[userJid]?.banned)
      return conn.sendMessage(m.chat, { text: `✅ @${userJid.split('@')[0]} no está en la lista negra.`, mentions: [userJid] })

    await conn.sendMessage(m.chat, { text: `${emoji} @${userJid.split('@')[0]} está en la lista negra.\n📝 Motivo: ${db[userJid].banReason || 'No especificado'}`, mentions: [userJid] })
  }

  // --- VER LISTA COMPLETA ---
  else if (command === 'verln') {
    const bannedUsers = Object.entries(db).filter(([_, data]) => data?.banned)
    if (!bannedUsers.length) return conn.sendMessage(m.chat, { text: `${done} No hay usuarios en la lista negra.` })

    let list = '🚫 *Lista negra actual:*\n\n'
    const mentions = []
    for (const [jid, data] of bannedUsers) {
      list += `• @${jid.split('@')[0]}\n  Motivo: ${data.banReason || 'No especificado'}\n\n`
      mentions.push(jid)
    }
    await conn.sendMessage(m.chat, { text: list.trim(), mentions })
  }

  // --- VACIAR LISTA ---
  else if (command === 'usln') {
    for (const jid in db) {
      if (db[jid]?.banned) {
        db[jid].banned = false
        db[jid].banReason = ''
        db[jid].bannedBy = null
      }
    }
    await conn.sendMessage(m.chat, { text: `${done} La lista negra ha sido vaciada.` })
  }

  if (global.db.write) await global.db.write()
}

// --- AUTO-KICK SI HABLA ---
handler.before = async function (m, { conn }) {
  if (!m.isGroup || !m.sender) return
  const db = global.db.data.users || {}
  const sender = normalizeJid(m.sender)
  if (!db[sender]?.banned) return
  const reason = db[sender].banReason || 'No especificado'

  try {
    const groupMetadata = await conn.groupMetadata(m.chat)
    const botJid = conn.user?.id || conn.user?.jid
    const botIsAdmin = groupMetadata.participants.some(p => (p.id || p.jid) === botJid && p.admin)
    if (!botIsAdmin) return

    await attemptRemove(conn, m.chat, sender)
    await conn.sendMessage(m.chat, { text: `🚫 @${sender.split('@')[0]} estaba en la lista negra y ha sido eliminado.\n📝 Motivo: ${reason}`, mentions: [sender] })
    console.log(`[AUTO-KICK] Eliminado ${sender} del grupo ${m.chat}`)
  } catch (e) {
    if (String(e?.message || e).includes('rate-overlimit')) return
    console.log(`⚠️ No se pudo eliminar a ${sender}: ${e.message || e}`)
  }
}

// --- AUTO-KICK AL UNIRSE ---
handler.participantsUpdate = async function (event) {
  const conn = this
  const { id, participants, action } = event
  if (!['add','invite'].includes(action)) return
  const db = global.db.data.users || {}

  for (const user of participants) {
    const u = normalizeJid(user)
    if (!db[u]?.banned) continue
    const reason = db[u].banReason || 'No especificado'

    try {
      const groupMetadata = await conn.groupMetadata(id)
      const botJid = conn.user?.id || conn.user?.jid
      const botIsAdmin = groupMetadata.participants.some(p => (p.id || p.jid) === botJid && p.admin)
      if (!botIsAdmin) continue

      await attemptRemove(conn, id, u)
      await conn.sendMessage(id, { text: `🚫 @${u.split('@')[0]} está en la lista negra y ha sido eliminado automáticamente.\n📝 Motivo: ${reason}`, mentions: [u] })
      console.log(`[AUTO-KICK JOIN] ${u} eliminado del grupo ${id}`)
    } catch {}
  }
}

handler.help = ['ln','unln','cln','verln','usln']
handler.tags = ['owner']
handler.command = ['ln','unln','cln','verln','usln']
handler.rowner = true

export default handler
