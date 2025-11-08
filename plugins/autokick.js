// 🐾 FelixCat_Bot - AutoKick si no es admin o lo degradan (sin tocar index)
import { delay } from '@whiskeysockets/baileys'

let handler = async (update, { conn }) => {
  try {
    const botNumber = conn.user.id.split(':')[0] + '@s.whatsapp.net'

    // 📥 Cuando el bot entra a un grupo
    if (update.action === 'add' && update.participants.includes(botNumber)) {
      await conn.sendMessage(update.id, { text: '👋 ¡Hola! Si no soy admin en 1 minuto, me autokickeo 😿' })
      await delay(60000) // 1 minuto

      const metadata = await conn.groupMetadata(update.id)
      const botInfo = metadata.participants.find(p => p.id === botNumber)

      if (!botInfo?.admin) {
        await conn.sendMessage(update.id, { text: '😿 No tengo permisos de admin, me autokickeo...' })
        await conn.groupParticipantsUpdate(update.id, [botNumber], 'remove')
        console.log(`[FelixCat_Bot] Me autokickeo de ${metadata.subject} (${update.id}) por no tener admin.`)
      } else {
        await conn.sendMessage(update.id, { text: '😸 ¡Gracias por hacerme admin! Me quedo en el grupo 🎉' })
      }
    }

    // 🔻 Cuando el bot pierde el admin (demote)
    if (update.action === 'demote' && update.participants.includes(botNumber)) {
      await conn.sendMessage(update.id, { text: '😿 Me quitaron el admin, me autokickeo...' })
      await delay(2000)
      await conn.groupParticipantsUpdate(update.id, [botNumber], 'remove')
      console.log(`[FelixCat_Bot] Fui degradado en ${update.id}, autokick ejecutado.`)
    }

  } catch (err) {
    console.error('❌ Error en autokick.js:', err)
  }
}

// 👇 Esta línea hace que el plugin se ejecute sin modificar el index
handler.event = 'group-participants.update'
export default handler 
