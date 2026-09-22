import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { LayoutDashboard, PlusCircle, History, Menu, X, Leaf } from 'lucide-react';

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Log Activity', path: '/log', icon: PlusCircle },
    { name: 'History', path: '/history', icon: History }
  ];

  return (
    <header className="glass-nav sticky top-0 z-40 shadow-xs transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Brand */}
          <Link
            to="/"
            className="flex items-center space-x-2.5 group focus:outline-none"
            aria-label="PlanetPulse Home"
          >
            <div className="w-10 h-10 rounded-xl bg-forest-900 flex items-center justify-center text-white shadow-xs transition-transform duration-200 group-hover:scale-105 group-hover:bg-forest-950">
              <Leaf className="w-5 h-5 text-mint-400" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-forest-950 font-sans">
                Planet<span className="text-forest-600">Pulse</span>
              </span>
              <span className="hidden sm:inline-block ml-2 text-[11px] uppercase tracking-wider px-2 py-0.5 bg-forest-50 text-forest-800 font-bold rounded-full border border-forest-200/60">
                Climate Tech
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1.5" aria-label="Main Navigation">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.path}
                  to={link.path}
                  end={link.path === '/'}
                  className={({ isActive }) =>
                    `flex items-center space-x-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-150 ${
                      isActive
                        ? 'bg-forest-100/80 text-forest-950 border border-forest-200/80 shadow-xs'
                        : 'text-gray-600 hover:text-forest-900 hover:bg-forest-50/60'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.name}</span>
                </NavLink>
              );
            })}

            <Link
              to="/log"
              className="ml-3 inline-flex items-center space-x-1.5 px-4 py-2 bg-forest-800 hover:bg-forest-900 active:scale-98 text-white text-sm font-bold rounded-xl shadow-xs hover:shadow-sm transition-all focus:ring-2 focus:ring-forest-600 focus:ring-offset-2"
            >
              <PlusCircle className="w-4 h-4 text-mint-300" />
              <span>Log Activity</span>
            </Link>
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              type="button"
              className="p-2 rounded-xl text-gray-700 hover:text-forest-950 hover:bg-forest-50 transition-colors focus:outline-none focus:ring-2 focus:ring-forest-600"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200/80 bg-white/95 backdrop-blur-md px-4 pt-3 pb-5 space-y-1.5 shadow-lg animate-fade-in">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.path}
                to={link.path}
                end={link.path === '/'}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-base font-semibold transition-colors ${
                    isActive
                      ? 'bg-forest-100/90 text-forest-950 border border-forest-200'
                      : 'text-gray-700 hover:text-forest-950 hover:bg-forest-50/60'
                  }`
                }
              >
                <Icon className="w-5 h-5" />
                <span>{link.name}</span>
              </NavLink>
            );
          })}
          <div className="pt-2.5">
            <Link
              to="/log"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 bg-forest-800 text-white rounded-xl font-bold shadow-xs hover:bg-forest-900 transition-colors"
            >
              <PlusCircle className="w-5 h-5 text-mint-300" />
              <span>Log Activity</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
