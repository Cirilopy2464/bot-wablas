// index.js
const express = require("express");
const axios = require("axios");
const respuestas = require("./respuestas_rowid");

const app = express();
app.use(express.json());

// Configurá tu API KEY y endpoint de Wablas
const API_KEY = "Up34hvEKA2KpLgRtYRu6oa06AoDxEDcFsyXI0zoa34RAKVYWUiEpI6A";
const API_URL = "https://console.wablas.com/api/send-message"; // o el endpoint correcto según tu cuenta

const headers = {
  "Content-Type": "application/json",
  Authorization: API_KEY
};

// Función para enviar mensajes normales
async function sendMessage(phone, message) {
  try {
    await axios.post(API_URL, {
      phone,
      message
    }, { headers });
  } catch (err) {
    console.error("Error al enviar mensaje:", err.response?.data || err.message);
  }
}

// Función para enviar la lista interactiva
async function sendLista(phone) {
  const mensajeLista = {
    phone,
    isList: true,
    message: {
      title: "Lista de servicios",
      description: "Elegí un servicio para ver precios:",
      buttonText: "Ver opciones",
      sections: [
        {
          title: "Servicios disponibles",
          rows: Object.entries(respuestas).map(([id, respuesta]) => {
            const title = respuesta.split('\n')[0].replace(/[\*🎬🎧💳]/g, '').trim();
            return {
              id,
              title,
              description: "Toque para ver precios"
            };
          })
        }
      ]
    }
  };

  try {
    await axios.post(API_URL, mensajeLista, { headers });
  } catch (err) {
    console.error("Error al enviar lista:", err.response?.data || err.message);
  }
}

app.post("/webhook", async (req, res) => {
  const { message, from, rowId } = req.body;
  const phone = from;

  if (rowId && respuestas[rowId]) {
    await sendMessage(phone, respuestas[rowId]);
  } else if (message?.toLowerCase().includes("hola") || message?.toLowerCase().includes("precio")) {
    await sendLista(phone);
  } else {
    await sendMessage(phone, "👋 Escribí *hola* o *precio* para ver todos los servicios disponibles.");
  }

  res.sendStatus(200);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Bot activo en el puerto", PORT));
