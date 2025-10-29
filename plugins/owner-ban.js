// 📂 plugins/propietario-ln.js
// Sistema de lista negra con expulsión automática (incluye degradado si es admin)

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
  return new Promise((res) => setTimeout(res, ms))
}

/**
 * Intenta expulsar a un usuario de un grupo.
 * Si es admin, intenta demotear antes de remover.
 * Devuelve true si expulsó, false si no.
 */
async function attemptRemove(conn, groupId, userJid) {
  try {
    // intento directo de remover
    await conn.groupParticipantsUpdate(groupId, [userJid], 'remove')
    return true
  } catch (e) {
    // si falla y parece por permisos/admin, intentamos demote -> remove
    const msg = String(e?.message || e)
    if (/admin|demote|not authorized|permission/i.test(msg) || /403|401|forbidden/i.test(msg)) {
      try {
        // Intentar demote (silencioso si falla lo ignoramos)
        await conn.groupParticipantsUpdate(groupId, [userJid], 'demote')
        await delay(1200)
        await conn.groupParticipantsUpdate(groupId, [userJid], 'remove')
        return true
      } catch (err2) {
        console.log(`⚠️ attemptRemove: no se pudo demote+remove ${userJid} en ${groupId}: ${err2?.message || err2}`)
        return false
      }
    }
    // Si no es error de permisos, re-lanzamos para manejo externo
    throw e
  }
}

const handler = async (m, { conn, command, text }) => {
  const emoji = '🚫'
  const done = '✅'
  const db = global.db.data.users || (global.db.data.users = {})

  // Reacciones por comando
  const reactions = { ln: '✅', unln: '☢️', cln: '👀', verln: '📜', usln: '🧹' }
  if (reactions[command])
    await conn.sendMessage(m.chat, { react: { text: reactions[command], key: m.key } })

  // Detectar usuario objetivo
  let userJid = null
  if (m.quoted) userJid = normalizeJid(m.quoted.sender)
  else if (m.mentionedJid?.length) userJid = normalizeJid(m.mentionedJid[0])
  else if (text) {
    const num = text.match(/\d{5,}/)?.[0]
    if (num) userJid = `${num}@s.whatsapp.net`
  }

  // Motivo
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

    // Expulsar de todos los grupos donde esté (con control de velocidad)
    const groupsObj = await conn.groupFetchAllParticipating().catch(() => ({}))
    const groups = Object.keys(groupsObj || {})
    const waitBetween = 1500
    let expulsados = 0

    for (const jid of groups) {
      try {
        await delay(waitBetween)
        const group = await conn.groupMetadata(jid).catch(() => null)
        if (!group?.participants) continue

        const member = group.participants.find(
          (p) => normalizeJid(p.id || p.jid) === normalizeJid(userJid)
        )
        if (member) {
          // verificar si bot es admin
          const botJid = conn.user?.id || conn.user?.jid
          const botParticipant = group.participants.find(p => (p.id || p.jid) === botJid)
          const botIsAdmin = !!(botParticipant && (botParticipant.admin || botParticipant.isAdmin || botParticipant.admin === 'admin'))

          if (!botIsAdmin) {
            console.log(`⚠️ No se pudo eliminar a ${userJid} de ${group.subject} porque el bot no es admin`)
            continue
          }

          // Intentar remover (si es admin se demotea primero internamente en attemptRemove)
          const removed = await attemptRemove(conn, jid, member.id || member.jid)
            .catch(err => {
              if (String(err?.message || err).includes('rate-overlimit') || String(err?.message || err).includes('429')) {
                console.log(`⚠️ Saltando grupo ${jid} por rate limit`)
                return false
              }
              console.log(`⚠️ No se pudo expulsar de ${jid}: ${err?.message || err}`)
              return false
            })

          if (removed) {
            expulsados++
            await conn.sendMessage(jid, {
              text: `🚫 @${userJid.split('@')[0]} está en la lista negra y ha sido eliminado automáticamente.\n📝 Motivo: ${reason}`,
              mentions: [userJid],
            }).catch(()=>{})
            console.log(`[AUTO-KICK] Expulsado ${userJid} de ${group.subject}`)
          }
        }
      } catch (e) {
        const em = String(e?.message || e)
        if (em.includes('rate-overlimit') || /429/.test(em)) {
          console.log(`⚠️ Saltando grupo ${jid} por rate limit (catch)`)
          await delay(3000)
          continue
        }
        console.log(`⚠️ Error en ciclo ln para ${jid}: ${e?.message || e}`)
      }
    }

    // Nota: no enviamos el resumen final (lo pediste así)
  }

  // --- QUITAR DE LISTA NEGRA ---
  else if (command === 'unln') {
    if (!db[userJid]?.banned)
      return conn.sendMessage(m.chat, {
        text: `${emoji} @${userJid.split('@')[0]} no está en la lista negra.`,
        mentions: [userJid],
      })

    db[userJid].banned = false
    db[userJid].banReason = ''
    db[userJid].bannedBy = null

    await conn.sendMessage(m.chat, {
      text: `${done} @${userJid.split('@')[0]} fue eliminado de la lista negra.`,
      mentions: [userJid],
    })
  }

  // --- CONSULTAR ESTADO ---
  else if (command === 'cln') {
    if (!db[userJid]?.banned)
      return conn.sendMessage(m.chat, {
        text: `✅ @${userJid.split('@')[0]} no está en la lista negra.`,
        mentions: [userJid],
      })

    await conn.sendMessage(m.chat, {
      text: `${emoji} @${userJid.split('@')[0]} está en la lista negra.\n📝 Motivo: ${
        db[userJid].banReason || 'No especificado'
      }`,
      mentions: [userJid],
    })
  }

  // --- VER LISTA COMPLETA ---
  else if (command === 'verln') {
    const bannedUsers = Object.entries(db).filter(([_, data]) => data?.banned)
    if (bannedUsers.length === 0)
      return conn.sendMessage(m.chat, { text: `${done} No hay usuarios en la lista negra.` })

    let list = '🚫 *Lista negra actual:*\n\n'
    const mentions = []

    for (const [jid, data] of bannedUsers) {
      list += `• @${jid.split('@')[0]}\n  Motivo: ${
        data.banReason || 'No especificado'
      }\n\n`
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
  if (db[sender]?.banned) {
    const reason = db[sender].banReason || 'No especificado'
    try {
      const groupMetadata = await conn.groupMetadata(m.chat)
      const botJid = conn.user?.id || conn.user?.jid
      const botParticipant = groupMetadata.participants.find(p => (p.id || p.jid) === botJid)
      const botIsAdmin = !!(botParticipant && (botParticipant.admin || botParticipant.isAdmin || botParticipant.admin === 'admin'))

      if (!botIsAdmin) {
        console.log(`⚠️ No se pudo eliminar a ${sender} porque el bot no es admin en ${m.chat}`)
        return
      }

      // Intentamos remover (si es admin, attemptRemove lo gestionará)
      const removed = await attemptRemove(conn, m.chat, sender).catch(err => {
        const em = String(err?.message || err)
        if (em.includes('rate-overlimit') || /429/.test(em)) return false
        console.log(`⚠️ No se pudo eliminar a ${sender}: ${em}`)
        return false
      })

      if (removed) {
        console.log(`[AUTO-KICK] Eliminado ${sender} del grupo ${m.chat}`)
        await conn.sendMessage(m.chat, {
          text: `🚫 @${sender.split('@')[0]} estaba en la lista negra y ha sido eliminado.\n📝 Motivo: ${reason}`,
          mentions: [sender],
        }).catch(()=>{})
      }
    } catch (e) {
      const em = String(e?.message || e)
      if (em.includes('rate-overlimit') || /429/.test(em)) return
      console.log(`⚠️ No se pudo eliminar a ${sender}: ${em}`)
    }
  }
}

// --- AUTO-KICK AL UNIRSE ---
handler.participantsUpdate = async function (event) {
  const conn = this
  const { id, participants, action } = event
  const db = global.db.data.users || {}
  if (action === 'add' || action === 'invite') {
    for (const user of participants) {
      const u = normalizeJid(user)
      if (db[u]?.banned) {
        const reason = db[u].banReason || 'No especificado'
        try {
          const groupMetadata = await conn.groupMetadata(id)
          const botJid = conn.user?.id || conn.user?.jid
          const botParticipant = groupMetadata.participants.find(p => (p.id || p.jid) === botJid)
          const botIsAdmin = !!(botParticipant && (botParticipant.admin || botParticipant.isAdmin || botParticipant.admin === 'admin'))

          if (!botIsAdmin) {
            console.log(`⚠️ No se pudo eliminar a ${u} porque el bot no es admin en ${id}`)
            continue
          }

          const removed = await attemptRemove(conn, id, u).catch(err => {
            const em = String(err?.message || err)
            if (em.includes('rate-overlimit') || /429/.test(em)) return false
            console.log(`⚠️ No se pudo eliminar a ${u} al unirse: ${em}`)
            return false
          })

          if (removed) {
            console.log(`[AUTO-KICK JOIN] ${u} eliminado del grupo ${id}`)
            await conn.sendMessage(id, {
              text: `🚫 @${u.split('@')[0]} está en la lista negra y ha sido eliminado automáticamente.\n📝 Motivo: ${reason}`,
              mentions: [u],
            }).catch(()=>{})
          }
        } catch (e) {
          const em = String(e?.message || e)
          if (em.includes('rate-overlimit') || /429/.test(em)) continue
          console.log(`⚠️ No se pudo eliminar a ${u} al unirse: ${em}`)
        }
      }
    }
  }
}

handler.help = ['ln', 'unln', 'cln', 'verln', 'usln']
handler.tags = ['owner']
handler.command = ['ln', 'unln', 'cln', 'verln', 'usln']
handler.rowner = true

export default handler
