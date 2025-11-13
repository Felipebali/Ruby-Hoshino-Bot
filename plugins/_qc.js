// 📂 plugins/_qc.js — FelixCat-Bot 🐾
// Convierte un mensaje citado en sticker tipo “quote” usando una API alternativa

import fetch from 'node-fetch'

let handler = async (m, { conn }) => {
  try {
    if (!m.quoted) return m.reply('🗨️ *Responde a un mensaje* para convertirlo en sticker.');

    const q = m.quoted
    const name = conn.getName(q.sender) || 'Usuario'
    const text = q.text || q.caption || '(sin texto)'
    const profilePic = await conn.profilePictureUrl(q.sender, 'image').catch(() => 'https://i.imgur.com/8fK4h6F.png')

    // 🧠 API alternativa más estable
    const apiUrl = `https://api.akuari.my.id/canvas/qc?avatar=${encodeURIComponent(profilePic)}&name=${encodeURIComponent(name)}&text=${encodeURIComponent(text)}`

    const res = await fetch(apiUrl)
    if (!res.ok) throw new Error('Error al generar la imagen de cita.')

    const buffer = await res.arrayBuffer()

    // ✨ Enviar el sticker generado
    await conn.sendMessage(m.chat, { sticker: Buffer.from(buffer) }, { quoted: m })

  } catch (e) {
    console.error(e)
    m.reply('❌ No se pudo generar el sticker de cita. La API puede estar caída o sin conexión.')
  }
}

handler.command = ['qc']
handler.help = ['qc']
handler.tags = ['fun']

export default handler
