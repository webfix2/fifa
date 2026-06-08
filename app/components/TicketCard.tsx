"use client";

import React from 'react';
import { Ticket } from '../types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt, faMapMarkerAlt, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import Image from 'next/image';

import Link from 'next/link';

interface TicketCardProps {
    ticket: Ticket;
}

const TicketCard: React.FC<TicketCardProps> = ({ ticket }) => {
    // Use ticketId if available, fallback to sn (serial number) as unique identifier
    const ticketIdentifier = ticket.ticketId || ticket.sn || 'unknown';
    
    // Parse seat count
    const seatCount = ticket.seatNumbers ? ticket.seatNumbers.split(',').length : 1;

    return (
        <Link href={`/secure/myaccount/tickets/${ticketIdentifier}`}>
            <div className="bg-white rounded-none border-b border-gray-100 overflow-hidden cursor-pointer mb-2 active:bg-gray-50 transition-colors">
                <div className="flex flex-col">
                    {/* Event Image - Full Width Mobile */}
                    <div className="relative aspect-[16/9] w-full bg-gray-100">
                        {ticket.coverImage ? (
                            <img 
                                src={ticket.coverImage} 
                                alt={ticket.eventName} 
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                                No Image
                            </div>
                        )}
                        
                        {/* Ticket Count Badge (x3 style) */}
                        <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md text-white px-2 py-1 rounded-md flex items-center space-x-1.5 border border-white/20">
                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M0 6a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H2a2 2 0 01-2-2V6z" />
                                <path d="M14 4h4a2 2 0 012 2v8a2 2 0 01-2 2h-4V4z" />
                            </svg>
                            <span className="text-[10px] font-black tracking-tighter">x{seatCount}</span>
                        </div>
                    </div>

                    {/* Event Details */}
                    <div className="p-4 bg-black">
                        <div className="flex flex-col space-y-1">
                            <div className="text-[10px] font-black text-white/60 uppercase tracking-widest">
                                {ticket.dateTime}
                            </div>
                            <h3 className="text-[20px] font-black text-white leading-tight tracking-tight uppercase mb-1">
                                {ticket.eventName}
                            </h3>
                            <div className="text-[12px] font-bold text-white/50 tracking-wide">
                                {ticket.venue}, {ticket.location}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default TicketCard;
