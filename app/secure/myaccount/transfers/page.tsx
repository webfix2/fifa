"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '../../../UserContext';
import { User } from '../../../types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faExchangeAlt,
    faUser,
    faTicketAlt,
    faChevronRight,
    faSearch
} from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';

export default function TransfersPage() {
    const router = useRouter();
    const {
        admin,
        users,
        fetchAllUsers,
        setAdmin,
    } = useUser();

    const [loggedInAdmin, setLoggedInAdmin] = useState<string | null>(null);
    const [filteredTransfers, setFilteredTransfers] = useState<User[]>([]);
    const [isSessionValid, setIsSessionValid] = useState<boolean | null>(null);
    const [activeTab, setActiveTab] = useState<'pending' | 'completed'>('pending');
    const [searchTerm, setSearchTerm] = useState('');

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
                setLoggedInAdmin(adminUsername);
                fetchAllUsers();
            } catch (e) {
                console.error("Error parsing admin data", e);
            }
        }
    }, [setAdmin, router, fetchAllUsers]);


    useEffect(() => {
        if (isSessionValid === true && loggedInAdmin && Array.isArray(users)) {
            let transfers = users.filter(u => 
                u.admin === loggedInAdmin && 
                u.userPlatform?.toLowerCase() === 'ticketmaster'
            );

            if (activeTab === 'pending') {
                transfers = transfers.filter(u => 
                    u.systemStatus === 'WAITING APPROVAL' || 
                    u.systemStatus === 'WAITING COMPLETION' ||
                    !u.systemStatus
                );
            } else {
                transfers = transfers.filter(u => u.systemStatus === 'COMPLETED');
            }

            if (searchTerm.trim()) {
                const term = searchTerm.toLowerCase();
                transfers = transfers.filter(u => 
                    u.fullName?.toLowerCase().includes(term) ||
                    u.emailAddress?.toLowerCase().includes(term) ||
                    u.ticketId?.toLowerCase().includes(term)
                );
            }

            setFilteredTransfers(transfers);
        }
    }, [users, loggedInAdmin, isSessionValid, activeTab, searchTerm]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'WAITING APPROVAL': return 'bg-amber-100 text-amber-600 border-amber-200';
            case 'WAITING COMPLETION': return 'bg-blue-100 text-[#026CDF] border-blue-200';
            case 'COMPLETED': return 'bg-green-100 text-green-600 border-green-200';
            default: return 'bg-gray-100 text-gray-400 border-gray-200';
        }
    };

    if (isSessionValid === null) return null;

    return (
        <div className="flex-1 w-full flex flex-col bg-gray-50 min-h-full pb-32">
            {/* Tabs */}
            <div className="flex bg-[#1F1F1F] border-b border-white/5 sticky top-[72px] z-40">
                <button
                    onClick={() => setActiveTab('pending')}
                    className={`flex-1 py-4 font-black text-[12px] uppercase tracking-[0.1em] transition-all border-b-[3px] whitespace-nowrap ${activeTab === 'pending' ? 'border-white text-white' : 'border-transparent text-white/40'}`}
                >
                    Pending ({activeTab === 'pending' ? filteredTransfers.length : '?'})
                </button>
                <button
                    onClick={() => setActiveTab('completed')}
                    className={`flex-1 py-4 font-black text-[12px] uppercase tracking-[0.1em] transition-all border-b-[3px] whitespace-nowrap ${activeTab === 'completed' ? 'border-white text-white' : 'border-transparent text-white/40'}`}
                >
                    Completed
                </button>
            </div>

            {/* Search Bar */}
            <div className="p-4">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search transfers..."
                        className="w-full p-4 pl-12 bg-white border border-gray-200 rounded-xl text-[#1F1F1F] placeholder-gray-400 font-bold text-sm outline-none shadow-sm focus:ring-2 focus:ring-[#026CDF]/20 transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <FontAwesomeIcon icon={faSearch} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                </div>
            </div>

            {/* Transfer List */}
            <div className="flex-1 px-4 space-y-4">
                {filteredTransfers.length > 0 ? (
                    filteredTransfers.map((transfer, i) => (
                        <Link 
                            key={i} 
                            href={`/secure/myaccount/transfers/${transfer.userId}`} 
                            className="block bg-white rounded-xl shadow-[0_4px_15px_rgba(0,0,0,0.05)] border border-gray-100 overflow-hidden active:scale-[0.98] transition-all"
                        >
                            <div className="p-5 flex items-start justify-between">
                                <div className="flex-1 min-w-0 mr-4">
                                    <div className="flex items-center space-x-3 mb-3">
                                        <div className="w-10 h-10 rounded-full bg-[#026CDF]/5 text-[#026CDF] flex items-center justify-center flex-shrink-0">
                                            <FontAwesomeIcon icon={faUser} className="text-sm" />
                                        </div>
                                        <div>
                                            <p className="font-black text-[#1F1F1F] text-base truncate">{transfer.fullName}</p>
                                            <p className="text-xs font-bold text-gray-400 truncate">{transfer.emailAddress}</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-4 text-[11px] font-black text-gray-400 uppercase tracking-widest mt-2">
                                        <span className="flex items-center">
                                            <FontAwesomeIcon icon={faTicketAlt} className="mr-1.5 text-[#026CDF]" />
                                            {transfer.ticketId}
                                        </span>
                                        <span className="flex items-center">
                                            <FontAwesomeIcon icon={faExchangeAlt} className="mr-1.5 text-[#026CDF]" />
                                            {transfer.seatNumbers}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end space-y-3">
                                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest whitespace-nowrap border ${getStatusColor(transfer.systemStatus)}`}>
                                        {transfer.systemStatus || 'PENDING'}
                                    </span>
                                    <FontAwesomeIcon icon={faChevronRight} className="text-gray-300 text-xs" />
                                </div>
                            </div>
                        </Link>
                    ))
                ) : (
                    <div className="py-20 text-center bg-white rounded-xl shadow-sm border border-gray-100">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <FontAwesomeIcon icon={faExchangeAlt} className="text-3xl text-gray-200" />
                        </div>
                        <h3 className="text-xl font-black text-[#1F1F1F] mb-2 tracking-tighter">No transfers found</h3>
                        <p className="text-gray-400 font-bold px-12">
                            {activeTab === 'pending' 
                                ? `You don't have any pending transfers at the moment.` 
                                : 'No completed transfers found.'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
