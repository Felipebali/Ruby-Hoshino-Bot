// 📂 plugins/log-entradas.js

const handler = async (m, { conn, participants, action }) => {
  // Solo grupos
  if (!m.isGroup) return

  // Si alguien se unió
  if (action === 'add') {
    for (let user of participants) {
      const nombre = await conn.getName(user)
      const chatId = m.chat
      await conn.sendMessage(chatId, { 
        text: `🎉 ¡Bienvenido/a @${user.split('@')[0]} al grupo! Disfruta tu estadía.` ,
        mentions: [user]
      })
    }
  }

  // Si alguien se fue o fue eliminado, se puede agregar después
}

handler.groupUpdate = true
export default handler
