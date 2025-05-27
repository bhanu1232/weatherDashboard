import { useState } from 'react';
import { supabase } from '../lib/supabase';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAuthSuccess: () => void;
}

export function AuthModal({ isOpen, onClose, onAuthSuccess }: AuthModalProps) {
    const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isAuthLoading, setIsAuthLoading] = useState(false);
    const [authError, setAuthError] = useState<string | null>(null);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsAuthLoading(true);
        setAuthError(null);

        try {
            const { error } = authMode === 'signin'
                ? await supabase.auth.signInWithPassword({ email, password })
                : await supabase.auth.signUp({ email, password });

            if (error) {
                setAuthError(error.message);
                return;
            }

            onAuthSuccess();
            onClose();
            setEmail('');
            setPassword('');
        } catch (error) {
            console.error('Error in handleAuth:', error);
            setAuthError('An unexpected error occurred. Please try again.');
        } finally {
            setIsAuthLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-slate-800 p-8 rounded-2xl w-full max-w-md relative">
                <h2 className="text-2xl font-bold mb-6">
                    {authMode === 'signin' ? 'Sign In' : 'Sign Up'}
                </h2>
                <form onSubmit={handleAuth} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                setAuthError(null);
                            }}
                            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                            disabled={isAuthLoading}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">
                            Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                setAuthError(null);
                            }}
                            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                            disabled={isAuthLoading}
                        />
                    </div>

                    {/* Auth Error Message */}
                    {authError && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-400 text-sm">
                            {authError}
                        </div>
                    )}

                    <div className="flex justify-between items-center">
                        <button
                            type="button"
                            onClick={() => {
                                setAuthMode(authMode === 'signin' ? 'signup' : 'signin');
                                setAuthError(null);
                            }}
                            className="text-sm text-blue-400 hover:text-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={isAuthLoading}
                        >
                            {authMode === 'signin' ? 'Need an account? Sign up' : 'Already have an account? Sign in'}
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            disabled={isAuthLoading}
                        >
                            {isAuthLoading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                                    <span>Processing...</span>
                                </>
                            ) : (
                                <span>{authMode === 'signin' ? 'Sign In' : 'Sign Up'}</span>
                            )}
                        </button>
                    </div>
                </form>
                <button
                    onClick={() => {
                        onClose();
                        setAuthError(null);
                    }}
                    className="absolute top-4 right-4 text-slate-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isAuthLoading}
                >
                    ×
                </button>
            </div>
        </div>
    );
} 