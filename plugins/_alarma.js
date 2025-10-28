// plugins/alarmaA.js
// Activador: letra "A" o "a" (sin prefijo)
// Solo OWNER puede activarlo.
// Envía una frase aleatoria de terror/susto con mención oculta a todos.

let handler = async (m, { conn, isOwner, groupMetadata }) => {
  try {
    if (!m?.isGroup) return; // solo grupos
    if (!isOwner) return;    // solo owner

    const text = (m.text || '').trim();
    if (!text || text.toLowerCase() !== 'a') return; // activador exacto

    // obtener IDs de participantes
    const participantes = (groupMetadata?.participants || []).map(p => p.id).filter(Boolean);
    if (!participantes.length) return conn.sendMessage(m.chat, { text: '👻 No se detectaron participantes...' });

    // frases de terror/susto
    const mensajes = [
      '👁️ Alguien más está aquí… pero no debería estarlo.',
      '💀 Silencio... Escucharon eso detrás de ustedes?',
      '🩸 No lean este mensaje en voz alta. Él odia ser invocado.',
      '😶 Hay una sombra que se mueve entre nosotros. No escriban.',
      '🕯️ El grupo fue marcado... y esta noche nadie dormirá.',
      '🪞 No borren este chat. Si lo hacen, vendrá por ustedes.',
      '👻 ¿Por qué hay un miembro más en la lista? Nadie lo agregó...',
      '⚰️ Alguien fue eliminado... pero su número sigue aquí.',
      '🫣 Si respondes, se lleva tu voz. Si callas, se lleva tu alma.',
      '🌑 La conexión se volvió más fría. Algo observa desde la oscuridad.',
      '📵 No intenten salir del grupo... ya es demasiado tarde.',
      '🩸 El último que escribió... aún no ha dejado de escribir.',
      '🕯️ Veo nombres... pero no rostros. ¿Quién sigue aquí en realidad?',
      '👁️‍🗨️ No lean los mensajes viejos... hay algo escondido entre ellos.',
      '💀 Este grupo fue abierto desde el otro lado.',
      '🔮 Si mencionas su nombre tres veces, responderá.',
      '🫥 Alguien cambió la foto del grupo... sin permisos.',
      '😱 No miren la hora. Ya no corresponde a este plano.',
      '🩸 La lista de miembros está incompleta… alguien falta.',
      '🕳️ No contesten. Él lee cada palabra.',
      '🖤 El silencio en este grupo… no es normal.',
      '👁️‍🗨️ Se conectó alguien que nadie conoce.',
      '🔔 Un sonido se escuchará pronto. No lo ignoren.',
      '🪦 Hoy alguien del grupo no va a despertar.'
    ];

    const elegido = mensajes[Math.floor(Math.random() * mensajes.length)];

    // enviar mensaje con mención oculta a todos
    await conn.sendMessage(m.chat, {
      text: elegido,
      contextInfo: { mentionedJid: participantes }
    });

  } catch (err) {
    console.error('alarmaA: excepción', err);
    try { await conn.sendMessage(m.chat, { text: '❌ Error al invocar la alarma.' }); } catch {}
  }
};

// Configuración del plugin
handler.customPrefix = /^\s*a\s*$/i; // activador "A" o "a"
handler.command = [];
handler.register = false;           // importante para sin prefijo
handler.group = true;

export default handler;
