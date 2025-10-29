// 📂 plugins/propietario-ln.js
function normalizeJid(jid = '') {
  if (!jid) return null
  return jid.replace(/@c\.us$/, '@s.whatsapp.net').replace(/@s\.whatsapp\.net$/, '@s.whatsapp.net')
}

const handler = async (m, { conn, command, text }) => {
  const emoji = '🚫'
  const done = '✅'
  const db = global.db.data.users || (global.db.data.users = {})

  const reactions = { ln: '✅', unln: '☢️', cln: '👀', verln: '📜', usln: '🧹' }
  if (reactions[command]) await conn.sendMessage(m.chat, { react: { text: reactions[command], key: m.key } })

  // --- DETECTAR USUARIO ---
  let userJid = null
  if (m.quoted) userJid = normalizeJid(m.quoted.sender)
  else if (m.mentionedJid?.length) userJid = normalizeJid(m.mentionedJid[0])
  else if (text) {
    const num = text.match(/\d{5,}/)?.[0]
    if (num) userJid = `${num}@s.whatsapp.net`
  }

  let reason = text ? text.replace(/@/g, '').replace(userJid?.split('@')[0] || '', '').trim() : ''
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
      mentions: [userJid]
    })

    // Expulsar de grupos (limitado a 15 para evitar rate limit)
    const groups = Object.keys(await conn.groupFetchAllParticipating()).slice(0, 15)
    for (const jid of groups) {
      await new Promise(r => setTimeout(r, 3000))
      try {
        const group = await conn.groupMetadata(jid)
        const member = group.participants.find(p => normalizeJid(p.id) === normalizeJid(userJid))
        if (member) {
          await conn.sendMessage(jid, {
            text: `🚫 @${userJid.split('@')[0]} está en la lista negra y será eliminado automáticamente.\n📝 Motivo: ${reason}`,
            mentions: [userJid]
          })
          await new Promise(r => setTimeout(r, 2500))
          await conn.groupParticipantsUpdate(jid, [member.id], 'remove')
          console.log(`[AUTO-KICK] Expulsado ${userJid} de ${group.subject}`)
        }
      } catch (e) {
        if (e.data === 429 || e.message.includes('rate-overlimit')) {
          console.log(`⚠️ Rate limit en ${jid}, pausando 10s...`)
          await new Promise(r => setTimeout(r, 10000))
          continue
        }
        console.log(`⚠️ No se pudo expulsar de ${jid}: ${e.message}`)
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

    await conn.sendMessage(m.chat, {
      text: `${done} @${userJid.split('@')[0]} fue eliminado de la lista negra.`,
      mentions: [userJid]
    })
  }

  // --- CONSULTAR ESTADO ---
  else if (command === 'cln') {
    if (!db[userJid]?.banned)
      return conn.sendMessage(m.chat, { text: `✅ @${userJid.split('@')[0]} no está en la lista negra.`, mentions: [userJid] })

    await conn.sendMessage(m.chat, {
      text: `${emoji} @${userJid.split('@')[0]} está en la lista negra.\n📝 Motivo: ${db[userJid].banReason || 'No especificado'}`,
      mentions: [userJid]
    })
  }

  // --- VER LISTA COMPLETA ---
  else if (command === 'verln') {
    const bannedUsers = Object.entries(db).filter(([_, data]) => data?.banned)
    if (bannedUsers.length === 0)
      return conn.sendMessage(m.chat, { text: `${done} No hay usuarios en la lista negra.` })

    const chunkSize = 10 // máximo 10 menciones por mensaje
    for (let i = 0; i < bannedUsers.length; i += chunkSize) {
      const chunk = bannedUsers.slice(i, i + chunkSize)
      let list = '🚫 *Lista negra actual:*\n\n'
      const mentions = []

      for (const [jid, data] of chunk) {
        list += `• @${jid.split('@')[0]}\n  Motivo: ${data.banReason || 'No especificado'}\n\n`
        mentions.push(jid)
      }

      try {
        await conn.sendMessage(m.chat, { text: list.trim(), mentions })
        await new Promise(r => setTimeout(r, 3000))
      } catch (e) {
        if (e.data === 429 || e.message.includes('rate-overlimit')) {
          console.log(`⚠️ Rate limit al mostrar lista, esperando 10s...`)
          await new Promise(r => setTimeout(r, 10000))
          continue
        }
        console.log(`⚠️ Error al enviar lista negra: ${e.message}`)
      }
    }
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
handler.all = async function (m, { conn }) {
  if (!m.isGroup || !m.sender) return
  const db = global.db.data.users || {}
  const sender = normalizeJid(m.sender)
  if (db[sender]?.banned) {
    const reason = db[sender].banReason || 'No especificado'
    try {
      await conn.sendMessage(m.chat, {
        text: `🚫 @${sender.split('@')[0]} está en la lista negra y será eliminado.\n📝 Motivo: ${reason}`,
        mentions: [sender]
      })
      await new Promise(r => setTimeout(r, 2500))
      await conn.groupParticipantsUpdate(m.chat, [sender], 'remove')
      console.log(`[AUTO-KICK] Eliminado ${sender}`)
    } catch (e) {
      if (e.data === 429 || e.message.includes('rate-overlimit')) {
        console.log(`⚠️ Rate limit al intentar autokick. Esperando...`)
        await new Promise(r => setTimeout(r, 8000))
      } else console.log(`⚠️ No se pudo eliminar a ${sender}: ${e.message}`)
    }
  }
}

// --- AUTO-KICK AL UNIRSE ---
handler.participantsUpdate = async function ({ id, participants, action }, conn) {
  if (action !== 'add' && action !== 'invite') return
  const db = global.db.data.users || {}
  for (const user of participants) {
    const u = normalizeJid(user)
    if (db[u]?.banned) {
      const reason = db[u].banReason || 'No especificado'
      try {
        await conn.sendMessage(id, {
          text: `🚫 @${u.split('@')[0]} está en la lista negra y será eliminado automáticamente.\n📝 Motivo: ${reason}`,
          mentions: [u]
        })
        await new Promise(r => setTimeout(r, 2500))
        await conn.groupParticipantsUpdate(id, [u], 'remove')
        console.log(`[AUTO-KICK JOIN] ${u} eliminado`)
      } catch (e) {
        if (e.data === 429 || e.message.includes('rate-overlimit')) {
          console.log(`⚠️ Rate limit al expulsar a ${u}, pausando 10s...`)
          await new Promise(r => setTimeout(r, 10000))
        } else console.log(`⚠️ No se pudo eliminar a ${u}: ${e.message}`)
      }
    }
  }
}

handler.help = ['ln', 'unln', 'cln', 'verln', 'usln']
handler.tags = ['owner']
handler.command = ['ln', 'unln', 'cln', 'verln', 'usln']
handler.rowner = true

export default handler
