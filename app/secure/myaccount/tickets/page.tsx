"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUser } from '../../../UserContext';
import { Ticket } from '../../../types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTicketAlt, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';

const SWIPE_THRESHOLD = -60;

function parseDateTime(dt: string): { day: string; month: string; year: string; time: string } {
    if (!dt) return { day: '--', month: '--', year: '--', time: '--:--' };
    try {
        const d = new Date(dt);
        if (isNaN(d.getTime())) {
            const parts = dt.split(/[\s,]+/);
            return { day: parts[0] || '--', month: parts[1] || '--', year: parts[2] || '--', time: parts[3] || '--:--' };
        }
        const day = d.getDate().toString();
        const month = d.toLocaleString('en-US', { month: 'short' }).toUpperCase();
        const year = d.getFullYear().toString().slice(-2);
        const time = d.toLocaleString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
        return { day, month, year, time };
    } catch {
        return { day: '--', month: '--', year: '--', time: '--:--' };
    }
}

export default function MyTicketsPage() {
    const router = useRouter();
    const {
        admin,
        tickets: allTickets,
        fetchAllTickets,
        setAdmin,
        setLoggedInAdmin,
    } = useUser();

    const searchParams = useSearchParams();

    const [localAdmin, setLocalAdmin] = useState<string | null>(null);
    const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([]);
    const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
    const [isSessionValid, setIsSessionValid] = useState<boolean | null>(null);
    const [hiddenTicketIds, setHiddenTicketIds] = useState<Set<string>>(new Set());
    const [swipedTicketId, setSwipedTicketId] = useState<string | null>(null);
    const [swipeX, setSwipeX] = useState(0);
    const [isSwiping, setIsSwiping] = useState(false);
    const touchStartX = useRef(0);
    const touchCurrentId = useRef<string | null>(null);

    // Restore hidden tickets from localStorage
    useEffect(() => {
        try {
            const stored = localStorage.getItem("hiddenTickets");
            if (stored) {
                const parsed = JSON.parse(stored);
                if (Array.isArray(parsed)) setHiddenTicketIds(new Set(parsed));
            }
        } catch (e) {}
    }, []);

    // Sync hidden tickets to localStorage
    useEffect(() => {
        localStorage.setItem("hiddenTickets", JSON.stringify(Array.from(hiddenTicketIds)));
    }, [hiddenTicketIds]);

    // Handle revealAll from URL param (set by Manage page)
    useEffect(() => {
        if (searchParams.get('revealAll') === '1') {
            localStorage.removeItem("hiddenTickets");
            setHiddenTicketIds(new Set());
            window.history.replaceState({}, '', window.location.pathname);
        }
    }, [searchParams]);

    const handleTouchStart = useCallback((ticketId: string, e: React.TouchEvent) => {
        touchStartX.current = e.touches[0].clientX;
        touchCurrentId.current = ticketId;
        setIsSwiping(true);
        setSwipedTicketId(ticketId);
        setSwipeX(0);
    }, []);

    const handleTouchMove = useCallback((e: React.TouchEvent) => {
        if (!isSwiping || !swipedTicketId) return;
        const dx = e.touches[0].clientX - touchStartX.current;
        if (dx > 0 && swipeX === 0) return;
        setSwipeX(Math.max(dx, -80));
    }, [isSwiping, swipedTicketId, swipeX]);

    const handleTouchEnd = useCallback(() => {
        setIsSwiping(false);
        if (swipeX < SWIPE_THRESHOLD) {
            setSwipeX(-80);
        } else {
            setSwipedTicketId(null);
            setSwipeX(0);
            touchCurrentId.current = null;
        }
    }, [swipeX]);

    const handleHideConfirm = useCallback((ticketId: string) => {
        const next = new Set(hiddenTicketIds);
        next.add(ticketId);
        setHiddenTicketIds(next);
        setSwipedTicketId(null);
        setSwipeX(0);
        touchCurrentId.current = null;
    }, [hiddenTicketIds]);

    const handleSnapBack = useCallback(() => {
        setSwipedTicketId(null);
        setSwipeX(0);
        touchCurrentId.current = null;
    }, []);

    useEffect(() => {
        const adminToken = localStorage.getItem("adminToken");
        if (!adminToken) {
            router.replace('/login');
            return;
        }
        setIsSessionValid(true);
        const adminUsername = localStorage.getItem("loggedInAdmin");
        const adminData = localStorage.getItem('adminData');
        if (adminUsername && adminData) {
            try {
                const parsedAdminData = JSON.parse(adminData);
                setAdmin(parsedAdminData);
                setLoggedInAdmin(adminUsername);
                setLocalAdmin(adminUsername);
                fetchAllTickets();
            } catch (e) {
                console.error("Error parsing admin data", e);
            }
        } else if (admin) {
            setLocalAdmin(admin.username || admin.adminId);
            fetchAllTickets();
        }
    }, [setAdmin, router, fetchAllTickets, setLoggedInAdmin]);

    useEffect(() => {
        if (isSessionValid === true && localAdmin && Array.isArray(allTickets)) {
            const filtered = allTickets.filter((t) => {
                const matchesAdmin = t.admin === localAdmin;
                const isNotDeleted = !t.deletedSTAMP || t.deletedSTAMP.trim() === "";
                if (!matchesAdmin || !isNotDeleted) return false;
                if (hiddenTicketIds.has(t.ticketId)) return false;

                if (activeTab === 'upcoming') {
                    return t.eventStatus === 'ACTIVE' || t.eventStatus === 'WAITING';
                } else {
                    return t.eventStatus === 'PAST';
                }
            });
            setFilteredTickets(filtered);
        }
    }, [allTickets, localAdmin, isSessionValid, activeTab, hiddenTicketIds]);

    if (isSessionValid === null) return null;

    const upcomingCount = allTickets?.filter((t) => {
        const matchesAdmin = t.admin === localAdmin;
        const isNotDeleted = !t.deletedSTAMP || t.deletedSTAMP.trim() === "";
        return matchesAdmin && isNotDeleted && !hiddenTicketIds.has(t.ticketId) && (t.eventStatus === 'ACTIVE' || t.eventStatus === 'WAITING');
    }).length ?? 0;

    return (
        <div className="flex-1 flex flex-col min-h-full pb-[100px]">
            <div className="px-6 pt-6 pb-2">
                <h1 className="text-3xl font-black text-[#1F1F1F] tracking-tight">My ticket(s)</h1>
            </div>

            <div className="flex px-6 pt-4 pb-0 border-b border-gray-100">
                <button
                    onClick={() => setActiveTab('upcoming')}
                    className={`flex items-center space-x-2 pb-3 font-bold text-sm transition-all border-b-2 whitespace-nowrap ${activeTab === 'upcoming' ? 'border-[#002B7F] text-[#1F1F1F]' : 'border-transparent text-gray-400'}`}
                >
                    <span>Upcoming match(es)</span>
                    <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-black ${activeTab === 'upcoming' ? 'bg-[#1F1F1F] text-white' : 'bg-gray-200 text-gray-500'}`}>
                        {activeTab === 'upcoming' ? filteredTickets.length : upcomingCount}
                    </span>
                </button>
                <button
                    onClick={() => setActiveTab('past')}
                    className={`flex items-center space-x-2 pb-3 ml-6 font-bold text-sm transition-all border-b-2 whitespace-nowrap ${activeTab === 'past' ? 'border-[#002B7F] text-[#1F1F1F]' : 'border-transparent text-gray-400'}`}
                >
                    <span>Past match(es)</span>
                </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
                {/* FIFA World Cup 2026 App Banner */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 px-4 py-3 flex items-center space-x-3">
                    <div className="w-10 h-10 flex items-center justify-center shrink-0">
                        <img
                            src="https://upload.wikimedia.org/wikipedia/en/thumb/1/17/2026_FIFA_World_Cup_emblem.svg/250px-2026_FIFA_World_Cup_emblem.svg.png"
                            alt="FIFA World Cup 2026"
                            className="w-10 h-10 object-contain"
                        />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="font-bold text-[#1F1F1F] text-sm">FIFA World Cup 2026™ App</p>
                        <p className="text-xs text-gray-400">Your tournament companion to every match and city</p>
                    </div>
                </div>

                {filteredTickets.length > 0 ? (
                    filteredTickets.map((ticket, i) => {
                        const { day, month, year, time } = parseDateTime(ticket.dateTime);
                        const seatCount = ticket.seatNumbers ? ticket.seatNumbers.split(',').filter(s => s.trim()).length : 1;
                        const open = swipedTicketId === ticket.ticketId && swipeX === -80;

                        return (
                            <div key={i} className="relative overflow-hidden">
                                {open && (
                                    <div className="absolute inset-y-0 right-0 w-[80px] flex items-center justify-center bg-red-500 rounded-xl z-0">
                                        <button
                                            onClick={() => handleHideConfirm(ticket.ticketId)}
                                            className="text-white font-black text-xs uppercase tracking-widest"
                                        >
                                            Hide?
                                        </button>
                                    </div>
                                )}
                                <div
                                    className="relative z-10"
                                    style={{
                                        transform: `translateX(${swipedTicketId === ticket.ticketId ? swipeX : 0}px)`,
                                        transition: isSwiping ? 'none' : 'transform 0.25s ease',
                                        touchAction: 'pan-y',
                                    }}
                                    onTouchStart={(e) => handleTouchStart(ticket.ticketId, e)}
                                    onTouchMove={handleTouchMove}
                                    onTouchEnd={handleTouchEnd}
                                >
                                    {open ? (
                                        <div
                                            onClick={handleSnapBack}
                                            className="block bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 cursor-pointer"
                                        >
                                            <div className="flex">
                                                <div className="w-[65%] relative min-h-[120px] bg-gray-100">
                                                    {ticket.coverImage ? (
                                                        <img
                                                            src={ticket.coverImage}
                                                            alt={ticket.eventName}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            <FontAwesomeIcon icon={faTicketAlt} className="text-3xl text-gray-300" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="w-[35%] flex flex-col items-center justify-center px-2 py-4 space-y-0.5">
                                                    <span className="text-3xl font-black text-[#1F1F1F] leading-none">{day}</span>
                                                    <span className="text-[11px] font-bold text-gray-500 uppercase">{month}</span>
                                                    <span className="text-sm font-bold text-[#1F1F1F]">{year}</span>
                                                    <span className="text-[10px] text-gray-400 font-medium">{time}</span>
                                                </div>
                                            </div>
                                            <div className="px-4 py-3 flex justify-between items-center">
                                                <div className="flex-1 min-w-0 mr-3">
                                                    <p className="font-bold text-[#1F1F1F] text-[15px] truncate">{ticket.eventName || 'Event'}</p>
                                                    <p className="text-xs text-gray-400 truncate">{ticket.venue || 'Venue'}</p>
                                                </div>
                                                <div className="flex items-center space-x-2 text-gray-300 shrink-0">
                                                    <span className="text-xs font-bold text-gray-400">{seatCount}</span>
                                                    <FontAwesomeIcon icon={faTicketAlt} className="text-sm" />
                                                    <FontAwesomeIcon icon={faChevronRight} className="text-xs" />
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <Link
                                            href={`/secure/myaccount/tickets/${ticket.ticketId}`}
                                            className="block bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 active:scale-[0.98] transition-all"
                                        >
                                            <div className="flex">
                                                <div className="w-[65%] relative min-h-[120px] bg-gray-100">
                                                    {ticket.coverImage ? (
                                                        <img
                                                            src={ticket.coverImage}
                                                            alt={ticket.eventName}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            <FontAwesomeIcon icon={faTicketAlt} className="text-3xl text-gray-300" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="w-[35%] flex flex-col items-center justify-center px-2 py-4 space-y-0.5">
                                                    <span className="text-3xl font-black text-[#1F1F1F] leading-none">{day}</span>
                                                    <span className="text-[11px] font-bold text-gray-500 uppercase">{month}</span>
                                                    <span className="text-sm font-bold text-[#1F1F1F]">{year}</span>
                                                    <span className="text-[10px] text-gray-400 font-medium">{time}</span>
                                                </div>
                                            </div>
                                            <div className="px-4 py-3 flex justify-between items-center">
                                                <div className="flex-1 min-w-0 mr-3">
                                                    <p className="font-bold text-[#1F1F1F] text-[15px] truncate">{ticket.eventName || 'Event'}</p>
                                                    <p className="text-xs text-gray-400 truncate">{ticket.venue || 'Venue'}</p>
                                                </div>
                                                <div className="flex items-center space-x-2 text-gray-300 shrink-0">
                                                    <span className="text-xs font-bold text-gray-400">{seatCount}</span>
                                                    <FontAwesomeIcon icon={faTicketAlt} className="text-sm" />
                                                    <FontAwesomeIcon icon={faChevronRight} className="text-xs" />
                                                </div>
                                            </div>
                                        </Link>
                                    )}
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="py-20 text-center">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <FontAwesomeIcon icon={faTicketAlt} className="text-3xl text-gray-300" />
                        </div>
                        <h3 className="text-xl font-black text-[#1F1F1F] mb-2">
                            {activeTab === 'upcoming' ? 'No upcoming purchases' : 'No past events'}
                        </h3>
                        <p className="text-gray-400 font-bold mb-8 px-10">
                            {activeTab === 'upcoming' ? 'Find your next live experience today!' : 'Your past events will appear here.'}
                        </p>
                        {activeTab === 'upcoming' && (
                            <button
                                onClick={() => router.push('/')}
                                className="bg-[#002B7F] text-white px-10 py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg"
                            >
                                Browse Events
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
