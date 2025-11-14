import fetch from 'node-fetch'

const handler = async (m, { conn }) => {
   if (!db.data.chats[m.chat].nsfw && m.isGroup) {
    return m.reply(`El contenido *NSFW* está desactivado en este grupo.\n> Un owner puede activarlo usando *.nsfw*`);
    }
  try {
    const res = await fetch('https://api.waifu.pics/nsfw/waifu')
    if (!res.ok) throw new Error('No se pudo obtener el pack, intenta de nuevo...')

    const json = await res.json()
    if (!json.url) throw new Error('La API no devolvi�� una URL v��lida')

    await conn.sendFile(m.chat, json.url, 'pack.jpg', '\`Aqu�� tienes tu pack\`', m)
  } catch (error) {
    console.error(error)
    m.reply('? Ocurri�� un error al obtener el pack, intenta m��s tarde.')
  }
}

handler.command = ['pack2']
handler.tags = ['nsfw']
handler.help = ['pack2']
handler.premium = true

export default handler
