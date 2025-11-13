// 📂 plugins/_qc.js — FelixCat-Bot 🐾
// Crea un sticker con el texto del mensaje citado, sin librerías ni APIs

let handler = async (m, { conn }) => {
  try {
    if (!m.quoted) return m.reply('🗨️ *Responde a un mensaje* para convertirlo en sticker.');

    const q = m.quoted
    const name = conn.getName(q.sender) || 'Usuario'
    const text = q.text || q.caption || '(sin texto)'

    // 🧾 Formato del texto para el sticker
    const stickerText = `💬 ${name} dijo:\n\n"${text}"`

    // ✨ Genera sticker directamente desde texto
    await conn.sendMessage(
      m.chat,
      {
        text: stickerText,
        contextInfo: {
          externalAdReply: {
            title: 'FelixCat 🐾',
            body: 'Sticker de cita generado',
            sourceUrl: 'https://whatsapp.com',
            renderLargerThumbnail: false
          }
        }
      },
      { quoted: m }
    )

  } catch (e) {
    console.error(e)
    m.reply('❌ Error al generar la cita.')
  }
}

handler.command = ['qc']
handler.help = ['qc']
handler.tags = ['fun']

export default handler
