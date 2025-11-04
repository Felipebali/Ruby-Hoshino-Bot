
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
🛡️ REGLAS PARA ADMINISTRADORES 🐾
╚════════════════════╝

📋 *Objetivo:* Mantener la armonía, el respeto y el buen funcionamiento del grupo con la ayuda de los administradores y FelixCat_Bot 😼

1️⃣ *Respeto ante todo:*  
Trata con respeto a todos los miembros, sin insultos, acoso o discriminación. Los conflictos deben resolverse con calma y diálogo.

2️⃣ *Uso responsable del bot:*  
Los comandos administrativos deben usarse con criterio. Evita expulsar o silenciar sin razón válida. Recuerda que el bot guarda registros.

3️⃣ *Evita agregar contactos sospechosos:*  
No invites números desconocidos o sospechosos de spam, publicidad o contenido inapropiado. Si tienes dudas, consulta con un dueño.

4️⃣ *Orden y convivencia:*  
Evita saturar el chat con mensajes innecesarios, stickers o contenido fuera de tema. Mantén un ambiente agradable para todos.

5️⃣ *Gestión del grupo:*  
No cambies el nombre, descripción, foto o reglas del grupo sin autorización del dueño o consenso entre los administradores.

6️⃣ *Moderación con justicia:*  
Usa los comandos (.kick, .cerrar, .abrir, .warn, etc.) de forma justa. Toda acción debe tener una razón clara y sin favoritismos.

7️⃣ *Colaboración con el bot:*  
Ayuda a mantener el orden cuando el bot actúe (antilink, antispam, advertencias). No lo desactives sin permiso de los dueños.

8️⃣ *Transparencia:*  
Informa a los dueños sobre cualquier conflicto, spam o comportamiento extraño. La comunicación evita malentendidos.

9️⃣ *Privacidad y seguridad:*  
No compartas información privada del grupo ni de sus miembros fuera del mismo. Protege la identidad y el bienestar de todos.

🔟 *Ejemplo positivo:*  
Un buen administrador da el ejemplo con su comportamiento. Promueve la unión, el respeto y la diversión sana.

══════════════════════
👑 *Administración de ${groupName}:*\n`;

  if (ownersInGroup.length > 0) {
    texto += '👑 *Dueños del Grupo:*\n';
    texto += ownersInGroup
      .map(o => `${ownerTitles[o.id] || 'Dueño'} @${o.id.split('@')[0]}`)
      .join('\n');
    texto += '\n\n';
  }

  if (specialUser) {
    texto += `${specialTitle}\n@${specialUser.id.split('@')[0]}\n\n`;
  }

  const adminText = otherAdmins
    .map(a => `• @${a.id.split('@')[0]}`)
    .join('\n');

  texto += `🛡️ *Administradores:*\n${adminText || 'Ninguno'}\n\n`;
  texto += `📢 *Comando ejecutado por:* @${sender.split('@')[0]}\n\n`;
  texto += `🐾 *FelixCat_Bot vigilando y cuidando el grupo 😼*`;

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
