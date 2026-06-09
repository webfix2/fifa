"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '../../../UserContext';
import AdminLogin from '../../../components/AdminLogin';
import UserTable from '../../../components/UserTable';
import TicketTable from '../../../components/TicketTable';
import SubAdminTable from '../../../components/SubAdminTable';
import { User, Ticket } from '../../../types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faChevronRight,
    faChevronLeft,
    faUser,
    faGlobe,
    faExchangeAlt,
    faTrash,
    faLink,
    faHeadset,
    faRightFromBracket,
    faUsers
} from '@fortawesome/free-solid-svg-icons';

export default function ManageDashboard() {
    const router = useRouter();
    const {
        admin,
        users: allUsers,
        tickets: allTickets,
        setAdmin,
        fetchAllUsers,
        fetchAllTickets,
    } = useUser();

    const [loggedInAdmin, setLoggedInAdmin] = useState<string | null>(null);
    const [users, setFilteredUsers] = useState<User[]>([]);
    const [tickets, setFilteredTickets] = useState<Ticket[]>([]);
    const [activeTab, setActiveTab] = useState<'account' | 'transfers' | 'tickets' | 'management'>('account');
    const [isSessionValid, setIsSessionValid] = useState<boolean | null>(null);

    useEffect(() => {
        if (!localStorage.getItem("adminToken")) {
            setIsSessionValid(false);
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
                fetchAllTickets();
            } catch (e) {
                console.error("Error parsing admin data", e);
            }
        }
    }, [setAdmin, fetchAllUsers, fetchAllTickets, setLoggedInAdmin]);

    useEffect(() => {
        if (isSessionValid === true && loggedInAdmin && Array.isArray(allUsers)) {
            setFilteredUsers(allUsers.filter((u) => u.admin === loggedInAdmin));
        }
    }, [allUsers, loggedInAdmin, isSessionValid]);

    useEffect(() => {
        if (isSessionValid === true && loggedInAdmin && Array.isArray(allTickets)) {
            setFilteredTickets(allTickets.filter((t) => t.admin === loggedInAdmin));
        }
    }, [allTickets, loggedInAdmin, isSessionValid]);

    useEffect(() => {
        if (isSessionValid === false) {
            router.replace('/login');
        }
    }, [isSessionValid, router]);

    if (isSessionValid === false || admin === null) {
        return <AdminLogin setLoggedInAdmin={() => {}} setUsers={() => {}} />;
    }

    const MenuItem = ({ icon, label, action }: { icon: any; label: string; action?: () => void }) => (
        <button
            onClick={action}
            className="w-full flex items-center justify-between p-4 bg-white active:bg-gray-50 transition-colors"
        >
            <div className="flex items-center space-x-3">
                <FontAwesomeIcon icon={icon} className="text-[#002B7F] w-5 text-base" />
                <span className="text-sm font-bold text-[#1F1F1F]">{label}</span>
            </div>
            <FontAwesomeIcon icon={faChevronRight} className="text-gray-300 text-xs" />
        </button>
    );

    return (
        <div className="flex-1 flex flex-col min-h-full pb-32">
            {activeTab !== 'account' && (
                <div className="bg-white p-4 border-b border-gray-100 flex items-center sticky top-[72px] z-40">
                    <button onClick={() => setActiveTab('account')} className="mr-4 text-gray-500 hover:text-[#1F1F1F] transition-colors">
                        <FontAwesomeIcon icon={faChevronLeft} />
                    </button>
                    <h2 className="text-base font-bold text-[#1F1F1F]">
                        {activeTab === 'management' ? 'Management' : activeTab === 'transfers' ? 'Transfers' : 'Tickets'}
                    </h2>
                </div>
            )}

            {activeTab === 'account' && (
                <>
                    {/* Email Header */}
                    <div className="px-6 pt-8 pb-6">
                        <button onClick={() => router.back()} className="mb-4 text-gray-500">
                            <FontAwesomeIcon icon={faChevronLeft} className="text-lg" />
                        </button>
                        <h1 className="text-2xl font-black text-[#1F1F1F] break-all">
                            {admin.accountEmail || 'user@virtualmail.com'}
                        </h1>
                    </div>

                    <div className="px-4 space-y-4 pb-8">
                        {/* Card 1: Profile & Language */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <MenuItem icon={faUser} label="My profile" action={() => router.push('/secure/myaccount/personal-details')} />
                            <div className="border-t border-gray-50" />
                            <MenuItem icon={faGlobe} label="Language" />
                        </div>

                        {/* Card 2: Resale & Deleted */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <MenuItem icon={faExchangeAlt} label="Ticket(s) submitted for resale/exchange" />
                            <div className="border-t border-gray-50" />
                            <MenuItem icon={faTrash} label="Deleted" />
                        </div>

                        {/* Card 3: Info & Support */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <MenuItem icon={faLink} label="More information" action={() => setActiveTab('management')} />
                            <div className="border-t border-gray-50" />
                            <MenuItem icon={faHeadset} label="Support details" />
                        </div>

                        {/* Card 4: Logout */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <MenuItem
                                icon={faRightFromBracket}
                                label="Log Out"
                                action={() => {
                                    localStorage.removeItem("loggedInAdmin");
                                    localStorage.removeItem("adminData");
                                    localStorage.removeItem("adminToken");
                                    router.push('/login');
                                }}
                            />
                        </div>
                    </div>
                </>
            )}

            {activeTab === 'transfers' && <div className="p-4"><UserTable users={users} tickets={tickets} /></div>}
            {activeTab === 'tickets' && <div className="p-4"><TicketTable tickets={tickets} users={users} /></div>}
            {activeTab === 'management' && (
                <div className="p-4 space-y-6">
                    {admin?.role === 'OWNER' && <SubAdminTable />}
                    <div className="bg-white p-8 rounded-2xl border border-gray-100 text-center shadow-sm">
                        <FontAwesomeIcon icon={faUsers} className="text-[#002B7F] text-5xl mb-4" />
                        <h3 className="text-[#1F1F1F] text-xl font-black">Management Portal</h3>
                        <p className="text-gray-400 mt-2 font-bold text-sm">Manage your sub-admins, tickets and transfers from here.</p>
                    </div>
                </div>
            )}
        </div>
    );
}
