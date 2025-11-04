// 📂 plugins/readmins.js
const handler = async (m, { conn }) => {
  await conn.sendMessage(m.chat, { text: '✅ Comando .readmins detectado correctamente.' }, { quoted: m })
  console.log('🔥 El comando .readmins se ejecutó correctamente')
}

handler.help = ['readmins']
handler.tags = ['test']
handler.command = /^readmins$/i  // detecta .readmins o readmins
handler.group = true

export default handler

console.log('🟢 Plugin readmins.js cargado correctamente')
