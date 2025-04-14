"use client"

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
// import Image from 'next/image';
import bcrypt from 'bcryptjs'; // Import bcrypt

interface Props {
    onLogin?: (userData: any) => void;
    onCreateAccount?: (newUserData: any) => void;
}

//  Utility function for password hashing (you can also move this to a separate utils file)
const hashPassword = async (password: string): Promise<string> => {
    const saltRounds = 10;
    try {
        return await bcrypt.hash(password, saltRounds);
    } catch (error: any) {
        throw new Error("Password hashing failed: " + error.message);
    }
};

export default function AuthForm({ onLogin, onCreateAccount }: Props) {
    const [mode, setMode] = useState<'login' | 'create'>('login');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
    
        if (mode === 'login') {
            try {
                const response = await fetch('/api/apiv0/login', { // Updated URL
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ username }),
                });
    
                if (response.ok) {
                    const userData = await response.json();
                    if (onLogin) {
                        onLogin(userData);
                    }
                    router.push('/app');
                } else {
                    const data = await response.json();
                    setError(data.message || 'Login failed');
                }
            } catch (err: any) {
                setError('Failed to connect to server: ' + err.message);
                console.error(err);
            }
        } else {
            // mode === 'create'
            try {
                const hashedPassword = await hashPassword(password);
    
                const response = await fetch('/api/apiv0/create-account', {  // Updated URL
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ username, password: hashedPassword, email }),
                });
    
                if (response.ok) {
                    const newUserData = await response.json();
                    if (onCreateAccount) {
                        onCreateAccount(newUserData);
                    }
                    router.push('/app');
                } else {
                    const data = await response.json();
                    setError(data.message || 'Account creation failed');
                }
            } catch (err: any) {
                setError('Failed to connect to server: ' + err.message);
                console.error(err);
            }
        };
    }

    const toggleMode = () => {
        setMode(mode === 'login' ? 'create' : 'login');
        setError('');
    };

    return (
        <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
            <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden md:max-w-2xl">
                <div className="md:flex">
                    <div className="w-full p-8 md:w-1/2">
                        <h2 className="text-2xl font-semibold text-gray-700 dark:text-white mb-4">
                            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
                        </h2>
                        {error && (
                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                                <strong className="font-bold">Error!</strong>
                                <span className="block sm:inline ml-2">{error}</span>
                            </div>
                        )}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label
                                    htmlFor="username"
                                    className="block text-gray-600 dark:text-gray-200 text-sm font-bold mb-2"
                                >
                                    Username
                                </label>
                                <input
                                    type="text"
                                    id="username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label
                                    htmlFor="password"
                                    className="block text-gray-600 dark:text-gray-200 text-sm font-bold mb-2"
                                >
                                    Password
                                </label>
                                <input
                                    type="password"
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-blue-500"
                                    />
                            </div>
                            {mode === 'create' && (
                                <div>
                                    <label
                                        htmlFor="email"
                                        className="block text-gray-600 dark:text-gray-200 text-sm font-bold mb-2"
                                        >
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-blue-500"
                                        />
                                </div>
                            )}
                            <button
                                type="submit"
                                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-blue-500 w-full"
                                >
                                {mode === 'login' ? 'Log In' : 'Create Account'}
                            </button>
                            <button
                                type="button"
                                onClick={toggleMode}
                                className="text-sm text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 w-full text-center mt-2"
                                >
                                {mode === 'login'
                                    ? 'New User? Create Account'
                                    : 'Already have an account? Log In'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}