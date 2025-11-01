// plugins/_autokick-teeliminó.js
import fs from 'fs'
import path from 'path'

const owners = ['59898719147', '59896026646'] // dueños
const dbPath = path.resolve('./adminWarnings.json')

// crea el archivo si no existe
if (!fs.existsSync(dbPath)) fs.writeFileSync(dbPath, JSON.stringify({}), 'utf-8')

// leer y escribir advertencias
const readWarnings = () => JSON.parse(fs.readFileSync(dbPath, 'utf-8'))
const writeWarnings = (data) => fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf-8')

let handler = async (m, { conn }) => {
  if (!m.isGroup) return

  const texto = (m.text || '').trim()
  if (texto !== 'Te eliminó.') return // solo esta frase exacta

  const who = m.sender
  const senderNum = who.split('@')[0]

  const groupMetadata = await conn.groupMetadata(m.chat)
  const participant = groupMetadata.participants.find(p => p.id === who)
  const isAdmin = participant?.admin || false

  // Si es dueño
  if (owners.includes(senderNum)) {
    const frasesOwner = [
      `@${senderNum}, tranquilo jefe 😎 vos mandás acá.`,
      `@${senderNum}, ni el bot se atreve a eliminarte 😏.`,
      `@${senderNum}, orden aceptada... pero solo si vos querés. 😌`
    ]
    const frase = frasesOwner[Math.floor(Math.random() * frasesOwner.length)]
    return conn.sendMessage(m.chat, { text: frase, mentions: [who] })
  }

  // Si es admin
  if (isAdmin) {
    const warnings = readWarnings()
    warnings[senderNum] = (warnings[senderNum] || 0) + 1

    if (warnings[senderNum] === 1) {
      writeWarnings(warnings)
      const aviso = `⚠️ @${senderNum}, esta es tu primera advertencia.\nLa próxima vez perderás tu rango de administrador.`
      // le envía aviso al privado
      try {
        await conn.sendMessage(who, { text: aviso })
      } catch {
        // si no se puede enviar por privado, lo manda al grupo
        await conn.sendMessage(m.chat, { text: aviso, mentions: [who] })
      }
      return
    }

    if (warnings[senderNum] >= 2) {
      delete warnings[senderNum]
      writeWarnings(warnings)
      await conn.groupParticipantsUpdate(m.chat, [who], 'demote')
      return conn.sendMessage(m.chat, {
        text: `🚫 @${senderNum} perdió su rango de administrador por repetir “Te eliminó.” 😐`,
        mentions: [who]
      })
    }

    return
  }

  // Si es usuario común
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
