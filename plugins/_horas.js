// 🐾 plugins/_horas.js — FelixCat_Bot 🕒 Control total de horarios automáticos
const programaciones = {}; // { idGrupo: { accion, hora, timeout } }

let handler = async (m, { conn, command, args, isAdmin }) => {
  if (!isAdmin) return m.reply('⚠️ Solo los administradores pueden usar este comando.');
  const idGrupo = m.chat;

  // --- CANCELAR ---
  if (command === 'cancelar') {
    if (programaciones[idGrupo]) {
      clearTimeout(programaciones[idGrupo].timeout);
      delete programaciones[idGrupo];
      return m.reply('❌ Se canceló la programación automática para este grupo.');
    } else {
      return m.reply('ℹ️ No hay ninguna programación activa para este grupo.');
    }
  }

  // --- LISTAR PROGRAMACIONES ---
  if (command === 'listahoras') {
    const keys = Object.keys(programaciones);
    if (keys.length === 0) return m.reply('📭 No hay horarios automáticos programados.');

    let texto = '🕒 *Programaciones activas:*\n\n';
    for (const grupoId of keys) {
      const { accion, hora } = programaciones[grupoId];
      const groupName = (await conn.groupMetadata(grupoId).catch(() => ({ subject: 'Grupo desconocido' }))).subject;
      texto += `• *${groupName}*\n   → ${accion === 'abrir' ? '🟢 Abrir' : '🔒 Cerrar'} a las *${hora}*\n\n`;
    }

    return m.reply(texto.trim());
  }

  // --- LIMPIAR TODAS ---
  if (command === 'limpiarhoras') {
    for (const g in programaciones) {
      clearTimeout(programaciones[g].timeout);
      delete programaciones[g];
    }
    return m.reply('🧹 Todas las programaciones automáticas fueron eliminadas.');
  }

  // --- PROGRAMAR ABRIR / CERRAR ---
  if (!args[0]) return m.reply(`⏰ Uso correcto:\n\n.${command} HH:MM:SS\n\nEjemplo:\n.${command} 22:30:00`);

  const hora = args[0];
  const [h, min, seg] = hora.split(':').map(n => parseInt(n));
  if (isNaN(h) || isNaN(min) || isNaN(seg)) return m.reply('❌ Hora inválida. Usa el formato HH:MM:SS');

  const ahora = new Date();
  const objetivo = new Date();
  objetivo.setHours(h, min, seg, 0);
  if (objetivo <= ahora) objetivo.setDate(objetivo.getDate() + 1);

  const msRestantes = objetivo - ahora;
  const accion = command === 'abrir' ? 'abrir' : 'cerrar';
  const textoConfirm = accion === 'abrir'
    ? `🕓 El grupo se abrirá automáticamente a las ${hora}.`
    : `🕒 El grupo se cerrará automáticamente a las ${hora}.`;

  await m.reply(textoConfirm);

  // Cancelar programación anterior de este grupo si existe
  if (programaciones[idGrupo]) clearTimeout(programaciones[idGrupo].timeout);

  // Guardar nueva programación
  programaciones[idGrupo] = {
    accion,
    hora,
    timeout: setTimeout(async () => {
      try {
        await conn.groupSettingUpdate(
          m.chat,
          accion === 'abrir' ? 'not_announcement' : 'announcement'
        );
        await conn.sendMessage(m.chat, {
          text: `✅ El grupo fue ${accion === 'abrir' ? 'abierto' : 'cerrado'} automáticamente a las ${hora}`
        });
        delete programaciones[idGrupo];
      } catch (e) {
        console.error(e);
        await conn.sendMessage(m.chat, {
          text: `❌ Error al intentar ${accion} el grupo automáticamente.`
        });
        delete programaciones[idGrupo];
      }
    }, msRestantes)
  };
};

handler.command = ['abrir', 'cerrar', 'cancelar', 'listahoras', 'limpiarhoras'];
handler.group = true;

export default handler;
