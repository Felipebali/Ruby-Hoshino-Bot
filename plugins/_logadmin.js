const ownerNumbers = ['59898719147@s.whatsapp.net', '59896026646@s.whatsapp.net'];

export async function before(m, { conn }) {
  if (!m.isGroup) return;
  if (!m.messageStubType) return;

  try {
    let action = '';
    let actor = m.participant || m.key?.participant || m.sender || 'Desconocido';
    let target = m.messageStubParameters ? m.messageStubParameters[0] : null;
    if (!target) return;

    // Detecta cambios de admin
    switch (m.messageStubType) {
      case 29: action = 'promovió a admin'; break;
      case 30: action = 'degradó de admin'; break;
      default: return;
    }

    const isOwner = ownerNumbers.includes(actor);
    const rango = isOwner ? '👑 Dueño' : '🛡️ Administrador';
    const emoji = isOwner ? '👑' : '⚙️';

    const texto = `*Cambio de administración detectado*\n\n${rango} @${actor.split('@')[0]} *${action}* a @${target.split('@')[0]}`;

    await conn.sendMessage(m.chat, { text: texto, mentions: [actor, target] });
    await conn.sendMessage(m.chat, { react: { text: emoji, key: m.key } });

  } catch (e) {
    console.error('Error en grupo-adminlog.js:', e);
  }
}
