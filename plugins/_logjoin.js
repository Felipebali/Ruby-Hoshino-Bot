// plugins/grupo-joinlog.js
const ownerNumbers = ['59898719147@s.whatsapp.net', '59896026646@s.whatsapp.net'];

export async function participantsRequestUpdate({ id, participants, actor, action, conn }) {
  try {
    // Solo para grupos
    if (!id.endsWith('@g.us')) return;

    let texto = '';
    const user = participants[0]; // usuario que fue aceptado o rechazado
    const rango = ownerNumbers.includes(actor)
      ? '👑 Dueño'
      : '🛡️ Administrador';

    if (action === 'approve') {
      texto = `✅ *Solicitud aprobada*\n\n${rango} @${actor.split('@')[0]} aceptó a @${user.split('@')[0]} para ingresar al grupo.`;
    } else if (action === 'reject') {
      texto = `❌ *Solicitud rechazada*\n\n${rango} @${actor.split('@')[0]} rechazó el ingreso de @${user.split('@')[0]}.`;
    } else {
      return; // si es otra acción, no hace nada
    }

    await conn.sendMessage(id, {
      text: texto,
      mentions: [actor, user],
    });

    await conn.sendMessage(id, { react: { text: action === 'approve' ? '✅' : '❌', key: { remoteJid: id } } });
  } catch (e) {
    console.error('Error en grupo-joinlog.js:', e);
  }
}
