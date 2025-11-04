// 📂 plugins/radmin.js
const handler = async (m, { conn }) => {
  console.log('💬 Se detectó un mensaje, verificando si es .radmin...')

  try {
    if (!m.isGroup) {
      await conn.sendMessage(m.chat, { text: '❗ Este comando solo funciona en grupos.' }, { quoted: m })
      return
    }

    console.log('🟡 Obteniendo metadata del grupo...')
    const groupMetadata = await conn.groupMetadata(m.chat)
    if (!groupMetadata) {
      console.error('❌ No se pudo obtener groupMetadata.')
      await conn.sendMessage(m.chat, { text: '⚠️ Error al obtener información del grupo.' }, { quoted: m })
      return
    }

    const groupName = groupMetadata.subject || 'este grupo'
    const admins = groupMetadata.participants.filter(p => p.admin)

    console.log(`👑 Se detectaron ${admins.length} administradores.`)

    if (admins.length === 0) {
      await conn.sendMessage(m.chat, { text: '⚠️ No hay administradores en este grupo.' }, { quoted: m })
      return
    }

    const adminMentions = admins.map(a => a.id)
    const listaAdmins = admins.map(a => `• @${a.id.split('@')[0]}`).join('\n')
    const ejecutor = `@${m.sender.split('@')[0]}`

    const texto = `
╔════════════════════╗
🛡️ *REGLAS PARA ADMINISTRADORES* 🐾
╚════════════════════╝

1️⃣ *Respetar a todos los miembros.*
2️⃣ *No abusar de los comandos del bot.*
3️⃣ *Evitar agregar números sospechosos.*
4️⃣ *Mantener el orden del grupo.*
5️⃣ *No quitar admins sin motivo.*
6️⃣ *Usar los comandos correctamente.*
7️⃣ *Colaborar con el bot.*
8️⃣ *No modificar nombre o descripción del grupo.*

══════════════════════
👑 *Administradores de ${groupName}:*
${listaAdmins}

📢 *Reglas solicitadas por:* ${ejecutor}

💬 _Cumplir estas reglas mantiene el grupo seguro y divertido._
🐾 *FelixCat_Bot* siempre vigilando 😼
══════════════════════
`

    await conn.sendMessage(m.chat, {
      text: texto,
      mentions: [...adminMentions, m.sender]
    }, { quoted: m })

    await conn.sendMessage(m.chat, { react: { text: '🛡️', key: m.key } })

    console.log('✅ Comando .radmin ejecutado correctamente')
  } catch (e) {
    console.error('❌ Error en .radmin:', e)
    await conn.sendMessage(m.chat, { text: '⚠️ Ocurrió un error al ejecutar el comando.' }, { quoted: m })
  }
}

handler.help = ['radmin']
handler.tags = ['grupo', 'admin']
handler.command = /^\.?radmin$/i  // ✅ Detecta .radmin o radmin
handler.group = true

export default handler

console.log('🟢 Plugin radmin.js cargado correctamente')
