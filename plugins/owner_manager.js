import fs from 'fs'
import path from 'path'

// 📂 Ruta donde se guardarán los owners
const dataDir = '/data/data/com.termux/files/home/.rubydata'
const ownerFile = path.join(dataDir, 'owners.json')

// 🧩 Crear carpeta y archivo si no existen
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true })
if (!fs.existsSync(ownerFile)) fs.writeFileSync(ownerFile, '[]')

// 🔄 Cargar owners almacenados
let storedOwners = JSON.parse(fs.readFileSync(ownerFile))

// 🔁 Sincronizar con los globales del bot
if (!global.owner) global.owner = []
global.owner = [...new Set([...global.owner, ...storedOwners])]

// 💾 Función para guardar la lista
function saveOwners() {
  fs.writeFileSync(ownerFile, JSON.stringify(storedOwners, null, 2))
  global.owner = [...new Set([...storedOwners])]
}

// 🟢 AGREGAR OWNER
let addowner = async (m, { conn, text, participants }) => {
  const sender = m.sender
  if (!global.owner.includes(sender))
    return m.reply('⚠️ Solo un *OWNER principal* puede agregar nuevos dueños.')

  const mentioned = m.mentionedJid && m.mentionedJid[0]
  const number = mentioned
    ? mentioned
    : text
    ? text.replace(/[^0-9]/g, '') + '@s.whatsapp.net'
    : null

  if (!number)
    return m.reply(
      '💬 Etiqueta o escribe el número del nuevo owner.\n\nEjemplo:\n.addowner @usuario\n.addowner 59891234567'
    )

  if (storedOwners.includes(number)) return m.reply('✅ Ese número ya es owner.')

  storedOwners.push(number)
  saveOwners()
  await m.reply(
    `👑 Se agregó correctamente a @${number.split('@')[0]} como *OWNER permanente*.`,
    null,
    { mentions: [number] }
  )
}

// 🔴 ELIMINAR OWNER
let delowner = async (m, { conn, text }) => {
  const sender = m.sender
  if (!global.owner.includes(sender))
    return m.reply('⚠️ Solo un *OWNER principal* puede eliminar dueños.')

  const mentioned = m.mentionedJid && m.mentionedJid[0]
  const number = mentioned
    ? mentioned
    : text
    ? text.replace(/[^0-9]/g, '') + '@s.whatsapp.net'
    : null

  if (!number)
    return m.reply(
      '💬 Etiqueta o escribe el número del owner a eliminar.\n\nEjemplo:\n.delowner @usuario\n.delowner 59891234567'
    )

  if (!storedOwners.includes(number))
    return m.reply('❌ Ese número no figura como owner registrado.')

  storedOwners = storedOwners.filter(o => o !== number)
  saveOwners()
  await m.reply(
    `🗑️ Se eliminó correctamente a @${number.split('@')[0]} de la lista de *OWNERS*.`,
    null,
    { mentions: [number] }
  )
}

// 📜 LISTAR OWNERS
let listowners = async (m) => {
  if (storedOwners.length === 0)
    return m.reply('📭 No hay owners registrados todavía.')

  let lista = storedOwners
    .map((o, i) => `${i + 1}. @${o.split('@')[0]}`)
    .join('\n')

  await m.reply(`👑 *LISTA DE OWNERS REGISTRADOS:*\n\n${lista}`, null, {
    mentions: storedOwners
  })
}

// 🧩 Exportar handlers individuales
addowner.help = ['addowner']
addowner.tags = ['owner']
addowner.command = /^addowner$/i

delowner.help = ['delowner']
delowner.tags = ['owner']
delowner.command = /^delowner$/i

listowners.help = ['listowners']
listowners.tags = ['owner']
listowners.command = /^listowners$/i

export default [addowner, delowner, listowners]
