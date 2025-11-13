// 📂 plugins/qc.js — FelixCat-Bot 🐾
// Convierte un mensaje citado en sticker tipo “quote”

import { Sticker } from 'wa-sticker-formatter'
import fetch from 'node-fetch'

let handler = async (m, { conn }) => {
  try {
    // Si no hay mensaje citado
    if (!m.quoted) return m.reply('🗨️ Responde a un mensaje para convertirlo en sticker.');

    const q = m.quoted
    const user = await conn.fetchStatus(q.sender).catch(() => ({}))
    const name = conn.getName(q.sender) || 'Usuario'
    const text = q.text || q.caption || '(sin texto)'

    // 📸 Imagen de perfil del autor del mensaje citado
    const profilePic = await conn.profilePictureUrl(q.sender, 'image').catch(() => 'https://i.imgur.com/8fK4h6F.png')

    // 🧩 Datos para el diseño del sticker
    const payload = {
      type: "quote",
      format: "png",
      backgroundColor: "#1b1b1b",
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

    // 🧠 Generamos imagen con API
    const res = await fetch('https://quote.btch.bz/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    if (!res.ok) throw new Error('No se pudo generar la cita.')
    const imgBuffer = await res.arrayBuffer()

    // ✨ Convertir la imagen en sticker
    const sticker = new Sticker(Buffer.from(imgBuffer), {
      pack: 'FelixCat 🐾',
      author: 'Feli & G',
      type: 'full',
      categories: ['🤖', '💬'],
      id: 'qc-sticker',
      quality: 90
    })

    const stcBuffer = await sticker.build()
    await conn.sendMessage(m.chat, { sticker: stcBuffer }, { quoted: m })
  } catch (err) {
    console.error(err)
    m.reply('❌ Error al generar el sticker de cita.')
  }
}

handler.command = ['qc']
handler.help = ['qc']
handler.tags = ['fun']
handler.register = true

export default handler 
