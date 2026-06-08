import React from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faTimesCircle,
    faUserCircle,
    faSignOutAlt
} from '@fortawesome/free-solid-svg-icons';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';

interface SidebarItem {
    icon: IconDefinition;
    label: string;
    active: boolean;
    href?: string;
    action?: () => void;
}

interface SidebarProps {
    sidebarItems: SidebarItem[];
    isSidebarOpen: boolean;
    onClose: () => void;
    adminUsername: string | undefined;
}

const Sidebar: React.FC<SidebarProps> = ({
    sidebarItems,
    isSidebarOpen,
    onClose,
    adminUsername
}) => {
    return (
        <aside
            className={`fixed inset-0 z-40 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            lg:relative lg:translate-x-0 lg:flex-shrink-0
            bg-black transition-transform duration-300 ease-in-out
            lg:bg-[#121212] lg:rounded-2xl lg:shadow-2xl lg:p-6 lg:w-64 border-r border-white/5 lg:border-none
            `}
        >
            <div className="h-full flex flex-col p-8 lg:p-0">
                {/* Sidebar Header Mobile */}
                <div className="flex items-center justify-end mb-12 lg:hidden">
                    <button onClick={onClose} className="text-white/60 hover:text-white transition-colors">
                        <FontAwesomeIcon icon={faTimesCircle} size="2x" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 py-6 space-y-1 lg:px-0 lg:py-0">
                    {sidebarItems.map((item, index) => (
                        item.href && item.href !== '#' ? (
                            <Link key={index} href={item.href} onClick={onClose} className={`flex items-center px-4 py-3 rounded-[12px] transition-all
                                ${item.active
                                    ? 'bg-[#026CDF] text-white font-black shadow-lg shadow-[#026CDF]/20'
                                    : 'text-white/60 hover:text-white hover:bg-white/5 font-bold'}
                            `}>
                                <FontAwesomeIcon icon={item.icon} className="w-5 mr-3" />
                                <span className="text-sm">{item.label}</span>
                            </Link>
                        ) : (
                            <button
                                key={index}
                                onClick={() => {
                                    if (item.action) item.action();
                                    onClose();
                                }}
                                className={`flex items-center w-full text-left px-4 py-3 rounded-[12px] transition-all
                                    ${item.active
                                        ? 'bg-[#026CDF] text-white font-black shadow-lg shadow-[#026CDF]/20'
                                        : (item.label === 'Sign Out' 
                                            ? 'text-red-500 hover:bg-red-500/10 font-bold' 
                                            : 'text-white/60 hover:text-white hover:bg-white/5 font-bold')}
                                `}
                            >
                                <FontAwesomeIcon icon={item.icon} className="w-5 mr-3" />
                                <span className="text-sm">{item.label}</span>
                            </button>
                        )
                    ))}
                </nav>

                {/* Admin Panel Link */}
                <div className="mt-12 pt-8 border-t border-white/5">
                    <Link href="/secure/myaccount/manage" className="flex items-center space-x-3 text-white/20 hover:text-[#026CDF] transition-colors text-[10px] font-black uppercase tracking-widest px-4">
                        <FontAwesomeIcon icon={faUserCircle} className="w-4" />
                        <span>Admin Panel</span>
                    </Link>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
