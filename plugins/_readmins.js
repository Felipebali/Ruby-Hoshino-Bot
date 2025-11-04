// 📂 plugins/test-readmins.js
const handler = async (m, { conn }) => {
  await conn.sendMessage(m.chat, { text: '✅ El comando *readmins* está funcionando correctamente.' }, { quoted: m })
  console.log('✅ Comando .readmins ejecutado correctamente')
}

handler.help = ['readmins']
handler.tags = ['grupo']
handler.command = ['readmins']
handler.group = true

export default handler

// Esto se ejecuta al cargar el plugin (sin usar comando)
console.log('🟢 Plugin test-readmins.js cargado correctamente')
