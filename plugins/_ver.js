// 📂 plugins/_ver.js — FelixCat-Bot 🐾
// Recupera fotos, videos o stickers en su formato original (sin errores)

import { webp2png } from '../lib/webp2mp4.js'

let handler = async (m, { conn }) => {

  // --- OWNERS ---
  const owners = global.owner.map(o => o[0].replace(/[^0-9]/g, ''))
  const senderNumber = m.sender.replace(/[^0-9]/g, '')

  if (!owners.includes(senderNumber)) {
    await m.react('✖️')
    return conn.reply(m.chat, '❌ Solo los *owners* pueden usar este comando.', m)
  }

  try {
    const q = m.quoted ? m.quoted : m
    const msg = q.msg || q.message || q

    // Detecta tipo de media
    const type = Object.keys(msg)[0] || ''
    const media = msg[type] || {}

    const mime = media.mimetype || ''

    // Validación de media
    if (!/webp|image|video/.test(mime)) {
      return conn.reply(m.chat, '⚠️ Responde a una *imagen, sticker o video* válido.', m)
    }

    // Bloque crítico: validar que tenga mediaKey
    if (!media.mediaKey) {
      return conn.reply(m.chat, '⚠️ No puedo descargar este archivo (no tiene mediaKey). Reenvialo sin reenviar como "reenviado".', m)
    }

    await m.react('📥')

    // Descarga segura
    let buffer = null
    try {
      buffer = await q.download()
    } catch {
      return conn.reply(m.chat, '⚠️ No se pudo descargar el archivo (error interno).', m)
    }

    if (!buffer) {
      return conn.reply(m.chat, '⚠️ No pude recuperar el archivo.', m)
    }

    // --- Sticker webp → PNG ---
    if (/webp/.test(mime)) {
      const result = await webp2png(buffer)
      if (result?.url) {
        await conn.sendFile(m.chat, result.url, 'sticker.png', '🖼️ Sticker convertido a imagen.', m)
        await m.react('✅')
        return
      }
    }

    // --- Imagen o video normal ---
    let ext = mime.split('/')[1]
    await conn.sendFile(m.chat, buffer, 'recuperado.' + ext, '📸 Archivo recuperado.', m)
    await m.react('✅')

  } catch (e) {
    console.error('❌ ERROR EN _ver.js:', e)
    await conn.reply(m.chat, '⚠️ Error al recuperar el archivo.', m)
    await m.react('✖️')
  }
}

handler.help = ['ver']
handler.tags = ['tools', 'owner']
handler.command = ['ver', 'r']
handler.owner = false

export default handler
