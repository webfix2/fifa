"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useUser } from '../../../../UserContext';
import { Ticket } from '../../../../types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faCalendarAlt, faMapMarkerAlt, faChevronRight } from '@fortawesome/free-solid-svg-icons';
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
            <header className="bg-white text-[#1F1F1F] px-4 py-2 fixed top-0 left-0 right-0 z-50 border-b border-gray-100 pt-[env(safe-area-inset-top)]">
                <div className="flex items-center justify-between">
                    {currentSeatIndex > 0 ? (
                        <button onClick={prevSeat} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-all">
                            <FontAwesomeIcon icon={faChevronLeft} className="text-lg text-gray-600" />
                        </button>
                    ) : (
                        <Link href="/secure/myaccount/tickets" className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-all">
                            <FontAwesomeIcon icon={faChevronLeft} className="text-lg text-gray-600" />
                        </Link>
                    )}
                    <div className="text-center select-none">
                        <p className="text-[14px] font-black text-[#1F1F1F] tracking-wide">
                            Ticket {currentSeatIndex + 1}{seats.length > 1 ? ` of ${seats.length}` : ''}
                        </p>
                        {seats.length > 1 && (
                            <div className="flex justify-center space-x-1 mt-0.5">
                                {seats.map((_: string, idx: number) => (
                                    <div key={idx} className={`rounded-full transition-all duration-300 ${currentSeatIndex === idx ? 'w-3 h-1.5 bg-[#002B7F]' : 'w-1.5 h-1.5 bg-gray-300'}`} />
                                ))}
                            </div>
                        )}
                    </div>
                    {seats.length > 1 ? (
                        <button onClick={nextSeat} disabled={currentSeatIndex === seats.length - 1} className="w-8 h-8 flex items-center justify-center rounded-full disabled:opacity-30 hover:bg-gray-100 transition-all">
                            <FontAwesomeIcon icon={faChevronRight} className="text-sm text-gray-600" />
                        </button>
                    ) : (
                        <div className="w-8" />
                    )}
                </div>
            </header>

            <div className="flex-1 overflow-y-auto px-4 pt-16 pb-6 space-y-6">
                {/* Combined Ticket Status & QR Card */}
                <div className="bg-[#faf5f7] rounded-3xl shadow-sm overflow-hidden border border-gray-100">
                    {/* Watermarked Info Banner */}
                    <div className="relative bg-white px-4 py-4 flex flex-col items-center justify-center min-h-[90px] overflow-hidden border-b border-gray-100">
                        {/* Solid blue vertical bars on left and right sides matching references */}
                        <div className="absolute left-0 top-0 bottom-0 w-[12px] bg-[#026CDF] z-20" />
                        <div className="absolute right-0 top-0 bottom-0 w-[12px] bg-[#026CDF] z-20" />

                        {/* Faded QR code watermark in background */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-[0.08] pointer-events-none select-none">
                            <img
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=WATERMARK`}
                                alt="Watermark QR"
                                className="w-40 h-40 object-contain"
                            />
                        </div>
                        {/* Info Icon in top-right */}
                        <div className="absolute top-3 right-6 text-[#026CDF] text-[10px] font-black w-4 h-4 border-[1.5px] border-[#026CDF] rounded-full flex items-center justify-center select-none">
                            i
                        </div>
                        {/* Text Content */}
                        <div className="text-center relative z-10 px-6">
                            <p className="text-[#002B7F] text-xs font-black uppercase tracking-wider">THE TICKET IS NOT YET READY</p>
                            <p className="text-gray-500 text-[10px] font-bold mt-1">It will be activated on the day of the match</p>
                        </div>
                    </div>

                    {/* Badge Body */}
                    <div className="relative flex flex-col items-center py-6 px-6">
                        {/* Seat Number / Index - top right small circular badge */}
                        <div className="absolute top-4 right-6 w-8 h-8 rounded-full bg-[#E5E7EB] flex items-center justify-center select-none shadow-sm z-10">
                            <span className="text-[#1F1F1F] text-xs font-black tracking-tight">{seat}</span>
                        </div>

                        {/* FIFA Badge */}
                        <div className="bg-[#1F1F1F] rounded-[24px] px-8 py-5 text-center select-none w-[140px] shadow-sm flex flex-col items-center justify-center">
                            <p className="text-white text-[14px] font-black tracking-[0.12em] leading-none uppercase">FIFA</p>
                            <p className="text-white text-[9px] font-black tracking-[0.1em] mt-1.5 leading-none uppercase">WORLD CUP</p>
                            <p className="text-white text-[14px] font-black tracking-[0.12em] mt-1.5 leading-none uppercase">2026</p>
                        </div>
                    </div>
                </div>

                {/* Match Info */}
                <div className="text-center space-y-2">
                    <h2 className="text-2xl font-black text-[#1F1F1F]">{ticket.eventName || 'Match'}</h2>
                    <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                        <FontAwesomeIcon icon={faCalendarAlt} className="text-gray-500" />
                        <span>{formatDate(ticket.dateTime)}</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                        <FontAwesomeIcon icon={faMapMarkerAlt} className="text-gray-500" />
                        <span>{ticket.venue}{ticket.location ? `, ${ticket.location}` : ''}</span>
                    </div>
                </div>

                {/* Entry Details Grid */}
                <div className="grid grid-cols-3 gap-3">
                    <div className="border border-gray-300 rounded-xl p-3 text-center bg-gray-50">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider mb-1">ENTRANCE</p>
                        <p className="text-lg font-black text-[#1F1F1F]">{ticket.entrance || '--'}</p>
                    </div>
                    <div className="border border-gray-300 rounded-xl p-3 text-center bg-gray-50">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider mb-1">GATE</p>
                        <p className="text-lg font-black text-[#1F1F1F]">{ticket.gate || '--'}</p>
                    </div>
                    <div className="border border-gray-300 rounded-xl p-3 text-center bg-gray-50">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider mb-1">SECTION</p>
                        <p className="text-lg font-black text-[#1F1F1F]">{ticket.sectionNo || '--'}</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 max-w-[65%] mx-auto">
                    <div className="border border-gray-300 rounded-xl p-3 text-center bg-gray-50">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider mb-1">ROW</p>
                        <p className="text-lg font-black text-[#1F1F1F]">{ticket.row || '--'}</p>
                    </div>
                    <div className="border border-gray-300 rounded-xl p-3 text-center bg-gray-50">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider mb-1">SEAT</p>
                        <p className="text-lg font-black text-[#1F1F1F]">{seat}</p>
                    </div>
                </div>

                {/* Dotted Divider */}
                <div className="border-t border-dotted border-gray-300" />

                {/* Ticket Holder */}
                <div className="flex items-center justify-between px-2">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">TICKET HOLDER</span>
                    <span className="text-sm font-bold text-[#1F1F1F]">{ticket.ticketHolder || '* FIFA Collect by Modex *'}</span>
                </div>

                {/* Ticket Category */}
                <div className="flex items-center justify-between px-2">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">CATEGORY</span>
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
                    className="w-12 h-12 bg-[#1F1F1F] rounded-full flex flex-col items-center justify-center shadow-xl gap-[3px]"
                >
                    <span className="w-[4px] h-[4px] bg-white rounded-full"></span>
                    <span className="w-[4px] h-[4px] bg-white rounded-full"></span>
                    <span className="w-[4px] h-[4px] bg-white rounded-full"></span>
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
