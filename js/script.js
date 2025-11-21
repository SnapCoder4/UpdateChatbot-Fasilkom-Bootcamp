const sendBtn = document.getElementById("sendBtn");
const userInput = document.getElementById("userInput");
const chatlog = document.getElementById("chatlog");

// 2. Konfigurasi Gemini API

const GEMINI_API_KEY = "AIzaSyA2V7oylzHmvBsCN3RXFkXWTjeGI_uOs-E";

const SYSTEM_PROMPT = `
Kamu adalah chatbot jadwal kuliah kampus dummy.
Jawab singkat, jelas, dan pakai bahasa Indonesia santai.
Gunakan jadwal berikut:

Senin:
- 08.00 - Algoritma Dasar
- 10.00 - Matematika Diskrit
- 13.00 - Praktikum Logika

Selasa:
- 09.00 - Struktur Data
- 11.00 - Sistem Operasi
- 14.00 - Praktikum Struktur Data

Rabu:
- 08.00 - Basis Data
- 10.00 - Jaringan Komputer
- 13.00 - Praktikum Basis Data

Kamis:
- 09.00 - Pemrograman Web
- 11.00 - Interaksi Manusia dan Komputer
- 15.00 - Praktikum Web

Jumat:
- 08.00 - Kecerdasan Buatan
- 10.00 - Keamanan Informasi
- 13.00 - Seminar Teknologi

Jika pertanyaan di luar jadwal kuliah, jawab singkat:
bahwa kamu hanya fokus bantu soal jadwal kuliah di atas.
`;

// Fungsi untuk panggil Gemini API
async function callGemini(userMessage) {
  const url =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

  const payload = {
    systemInstruction: {
      role: "user",
      parts: [{ text: SYSTEM_PROMPT }],
    },
    contents: [
      {
        role: "user",
        parts: [{ text: userMessage }],
      },
    ],
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": GEMINI_API_KEY,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    console.error("Gemini error:", await response.text());
    throw new Error("Request ke Gemini gagal");
  }

  const data = await response.json();

  // Ambil teks dari response
  const parts = data.candidates?.[0]?.content?.parts || [];
  const replyText =
    parts.map((p) => p.text).join("") ||
    "Maaf, aku tidak dapat jawaban dari AI.";

  return replyText;
}

// 3. Fungsi untuk menambah pesan ke DOM

function addMessage(type, text, extraClass = "") {
  const div = document.createElement("div");
  div.classList.add("message", type);
  if (extraClass) div.classList.add(extraClass);
  div.textContent = text;
  chatlog.appendChild(div);
  chatlog.scrollTop = chatlog.scrollHeight;
  return div;
}

// 4. Alur kirim pesan

async function sendMessage() {
  const message = userInput.value.trim();
  if (message === "") return;

  addMessage("user", message);
  userInput.value = "";
  userInput.focus();

  const loadingBubble = addMessage(
    "bot",
    "Sebentar ya, aku lagi mikir…",
    "loading"
  );

  try {
    const reply = await callGemini(message);

    chatlog.removeChild(loadingBubble);
    addMessage("bot", reply);
  } catch (err) {
    console.error(err);
    chatlog.removeChild(loadingBubble);
    addMessage(
      "bot",
      "Maaf, terjadi error saat menghubungi AI.\nCoba cek API key atau koneksi internet kamu."
    );
  }
}

// 5. Event Listener

sendBtn.addEventListener("click", () => {
  sendMessage();
});

userInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    sendMessage();
  }
});

// 6. Pesan awal ketika halaman dibuka

addMessage(
  "bot",
  "Halo! Aku chatbot jadwal kampus dummy berbasis AI Gemini.\nCoba tanya: 'jadwal hari senin apa?' 😊"
);
