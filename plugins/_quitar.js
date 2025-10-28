// plugins/quitar.js
// Comando: .quitar
// Solo OWNER puede usarlo
// Quita el admin a todos menos al creador del grupo y menciona a cada uno

let handler = async (m, { conn, isOwner }) => {
  try {
    if (!m.isGroup) return conn.sendMessage(m.chat, { text: '⚠️ Este comando solo funciona en grupos.' });
    if (!isOwner) return conn.sendMessage(m.chat, { text: '❌ Solo el dueño del bot puede usar este comando.' });

    // Metadata del grupo
    const group = await conn.groupMetadata(m.chat);
    const owner = group.owner; // creador del grupo
    const participantes = group.participants;

    let quitados = [];

    for (let p of participantes) {
      const jid = p.id;
      // solo si es admin y no es el dueño
      if ((p.admin === 'admin' || p.admin === 'superadmin') && jid !== owner) {
        await conn.groupParticipantsUpdate(m.chat, [jid], 'demote'); // degrade admin
        quitados.push(jid);
      }
    }

    if (quitados.length === 0) {
      return conn.sendMessage(m.chat, { text: 'ℹ️ No hay administradores que quitar (excepto el creador).' });
    }

    // Mensaje mencionando a todos los quitados
    const mentionsText = quitados.map(jid => `@${jid.split('@')[0]}`).join(', ');
    await conn.sendMessage(m.chat, {
      text: `🚨 Se les ha quitado el admin a:\n${mentionsText}`,
      mentions: quitados
    });

  } catch (err) {
    console.error('quitarAdmins: excepción', err);
    try { await conn.sendMessage(m.chat, { text: '❌ Error al ejecutar .quitar.' }); } catch {}
  }
};

handler.command = ['quitar'];
handler.group = true;
handler.register = false;

export default handler;
