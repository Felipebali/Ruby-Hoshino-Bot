// 📂 plugins/juegos-opciones.js
let handler = async (m, { conn }) => {
  const chatSettings = global.db.data.chats[m.chat] || {};
  if (chatSettings.games === false) {
    return conn.reply(m.chat, '🎮 Los mini-juegos están desactivados en este grupo.\nUsa *.juegos* para activarlos 🐾', m);
  }

  // 🎲 Lista de opciones
  const opciones = [
    // 🍔 Comida
    { name: "Pizza Napolitana", hint: "🍕" },
    { name: "Sushi Mixto", hint: "🍣" },
    { name: "Tacos Picantes", hint: "🌮" },
    { name: "Chocolate", hint: "🍫" },
    { name: "Plátano", hint: "🍌" },
    { name: "Helado", hint: "🍨" },
    { name: "Hamburguesa", hint: "🍔" },

    // 🐾 Animales
    { name: "Elefante", hint: "🐘" },
    { name: "Perro", hint: "🐶" },
    { name: "Panda", hint: "🐼" },
    { name: "Gato", hint: "🐱" },
    { name: "León", hint: "🦁" },
    { name: "Tigre", hint: "🐯" },
    { name: "Delfín", hint: "🐬" },

    // 💼 Objetos
    { name: "Guitarra", hint: "🎸" },
    { name: "Reloj", hint: "⏰" },
    { name: "Avión", hint: "✈️" },
    { name: "Coche de carreras", hint: "🏎️" },
    { name: "Laptop", hint: "💻" },

    // 🎭 Personajes
    { name: "Harry Potter", hint: "⚡️" },
    { name: "Iron Man", hint: "🤖" },
    { name: "Homero Simpson", hint: "🍩" },
    { name: "Mickey Mouse", hint: "🐭" },
    { name: "Naruto", hint: "🍥" },

    // 🎬 Películas / series
    { name: "La Casa de Papel", hint: "🎭" },
    { name: "Star Wars", hint: "🌌" },
    { name: "El Señor de los Anillos", hint: "💍" },
    { name: "Avengers", hint: "🛡️" },
    { name: "Matrix", hint: "🟩" },

    // 💬 Frases / expresiones
    { name: "Carpe Diem", hint: "⌛️" },
    { name: "Hakuna Matata", hint: "🦁" },
    { name: "No Pain No Gain", hint: "💪" },
    { name: "Hasta la vista", hint: "🤖" }
  ];

  // Selecciona una opción correcta aleatoria
  const correct = opciones[Math.floor(Math.random() * opciones.length)];

  // Mezcla las opciones
  let choices = [correct.name];
  while (choices.length < 4) {
    const opt = opciones[Math.floor(Math.random() * opciones.length)].name;
    if (!choices.includes(opt)) choices.push(opt);
  }
  choices = choices.sort(() => Math.random() - 0.5);

  // Guarda la partida
  if (!global.variosGame) global.variosGame = {};
  global.variosGame[m.chat] = {
    answer: correct.name,
    hint: correct.hint,
    options: choices,
    timeout: setTimeout(async () => {
      const game = global.variosGame?.[m.chat];
      if (game?.answer) {
        const msgs = [
          '💀 Se te acabó el tiempo!',
          '🤡 Ni lo intentaste!',
          '😹 Patético, era',
          '🫠 Sos un desastre!'
        ];
        await conn.reply(m.chat, `${msgs[Math.floor(Math.random() * msgs.length)]} *${game.answer}* ${game.hint}`, m);
        delete global.variosGame[m.chat];
      }
    }, 30000)
  };

  // Mensaje inicial
  let text = `🎲 *Adivina la opción correcta*\n\n${correct.hint}\n`;
  text += `Opciones:\n${choices.map((o, i) => `${i + 1}. ${o}`).join('\n')}`;
  text += `\n\nResponde con el número o el nombre correcto.\n🕓 ¡Tienes 30 segundos!`;

  await conn.reply(m.chat, text, m);
};

// 🎯 Reacción a las respuestas
handler.before = async (m, { conn }) => {
  const game = global.variosGame?.[m.chat];
  if (!game?.answer || !m?.text) return;

  const normalizedUser = m.text.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  const normalizedAnswer = game.answer.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();

  // Si responde con número
  const index = parseInt(m.text);
  let chosen = '';
  if (!isNaN(index) && index >= 1 && index <= game.options.length) {
    chosen = game.options[index - 1].replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  } else {
    chosen = normalizedUser;
  }

  if (chosen === normalizedAnswer) {
    clearTimeout(game.timeout);
    await conn.reply(m.chat, `✅ ¡Correcto! Era *${game.answer}* ${game.hint} 🎉`, m);
    delete global.variosGame[m.chat];
  } else {
    const frases = [
      '❌ Fallaste!',
      '🙃 Casi, pero no!',
      '🤔 Intentá de nuevo!',
      '😹 No era esa!',
      '💀 Sos un desastre!'
    ];
    await conn.reply(m.chat, frases[Math.floor(Math.random() * frases.length)], m);
  }
};

handler.help = ['plato', 'opcion', 'varios'];
handler.tags = ['juegos'];
handler.command = ['plato', 'opcion', 'varios'];
handler.group = true;

export default handler;
