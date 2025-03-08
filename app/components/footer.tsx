import React from 'react';
import Link from "next/link";
import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gray-50 text-gray-600">
      <div className="container mx-auto px-6 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Company Info Section - */}
          <div className="lg:col-span-2 pl-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">RentalMall</h2>
            <p className="mb-6 text-gray-600 max-w-md">
            Revolutionizing rentals with seamless booking, smart technology, and unparalleled convenience
            </p>
            <div className="flex space-x-4">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" 
                className="bg-white p-2 rounded-full hover:bg-gray-100 transition-colors shadow-sm">
                <Facebook size={20} />
                <span className="sr-only">Facebook</span>
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" 
                className="bg-white p-2 rounded-full hover:bg-gray-100 transition-colors shadow-sm">
                <Twitter size={20} />
                <span className="sr-only">Twitter</span>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" 
                className="bg-white p-2 rounded-full hover:bg-gray-100 transition-colors shadow-sm">
                <Instagram size={20} />
                <span className="sr-only">Instagram</span>
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" 
                className="bg-white p-2 rounded-full hover:bg-gray-100 transition-colors shadow-sm">
                <Linkedin size={20} />
                <span className="sr-only">LinkedIn</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-gray-900 font-semibold mb-4">Company</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/about" className="hover:text-gray-900 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/careers" className="hover:text-gray-900 transition-colors">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-gray-900 transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-gray-900 font-semibold mb-4">Services</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/services/web-design" className="hover:text-gray-900 transition-colors">
                  Web Design
                </Link>
              </li>
              <li>
                <Link href="/services/development" className="hover:text-gray-900 transition-colors">
                  Development
                </Link>
              </li>
              <li>
                <Link href="/services/marketing" className="hover:text-gray-900 transition-colors">
                  Marketing
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-gray-900 font-semibold mb-4">Legal</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/privacy-policy" className="hover:text-gray-900 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms-of-service" className="hover:text-gray-900 transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/cookie-policy" className="hover:text-gray-900 transition-colors">
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm">
              &copy; {new Date().getFullYear()} Rental Mall. All rights reserved.
            </p>
            <p className="text-gray-500 text-sm mt-4 md:mt-0">
            Designed with redefine rentals with ease and innovation
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;