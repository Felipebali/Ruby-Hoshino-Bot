// 🐾 plugins/_horas.js — FelixCat_Bot 🕒 Control de horarios automáticos con cancelación
const programaciones = {}; // Guardará los temporizadores por grupo

let handler = async (m, { conn, command, args, isAdmin }) => {
  if (!isAdmin) return m.reply('⚠️ Solo los administradores pueden usar este comando.');

  const idGrupo = m.chat;

  // --- COMANDO CANCELAR ---
  if (command === 'cancelar') {
    if (programaciones[idGrupo]) {
      clearTimeout(programaciones[idGrupo]);
      delete programaciones[idGrupo];
      return m.reply('❌ Se canceló la programación automática de apertura/cierre para este grupo.');
    } else {
      return m.reply('ℹ️ No hay ninguna programación activa para este grupo.');
    }
  }

  // --- COMANDO ABRIR / CERRAR ---
  if (!args[0]) return m.reply(`⏰ Uso correcto:\n\n.${command} HH:MM:SS\n\nEjemplo:\n.${command} 22:30:00`);

  const hora = args[0];
  const [h, min, seg] = hora.split(':').map(n => parseInt(n));
  if (isNaN(h) || isNaN(min) || isNaN(seg)) return m.reply('❌ Hora inválida. Usa el formato HH:MM:SS');

  const ahora = new Date();
  const objetivo = new Date();
  objetivo.setHours(h, min, seg, 0);

  // Si ya pasó la hora, se programa para mañana
  if (objetivo <= ahora) objetivo.setDate(objetivo.getDate() + 1);

  const msRestantes = objetivo - ahora;
  const accion = command === 'abrir' ? 'abrir' : 'cerrar';
  const textoConfirm = accion === 'abrir'
    ? `🕓 El grupo se abrirá automáticamente a las ${hora}.`
    : `🕒 El grupo se cerrará automáticamente a las ${hora}.`;

  await m.reply(textoConfirm);

  // Cancelar cualquier programación anterior antes de crear una nueva
  if (programaciones[idGrupo]) clearTimeout(programaciones[idGrupo]);

  // Crear nueva programación
  programaciones[idGrupo] = setTimeout(async () => {
    try {
      await conn.groupSettingUpdate(
        m.chat,
        accion === 'abrir' ? 'not_announcement' : 'announcement'
      );
      await conn.sendMessage(m.chat, {
        text: `✅ El grupo fue ${accion === 'abrir' ? 'abierto' : 'cerrado'} automáticamente a las ${hora}`
      });
      delete programaciones[idGrupo]; // Limpia al ejecutarse
    } catch (e) {
      console.error(e);
      await conn.sendMessage(m.chat, {
        text: `❌ Error al intentar ${accion} el grupo automáticamente.`
      });
      delete programaciones[idGrupo];
    }
  }, msRestantes);
};

handler.command = ['abrir', 'cerrar', 'cancelar'];
handler.group = true;

export default handler;
