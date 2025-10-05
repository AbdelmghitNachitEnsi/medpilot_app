// frontend/pages/doctor.jsx
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function Doctor() {
  const router = useRouter();
  const [username, setUsername] = useState("Doctor");
  const [rendezvous, setRendezvous] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const storedName = localStorage.getItem("username");
    if (!token || role !== "doctor") router.replace("/");
    else if (storedName) setUsername(storedName);
  }, []);
   // Récupérer les rendez-vous
  useEffect(() => {
    const fetchRendezvous = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const res = await fetch("http://localhost:4000/rendezvous/mydoctor", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) setRendezvous(data.rendezvous || []);
        else console.error(data.error);
      } catch (err) {
        console.error(err);
      }
    };
    fetchRendezvous();
  }, []);

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("username");
    localStorage.removeItem("seenWelcome"); // reset welcome
    window.location.href = "/";
  }

  const sendMessage = async (text = null) => {
    const input = document.getElementById("userInput");
    const message = text || input.value.trim();
    if (!message) return;
    addMessage("user", message);
    if (!text) input.value = "";

    try {
      const response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyBeQP08KNwnHAszw5NOD4aAppk7XF0216A",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `Tu es un chatbot professionnel appelé "MEDPILOT".
Règles :
- Réponds uniquement aux questions médicales.
- Donne contact si demandé : +212 649-186852.
- Ne commence pas tes réponses par "Je suis MEDPILOT" sauf si l'utilisateur te demande explicitement qui tu es.
Question utilisateur : ${message}`
                  }
                ]
              }
            ]
          })
        }
      );
      const data = await response.json();
      const botMessage =
        data.candidates?.[0]?.content?.parts?.[0]?.text || "🤖 Je ne comprends pas.";
      addMessage("bot", botMessage);
    } catch (err) {
      addMessage("bot", "❌ Erreur de connexion à l'API.");
    }
  };

  const addMessage = (sender, text) => {
    const chatBox = document.getElementById("chatBox");
    const bubble = document.createElement("div");
    bubble.className = `flex mb-3 ${sender === "user" ? "justify-end" : "justify-start"}`;

    const avatar = document.createElement("img");
    avatar.src =
      sender === "user"
        ? "https://cdn-icons-png.flaticon.com/512/847/847969.png"
        : "https://cdn-icons-png.flaticon.com/512/4712/4712109.png";
    avatar.className = "w-10 h-10 rounded-full";

    const msg = document.createElement("div");
    msg.innerText = text;
    msg.className = `px-4 py-2 rounded-lg max-w-xs break-words ${
      sender === "user" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-900"
    }`;

    if (sender === "user") {
      bubble.appendChild(msg);
      bubble.appendChild(avatar);
    } else {
      bubble.appendChild(avatar);
      bubble.appendChild(msg);
    }

    chatBox.appendChild(bubble);
    chatBox.scrollTop = chatBox.scrollHeight; // auto scroll
  };

  useEffect(() => {
    const seenWelcome = localStorage.getItem("seenWelcome");
    if (!seenWelcome) {
      addMessage(
        "bot",
        `👋 Salam Dr ${username}! Je suis MEDPILOT, votre assistant médical. Posez-moi une question médicale.`
      );
      localStorage.setItem("seenWelcome", "true");
    }
  }, [username]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-5 font-sans">
      {/* Header */}
      <header className="flex items-center w-full max-w-2xl bg-white shadow-md rounded-lg p-4 mb-6">
        <img
          src="/mnt/data/d3a6c27c-88c4-4d31-839b-21f483602623.png"
          alt="avatar"
          className="w-16 h-16 rounded-full mr-4"
        />
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-800">Bienvenue Dr {username}</h1>
          <p className="text-gray-500">Assistant Médical — MEDPILOT</p>
        </div>
         <button
            onClick={() => router.push("/manage-doctors")}
            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-md"
            >
            Gérer les Doctors
            </button>
        <button
          onClick={logout}
          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md"
        >
          Logout
        </button>
      </header>
        {/* Liste des rendez-vous */}
      <section className="w-full max-w-2xl bg-white shadow-md rounded-lg p-4 mb-6">
        <h2 className="text-lg font-semibold mb-3">Mes rendez-vous</h2>
        {rendezvous.length === 0 ? (
          <p>Aucun rendez-vous pour l'instant.</p>
        ) : (
          <ul className="space-y-2">
            {rendezvous.map((r) => (
              <li
                key={r.id}
                className="border border-gray-200 rounded-lg p-3 flex justify-between items-center"
              >
                <div>
                  <p className="font-medium">{r.patient.username}</p>
                  <p className="text-gray-500">{r.patient.email}</p>
                </div>
                <div className="text-right">
                  <p className="text-gray-700">{r.date}</p>
                  <p className="text-gray-700">{r.heure}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Chat Widget */}
      <div className="flex flex-col w-full max-w-2xl bg-white shadow-md rounded-lg p-4">
        <div
          id="chatBox"
          className="flex-1 overflow-y-auto h-96 p-2 mb-4 space-y-2 scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-gray-200 scroll-smooth"
        ></div>

        <div className="flex">
          <input
            type="text"
            id="userInput"
            placeholder="Écrivez un message..."
            className="flex-1 border border-gray-300 rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button
            onClick={() => sendMessage()}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-r-lg"
          >
            Envoyer
          </button>
        </div>
      </div>
    </div>

    
  );
}
