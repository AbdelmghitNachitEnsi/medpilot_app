import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";

export default function Patient() {
    const router = useRouter();
    const [username, setUsername] = useState("Patient");
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [activeFeature, setActiveFeature] = useState("chat");

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

  const userMessage = { type: 'user', content: message, timestamp: new Date() };
  setMessages(prev => [...prev, userMessage]);
  setInputMessage("");
  setIsLoading(true);

  try {
    // 🏥 FIRST: Try AI Medical Service
    console.log("🔍 Checking symptoms with AI medical service...");
    
    const aiResponse = await fetch("http://localhost:5001/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: message })
    });

    if (aiResponse.ok) {
      const aiData = await aiResponse.json();
      
      // Check if we have a good confidence score (adjust threshold as needed)
      if (aiData.recommended_specialty_fr && aiData.confidence_score > 0.1) {
        const specialtyFr = aiData.recommended_specialty_fr;
        const specialtyEn = aiData.recommended_specialty_en;
        const confidence = (aiData.confidence_score * 100).toFixed(0);
        
        console.log(`🏥 AI detected: ${specialtyFr} (Confidence: ${confidence}%)`);
        
        const botMessageObj = {
          type: "bot",
          content: `D'après vos symptômes, je vous recommande de consulter un <strong>${specialtyFr}</strong>. Je vous redirige vers la prise de rendez-vous...`,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, botMessageObj]);
        setIsLoading(false);

        // 🎯 AUTO-REDIRECT to appointment page after 2.5 seconds
        setTimeout(() => {
          router.push(`/rdv?specialty=${encodeURIComponent(specialtyEn)}`);
        }, 2500);
        
        return; // Stop here, don't call Gemini
      }
    }

    // 🧠 FALLBACK: Use Gemini API if AI service doesn't find a good match
    console.log("🤖 No strong medical match found, using Gemini...");
    
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      throw new Error('Failed to get response');
    }

    const data = await response.json();
    
    const botMessageObj = {
      type: 'bot',
      content: data.response,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, botMessageObj]);

  } catch (error) {
    console.error('Error:', error);
    
    const errorMessageObj = {
      type: 'bot',
      content: "Désolé, je rencontre des difficultés techniques. Veuillez réessayer.",
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, errorMessageObj]);
  } finally {
    setIsLoading(false);
  }
};
    useEffect(() => {
        const seenWelcome = localStorage.getItem("seenWelcome");
        if (!seenWelcome) {
            const welcomeMessage = {
                type: 'bot',
                content: `👋 Bonjour <strong>${username}</strong> ! Je suis votre assistant médical <strong>VIZPILOT</strong>. Je suis là pour vous accompagner dans vos questions de santé. Comment puis-je vous aider aujourd'hui ?`,
                timestamp: new Date()
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

    const quickActions = [
        {
            icon: "fas fa-heartbeat",
            title: "Analyse de symptômes",
            description: "Décrivez vos symptômes",
            prompt: "Je ressens certains symptômes, pouvez-vous m'aider à les analyser ?"
        },
        {
            icon: "fas fa-pills",
            title: "Informations médicaments",
            description: "Posologie et effets secondaires",
            prompt: "Pouvez-vous me donner des informations sur un médicament ?"
        },
        {
            icon: "fas fa-stethoscope",
            title: "Conseils prévention",
            description: "Restez en bonne santé",
            prompt: "Quels sont vos conseils pour rester en bonne santé ?"
        },
        {
            icon: "fas fa-notes-medical",
            title: "Guide premiers soins",
            description: "Urgences médicales",
            prompt: "Quels sont les premiers soins en cas d'urgence ?"
        }
    ];

    const formatTime = (date) => {
        return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    };

    const clearChat = () => {
        setMessages([]);
        const welcomeMessage = {
            type: 'bot',
            content: `🔄 Conversation réinitialisée. Bonjour <strong>${username}</strong> ! Comment puis-je vous aider ?`,
            timestamp: new Date()
        };
        setMessages([welcomeMessage]);
    };

    return (
        <>
            <Head>
                <title>VIZPILOT - Assistant Médical</title>
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
            </Head>

            <div className="h-screen bg-gradient-to-br from-gray-50 to-gray-100 font-inter flex flex-col relative overflow-hidden">
                {/* Background Pattern */}
                <div className="fixed inset-0 opacity-[0.03] pointer-events-none z-0">
                    <div
                        className="absolute inset-0"
                        style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M50 20 L60 40 L80 45 L65 60 L70 80 L50 70 L30 80 L35 60 L20 45 L40 40 Z' fill='%2300597'/%3E%3C/svg%3E")`,
                            backgroundSize: '120px 120px'
                        }}
                    ></div>
                </div>

                {/* Gradient Orbs */}
                <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                    <div className="absolute -top-40 -right-40 w-80 h-80 bg-violet-100 rounded-full opacity-20 blur-3xl"></div>
                    <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-100 rounded-full opacity-20 blur-3xl"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-100 rounded-full opacity-15 blur-3xl"></div>
                </div>

                {/* Header */}
                <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200/60 px-6 py-4 sticky top-0 z-50">
                    <div className="max-w-7xl mx-auto flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-3">
                                <Link href="/" className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                                        <i className="fas fa-heartbeat text-white text-lg"></i>
                                    </div>
                                    <span className="text-2xl font-bold text-gray-900">
                MED<span className="text-blue-600">PILOT</span>
              </span>
                                </Link>
                            </div>

                            <div className="h-8 w-px bg-gray-300/60"></div>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">Assistant Médical</h1>
                                <p className="text-gray-600 text-sm">Bienvenue, {username}</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={() => router.push("/rdv")}
                                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-4 py-2 rounded-xl font-medium transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-xl"
                            >
                                <i className="fas fa-calendar-plus"></i>
                                <span>Prendre RDV</span>
                            </button>
                            <button
                                onClick={clearChat}
                                className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-4 py-2 rounded-xl font-medium transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-xl"
                            >
                                <i className="fas fa-broom"></i>
                                <span>Nettoyer</span>
                            </button>
                            <button
                                onClick={logout}
                                className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-4 py-2 rounded-xl font-medium transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-xl"
                            >
                                <i className="fas fa-sign-out-alt"></i>
                                <span>Déconnexion</span>
                            </button>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <div className="flex-1 flex flex-col overflow-hidden pt-20">
                    {/* Features Sidebar */}
                    <div className="flex-1 flex overflow-hidden">
                        {/* Sidebar */}
                        <div className="w-80 bg-white/80 backdrop-blur-lg border-r border-gray-200/60 p-6 hidden lg:block">
                            <div className="mb-8">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">Actions Rapides</h3>
                                <div className="space-y-3">
                                    {quickActions.map((action, index) => (
                                        <button
                                            key={index}
                                            onClick={() => sendMessage(action.prompt)}
                                            className="w-full p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200/60 hover:border-violet-300 hover:shadow-md transition-all duration-200 text-left group"
                                        >
                                            <div className="flex items-center space-x-3">
                                                <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                                                    <i className={`${action.icon} text-white text-sm`}></i>
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-900 text-sm">{action.title}</p>
                                                    <p className="text-gray-500 text-xs">{action.description}</p>
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Medical Tips */}
                            <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl p-4 border border-violet-200/60">
                                <h4 className="font-bold text-gray-900 mb-3 text-sm">💡 Conseils du jour</h4>
                                <ul className="text-gray-600 text-xs space-y-2">
                                    <li className="flex items-start space-x-2">
                                        <i className="fas fa-check text-violet-500 text-xs mt-1"></i>
                                        <span>Hydratez-vous régulièrement</span>
                                    </li>
                                    <li className="flex items-start space-x-2">
                                        <i className="fas fa-check text-violet-500 text-xs mt-1"></i>
                                        <span>Pratiquez 30min d'activité physique</span>
                                    </li>
                                    <li className="flex items-start space-x-2">
                                        <i className="fas fa-check text-violet-500 text-xs mt-1"></i>
                                        <span>Dormez 7-8 heures par nuit</span>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {/* Chat Area */}
                        <div className="flex-1 flex flex-col overflow-hidden">
                            {/* Messages Container */}
                            <div className="flex-1 overflow-y-auto px-6 py-4">
                                <div className="max-w-4xl mx-auto space-y-6">
                                    {messages.map((message, index) => (
                                        <div
                                            key={index}
                                            className={`flex gap-4 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                                        >
                                            {message.type === 'bot' && (
                                                <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-purple-500 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                                                    <i className="fas fa-robot text-white text-sm"></i>
                                                </div>
                                            )}

                                            <div className={`max-w-[70%] ${message.type === 'user' ? 'order-first' : ''}`}>
                                                <div className={`rounded-2xl px-5 py-4 shadow-sm ${
                                                    message.type === 'user'
                                                        ? 'bg-gradient-to-r from-violet-600 to-purple-500 text-white rounded-br-none'
                                                        : 'bg-white/90 backdrop-blur-sm text-gray-800 border border-gray-200/60 rounded-bl-none'
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
                                                <div className={`text-xs text-gray-500 mt-2 flex items-center space-x-2 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                                                    <span>{message.type === 'user' ? 'Vous' : 'VIZPILOT'}</span>
                                                    <span>•</span>
                                                    <span>{formatTime(new Date(message.timestamp))}</span>
                                                </div>
                                            </div>

                                            {message.type === 'user' && (
                                                <div className="w-10 h-10 bg-gradient-to-br from-gray-500 to-gray-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                                                    <i className="fas fa-user text-white text-sm"></i>
                                                </div>
                                            )}
                                        </div>
                                    ))}

                                    {isLoading && (
                                        <div className="flex gap-4 justify-start">
                                            <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-purple-500 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                                                <i className="fas fa-robot text-white text-sm"></i>
                                            </div>
                                            <div className="bg-white/90 backdrop-blur-sm border border-gray-200/60 rounded-2xl rounded-bl-none px-5 py-4 shadow-sm">
                                                <div className="flex space-x-2">
                                                    <div className="w-2 h-2 bg-violet-500 rounded-full animate-bounce"></div>
                                                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                                    <div className="w-2 h-2 bg-violet-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Input Area */}
                            <div className="border-t border-gray-200/60 bg-white/80 backdrop-blur-lg px-6 py-6">
                                <div className="max-w-4xl mx-auto">
                                    <div className="relative">
                                        <textarea
                                            value={inputMessage}
                                            onChange={(e) => setInputMessage(e.target.value)}
                                            onKeyDown={handleKeyDown}
                                            placeholder="Posez votre question médicale..."
                                            className="w-full px-5 py-4 pr-16 bg-white border border-gray-300 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 text-sm placeholder-gray-500 shadow-sm transition-all duration-200"
                                            rows="2"
                                            style={{ minHeight: '60px' }}
                                        />
                                        <button
                                            onClick={() => sendMessage()}
                                            disabled={!inputMessage.trim() || isLoading}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-gradient-to-r from-violet-600 to-purple-500 hover:from-violet-700 hover:to-purple-600 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed rounded-xl flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                                        >
                                            <i className={`fas fa-paper-plane text-white text-sm ${isLoading ? 'opacity-50' : ''}`}></i>
                                        </button>
                                    </div>

                                    {/* Quick Suggestions for Mobile */}
                                    <div className="flex flex-wrap gap-2 mt-4 lg:hidden">
                                        {quickActions.slice(0, 2).map((action, index) => (
                                            <button
                                                key={index}
                                                onClick={() => sendMessage(action.prompt)}
                                                className="px-3 py-2 bg-gradient-to-r from-violet-50 to-purple-50 hover:from-violet-100 hover:to-purple-100 text-violet-700 rounded-lg text-xs font-medium border border-violet-200 transition-all duration-200 hover:shadow-md flex items-center space-x-2"
                                            >
                                                <i className={`${action.icon} text-violet-600 text-xs`}></i>
                                                <span>{action.title}</span>
                                            </button>
                                        ))}
                                    </div>

                                    <div className="text-center mt-6">
                                        <p className="text-xs text-gray-500">
                                            💡 VIZPILOT • Assistance médicale 24h/24 • Contact: +212 649-186852
                                        </p>
                                    </div>
                                </div>
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
                        overflow: hidden;
                    }
                `}</style>
            </div>
        </>
    );
}