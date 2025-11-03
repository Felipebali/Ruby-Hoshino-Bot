// 📂 plugins/reaccionar.js

function normalizeJid(jid = '') {
  return jid.replace(/@c\.us$/, '@s.whatsapp.net')
}

const ownerNumbers = ['59898719147@s.whatsapp.net', '59896026646@s.whatsapp.net']

// Reacciones según tipo de palabra
const palabrasReaccion = [
  // saludos
  { palabras: ['hola', 'holi', 'holaa', 'oli', 'buenas'], emoji: '👋' },
  { palabras: ['buenos dias', 'buen dia', 'mañana'], emoji: '☀️' },
  { palabras: ['buenas tardes'], emoji: '🌇' },
  { palabras: ['buenas noches', 'dulces sueños'], emoji: '🌙' },

  // agradecimientos y amor
  { palabras: ['gracias', 'ty', 'te agradezco'], emoji: '❤️' },
  { palabras: ['amo', 'te quiero', 'love', 'corazon'], emoji: '💖' },

  // despedidas
  { palabras: ['adios', 'chau', 'nos vemos', 'bye'], emoji: '😢' },

  // diversión
  { palabras: ['xd', 'jaja', 'jeje', 'jajaja', 'lol', 'lmao'], emoji: '😂' },
  { palabras: ['felixcat', 'felix', 'bot'], emoji: '🐾' },
  { palabras: ['wow', 'increible', 'genial', 'impresionante'], emoji: '🤩' },
  { palabras: ['ok', 'dale', 'perfecto', 'listo'], emoji: '👍' },
  { palabras: ['bro', 'wtf', 'que?', 'eh?'], emoji: '🤨' },

  // emociones
  { palabras: ['feliz', 'contento', 'alegre'], emoji: '😄' },
  { palabras: ['triste', 'lloro', 'pena'], emoji: '😭' },
  { palabras: ['enojado', 'enojo', 'rabia'], emoji: '😠' },

  // lenguaje ofensivo detectado (sin mostrarlo)
  { palabras: [
      'puto', 'puta', 'trola', 'trolo', 'gay', 'marica',
      'idiota', 'imbecil', 'estupido', 'forro', 'mierda',
      'pelotudo', 'cagón', 'tarado', 'basura', 'asco'
    ], emoji: '💢' },
]

let estadoReaccion = global.estadoReaccion || {}

const handler = async (m, { conn, command, isAdmin }) => {
  const chatId = m.chat
  const sender = m.sender
  const isOwner = ownerNumbers.includes(sender)

  // Activar/desactivar el modo (solo admin u owner)
  if (command === 'reaccionar') {
    if (!isAdmin && !isOwner)
      return conn.sendMessage(chatId, { text: '🚫 Solo los *administradores* o *dueños* pueden activar o desactivar el modo reacción.' }, { quoted: m })

    estadoReaccion[chatId] = !estadoReaccion[chatId]
    global.estadoReaccion = estadoReaccion

    await m.react(estadoReaccion[chatId] ? '✅' : '❌')
    return conn.sendMessage(chatId, { text: `🔁 Modo reacción ${estadoReaccion[chatId] ? 'activado 🐾' : 'desactivado ❌'}` })
  }

  // Si el modo está activado, reacciona según las palabras
  if (estadoReaccion[chatId]) {
    const texto = (m.text || '').toLowerCase()
    for (const item of palabrasReaccion) {
      if (item.palabras.some(p => texto.includes(p))) {
        await m.react(item.emoji)
        break
      }
    }
  }
}

handler.command = ['reaccionar']
export default handler
