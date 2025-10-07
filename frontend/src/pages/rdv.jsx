import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import io from "socket.io-client";

let socket;

export default function PatientRendezVous() {
    const router = useRouter();
    const [username, setUsername] = useState("Patient");
    const [doctors, setDoctors] = useState([]);
    const [selectedDoctor, setSelectedDoctor] = useState("");
    const [date, setDate] = useState("");
    const [heure, setHeure] = useState("");
    const [message, setMessage] = useState("");
    const [myRendezVous, setMyRendezVous] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);

    // Chat WebSocket State
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState("");
    const [patientId, setPatientId] = useState("1");

    const availableSlots = ["08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00"];

    // WebSocket Functions
    useEffect(() => {
        socket = io("http://localhost:4000");
        socket.emit("login", { id: patientId });

        socket.on("receiveMessage", ({ senderId, text }) => {
            setMessages(prev => [...prev, {
                type: "doctor",
                text,
                timestamp: new Date()
            }]);
        });

        return () => {
            socket.disconnect();
        };
    }, [patientId]);

    const sendMessage = () => {
        if (!inputMessage.trim()) return;
        const newMessage = {
            type: "patient",
            text: inputMessage,
            timestamp: new Date()
        };
        setMessages(prev => [...prev, newMessage]);
        socket.emit("sendMessage", {
            senderId: patientId,
            receiverId: "2",
            text: inputMessage
        });
        setInputMessage("");
    };

    useEffect(() => {
        const token = localStorage.getItem("token");
        const role = localStorage.getItem("role");
        const storedName = localStorage.getItem("username");

        if (!token || role !== "patient") {
            router.replace("/");
        } else if (storedName) {
            setUsername(storedName);
        }
    }, [router]);

    useEffect(() => {
        fetchDoctors();
        fetchMyRendezVous();
    }, []);

    const fetchDoctors = async () => {
        try {
            const res = await fetch("http://localhost:4000/doctors");
            const data = await res.json();
            setDoctors(data);
        } catch (err) {
            console.error("Erreur lors du chargement des médecins:", err);
        }
    };

    const fetchMyRendezVous = async () => {
        const token = localStorage.getItem("token");
        if (!token) return;

        try {
            const res = await fetch("http://localhost:4000/rendezvous/mypatient", {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            setMyRendezVous(data.rendezvous || []);
        } catch (err) {
            console.error("Erreur lors du chargement des rendez-vous:", err);
        }
    };

    const handleRdv = async () => {
        if (!selectedDoctor || !date || !heure) {
            setMessage("❌ Veuillez remplir tous les champs");
            return;
        }

        setIsLoading(true);
        try {
            const res = await fetch("http://localhost:4000/rendezvous", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify({ doctorId: selectedDoctor, date, heure })
            });

            const data = await res.json();
            if (data.error) {
                setMessage(`❌ ${data.error}`);
            } else {
                setMessage(`✅ Rendez-vous confirmé le ${date} à ${heure}`);
                setSelectedDoctor("");
                setDate("");
                setHeure("");
                setCurrentStep(1);
                fetchMyRendezVous();
            }
        } catch (err) {
            setMessage("❌ Erreur serveur");
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusColor = (rdvDate, rdvHeure) => {
        const now = new Date();
        const rdvDateTime = new Date(`${rdvDate}T${rdvHeure}`);
        return now > rdvDateTime ? "text-gray-500" : "text-green-600";
    };

    const getStatusText = (rdvDate, rdvHeure) => {
        const now = new Date();
        const rdvDateTime = new Date(`${rdvDate}T${rdvHeure}`);
        return now > rdvDateTime ? "Terminé" : "À venir";
    };

    function logout() {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("username");
        window.location.href = "/";
    }

    const nextStep = () => {
        if (currentStep === 1 && selectedDoctor) setCurrentStep(2);
        else if (currentStep === 2 && date) setCurrentStep(3);
    };

    const prevStep = () => {
        setCurrentStep(currentStep - 1);
    };

    const getSelectedDoctorInfo = () => {
        return doctors.find(d => d.id === selectedDoctor);
    };

    const formatTime = (date) => {
        return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <>
            <Head>
                <title>MEDPILOT - Mes Rendez-vous</title>
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
                                <h1 className="text-xl font-bold text-gray-900">Mes Rendez-vous</h1>
                                <p className="text-gray-600 text-sm">Bienvenue, {username}</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={() => router.push("/patient")}
                                className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white px-4 py-2 rounded-xl font-medium transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-xl"
                            >
                                <i className="fas fa-robot"></i>
                                <span>Assistant</span>
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

                <main className="max-w-7xl mx-auto px-6 py-8 relative z-10">
                    {/* Grid Principal */}
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                        {/* Colonne Gauche - Rendez-vous */}
                        <div className="xl:col-span-2 space-y-8">
                            {/* Section Prise de Rendez-vous */}
                            <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-8 border border-gray-200/60 hover:shadow-lg transition-all duration-300">
                                <div className="text-center mb-8">
                                    <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg mx-auto mb-4">
                                        <i className="fas fa-calendar-plus text-white text-xl"></i>
                                    </div>
                                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Nouvelle Consultation</h2>
                                    <p className="text-gray-600 text-lg">Réservez votre rendez-vous médical en 3 étapes simples</p>
                                </div>

                                {/* Progress Bar */}
                                <div className="max-w-2xl mx-auto mb-8">
                                    <div className="flex items-center justify-between mb-4">
                                        {[1, 2, 3].map((step) => (
                                            <div key={step} className="flex flex-col items-center">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                                                    currentStep >= step
                                                        ? 'bg-gradient-to-br from-violet-600 to-purple-500 border-violet-600 text-white shadow-lg'
                                                        : 'bg-white border-gray-300 text-gray-400'
                                                }`}>
                                                    {currentStep > step ? (
                                                        <i className="fas fa-check text-xs"></i>
                                                    ) : (
                                                        <span className="text-sm font-semibold">{step}</span>
                                                    )}
                                                </div>
                                                <span className={`text-xs font-medium mt-2 ${
                                                    currentStep >= step ? 'text-violet-600' : 'text-gray-400'
                                                }`}>
                                                    {step === 1 ? 'Médecin' : step === 2 ? 'Date' : 'Horaire'}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-violet-600 to-purple-500 transition-all duration-500"
                                            style={{ width: `${((currentStep - 1) / 2) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>

                                {/* Step Content */}
                                <div className="max-w-2xl mx-auto">
                                    {currentStep === 1 && (
                                        <div className="text-center">
                                            <h3 className="text-xl font-semibold text-gray-900 mb-6">Choisissez votre médecin</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                                                {doctors.map((doctor) => (
                                                    <div
                                                        key={doctor.id}
                                                        onClick={() => setSelectedDoctor(doctor.id)}
                                                        className={`p-6 rounded-xl border-2 cursor-pointer transition-all duration-300 group ${
                                                            selectedDoctor === doctor.id
                                                                ? 'border-violet-500 bg-gradient-to-br from-violet-50 to-purple-50 shadow-lg'
                                                                : 'border-gray-200 hover:border-violet-300 hover:shadow-md'
                                                        }`}
                                                    >
                                                        <div className="flex items-center space-x-4">
                                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                                                                selectedDoctor === doctor.id
                                                                    ? 'bg-gradient-to-br from-violet-600 to-purple-500 shadow-lg'
                                                                    : 'bg-gray-100 group-hover:bg-violet-100'
                                                            }`}>
                                                                <i className={`fas fa-user-md text-sm ${
                                                                    selectedDoctor === doctor.id ? 'text-white' : 'text-gray-600'
                                                                }`}></i>
                                                            </div>
                                                            <div className="text-left">
                                                                <h4 className="font-semibold text-gray-900">Dr. {doctor.username}</h4>
                                                                <p className="text-sm text-gray-600">{doctor.specialty || "Médecin Généraliste"}</p>
                                                                <p className="text-xs text-gray-500 mt-1">{doctor.email}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {currentStep === 2 && (
                                        <div className="text-center">
                                            <h3 className="text-xl font-semibold text-gray-900 mb-6">Sélectionnez la date</h3>
                                            <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl p-6 mb-6">
                                                <div className="flex items-center justify-center space-x-4 mb-4">
                                                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg">
                                                        <i className="fas fa-user-md text-violet-600"></i>
                                                    </div>
                                                    <div className="text-left">
                                                        <h4 className="font-semibold text-gray-900">Dr. {getSelectedDoctorInfo()?.username}</h4>
                                                        <p className="text-sm text-gray-600">{getSelectedDoctorInfo()?.specialty}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <input
                                                type="date"
                                                value={date}
                                                onChange={(e) => setDate(e.target.value)}
                                                min={new Date().toISOString().split('T')[0]}
                                                className="w-full max-w-md px-6 py-4 bg-white border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all duration-200 text-center text-lg font-semibold"
                                            />
                                            <p className="text-gray-500 text-sm mt-4">Sélectionnez une date à partir d'aujourd'hui</p>
                                        </div>
                                    )}

                                    {currentStep === 3 && (
                                        <div className="text-center">
                                            <h3 className="text-xl font-semibold text-gray-900 mb-6">Choisissez l'horaire</h3>
                                            <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl p-6 mb-6">
                                                <div className="flex items-center justify-between mb-4">
                                                    <div className="flex items-center space-x-4">
                                                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg">
                                                            <i className="fas fa-user-md text-violet-600"></i>
                                                        </div>
                                                        <div className="text-left">
                                                            <h4 className="font-semibold text-gray-900">Dr. {getSelectedDoctorInfo()?.username}</h4>
                                                            <p className="text-sm text-gray-600">{getSelectedDoctorInfo()?.specialty}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-semibold text-gray-900">{new Date(date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                                                        <p className="text-sm text-gray-600">{date}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-w-2xl mx-auto">
                                                {availableSlots.map((slot) => (
                                                    <button
                                                        key={slot}
                                                        onClick={() => setHeure(slot)}
                                                        className={`p-4 rounded-xl border-2 transition-all duration-300 font-semibold ${
                                                            heure === slot
                                                                ? 'bg-gradient-to-br from-violet-600 to-purple-500 text-white border-violet-600 shadow-lg'
                                                                : 'bg-white border-gray-200 text-gray-700 hover:border-violet-300 hover:shadow-md'
                                                        }`}
                                                    >
                                                        {slot}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Navigation Buttons */}
                                    <div className="flex justify-between mt-8">
                                        <button
                                            onClick={prevStep}
                                            disabled={currentStep === 1}
                                            className="px-6 py-3 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 text-white rounded-xl font-medium transition-all duration-300 flex items-center space-x-2 disabled:cursor-not-allowed"
                                        >
                                            <i className="fas fa-arrow-left"></i>
                                            <span>Précédent</span>
                                        </button>

                                        {currentStep < 3 ? (
                                            <button
                                                onClick={nextStep}
                                                disabled={
                                                    (currentStep === 1 && !selectedDoctor) ||
                                                    (currentStep === 2 && !date)
                                                }
                                                className="px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-400 text-white rounded-xl font-medium transition-all duration-300 flex items-center space-x-2 disabled:cursor-not-allowed"
                                            >
                                                <span>Suivant</span>
                                                <i className="fas fa-arrow-right"></i>
                                            </button>
                                        ) : (
                                            <button
                                                onClick={handleRdv}
                                                disabled={!heure || isLoading}
                                                className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-300 disabled:to-gray-400 text-white rounded-xl font-semibold transition-all duration-300 flex items-center space-x-2 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                                            >
                                                {isLoading ? (
                                                    <>
                                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                        <span>Réservation...</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <i className="fas fa-calendar-check"></i>
                                                        <span>Confirmer le rendez-vous</span>
                                                    </>
                                                )}
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {message && (
                                    <div className={`mt-6 p-4 rounded-xl border max-w-2xl mx-auto ${
                                        message.includes("❌")
                                            ? "bg-gradient-to-r from-red-50 to-red-100 border-red-200 text-red-700"
                                            : "bg-gradient-to-r from-green-50 to-emerald-100 border-green-200 text-green-700"
                                    }`}>
                                        <div className="flex items-center space-x-3">
                                            <i className={`fas ${message.includes("❌") ? "fa-exclamation-triangle" : "fa-check-circle"} text-lg`}></i>
                                            <span className="font-medium">{message}</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Section Mes Rendez-vous */}
                            <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 border border-gray-200/60 hover:shadow-lg transition-all duration-300">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                                            <i className="fas fa-list-alt text-white text-sm"></i>
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-bold text-gray-900">Mes Rendez-vous Programmes</h2>
                                            <p className="text-gray-500 text-sm">Historique de vos consultations</p>
                                        </div>
                                    </div>
                                    <span className="bg-gradient-to-r from-violet-100 to-purple-100 text-violet-700 px-3 py-1 rounded-full text-sm font-medium border border-violet-200">
                                        {myRendezVous.length} rendez-vous
                                    </span>
                                </div>

                                {myRendezVous.length === 0 ? (
                                    <div className="text-center py-12">
                                        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                            <i className="fas fa-calendar-times text-gray-400 text-xl"></i>
                                        </div>
                                        <h3 className="text-xl font-semibold text-gray-600 mb-2">Aucun rendez-vous</h3>
                                        <p className="text-gray-500">Prenez votre premier rendez-vous en utilisant le formulaire ci-dessus.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {myRendezVous.map((rdv) => (
                                            <div
                                                key={rdv.id}
                                                className="flex items-center justify-between p-6 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200/60 hover:border-violet-300 hover:shadow-md transition-all duration-200 group"
                                            >
                                                <div className="flex items-center space-x-4 flex-1">
                                                    <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-200">
                                                        <i className="fas fa-user-md text-white text-sm"></i>
                                                    </div>
                                                    <div className="flex-1">
                                                        <h3 className="font-semibold text-gray-900 text-lg">
                                                            Dr. {rdv.Doctor?.username || rdv.doctorId}
                                                        </h3>
                                                        <div className="flex items-center space-x-4 mt-2">
                                                            <p className="text-gray-600">
                                                                <i className="fas fa-calendar text-violet-500 mr-2"></i>
                                                                {rdv.date}
                                                            </p>
                                                            <p className="text-gray-600">
                                                                <i className="fas fa-clock text-violet-500 mr-2"></i>
                                                                {rdv.heure}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center">
                                                    <span className={`px-3 py-2 rounded-lg text-sm font-medium ${
                                                        getStatusColor(rdv.date, rdv.heure) === "text-green-600"
                                                            ? "bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border border-green-200"
                                                            : "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 border border-gray-300"
                                                    }`}>
                                                        {getStatusText(rdv.date, rdv.heure)}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Colonne Droite - Chat */}
                        <div className="space-y-8">
                            {/* Chat avec le Docteur */}
                            <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 border border-gray-200/60 hover:shadow-lg transition-all duration-300">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                                            <i className="fas fa-comments text-white text-sm"></i>
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold text-gray-900">Chat Docteur</h2>
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
                                                className={`flex ${msg.type === "patient" ? "justify-end" : "justify-start"}`}
                                            >
                                                <div
                                                    className={`px-4 py-3 rounded-2xl max-w-md break-words transition-all duration-300 hover:scale-[1.02] ${
                                                        msg.type === "patient"
                                                            ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-br-none shadow-lg"
                                                            : "bg-gradient-to-br from-gray-100 to-white text-gray-800 rounded-bl-none border border-gray-200 shadow-lg"
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
                    </div>
                </main>

                {/* Footer */}
                <footer className="bg-white/80 backdrop-blur-lg border-t border-gray-200/60 mt-12 relative z-10">
                    <div className="max-w-7xl mx-auto px-6 py-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-lg flex items-center justify-center shadow-lg">
                                    <i className="fas fa-heartbeat text-white text-sm"></i>
                                </div>
                                <span className="text-lg font-bold text-gray-900">MEDPILOT</span>
                            </div>
                            <p className="text-gray-600 text-sm">
                                Votre santé, notre priorité • Contact: +212 649-186852
                            </p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}