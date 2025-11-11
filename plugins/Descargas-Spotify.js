import axios from "axios"
import fetch from "node-fetch"

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text)
    return conn.reply(
      m.chat,
      `🎋 Por favor, proporciona el nombre de una canción o artista.\nEjemplo: ${usedPrefix}${command} <nombre>`,
      m
    )

  try {
    // 🔍 Buscamos la canción en la API Delirius
    let searchUrl = `https://api.delirius.store/search/spotify?q=${encodeURIComponent(text)}&limit=1`
    let searchRes = await axios.get(searchUrl, { timeout: 15000 })
    let result = searchRes.data?.data?.[0]

    if (!result)
      return conn.reply(m.chat, `❌ No se encontraron resultados para: *${text}*`, m)

    let { title, artist, url: spotifyUrl, image } = result

    // ⚙️ Intentamos descargar desde varias APIs seguras
    const apis = [
      `https://api.nekolabs.my.id/downloader/spotify/v1?url=${encodeURIComponent(spotifyUrl)}`,
      `https://api.sylphy.xyz/download/spotify?url=${encodeURIComponent(spotifyUrl)}&apikey=sylphy-c519`,
      `https://api.neoxr.eu/api/spotify?url=${encodeURIComponent(spotifyUrl)}&apikey=russellxz`
    ]

    let downloadUrl = null

    for (let api of apis) {
      try {
        let res = await axios.get(api, { timeout: 20000 })
        let data = res.data
        if (data?.result?.downloadUrl) downloadUrl = data.result.downloadUrl
        if (data?.data?.dl_url) downloadUrl = data.data.dl_url
        if (data?.data?.url) downloadUrl = data.data.url
        if (downloadUrl) break
      } catch (err) {
        console.log(`❌ Falló: ${api}`)
      }
    }

    if (!downloadUrl)
      return conn.reply(m.chat, `❌ No se encontró un link de descarga válido.`, m)

    // 🎵 Descargamos el audio
    let audio = await fetch(downloadUrl)
    let buffer = await audio.buffer()

    await conn.sendMessage(
      m.chat,
      {
        audio: buffer,
        mimetype: "audio/mpeg",
        fileName: `${title}.mp3`,
        ptt: false,
        contextInfo: {
          externalAdReply: {
            title: title,
            body: artist,
            thumbnailUrl: image,
            sourceUrl: spotifyUrl,
            mediaType: 1,
            renderLargerThumbnail: true,
          },
        },
      },
      { quoted: m }
    )
  } catch (e) {
    console.error(e)
    await conn.reply(m.chat, `❌ Error al buscar o descargar la canción.`, m)
  }
}

handler.help = ["spotify"]
handler.tags = ["download"]
handler.command = ["spotify", "splay"]
handler.group = true

export default handler
