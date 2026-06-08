"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPhone, faLock, faTicketAlt, faUser, faSearch } from '@fortawesome/free-solid-svg-icons';
import { library } from '@fortawesome/fontawesome-svg-core';
import { UserProvider, useUser } from './UserContext';
import { useState } from 'react';
import Image from 'next/image';

library.add(faPhone, faLock, faTicketAlt, faUser, faSearch);

const FAVICON = 'https://play-lh.googleusercontent.com/nQLbIovsHYyx1EhAHYc2gdNO9MIIdDLkWWXHuKnLoSVcaOCRtsHPdiYcVQ3tieTe8F3EkKGZVHdcQRO3rU48=w240-h480-rw';

export default function RootLayoutWrapper({
  children,
  inter,
}: {
  children: React.ReactNode;
  inter: { className: string };
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useUser();
  const [loggedInAdmin, setLoggedInAdmin] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = () => {
    localStorage.removeItem("loggedInAdmin");
    setLoggedInAdmin(null);
    router.push('/');
  };

  const openFifaLink = (path: string) => {
    const baseUrl = 'https://www.fifa.com';
    const fullUrl = `${baseUrl}${path}`;
    window.open(fullUrl, '_self');
  };

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (query !== '') {
      const searchUrl = `https://www.fifa.com/en/search?q=${encodeURIComponent(query)}`;
      window.open(searchUrl, '_self');
    }
  };

  const shouldShowHeaderFooter =
    pathname !== null &&
    pathname !== '/' &&
    !pathname.startsWith('/secure') &&
    !pathname.includes('/invalid') &&
    !pathname.includes('/admin') &&
    !pathname.includes('/login');

  return (
    <div className={`${inter.className} bg-[#f5f5f5] min-h-screen flex flex-col`}>
      {shouldShowHeaderFooter && (
        <>
          <header className="fixed top-0 left-0 right-0 z-10 bg-[#002B7F] shadow-md">
            <div className="bg-[#001a4d] text-white py-1 px-4">
              <div className="container mx-auto flex justify-end items-center text-xs">
                <button
                  onClick={() => openFifaLink('/en/help')}
                  className="mr-4 hover:underline"
                >
                  Help
                </button>

                <button
                  onClick={() => openFifaLink('/en/login')}
                  className="flex items-center hover:underline"
                >
                  <FontAwesomeIcon icon={faUser} className="mr-1" />
                  My FIFA Account
                </button>
              </div>
            </div>

            <div className="container mx-auto px-4 py-3 flex justify-between items-center">
              <Link href="/" className="flex items-center">
                <Image
                  src={FAVICON}
                  alt="FIFA World Cup 2026"
                  width={40}
                  height={40}
                  className="sm:hidden rounded-full"
                  unoptimized={true}
                />
                <div className="text-white font-black text-2xl hidden sm:flex items-center">
                  <Image
                    src={FAVICON}
                    alt="FIFA World Cup 2026"
                    width={32}
                    height={32}
                    className="mr-2 rounded-full"
                    unoptimized={true}
                  />
                  <span>FIFA World Cup 2026™</span>
                </div>
              </Link>

              <div className="hidden lg:flex items-center space-x-6 text-white">
                <button
                  onClick={() => openFifaLink('/en/tournaments/worldcup')}
                  className="hover:text-[#D4A843] font-medium"
                >
                  World Cup
                </button>
                <button
                  onClick={() => openFifaLink('/en/tickets')}
                  className="hover:text-[#D4A843] font-medium"
                >
                  Tickets
                </button>
                <button
                  onClick={() => openFifaLink('/en/transfers')}
                  className="hover:text-[#D4A843] font-medium"
                >
                  Transfers
                </button>
                <button
                  onClick={() => openFifaLink('/en/teams')}
                  className="hover:text-[#D4A843] font-medium"
                >
                  Teams
                </button>
                <button
                  onClick={() => openFifaLink('/en/stadiums')}
                  className="hover:text-[#D4A843] font-medium"
                >
                  Stadiums
                </button>
              </div>

              <div className="lg:hidden flex items-center">
                <button className="text-white p-2">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <div className="bg-white py-3 px-4 shadow-sm">
              <div className="container mx-auto">
                <form onSubmit={handleSearchSubmit}>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search for matches, teams, or stadiums"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full py-2 pl-10 pr-4 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#002B7F]"
                    />
                    <button type="submit">
                      <FontAwesomeIcon
                        icon={faSearch}
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      />
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </header>
        </>
      )}

      <main className={`flex-grow ${shouldShowHeaderFooter ? "pt-36 z-0" : ""}`}>{children}</main>

      {shouldShowHeaderFooter && (
        <footer className="bg-[#002B7F] text-white py-12 mt-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div>
                <h3 className="text-lg font-bold mb-4">FIFA World Cup 2026™</h3>
                <ul className="space-y-2">
                  <li>
                    <button
                      onClick={() => openFifaLink('/en/tournaments/worldcup')}
                      className="hover:text-[#D4A843]"
                    >
                      Tournament
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => openFifaLink('/en/tickets/faq')}
                      className="hover:text-[#D4A843]"
                    >
                      Ticket FAQs
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => openFifaLink('/en/contact')}
                      className="hover:text-[#D4A843]"
                    >
                      Contact Us
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => openFifaLink('/en/accessibility')}
                      className="hover:text-[#D4A843]"
                    >
                      Accessibility
                    </button>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-bold mb-4">My Tickets</h3>
                <ul className="space-y-2">
                  <li>
                    <Link href="/secure/myaccount/tickets" className="hover:text-[#D4A843]">
                      My Tickets
                    </Link>
                  </li>
                  <li>
                    <Link href="/secure/myaccount/transfers" className="hover:text-[#D4A843]">
                      Transfers
                    </Link>
                  </li>
                  <li>
                    <Link href="/secure/myaccount/manage" className="hover:text-[#D4A843]">
                      Account Settings
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-bold mb-4">More FIFA</h3>
                <ul className="space-y-2">
                  <li>
                    <button
                      onClick={() => openFifaLink('/en/development')}
                      className="hover:text-[#D4A843]"
                    >
                      Football Development
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => openFifaLink('/en/fifaplus')}
                      className="hover:text-[#D4A843]"
                    >
                      FIFA+
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => openFifaLink('/en/legal')}
                      className="hover:text-[#D4A843]"
                    >
                      Legal & Privacy
                    </button>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-bold mb-4">Get the App</h3>
                <div className="flex space-x-2">
                  <a href="https://play.google.com/store/apps/details?id=io.tixngo.app.fifatickets" className="block">
                    <img
                      src="https://placehold.co/120x40/001a4d/FFFFFF?text=Google+Play"
                      alt="Google Play"
                      className="h-10"
                    />
                  </a>
                </div>
                <p className="text-xs mt-4 opacity-70">
                  FIFA-Strasse 20<br />
                  8044 Zürich, Switzerland
                </p>
              </div>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
