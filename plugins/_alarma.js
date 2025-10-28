// plugins/alarmaA.js
let handler = async (m, { conn, groupMetadata, isOwner }) => {
  try {
    if (!m?.isGroup) return; // solo grupos
    if (!isOwner) return;    // solo owner

    const text = (m.text || '').trim();
    if (!text || text.toLowerCase() !== 'a') return;

    const participantes = (groupMetadata?.participants || []).map(p => p.id).filter(Boolean);
    if (!participantes.length) return conn.sendMessage(m.chat, { text: '👻 No se detectaron participantes...' });

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

    await conn.sendMessage(m.chat, {
      text: elegido,
      contextInfo: { mentionedJid: participantes }
    });

  } catch (err) {
    console.error('alarmaA: excepción', err);
    try {
      await conn.sendMessage(m.chat, { text: '❌ Error en la invocación de la alarma.' });
    } catch {}
  }
};

// Activador sin prefijo — detecta “A” o “a” sola
handler.customPrefix = /^\s*a\s*$/i;
handler.command = [];
handler.group = true;

export default handler;
