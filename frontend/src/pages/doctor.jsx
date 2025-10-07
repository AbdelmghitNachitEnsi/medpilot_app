// frontend/pages/doctor.jsx
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import io from "socket.io-client";

let socket;
export default function Doctor() {
    const router = useRouter();
    const [username, setUsername] = useState("Doctor");
    const [rendezvous, setRendezvous] = useState([]);
    const [stats, setStats] = useState({
        totalPatients: 0,
        totalRendezVous: 0,
        rdvToday: 0,
        rdvUpcoming: 0
    });
    const [recentPatients, setRecentPatients] = useState([]);

    // Chat WebSocket State
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState("");
    const [doctorId, setDoctorId] = useState("2");
    const [selectedPatient, setSelectedPatient] = useState("1"); // Patient par défaut

    // WebSocket Functions
    const sendMessage = () => {
        if (!inputMessage.trim()) return;
        const newMessage = { type: "doctor", text: inputMessage, timestamp: new Date() };
        setMessages(prev => [...prev, newMessage]);
        socket.emit("sendMessage", {
            senderId: doctorId,
            receiverId: selectedPatient,
            text: inputMessage
        });
        setInputMessage("");
    };

    useEffect(() => {
        socket = io("http://localhost:4000");
        socket.emit("login", { id: doctorId });

        socket.on("receiveMessage", ({ senderId, text }) => {
            setMessages(prev => [...prev, {
                type: "patient",
                text,
                timestamp: new Date()
            }]);
        });

        return () => {
            socket.disconnect();
        };
    }, [doctorId]);

    useEffect(() => {
        const token = localStorage.getItem("token");
        const role = localStorage.getItem("role");
        const storedName = localStorage.getItem("username");
        if (!token || role !== "doctor") router.replace("/");
        else if (storedName) setUsername(storedName);
    }, [router]);

    useEffect(() => {
        const fetchRendezvous = async () => {
            const token = localStorage.getItem("token");
            if (!token) return;

            try {
                const res = await fetch("http://localhost:4000/rendezvous/mydoctor", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await res.json();
                if (res.ok) {
                    const rdvs = data.rendezvous || [];
                    setRendezvous(rdvs);

                    // Calculer les statistiques
                    const uniquePatients = new Set(rdvs.map(rdv => rdv.patient?.id || rdv.patientId));
                    const today = new Date().toISOString().split('T')[0];
                    const todayRdv = rdvs.filter(rdv => rdv.date === today);
                    const upcomingRdv = rdvs.filter(rdv => rdv.date > today);

                    setStats({
                        totalPatients: uniquePatients.size,
                        totalRendezVous: rdvs.length,
                        rdvToday: todayRdv.length,
                        rdvUpcoming: upcomingRdv.length
                    });

                    // Patients récents (derniers 5 uniques)
                    const recentUniquePatients = Array.from(uniquePatients)
                        .slice(0, 5)
                        .map(patientId =>
                            rdvs.find(rdv => (rdv.patient?.id || rdv.patientId) === patientId)?.patient
                        )
                        .filter(Boolean);

                    setRecentPatients(recentUniquePatients);
                }
            } catch (err) {
                console.error("Erreur lors du chargement des rendez-vous:", err);
            }
        };
        fetchRendezvous();
    }, []);

    function logout() {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("username");
        window.location.href = "/";
    }

    const getNextRendezVous = () => {
        const today = new Date().toISOString().split('T')[0];
        const upcoming = rendezvous
            .filter(rdv => rdv.date >= today)
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .slice(0, 3);

        return upcoming;
    };

    const formatDate = (dateString) => {
        const options = { weekday: 'long', day: 'numeric', month: 'long' };
        return new Date(dateString).toLocaleDateString('fr-FR', options);
    };

    const formatTime = (date) => {
        return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <>
            <Head>
                <title>MEDPILOT - Dashboard Docteur</title>
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
            </Head>

            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 font-inter relative overflow-hidden">
                {/* Background Medical Pattern */}
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
                                <h1 className="text-xl font-bold text-gray-900">Dr. {username}</h1>
                                <p className="text-gray-600 text-sm">Tableau de bord médical</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={() => router.push("/manage-doctors")}
                                className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white px-4 py-2 rounded-xl font-medium transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-xl"
                            >
                                <i className="fas fa-users-cog"></i>
                                <span>Gérer les Docteurs</span>
                            </button>
                            <button
                                onClick={logout}
                                className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white px-4 py-2 rounded-xl font-medium transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-xl"
                            >
                                <i className="fas fa-sign-out-alt"></i>
                                <span>Déconnexion</span>
                            </button>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <div className="max-w-7xl mx-auto py-8 px-6 relative z-10">
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">Tableau de bord médical</h2>
                        <p className="text-gray-600">Surveillance en temps réel de votre activité</p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                        {/* Patients Totals */}
                        <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 border border-gray-200/60 hover:border-violet-300 hover:shadow-xl transition-all duration-300 group">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <p className="text-gray-500 text-sm font-medium mb-1">Patients totaux</p>
                                    <h3 className="text-3xl font-bold text-gray-900">{stats.totalPatients}</h3>
                                </div>
                                <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                                    <i className="fas fa-users text-white text-lg"></i>
                                </div>
                            </div>
                            <div className="pt-4 border-t border-gray-100/60">
                                <p className="text-gray-400 text-xs">Patients uniques suivis</p>
                            </div>
                        </div>

                        {/* Rendez-vous Totaux */}
                        <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 border border-gray-200/60 hover:border-blue-300 hover:shadow-xl transition-all duration-300 group">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <p className="text-gray-500 text-sm font-medium mb-1">Consultations</p>
                                    <h3 className="text-3xl font-bold text-gray-900">{stats.totalRendezVous}</h3>
                                </div>
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                                    <i className="fas fa-calendar-check text-white text-lg"></i>
                                </div>
                            </div>
                            <div className="pt-4 border-t border-gray-100/60">
                                <p className="text-gray-400 text-xs">Total des consultations</p>
                            </div>
                        </div>

                        {/* RDV Aujourd'hui */}
                        <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 border border-gray-200/60 hover:border-orange-300 hover:shadow-xl transition-all duration-300 group">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <p className="text-gray-500 text-sm font-medium mb-1">Aujourd'hui</p>
                                    <h3 className="text-3xl font-bold text-gray-900">{stats.rdvToday}</h3>
                                </div>
                                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                                    <i className="fas fa-clock text-white text-lg"></i>
                                </div>
                            </div>
                            <div className="pt-4 border-t border-gray-100/60">
                                <p className="text-gray-400 text-xs">Consultations du jour</p>
                            </div>
                        </div>

                        {/* RDV à Venir */}
                        <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 border border-gray-200/60 hover:border-green-300 hover:shadow-xl transition-all duration-300 group">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <p className="text-gray-500 text-sm font-medium mb-1">À venir</p>
                                    <h3 className="text-3xl font-bold text-gray-900">{stats.rdvUpcoming}</h3>
                                </div>
                                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                                    <i className="fas fa-calendar-alt text-white text-lg"></i>
                                </div>
                            </div>
                            <div className="pt-4 border-t border-gray-100/60">
                                <p className="text-gray-400 text-xs">Prochaines consultations</p>
                            </div>
                        </div>
                    </div>

                    {/* Grid Principal */}
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                        {/* Colonne Gauche */}
                        <div className="xl:col-span-2 space-y-8">
                            {/* Prochains Rendez-vous */}
                            <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 border border-gray-200/60 hover:shadow-lg transition-all duration-300">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                                            <i className="fas fa-calendar-day text-white text-sm"></i>
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold text-gray-900">Prochains rendez-vous</h2>
                                            <p className="text-gray-500 text-sm">Consultations programmées</p>
                                        </div>
                                    </div>
                                    <span className="bg-gradient-to-r from-violet-100 to-purple-100 text-violet-700 px-3 py-1 rounded-full text-sm font-medium border border-violet-200">
                                        {getNextRendezVous().length}
                                    </span>
                                </div>

                                {getNextRendezVous().length === 0 ? (
                                    <div className="text-center py-8">
                                        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                            <i className="fas fa-calendar-times text-gray-400 text-xl"></i>
                                        </div>
                                        <h3 className="text-lg font-medium text-gray-600 mb-2">Aucun rendez-vous</h3>
                                        <p className="text-gray-500 text-sm">Aucun rendez-vous programmé</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {getNextRendezVous().map((rdv, index) => (
                                            <div
                                                key={rdv.id}
                                                className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200/60 hover:border-violet-300 hover:shadow-md transition-all duration-200 group"
                                            >
                                                <div className="flex items-center space-x-4">
                                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${
                                                        index === 0
                                                            ? 'bg-gradient-to-br from-violet-600 to-purple-600'
                                                            : 'bg-gradient-to-br from-gray-400 to-gray-500'
                                                    } group-hover:scale-105 transition-transform duration-200`}>
                                                        <i className="fas fa-user-injured text-white text-sm"></i>
                                                    </div>
                                                    <div>
                                                        <h3 className="font-semibold text-gray-900">
                                                            {rdv.patient?.username || "Patient"}
                                                        </h3>
                                                        <p className="text-gray-600 text-sm">{rdv.patient?.email}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-semibold text-gray-900 text-sm">{formatDate(rdv.date)}</p>
                                                    <p className="text-violet-600 font-bold">{rdv.heure}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Chat avec les Patients */}
                            <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 border border-gray-200/60 hover:shadow-lg transition-all duration-300">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                                            <i className="fas fa-comments text-white text-sm"></i>
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold text-gray-900">Chat Patient</h2>
                                            <p className="text-gray-500 text-sm">Communication en temps réel</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                                        <span className="bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium border border-blue-200">
                                            En ligne
                                        </span>
                                    </div>
                                </div>

                                <div className="bg-gray-50/50 border border-gray-100 rounded-2xl p-4 mb-4 h-80 overflow-y-auto shadow-inner">
                                    <div className="flex flex-col gap-4">
                                        {messages.map((msg, i) => (
                                            <div
                                                key={i}
                                                className={`flex ${msg.type === "patient" ? "justify-start" : "justify-end"}`}
                                            >
                                                <div
                                                    className={`px-4 py-3 rounded-2xl max-w-md break-words transition-all duration-300 hover:scale-[1.02] ${
                                                        msg.type === "patient"
                                                            ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-bl-none shadow-lg"
                                                            : "bg-gradient-to-br from-gray-100 to-white text-gray-800 rounded-br-none border border-gray-200 shadow-lg"
                                                    }`}
                                                >
                                                    <div className="text-sm">{msg.text}</div>
                                                    <div className={`text-xs mt-1 ${msg.type === "patient" ? "text-blue-100" : "text-gray-500"} text-right`}>
                                                        {formatTime(msg.timestamp)}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <input
                                        value={inputMessage}
                                        onChange={(e) => setInputMessage(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                                        placeholder="Écrivez votre message..."
                                        className="flex-1 px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                    />
                                    <button
                                        onClick={sendMessage}
                                        disabled={!inputMessage.trim()}
                                        className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 disabled:from-gray-300 disabled:to-gray-400 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
                                    >
                                        <i className="fas fa-paper-plane"></i>
                                        <span>Envoyer</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Colonne Droite */}
                        <div className="space-y-8">
                            {/* Patients Récents */}
                            <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 border border-gray-200/60 hover:shadow-lg transition-all duration-300">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                                            <i className="fas fa-user-friends text-white text-sm"></i>
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold text-gray-900">Patients récents</h2>
                                            <p className="text-gray-500 text-sm">Derniers patients consultés</p>
                                        </div>
                                    </div>
                                    <span className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium border border-green-200">
                                        {recentPatients.length}
                                    </span>
                                </div>

                                {recentPatients.length === 0 ? (
                                    <div className="text-center py-8">
                                        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                            <i className="fas fa-users text-gray-400 text-xl"></i>
                                        </div>
                                        <h3 className="text-lg font-medium text-gray-600 mb-2">Aucun patient</h3>
                                        <p className="text-gray-500 text-sm">Aucun patient récent</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {recentPatients.map((patient) => (
                                            <div
                                                key={patient.id}
                                                className="flex items-center space-x-3 p-3 bg-gradient-to-r from-gray-50 to-white rounded-lg border border-gray-200/60 hover:border-green-300 hover:shadow-sm transition-all duration-200 group"
                                            >
                                                <div className="w-10 h-10 bg-gradient-to-br from-gray-600 to-gray-700 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-200">
                                                    <i className="fas fa-user text-white text-xs"></i>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-gray-900 text-sm truncate">
                                                        {patient.username}
                                                    </p>
                                                    <p className="text-gray-500 text-xs truncate">{patient.email}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Actions Rapides */}
                            <div className="bg-gradient-to-br from-violet-700 to-purple-800 rounded-2xl p-6 text-white shadow-xl">
                                <h3 className="text-lg font-bold mb-4">Actions rapides</h3>
                                <div className="space-y-3">
                                    <button className="w-full bg-white/10 hover:bg-white/20 rounded-xl p-4 text-left transition-all duration-200 flex items-center space-x-3 group hover:shadow-lg border border-white/10 hover:border-white/20">
                                        <i className="fas fa-plus-circle text-white/80 group-hover:text-white text-lg"></i>
                                        <div>
                                            <p className="font-medium text-sm">Nouveau patient</p>
                                            <p className="text-white/60 text-xs">Ajouter un patient</p>
                                        </div>
                                    </button>
                                    <button className="w-full bg-white/10 hover:bg-white/20 rounded-xl p-4 text-left transition-all duration-200 flex items-center space-x-3 group hover:shadow-lg border border-white/10 hover:border-white/20">
                                        <i className="fas fa-file-medical text-white/80 group-hover:text-white text-lg"></i>
                                        <div>
                                            <p className="font-medium text-sm">Rapports médicaux</p>
                                            <p className="text-white/60 text-xs">Générer des rapports</p>
                                        </div>
                                    </button>
                                    <button className="w-full bg-white/10 hover:bg-white/20 rounded-xl p-4 text-left transition-all duration-200 flex items-center space-x-3 group hover:shadow-lg border border-white/10 hover:border-white/20">
                                        <i className="fas fa-chart-bar text-white/80 group-hover:text-white text-lg"></i>
                                        <div>
                                            <p className="font-medium text-sm">Analytics</p>
                                            <p className="text-white/60 text-xs">Voir les statistiques</p>
                                        </div>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}