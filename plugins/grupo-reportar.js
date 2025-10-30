let handler = async (m, { conn, args }) => {
  if (!m.isGroup) return conn.reply(m.chat, '❌ Este comando solo funciona en grupos.', m);

  // Usuario reportado (respuesta o mención)
  let target = (m.quoted && m.quoted.sender) || (m.mentionedJid && m.mentionedJid[0]);
  if (!target) return conn.reply(m.chat, 
    '⚠️ Debes responder o mencionar al usuario que deseas reportar.\n\nEjemplo:\n.report @usuario insultos\nO responde a su mensaje con:\n.report spam', m
  );

  const reason = args.length ? args.join(' ') : 'Sin motivo especificado';

  // Obtener metadatos del grupo
  let metadata = {};
  try { metadata = await conn.groupMetadata(m.chat); } catch { metadata = { participants: [] }; }

  // Filtrar administradores
  const admins = (metadata.participants || []).filter(p => p.admin).map(p => p.id);
  if (admins.length === 0) return conn.reply(m.chat, '⚠️ No se encontraron administradores en este grupo.', m);

  const frases = [
    '🚨 Atención oficiales: se ha detectado un comportamiento subversivo.',
    '💣 Instrucción: el objetivo será evaluado por el comando de control.',
    '🪖 La disciplina se mantiene: los reportes se revisan de inmediato.',
    '🔥 Insubordinación registrada: proceder según protocolo.',
    '⚡ Objetivo marcado. Acciones disciplinarias bajo revisión.'
  ];
  const fraseAleatoria = frases[Math.floor(Math.random() * frases.length)];

  const text = `⚠️ *ALERTA MILITAR EN EL GRUPO*\n\n` +
               `🎯 *Objetivo:* @${target.split('@')[0]}\n` +
               `👮 *Reportado por:* @${m.sender.split('@')[0]}\n` +
               `📝 *Motivo:* ${reason}\n\n` +
               `🎖️ *Oficiales de control:* ${admins.map(a => '@' + a.split('@')[0]).join(', ')}\n\n` +
               `💂 ${fraseAleatoria}`;

  const mentions = [target, m.sender, ...admins];
  await conn.sendMessage(m.chat, { text, mentions }, { quoted: m });
};

handler.help = ['report', 'reportar'];
handler.tags = ['group'];
handler.command = /^report(ar)?$/i; // ✅ acepta ambos
handler.group = true;
handler.register = true;

module.exports = handler; // ✅ compatible con CommonJS
