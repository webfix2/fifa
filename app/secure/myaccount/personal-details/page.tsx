"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '../../../UserContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faUserCircle,
    faSignOutAlt,
    faBars,
    faTimes,
    faTicketAlt,
    faCog,
    faShieldAlt,
    faQuestionCircle,
    faChevronLeft,
    faExchangeAlt,
    faSave,
    faTimesCircle,
    faCheckCircle
} from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';
import Sidebar from '../../../components/Sidebar';

const APP_SCRIPT_POST_URL = process.env.NEXT_PUBLIC_APP_SCRIPT_URL || "https://script.google.com/macros/s/AKfycbxcoCDXcWlKPDbttlFf2eR_EeuMkfupy5dfgIOklM1ShEZ30gfD3wzZZOxkKV4xIWEl/exec";

export default function PersonalDetailsPage() {
    const router = useRouter();
    const { admin, setAdmin } = useUser();
    
    const [isSessionValid, setIsSessionValid] = useState<boolean | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [formData, setFormData] = useState({
        accountName: '',
        accountEmail: '',
        accountStateCountry: '',
        adminSettings: '{}',
        telegramId: '',
    });

    useEffect(() => {
        if (!localStorage.getItem("adminToken")) {
            router.replace('/login');
            return;
        }
        setIsSessionValid(true);
        const adminData = localStorage.getItem('adminData');
        if (adminData) {
            try {
                const parsed = JSON.parse(adminData);
                let settingsStr = parsed.adminSettings || '{}';
                let settingsObj = {};
                try { settingsObj = JSON.parse(settingsStr); } catch (e) {}
                setFormData({
                    accountName: parsed.accountName || '',
                    accountEmail: parsed.accountEmail || '',
                    accountStateCountry: parsed.accountStateCountry || '',
                    adminSettings: settingsStr,
                    telegramId: (settingsObj as any).telegramId || '',
                });
            } catch (e) {
                console.error("Error parsing admin data", e);
            }
        }
    }, [router]);

    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        if (!admin) return;
        setSaving(true);
        setMessage(null);

        try {
            let settingsObj: any = {};
            try { settingsObj = JSON.parse(formData.adminSettings); } catch (e) { settingsObj = {}; }
            settingsObj.telegramId = formData.telegramId;
            const finalAdminSettings = JSON.stringify(settingsObj);

            const payload = new URLSearchParams();
            payload.append("action", "updateAdmin");
            payload.append("adminId", admin.adminId);
            payload.append("accountName", formData.accountName);
            payload.append("accountEmail", formData.accountEmail);
            payload.append("accountStateCountry", formData.accountStateCountry);
            payload.append("adminSettings", finalAdminSettings);

            const response = await fetch(APP_SCRIPT_POST_URL, {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: payload.toString()
            });

            if (response.ok) {
                const updatedAdmin = { 
                    ...admin, 
                    accountName: formData.accountName,
                    accountEmail: formData.accountEmail,
                    accountStateCountry: formData.accountStateCountry,
                    adminSettings: finalAdminSettings
                };
                setAdmin(updatedAdmin);
                localStorage.setItem("adminData", JSON.stringify(updatedAdmin));
                setFormData(prev => ({ ...prev, adminSettings: finalAdminSettings }));
                setMessage({ type: 'success', text: 'Personal details updated successfully!' });
                setTimeout(() => setMessage(null), 3000);
            } else {
                const data = await response.json();
                setMessage({ type: 'error', text: data.error || 'Failed to update. Please try again.' });
            }
        } catch (error) {
            console.error("Error updating admin details:", error);
            setMessage({ type: 'error', text: 'An error occurred while saving.' });
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("loggedInAdmin");
        localStorage.removeItem("adminData");
        localStorage.removeItem("adminToken");
        setAdmin(null);
        router.push('/login');
    };

    const sidebarItems = [
        { icon: faTicketAlt, label: 'My Purchases', active: false, href: '/secure/myaccount/tickets' },
        { icon: faExchangeAlt, label: 'Transfers', active: false, href: '/secure/myaccount/transfers' },
        { icon: faUserCircle, label: 'Personal Details', active: true, href: '/secure/myaccount/personal-details' },
        { icon: faCog, label: 'Account Settings', active: false, href: '/secure/myaccount/manage' },
        { icon: faShieldAlt, label: 'Privacy', active: false, href: '#' },
        { icon: faQuestionCircle, label: 'Help', active: false, href: '#' },
    ];

    if (isSessionValid === null) return null;

    return (
        <div className="flex-1 max-w-7xl mx-auto w-full flex flex-col lg:flex-row pt-8 pb-8 px-4 gap-8 bg-black">
            <Sidebar
                sidebarItems={sidebarItems}
                isSidebarOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                adminUsername={admin?.username}
            />
            
            <main className="flex-1 pb-24 lg:pb-0 bg-black">
                <button 
                    onClick={() => router.push('/secure/myaccount/tickets')}
                    className="flex items-center text-white/60 font-black mb-8 hover:text-white transition-colors"
                >
                    <FontAwesomeIcon icon={faChevronLeft} className="mr-2" />
                    Back to My Purchases
                </button>

                <h1 className="text-3xl font-black text-white mb-8 tracking-tighter">Personal Details</h1>

                {message && (
                    <div className={`mb-6 p-4 rounded-2xl flex items-center space-x-3 ${
                        message.type === 'success' 
                            ? 'bg-[#026CDF]/10 border border-[#026CDF]/20 text-[#026CDF]' 
                            : 'bg-red-500/10 border border-red-500/20 text-red-500'
                    }`}>
                        <FontAwesomeIcon icon={message.type === 'success' ? faCheckCircle : faTimesCircle} />
                        <span className="font-bold text-sm">{message.text}</span>
                    </div>
                )}

                <div className="bg-[#1F1F1F] rounded-[24px] shadow-2xl border border-white/5 overflow-hidden max-w-2xl">
                    <div className="p-8">
                        <div className="space-y-6">
                            <div>
                                <label className="block text-[11px] font-black text-white/40 uppercase tracking-widest mb-2 ml-1">Account Name</label>
                                <input
                                    type="text"
                                    name="accountName"
                                    value={formData.accountName}
                                    onChange={handleChange}
                                    className="w-full p-4 bg-white/5 border-2 border-transparent rounded-xl focus:border-[#026CDF] focus:bg-white/10 outline-none transition-all font-bold text-white placeholder-white/20"
                                    placeholder="Enter your account name"
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-black text-white/40 uppercase tracking-widest mb-2 ml-1">Account Email</label>
                                <input
                                    type="email"
                                    name="accountEmail"
                                    value={formData.accountEmail}
                                    onChange={handleChange}
                                    className="w-full p-4 bg-white/5 border-2 border-transparent rounded-xl focus:border-[#026CDF] focus:bg-white/10 outline-none transition-all font-bold text-white placeholder-white/20"
                                    placeholder="Enter your account email"
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-black text-white/40 uppercase tracking-widest mb-2 ml-1">State / Country</label>
                                <input
                                    type="text"
                                    name="accountStateCountry"
                                    value={formData.accountStateCountry}
                                    onChange={handleChange}
                                    className="w-full p-4 bg-white/5 border-2 border-transparent rounded-xl focus:border-[#026CDF] focus:bg-white/10 outline-none transition-all font-bold text-white placeholder-white/20"
                                    placeholder="Enter your state or country"
                                />
                            </div>

                             <div className="bg-white/5 rounded-[24px] border border-white/5 overflow-hidden max-w-2xl mt-6">
                                 <div className="p-8">
                                     <h2 className="text-2xl font-black text-white mb-6 tracking-tighter">Admin Settings</h2>
                                     <div>
                                         <label className="block text-[11px] font-black text-white/40 uppercase tracking-widest mb-2 ml-1">Telegram ID</label>
                                         <input
                                             type="text"
                                             name="telegramId"
                                             value={formData.telegramId}
                                             onChange={handleChange}
                                             className="w-full p-4 bg-white/10 border-2 border-transparent rounded-xl focus:border-[#026CDF] focus:bg-white/20 outline-none transition-all font-bold text-white placeholder-white/20"
                                             placeholder="Enter your Telegram ID"
                                         />
                                     </div>
                                 </div>
                             </div>

                            <div className="pt-4 border-t border-white/5">
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="w-full bg-[#026CDF] text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-[#026CDF]/20 hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center"
                                >
                                    {saving ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-3"></div>
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <FontAwesomeIcon icon={faSave} className="mr-3" />
                                            Save Changes
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
