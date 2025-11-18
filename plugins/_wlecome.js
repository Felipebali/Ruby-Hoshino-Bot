import fetch from 'node-fetch'
import { WAMessageStubType } from '@whiskeysockets/baileys'

// Prefijos por país
const prefijosPais = {
  '1': '🇺🇸 EE.UU / 🇨🇦 Canadá',
  '34': '🇪🇸 España',
  '54': '🇦🇷 Argentina',
  '598': '🇺🇾 Uruguay',
  '57': '🇨🇴 Colombia',
  '58': '🇻🇪 Venezuela',
  '52': '🇲🇽 México',
  '55': '🇧🇷 Brasil'
}

function detectarPais(jid) {
  const num = jid.split('@')[0]
  for (const [prefijo, pais] of Object.entries(prefijosPais)) {
    if (num.startsWith(prefijo)) return pais
  }
  return '🌍 Desconocido'
}

// Generar bienvenida
async function generarBienvenida({ conn, userId, groupMetadata }) {
  const username = `@${userId.split('@')[0]}`
  const pp = await conn.profilePictureUrl(userId).catch(() => 'https://files.catbox.moe/xr2m6u.jpg')
  const fecha = new Date()
  const caption = `🌸✨ Hola ${username} ✨🌸
Bienvenid@ al grupo *${groupMetadata.subject}* 💚

🌿 Info del grupo:
👥 Miembros: ${groupMetadata.participants.length + 1}
🌍 País: ${detectarPais(userId)}
⏰ Hora: ${fecha.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
📅 Fecha: ${fecha.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
📝 Descripción: ${groupMetadata.desc || 'Sin descripción'}`
  return { pp, caption }
}

// Generar despedida
async function generarDespedida({ conn, userId, groupMetadata }) {
  const username = `@${userId.split('@')[0]}`
  const pp = await conn.profilePictureUrl(userId).catch(() => 'https://files.catbox.moe/xr2m6u.jpg')
  const caption = `🌸💫 ${username} ha dejado el grupo *${groupMetadata.subject}* 💐

🌿 Estado actual:
👥 Miembros: ${groupMetadata.participants.length - 1}
🌍 País: ${detectarPais(userId)}
⏰ Hora: ${new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
📅 Fecha: ${new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
📝 Descripción: ${groupMetadata.desc || 'Sin descripción'}`
  return { pp, caption }
}

// Handler principal
let handler = m => m
handler.before = async function(m, { conn, groupMetadata }) {
  if (!m.isGroup || !m.messageStubType) return true
  const chat = global.db.data.chats[m.chat]
  if (!chat.welcome) return true

  const userId = m.messageStubParameters?.[0]
  if (!userId) return true

  // Thumbnail de contacto
  let thumbBuffer
  try {
    const res = await fetch('https://i.postimg.cc/rFfVL8Ps/image.jpg')
    thumbBuffer = Buffer.from(await res.arrayBuffer())
  } catch {
    thumbBuffer = null
  }

  const fkontak = {
    key: { participant: '0@s.whatsapp.net', remoteJid: 'status@broadcast', fromMe: false, id: 'Halo' },
    message: { locationMessage: { name: '🍓 Welcome - FelixCatBot 🍟', jpegThumbnail: thumbBuffer } }
  }

  if (m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_ADD) {
    const { pp, caption } = await generarBienvenida({ conn, userId, groupMetadata })
    await conn.sendMessage(m.chat, { image: { url: pp }, caption, mentions: [userId] }, { quoted: fkontak })
  }

  if (m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_REMOVE || m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_LEAVE) {
    const { pp, caption } = await generarDespedida({ conn, userId, groupMetadata })
    await conn.sendMessage(m.chat, { image: { url: pp }, caption, mentions: [userId] }, { quoted: fkontak })
  }
}

export { generarBienvenida, generarDespedida }
export default handler
