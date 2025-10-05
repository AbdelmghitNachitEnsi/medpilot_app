// frontend/pages/index.jsx
import { useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Navigation from '@/pages/NavBar';

export default function Home() {
    const [mode, setMode] = useState("signin");
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();

    const API = "http://localhost:4001";

    async function handleSignup(e) {
        e.preventDefault();
        setIsLoading(true);
        const body = { username, email, password, role: "patient" };
        const res = await fetch(`${API}/auth/signup`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        });
        const data = await res.json();

        if (res.status === 201) {
            const loginRes = await fetch(`${API}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });
            const loginData = await loginRes.json();
            if (loginRes.ok && loginData.token) {
                localStorage.setItem("token", loginData.token);
                localStorage.setItem("role", loginData.role);
                localStorage.setItem("username", username);
                router.push("/patient");
            } else {
                alert(loginData.error || "Login failed after signup");
            }
        } else {
            alert(data.error || JSON.stringify(data));
        }
        setIsLoading(false);
    }

    async function handleSignin(e) {
        e.preventDefault();
        setIsLoading(true);
        const res = await fetch(`${API}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (res.ok && data.token) {
            localStorage.setItem("token", data.token);
            localStorage.setItem("role", data.role);
            localStorage.setItem("username", data.username || "Patient");
            if (data.role === "patient") router.push("/patient");
            else if (data.role === "doctor") router.push("/doctor");
        } else {
            alert(data.error || "Login failed");
        }
        setIsLoading(false);
    }

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <>
            <Navigation />
            <Head>
                <title>MEDPILOT - Plateforme Médicale Intelligente</title>
                <meta name="description" content="Plateforme de santé digitale avec IA assistant médical, gestion de rendez-vous et téléconsultation" />
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
            </Head>

            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-100 font-inter text-gray-800">
                {/* Hero Section */}
                <div className="relative overflow-hidden">
                    <div className="max-w-7xl mx-auto px-6 py-16 lg:py-24">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

                            {/* Left Content */}
                            <div className="space-y-8">
                                <div className="space-y-4">
                                    <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-600 rounded-full text-sm font-medium">
                                        <i className="fas fa-star mr-2"></i>
                                        Plateforme Médicale Intelligente
                                    </div>
                                    <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                                        Votre santé,
                                        <span className="block text-blue-600">notre priorité</span>
                                    </h1>
                                    <p className="text-xl text-gray-600 leading-relaxed">
                                        MEDPILOT révolutionne les soins de santé avec l'IA. Consultez, planifiez et recevez des conseils médicaux personnalisés 24h/24.
                                    </p>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-4">
                                    <button
                                        onClick={() => document.getElementById('auth-section').scrollIntoView({ behavior: 'smooth' })}
                                        className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                                    >
                                        Commencer maintenant
                                        <i className="fas fa-arrow-right ml-2"></i>
                                    </button>
                                </div>

                                {/* Stats */}
                                <div className="grid grid-cols-3 gap-6 pt-8">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-blue-600">10K+</div>
                                        <div className="text-sm text-gray-500">Patients satisfaits</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-cyan-500">500+</div>
                                        <div className="text-sm text-gray-500">Médecins partenaires</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-green-500">24/7</div>
                                        <div className="text-sm text-gray-500">Assistance disponible</div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Content - Illustration */}
                            <div className="relative">
                                <div className="bg-white/80 backdrop-blur-sm p-14 shadow-2xl border border-blue-200/30"
                                     style={{
                                         borderRadius: '68% 32% 76% 24% / 27% 69% 31% 73%'
                                     }}>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-6">
                                            <div
                                                className="bg-blue-50 text-center p-6 shadow-lg border border-blue-200"
                                                style={{
                                                    borderRadius: '68% 32% 76% 24% / 27% 69% 31% 73%'
                                                }}
                                            >
                                                <i className="fas fa-robot text-blue-600 text-2xl mb-3"></i>
                                                <h3 className="font-semibold text-gray-900">Assistant IA</h3>
                                                <p className="text-sm text-gray-600">Diagnostics intelligents</p>
                                            </div>
                                            <div
                                                className="bg-green-50 text-center p-6 shadow-lg border border-green-200"
                                                style={{
                                                    borderRadius: '68% 32% 76% 24% / 27% 69% 31% 73%'
                                                }}
                                            >
                                                <i className="fas fa-video text-green-600 text-2xl mb-3"></i>
                                                <h3 className="font-semibold text-gray-900">Téléconsultation</h3>
                                                <p className="text-sm text-gray-600">Visio avec médecins</p>
                                            </div>
                                        </div>
                                        <div className="space-y-6 pt-12">
                                            <div
                                                className="bg-purple-50 text-center p-6 shadow-lg border border-purple-200"
                                                style={{
                                                    borderRadius: '68% 32% 76% 24% / 27% 69% 31% 73%'
                                                }}
                                            >
                                                <i className="fas fa-calendar-check text-purple-600 text-2xl mb-3"></i>
                                                <h3 className="font-semibold text-gray-900">RDV en ligne</h3>
                                                <p className="text-sm text-gray-600">Réservation facile</p>
                                            </div>
                                            <div
                                                className="bg-orange-50 text-center p-6 shadow-lg border border-orange-200"
                                                style={{
                                                    borderRadius: '68% 32% 76% 24% / 27% 69% 31% 73%'
                                                }}
                                            >
                                                <i className="fas fa-file-medical text-orange-600 text-2xl mb-3"></i>
                                                <h3 className="font-semibold text-gray-900">Dossier médical</h3>
                                                <p className="text-sm text-gray-600">Sécurisé et complet</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Floating Elements */}
                                <div className="absolute -top-4 -right-0.5 w-24 h-24 bg-blue-200 rounded-full opacity-20 animate-pulse"></div>
                                <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-cyan-200 rounded-full opacity-20 animate-pulse delay-1000"></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Features Section - AVEC PATTERN UNIQUEMENT ICI */}
                <section id="features" className="bg-white relative">
                    {/* Background Medical Pattern - UNIQUEMENT DANS CETTE SECTION */}
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-0">
                        <div
                            className="absolute inset-0"
                            style={{
                                backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M50 20 L60 40 L80 45 L65 60 L70 80 L50 70 L30 80 L35 60 L20 45 L40 40 Z' fill='%2300597'/%3E%3C/svg%3E")`,
                                backgroundSize: '120px 120px'
                            }}
                        ></div>
                    </div>

                    {/* Medical Gradient Orbs - UNIQUEMENT DANS CETTE SECTION */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-100 rounded-full opacity-30 blur-3xl"></div>
                        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-100 rounded-full opacity-30 blur-3xl"></div>
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-100 rounded-full opacity-20 blur-3xl"></div>
                    </div>

                    <div className="py-16 px-6 relative z-10">
                        <div className="max-w-7xl mx-auto">
                            {/* Grande bulle contenant toutes les fonctionnalités */}
                            <div className="backdrop-blur-sm p-40 shadow-2xl border border-blue-200/30 mx-auto max-w-6xl bg-blue-50"
                                 style={{
                                     borderRadius: '68% 32% 76% 24% / 27% 69% 31% 73%'
                                 }}>
                                <div className="text-center mb-16">
                                    <h2 className="text-4xl font-bold text-gray-900 mb-4">Fonctionnalités Principales</h2>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-6">
                                        <div
                                            className="bg-white text-center p-6 shadow-lg border border-blue-200"
                                            style={{
                                                borderRadius: '68% 32% 76% 24% / 27% 69% 31% 73%'
                                            }}
                                        >
                                            <i className="fas fa-robot text-blue-600 text-2xl mb-3"></i>
                                            <h3 className="font-semibold text-gray-900">Assistant Médical IA</h3>
                                            <p className="text-sm text-gray-600">Chatbot intelligent pour vos questions de santé 24h/24</p>
                                        </div>
                                        <div
                                            className="bg-green-50 text-center p-6 shadow-lg border border-green-200"
                                            style={{
                                                borderRadius: '68% 32% 76% 24% / 27% 69% 31% 73%'
                                            }}
                                        >
                                            <i className="fas fa-video text-green-600 text-2xl mb-3"></i>
                                            <h3 className="font-semibold text-gray-900">Visio Consultation</h3>
                                            <p className="text-sm text-gray-600">Consultations à distance avec des médecins certifiés</p>
                                        </div>
                                    </div>
                                    <div className="space-y-6 pt-12">
                                        <div
                                            className="bg-purple-50 text-center p-6 shadow-lg border border-purple-200"
                                            style={{
                                                borderRadius: '68% 32% 76% 24% / 27% 69% 31% 73%'
                                            }}
                                        >
                                            <i className="fas fa-calendar-check text-purple-600 text-2xl mb-3"></i>
                                            <h3 className="font-semibold text-gray-900">Gestion de RDV</h3>
                                            <p className="text-sm text-gray-600">Prenez rendez-vous facilement en ligne</p>
                                        </div>
                                        <div
                                            className="bg-orange-50 text-center p-6 shadow-lg border border-orange-200"
                                            style={{
                                                borderRadius: '68% 32% 76% 24% / 27% 69% 31% 73%'
                                            }}
                                        >
                                            <i className="fas fa-file-medical text-orange-600 text-2xl mb-3"></i>
                                            <h3 className="font-semibold text-gray-900">Ordonnances Digitales</h3>
                                            <p className="text-sm text-gray-600">Recevez vos ordonnances directement sur la plateforme</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Auth Section */}
                <section id="auth-section" className="py-20 bg-gradient-to-br from-blue-600 to-cyan-500">
                    <div className="max-w-4xl mx-auto px-6">
                        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

                                {/* Left Side - Info */}
                                <div className="space-y-8">
                                    <div>
                                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Rejoignez MEDPILOT</h2>
                                        <p className="text-gray-600 text-lg">
                                            Accédez à une nouvelle ère de soins de santé digitaux. Simple, sécurisé et efficace.
                                        </p>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                                                <i className="fas fa-check text-green-600 text-lg"></i>
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-gray-900">Consultation immédiate</h4>
                                                <p className="text-gray-600 text-sm">Obtenez des réponses à vos questions médicales</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-4">
                                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                                <i className="fas fa-shield-alt text-blue-600 text-lg"></i>
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-gray-900">Données sécurisées</h4>
                                                <p className="text-gray-600 text-sm">Vos informations médicales protégées</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-4">
                                            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                                                <i className="fas fa-clock text-purple-600 text-lg"></i>
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-gray-900">Gain de temps</h4>
                                                <p className="text-gray-600 text-sm">Évitez les déplacements inutiles</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Side - Auth Form */}
                                <div className="space-y-6">
                                    {/* Auth Tabs */}
                                    <div className="flex bg-gray-100 rounded-2xl p-2">
                                        <button
                                            onClick={() => setMode("signin")}
                                            className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all ${
                                                mode === "signin"
                                                    ? "bg-white text-blue-600 shadow-sm"
                                                    : "text-gray-600 hover:text-gray-900"
                                            }`}
                                        >
                                            Connexion
                                        </button>
                                        <button
                                            onClick={() => setMode("signup")}
                                            className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all ${
                                                mode === "signup"
                                                    ? "bg-white text-blue-600 shadow-sm"
                                                    : "text-gray-600 hover:text-gray-900"
                                            }`}
                                        >
                                            Inscription
                                        </button>
                                    </div>

                                    {/* Auth Form */}
                                    <form onSubmit={mode === "signup" ? handleSignup : handleSignin} className="space-y-4">
                                        {mode === "signup" && (
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-gray-700">Nom d'utilisateur</label>
                                                <input
                                                    required
                                                    value={username}
                                                    onChange={(e) => setUsername(e.target.value)}
                                                    placeholder="Votre nom d'utilisateur"
                                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                                />
                                            </div>
                                        )}

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700">Email</label>
                                            <input
                                                required
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder="votre.email@exemple.com"
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700">Mot de passe</label>
                                            <div className="relative">
                                                <input
                                                    required
                                                    type={showPassword ? "text" : "password"}
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    placeholder="••••••••"
                                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all pr-12"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={togglePasswordVisibility}
                                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                                >
                                                    <i className={`fas fa-eye${showPassword ? '-slash' : ''}`}></i>
                                                </button>
                                            </div>
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={isLoading}
                                            className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-semibold py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                        >
                                            {isLoading ? (
                                                <div className="flex items-center justify-center space-x-2">
                                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                    <span>Chargement...</span>
                                                </div>
                                            ) : mode === "signup" ? (
                                                "Créer mon compte"
                                            ) : (
                                                "Se connecter"
                                            )}
                                        </button>
                                    </form>

                                    <div className="text-center">
                                        <button
                                            onClick={() => setMode(mode === "signup" ? "signin" : "signup")}
                                            className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                                        >
                                            {mode === "signup" ? "Déjà un compte ? Se connecter" : "Pas encore de compte ? S'inscrire"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="bg-gray-900 text-white py-12">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                            <div className="space-y-4">
                                <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                                        <i className="fas fa-heartbeat text-white text-sm"></i>
                                    </div>
                                    <span className="text-xl font-bold">MEDPILOT</span>
                                </div>
                                <p className="text-gray-400 text-sm">
                                    Votre partenaire santé digital. Accessible, sécurisé et innovant.
                                </p>
                            </div>

                            <div className="space-y-4">
                                <h4 className="font-semibold">Navigation</h4>
                                <div className="space-y-2 text-sm text-gray-400">
                                    <a href="#features" className="block hover:text-white transition-colors">Fonctionnalités</a>
                                    <a href="#about" className="block hover:text-white transition-colors">À propos</a>
                                    <a href="#contact" className="block hover:text-white transition-colors">Contact</a>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="font-semibold">Légal</h4>
                                <div className="space-y-2 text-sm text-gray-400">
                                    <a href="#" className="block hover:text-white transition-colors">Confidentialité</a>
                                    <a href="#" className="block hover:text-white transition-colors">Conditions d'utilisation</a>
                                    <a href="#" className="block hover:text-white transition-colors">Mentions légales</a>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="font-semibold">Contact</h4>
                                <div className="space-y-2 text-sm text-gray-400">
                                    <div className="flex items-center space-x-2">
                                        <i className="fas fa-phone"></i>
                                        <span>+212 649-186852</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <i className="fas fa-envelope"></i>
                                        <span>contact@medpilot.com</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
                            <p>&copy; 2025 MEDPILOT. Tous droits réservés.</p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}