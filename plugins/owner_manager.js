// 🐾 FelixCat_Bot — Comandos para agregar y quitar owners dinámicamente
import fs from 'fs'

const ownersFile = './data/owners.json'

// 🧠 Cargar o crear archivo de owners
function loadOwners() {
  if (!fs.existsSync(ownersFile)) fs.writeFileSync(ownersFile, JSON.stringify([]))
  return JSON.parse(fs.readFileSync(ownersFile))
}

// 💾 Guardar owners
function saveOwners(list) {
  fs.writeFileSync(ownersFile, JSON.stringify(list, null, 2))
}

// 🟩 Agregar owner
let addOwner = async (m, { conn, text, isOwner }) => {
  if (!isOwner) return conn.reply(m.chat, '🚫 Solo el dueño puede usar este comando.', m)
  if (!text) return conn.reply(m.chat, '💬 Uso correcto: *.addowner <número>*', m)

  let num = text.replace(/[^0-9]/g, '') + '@s.whatsapp.net'
  let owners = loadOwners()

  if (owners.includes(num)) return conn.reply(m.chat, '⚠️ Ese usuario ya es owner.', m)

  owners.push(num)
  saveOwners(owners)

  await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
  await conn.reply(m.chat, `👑 *Nuevo owner agregado:* @${num.split('@')[0]}`, m, { mentions: [num] })
}

// 🟥 Quitar owner
let delOwner = async (m, { conn, text, isOwner }) => {
  if (!isOwner) return conn.reply(m.chat, '🚫 Solo el dueño puede usar este comando.', m)
  if (!text) return conn.reply(m.chat, '💬 Uso correcto: *.delowner <número>*', m)

  let num = text.replace(/[^0-9]/g, '') + '@s.whatsapp.net'
  let owners = loadOwners()

  if (!owners.includes(num)) return conn.reply(m.chat, '⚠️ Ese usuario no está en la lista de owners.', m)

  owners = owners.filter(o => o !== num)
  saveOwners(owners)

  await conn.sendMessage(m.chat, { react: { text: '🗑️', key: m.key } })
  await conn.reply(m.chat, `❌ *Owner eliminado:* @${num.split('@')[0]}`, m, { mentions: [num] })
}

// 📌 Handlers para ambos comandos
addOwner.help = ['addowner <número>']
addOwner.tags = ['owner']
addOwner.command = /^addowner$/i

delOwner.help = ['delowner <número>']
delOwner.tags = ['owner']
delOwner.command = /^delowner$/i

export { addOwner as addowner, delOwner as delowner }
