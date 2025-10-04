// frontend/pages/index.jsx
import { useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";

export default function Home() {
    const [mode, setMode] = useState("signin");
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();

    const API = "http://localhost:4000";

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
            <Head>
                <title>MEDPILOT - Plateforme Médicale Intelligente</title>
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
            </Head>

            <div className="min-h-screen bg-white font-inter text-gray-800 relative overflow-hidden">
                {/* Background Medical Pattern */}
                <div className="absolute inset-0 opacity-[0.02]">
                    <div
                        className="absolute inset-0"
                        style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M50 20 L60 40 L80 45 L65 60 L70 80 L50 70 L30 80 L35 60 L20 45 L40 40 Z' fill='%2300597'/%3E%3C/svg%3E")`,
                            backgroundSize: '120px 120px'
                        }}
                    ></div>
                </div>

                {/* Medical Gradient Orbs */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-100 rounded-full opacity-40 blur-3xl"></div>
                    <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-100 rounded-full opacity-40 blur-3xl"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-100 rounded-full opacity-30 blur-3xl"></div>
                </div>

                {/* Main Container */}
                <div className="relative z-10 w-full max-w-7xl mx-auto px-6 py-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center min-h-screen">

                        {/* Left Side - Medical Branding */}
                        <div className="space-y-8">
                            {/* Logo */}
                            <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg">
                                    <i className="fas fa-stethoscope text-white text-lg"></i>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-gray-900">MEDPILOT</div>
                                    <div className="text-sm text-blue-600 font-medium">Intelligence Médicale</div>
                                </div>
                            </div>

                            {/* Welcome Section */}
                            <div className="space-y-6">
                                <div>
                                    <h1 className="text-4xl font-bold text-gray-900 leading-tight">
                                        Bienvenue sur votre<br />plateforme médicale
                                    </h1>
                                    <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full mt-4"></div>
                                </div>

                                <p className="text-lg text-gray-600 leading-relaxed">
                                    Transformez vos données médicales en insights intelligents avec notre solution de santé digitale avancée.
                                </p>
                            </div>

                            {/* Medical Features */}
                            <div className="space-y-4">
                                <div className="flex items-center space-x-4 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                                        <div className="w-4 h-4 border-2 border-blue-500 rounded"></div>
                                    </div>
                                    <span className="text-gray-700 font-medium">Dashboards automatiques</span>
                                </div>

                                <div className="flex items-center space-x-4 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                                        <i className="fas fa-check text-green-500 text-sm"></i>
                                    </div>
                                    <span className="text-gray-700 font-medium">Diagnostics assistés par IA</span>
                                </div>

                                <div className="flex items-center space-x-4 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                                        <i className="fas fa-check text-green-500 text-sm"></i>
                                    </div>
                                    <span className="text-gray-700 font-medium">Diagnostics assistés par IA</span>
                                </div>
                            </div>

                            {/* Medical Stats */}
                            <div className="grid grid-cols-3 gap-6 pt-6">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-blue-600">500+</div>
                                    <div className="text-sm text-gray-500 mt-1">Patients</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-cyan-500">50+</div>
                                    <div className="text-sm text-gray-500 mt-1">Médecins</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-emerald-500">99.9%</div>
                                    <div className="text-sm text-gray-500 mt-1">Précision</div>
                                </div>
                            </div>

                            {/* Medical Divider */}
                            <div className="pt-8">
                                <div className="w-12 h-1 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full"></div>
                            </div>
                        </div>

                        {/* Right Side - Clean Auth Form */}
                        <div className="w-full max-w-md mx-auto">
                            {/* Auth Card */}
                            <div className="bg-white rounded-3xl border border-gray-200 shadow-xl p-8 space-y-8">
                                {/* Header */}
                                <div className="text-center space-y-3">
                                    <h2 className="text-2xl font-bold text-gray-900">
                                        Content de vous revoir !
                                    </h2>
                                    <p className="text-gray-500">
                                        Connectez-vous à votre espace médical sécurisé
                                    </p>
                                </div>

                                {/* Auth Tabs */}
                                <div className="flex space-x-4 bg-gray-100 rounded-2xl p-2">
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

                                {/* Form */}
                                <form onSubmit={mode === "signup" ? handleSignup : handleSignin} className="space-y-6">
                                    {mode === "signup" && (
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700">
                                                Nom d'utilisateur
                                            </label>
                                            <input
                                                required
                                                value={username}
                                                onChange={(e) => setUsername(e.target.value)}
                                                placeholder="Entrez votre nom"
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                            />
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">
                                            Email
                                        </label>
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
                                        <label className="text-sm font-medium text-gray-700">
                                            Mot de passe
                                        </label>
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

                                    {/* Submit Button */}
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                    >
                                        {isLoading ? (
                                            <div className="flex items-center justify-center space-x-2">
                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                <span>Connexion...</span>
                                            </div>
                                        ) : mode === "signup" ? (
                                            "Créer mon compte"
                                        ) : (
                                            "Se connecter"
                                        )}
                                    </button>
                                </form>

                                {/* Switch Mode */}
                                <div className="text-center">
                                    <button
                                        onClick={() => setMode(mode === "signup" ? "signin" : "signup")}
                                        className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                                    >
                                        {mode === "signup" ? "Déjà un compte ? Se connecter" : "Pas encore de compte ? Créer un compte"}
                                    </button>
                                </div>
                            </div>

                            {/* Footer Links */}
                            <div className="mt-8 text-center space-y-4">
                                <div className="flex justify-center space-x-6 text-sm text-gray-500">
                                    <a href="#" className="hover:text-blue-600 transition-colors">Aide</a>
                                    <a href="#" className="hover:text-blue-600 transition-colors">Confidentialité</a>
                                    <a href="#" className="hover:text-blue-600 transition-colors">Conditions</a>
                                </div>
                                <p className="text-xs text-gray-400">
                                    © 2025 MEDPILOT. Tous droits réservés.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}