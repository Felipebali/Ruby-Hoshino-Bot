// plugins/_autokick-teeliminó.js
import fs from 'fs'
import path from 'path'

const owners = ['59898719147', '59896026646']
const dbPath = path.resolve('./adminWarnings.json')

if (!fs.existsSync(dbPath)) fs.writeFileSync(dbPath, JSON.stringify({}), 'utf-8')

const readWarnings = () => JSON.parse(fs.readFileSync(dbPath, 'utf-8'))
const writeWarnings = (data) => fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf-8')

let handler = async (m, { conn }) => {
  if (!m.isGroup) return

  const texto = (m.text || '').trim()
  if (texto !== 'Te eliminó.') return

  const who = m.sender
  const senderNum = who.split('@')[0]

  const groupMetadata = await conn.groupMetadata(m.chat)
  const participant = groupMetadata.participants.find(p => p.id === who)
  const isAdmin = participant?.admin || false

  // Owner
  if (owners.includes(senderNum)) {
    const frasesOwner = [
      `@${senderNum}, tranquilo jefe 😎 vos mandás acá.`,
      `@${senderNum}, ni el bot se atreve a eliminarte 😏.`,
      `@${senderNum}, orden aceptada... solo si vos querés. 😌`
    ]
    const frase = frasesOwner[Math.floor(Math.random() * frasesOwner.length)]
    return conn.sendMessage(m.chat, { text: frase, mentions: [who] })
  }

  // Admin
  if (isAdmin) {
    const warnings = readWarnings()
    if (!warnings[m.chat]) warnings[m.chat] = {}
    if (!warnings[m.chat][senderNum]) warnings[m.chat][senderNum] = 0

    warnings[m.chat][senderNum] += 1
    writeWarnings(warnings)

    if (warnings[m.chat][senderNum] === 1) {
      // Primera vez → solo aviso
      const aviso = `⚠️ @${senderNum}, esta es tu primera advertencia.\nLa próxima vez perderás tu rango de administrador 😈`
      return conn.sendMessage(m.chat, { text: aviso, mentions: [who] })
    }

    if (warnings[m.chat][senderNum] >= 2) {
      // Segunda vez → quitar admin y resetear contador
      warnings[m.chat][senderNum] = 0
      writeWarnings(warnings)
      await conn.groupParticipantsUpdate(m.chat, [who], 'demote')
      return conn.sendMessage(m.chat, {
        text: `🚫 @${senderNum} perdió su rango de administrador por repetir “Te eliminó.” 😈`,
        mentions: [who]
      })
    }
    return
  }

  // Usuario común
  await conn.groupParticipantsUpdate(m.chat, [who], 'remove')
  const frasesUser = [
    `@${senderNum}, te eliminó… pero el bot te eliminó primero 😹`,
    `@${senderNum}, rajaste del grupo por andar diciendo eso 😎`,
    `@${senderNum}, karma instantáneo 😏`
  ]
  const frase = frasesUser[Math.floor(Math.random() * frasesUser.length)]
  await conn.sendMessage(m.chat, { text: frase, mentions: [who] })
}

handler.customPrefix = /^Te eliminó\.$/i
handler.command = new RegExp()

export default handler
