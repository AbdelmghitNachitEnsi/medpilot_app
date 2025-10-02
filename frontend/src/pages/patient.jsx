import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";

export default function Patient() {
    const router = useRouter();
    const [username, setUsername] = useState("Patient");
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("token");
        const role = localStorage.getItem("role");
        const storedName = localStorage.getItem("username");
        if (!token || role !== "patient") router.replace("/");
        else if (storedName) setUsername(storedName);
    }, []);

    function logout() {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("username");
        localStorage.removeItem("seenWelcome");
        window.location.href = "/";
    }

    const sendMessage = async (text = null) => {
        const message = text || inputMessage.trim();
        if (!message) return;

        const userMessage = { type: 'user', content: message };
        setMessages(prev => [...prev, userMessage]);
        setInputMessage("");
        setIsLoading(true);

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
- Présente-toi toujours comme "Je suis MEDPILOT, votre assistant médical."
- Utilise du **vrai gras** avec des balises HTML <strong> comme ceci </strong> pour les termes importants.
- Ne utilise pas de markdown avec **étoiles**.
Question utilisateur : ${message}`
                                    }
                                ]
                            }
                        ]
                    })
                }
            );
            const data = await response.json();
            let botMessage =
                data.candidates?.[0]?.content?.parts?.[0]?.text || "🤖 Je ne comprends pas.";

            // Convertir le markdown en HTML pour le gras
            botMessage = botMessage.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

            const botMessageObj = { type: 'bot', content: botMessage };
            setMessages(prev => [...prev, botMessageObj]);
        } catch (err) {
            const errorMessage = { type: 'bot', content: "❌ Erreur de connexion à l'API." };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const seenWelcome = localStorage.getItem("seenWelcome");
        if (!seenWelcome) {
            const welcomeMessage = {
                type: 'bot',
                content: `👋 Bonjour ${username}! Je suis <strong>MEDPILOT</strong>, votre assistant médical. Comment puis-je vous aider aujourd'hui ?`
            };
            setMessages([welcomeMessage]);
            localStorage.setItem("seenWelcome", "true");
        }
    }, [username]);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <>
            <Head>
                <title>MEDPILOT - Assistant Médical</title>
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet" />
            </Head>

            <div className="h-screen bg-white font-inter flex flex-col relative overflow-hidden">
                {/* Background Medical Pattern - FIXE sur toute la page */}
                <div className="fixed inset-0 opacity-[0.03] pointer-events-none z-0">
                    <div
                        className="absolute inset-0"
                        style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M50 20 L60 40 L80 45 L65 60 L70 80 L50 70 L30 80 L35 60 L20 45 L40 40 Z' fill='%2300597'/%3E%3C/svg%3E")`,
                            backgroundSize: '120px 120px'
                        }}
                    ></div>
                </div>

                {/* Medical Gradient Orbs - FIXE sur toute la page */}
                <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                    <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-100 rounded-full opacity-30 blur-3xl"></div>
                    <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-100 rounded-full opacity-30 blur-3xl"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-100 rounded-full opacity-20 blur-3xl"></div>
                </div>

                {/* Header FIXE - ne bouge pas au scroll */}
                <header className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-md border-b border-gray-200/50 px-6 py-4 z-50">
                    <div className="flex items-center justify-between max-w-7xl mx-auto">
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg">
                                <i className="fas fa-robot text-white text-lg"></i>
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">MEDPILOT Assistant</h1>
                                <p className="text-gray-600 text-sm">Bienvenue, {username}</p>
                            </div>
                        </div>
                        <button
                            onClick={logout}
                            className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 flex items-center space-x-2 text-sm"
                        >
                            <i className="fas fa-sign-out-alt"></i>
                            <span>Déconnexion</span>
                        </button>
                    </div>
                </header>

                {/* Main Chat Area - avec padding pour la navbar fixe */}
                <div className="flex-1 flex flex-col overflow-hidden pt-20"> {/* pt-20 pour compenser la navbar fixe */}

                    {/* Messages Container */}
                    <div className="flex-1 overflow-y-auto px-6 py-4">
                        <div className="max-w-4xl mx-auto space-y-8">
                            {messages.map((message, index) => (
                                <div
                                    key={index}
                                    className={`flex gap-6 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    {message.type === 'bot' && (
                                        <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                                            <i className="fas fa-robot text-white text-base"></i>
                                        </div>
                                    )}

                                    <div className={`max-w-[75%] ${message.type === 'user' ? 'order-first' : ''}`}>
                                        <div className={`rounded-2xl px-6 py-4 shadow-sm ${
                                            message.type === 'user'
                                                ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-br-none'
                                                : 'bg-white/90 backdrop-blur-sm text-gray-800 border border-gray-200/50 rounded-bl-none'
                                        }`}>
                                            {message.type === 'bot' ? (
                                                <div
                                                    className="prose prose-sm max-w-none"
                                                    dangerouslySetInnerHTML={{ __html: message.content }}
                                                />
                                            ) : (
                                                <div className="whitespace-pre-wrap text-white">{message.content}</div>
                                            )}
                                        </div>
                                        <div className={`text-xs text-gray-500 mt-2 ${message.type === 'user' ? 'text-right' : 'text-left'}`}>
                                            {message.type === 'user' ? 'Vous' : 'MEDPILOT'}
                                        </div>
                                    </div>

                                    {message.type === 'user' && (
                                        <div className="w-12 h-12 bg-gradient-to-br from-gray-400 to-gray-500 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                                            <i className="fas fa-user text-white text-base"></i>
                                        </div>
                                    )}
                                </div>
                            ))}

                            {isLoading && (
                                <div className="flex gap-6 justify-start">
                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                                        <i className="fas fa-robot text-white text-base"></i>
                                    </div>
                                    <div className="bg-white/90 backdrop-blur-sm border border-gray-200/50 rounded-2xl rounded-bl-none px-6 py-4 shadow-sm">
                                        <div className="flex space-x-2">
                                            <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
                                            <div className="w-3 h-3 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                            <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Input Area FIXE en bas */}
                    <div className="border-t border-gray-200/50 bg-white/90 backdrop-blur-md px-6 py-6">
                        <div className="max-w-4xl mx-auto">
                            <div className="relative">
                <textarea
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Posez votre question médicale..."
                    className="w-full px-6 py-4 pr-16 bg-white border border-gray-300 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm placeholder-gray-500 shadow-sm"
                    rows="2"
                    style={{
                        minHeight: '60px',
                    }}
                />
                                <button
                                    onClick={() => sendMessage()}
                                    disabled={!inputMessage.trim() || isLoading}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed rounded-xl flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                                >
                                    <i className={`fas fa-paper-plane text-white text-base ${isLoading ? 'opacity-50' : ''}`}></i>
                                </button>
                            </div>

                            {/* Quick Suggestions */}
                            <div className="flex flex-wrap gap-3 mt-4 justify-center">
                                <button
                                    onClick={() => sendMessage("Quels sont les symptômes du rhume ?")}
                                    className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl text-sm font-medium border border-blue-200 transition-all duration-200 hover:shadow-md"
                                >
                                    Symptômes rhume
                                </button>
                                <button
                                    onClick={() => sendMessage("Quand consulter un médecin ?")}
                                    className="px-4 py-2 bg-green-50 hover:bg-green-100 text-green-600 rounded-xl text-sm font-medium border border-green-200 transition-all duration-200 hover:shadow-md"
                                >
                                    Quand consulter
                                </button>
                                <button
                                    onClick={() => sendMessage("Comment prendre sa tension artérielle ?")}
                                    className="px-4 py-2 bg-cyan-50 hover:bg-cyan-100 text-cyan-600 rounded-xl text-sm font-medium border border-cyan-200 transition-all duration-200 hover:shadow-md"
                                >
                                    Mesure tension
                                </button>
                                <button
                                    onClick={() => sendMessage("Premiers soins en cas d'urgence")}
                                    className="px-4 py-2 bg-purple-50 hover:bg-purple-100 text-purple-600 rounded-xl text-sm font-medium border border-purple-200 transition-all duration-200 hover:shadow-md"
                                >
                                    Premiers soins
                                </button>
                            </div>

                            <div className="text-center mt-6">
                                <p className="text-xs text-gray-500">
                                    © 2025 MEDPILOT. Assistance médicale 24h/24 - Contact: +212 649-186852
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <style jsx global>{`
                    .prose strong {
                        font-weight: 600;
                        color: #1f2937;
                    }
                    .prose {
                        line-height: 1.6;
                    }
                    body {
                        overflow: hidden; /* Empêche le scroll du body principal */
                    }
                `}</style>
            </div>
        </>
    );
}