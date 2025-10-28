// plugins/quitarAdmins.js
// Comando: .quitar
// Solo OWNER puede usarlo
// Quita el admin a todos menos al creador del grupo y menciona a cada uno

let handler = async (m, { conn, isOwner }) => {
  try {
    if (!m.isGroup) return conn.sendMessage(m.chat, { text: '⚠️ Este comando solo funciona en grupos.' });
    if (!isOwner) return conn.sendMessage(m.chat, { text: '❌ Solo el dueño del bot puede usar este comando.' });

    // metadata del grupo
    const group = await conn.groupMetadata(m.chat);
    const owner = group.owner; // creador del grupo
    const participantes = group.participants;

    let quitados = [];

    for (let p of participantes) {
      const jid = p.id;
      if (p.admin && jid !== owner) {
        await conn.groupDemoteAdmin(m.chat, [jid]);
        quitados.push(jid);
      }
    }

    if (quitados.length === 0) {
      return conn.sendMessage(m.chat, { text: 'ℹ️ No hay administradores que quitar (excepto el creador).' });
    }

    // mensaje mencionando a todos los quitados
    const mentionsText = quitados.map(jid => `@${jid.split('@')[0]}`).join(', ');
    await conn.sendMessage(m.chat, {
      text: `🚨 Se les ha quitado el admin a:\n${mentionsText}`,
      contextInfo: { mentionedJid: quitados }
    });

  } catch (err) {
    console.error('quitarAdmins: excepción', err);
    try { await conn.sendMessage(m.chat, { text: '❌ Error al ejecutar .quitar.' }); } catch {}
  }
};

handler.command = ['quitar'];
handler.group = true;
handler.register = false; // no requiere registro

export default handler;
