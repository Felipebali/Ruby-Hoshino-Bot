import fs from 'fs'
import axios from 'axios'

let handler = async (m, { conn }) => {
  if (!m.quoted || !m.quoted.message || !/image/.test(m.quoted.mtype)) {
    return conn.reply(m.chat, '⚠️ Responde a una imagen con el comando .hd', m)
  }

  try {
    let media = await m.quoted.download?.()
    if (!media) throw 'No se pudo descargar la imagen'

    // Subir imagen a un servidor temporal para procesarla
    let { data: upload } = await axios.post('https://api.nekobot.xyz/api/imagegen', {
      type: 'deepfry', // mejora tipo IA
      image: 'data:image/jpeg;base64,' + media.toString('base64')
    })

    if (!upload || !upload.message) throw 'Error al mejorar la imagen'

    await conn.sendMessage(m.chat, { image: { url: upload.message }, caption: '✅ Imagen mejorada en HD' }, { quoted: m })

  } catch (e) {
    console.error(e)
    conn.reply(m.chat, '❌ Ocurrió un error al mejorar la imagen.', m)
  }
}

handler.command = /^hd$/i
handler.help = ['hd']
handler.tags = ['herramientas']

export default handler 
