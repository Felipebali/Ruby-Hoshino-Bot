import fetch from 'node-fetch'

// Dueños con permiso total (números actualizados)
const owners = [
  '59898719147@s.whatsapp.net',
  '59896026646@s.whatsapp.net',
  '59892363485@s.whatsapp.net' // número nuevo agregado
]

let handler = async (m, { conn, args, command }) => {
  // Solo dueños
  if (!owners.includes(m.sender))
    return conn.reply(m.chat, '🚫 Solo los dueños pueden usar los comandos +18.', m)

  const query = args.join(" ")

  // Algunos comandos necesitan texto
  const needText = ['xnxx', 'xvideos', 'ph', 'pornhub', 'hentai', 'rule34']
  if (needText.includes(command) && !query)
    return conn.reply(m.chat, `🔞 Uso: .${command} <texto>`, m)

  try {

    // =============== X N X X ===============
    if (command === 'xnxx') {
      let search = await fetch(`https://api-lolhuman.xyz/api/xnxxsearch?apikey=GataDios&q=${encodeURIComponent(query)}`)
      let json = await search.json()

      if (!json.result?.length)
        return conn.reply(m.chat, '❌ No encontré resultados.', m)

      let info = await fetch(`https://api-lolhuman.xyz/api/xnxx?apikey=GataDios&url=${encodeURIComponent(json.result[0].link)}`)
      let data = await info.json()

      return conn.sendMessage(m.chat, {
        video: { url: data.result.files.low },
        caption: `🔞 ${data.result.title}`
      }, { quoted: m })
    }

    // =============== X V I D E O S ===============
    if (command === 'xvideos') {
      let search = await fetch(`https://api.lolhuman.xyz/api/xvideossearch?apikey=GataDios&q=${encodeURIComponent(query)}`)
      let json = await search.json()

      if (!json.result?.length)
        return conn.reply(m.chat, '❌ No encontré resultados.', m)

      let info = await fetch(`https://api-lolhuman.xyz/api/xvideos?apikey=GataDios&url=${encodeURIComponent(json.result[0].link)}`)
      let data = await info.json()

      return conn.sendMessage(m.chat, {
        video: { url: data.result.files.low },
        caption: `🔞 ${data.result.title}`
      }, { quoted: m })
    }

    // =============== P O R N H U B ===============
    if (command === 'ph' || command === 'pornhub') {
      let res = await fetch(`https://api.lolhuman.xyz/api/pornhubsearch?apikey=GataDios&q=${encodeURIComponent(query)}`)
      let json = await res.json()

      if (!json.result?.length)
        return conn.reply(m.chat, '❌ No encontré resultados.', m)

      let info = await fetch(`https://api-lolhuman.xyz/api/pornhub?apikey=GataDios&url=${encodeURIComponent(json.result[0].url)}`)
      let data = await info.json()

      return conn.sendMessage(m.chat, {
        video: { url: data.result.video_1 },
        caption: `🔞 ${data.result.title}`
      }, { quoted: m })
    }

    // =============== H E N T A I ===============
    if (command === 'hentai') {
      let res = await fetch(`https://api.lolhuman.xyz/api/random/hentai?apikey=GataDios`)
      let json = await res.json()

      if (!json.url && !json.result)
        return conn.reply(m.chat, '❌ No encontré resultados.', m)

      // algunos endpoints devuelven url directo, otros result
      const img = json.url || (json.result && json.result[0]) || null
      if (!img) return conn.reply(m.chat, '❌ No encontré resultados.', m)

      return conn.sendMessage(m.chat, {
        image: { url: img },
        caption: `🔞 Hentai random`
      }, { quoted: m })
    }

    // =============== R U L E 3 4 ===============
    if (command === 'rule34') {
      let res = await fetch(`https://api.lolhuman.xyz/api/rule34?apikey=GataDios&q=${encodeURIComponent(query)}`)
      let json = await res.json()

      if (!json.result?.length)
        return conn.reply(m.chat, '❌ No encontré resultados.', m)

      // enviar la primera imagen
      return conn.sendMessage(m.chat, {
        image: { url: json.result[0] },
        caption: `🔞 Rule34: ${query}`
      }, { quoted: m })
    }

    // =============== P A C K (imágenes random +18) ===============
    if (command === 'pack') {
      let res = await fetch(`https://api-lolhuman.xyz/api/nsfw/pack?apikey=GataDios`)
      let json = await res.json()

      if (!json.result?.length)
        return conn.reply(m.chat, '❌ No encontré pack.', m)

      // enviar hasta 4 imágenes en un mensaje múltiple (si tu conn lo soporta)
      const imgs = json.result.slice(0, 4).map(u => ({ image: { url: u }, caption: '🔞 Pack' }))
      for (let item of imgs) await conn.sendMessage(m.chat, item, { quoted: m })
      return
    }

    // =============== R A N D O M 1 8 (video random) ===============
    if (command === 'random18') {
      let res = await fetch(`https://api.lolhuman.xyz/api/random/nsfw?apikey=GataDios`)
      let json = await res.json()

      const vid = json.url || (json.result && json.result[0]) || null
      if (!vid) return conn.reply(m.chat, '❌ No encontré video random.', m)

      return conn.sendMessage(m.chat, {
        video: { url: vid },
        caption: `🔞 Video random`
      }, { quoted: m })
    }

  } catch (e) {
    console.error(e)
    conn.reply(m.chat, '❌ Error ejecutando el comando.', m)
  }
}

handler.help = ['xnxx <texto>', 'xvideos <texto>', 'ph <texto>', 'hentai', 'rule34 <texto>', 'pack', 'random18']
handler.tags = ['nsfw']
handler.command = ['xnxx','xvideos','ph','pornhub','hentai','rule34','pack','random18']

export default handler
