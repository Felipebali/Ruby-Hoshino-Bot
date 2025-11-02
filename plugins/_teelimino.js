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
    // Verificar que el bot sea admin
    const metadata = await conn.groupMetadata(m.chat)
    const bot = metadata.participants.find(p => p.id === conn.user.jid)
    if (!bot || !bot.admin) return // si no es admin, no puede borrar

    // Eliminar mensaje original
    await conn.sendMessage(m.chat, {
      delete: {
        remoteJid: m.chat,
        id: m.key.id,
        fromMe: false,
        participant: m.key.participant || m.participant || m.sender
      }
    })

  } catch (err) {
    console.error('⚠️ Error al eliminar mensaje:', err)
  }
}

handler.customPrefix = /^te\s*elimin[oó]\.?$/i
handler.command = new RegExp()
handler.group = true

export default handler
