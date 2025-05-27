import { User, LogOut } from 'lucide-react';

interface AuthButtonProps {
    user: any;
    onSignIn: () => void;
    onSignOut: () => void;
}

export function AuthButton({ user, onSignIn, onSignOut }: AuthButtonProps) {
    return user ? (
        <div className="flex items-center gap-2">
            <span className="text-sm text-slate-300">{user.email}</span>
            <button
                onClick={onSignOut}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors duration-200"
            >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
            </button>
        </div>
    ) : (
        <button
            onClick={onSignIn}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors duration-200"
        >
            <User className="w-4 h-4" />
            <span>Sign In</span>
        </button>
    );
} 