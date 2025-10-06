import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";

export default function ManageDoctors() {
    const router = useRouter();
    const [doctors, setDoctors] = useState([]);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [specialty, setSpecialty] = useState("");
    const [isLoading, setIsLoading] = useState(false);
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
        if (!name || !email || !password || !specialty) {
            alert("Veuillez remplir tous les champs");
            return;
        }

        setIsLoading(true);
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
                alert(data.error || "Erreur lors de l'ajout du docteur");
            }
        } catch (err) {
            console.error(err);
            alert("Erreur de connexion");
        } finally {
            setIsLoading(false);
        }
    };

    const deleteDoctor = async (id) => {
        if (!confirm("Êtes-vous sûr de vouloir supprimer ce docteur ?")) return;
        try {
            await fetch(`${API}/doctors/${id}`, { method: "DELETE" });
            fetchDoctors();
        } catch (err) {
            console.error(err);
            alert("Erreur lors de la suppression");
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
                <title>MEDPILOT - Gestion des Docteurs</title>
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
            </Head>

            <div className="min-h-screen bg-slate-50 font-inter">
                {/* Header */}
                <header className="fixed top-0 left-0 right-0 bg-white border-b border-slate-200 px-6 py-4 z-50">
                    <div className="max-w-7xl mx-auto flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
                                <i className="fas fa-users-cog text-white text-lg"></i>
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-slate-900">Gestion des Docteurs</h1>
                                <p className="text-slate-500 text-sm">Administration du personnel médical</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={() => router.push("/doctor")}
                                className="bg-slate-900 hover:bg-black text-white px-4 py-2.5 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 text-sm"
                            >
                                <i className="fas fa-home"></i>
                                <span>Tableau de bord</span>
                            </button>
                            <button
                                onClick={logout}
                                className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 px-4 py-2.5 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 text-sm"
                            >
                                <i className="fas fa-sign-out-alt"></i>
                                <span>Déconnexion</span>
                            </button>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <div className="pt-24 pb-12 px-6">
                    <div className="max-w-4xl mx-auto">

                        {/* En-tête */}
                        <div className="mb-8">
                            <h2 className="text-2xl font-bold text-slate-900 mb-2">Gestion du personnel médical</h2>
                            <p className="text-slate-600">Ajoutez et gérez les docteurs de votre établissement</p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                            {/* Formulaire d'ajout */}
                            <div className="bg-white rounded-2xl p-6 border border-slate-200">
                                <div className="flex items-center space-x-3 mb-6">
                                    <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                                        <i className="fas fa-user-plus text-white text-sm"></i>
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900">Nouveau docteur</h3>
                                </div>

                                <form onSubmit={addDoctor} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Nom complet
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Dr. Nom Prénom"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Email professionnel
                                        </label>
                                        <input
                                            type="email"
                                            placeholder="dr.nom@medpilot.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Mot de passe
                                        </label>
                                        <input
                                            type="password"
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Spécialité
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Cardiologie, Pédiatrie, etc."
                                            value={specialty}
                                            onChange={(e) => setSpecialty(e.target.value)}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full bg-black hover:bg-slate-800 text-white py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isLoading ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                <span>Ajout en cours...</span>
                                            </>
                                        ) : (
                                            <>
                                                <i className="fas fa-plus-circle"></i>
                                                <span>Ajouter le docteur</span>
                                            </>
                                        )}
                                    </button>
                                </form>
                            </div>

                            {/* Liste des docteurs */}
                            <div className="bg-white rounded-2xl p-6 border border-slate-200">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                                            <i className="fas fa-user-md text-white text-sm"></i>
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-900">Docteurs enregistrés</h3>
                                    </div>
                                    <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-sm font-medium">
                    {doctors.length}
                  </span>
                                </div>

                                {doctors.length === 0 ? (
                                    <div className="text-center py-8">
                                        <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                            <i className="fas fa-user-md text-slate-400 text-xl"></i>
                                        </div>
                                        <h4 className="text-lg font-semibold text-slate-600 mb-2">Aucun docteur</h4>
                                        <p className="text-slate-500 text-sm">Ajoutez votre premier docteur</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {doctors.map((doctor) => (
                                            <div
                                                key={doctor.id}
                                                className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200 hover:bg-white transition-colors group"
                                            >
                                                <div className="flex items-center space-x-4 flex-1 min-w-0">
                                                    <div className="w-10 h-10 bg-slate-200 rounded-lg flex items-center justify-center flex-shrink-0">
                                                        <i className="fas fa-user-md text-slate-600 text-sm"></i>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="font-semibold text-slate-900 truncate">
                                                            {doctor.username}
                                                        </h4>
                                                        <div className="flex items-center space-x-2 mt-1">
                                                            <p className="text-slate-600 text-sm truncate">{doctor.email}</p>
                                                            <span className="text-slate-400">•</span>
                                                            <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded text-xs font-medium">
                                {doctor.specialty || "Généraliste"}
                              </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => deleteDoctor(doctor.id)}
                                                    className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition-all duration-200 flex items-center justify-center group-hover:bg-red-500 ml-4 flex-shrink-0"
                                                    title="Supprimer le docteur"
                                                >
                                                    <i className="fas fa-trash text-xs"></i>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Informations */}
                        <div className="mt-8 bg-blue-50 rounded-2xl p-6 border border-blue-200">
                            <div className="flex items-start space-x-4">
                                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <i className="fas fa-info-circle text-blue-600 text-lg"></i>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-slate-900 mb-2">Informations importantes</h4>
                                    <ul className="text-slate-600 text-sm space-y-1">
                                        <li>• Les docteurs ajoutés auront accès à la plateforme MEDPILOT</li>
                                        <li>• Chaque docteur doit avoir une adresse email unique</li>
                                        <li>• La spécialité aide à organiser les consultations par domaine</li>
                                        <li>• La suppression est définitive et irréversible</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}