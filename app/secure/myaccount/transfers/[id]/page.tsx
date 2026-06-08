"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useUser } from '../../../../UserContext';
import { User } from '../../../../types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faExchangeAlt,
    faChevronLeft,
    faUser,
    faCalendarAlt,
    faMapMarkerAlt,
    faExclamationTriangle,
    faCheckCircle,
    faClock,
    faTicketAlt
} from '@fortawesome/free-solid-svg-icons';

export default function TransferDetailsPage() {
    const router = useRouter();
    const params = useParams();
    const transferId = params.id as string;
    const { admin, users, fetchAllUsers, setAdmin } = useUser();

    const APP_SCRIPT_POST_URL = process.env.NEXT_PUBLIC_APP_SCRIPT_URL || "";

    const [isActionLoading, setIsActionLoading] = useState(false);
    const [transfer, setTransfer] = useState<User | null>(null);
    const [isSessionValid, setIsSessionValid] = useState<boolean | null>(null);

    useEffect(() => {
        if (!localStorage.getItem("adminToken")) {
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
                fetchAllUsers();
            } catch (e) {
                console.error("Error parsing admin data", e);
            }
        }
    }, [setAdmin, router, fetchAllUsers]);

    useEffect(() => {
        if (isSessionValid && users.length > 0) {
            const foundTransfer = users.find(u => u.userId === transferId || u.sn === transferId);
            if (foundTransfer) setTransfer(foundTransfer);
        }
    }, [users, transferId, isSessionValid]);

    const handleDisputeTransfer = () => {
        if (!transfer || !APP_SCRIPT_POST_URL) return;
        if (window.confirm("Are you sure you want to dispute this ticket transfer?")) {
            setIsActionLoading(true);

            let payload = new URLSearchParams();
            payload.append("action", "retractTicket");
            payload.append("userId", transfer.userId);
            payload.append("cancelledSTAMP", "RETRACTED");

            fetch(APP_SCRIPT_POST_URL, {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: payload.toString()
            }).then(() => {
                setTimeout(() => {
                    fetchAllUsers(); 
                    setIsActionLoading(false);
                    setTransfer({...transfer, systemStatus: 'RETRACTED'});
                }, 1000);
            }).catch(error => {
                console.error("Error disputing ticket:", error);
                fetchAllUsers();
                setIsActionLoading(false);
            });
        }
    };

    if (isSessionValid === null || !transfer) return null;

    const getStatusTheme = (status: string) => {
        switch (status) {
            case 'COMPLETED':
                return { icon: faCheckCircle, color: 'text-green-500', bg: 'bg-green-50', border: 'border-green-100', banner: 'bg-green-600' };
            case 'DECLINED':
            case 'CANCELLED':
            case 'RETRACTED':
                return { icon: faExclamationTriangle, color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-100', banner: 'bg-red-600' };
            default:
                return { icon: faClock, color: 'text-[#026CDF]', bg: 'bg-amber-50', border: 'border-amber-100', banner: 'bg-[#001B41]' };
        }
    };

    const theme = getStatusTheme(transfer.systemStatus);

    return (
        <div className="min-h-screen bg-[#f4f7f9] flex flex-col font-sans">
            {/* Header - Reverted to match previous style but keeping the fix */}
            <header className="bg-white text-[#001B41] border-b border-gray-100 px-4 py-3 fixed top-0 left-0 right-0 z-50">
                <div className="max-w-3xl mx-auto flex items-center justify-between">
                    <button onClick={() => router.back()} className="text-[#001B41] hover:opacity-70 transition-opacity p-1">
                        <FontAwesomeIcon icon={faChevronLeft} className="text-xl" />
                    </button>
                    <h1 className="text-lg font-black tracking-tight uppercase">Transfer Details</h1>
                    <button className="text-sm font-bold text-[#001B41] hover:opacity-70 transition-opacity">Help</button>
                </div>
            </header>

            <main className="flex-1 w-full max-w-3xl mx-auto pt-[72px] p-4 space-y-4 pb-20">
                
                {/* Status Banner */}
                <div className={`${theme.banner} rounded-[24px] p-6 text-white shadow-lg`}>
                    <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                            <FontAwesomeIcon icon={theme.icon} className="text-2xl" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black uppercase tracking-wide">{transfer.systemStatus || 'PENDING'}</h2>
                            <p className="text-white/80 text-xs font-bold mt-1">
                                Reference: {transfer.userId?.substring(0, 8).toUpperCase()}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Dynamic Message Status */}
                {(transfer.titleStatus || transfer.messageStatus) && (
                    <div className={`${theme.bg} ${theme.border} border rounded-[24px] p-6 shadow-sm`}>
                        <h3 className={`text-sm font-black uppercase tracking-wider mb-2 ${theme.color}`}>
                            {transfer.titleStatus || 'Status Update'}
                        </h3>
                        <p className="text-gray-600 text-sm font-bold leading-relaxed mb-4">
                            {transfer.messageStatus || 'Your transfer is being processed by the system. Please check back later for updates.'}
                        </p>
                        {['WAITING APPROVAL', 'WAITING COMPLETION', 'COMPLETED'].includes(transfer.systemStatus) && (
                            <button 
                                onClick={handleDisputeTransfer}
                                disabled={isActionLoading}
                                className="w-full sm:w-auto bg-white border-2 border-red-100 text-red-600 px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-red-50 transition-all flex items-center justify-center space-x-2 shadow-sm active:scale-95 disabled:opacity-50"
                            >
                                {isActionLoading ? 'Processing...' : 'Dispute Transfer'}
                            </button>
                        )}
                    </div>
                )}

                {/* Event Details Card */}
                <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden">
                    <div className="bg-[#001B41] px-6 py-3">
                        <p className="text-[10px] font-black text-white/60 uppercase tracking-widest">Event Information</p>
                    </div>
                    <div className="p-6">
                        <h3 className="text-xl font-black text-[#001B41] mb-4">{transfer.eventName}</h3>
                        <div className="space-y-3">
                            <div className="flex items-center space-x-3 text-gray-500">
                                <FontAwesomeIcon icon={faCalendarAlt} className="w-4 text-[#026CDF]" />
                                <span className="text-sm font-bold">{transfer.dateTime}</span>
                            </div>
                            <div className="flex items-center space-x-3 text-gray-500">
                                <FontAwesomeIcon icon={faMapMarkerAlt} className="w-4 text-[#026CDF]" />
                                <span className="text-sm font-bold">{transfer.venue}, {transfer.location}</span>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Seats</p>
                            <p className="text-sm font-black text-[#001B41]">{transfer.seatNumbers}</p>
                        </div>
                        <div>
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Section</p>
                            <p className="text-sm font-black text-[#001B41]">{transfer.section} {transfer.sectionNo}</p>
                        </div>
                    </div>
                </div>

                {/* Recipient Details */}
                <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-6">
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Recipient Information</h4>
                    <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-[#001B41]">
                            <FontAwesomeIcon icon={faUser} className="text-xl" />
                        </div>
                        <div>
                            <p className="font-black text-[#001B41]">{transfer.fullName}</p>
                            <p className="text-sm font-bold text-gray-400">{transfer.emailAddress}</p>
                        </div>
                    </div>
                </div>

                {/* Progress Tracking */}
                {transfer.percentageStatus && (
                    <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-6">
                        <div className="flex justify-between items-center mb-2">
                            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Progress</h4>
                            <span className="text-sm font-black text-[#001B41]">{transfer.percentageStatus}%</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                            <div 
                                className="bg-[#026CDF] h-2 rounded-full transition-all duration-1000" 
                                style={{ width: `${transfer.percentageStatus}%` }}
                            />
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
