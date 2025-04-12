const express = require("express");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());

// 🔐 Token de Wablas
const WABLAS_TOKEN = "Up34hvEKA2KpLgRtYRu6oa06AoDxEDcFsyXI0zoa34RAKVYWUiEpI6A"; // Reemplazá por tu token real

// 🟢 Mensaje de bienvenida
const mensajeBienvenida = `
👋 *Bienvenido/a!*

*✨ Elegí un servicio:* (desplegable)
Tocá el botón "Ver opciones" para abrir el menú.`;

// 💳 Formas de pago
const formasPago = `

💳 *Formas de Pago:*
(*Giro* 🙅🏻‍♂️ no carga de billetera)

- *Titular:* Cirilo Guillen
- *C.I.:* 5578346
- *Alias:* 5578346

➯ Ueno Bank: 619196233  
➯ Atlas: 1530937  
➯ Banco Familiar: 81-245664  
➯ Mango: 0972302296 - @ciriloguillen  
➯ Tigo Money: 0982832010  
➯ Personal Pay: 0972302296  
➯ Claro: 0992598035  
➯ Eko: 0992598035  
➯ Wally: 0982832010`;

const ultimosSaludos = {};

// 📤 Enviar mensaje simple
const sendMessage = async (numero, mensaje) => {
  try {
    await axios.post("https://bdg.wablas.com/api/send-message", {
      phone: numero,
      message: mensaje
    }, {
      headers: { Authorization: WABLAS_TOKEN }
    });
  } catch (error) {
    console.error("❌ Error al enviar mensaje:", error.response?.data || error.message);
  }
};

// 📤 Enviar lista interactiva
const sendListMessage = async (numero) => {
  try {
    await axios.post("https://bdg.wablas.com/api/v2/send-message", {
      phone: numero,
      isList: true,
      message: {
        title: "Lista de servicios",
        description: "Elegí un servicio para ver precios:",
        buttonText: "Ver opciones",
        sections: [{
          title: "Servicios disponibles",
          rows: [
            { title: "Free Fire", rowId: "servicio_freefire" },
            { title: "Netflix", rowId: "servicio_netflix" },
            { title: "Disney+", rowId: "servicio_disney" },
            { title: "Max", rowId: "servicio_max" },
            { title: "Prime Video", rowId: "servicio_prime" },
            { title: "Paramount+", rowId: "servicio_paramount" },
            { title: "Crunchyroll", rowId: "servicio_crunchy" },
            { title: "Spotify", rowId: "servicio_spotify" },
            { title: "YouTube Premium", rowId: "servicio_youtube" },
            { title: "FlujoTV", rowId: "servicio_flujo" },
            { title: "FénixTV", rowId: "servicio_fenix" },
            { title: "Ib Player", rowId: "servicio_ibplayer" },
            { title: "IPTV Smarters", rowId: "servicio_iptv" },
            { title: "Tigo Sports", rowId: "servicio_tigo" },
            { title: "Apple TV", rowId: "servicio_appletv" },
            { title: "Apple Music", rowId: "servicio_applemusic" },
            { title: "Call of Duty", rowId: "servicio_cod" },
            { title: "PUBG Mobile", rowId: "servicio_pubg" },
            { title: "Clash Royale", rowId: "servicio_royale" },
            { title: "Clash of Clans", rowId: "servicio_clans" },
            { title: "Roblox", rowId: "servicio_roblox" },
            { title: "8 Ball Pool", rowId: "servicio_pool" },
            { title: "Tarjeta Virtual", rowId: "servicio_tarjeta" },
            { title: "Monedas TikTok", rowId: "servicio_tiktok" },
            { title: "Formas de Pago", rowId: "formas_pago" }
          ]
        }]
      }
    }, {
      headers: { Authorization: WABLAS_TOKEN }
    });
  } catch (error) {
    console.error("❌ Error al enviar lista:", error.response?.data || error.message);
  }
};

// 📥 Importar respuestas automáticas
const respuestas = require("./respuestas_rowid.js");

// 📩 Webhook
app.post("/", async (req, res) => {
  const mensaje = (req.body.message || "").toLowerCase().trim();
  const numero = req.body.phone;
  const ahora = Date.now();
  const MILISEGUNDOS_24HS = 24 * 60 * 60 * 1000;

  // ✅ Enviar mensaje de bienvenida + lista si pasaron más de 24h
  if (!ultimosSaludos[numero] || ahora - ultimosSaludos[numero] > MILISEGUNDOS_24HS) {
    console.log("🟢 Enviando bienvenida y lista a", numero);
    await sendMessage(numero, mensajeBienvenida);
    await sendListMessage(numero);
    ultimosSaludos[numero] = ahora;
    return res.sendStatus(200);
  }

  // 💳 Si el cliente selecciona "formas de pago"
  if (mensaje === "formas_pago") {
    await sendMessage(numero, formasPago);
    return res.sendStatus(200);
  }

  // 🧠 Respuestas por rowId
  if (respuestas[mensaje]) {
    await sendMessage(numero, respuestas[mensaje]);
    return res.sendStatus(200);
  }

  res.sendStatus(200);
});

// 🌐 Página base
app.get("/", (req, res) => {
  res.send("✅ Bot online y funcionando.");
});

app.listen(PORT, () => {
  console.log("✅ Bot activo en el puerto " + PORT);
});
