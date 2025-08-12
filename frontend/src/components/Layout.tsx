import React from 'react';
import { Activity, Settings } from 'lucide-react';

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navigation Header */}
            <nav className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 flex items-center">
                                <Activity className="h-8 w-8 text-primary-600" />
                                <span className="ml-2 text-xl font-bold text-gray-900">DevFlow</span>
                            </div>

                            {/* Navigation Links */}
                            <div className="hidden md:ml-6 md:flex md:space-x-8">
                                <a href="#" className="text-primary-600 border-b-2 border-primary-600 px-1 pt-1 pb-4 text-sm font-medium">
                                    Dashboard
                                </a>
                                <a href="#" className="text-gray-500 hover:text-gray-700 px-1 pt-1 pb-4 text-sm font-medium">
                                    Reviews
                                </a>
                                <a href="#" className="text-gray-500 hover:text-gray-700 px-1 pt-1 pb-4 text-sm font-medium">
                                    Repositories
                                </a>
                                <a href="#" className="text-gray-500 hover:text-gray-700 px-1 pt-1 pb-4 text-sm font-medium">
                                    Analytics
                                </a>
                            </div>
                        </div>

                        {/* Right side */}
                        <div className="flex items-center space-x-4">
                            <button className="text-gray-400 hover:text-gray-500">
                                <Settings className="h-5 w-5" />
                            </button>
                            <div className="flex items-center space-x-2 text-gray-700">
                                <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                                <span className="text-sm font-medium">GitHub Connected</span>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                {children}
            </main>
        </div>
    );
};

export default Layout;