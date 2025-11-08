// 🐾 plugins/_gift.js — FelixCat_Bot 🎁 Convierte imagen o video en sticker tipo gift (compatible con Termux)
import { writeFileSync, unlinkSync } from 'fs'
import ffmpeg from 'fluent-ffmpeg'
import path from 'path'

let handler = async (m, { conn }) => {
  let q = m.quoted ? m.quoted : m
  let mime = (q.msg || q).mimetype || ''

  if (!/image|video/.test(mime)) 
    return m.reply('🎁 Responde a una imagen o video corto con *.gift*')

  m.reply('⏳ Creando tu gift sticker, espera un momento... 😸')

  try {
    let media = await q.download()
    if (!media) throw 'No se pudo descargar el archivo.'

    // Ruta temporal
    let inputPath = path.join('./temp', `${Date.now()}.mp4`)
    let outputPath = path.join('./temp', `${Date.now()}.webp`)
    writeFileSync(inputPath, media)

    await new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .inputFormat('mp4')
        .outputOptions([
          '-vcodec', 'libwebp',
          '-vf', "scale=512:512:force_original_aspect_ratio=decrease,fps=15,pad=512:512:-1:-1:color=white",
          '-loop', '0',
          '-ss', '00:00:00',
          '-t', '00:00:08',
          '-preset', 'default',
          '-an',
          '-vsync', '0'
        ])
        .save(outputPath)
        .on('end', resolve)
        .on('error', reject)
    })

    let stickerData = { url: outputPath }
    await conn.sendMessage(m.chat, { sticker: stickerData }, { quoted: m })
    m.reply('🎉 ¡Listo! Tu gift está preparado 🐱')

    unlinkSync(inputPath)
    unlinkSync(outputPath)

  } catch (e) {
    console.error(e)
    m.reply('❌ Error al crear el gift. Verificá que el video dure menos de 8 segundos.')
  }
}

handler.command = ['gift']
handler.help = ['gift']
handler.tags = ['sticker']

export default handler
