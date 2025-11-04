// 📂 plugins/radmin.js
const ownerNumbers = ['59898719147@s.whatsapp.net', '59896026646@s.whatsapp.net']; // Dueños
const specialNumber = '59895044754@s.whatsapp.net'; // Usuario con rango especial

const handler = async (m, { conn, participants }) => {
  if (!m.isGroup) return m.reply('❗ Este comando solo funciona en grupos.');

  const sender = m.sender;
  const isOwner = ownerNumbers.includes(sender);
  const senderData = participants.find(p => p.id === sender);
  const isAdmin = senderData?.admin;

  // Permiso solo para admins o dueños
  if (!isOwner && !isAdmin) {
    return m.reply('🚫 Solo los administradores o los dueños pueden usar este comando.');
  }

  const groupMetadata = await conn.groupMetadata(m.chat);
  const groupName = groupMetadata.subject || 'este grupo';

  const admins = participants.filter(p => p.admin);
  const ownersInGroup = participants.filter(p => ownerNumbers.includes(p.id));
  const specialUser = participants.find(p => p.id === specialNumber);
  const otherAdmins = admins.filter(a => !ownerNumbers.includes(a.id) && a.id !== specialNumber);

  const ownerTitles = {
    '59898719147@s.whatsapp.net': 'Dueño Principal 👑',
    '59896026646@s.whatsapp.net': 'Creador Asociado 👑'
  };

  const specialTitle = '💫 Miembro Especial 💫';

  // 🛡️ Texto principal
  let texto = `
╔════════════════════╗
🛡️ *REGLAS PARA ADMINISTRADORES* 🐾
╚════════════════════╝

1️⃣ *Respetar a todos los miembros.*
2️⃣ *No abusar de los comandos del bot.*
3️⃣ *Evitar agregar números sospechosos.*
4️⃣ *Mantener el orden del grupo.*
5️⃣ *No quitar admins sin motivo.*
6️⃣ *Usar los comandos correctamente (.kick, .cerrar, .abrir, etc.)*
7️⃣ *Colaborar con el bot.*
8️⃣ *No modificar nombre o descripción sin permiso.*

══════════════════════
👑 *Administración de ${groupName}:*\n`;

  if (ownersInGroup.length > 0) {
    texto += `👑 *Dueños del Grupo:*\n`;
    texto += ownersInGroup
      .map(o => `${ownerTitles[o.id] || 'Dueño'} @${o.id.split('@')[0]}`)
      .join('\n');
    texto += `\n\n`;
  }

  if (specialUser) {
    texto += `${specialTitle}\n@${specialUser.id.split('@')[0]}\n\n`;
  }

  const adminText = otherAdmins
    .map(a => `• @${a.id.split('@')[0]}`)
    .join('\n');

  texto += `🛡️ *Administradores:*\n${adminText || 'Ninguno'}\n\n`;
  texto += `📢 *Comando ejecutado por:* @${sender.split('@')[0]}\n\n`;
  texto += `🐾 *FelixCat_Bot vigilando 😼*`;

  // 🔖 Menciones
  const allMentions = [
    sender,
    ...ownersInGroup.map(o => o.id),
    ...(specialUser ? [specialUser.id] : []),
    ...otherAdmins.map(a => a.id)
  ];

  // 📤 Enviar mensaje
  await conn.sendMessage(m.chat, { text: texto, mentions: allMentions }, { quoted: m });
  await conn.sendMessage(m.chat, { react: { text: '🛡️', key: m.key } });
  console.log('✅ Comando .radmin ejecutado correctamente');
};

handler.command = ['radmin'];
handler.tags = ['group'];
handler.help = ['radmin'];
handler.group = true;

export default handler;

console.log('🟢 Plugin radmin.js cargado correctamente');
