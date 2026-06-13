"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useUser } from '../../../../UserContext';
import { Ticket } from '../../../../types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faCalendarAlt, faMapMarkerAlt, faUniversalAccess, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';
import TransferModal from '../../../../components/TransferModal';

function formatDate(dt: string): string {
    if (!dt) return '';
    try {
        const d = new Date(dt);
        if (isNaN(d.getTime())) return dt;
        const day = d.getDate();
        const month = d.toLocaleString('en-US', { month: 'short' }).toUpperCase();
        const year = d.getFullYear();
        const time = d.toLocaleString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
        return `${day} ${month} ${year}, ${time}`;
    } catch {
        return dt;
    }
}

export default function TicketDetailsAccountPage() {
    const router = useRouter();
    const params = useParams();
    const ticketId = params.id as string;

    const {
        admin,
        tickets: allTickets,
        fetchAllTickets,
        setAdmin,
        setTickets,
        setLoggedInAdmin,
        setUsers,
    } = useUser();

    const [ticket, setTicket] = useState<Ticket | null>(null);
    const [isSessionValid, setIsSessionValid] = useState<boolean | null>(null);
    const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
    const [isFabOpen, setIsFabOpen] = useState(false);
    const [currentSeatIndex, setCurrentSeatIndex] = useState(0);

    useEffect(() => {
        const adminToken = localStorage.getItem("adminToken");
        if (!adminToken) {
            return void router.replace('/login');
        }
        setIsSessionValid(true);
        const adminUsername = localStorage.getItem("loggedInAdmin");
        const adminData = localStorage.getItem('adminData');
        if (adminUsername && adminData) {
            try {
                const parsedAdminData = JSON.parse(adminData);
                setAdmin(parsedAdminData);
                setLoggedInAdmin(adminUsername);
                if (allTickets.length === 0) fetchAllTickets();
            } catch (e) {
                console.error("Error parsing admin data", e);
            }
        } else if (allTickets.length === 0 && admin) {
            fetchAllTickets();
        }
    }, [setAdmin, router, allTickets.length, fetchAllTickets, setLoggedInAdmin]);

    useEffect(() => {
        if (isSessionValid && allTickets.length > 0) {
            const foundTicket = allTickets.find(t => t.ticketId === ticketId || t.sn === ticketId);
            if (foundTicket) {
                setTicket(foundTicket);
            }
        }
    }, [allTickets, ticketId, isSessionValid]);

    if (isSessionValid === null || !ticket) return null;

    const seats = ticket.seatNumbers ? ticket.seatNumbers.split(',').map(s => s.trim()).filter(Boolean) : [ticket.seat || '1'];
    const seat = seats[currentSeatIndex] || seats[0] || '--';
    const nextSeat = () => { if (currentSeatIndex < seats.length - 1) setCurrentSeatIndex(p => p + 1); };
    const prevSeat = () => { if (currentSeatIndex > 0) setCurrentSeatIndex(p => p - 1); };

    return (
        <div className="min-h-screen bg-[#F5F5F5] flex flex-col pt-[env(safe-area-inset-top)]">
            {/* Header with seat navigation */}
            <header className="bg-[#001C4B] text-white px-4 py-2 fixed top-0 left-0 right-0 z-50 pt-[env(safe-area-inset-top)]">
                <div className="flex items-center justify-between">
                    {currentSeatIndex > 0 ? (
                        <button onClick={prevSeat} className="w-8 h-8 flex items-center justify-center rounded-full text-white/80 hover:bg-white/10 transition-all">
                            <FontAwesomeIcon icon={faChevronLeft} className="text-lg" />
                        </button>
                    ) : (
                        <Link href="/secure/myaccount/tickets" className="w-8 h-8 flex items-center justify-center rounded-full text-white/80 hover:bg-white/10 transition-all">
                            <FontAwesomeIcon icon={faChevronLeft} className="text-lg" />
                        </Link>
                    )}
                    <div className="text-center select-none">
                        <p className="text-[14px] font-black text-white tracking-wide">
                            Ticket {currentSeatIndex + 1}{seats.length > 1 ? ` of ${seats.length}` : ''}
                        </p>
                        {seats.length > 1 && (
                            <div className="flex justify-center space-x-1 mt-0.5">
                                {seats.map((_: string, idx: number) => (
                                    <div key={idx} className={`rounded-full transition-all duration-300 ${currentSeatIndex === idx ? 'w-3 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/30'}`} />
                                ))}
                            </div>
                        )}
                    </div>
                    {seats.length > 1 ? (
                        <button onClick={nextSeat} disabled={currentSeatIndex === seats.length - 1} className="w-8 h-8 flex items-center justify-center rounded-full text-white/70 disabled:opacity-20 hover:bg-white/10 transition-all">
                            <FontAwesomeIcon icon={faChevronRight} className="text-sm" />
                        </button>
                    ) : (
                        <div className="w-8" />
                    )}
                </div>
            </header>

            <div className="flex-1 overflow-y-auto px-4 pt-16 pb-6 space-y-6">
                {/* QR Code Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="flex">
                        <div className="w-1 bg-[#20D4C8] rounded-l-2xl" />
                        <div className="flex-1 flex flex-col items-center py-3 px-4">
                            <div className="mb-1 self-start">
                                <FontAwesomeIcon icon={faUniversalAccess} className="text-gray-400 text-lg" />
                            </div>
                            <div className="flex items-center justify-center">
                                <div className="overflow-hidden w-28 h-28">
                                    <div
                                        className="flex transition-transform duration-300"
                                        style={{ transform: `translateX(-${currentSeatIndex * 100}%)` }}
                                    >
                                        {seats.map((s, i) => (
                                            <div key={i} className="min-w-full flex items-center justify-center">
                                                <img
                                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`${ticket.ticketId}-${s}`)}`}
                                                    alt={`QR Code for seat ${s}`}
                                                    className="w-28 h-28 rounded-lg"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="w-1 bg-[#20D4C8] rounded-r-2xl" />
                    </div>
                </div>

                {/* FIFA Branding */}
                <div className="text-center">
                    <p className="text-lg font-black text-[#1F1F1F] tracking-tight leading-none">FIFA</p>
                    <p className="text-sm font-black text-[#1F1F1F] tracking-tight">WORLD CUP</p>
                    <p className="text-lg font-black text-[#1F1F1F] tracking-tight">2026</p>
                </div>

                {/* Match Info */}
                <div className="text-center space-y-2">
                    <h2 className="text-xl font-black text-[#1F1F1F]">{ticket.eventName || 'Match'}</h2>
                    <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                        <FontAwesomeIcon icon={faCalendarAlt} className="text-gray-400" />
                        <span>{formatDate(ticket.dateTime)}</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                        <FontAwesomeIcon icon={faMapMarkerAlt} className="text-gray-400" />
                        <span>{ticket.venue}{ticket.location ? `, ${ticket.location}` : ''}</span>
                    </div>
                </div>

                {/* Entry Details Grid */}
                <div className="grid grid-cols-3 gap-3">
                    <div className="border border-gray-200 rounded-xl p-3 text-center">
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">ENTRANCE</p>
                        <p className="text-lg font-black text-[#1F1F1F]">{ticket.entrance || '--'}</p>
                    </div>
                    <div className="border border-gray-200 rounded-xl p-3 text-center">
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">HOSPITALITY AREA</p>
                        <p className="text-sm font-black text-[#1F1F1F]">{ticket.hospitalityArea || '--'}</p>
                    </div>
                    <div className="border border-gray-200 rounded-xl p-3 text-center">
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">GATE</p>
                        <p className="text-lg font-black text-[#1F1F1F]">{ticket.gate || '--'}</p>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                    <div className="border border-gray-200 rounded-xl p-3 text-center">
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">SUITE</p>
                        <p className="text-sm font-black text-[#1F1F1F]">{ticket.sectionNo || '--'}</p>
                    </div>
                    <div className="border border-gray-200 rounded-xl p-3 text-center">
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">ROW</p>
                        <p className="text-lg font-black text-[#1F1F1F]">{ticket.row || '--'}</p>
                    </div>
                    <div className="border border-gray-200 rounded-xl p-3 text-center">
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">SEAT</p>
                        <p className="text-lg font-black text-[#1F1F1F]">{seat}</p>
                    </div>
                </div>

                {/* Dotted Divider */}
                <div className="border-t border-dotted border-gray-300" />

                {/* Ticket Category */}
                <div className="flex items-center justify-between px-2">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">TICKET CATEGORY</span>
                    <span className="text-sm font-bold text-[#1F1F1F]">{ticket.section || 'Standard'}</span>
                </div>
            </div>

            {/* FAB */}
            <div className="fixed bottom-24 right-4 z-[110]">
                {isFabOpen && (
                    <div className="mb-3 space-y-2 animate-in slide-in-from-bottom-2 duration-200">
                        <button
                            onClick={() => { setIsFabOpen(false); setIsTransferModalOpen(true); }}
                            className="flex items-center space-x-2 bg-[#B8B4F8] text-white pl-4 pr-6 py-3 rounded-full shadow-lg text-sm font-bold"
                        >
                            <span>&#9654;</span>
                            <span>Send</span>
                        </button>
                        <button
                            onClick={() => { setIsFabOpen(false); alert('Resale/Exchange coming soon'); }}
                            className="flex items-center space-x-2 bg-[#B8B4F8] text-white pl-4 pr-6 py-3 rounded-full shadow-lg text-sm font-bold"
                        >
                            <span>&#8635;</span>
                            <span>Resale/Exchange</span>
                        </button>
                    </div>
                )}
                <button
                    onClick={() => setIsFabOpen(!isFabOpen)}
                    className="w-14 h-14 bg-[#B8B4F8] rounded-full flex items-center justify-center shadow-xl text-white text-xl"
                >
                    {isFabOpen ? '×' : '+'}
                </button>
            </div>

            <TransferModal
                isOpen={isTransferModalOpen}
                onClose={() => setIsTransferModalOpen(false)}
                ticket={ticket}
            />
        </div>
    );
}
