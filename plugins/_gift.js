// 🐾 plugins/giftMaker.js — FelixCat_Bot 🎁 Convierte imagen o video en sticker animado tipo gift
import { sticker } from '../lib/sticker.js'

let handler = async (m, { conn, usedPrefix, command }) => {
  let q = m.quoted ? m.quoted : m
  let mime = (q.msg || q).mimetype || ''
  
  if (!/image|video/.test(mime))
    return m.reply(`🎁 Envía o responde a una *imagen o video* con:\n\n${usedPrefix + command}`)
  
  m.reply('⏳ Procesando tu gift, espera un momento... 😺')

  try {
    let media = await q.download()
    let out = await sticker(media, false, {
      pack: '🎁 FelixCat Gift',
      author: 'FelixCat_Bot 🐾'
    })
    
    await conn.sendFile(m.chat, out, 'gift.webp', '', m, true, { asSticker: true })
    m.reply('🎉 ¡Listo! Aquí tienes tu gift sticker 🐱✨')
  } catch (err) {
    console.error(err)
    m.reply('😿 Ocurrió un error al crear el gift.')
  }
}

handler.help = ['gift']
handler.tags = ['sticker']
handler.command = ['gift']

export default handler 
