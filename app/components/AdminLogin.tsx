"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUser } from '../UserContext';
import { User } from '../types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import Image from 'next/image';

interface AdminLoginProps {
    setLoggedInAdmin: React.Dispatch<React.SetStateAction<string | null>>;
    setUsers: React.Dispatch<React.SetStateAction<User[]>>;
}

const FAVICON = 'https://play-lh.googleusercontent.com/nQLbIovsHYyx1EhAHYc2gdNO9MIIdDLkWWXHuKnLoSVcaOCRtsHPdiYcVQ3tieTe8F3EkKGZVHdcQRO3rU48=w240-h480-rw';
const HERO_IMAGE = 'https://digitalhub.fifa.com/transform/81fd58d0-ca8a-411b-8bce-85c745d8b04c/FIFAPLS_SignIn_Hero_02';

const AdminLogin: React.FC<AdminLoginProps> = ({ setLoggedInAdmin, setUsers }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [tokenLoggingIn, setTokenLoggingIn] = useState(false);
    const [redirecting, setRedirecting] = useState(false);
    const { fetchAdminData, loginWithToken, loading, setLoading } = useUser();
    const router = useRouter();
    const searchParams = useSearchParams();

    const tokenParam = searchParams.get('token');
    useEffect(() => {
        if (localStorage.getItem("adminToken")) {
            setRedirecting(true);
            setLoading(false);
            router.push('/secure/myaccount/tickets');
            return;
        }
        if (tokenParam) {
            setTokenLoggingIn(true);
            loginWithToken(tokenParam).then(success => {
                setTokenLoggingIn(false);
                if (success) {
                    setRedirecting(true);
                    router.push('/secure/myaccount/tickets');
                } else {
                    setErrorMessage("Invalid or expired login link. Please sign in manually.");
                }
            });
        }
    }, [tokenParam, loginWithToken, router, setLoading]);

    useEffect(() => {
        setLoading(false);
    }, [setLoading]);

    const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setErrorMessage(null);

        if (!username || !password) {
            setErrorMessage("Please enter both email/username and password.");
            return;
        }

        setLoading(true);
        try {
            const success = await fetchAdminData(username, password);

            if (success) {
                setRedirecting(true);
                setLoggedInAdmin(username);
                router.push('/secure/myaccount/tickets');
            } else {
                setErrorMessage("Invalid email, username, or password. Please try again.");
                setPassword("");
            }
        } catch (error) {
            console.error('Error logging in:', error);
            setErrorMessage("An unexpected error occurred. Please try again.");
            setPassword("");
        } finally {
            setLoading(false);
        }
    };

    if (redirecting) return null;

    return (
        <div className="min-h-screen flex flex-col md:flex-row bg-white">
            {/* Left — Hero Image */}
            <div className="hidden md:flex md:w-[60%] relative items-end justify-start overflow-hidden">
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${HERO_IMAGE})` }}
                />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg, rgba(3, 18, 43, 0.75) 0%, rgba(3, 18, 43, 0) 100%)' }} />
                <div className="relative z-10 p-12 pb-20">
                    <div className="flex items-center mb-8">
                        <Image src={FAVICON} alt="FIFA" width={48} height={48} className="rounded-full mr-3" unoptimized={true} />
                        <span className="text-white text-xl font-bold">FIFA</span>
                    </div>
                    <h1 className="text-[56px] font-semibold text-white leading-tight mb-6 max-w-[560px]">
                        Welcome
                    </h1>
                    <p className="text-2xl text-white/90 font-medium max-w-[400px] leading-relaxed">
                        Sign in to manage your FIFA World Cup 2026™ tickets
                    </p>
                </div>
            </div>

            {/* Right — Login Form */}
            <div className="flex-1 flex flex-col justify-center px-6 md:px-16 lg:px-24 py-8 md:py-12">
                {/* Mobile logo */}
                <div className="flex md:hidden items-center mb-6">
                    <Image src={FAVICON} alt="FIFA" width={36} height={36} className="rounded-full mr-2" unoptimized={true} />
                    <span className="text-[#03122B] text-base font-bold">FIFA</span>
                </div>

                <div className="w-full max-w-[480px] mx-auto">
                    <h1 className="text-2xl md:text-[42px] font-medium text-[#03122B] mb-4 leading-tight">
                        Sign in
                    </h1>

                    {tokenLoggingIn && (
                        <div className="bg-blue-50 text-[#0A71B4] p-4 rounded-lg mb-6 border border-blue-100 flex items-center space-x-3">
                            <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                            <span className="font-medium text-sm">Signing in securely...</span>
                        </div>
                    )}

                    {errorMessage && (
                        <div className="bg-[#E400461A] text-[#E40046] p-4 rounded-lg text-sm mb-6">
                            {errorMessage}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-8 mt-8">
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-[#03122B]">Email or Username</label>
                            <input
                                type="text"
                                placeholder="Enter your email or username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full py-3 bg-transparent border-b border-[#A5ACBB] text-[#03122B] text-sm outline-none focus:border-[#0A71B4] transition-colors"
                                required
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-medium text-[#03122B]">Password</label>
                            <input
                                type="password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full py-3 bg-transparent border-b border-[#A5ACBB] text-[#03122B] text-sm outline-none focus:border-[#0A71B4] transition-colors"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-[#0A71B4] text-white py-3 rounded-full font-medium text-base hover:bg-[#085d94] transition-all active:scale-[0.99] disabled:opacity-50"
                            disabled={loading}
                        >
                            {loading ? 'Loading...' : 'Continue'}
                        </button>
                    </form>

                    <div className="mt-12 text-xs text-gray-500 leading-relaxed space-y-3">
                        <p>
                            By continuing past this page, I acknowledge that I have read and agree to the current{' '}
                            <a href="#" className="text-[#0A71B4] hover:underline">Terms of Use</a>, including the arbitration agreement and class action waiver, and understand that information will be used as described in our{' '}
                            <a href="#" className="text-[#0A71B4] hover:underline">Privacy Policy</a>.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
