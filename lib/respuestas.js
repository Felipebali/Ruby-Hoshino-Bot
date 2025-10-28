// lib/respuesta.js
const handler = async (type, conn, m) => {
  const msgs = {
    rowner: '💫 Solo mi creador supremo puede usar este comando.',
    owner: '🌹 Este comando está reservado para mi dueño.',
    mods: '🛠️ Solo los moderadores tienen acceso.',
    premium: '💎 Función exclusiva para usuarios Premium.',
    group: '👥 Este comando solo puede usarse dentro de un grupo.',
    private: '💌 Este comando funciona únicamente en chats privados.',
    admin: '🧷 Solo los administradores del grupo pueden usar esta función.',
    botAdmin: '🔧 Necesito ser admin para ejecutar este comando.',
    unreg: '📋 No estás registrado aún.',
    restrict: '🚫 Esta función está temporalmente deshabilitada.'
  };

  const msg = msgs[type];
  if (!msg) return true;

  // Enviar solo el mensaje, sin imágenes ni miniaturas
  await conn.reply(m.chat, msg, m);

  // Intentar reacción
  try { await m.react('✖️'); } catch {}
};

export default handler;
