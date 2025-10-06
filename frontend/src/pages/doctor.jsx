// frontend/pages/doctor.jsx
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";

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

    useEffect(() => {
        const token = localStorage.getItem("token");
        const role = localStorage.getItem("role");
        const storedName = localStorage.getItem("username");
        if (!token || role !== "doctor") router.replace("/");
        else if (storedName) setUsername(storedName);
    }, []);

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

    return (
        <>
            <Head>
                <title>MEDPILOT - Dashboard Docteur</title>
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
            </Head>

            <div className="min-h-screen bg-slate-50 font-inter">
                {/* Header Minimaliste */}
                <header className="fixed top-0 left-0 right-0 bg-white border-b border-slate-200 px-6 py-4 z-50">
                    <div className="max-w-7xl mx-auto flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
                                <i className="fas fa-user-md text-white text-lg"></i>
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-slate-900">Dr. {username}</h1>
                                <p className="text-slate-500 text-sm">Tableau de bord médical</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={() => router.push("/manage-doctors")}
                                className="bg-slate-900 hover:bg-black text-white px-4 py-2.5 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 text-sm"
                            >
                                <i className="fas fa-users-cog"></i>
                                <span>Gérer</span>
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
                    <div className="max-w-7xl mx-auto">

                        {/* En-tête moderne */}
                        <div className="mb-12">
                            <h2 className="text-3xl font-bold text-slate-900 mb-2">Tableau de bord</h2>
                            <p className="text-slate-600">Aperçu de votre activité médicale</p>
                        </div>

                        {/* Stats Grid Moderne */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                            {/* Patients Totals */}
                            <div className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-blue-300 transition-all duration-300 group">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <p className="text-slate-500 text-sm font-medium mb-1">Patients totaux</p>
                                        <h3 className="text-3xl font-bold text-slate-900">{stats.totalPatients}</h3>
                                    </div>
                                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                                        <i className="fas fa-users text-blue-600 text-lg"></i>
                                    </div>
                                </div>
                                <div className="pt-4 border-t border-slate-100">
                                    <p className="text-slate-400 text-xs">Patients uniques suivis</p>
                                </div>
                            </div>

                            {/* Rendez-vous Totaux */}
                            <div className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-purple-300 transition-all duration-300 group">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <p className="text-slate-500 text-sm font-medium mb-1">Consultations</p>
                                        <h3 className="text-3xl font-bold text-slate-900">{stats.totalRendezVous}</h3>
                                    </div>
                                    <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center group-hover:bg-purple-100 transition-colors">
                                        <i className="fas fa-calendar-check text-purple-600 text-lg"></i>
                                    </div>
                                </div>
                                <div className="pt-4 border-t border-slate-100">
                                    <p className="text-slate-400 text-xs">Total des consultations</p>
                                </div>
                            </div>

                            {/* RDV Aujourd'hui */}
                            <div className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-orange-300 transition-all duration-300 group">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <p className="text-slate-500 text-sm font-medium mb-1">Aujourd'hui</p>
                                        <h3 className="text-3xl font-bold text-slate-900">{stats.rdvToday}</h3>
                                    </div>
                                    <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center group-hover:bg-orange-100 transition-colors">
                                        <i className="fas fa-clock text-orange-600 text-lg"></i>
                                    </div>
                                </div>
                                <div className="pt-4 border-t border-slate-100">
                                    <p className="text-slate-400 text-xs">Consultations du jour</p>
                                </div>
                            </div>

                            {/* RDV à Venir */}
                            <div className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-green-300 transition-all duration-300 group">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <p className="text-slate-500 text-sm font-medium mb-1">À venir</p>
                                        <h3 className="text-3xl font-bold text-slate-900">{stats.rdvUpcoming}</h3>
                                    </div>
                                    <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center group-hover:bg-green-100 transition-colors">
                                        <i className="fas fa-calendar-alt text-green-600 text-lg"></i>
                                    </div>
                                </div>
                                <div className="pt-4 border-t border-slate-100">
                                    <p className="text-slate-400 text-xs">Prochaines consultations</p>
                                </div>
                            </div>
                        </div>

                        {/* Grid Principal Moderne */}
                        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

                            {/* Colonne Gauche */}
                            <div className="xl:col-span-2 space-y-8">

                                {/* Prochains Rendez-vous */}
                                <div className="bg-white rounded-2xl p-6 border border-slate-200">
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                                                <i className="fas fa-calendar-day text-white text-sm"></i>
                                            </div>
                                            <h2 className="text-xl font-bold text-slate-900">Prochains rendez-vous</h2>
                                        </div>
                                        <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-sm font-medium">
                                            {getNextRendezVous().length}
                                        </span>
                                    </div>

                                    {getNextRendezVous().length === 0 ? (
                                        <div className="text-center py-8">
                                            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                                <i className="fas fa-calendar-times text-slate-400 text-xl"></i>
                                            </div>
                                            <h3 className="text-lg font-semibold text-slate-600 mb-2">Aucun rendez-vous</h3>
                                            <p className="text-slate-500 text-sm">Aucun rendez-vous programmé</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {getNextRendezVous().map((rdv, index) => (
                                                <div
                                                    key={rdv.id}
                                                    className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200 hover:bg-white hover:border-slate-300 transition-all duration-200"
                                                >
                                                    <div className="flex items-center space-x-4">
                                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                                            index === 0 ? 'bg-black' : 'bg-slate-200'
                                                        }`}>
                                                            <i className={`fas fa-user-injured ${
                                                                index === 0 ? 'text-white' : 'text-slate-600'
                                                            } text-sm`}></i>
                                                        </div>
                                                        <div>
                                                            <h3 className="font-semibold text-slate-900">
                                                                {rdv.patient?.username || "Patient"}
                                                            </h3>
                                                            <p className="text-slate-600 text-sm">{rdv.patient?.email}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-semibold text-slate-900 text-sm">{formatDate(rdv.date)}</p>
                                                        <p className="text-blue-600 font-bold">{rdv.heure}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Historique des Rendez-vous */}
                                <div className="bg-white rounded-2xl p-6 border border-slate-200">
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                                                <i className="fas fa-history text-white text-sm"></i>
                                            </div>
                                            <h2 className="text-xl font-bold text-slate-900">Historique des consultations</h2>
                                        </div>
                                        <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-sm font-medium">
                                            {rendezvous.length}
                                        </span>
                                    </div>

                                    {rendezvous.length === 0 ? (
                                        <div className="text-center py-8">
                                            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                                <i className="fas fa-calendar text-slate-400 text-xl"></i>
                                            </div>
                                            <h3 className="text-lg font-semibold text-slate-600 mb-2">Aucune consultation</h3>
                                            <p className="text-slate-500 text-sm">Aucune consultation enregistrée</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {rendezvous.slice(0, 5).map((rdv) => {
                                                const isPast = new Date(rdv.date) < new Date();
                                                return (
                                                    <div
                                                        key={rdv.id}
                                                        className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200 hover:bg-white transition-colors"
                                                    >
                                                        <div className="flex items-center space-x-3">
                                                            <div className="w-8 h-8 bg-slate-200 rounded-lg flex items-center justify-center">
                                                                <i className="fas fa-user text-slate-600 text-xs"></i>
                                                            </div>
                                                            <div>
                                                                <p className="font-medium text-slate-900 text-sm">
                                                                    {rdv.patient?.username || "Patient"}
                                                                </p>
                                                                <p className="text-slate-500 text-xs">{rdv.date} à {rdv.heure}</p>
                                                            </div>
                                                        </div>
                                                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                                                            isPast
                                                                ? 'bg-slate-100 text-slate-600'
                                                                : 'bg-green-100 text-green-600'
                                                        }`}>
                                                            {isPast ? 'Terminé' : 'À venir'}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Colonne Droite */}
                            <div className="space-y-8">

                                {/* Patients Récents */}
                                <div className="bg-white rounded-2xl p-6 border border-slate-200">
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                                                <i className="fas fa-user-friends text-white text-sm"></i>
                                            </div>
                                            <h2 className="text-xl font-bold text-slate-900">Patients récents</h2>
                                        </div>
                                        <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-sm font-medium">
                                            {recentPatients.length}
                                        </span>
                                    </div>

                                    {recentPatients.length === 0 ? (
                                        <div className="text-center py-8">
                                            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                                <i className="fas fa-users text-slate-400 text-xl"></i>
                                            </div>
                                            <h3 className="text-lg font-semibold text-slate-600 mb-2">Aucun patient</h3>
                                            <p className="text-slate-500 text-sm">Aucun patient récent</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {recentPatients.map((patient) => (
                                                <div
                                                    key={patient.id}
                                                    className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg border border-slate-200 hover:bg-white transition-colors"
                                                >
                                                    <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
                                                        <i className="fas fa-user text-white text-xs"></i>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-medium text-slate-900 text-sm truncate">
                                                            {patient.username}
                                                        </p>
                                                        <p className="text-slate-500 text-xs truncate">{patient.email}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Actions Rapides */}
                                <div className="bg-slate-900 rounded-2xl p-6 text-white">
                                    <h3 className="text-lg font-bold mb-4">Actions rapides</h3>
                                    <div className="space-y-3">
                                        <button className="w-full bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg p-3 text-left transition-all duration-200 flex items-center space-x-3 group">
                                            <i className="fas fa-plus-circle text-white/80 group-hover:text-white"></i>
                                            <div>
                                                <p className="font-medium text-sm">Nouveau patient</p>
                                                <p className="text-white/60 text-xs">Ajouter un patient</p>
                                            </div>
                                        </button>
                                        <button className="w-full bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg p-3 text-left transition-all duration-200 flex items-center space-x-3 group">
                                            <i className="fas fa-file-medical text-white/80 group-hover:text-white"></i>
                                            <div>
                                                <p className="font-medium text-sm">Rapports médicaux</p>
                                                <p className="text-white/60 text-xs">Générer des rapports</p>
                                            </div>
                                        </button>
                                        <button className="w-full bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg p-3 text-left transition-all duration-200 flex items-center space-x-3 group">
                                            <i className="fas fa-chart-bar text-white/80 group-hover:text-white"></i>
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
            </div>
        </>
    );
}