import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Menu, X } from 'lucide-react';

export default function Navbar() {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Symptoms', path: '/symptoms' },
    { name: 'Medicines', path: '/medicine' },
    { name: 'News', path: '/news' },
    { name: 'Profile', path: '/profile' }
  ];

  return (
    <>
      <nav className="sticky top-0 z-50 h-16 w-full bg-navy text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2">
            <ShieldCheck className="text-teal w-8 h-8" />
            <span className="font-bold text-xl">MediGuard</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            {!user ? (
              <>
                <Link to="/login" className="px-4 py-2 border border-white rounded-xl hover:bg-white hover:text-navy transition-all duration-200">Login</Link>
                <Link to="/signup" className="px-4 py-2 bg-teal rounded-xl hover:bg-teal/90 transition-all duration-200">Sign Up</Link>
              </>
            ) : (
              <>
                {navLinks.map(link => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`hover:text-teal transition-all duration-200 ${location.pathname === link.path ? 'text-teal font-semibold border-b-2 border-teal' : ''}`}
                  >
                    {link.name}
                  </Link>
                ))}
                <div className="w-8 h-8 rounded-full bg-skyblue flex items-center justify-center font-bold">
                  {user.email?.charAt(0).toUpperCase() || 'U'}
                </div>
                <button onClick={signOut} className="text-sm text-gray-300 hover:text-white transition-all duration-200">Log Out</button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-300 hover:text-white">
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {isOpen && (
          <div className="md:hidden bg-navy border-t border-gray-700 pb-4 absolute w-full left-0 top-16 shadow-lg">
            <div className="flex flex-col px-4 pt-2 pb-3 space-y-2 sm:px-3">
              {!user ? (
                <>
                  <Link to="/login" className="block px-3 py-2 border border-white rounded-xl text-center hover:bg-white hover:text-navy transition-all" onClick={() => setIsOpen(false)}>Login</Link>
                  <Link to="/signup" className="block px-3 py-2 bg-teal rounded-xl text-center hover:bg-teal/90 transition-all" onClick={() => setIsOpen(false)}>Sign Up</Link>
                </>
              ) : (
                <>
                  {navLinks.map(link => (
                    <Link
                      key={link.path}
                      to={link.path}
                      className={`block px-3 py-2 text-base font-medium rounded-md transition-all ${location.pathname === link.path ? 'bg-gray-800 text-teal' : 'hover:bg-gray-700'}`}
                      onClick={() => setIsOpen(false)}
                    >
                      {link.name}
                    </Link>
                  ))}
                  <button onClick={() => { signOut(); setIsOpen(false); }} className="block w-full text-left px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-md transition-all mt-2">Log Out</button>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
