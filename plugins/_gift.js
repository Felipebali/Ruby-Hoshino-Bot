// 🐾 plugins/giftMaker.js — FelixCat_Bot 🎁 Convierte imagen o video en sticker real tipo gift
import { sticker } from '../lib/sticker.js'

let handler = async (m, { conn, usedPrefix, command }) => {
  let q = m.quoted ? m.quoted : m
  let mime = (q.msg || q).mimetype || ''
  
  if (!/image|video/.test(mime))
    return m.reply(`🎁 Envía o responde a una *imagen o video corto (menos de 8s)* con:\n\n${usedPrefix + command}`)
  
  await m.react('⏳') // reacción mientras procesa
  
  try {
    let media = await q.download()
    let stiker = await sticker(media, false, {
      pack: '🎁 FelixCat Gift',
      author: 'FelixCat_Bot 🐾'
    })
    
    if (stiker) {
      await conn.sendMessage(m.chat, { sticker: stiker }, { quoted: m })
      await m.react('✅')
    } else {
      await m.reply('😿 No se pudo generar el gift sticker.')
    }
  } catch (err) {
    console.error(err)
    await m.reply('❌ Error al crear el gift. Asegúrate de que el video o imagen sea válido.')
  }
}

handler.help = ['gift']
handler.tags = ['sticker']
handler.command = ['gift']

export default handler
