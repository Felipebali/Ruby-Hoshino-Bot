import fetch from 'node-fetch'

// Dueños con permiso total
const owners = [
  '59898719147@s.whatsapp.net',
  '59896026646@s.whatsapp.net',
  '59892363485@s.whatsapp.net'
]

let handler = async (m, { conn, args, command }) => {

  // Obtener chat DB
  let chat = global.db.data.chats[m.chat] || (global.db.data.chats[m.chat] = {})

  // ============================
  //     INTERRUPTOR . +18
  // ============================
  if (command === '+18') {

    // Solo dueños
    if (!owners.includes(m.sender))
      return conn.reply(m.chat, '🚫 Solo los dueños pueden activar/desactivar +18.', m)

    chat.adultMode = !chat.adultMode

    return conn.reply(
      m.chat,
      chat.adultMode
        ? '🔞 *Modo +18 ACTIVADO.*\nAhora puedes usar comandos NSFW.'
        : '🧼 *Modo +18 DESACTIVADO.*\nTodos los comandos +18 fueron bloqueados.',
      m
    )
  }

  // ===========================================
  //   Desde acá: comandos +18 quedan bloqueados
  // ===========================================

  if (!chat.adultMode) {
    return conn.reply(
      m.chat,
      '❌ *El modo +18 está desactivado.*\nActívalo con *. +18*',
      m
    )
  }

  // Solo dueños pueden usar los comandos +18
  if (!owners.includes(m.sender))
    return conn.reply(m.chat, '🚫 Solo los dueños pueden usar contenido +18.', m)

  const query = args.join(" ")
  const needText = ['xnxx', 'xvideos', 'ph', 'pornhub', 'rule34']
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

      const img = json.url || (json.result && json.result[0])
      if (!img) return conn.reply(m.chat, '❌ No encontré resultados.', m)

      return conn.sendMessage(m.chat, {
        image: { url: img },
        caption: `🔞 Hentai random`
      }, { quoted: m })
    }

    // =============== R U L E 3 4 ===============
    if (command === 'rule34') {
      let res = await fetch(`https://api-lolhuman.xyz/api/rule34?apikey=GataDios&q=${encodeURIComponent(query)}`)
      let json = await res.json()

      if (!json.result?.length)
        return conn.reply(m.chat, '❌ No encontré resultados.', m)

      return conn.sendMessage(m.chat, {
        image: { url: json.result[0] },
        caption: `🔞 Rule34: ${query}`
      }, { quoted: m })
    }

    // =============== P A C K ===============
    if (command === 'pack') {
      let res = await fetch(`https://api-lolhuman.xyz/api/nsfw/pack?apikey=GataDios`)
      let json = await res.json()

      if (!json.result?.length)
        return conn.reply(m.chat, '❌ No encontré pack.', m)

      for (let img of json.result.slice(0, 4)) {
        await conn.sendMessage(m.chat, {
          image: { url: img },
          caption: '🔞 Pack'
        }, { quoted: m })
      }
      return
    }

    // =============== R A N D O M 18 ===============
    if (command === 'random18') {
      let res = await fetch(`https://api.lolhuman.xyz/api/random/nsfw?apikey=GataDios`)
      let json = await res.json()

      const vid = json.url || (json.result && json.result[0])
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

handler.help = ['+18', 'xnxx', 'xvideos', 'ph', 'pornhub', 'hentai', 'rule34', 'pack', 'random18']
handler.tags = ['nsfw']
handler.command = ['+18','xnxx','xvideos','ph','pornhub','hentai','rule34','pack','random18']

export default handler
