import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Navigation() {
    const router = useRouter();
    return (
        <nav className="bg-white/80 backdrop-blur-md border-b border-blue-200/50">
            <div className="max-w-7xl mx-auto px-6 py-4">
                <div className="flex items-center justify-between">
                    {/* Logo */}
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

                    {/* Navigation Links */}
                    <div className="hidden md:flex items-center space-x-8">
                        <Link
                            href="/doctor"
                            className={`transition-colors font-medium ${
                                router.pathname === '/doctor'
                                    ? 'text-blue-600'
                                    : 'text-gray-600 hover:text-blue-600'
                            }`}
                        >
                            <i className="fas fa-user-md mr-2"></i>Doctors
                        </Link>

                        <Link
                            href="/patient"
                            className={`transition-colors font-medium ${
                                router.pathname === '/patient'
                                    ? 'text-blue-600'
                                    : 'text-gray-600 hover:text-blue-600'
                            }`}
                        >
                            <i className="fas fa-user-injured mr-2"></i>Patients
                        </Link>

                        <Link
                            href="/manage-doctors"
                            className={`transition-colors font-medium ${
                                router.pathname === '/manage-doctors'
                                    ? 'text-blue-600'
                                    : 'text-gray-600 hover:text-blue-600'
                            }`}
                        >
                            <i className="fas fa-cog mr-2"></i>Manage
                        </Link>
                    </div>
                </div>
            </div>

        </nav>
    );
}