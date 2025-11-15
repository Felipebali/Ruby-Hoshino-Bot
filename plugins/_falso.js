// plugins/falso.js // Comando: .falso // Explicación: quita el prefijo +598 de los números que aparezcan en el texto //             excepto los números que pertenezcan a los owners (lista owners). // Uso: responde a un mensaje con .falso o escribe .falso <texto>

let handler = async (m, { conn, args }) => { // Lista de owners (sin + ni espacios). Edita aquí si necesitas cambiarla. const owners = [ '59898719147', '59896026646', '59892363485' ]

// Obtener texto: preferir mensaje citado, si no usar args let text = '' if (m.quoted && m.quoted.text) text = m.quoted.text else text = args.join(' ')

if (!text) return conn.reply(m.chat, 'Uso: .falso <texto> o responde a un mensaje con .falso', m)

// Regex para detectar +598 o 598 seguido de 7 u 8 dígitos (uruguayos suelen tener 8) // Acepta +598 o 598 con o sin separadores. const regex = /(+?598)(\d{7,8})/g

// Reemplazo: si el número completo (598 + digitos) está en owners -> no tocar // sino -> quitar el prefijo +598 dejando solo los dígitos locales. const replaced = text.replace(regex, (match, p1, p2) => { const normalized = '598' + p2.replace(/\D/g, '') if (owners.includes(normalized)) return match // mantener tal cual si es owner return p2 // quitar el +598 })

// Enviar resultado como respuesta // Detectar cuáles números fueron eliminados const removedNums = [] text.replace(regex, (match, p1, p2) => { const normalized = '598' + p2.replace(/[^0-9]/g, '') if (!owners.includes(normalized)) removedNums.push(normalized) })

let aviso = ''; if (removedNums.length > 0) { aviso = "

⚠️ Números modificados:

" + removedNums.join("

") }

await conn.reply(m.chat, replaced + aviso, m) }


handler.command = ['falso', 'falso2'] handler.help = ['falso'] handler.tags = ['tools'] handler.premium = false handler.fail = null

export default handler
