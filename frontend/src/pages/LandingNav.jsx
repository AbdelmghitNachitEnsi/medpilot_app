import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Navigation() {
    const router = useRouter();

    return (
        <nav className="bg-white/80 backdrop-blur-lg border-b border-gray-200/60 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-6 py-4">
                <div className="flex items-center justify-between">
                    {/* Logo et Nom */}
                    <div className="flex items-center space-x-4">

                            <Link href="/" className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                                    <i className="fas fa-heartbeat text-white text-lg"></i>
                                </div>
                                <span className="text-2xl font-bold text-gray-900">
                MED<span className="text-blue-600">PILOT</span>
              </span>
                            </Link>

                        {/* Séparateur */}
                        <div className="h-6 w-px bg-gray-300/60 hidden md:block"></div>

                        {/* Tagline */}
                        <div className="hidden md:block">
                            <p className="text-sm text-gray-600">Votre santé, notre priorité</p>
                        </div>
                    </div>

                    {/* Navigation Links */}
                    <div className="hidden md:flex items-center space-x-6">
                        {/* Features */}
                        <div className="flex items-center space-x-1">
                            <div className="flex items-center space-x-1 text-gray-500">
                                <i className="fas fa-shield-alt text-sm text-green-500"></i>
                                <span className="text-xs font-medium">100% Sécurisé</span>
                            </div>
                            <div className="flex items-center space-x-1 text-gray-500">
                                <i className="fas fa-clock text-sm text-blue-500"></i>
                                <span className="text-xs font-medium">24h/24</span>
                            </div>
                            <div className="flex items-center space-x-1 text-gray-500">
                                <i className="fas fa-user-md text-sm text-purple-500"></i>
                                <span className="text-xs font-medium">Experts</span>
                            </div>
                        </div>

                        {/* Séparateur */}
                        <div className="h-6 w-px bg-gray-300/60"></div>

                        {/* Bouton de connexion principal */}
                        <Link href="/login">
                            <button className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white px-6 py-2.5 rounded-xl font-medium transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-xl group">
                                <i className="fas fa-sign-in-alt group-hover:scale-110 transition-transform duration-200"></i>
                                <span>Se Connecter</span>
                            </button>
                        </Link>

                        {/* Lien d'urgence */}
                        <Link href="/urgence">
                            <button className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2.5 rounded-xl font-medium transition-all duration-300 flex items-center space-x-2 text-sm shadow-lg hover:shadow-xl">
                                <i className="fas fa-ambulance"></i>
                                <span>Urgence</span>
                            </button>
                        </Link>
                    </div>

                    {/* Menu Mobile */}
                    <div className="flex items-center space-x-3 md:hidden">
                        {/* Bouton urgence mobile */}
                        <Link href="/urgence">
                            <button className="bg-red-500 hover:bg-red-600 text-white p-2.5 rounded-xl transition-colors duration-200 shadow-lg">
                                <i className="fas fa-ambulance text-sm"></i>
                            </button>
                        </Link>

                        {/* Bouton connexion mobile */}
                        <Link href="/login">
                            <button className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white p-2.5 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl">
                                <i className="fas fa-sign-in-alt text-sm"></i>
                            </button>
                        </Link>

                        {/* Menu hamburger */}
                        <button className="p-2.5 rounded-xl border border-gray-300 hover:border-gray-400 transition-colors duration-200">
                            <i className="fas fa-bars text-gray-600"></i>
                        </button>
                    </div>
                </div>
            </div>

            {/* Bandeau d'information */}
            <div className="bg-gradient-to-r from-violet-600 to-purple-600 py-2">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex items-center justify-center space-x-6 text-white text-sm">
                        <div className="flex items-center space-x-2">
                            <i className="fas fa-phone-alt text-xs"></i>
                            <span>Urgence: 15</span>
                        </div>
                        <div className="hidden sm:flex items-center space-x-2">
                            <i className="fas fa-clock text-xs"></i>
                            <span>Assistance 24h/24</span>
                        </div>
                        <div className="hidden md:flex items-center space-x-2">
                            <i className="fas fa-shield-alt text-xs"></i>
                            <span>Données médicales sécurisées</span>
                        </div>
                        <div className="hidden lg:flex items-center space-x-2">
                            <i className="fas fa-star text-xs"></i>
                            <span>Plateforme certifiée</span>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}