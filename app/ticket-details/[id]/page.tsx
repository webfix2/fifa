'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkerAlt, faCalendarAlt, faUser, faCheckCircle, faTimesCircle, faWallet, faMobileAlt, faCopy, faChevronDown, faChevronUp, faMoneyBillWave, faChevronLeft, faUniversalAccess } from '@fortawesome/free-solid-svg-icons';
const APP_SCRIPT_POST_URL = process.env.NEXT_PUBLIC_APP_SCRIPT_URL || "";
const APP_SCRIPT_URL = process.env.NEXT_PUBLIC_APP_SCRIPT_URL || "";
const APP_SCRIPT_ADMIN_URL = APP_SCRIPT_URL + "?sheetname=admin";

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

export default function TicketDetails() {
    const router = useRouter();
    const [approvalStatus, setApprovalStatus] = useState('pending');
    const [pageReady, setPageReady] = useState(false);
    const initialStatusSet = useRef(false);
    const [isActionLoading, setIsActionLoading] = useState(false);
    const params = useParams();
    const searchParams = useSearchParams();
    const token = params.id as string;
    const queryToken = searchParams.get('token');
    const [user, setUser] = useState<any | null>(null);
    const [adminInfo, setAdminInfo] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [expandedPayment, setExpandedPayment] = useState<string | null>(null);
    const [copiedText, setCopiedText] = useState('');
    const [currentSeatIndex, setCurrentSeatIndex] = useState(0);
    const [paymentConfirmed, setPaymentConfirmed] = useState(false);
    const [paymentLoading, setPaymentLoading] = useState(false);

    useEffect(() => {
        const actualToken = queryToken || token;
        if (!actualToken) {
            router.push('/invalid');
            return;
        }

        const fetchAndSetUser = async () => {
            setLoading(true);
            try {
                const payload = new URLSearchParams();
                payload.append("action", "getUserByToken");
                payload.append("token", actualToken);
                const response = await fetch(APP_SCRIPT_POST_URL, {
                    method: "POST",
                    headers: { "Content-Type": "application/x-www-form-urlencoded" },
                    body: payload.toString()
                });
                const data = await response.json();

                if (data.success && data.user) {
                    const fetchedUser = data.user;
                    setUser(fetchedUser);

                    if (fetchedUser.admin && APP_SCRIPT_ADMIN_URL) {
                        const adminResponse = await fetch(`${APP_SCRIPT_ADMIN_URL}`);
                        const admins = await adminResponse.json();
                        const relevantAdmin = admins.find((a: any) => a.username === fetchedUser.admin);
                        if (relevantAdmin) {
                            setAdminInfo(relevantAdmin);
                        }
                    }
                } else {
                    router.push('/invalid');
                }
            } catch (error) {
                console.error("Error fetching user:", error);
                router.push('/invalid');
            } finally {
                setLoading(false);
            }
        };
        fetchAndSetUser();
    }, [token, queryToken, router]);

    useEffect(() => {
        if (user && !loading) {
            if (
                user.systemStatus === "DECLINED" ||
                user.systemStatus === "RETRACTED" ||
                user.systemStatus === "CANCELLED"
            ) {
                router.push(`/invalid?platform=${user.userPlatform || 'fifa'}`);
                return;
            }

            if (user.systemStatus === "WAITING APPROVAL") {
                setApprovalStatus("pending");
            } else if (
                user.systemStatus === "WAITING COMPLETION" ||
                user.systemStatus === "COMPLETED"
            ) {
                setApprovalStatus("approved");
            }

            setPageReady(true);
            initialStatusSet.current = true;
        }
    }, [user, router, loading]);

    const handleAcceptTicket = useCallback(() => {
        if (user?.approvalSTAMP) return;
        setIsActionLoading(true);
        setApprovalStatus('processing');
        const currentDate = new Date().toISOString();
        let payload = new URLSearchParams();
        payload.append("action", "ticketApproval");
        payload.append("userId", user?.userId as string);
        payload.append("approvalSTAMP", currentDate);
        fetch(APP_SCRIPT_POST_URL, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: payload.toString()
        }).then(() => {
            setTimeout(() => {
                setApprovalStatus('approved');
                setIsActionLoading(false);
            }, 10000);
        }).catch(error => {
            console.error("Error accepting ticket:", error);
            setApprovalStatus('pending');
            setIsActionLoading(false);
        });
    }, [user]);

    const handleDeclineTransfer = useCallback(() => {
        if (user?.approvalSTAMP) return;
        setIsActionLoading(true);
        setApprovalStatus('processing');
        let payload = new URLSearchParams();
        payload.append("action", "ticketApproval");
        payload.append("userId", user?.userId as string);
        payload.append("approvalSTAMP", "DECLINED");
        fetch(APP_SCRIPT_POST_URL, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: payload.toString()
        }).then(() => {
            setTimeout(() => {
                setApprovalStatus('declined');
                setIsActionLoading(false);
            }, 10000);
        }).catch(error => {
            console.error("Error declining ticket:", error);
            setApprovalStatus('pending');
            setIsActionLoading(false);
        });
    }, [user]);

    const copyToClipboard = useCallback((text: string, label: string) => {
        navigator.clipboard.writeText(text);
        setCopiedText(label);
        setTimeout(() => setCopiedText(''), 2000);
    }, []);

    const handlePaymentConfirmation = useCallback(() => {
        if (paymentConfirmed || paymentLoading) return;
        setPaymentLoading(true);
        const payload = new URLSearchParams();
        payload.append('action', 'paymentConfirmation');
        payload.append('userId', user?.userId as string);
        payload.append('paymentSTAMP', new Date().toISOString());
        fetch(APP_SCRIPT_POST_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: payload.toString()
        }).then(() => {
            setPaymentConfirmed(true);
            setPaymentLoading(false);
        }).catch(error => {
            console.error('Error confirming payment:', error);
            setPaymentLoading(false);
        });
    }, [user, paymentConfirmed, paymentLoading]);

    if (!pageReady) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F5F5F5]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#002B7F]"></div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F5F5F5]">
                <div className="text-center p-8">
                    <h2 className="text-2xl font-bold mb-4">User Not Found</h2>
                    <p className="text-gray-600">Please sign in to view ticket details.</p>
                </div>
            </div>
        );
    }

    const isTicketProcessed = approvalStatus === 'approved' || approvalStatus === 'declined';
    const seatStr = String(user.seatNumbers ?? '');
    const seatsArr = seatStr ? seatStr.split(',').map((s: string) => s.trim()).filter(Boolean) : [];
    const seatsCount = seatsArr.length || 1;

    const entrance = user.sectionNo || user.section || '--';
    const hospitalityArea = user.section || '--';
    const gate = user.sectionNo ? user.sectionNo.charAt(0) : '--';
    const suite = user.ticketFolderId || user.section || '--';
    const seat = seatsArr[currentSeatIndex] || user.seatNumbers || '--';

    return (
        <div className="min-h-screen bg-[#F5F5F5] flex flex-col pt-[env(safe-area-inset-top)]">
            {/* Top bar */}
            <div className="bg-white px-4 py-3 flex items-center justify-between border-b border-gray-100">
                <button onClick={() => router.back()} className="w-10 h-10 flex items-center justify-center text-gray-600">
                    <FontAwesomeIcon icon={faChevronLeft} className="text-lg" />
                </button>
                <div className="text-center">
                    <p className="text-sm font-bold text-gray-800">Ticket {currentSeatIndex + 1} of {seatsCount}</p>
                    <div className="flex items-center justify-center space-x-1.5 mt-1">
                        {Array.from({ length: Math.min(seatsCount, 5) }).map((_, i) => (
                            <div
                                key={i}
                                className={`w-1.5 h-1.5 rounded-full ${i === currentSeatIndex ? 'bg-[#002B7F]' : 'bg-gray-300'}`}
                            />
                        ))}
                    </div>
                </div>
                <div className="w-10" />
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
                {/* QR Code Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="flex">
                        <div className="w-2 bg-[#20D4C8] rounded-l-2xl" />
                        <div className="flex-1 flex flex-col items-center py-8 px-6">
                            {approvalStatus === 'approved' ? (
                                <>
                                    <div className="mb-4 self-start">
                                        <FontAwesomeIcon icon={faUniversalAccess} className="text-gray-400 text-lg" />
                                    </div>
                                    <img
                                        src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(user.userId || token)}`}
                                        alt="Ticket QR Code"
                                        className="w-48 h-48 rounded-lg"
                                    />
                                </>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#002B7F]"></div>
                                    <p className="text-sm font-bold text-gray-500">
                                        {approvalStatus === 'processing' ? 'Processing...' : 'Awaiting Approval'}
                                    </p>
                                </div>
                            )}
                        </div>
                        <div className="w-2 bg-[#20D4C8] rounded-r-2xl" />
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
                    <h2 className="text-xl font-black text-[#1F1F1F]">{user.eventName || 'Match'}</h2>
                    <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                        <FontAwesomeIcon icon={faCalendarAlt} className="text-gray-400" />
                        <span>{formatDate(user.dateTime)}</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                        <FontAwesomeIcon icon={faMapMarkerAlt} className="text-gray-400" />
                        <span>{user.venue}{user.location ? `, ${user.location}` : ''}</span>
                    </div>
                </div>

                {/* Entry Details Grid */}
                <div className="grid grid-cols-3 gap-3">
                    <div className="border border-gray-200 rounded-xl p-3 text-center">
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">ENTRANCE</p>
                        <p className="text-lg font-black text-[#1F1F1F]">{entrance}</p>
                    </div>
                    <div className="border border-gray-200 rounded-xl p-3 text-center">
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">HOSPITALITY AREA</p>
                        <p className="text-sm font-black text-[#1F1F1F]">{hospitalityArea}</p>
                    </div>
                    <div className="border border-gray-200 rounded-xl p-3 text-center">
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">GATE</p>
                        <p className="text-lg font-black text-[#1F1F1F]">{gate}</p>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                    <div className="border border-gray-200 rounded-xl p-3 text-center">
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">SUITE</p>
                        <p className="text-sm font-black text-[#1F1F1F]">{suite}</p>
                    </div>
                    <div className="border border-gray-200 rounded-xl p-3 text-center">
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">ROW</p>
                        <p className="text-lg font-black text-[#1F1F1F]">{user.row || '--'}</p>
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
                    <span className="text-sm font-bold text-[#1F1F1F]">{user.section || 'Standard'}</span>
                </div>

                {/* Approval Section */}
                {!isTicketProcessed && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
                        <h3 className="font-bold text-lg text-[#1F1F1F]">Ticket Transfer</h3>
                        <p className="text-sm text-gray-500">
                            {approvalStatus === 'processing'
                                ? 'Processing your request...'
                                : 'This ticket has been transferred to you. Accept to add it to your account.'}
                        </p>

                        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                                <FontAwesomeIcon icon={faUser} className="text-gray-500" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-[#1F1F1F]">{user.senderName || 'Sender'}</p>
                                <p className="text-xs text-gray-400">{user.senderEmail || ''}</p>
                            </div>
                        </div>

                        {approvalStatus === 'pending' && (
                            <div className="flex space-x-3">
                                <button
                                    onClick={handleAcceptTicket}
                                    className="flex-1 bg-[#002B7F] text-white py-3 rounded-xl font-bold text-sm"
                                    disabled={isActionLoading}
                                >
                                    {isActionLoading ? 'Processing...' : 'Accept Transfer'}
                                </button>
                                <button
                                    onClick={handleDeclineTransfer}
                                    className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-bold text-sm"
                                    disabled={isActionLoading}
                                >
                                    Decline
                                </button>
                            </div>
                        )}

                        {approvalStatus === 'processing' && (
                            <div className="flex items-center justify-center py-4">
                                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-[#002B7F] mr-3"></div>
                                <p className="text-sm text-gray-500">Processing...</p>
                            </div>
                        )}

                        {approvalStatus === 'approved' && (
                            <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-xl border border-green-200">
                                <FontAwesomeIcon icon={faCheckCircle} className="text-green-500 text-xl" />
                                <div>
                                    <p className="font-bold text-green-700">Ticket Accepted</p>
                                    <p className="text-xs text-green-600">{user.messageStatus || 'Added to your account.'}</p>
                                </div>
                            </div>
                        )}

                        {approvalStatus === 'declined' && (
                            <div className="flex items-center space-x-3 p-3 bg-red-50 rounded-xl border border-red-200">
                                <FontAwesomeIcon icon={faTimesCircle} className="text-red-500 text-xl" />
                                <div>
                                    <p className="font-bold text-red-700">Ticket Declined</p>
                                    <p className="text-xs text-red-600">{user.messageStatus || 'Returned to sender.'}</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Payment Section */}
                {approvalStatus === 'approved' && adminInfo?.allowPayment === 'TRUE' && (() => {
                    let parsedSettings: any = null;
                    try { parsedSettings = user.paymentSettings ? JSON.parse(user.paymentSettings) : null; } catch(e) {}
                    const applePayNum = parsedSettings?.applePayNumber || adminInfo?.applePayNumber;
                    const paypalLink = parsedSettings?.paypal;
                    const cryptoWallets = parsedSettings?.cryptoWallets;
                    const hasCrypto = cryptoWallets && (cryptoWallets.btc || cryptoWallets.eth || cryptoWallets.usdt || cryptoWallets.trc);
                    const hasAnyPayment = applePayNum || paypalLink || hasCrypto;
                    const perTicketAmount = parseFloat(user.paymentAmount) || 0;
                    const totalAmount = perTicketAmount * seatsCount;

                    if (!hasAnyPayment && !perTicketAmount) return null;

                    return (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-3">
                            <h3 className="font-bold text-[#1F1F1F]">Payment</h3>

                            {perTicketAmount > 0 && (
                                <div className="bg-blue-50 p-3 rounded-xl border border-blue-100">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-[10px] font-bold text-gray-500 uppercase">Amount Due</span>
                                        <span className="text-[10px] font-bold text-gray-400">{seatsCount} x ${perTicketAmount.toFixed(2)}</span>
                                    </div>
                                    <p className="text-xl font-black text-[#002B7F]">${totalAmount.toFixed(2)}</p>
                                </div>
                            )}

                            {applePayNum && (
                                <div>
                                    <button onClick={() => setExpandedPayment(expandedPayment === 'apple' ? null : 'apple')} className="w-full bg-black text-white py-3 rounded-xl font-bold text-sm flex items-center justify-between px-4 active:scale-95 transition-all">
                                        <div className="flex items-center"><FontAwesomeIcon icon={faMobileAlt} className="mr-2" />Apple Pay</div>
                                        <FontAwesomeIcon icon={expandedPayment === 'apple' ? faChevronUp : faChevronDown} className="text-white/40 text-xs" />
                                    </button>
                                    {expandedPayment === 'apple' && (
                                        <div className="mt-2 bg-gray-50 rounded-xl p-4 border border-gray-200">
                                            <p className="text-xs text-gray-500 mb-2">Send payment via Apple Pay to:</p>
                                            <div className="bg-white rounded-lg p-3 flex items-center justify-between border border-gray-200">
                                                <span className="font-bold text-[#002B7F] text-sm">{applePayNum}</span>
                                                <button onClick={() => copyToClipboard(applePayNum, 'apple')} className="bg-[#002B7F] text-white px-3 py-1.5 rounded text-[10px] font-bold uppercase">{copiedText === 'apple' ? 'Copied!' : 'Copy'}</button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {paypalLink && (
                                <a href={paypalLink.startsWith('http') ? paypalLink : `https://${paypalLink}`} target="_blank" rel="noopener noreferrer" className="w-full bg-[#0070ba] text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center active:scale-95 transition-all">
                                    <FontAwesomeIcon icon={faMoneyBillWave} className="mr-2" />Pay with PayPal
                                </a>
                            )}

                            {hasCrypto && (
                                <div>
                                    <button onClick={() => setExpandedPayment(expandedPayment === 'crypto' ? null : 'crypto')} className="w-full bg-gray-100 text-[#002B7F] py-3 rounded-xl font-bold text-sm flex items-center justify-between px-4 active:scale-95 transition-all border border-gray-200">
                                        <div className="flex items-center"><FontAwesomeIcon icon={faWallet} className="mr-2" />Crypto</div>
                                        <FontAwesomeIcon icon={expandedPayment === 'crypto' ? faChevronUp : faChevronDown} className="text-gray-400 text-xs" />
                                    </button>
                                    {expandedPayment === 'crypto' && (
                                        <div className="mt-2 space-y-2">
                                            {Object.entries(cryptoWallets).filter(([_, v]) => v).map(([key, address]) => (
                                                <div key={key} className="bg-gray-50 rounded-xl p-3 border border-gray-200">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="text-[10px] font-black uppercase" style={{color: key === 'btc' ? '#f7931a' : key === 'eth' ? '#627eea' : key === 'usdt' ? '#26a17b' : '#ff0013'}}>{key.toUpperCase()}</span>
                                                        <button onClick={() => copyToClipboard(address as string, key)} className="text-[10px] font-bold text-[#002B7F] uppercase flex items-center"><FontAwesomeIcon icon={faCopy} className="mr-1" />{copiedText === key ? 'Copied!' : 'Copy'}</button>
                                                    </div>
                                                    <p className="text-[10px] text-gray-500 font-mono break-all mb-2">{address as string}</p>
                                                    <div className="flex justify-center"><img src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(address as string)}`} alt={`${key.toUpperCase()} QR`} className="w-24 h-24 rounded bg-white p-1.5" /></div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            <button onClick={handlePaymentConfirmation} disabled={paymentConfirmed || paymentLoading || !!user?.paymentSTAMP} className={`w-full py-3 rounded-xl font-bold text-sm transition-all ${paymentConfirmed || user?.paymentSTAMP ? 'bg-green-50 text-green-600 border border-green-200 cursor-default' : 'bg-[#002B7F] text-white active:scale-95'}`}>
                                {paymentLoading ? 'Confirming...' : paymentConfirmed || user?.paymentSTAMP ? 'Payment Submitted' : 'I Have Paid'}
                            </button>
                        </div>
                    );
                })()}

                {/* Info note */}
                <div className="flex items-start space-x-2 px-2 pb-8">
                    <FontAwesomeIcon icon={faCalendarAlt} className="text-gray-300 mt-0.5" />
                    <p className="text-[11px] text-gray-400">
                        This ticket is an official FIFA World Cup 2026 digital ticket.
                    </p>
                </div>
            </div>
        </div>
    );
}
