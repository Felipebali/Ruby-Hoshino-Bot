import fs from 'fs'
import axios from 'axios'

let handler = async (m, { conn }) => {
  try {
    // Detectar si el mensaje citado contiene una imagen
    const quoted = m.quoted ? m.quoted : m
    const mime = (quoted.msg || quoted).mimetype || quoted.mtype || ''

    // Si no es imagen, avisar
    if (!/image/.test(mime)) {
      return conn.reply(m.chat, '⚠️ Responde a una imagen con el comando .hd', m)
    }

    // Descargar la imagen citada
    const imgBuffer = await quoted.download?.()
    if (!imgBuffer) throw 'No se pudo descargar la imagen'

    // Subir la imagen a un host temporal
    const upload = await axios.post('https://api.imgbb.com/1/upload', imgBuffer, {
      headers: { 'Content-Type': 'application/octet-stream' },
      params: { key: '2b7a1b9a3a347c24cf1f70a9c5f95d55' } // API key pública gratuita
    })

    const imgUrl = upload.data?.data?.url
    if (!imgUrl) throw 'No se pudo subir la imagen'

    // Enviar a API de mejora IA
    const enhance = await axios.get(`https://imageupscaler.halolol.repl.co/upscale?url=${encodeURIComponent(imgUrl)}`, {
      responseType: 'arraybuffer'
    })

    // Guardar el resultado temporalmente
    const out = `./tmp/hd-${Date.now()}.jpg`
    fs.writeFileSync(out, Buffer.from(enhance.data))

    // Enviar la imagen mejorada
    await conn.sendMessage(
      m.chat,
      { image: fs.readFileSync(out), caption: '✅ Imagen mejorada en HD' },
      { quoted: m }
    )

    fs.unlinkSync(out)
  } catch (err) {
    console.error(err)
    await conn.reply(m.chat, '❌ No se pudo mejorar la imagen. Intenta con otra.', m)
  }
}

handler.command = /^hd$/i
handler.help = ['hd']
handler.tags = ['herramientas']

export default handler 
