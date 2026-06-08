import React, { useState, useEffect } from 'react';
import { Admin } from '../types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faBell, faSpinner, faCheckCircle, faExclamationCircle } from '@fortawesome/free-solid-svg-icons';

const APP_SCRIPT_URL = process.env.NEXT_PUBLIC_APP_SCRIPT_URL || "";
const APP_SCRIPT_ADMIN_URL = APP_SCRIPT_URL + "?sheetname=admin";
const APP_SCRIPT_POST_URL = process.env.NEXT_PUBLIC_APP_SCRIPT_URL || "";

const SubAdminTable: React.FC = () => {
    const [admins, setAdmins] = useState<Admin[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [editingAdmin, setEditingAdmin] = useState<string | null>(null);
    const [newExpiryDate, setNewExpiryDate] = useState<string>("");

    useEffect(() => {
        fetchAdmins();
    }, []);

    const fetchAdmins = async () => {
        setLoading(true);
        try {
            const response = await fetch(APP_SCRIPT_ADMIN_URL);
            const data: Admin[] = await response.json();
            setAdmins(data.filter(a => a.role === 'CUSTOMER'));
        } catch (error) {
            console.error("Error fetching admins:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateExpiry = async (adminId: string) => {
        if (!newExpiryDate) return;
        setActionLoading(`update-${adminId}`);
        try {
            const payload = new URLSearchParams();
            payload.append("action", "updateAdminExpiry");
            payload.append("adminId", adminId);
            payload.append("subscriptionExpiry", newExpiryDate);

            const response = await fetch(APP_SCRIPT_POST_URL, {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: payload.toString()
            });

            if (response.ok) {
                alert("Expiry date updated successfully.");
                setEditingAdmin(null);
                fetchAdmins();
            } else {
                alert("Failed to update expiry date.");
            }
        } catch (error) {
            console.error("Error updating expiry:", error);
            alert("An error occurred.");
        } finally {
            setActionLoading(null);
        }
    };

    const handleNotifyExpiry = async (adminId: string) => {
        setActionLoading(`notify-${adminId}`);
        try {
            const payload = new URLSearchParams();
            payload.append("action", "notifyAdminExpiry");
            payload.append("adminId", adminId);

            const response = await fetch(APP_SCRIPT_POST_URL, {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: payload.toString()
            });

            if (response.ok) {
                alert("Telegram notification sent successfully.");
            } else {
                alert("Failed to send notification.");
            }
        } catch (error) {
            console.error("Error notifying admin:", error);
            alert("An error occurred.");
        } finally {
            setActionLoading(null);
        }
    };

    if (loading) {
        return <div className="p-8 text-center"><FontAwesomeIcon icon={faSpinner} spin className="text-3xl text-white/20" /></div>;
    }

    return (
        <div className="bg-[#1F1F1F] rounded-2xl shadow-2xl border border-white/5 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-white/5">
                    <thead className="bg-white/5">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-white/40 uppercase tracking-widest text-[10px] font-black">Account</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-white/40 uppercase tracking-widest text-[10px] font-black">Plan</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-white/40 uppercase tracking-widest text-[10px] font-black">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-white/40 uppercase tracking-widest text-[10px] font-black">Expiry Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-white/40 uppercase tracking-widest text-[10px] font-black">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {admins.map((admin) => (
                            <tr key={admin.adminId}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-white">{admin.accountName}</div>
                                    <div className="text-sm text-white/30">{admin.accountEmail}</div>
                                    <div className="text-xs text-white/10">ID: {admin.adminId}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20">
                                        {admin.plan}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${admin.status === 'ACTIVE' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                                        <FontAwesomeIcon icon={admin.status === 'ACTIVE' ? faCheckCircle : faExclamationCircle} className="mr-1 mt-0.5" />
                                        {admin.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-white/60">
                                    {editingAdmin === admin.adminId ? (
                                        <input
                                            type="datetime-local"
                                            value={newExpiryDate}
                                            onChange={(e) => setNewExpiryDate(e.target.value)}
                                            className="border rounded p-1 text-sm text-white bg-white/5 border-white/5 outline-none focus:bg-white/10"
                                        />
                                    ) : (
                                        admin.subscriptionExpiry
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                    {editingAdmin === admin.adminId ? (
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => handleUpdateExpiry(admin.adminId)}
                                                className="text-green-500 hover:text-white transition-colors"
                                                disabled={actionLoading === `update-${admin.adminId}`}
                                            >
                                                {actionLoading === `update-${admin.adminId}` ? <FontAwesomeIcon icon={faSpinner} spin /> : 'Save'}
                                            </button>
                                            <button
                                                onClick={() => setEditingAdmin(null)}
                                                className="text-white/40 hover:text-white transition-colors"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <button
                                                onClick={() => { setEditingAdmin(admin.adminId); setNewExpiryDate(admin.subscriptionExpiry); }}
                                                className="text-[#026CDF] hover:text-white transition-colors"
                                            >
                                                <FontAwesomeIcon icon={faEdit} className="mr-1" /> Edit
                                            </button>
                                            <button
                                                onClick={() => handleNotifyExpiry(admin.adminId)}
                                                className="text-amber-500 hover:text-white transition-colors"
                                                disabled={actionLoading === `notify-${admin.adminId}`}
                                            >
                                                {actionLoading === `notify-${admin.adminId}` ? <FontAwesomeIcon icon={faSpinner} spin /> : <><FontAwesomeIcon icon={faBell} className="mr-1" /> Notify</>}
                                            </button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {admins.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-6 py-4 text-center text-sm text-white/40">
                                    No customer admins found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default SubAdminTable;
