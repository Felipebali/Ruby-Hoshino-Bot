// 📂 plugins/_qc.js — FelixCat-Bot 🐾
// Convierte un mensaje citado en sticker tipo “quote” (sin librerías extra)

import fetch from 'node-fetch'

let handler = async (m, { conn }) => {
  try {
    if (!m.quoted) return m.reply('🗨️ *Responde a un mensaje* para convertirlo en sticker.');

    const q = m.quoted
    const name = conn.getName(q.sender) || 'Usuario'
    const text = q.text || q.caption || '(sin texto)'

    // 📸 Foto de perfil del autor del mensaje citado
    const profilePic = await conn.profilePictureUrl(q.sender, 'image').catch(() => 'https://i.imgur.com/8fK4h6F.png')

    // 🧩 Datos del mensaje para el diseño
    const payload = {
      type: 'quote',
      format: 'png',
      backgroundColor: '#1b1b1b',
      width: 512,
      height: 512,
      scale: 3,
      messages: [
        {
          entities: [],
          avatar: true,
          from: {
            id: 1,
            name: name,
            photo: { url: profilePic }
          },
          text: text,
          replyMessage: {}
        }
      ]
    }

    // 🧠 Generamos la imagen con la API de quotes
    const res = await fetch('https://quote.btch.bz/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    if (!res.ok) throw new Error('Error al generar la cita')
    const buffer = await res.arrayBuffer()

    // ✨ Enviar directamente como sticker
    await conn.sendMessage(m.chat, { sticker: Buffer.from(buffer) }, { quoted: m })
  } catch (e) {
    console.error(e)
    m.reply('❌ Ocurrió un error al generar el sticker de cita.')
  }
}

handler.command = ['qc']
handler.help = ['qc']
handler.tags = ['fun']

export default handler
