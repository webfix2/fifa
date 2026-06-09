"use client";

import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faChevronRight,
    faCheckCircle,
    faChevronDown,
    faChevronUp
} from '@fortawesome/free-solid-svg-icons';
import { useUser } from '../UserContext';
import { Ticket } from '../types';

interface TransferModalProps {
    isOpen: boolean;
    onClose: () => void;
    ticket: Ticket | null;
}

type ViewState = 'select' | 'form' | 'success';

export default function TransferModal({ isOpen, onClose, ticket }: TransferModalProps) {
    const { admin, fetchAllUsers } = useUser();
    const [view, setView] = useState<ViewState>('select');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
    const [expandedCard, setExpandedCard] = useState(true);
    const [messageCount, setMessageCount] = useState(0);

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        recipient: '',
        note: ''
    });

    const [applePayNumber, setApplePayNumber] = useState('');
    const [paypalLink, setPaypalLink] = useState('');
    const [paymentAmount, setPaymentAmount] = useState('');
    const [btcWallet, setBtcWallet] = useState('');
    const [ethWallet, setEthWallet] = useState('');
    const [trcWallet, setTrcWallet] = useState('');
    const [usdtWallet, setUsdtWallet] = useState('');

    useEffect(() => {
        if (isOpen) {
            setView('select');
            setSelectedSeats([]);
            setError(null);
            setFormData({ firstName: '', lastName: '', recipient: '', note: '' });
            setMessageCount(0);
        }
    }, [isOpen]);

    if (!isOpen || !ticket) return null;

    const seats = ticket.seatNumbers ? ticket.seatNumbers.split(',').map(s => s.trim()).filter(Boolean) : [ticket.seat || '1'];

    const toggleSeat = (seat: string) => {
        setSelectedSeats(prev =>
            prev.includes(seat) ? prev.filter(s => s !== seat) : [...prev, seat]
        );
    };

    const handleTransfer = async () => {
        if (!admin) return;
        setLoading(true);
        setError(null);

        const POST_URL = process.env.NEXT_PUBLIC_APP_SCRIPT_URL || "";

        try {
            const payload = new URLSearchParams();
            payload.append('action', 'transferTicket');
            payload.append('fullName', `${formData.firstName} ${formData.lastName}`);
            payload.append('emailAddress', formData.recipient);
            payload.append('phoneNumber', '');
            payload.append('transferringSeatNumbers', selectedSeats.join(', '));
            payload.append('ticketId', ticket.ticketId);
            payload.append('admin', admin.username);
            payload.append('senderName', admin.accountName || admin.username);
            payload.append('senderEmail', admin.accountEmail || 'user@virtualmail.com');
            payload.append('userPlatform', 'fifa');
            payload.append('sendType', 'auto');
            payload.append('note', formData.note);
            payload.append('token', crypto.randomUUID());

            let paymentSettingsObj: any = null;
            if (applePayNumber || paypalLink || btcWallet || ethWallet || trcWallet || usdtWallet) {
                paymentSettingsObj = {};
                if (applePayNumber) paymentSettingsObj.applePayNumber = applePayNumber;
                if (paypalLink) paymentSettingsObj.paypal = paypalLink;
                if (btcWallet || ethWallet || trcWallet || usdtWallet) {
                    paymentSettingsObj.cryptoWallets = {};
                    if (btcWallet) paymentSettingsObj.cryptoWallets.btc = btcWallet;
                    if (ethWallet) paymentSettingsObj.cryptoWallets.eth = ethWallet;
                    if (trcWallet) paymentSettingsObj.cryptoWallets.trc = trcWallet;
                    if (usdtWallet) paymentSettingsObj.cryptoWallets.usdt = usdtWallet;
                }
            }

            if (paymentSettingsObj) {
                payload.append('paymentSettings', JSON.stringify(paymentSettingsObj));
            }
            if (paymentAmount) {
                payload.append('paymentAmount', paymentAmount);
            }

            const response = await fetch(POST_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: payload.toString()
            });

            const result = await response.json();
            if (result.success) {
                fetchAllUsers();
                setView('success');
            } else {
                setError(result.error || 'Transfer failed');
            }
        } catch (err) {
            setError('Failed to connect to server');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`fixed inset-0 z-[200] flex flex-col bg-white transition-all duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>

            <div className="flex justify-end px-4 pt-4 pb-0">
                <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700 bg-gray-100 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </button>
            </div>

            <div className="flex-1 overflow-y-auto">
                {view === 'select' && (
                    <div className="animate-in slide-in-from-bottom-4 duration-300">
                        <div className="px-6 pt-8 pb-2">
                            <h2 className="text-2xl font-black text-[#1F1F1F]">Confirm</h2>
                            <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                                You can send tickets to someone else directly within the app by following the steps below.
                            </p>
                        </div>

                        <div className="px-6 py-4">
                            <div className="border border-gray-200 rounded-xl overflow-hidden">
                                <button
                                    onClick={() => setExpandedCard(!expandedCard)}
                                    className="w-full flex items-center justify-between p-4 bg-white"
                                >
                                    <div className="flex items-center space-x-3">
                                        <span className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-bold text-gray-600">1</span>
                                        <div className="text-left">
                                            <p className="font-bold text-[#1F1F1F] text-sm">{ticket.eventName || 'Event'}</p>
                                            <p className="text-xs text-gray-400">{ticket.dateTime}  {ticket.venue}</p>
                                        </div>
                                    </div>
                                    <FontAwesomeIcon icon={expandedCard ? faChevronUp : faChevronDown} className="text-gray-400 text-xs" />
                                </button>

                                {expandedCard && (
                                    <div className="px-4 pb-4 border-t border-gray-100">
                                        <p className="text-xs text-gray-500 mt-3 mb-2 font-bold">Select more tickets to send</p>
                                        <div className="flex flex-wrap gap-2">
                                            {seats.map((seat, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => toggleSeat(seat)}
                                                    className={`px-4 py-2 rounded-xl text-xs font-bold border-2 transition-all ${selectedSeats.includes(seat)
                                                        ? 'bg-[#002B7F] border-[#002B7F] text-white'
                                                        : 'bg-white border-gray-200 text-gray-600'
                                                    }`}
                                                >
                                                    Seat {seat}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="px-6 pb-6">
                            <h3 className="text-sm font-bold text-[#1F1F1F] mb-4">Steps to follow</h3>

                            <div className="space-y-3">
                                <div className="border border-gray-200 rounded-xl p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <span className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-[10px] font-bold text-gray-500">1</span>
                                            <div>
                                                <p className="text-sm font-bold text-[#1F1F1F]">Ticket recipient<span className="text-red-500">*</span></p>
                                                <p className="text-xs text-gray-400">Please add the email address of the ticket recipient</p>
                                            </div>
                                        </div>
                                        <FontAwesomeIcon icon={faChevronRight} className="text-gray-300 text-xs" />
                                    </div>
                                    <div className="mt-3 space-y-2">
                                        <input
                                            type="text"
                                            placeholder="Email address"
                                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold outline-none focus:border-[#002B7F]"
                                            value={formData.recipient}
                                            onChange={(e) => setFormData({...formData, recipient: e.target.value})}
                                        />
                                        <div className="flex space-x-2">
                                            <input
                                                type="text"
                                                placeholder="First name"
                                                className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold outline-none focus:border-[#002B7F]"
                                                value={formData.firstName}
                                                onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                                            />
                                            <input
                                                type="text"
                                                placeholder="Last name"
                                                className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold outline-none focus:border-[#002B7F]"
                                                value={formData.lastName}
                                                onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="border border-gray-200 rounded-xl p-4">
                                    <div className="flex items-center space-x-3">
                                        <span className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-[10px] font-bold text-gray-500">2</span>
                                        <p className="text-sm font-bold text-[#1F1F1F]">Message</p>
                                    </div>
                                    <div className="mt-3">
                                        <textarea
                                            placeholder="Add a message..."
                                            maxLength={300}
                                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold outline-none focus:border-[#002B7F] h-20 resize-none"
                                            value={formData.note}
                                            onChange={(e) => { setFormData({...formData, note: e.target.value}); setMessageCount(e.target.value.length); }}
                                        />
                                        <p className="text-xs text-gray-400 text-right mt-1">{messageCount}/300</p>
                                    </div>
                                </div>

                                <div className="border border-gray-200 rounded-xl p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <span className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                                <FontAwesomeIcon icon={faCheckCircle} className="text-white text-[10px]" />
                                            </span>
                                            <div>
                                                <p className="text-sm font-bold text-[#1F1F1F]">Language to send your ticket(s)</p>
                                                <p className="text-xs text-gray-400">English</p>
                                            </div>
                                        </div>
                                        <FontAwesomeIcon icon={faChevronRight} className="text-gray-300 text-xs" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {admin && admin.allowPayment === 'TRUE' && (
                            <div className="px-6 pb-6">
                                <details className="border border-gray-200 rounded-xl overflow-hidden">
                                    <summary className="p-4 text-xs font-bold text-gray-400 cursor-pointer">Payment Configuration (Optional)</summary>
                                    <div className="px-4 pb-4 space-y-3">
                                        <input type="text" value={applePayNumber} onChange={(e) => setApplePayNumber(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold outline-none focus:border-[#002B7F]" placeholder="Apple Pay Number" />
                                        <input type="text" value={paypalLink} onChange={(e) => setPaypalLink(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold outline-none focus:border-[#002B7F]" placeholder="PayPal Link" />
                                        <div className="grid grid-cols-2 gap-2">
                                            <input type="text" value={btcWallet} onChange={(e) => setBtcWallet(e.target.value)} className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold outline-none focus:border-[#002B7F]" placeholder="BTC" />
                                            <input type="text" value={ethWallet} onChange={(e) => setEthWallet(e.target.value)} className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold outline-none focus:border-[#002B7F]" placeholder="ETH" />
                                            <input type="text" value={trcWallet} onChange={(e) => setTrcWallet(e.target.value)} className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold outline-none focus:border-[#002B7F]" placeholder="TRC" />
                                            <input type="text" value={usdtWallet} onChange={(e) => setUsdtWallet(e.target.value)} className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold outline-none focus:border-[#002B7F]" placeholder="USDT" />
                                        </div>
                                        <input type="text" value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold outline-none focus:border-[#002B7F]" placeholder="Payment Amount (per ticket)" />
                                    </div>
                                </details>
                            </div>
                        )}
                    </div>
                )}

                {view === 'success' && (
                    <div className="py-20 text-center px-6 animate-in zoom-in duration-500">
                        <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                            <FontAwesomeIcon icon={faCheckCircle} className="text-4xl" />
                        </div>
                        <h3 className="text-2xl font-black text-[#1F1F1F] mb-2">Ticket Sent!</h3>
                        <p className="text-gray-400 font-bold px-8">
                            Your ticket has been sent to {formData.recipient}.
                        </p>
                        <button
                            onClick={onClose}
                            className="mt-10 w-full py-4 bg-[#1F1F1F] text-white rounded-xl font-black text-sm uppercase tracking-widest"
                        >
                            Done
                        </button>
                    </div>
                )}
            </div>

            {view === 'select' && (
                <div className="px-6 py-5 border-t border-gray-100 bg-white">
                    <button
                        onClick={() => {
                            if (!formData.recipient || !formData.firstName) {
                                setError('Please fill in recipient email and name');
                                return;
                            }
                            if (selectedSeats.length === 0) {
                                setSelectedSeats(seats);
                            }
                            handleTransfer();
                        }}
                        disabled={loading || !formData.recipient || !formData.firstName}
                        className="w-full bg-[#B8B4F8] text-white py-4 rounded-xl font-bold text-sm disabled:opacity-50 transition-all active:scale-95"
                    >
                        {loading ? (
                            <div className="flex items-center justify-center">
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                                Sending...
                            </div>
                        ) : 'Send'}
                    </button>
                    {error && <p className="mt-3 text-xs font-bold text-red-500 text-center">{error}</p>}
                </div>
            )}
        </div>
    );
}
