import React, { useState } from 'react';
import api from '../api';
import { Fingerprint, ArrowRight, ShieldCheck, UserPlus, LogIn } from 'lucide-react';

export function LoginPage({ onLogin }) {
    const [isSignup, setIsSignup] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!username.trim() || !password.trim()) return;

        setLoading(true);
        setError('');

        const endpoint = isSignup ? '/api/chat/signup' : '/api/chat/login';

        try {
            const res = await api.post(endpoint, { username, password });
            if (res.data && res.data.userId) {
                onLogin(res.data.userId, res.data.username);
            }
        } catch (err) {
            const msg = err.response?.data?.error || "Server connection failed.";
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-screen w-full items-center justify-center bg-black/80 backdrop-blur-sm relative z-50">
            <div className="w-full max-w-md p-8 rounded-3xl bg-[#0f111a]/90 border border-white/10 shadow-2xl relative overflow-hidden group">
                {/* Decor */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50"></div>

                <div className="text-center mb-8">
                    <div className="mx-auto w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mb-4 border border-blue-500/20 group-hover:border-blue-500/50 transition duration-500">
                        {isSignup ? <UserPlus className="w-8 h-8 text-blue-400" /> : <Fingerprint className="w-8 h-8 text-blue-400" />}
                    </div>
                    <h1 className="text-2xl font-bold text-white tracking-widest">{isSignup ? 'NEW IDENTITY' : 'IDENTITY VERIFICATION'}</h1>
                    <p className="text-xs text-gray-500 mt-2 font-mono">{isSignup ? 'CREATE SECURE ACCESS NODE' : 'SECURE SYSTEM ACCESS REQUEST'}</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative">
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Username / Callsign"
                            className="w-full bg-black/40 border border-gray-700 text-center text-white text-lg py-3 rounded-xl focus:outline-none focus:border-blue-500/50 transition placeholder-gray-600 font-mono tracking-wider"
                            autoFocus
                        />
                    </div>

                    <div className="relative">
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Passcode"
                            className="w-full bg-black/40 border border-gray-700 text-center text-white text-lg py-3 rounded-xl focus:outline-none focus:border-blue-500/50 transition placeholder-gray-600 font-mono tracking-wider"
                        />
                    </div>

                    {error && (
                        <p className="text-red-400 text-xs text-center font-mono bg-red-500/10 py-2 rounded">{error}</p>
                    )}

                    <button
                        type="submit"
                        disabled={loading || !username || !password}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group-hover:shadow-blue-500/20"
                    >
                        {loading ? (
                            <span className="animate-pulse">PROCESSING...</span>
                        ) : (
                            <>
                                {isSignup ? 'INITIALIZE MEMBER' : 'ESTABLISH UPLINK'} <ArrowRight className="w-4 h-4" />
                            </>
                        )}
                    </button>

                    <div className="text-center pt-2">
                        <button
                            type="button"
                            onClick={() => { setIsSignup(!isSignup); setError(''); }}
                            className="text-xs text-blue-400 hover:text-blue-300 font-mono underline underline-offset-4"
                        >
                            {isSignup ? "Existing User? Login Here" : "New User? Create Account"}
                        </button>
                    </div>

                    <div className="text-center mt-2">
                        <p className="text-[10px] text-gray-600 flex items-center justify-center gap-1">
                            <ShieldCheck className="w-3 h-3" />
                            ENCRYPTED CONNECTION // V2.9
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}
