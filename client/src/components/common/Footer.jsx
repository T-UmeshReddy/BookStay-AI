/**
 * components/common/Footer.jsx
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Instagram, Twitter, Facebook, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-navy-900 text-slate-300 pt-16 pb-8">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-slate-700">

          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center">
                <Compass className="w-5 h-5 text-white" />
              </div>
              <span className="font-display font-bold text-xl text-white">
                Nomad<span className="text-brand-500">Nest</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed mb-5">
              Your home away from home. Affordable dorms, cosy private rooms,
              and a community of wanderers from around the world.
            </p>
            <div className="flex gap-3">
              {[Instagram, Twitter, Facebook].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center
                                               hover:bg-brand-500 transition-colors duration-200">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2.5 text-sm">
              {[
                { label: 'Browse Rooms', to: '/rooms' },
                { label: 'Check Availability', to: '/rooms' },
                { label: 'My Bookings', to: '/dashboard' },
                { label: 'Login', to: '/login' },
                { label: 'Register', to: '/register' },
              ].map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="hover:text-brand-400 transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Policies */}
          <div>
            <h4 className="font-semibold text-white mb-4">Policies</h4>
            <ul className="space-y-2.5 text-sm">
              {['Cancellation Policy', 'Privacy Policy', 'Terms & Conditions', 'House Rules', 'FAQ'].map((item) => (
                <li key={item}>
                  <a href="#" className="hover:text-brand-400 transition-colors">{item}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-white mb-4">Contact Us</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-brand-400 mt-0.5 shrink-0" />
                <span>42 Backpacker Lane, Koramangala, Bengaluru — 560034</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-brand-400 shrink-0" />
                <a href="tel:+919000000000" className="hover:text-brand-400 transition-colors">+91 9000 000 000</a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-brand-400 shrink-0" />
                <a href="mailto:hello@nomadnest.com" className="hover:text-brand-400 transition-colors">hello@nomadnest.com</a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} NomadNest. All rights reserved.</p>
          <p>Built with ❤️ for backpackers everywhere</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
