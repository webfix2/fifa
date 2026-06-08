"use client";

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faSearch, 
    faMapMarkerAlt, 
    faCalendarAlt, 
    faChevronDown,
    faTicketAlt,
    faHeart,
    faUserCircle,
    faUser,
    faMap,
    faEllipsisH,
    faChevronRight
} from '@fortawesome/free-solid-svg-icons';
import Image from 'next/image';

const FAVICON = 'https://play-lh.googleusercontent.com/nQLbIovsHYyx1EhAHYc2gdNO9MIIdDLkWWXHuKnLoSVcaOCRtsHPdiYcVQ3tieTe8F3EkKGZVHdcQRO3rU48=w240-h480-rw';

export default function Home() {
    const router = useRouter();
    const pathname = usePathname();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const categories = ['World Cup', 'Transfers', 'My Tickets', 'Stadiums'];

    useEffect(() => {
        const admin = localStorage.getItem("loggedInAdmin");
        if (admin) {
            setIsLoggedIn(true);
        }
    }, []);

    return (
        <div className="min-h-screen bg-[#f4f7f9] flex flex-col font-sans pt-[72px]">
            <header className="bg-white text-[#002B7F] border-b border-gray-100 px-4 py-3 fixed top-0 left-0 right-0 z-50 shadow-2xl">
                <div className="flex justify-between items-center">
                    <div className="w-10"></div>
                    <div className="flex items-center">
                        <Image src={FAVICON} alt="FIFA" width={32} height={32} className="rounded-full mr-2" unoptimized={true} />
                        <span className="text-lg font-black text-[#002B7F]">FIFA World Cup 2026™</span>
                    </div>
                    <button className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-[#002B7F] border border-gray-100 relative">
                        <FontAwesomeIcon icon={faUser} />
                    </button>
                </div>
            </header>

            <div className="px-4 py-6 bg-[#002B7F]">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search matches, teams, or stadiums"
                        className="w-full p-4 pl-4 bg-white border-none rounded-sm text-[#1F1F1F] placeholder-gray-400 font-bold text-sm outline-none shadow-inner"
                    />
                    <FontAwesomeIcon icon={faSearch} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#002B7F] text-lg" />
                </div>
            </div>

            <div className="flex overflow-x-auto space-x-2 p-4 bg-[#002B7F] -mt-1 pb-6 scrollbar-hide">
                {categories.map((cat, i) => (
                    <button key={i} className="px-4 py-2 border border-white/30 rounded-md text-white text-sm font-bold whitespace-nowrap active:bg-white active:text-black transition-colors">
                        {cat}
                    </button>
                ))}
            </div>

            <div className="relative w-full aspect-[4/3] bg-[#001a4d] overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-white px-6">
                        <h1 className="text-3xl font-black mb-2">FIFA World Cup 2026™</h1>
                        <p className="text-lg opacity-80 mb-6">Official Mobile Tickets</p>
                        <button
                            onClick={() => router.push('/login')}
                            className="bg-white text-[#002B7F] px-8 py-3 rounded-md font-black text-sm uppercase tracking-widest shadow-lg active:scale-95 transition-all"
                        >
                            {isLoggedIn ? 'Dashboard' : 'Sign In'}
                        </button>
                    </div>
                </div>
            </div>

            <div className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-black text-[#002B7F]">Upcoming Matches</h2>
                    <button className="text-sm font-bold text-[#002B7F]">See All</button>
                </div>

                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-full bg-[#002B7F]/10 flex items-center justify-center text-[#002B7F]">
                        <FontAwesomeIcon icon={faCalendarAlt} />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold text-[#002B7F]">World Cup Semi-Final</h3>
                        <p className="text-xs text-gray-500">MetLife Stadium · Jul 15, 2026</p>
                    </div>
                    <button className="text-sm font-bold text-[#002B7F]">
                        <FontAwesomeIcon icon={faChevronRight} />
                    </button>
                </div>

                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-full bg-[#002B7F]/10 flex items-center justify-center text-[#002B7F]">
                        <FontAwesomeIcon icon={faCalendarAlt} />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold text-[#002B7F]">World Cup Final</h3>
                        <p className="text-xs text-gray-500">AT&T Stadium · Jul 19, 2026</p>
                    </div>
                    <button className="text-sm font-bold text-[#002B7F]">
                        <FontAwesomeIcon icon={faChevronRight} />
                    </button>
                </div>
            </div>

            <div className="mt-auto bg-white border-t border-gray-200">
                <div className="flex justify-around py-3">
                    <button onClick={() => router.push('/')} className={`flex flex-col items-center space-y-1 ${pathname === '/' ? 'text-[#002B7F]' : 'text-gray-400'}`}>
                        <FontAwesomeIcon icon={faSearch} className="text-xl" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Discover</span>
                    </button>
                    <button onClick={() => router.push('/favorites')} className="flex flex-col items-center space-y-1 text-gray-400">
                        <FontAwesomeIcon icon={faHeart} className="text-xl" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Favorites</span>
                    </button>
                    <button onClick={() => router.push('/secure/myaccount/tickets')} className="flex flex-col items-center space-y-1 text-gray-400">
                        <FontAwesomeIcon icon={faTicketAlt} className="text-xl" />
                        <span className="text-[10px] font-black uppercase tracking-widest">My Tickets</span>
                    </button>
                    <button onClick={() => router.push('/secure/myaccount/manage')} className="flex flex-col items-center space-y-1 text-gray-400">
                        <FontAwesomeIcon icon={faUserCircle} className="text-xl" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Account</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
