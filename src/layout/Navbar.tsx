import { useState } from "react";
import { TrendingUp, Menu, X } from "lucide-react";
import { Link, useLocation } from 'react-router-dom';

const NAV_LINKS = [
  { label: 'Dashboard', path: '/' },
  { label: 'News',      path: '/news' },
];

export const Navbar = () => {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  return (
    <nav className="py-3 font-sans border-b border-white/10 bg-surface-950/80 backdrop-blur-sm sticky top-0 z-50 px-5">
      <div className="flex justify-between items-center max-w-300 mx-auto">
        <div className="flex items-center gap-3">
          <div className="bg-accent-500 p-2">
            <TrendingUp className="text-black" size={15} strokeWidth={3} />
          </div>
          <span className="font-bold text-lg">Metal Metrics</span>
        </div>
        <ul className="hidden md:flex items-center gap-10 font-medium">
          {NAV_LINKS.map((link) => (
            <li key={link.path}>
              <Link
                to={link.path}
                className={`text-sm transition-colors ${
                  location.pathname === link.path
                    ? 'text-white'
                    : 'text-surface-300 hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <button
          className="md:hidden text-surface-200"
          onClick={() => setOpen(!open)}>
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
      {open && (
        <div className={`md:hidden py-4 space-y-4 overflow-hidden backdrop-blur-sm bg-surface-950/90 transition-all duration-300 ease-in-out ${
          open ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'}`}
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setOpen(false)}
              className={`block text-sm transition-colors px-4 ${
                location.pathname === link.path
                  ? 'text-white'
                  : 'text-surface-300 hover:text-white'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
};