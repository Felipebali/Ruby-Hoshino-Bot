// 📂 plugins/_cambios.js — Log de cambios del grupo con mención a admins
import pkg from '@whiskeysockets/baileys'
const { downloadMediaMessage } = pkg

const ownerNumbers = ['59898719147@s.whatsapp.net', '59896026646@s.whatsapp.net']

let handler = async (m, { conn }) => {
  const chat = global.db.data.chats[m.chat] || {}
  chat.cambios = !chat.cambios
  global.db.data.chats[m.chat] = chat

  const estado = chat.cambios
    ? '✅ *Log de cambios activado*'
    : '❌ *Log de cambios desactivado*'

  await conn.sendMessage(m.chat, { text: `${estado}\nUsa *.cambios* para alternar.` }, { quoted: m })

  if (!conn._grupoLogRegistrado) {
    conn._grupoLogRegistrado = true
    registrarLogCambios(conn)
  }
}

handler.help = ['cambios']
handler.tags = ['group']
handler.command = /^cambios$/i
handler.group = true
handler.admin = true
export default handler

// 🔧 Registro del listener de cambios
function registrarLogCambios(conn) {
  const cache = {}

  conn.ev.on('groups.update', async (updates) => {
    for (const update of updates) {
      const id = update.id
      const chatData = global.db.data.chats[id] || {}
      if (!chatData.cambios) continue

      if (!cache[id]) cache[id] = {}
      const anterior = cache[id]
      const cambios = []
      let imagenNueva = null

      // 📸 Cambio de foto
      if (update.icon) {
        cambios.push('🖼️ *Foto del grupo cambiada*')
        try {
          imagenNueva = await conn.profilePictureUrl(id, 'image').catch(() => null)
        } catch {}
        anterior.icon = update.icon
      }

      // 📝 Cambio de nombre
      if (update.subject && update.subject !== anterior.subject) {
        cambios.push(`✏️ *Nombre cambiado a:* ${update.subject}`)
        anterior.subject = update.subject
      }

      // 💬 Cambio de descripción
      if (update.desc !== undefined && update.desc !== anterior.desc) {
        const textoDesc = update.desc ? update.desc : 'vacía'
        cambios.push(`💬 *Descripción cambiada a:* ${textoDesc}`)
        anterior.desc = update.desc
      }

      if (cambios.length === 0) continue

      const metadata = await conn.groupMetadata(id)
      const participants = metadata.participants

      // 🛡️ Administradores y dueños
      const admins = participants.filter(p => p.admin === 'admin' || p.admin === 'superadmin')
      const owners = participants.filter(p => ownerNumbers.includes(p.id))
      const todosAdmins = [...new Set([...admins, ...owners])]
      const mentions = todosAdmins.map(p => p.id)

      let texto = `📢 *Log de cambios del grupo:*\n\n`
      texto += cambios.join('\n') + '\n\n'
      texto += `👥 *Administradores notificados:*\n`
      texto += todosAdmins.map(p => `@${p.id.split('@')[0]}`).join(' ')

      if (imagenNueva) {
        await conn.sendMessage(id, { image: { url: imagenNueva }, caption: texto, mentions })
      } else {
        await conn.sendMessage(id, { text: texto, mentions })
      }
    }
  })
}
