// 📂 plugins/grupo-avisar.js

let handler = async (m, { conn, args }) => {
  if (!m.isGroup)
    return conn.reply(m.chat, '❌ Este comando solo funciona en grupos.', m);

  // Usuario objetivo (respuesta o mención)
  const target =
    (m.quoted && m.quoted.sender) ||
    (m.mentionedJid && m.mentionedJid[0]);
  if (!target)
    return conn.reply(
      m.chat,
      '⚠️ Debes responder o mencionar al usuario que deseas avisar.\n\nEjemplo:\n.avisar @usuario insultos\nO responde a su mensaje con:\n.avisar spam',
      m
    );

  // Motivo
  const reason = args.length ? args.join(' ') : 'Sin motivo especificado';

  // Obtener metadatos del grupo
  let metadata = {};
  try {
    metadata = await conn.groupMetadata(m.chat);
  } catch {
    metadata = { participants: [] };
  }

  // Administradores
  const admins = (metadata.participants || [])
    .filter((p) => p.admin)
    .map((p) => p.id);

  if (!admins.length)
    return conn.reply(m.chat, '⚠️ No se encontraron administradores.', m);

  // Frases
  const frases = [
    '🚨 Atención oficiales: se ha detectado un comportamiento sospechoso.',
    '💣 Instrucción: el objetivo será evaluado por el comando de control.',
    '🪖 La disciplina se mantiene: los avisos se revisan de inmediato.',
    '🔥 Insubordinación registrada: proceder según protocolo.',
    '⚡ Objetivo marcado. Acciones disciplinarias bajo revisión.'
  ];
  const fraseAleatoria =
    frases[Math.floor(Math.random() * frases.length)];

  // Mensaje
  const text =
    `⚠️ *AVISO DE COMPORTAMIENTO*\n\n` +
    `🎯 *Usuario:* @${target.split('@')[0]}\n` +
    `👮 *Reportado por:* @${m.sender.split('@')[0]}\n` +
    `📝 *Motivo:* ${reason}\n\n` +
    `🎖️ *Administradores:* ${admins
      .map((a) => '@' + a.split('@')[0])
      .join(', ')}\n\n` +
    `💂 ${fraseAleatoria}`;

  const mentions = [target, m.sender, ...admins];

  await conn.sendMessage(m.chat, { text, mentions }, { quoted: m });
};

// 📜 Configuración
handler.help = ['avisar'];
handler.tags = ['group'];
handler.command = /^avisar$/i; // ✅ usa .avisar
handler.group = true;
handler.register = true;

export default handler; // ✅ ESM compatible
