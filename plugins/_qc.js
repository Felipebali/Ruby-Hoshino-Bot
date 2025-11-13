// 📂 plugins/_qc.js — FelixCat-Bot 🐾
// Genera un sticker de cita sin conexión ni dependencias externas

import { createCanvas, loadImage } from 'canvas'

let handler = async (m, { conn }) => {
  try {
    if (!m.quoted) return m.reply('🗨️ *Responde a un mensaje* para convertirlo en sticker.');

    const q = m.quoted
    const name = conn.getName(q.sender) || 'Usuario'
    const text = q.text || q.caption || '(sin texto)'

    // 🖌️ Crear lienzo
    const canvas = createCanvas(512, 512)
    const ctx = canvas.getContext('2d')

    // Fondo
    ctx.fillStyle = '#1b1b1b'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Nombre del autor
    ctx.font = 'bold 28px Sans'
    ctx.fillStyle = '#00e0ff'
    ctx.fillText(name, 30, 60)

    // Texto citado
    ctx.font = '24px Sans'
    ctx.fillStyle = '#ffffff'

    // Dividir texto largo en líneas
    const words = text.split(' ')
    let line = '', y = 110
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' '
      const metrics = ctx.measureText(testLine)
      if (metrics.width > 440 && n > 0) {
        ctx.fillText(line, 30, y)
        line = words[n] + ' '
        y += 30
      } else {
        line = testLine
      }
    }
    ctx.fillText(line, 30, y)

    // ✨ Convertir a buffer y enviar como sticker
    const buffer = canvas.toBuffer('image/png')
    await conn.sendMessage(m.chat, { sticker: buffer }, { quoted: m })
  } catch (e) {
    console.error(e)
    m.reply('❌ Error al generar el sticker de cita.')
  }
}

handler.command = ['qc']
handler.help = ['qc']
handler.tags = ['fun']

export default handler
