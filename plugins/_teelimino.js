// plugins/_autodelete-teeliminó.js

const frases = [
  'te eliminó',
  'te elimino',
  'Te eliminó',
  'Te elimino',
  'TE ELIMINÓ',
  'TE ELIMINO',
  'Te eliminó.',
  'Te elimino.',
  'te eliminó.',
  'te elimino.'
]

let handler = async (m, { conn }) => {
  if (!m.isGroup) return

  const texto = (m.text || '').trim()
  if (!frases.some(f => texto.toLowerCase().includes(f.toLowerCase()))) return

  try {
    // Elimina el mensaje del grupo
    await conn.sendMessage(m.chat, {
      delete: {
        remoteJid: m.chat,
        fromMe: m.key.fromMe,
        id: m.key.id,
        participant: m.key.participant || m.participant || m.sender
      }
    })
  } catch (err) {
    console.error('⚠️ Error al eliminar mensaje:', err)
  }
}

handler.customPrefix = /^te\s*elimin[oó]\.?$/i
handler.command = new RegExp()

export default handler
