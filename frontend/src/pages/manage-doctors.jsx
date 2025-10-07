import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";

export default function ManageDoctors() {
    const router = useRouter();
    const [doctors, setDoctors] = useState([]);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [specialty, setSpecialty] = useState("");
    const API = "http://localhost:4000";

    useEffect(() => {
        const token = localStorage.getItem("token");
        const role = localStorage.getItem("role");
        if (!token || role !== "doctor") router.replace("/");
        else fetchDoctors();
    }, []);

    const fetchDoctors = async () => {
        try {
            const res = await fetch(`${API}/doctors`);
            const data = await res.json();
            setDoctors(data);
        } catch (err) {
            console.error(err);
        }
    };

    const addDoctor = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API}/auth/signup`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username: name,
                    email,
                    password,
                    specialty,
                    role: "doctor"
                })
            });
            const data = await res.json();
            if (res.ok) {
                setName("");
                setEmail("");
                setPassword("");
                setSpecialty("");
                fetchDoctors();
            } else {
                alert(data.error || "Erreur");
            }
        } catch (err) {
            console.error(err);
        }
    };

    const deleteDoctor = async (id) => {
        if (!confirm("Êtes-vous sûr de vouloir supprimer ce docteur ?")) return;
        try {
            await fetch(`${API}/doctors/${id}`, { method: "DELETE" });
            fetchDoctors();
        } catch (err) {
            console.error(err);
        }
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("username");
        router.push("/");
    };

    return (
        <>
            <Head>
                <title>VIZPILOT - Gestion des Docteurs</title>
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
            </Head>

            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 font-inter relative overflow-hidden">
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
                    <div className="absolute -top-40 -right-40 w-80 h-80 bg-violet-100 rounded-full opacity-20 blur-3xl"></div>
                    <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-100 rounded-full opacity-20 blur-3xl"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-100 rounded-full opacity-15 blur-3xl"></div>
                </div>

                {/* Header VizPilot Style */}
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
                                <h1 className="text-xl font-bold text-gray-900">Gestion des Docteurs</h1>
                                <p className="text-gray-600 text-sm">Plateforme Médicale Intelligente</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={() => router.push("/doctor")}
                                className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white px-4 py-2 rounded-xl font-medium transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-xl"
                            >
                                <i className="fas fa-arrow-left"></i>
                                <span>Tableau de bord</span>
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
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">Gestion du personnel médical</h2>
                        <p className="text-gray-600">Administration des comptes docteurs</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                        {/* Formulaire d'ajout */}
                        <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 border border-gray-200/60 hover:shadow-lg transition-all duration-300">
                            <div className="flex items-center space-x-3 mb-6">
                                <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                                    <i className="fas fa-user-plus text-white text-sm"></i>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">Nouveau docteur</h3>
                                    <p className="text-gray-500 text-sm">Ajouter un nouveau membre</p>
                                </div>
                            </div>

                            <form onSubmit={addDoctor} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Nom complet
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Dr. Nom Prénom"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all duration-200"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Email professionnel
                                    </label>
                                    <input
                                        type="email"
                                        placeholder="dr.nom@vizpilot.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all duration-200"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Mot de passe
                                    </label>
                                    <input
                                        type="password"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all duration-200"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Spécialité
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Cardiologie, Pédiatrie, etc."
                                        value={specialty}
                                        onChange={(e) => setSpecialty(e.target.value)}
                                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all duration-200"
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-3 rounded-xl font-medium transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
                                >
                                    <i className="fas fa-plus-circle"></i>
                                    <span>Ajouter le docteur</span>
                                </button>
                            </form>
                        </div>

                        {/* Liste des docteurs */}
                        <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 border border-gray-200/60 hover:shadow-lg transition-all duration-300">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                                        <i className="fas fa-user-md text-white text-sm"></i>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900">Docteurs enregistrés</h3>
                                        <p className="text-gray-500 text-sm">Équipe médicale complète</p>
                                    </div>
                                </div>
                                <span className="bg-gradient-to-r from-violet-100 to-purple-100 text-violet-700 px-3 py-1 rounded-full text-sm font-medium border border-violet-200">
                                    {doctors.length} docteur{doctors.length !== 1 ? 's' : ''}
                                </span>
                            </div>

                            {doctors.length === 0 ? (
                                <div className="text-center py-8">
                                    <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                        <i className="fas fa-user-md text-gray-400 text-xl"></i>
                                    </div>
                                    <h4 className="text-lg font-medium text-gray-600 mb-2">Aucun docteur</h4>
                                    <p className="text-gray-500 text-sm">Ajoutez votre premier docteur</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {doctors.map((doctor) => (
                                        <div
                                            key={doctor.id}
                                            className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200/60 hover:border-violet-300 hover:shadow-md transition-all duration-200 group"
                                        >
                                            <div className="flex items-center space-x-4 flex-1">
                                                <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-200">
                                                    <i className="fas fa-user-md text-white text-sm"></i>
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-semibold text-gray-900">
                                                        {doctor.username}
                                                    </h4>
                                                    <div className="flex items-center space-x-2 mt-1">
                                                        <p className="text-gray-600 text-sm">{doctor.email}</p>
                                                        <span className="text-gray-400">•</span>
                                                        <span className="bg-gradient-to-r from-violet-100 to-purple-100 text-violet-700 px-2 py-1 rounded-lg text-xs font-medium border border-violet-200">
                                                            {doctor.specialty || "Généraliste"}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => deleteDoctor(doctor.id)}
                                                className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white p-3 rounded-xl transition-all duration-300 flex items-center space-x-2 ml-4 shadow-lg hover:shadow-xl"
                                                title="Supprimer le docteur"
                                            >
                                                <i className="fas fa-trash text-xs"></i>
                                                <span className="text-sm">Supprimer</span>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Informations */}
                    <div className="mt-8 bg-gradient-to-r from-violet-50 to-purple-50 rounded-2xl border border-violet-200/60 p-6">
                        <div className="flex items-start space-x-4">
                            <div className="w-8 h-8 bg-gradient-to-br from-violet-600 to-purple-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                                <i className="fas fa-info text-white text-sm"></i>
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-gray-900 mb-3 text-lg">Informations importantes</h4>
                                <ul className="text-gray-600 space-y-3">
                                    <li className="flex items-start space-x-3">
                                        <i className="fas fa-circle text-violet-600 text-xs mt-2 flex-shrink-0"></i>
                                        <span className="text-sm">Les docteurs ajoutés auront un accès complet à la plateforme VIZPILOT</span>
                                    </li>
                                    <li className="flex items-start space-x-3">
                                        <i className="fas fa-circle text-violet-600 text-xs mt-2 flex-shrink-0"></i>
                                        <span className="text-sm">Chaque adresse email doit être unique dans le système</span>
                                    </li>
                                    <li className="flex items-start space-x-3">
                                        <i className="fas fa-circle text-violet-600 text-xs mt-2 flex-shrink-0"></i>
                                        <span className="text-sm">La spécialité permet de catégoriser les domaines d'expertise</span>
                                    </li>
                                    <li className="flex items-start space-x-3">
                                        <i className="fas fa-circle text-violet-600 text-xs mt-2 flex-shrink-0"></i>
                                        <span className="text-sm">La suppression d'un compte est définitive et irréversible</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}