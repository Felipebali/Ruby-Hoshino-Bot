// =================================================
// FelixCat_Bot 🐾 — Sistema de Cambios del Grupo
// Activar/Desactivar con comando .cambio
// Detecta: 21 nombre | 22 foto | 25 permisos
// =================================================

let WAMessageStubType = (await import('@whiskeysockets/baileys')).default
import chalk from 'chalk'
import fs from 'fs'
import axios from 'axios'
import fetch from 'node-fetch'

const lidCache = new Map()
const handler = m => m

// ================================
// COMANDO .cambio — interruptor
// ================================
let cambioHandler = async (m, { conn }) => {
  let chat = global.db.data.chats[m.chat]

  // Alternar estado
  chat.detect = !chat.detect

  return m.reply(
    `🐾 Sistema de cambios del grupo: *${chat.detect ? 'ACTIVADO ✅' : 'DESACTIVADO ❌'}*`
  )
}

cambioHandler.help = ['cambio']
cambioHandler.tags = ['group']
cambioHandler.command = ['cambio']
cambioHandler.group = true
cambioHandler.admin = true

export { cambioHandler as default }

// ================================
// BEFORE — Eventos del grupo
// ================================
handler.before = async function (m, { conn, participants }) {

  if (!m.messageStubType || !m.isGroup) return

  const chat = global.db.data.chats[m.chat]
  if (!chat.detect) return  // ← Sistema desactivado

  const usuario = await resolveLidToRealJid(m?.sender, conn, m?.chat)
  const groupAdmins = participants.filter(p => p.admin)

  // Miniatura estética
  const thumbnail = Buffer.from(
    (await axios.get("https://files.catbox.moe/t19dtc.jpg", { responseType: "arraybuffer" })).data,
    'binary'
  )

  const shadow_xyz = {
    key: { fromMe: false, participant: "0@s.whatsapp.net", remoteJid: "status@broadcast" },
    message: {
      productMessage: {
        product: {
          productImage: { mimetype: "image/jpeg", jpegThumbnail: thumbnail },
          title: "𐔌 . ⋮ 🪺 ᗩ ᐯ I Տ O 🎄 .ᐟ ֹ ₊ ꒱",
          description: "Sistema de cambios del grupo",
          currencyCode: "USD",
          priceAmount1000: 5000,
          retailerId: "FelixCatBot",
          productImageCount: 1
        },
        businessOwnerJid: "51919199620@s.whatsapp.net"
      }
    }
  }

  const rcanal = {
    contextInfo: {
      isForwarded: true,
      forwardedNewsletterMessageInfo: { newsletterJid: channelRD.id, serverMessageId: '', newsletterName: channelRD.name },
      externalAdReply: {
        title: 'FelixCat_Bot 🐾 — Sistema de cambios',
        body: null, mediaUrl: null, description: null, previewType: "PHOTO",
        thumbnail: await (await fetch(icono)).buffer(),
        sourceUrl: redes, mediaType: 1
      },
      mentionedJid: []
    }
  }

  const nombreMsg =
`> 🍃 @${usuario.split('@')[0]} ha cambiado el *nombre del grupo*.
> 🌱 Nuevo nombre:
> *${m.messageStubParameters[0]}*`

  const pp = await conn.profilePictureUrl(m.chat, 'image').catch(_ => null) || 'https://files.catbox.moe/xr2m6u.jpg'

  const fotoMsg =
`> 🥥 Se ha cambiado la *foto del grupo*.
> 🌿 Acción hecha por:
> » @${usuario.split('@')[0]}`

  const editMsg =
`> 💐 @${usuario.split('@')[0]} ha cambiado los *permisos de edición*.
> Ahora: *${m.messageStubParameters[0] == 'on' ? 'solo admins' : 'todos'}* pueden modificar info.`

  // Detectar eventos
  if (m.messageStubType == 21) { // Nombre
    rcanal.contextInfo.mentionedJid = [usuario, ...groupAdmins.map(v => v.id)]
    await this.sendMessage(m.chat, { text: nombreMsg, ...rcanal }, { quoted: shadow_xyz })
  }

  if (m.messageStubType == 22) { // Foto
    rcanal.contextInfo.mentionedJid = [usuario, ...groupAdmins.map(v => v.id)]
    await this.sendMessage(m.chat, { image: { url: pp }, caption: fotoMsg, ...rcanal }, { quoted: shadow_xyz })
  }

  if (m.messageStubType == 25) { // Permisos
    rcanal.contextInfo.mentionedJid = [usuario, ...groupAdmins.map(v => v.id)]
    await this.sendMessage(m.chat, { text: editMsg, ...rcanal }, { quoted: shadow_xyz })
  }
}

// =================================================
// LID → JID REAL
// =================================================
async function resolveLidToRealJid(lid, conn, groupChatId, maxRetries = 3, retryDelay = 3000) {
  const inputJid = lid.toString()

  if (!inputJid.endsWith("@lid") || !groupChatId?.endsWith("@g.us"))
    return inputJid.includes("@") ? inputJid : `${inputJid}@s.whatsapp.net`

  if (lidCache.has(inputJid)) return lidCache.get(inputJid)

  const lidToFind = inputJid.split("@")[0]
  let attempts = 0

  while (attempts < maxRetries) {
    try {
      const metadata = await conn?.groupMetadata(groupChatId)
      for (const participant of metadata.participants) {
        try {
          const details = await conn?.onWhatsApp(participant.jid)
          if (!details?.[0]?.lid) continue

          const possible = details[0].lid.split("@")[0]
          if (possible === lidToFind) {
            lidCache.set(inputJid, participant.jid)
            return participant.jid
          }
        } catch { continue }
      }

      lidCache.set(inputJid, inputJid)
      return inputJid
    } catch {
      attempts++
      await new Promise(r => setTimeout(r, retryDelay))
    }
  }

  return inputJid
} 
