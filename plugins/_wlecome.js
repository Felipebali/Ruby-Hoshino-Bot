import fs from 'fs'
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
  '55': '🇧🇷 Brasil',
  // Agregá los que quieras
}

function detectarPais(jid) {
  const num = jid.split('@')[0]
  for (const [prefijo, pais] of Object.entries(prefijosPais)) {
    if (num.startsWith(prefijo)) return pais
  }
  return '🌍 Desconocido'
}

// Generar bienvenida
async function generarBienvenida({ conn, userId, groupMetadata, chat }) {
  const username = `@${userId.split('@')[0]}`
  const pp = await conn.profilePictureUrl(userId, 'image').catch(() => 'https://files.catbox.moe/xr2m6u.jpg')

  const fecha = new Date()
  const fechaTexto = fecha.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })
  const hora = fecha.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })

  const pais = detectarPais(userId)
  const groupSize = groupMetadata.participants.length + 1
  const desc = groupMetadata.desc?.toString() || 'Sin descripción'

  const caption = `🌸✨ Hola ${username} ✨🌸
Bienvenid@ al grupo *${groupMetadata.subject}* 💚

🌿 Info del grupo:
👥 Miembros: ${groupSize}
🌍 País: ${pais}
⏰ Hora: ${hora}
📅 Fecha: ${fechaTexto}
📝 Descripción: ${desc}`

  return { pp, caption, username }
}

// Generar despedida
async function generarDespedida({ conn, userId, groupMetadata, chat }) {
  const username = `@${userId.split('@')[0]}`
  const pp = await conn.profilePictureUrl(userId, 'image').catch(() => 'https://files.catbox.moe/xr2m6u.jpg')

  const fecha = new Date()
  const fechaTexto = fecha.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })
  const hora = fecha.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })

  const pais = detectarPais(userId)
  const groupSize = groupMetadata.participants.length - 1
  const desc = groupMetadata.desc?.toString() || 'Sin descripción'

  const caption = `🌸💫 ${username} ha dejado el grupo *${groupMetadata.subject}* 💐

🌿 Estado actual:
👥 Miembros: ${groupSize}
🌍 País: ${pais}
⏰ Hora: ${hora}
📅 Fecha: ${fechaTexto}
📝 Descripción: ${desc}`

  return { pp, caption, username }
}

// Handler principal
let handler = m => m
handler.before = async function (m, { conn, participants, groupMetadata }) {
  if (!m.messageStubType || !m.isGroup) return true
  const chat = global.db.data.chats[m.chat]
  if (!chat.welcome) return true

  const userId = m.messageStubParameters[0]
  if (!userId) return true

  const who = userId || '0@s.whatsapp.net'
  const meta = groupMetadata
  const totalMembers = meta.participants.length
  const date = new Date().toLocaleString('es-PE', { year: 'numeric', month: '2-digit', day: '2-digit', hour12: false, hour: '2-digit', minute: '2-digit' })

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
    message: { locationMessage: { name: '🍓 Welcome - FelixCatBot 🍟', jpegThumbnail: thumbBuffer } },
    participant: '0@s.whatsapp.net'
  }

  // BIENVENIDA
  if (m.messageStubType == WAMessageStubType.GROUP_PARTICIPANT_ADD) {
    const { pp, caption } = await generarBienvenida({ conn, userId, groupMetadata, chat })
    const productMessage = {
      product: {
        productImage: { url: pp },
        productId: '24529689176623820',
        title: `🌿 ¡Bienvenido al grupo! 🌿`,
        description: caption,
        currencyCode: 'USD',
        priceAmount1000: '100000',
        retailerId: 1677,
        url: `https://wa.me/${userId.split('@')[0]}`,
        productImageCount: 1
      },
      businessOwnerJid: who,
      caption: caption,
      footer: `👥 Miembros: ${totalMembers} • 📅 ${date}`,
      mentions: [userId]
    }
    await conn.sendMessage(m.chat, productMessage, { quoted: fkontak })
  }

  // DESPEDIDA
  if (m.messageStubType == WAMessageStubType.GROUP_PARTICIPANT_REMOVE || m.messageStubType == WAMessageStubType.GROUP_PARTICIPANT_LEAVE) {
    const { pp, caption } = await generarDespedida({ conn, userId, groupMetadata, chat })
    const productMessage = {
      product: {
        productImage: { url: pp },
        productId: '24529689176623820',
        title: `🌿 Alguien se ha ido... 🌿`,
        description: caption,
        currencyCode: 'USD',
        priceAmount1000: '100000',
        retailerId: 1677,
        url: `https://wa.me/${userId.split('@')[0]}`,
        productImageCount: 1
      },
      businessOwnerJid: who,
      caption: caption,
      footer: `👥 Miembros: ${totalMembers} • 📅 ${date}`,
      mentions: [userId]
    }
    await conn.sendMessage(m.chat, productMessage, { quoted: fkontak })
  }
}

export { generarBienvenida, generarDespedida }
export default handler
