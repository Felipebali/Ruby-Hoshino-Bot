// 📂 plugins/radmin.js
const ownerNumbers = ['59898719147@s.whatsapp.net', '59896026646@s.whatsapp.net']; // Dueños del bot
const specialNumber = '59895044754@s.whatsapp.net'; // Usuario con rango especial

const handler = async (m, { conn, participants }) => {
  if (!m.isGroup)
    return conn.sendMessage(m.chat, { text: '❗ Este comando solo funciona en grupos.' }, { quoted: m });

  const sender = m.sender;
  const isOwner = ownerNumbers.includes(sender);
  const senderData = participants.find(p => p.id === sender);
  const isAdmin = senderData?.admin;

  // Solo admins o dueños pueden usar el comando
  if (!isOwner && !isAdmin) {
    return conn.sendMessage(m.chat, { text: '🚫 Solo los administradores o los dueños pueden usar este comando.' }, { quoted: m });
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

  // 🧱 Texto principal
  let texto = `
╔══════════════════════════╗
🛡️ *REGLAMENTO DE ADMINISTRADORES* 🐾
╚══════════════════════════╝

📋 *Reglas generales para mantener el orden:*
───────────────────────────────
1️⃣ *Respeto ante todo*  
   Trata a todos los miembros con amabilidad y sin discriminación.

2️⃣ *Uso responsable de comandos*  
   Utiliza comandos como .kick, .cerrar o .silenciar solo cuando sea necesario.

3️⃣ *Evitar conflictos internos*  
   No se permiten insultos, provocaciones o discusiones públicas.

4️⃣ *Evita agregar números desconocidos o sospechosos.*  
   Esto puede activar el sistema *antilink* o *lista negra* del bot.

5️⃣ *No modificar el grupo sin autorización*  
   Cambiar el nombre, descripción o foto solo con permiso del dueño o del bot.

6️⃣ *Apoyar la seguridad del grupo*  
   Si hay spam, links extraños o contenido inapropiado, actúa rápido.

7️⃣ *Colaborar con el bot FelixCat_Bot*  
   Si el bot advierte o expulsa, revisa el motivo antes de intervenir.

8️⃣ *Mantén la calma y el ejemplo*  
   Los administradores son el reflejo del grupo. Sé ejemplo de respeto.

───────────────────────────────
📘 *Recomendaciones prácticas:*
• Usa *.kick @usuario motivo* solo si hay razón válida.  
• Usa *.silenciar / .desilenciar* para mantener el orden temporal.  
• Usa *.cerrar / .abrir* para controlar el acceso en situaciones de caos.  
• No elimines a otros administradores sin justificación.  

───────────────────────────────
👑 *Administración de ${groupName}:*\n`;

  // Dueños del grupo
  if (ownersInGroup.length > 0) {
    texto += `👑 *Dueños del Grupo:*\n`;
    texto += ownersInGroup
      .map(o => `${ownerTitles[o.id] || 'Dueño'} @${o.id.split('@')[0]}`)
      .join('\n');
    texto += `\n\n`;
  }

  // Miembro especial
  if (specialUser) {
    texto += `${specialTitle}\n@${specialUser.id.split('@')[0]}\n\n`;
  }

  // Administradores
  const adminText = otherAdmins
    .map(a => `• @${a.id.split('@')[0]}`)
    .join('\n');
  texto += `🛡️ *Administradores:*\n${adminText || 'Ninguno'}\n\n`;

  // Ejecutor
  texto += `📢 *Comando ejecutado por:* @${sender.split('@')[0]}\n`;
  texto += `══════════════════════════\n`;
  texto += `😼 *FelixCat_Bot vigilando siempre...*\n`;
  texto += `══════════════════════════`;

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
handler.tags = ['group', 'admin'];
handler.help = ['radmin'];
handler.group = true;

export default handler;

console.log('🟢 Plugin radmin.js cargado correctamente');
