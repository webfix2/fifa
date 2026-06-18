"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '../../../UserContext';
import { Ticket } from '../../../types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTicketAlt, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';

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

    const [localAdmin, setLocalAdmin] = useState<string | null>(null);
    const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([]);
    const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
    const [isSessionValid, setIsSessionValid] = useState<boolean | null>(null);

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

                if (activeTab === 'upcoming') {
                    return t.eventStatus === 'ACTIVE' || t.eventStatus === 'WAITING';
                } else {
                    return t.eventStatus === 'PAST';
                }
            });
            setFilteredTickets(filtered);
        }
    }, [allTickets, localAdmin, isSessionValid, activeTab]);

    if (isSessionValid === null) return null;

    const upcomingCount = allTickets?.filter((t) => {
        const matchesAdmin = t.admin === localAdmin;
        const isNotDeleted = !t.deletedSTAMP || t.deletedSTAMP.trim() === "";
        return matchesAdmin && isNotDeleted && (t.eventStatus === 'ACTIVE' || t.eventStatus === 'WAITING');
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
                    <div className="w-10 h-10 bg-[#002B7F] rounded-lg flex items-center justify-center shrink-0">
                        <svg viewBox="0 0 24 24" className="w-6 h-6 text-white" fill="currentColor">
                            <path d="M12 2L9 7H3l5 4-2 7 6-4 6 4-2-7 5-4h-6L12 2z"/>
                        </svg>
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

                        return (
                            <Link
                                key={i}
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
