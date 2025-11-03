// 📂 plugins/reaccionar.js

function normalizeJid(jid = '') {
  return jid.replace(/@c\.us$/, '@s.whatsapp.net')
}

const ownerNumbers = ['59898719147@s.whatsapp.net', '59896026646@s.whatsapp.net']

const palabrasReaccion = [
  { palabras: ['hola', 'holi', 'holaa', 'oli', 'buenas'], emoji: '👋' },
  { palabras: ['buenos dias', 'buen dia', 'mañana'], emoji: '☀️' },
  { palabras: ['buenas tardes'], emoji: '🌇' },
  { palabras: ['buenas noches', 'dulces sueños'], emoji: '🌙' },
  { palabras: ['gracias', 'ty', 'te agradezco'], emoji: '❤️' },
  { palabras: ['amo', 'te quiero', 'love', 'corazon'], emoji: '💖' },
  { palabras: ['adios', 'chau', 'nos vemos', 'bye'], emoji: '😢' },
  { palabras: ['xd', 'jaja', 'jeje', 'jajaja', 'lol', 'lmao'], emoji: '😂' },
  { palabras: ['felixcat', 'felix', 'bot'], emoji: '🐾' },
  { palabras: ['wow', 'increible', 'genial', 'impresionante'], emoji: '🤩' },
  { palabras: ['ok', 'dale', 'perfecto', 'listo'], emoji: '👍' },
  { palabras: ['bro', 'wtf', 'que?', 'eh?'], emoji: '🤨' },
  { palabras: ['feliz', 'contento', 'alegre'], emoji: '😄' },
  { palabras: ['triste', 'lloro', 'pena'], emoji: '😭' },
  { palabras: ['enojado', 'enojo', 'rabia'], emoji: '😠' },
  { palabras: ['puto', 'puta', 'trola', 'trolo', 'gay', 'marica', 'idiota', 'imbecil', 'estupido', 'forro', 'mierda', 'pelotudo', 'cagón', 'tarado', 'basura', 'asco'], emoji: '💢' },
]

let estadoReaccion = global.estadoReaccion || {}

const handler = async (m, { conn, command, isAdmin }) => {
  const chatId = m.chat
  const sender = m.sender
  const isOwner = ownerNumbers.includes(sender)

  // Activar/desactivar con .reaccionar (solo admin/owner)
  if (command === 'reaccionar') {
    if (!isAdmin && !isOwner)
      return conn.sendMessage(chatId, { text: '🚫 Solo administradores o dueños pueden activar/desactivar el modo reacción.' }, { quoted: m })

    estadoReaccion[chatId] = !estadoReaccion[chatId]
    global.estadoReaccion = estadoReaccion

    await conn.sendMessage(chatId, {
      react: { text: estadoReaccion[chatId] ? '✅' : '❌', key: m.key }
    })

    return conn.sendMessage(chatId, { text: `🔁 Modo reacción ${estadoReaccion[chatId] ? 'activado 🐾' : 'desactivado ❌'}` })
  }

  // Reaccionar si está activado y el mensaje tiene texto
  if (estadoReaccion[chatId] && m.text) {
    const texto = m.text.toLowerCase()
    for (const item of palabrasReaccion) {
      if (item.palabras.some(p => texto.includes(p))) {
        await conn.sendMessage(chatId, { react: { text: item.emoji, key: m.key } })
        break
      }
    }
  }
}

handler.command = ['reaccionar']
export default handler
