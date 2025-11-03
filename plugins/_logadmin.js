// plugins/grupo-adminlog.js
const ownerNumbers = ['59898719147@s.whatsapp.net', '59896026646@s.whatsapp.net']; // Dueños del bot

export async function before(m, { conn, participants, isAdmin, isBotAdmin }) {
  if (!m.isGroup) return;
  if (!m.messageStubType) return;

  try {
    let texto = '';
    let action = '';
    let actor = m.sender || 'Desconocido';
    let target = m.messageStubParameters ? m.messageStubParameters[0] : null;

    if (!target) return;

    // Detecta los cambios de admin en el grupo
    switch (m.messageStubType) {
      case 29: // se le da admin a alguien
        action = 'promovió a admin';
        break;
      case 30: // se le quita admin
        action = 'degradó de admin';
        break;
      default:
        return;
    }

    // Determina si quien ejecutó es owner o admin
    const rango = ownerNumbers.includes(actor)
      ? '👑 Dueño'
      : '🛡️ Administrador';

    texto = `⚙️ *Cambio de administración detectado*\n\n${rango} @${actor.split('@')[0]} *${action}* a @${target.split('@')[0]}`;

    await conn.sendMessage(m.chat, {
      text: texto,
      mentions: [actor, target],
    });

    await conn.sendMessage(m.chat, { react: { text: '⚙️', key: m.key } });
  } catch (e) {
    console.error('Error en grupo-adminlog.js:', e);
  }
}
