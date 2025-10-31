const ownerNumbers = ['59898719147@s.whatsapp.net', '59896026646@s.whatsapp.net'];
const actividad = {}; // Guarda los mensajes por grupo

const handler = async (m, { conn, participants }) => {
  if (!m.isGroup) return m.reply('❗ Este comando solo funciona en grupos.');

  const sender = m.sender;
  const isOwner = ownerNumbers.includes(sender);
  const senderData = participants.find(p => p.id === sender);
  const isAdmin = senderData?.admin;

  // Solo dueños o administradores
  if (!isOwner && !isAdmin) {
    return m.reply('🚫 Solo los administradores y los dueños pueden usar este comando.');
  }

  // Registrar la actividad del mensaje
  if (!actividad[m.chat]) actividad[m.chat] = {};
  actividad[m.chat][m.sender] = Date.now();

  // Si el comando no es .admins, no hace nada
  if (!/^\.admins$/i.test(m.text)) return;

  const groupName = (await conn.groupMetadata(m.chat)).subject;
  const admins = participants.filter(p => p.admin);

  const ahora = Date.now();
  const limite = 24 * 60 * 60 * 1000; // 24 horas

  let activos = [];
  let inactivos = [];

  for (let adm of admins) {
    const id = adm.id;
    const ultimo = actividad[m.chat]?.[id];
    if (ultimo && (ahora - ultimo) < limite) {
      activos.push(`🟢 @${id.split('@')[0]}`);
    } else {
      inactivos.push(`🔴 @${id.split('@')[0]}`);
    }
  }

  const frase = [
    '🪖 El deber nunca descansa, pero algunos sí 😴',
    '⚔️ Solo los verdaderos soldados siguen activos.',
    '🎯 La disciplina separa a los líderes de los dormidos.',
    '🧭 Vigilando las líneas del frente digitales.',
    '🦾 Los que hablan poco... quizás planean mucho 😏'
  ][Math.floor(Math.random() * 5)];

  let texto = `📊 *ACTIVIDAD DE ADMINISTRADORES*\n`;
  texto += `📍 *Grupo:* ${groupName}\n`;
  texto += `📅 *Últimas 24 horas*\n\n`;

  texto += activos.length
    ? `🟢 *Activos:*\n${activos.join('\n')}\n\n`
    : '🟢 *Activos:* Ninguno 😴\n\n';

  texto += inactivos.length
    ? `🔴 *Inactivos:*\n${inactivos.join('\n')}\n\n`
    : '🔴 *Inactivos:* Ninguno 🎉\n\n';

  texto += `💬 "${frase}"\n\n`;
  texto += `🫡 *Comando ejecutado por:* @${sender.split('@')[0]}`;

  const menciones = [...admins.map(a => a.id), sender];

  await conn.sendMessage(m.chat, { text: texto, mentions: menciones }, { quoted: m });
};

handler.command = ['admins'];
handler.tags = ['group'];
handler.help = ['admins'];
handler.group = true;

export default handler;
