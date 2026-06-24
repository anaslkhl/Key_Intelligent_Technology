import { Link } from "react-router-dom";
import { Mail, Phone, MapPin } from "lucide-react";
import {
  FaFacebook,
  FaInstagram,
  FaLinkedin,
  FaTwitter,
  FaYoutube,
} from "react-icons/fa";

const columns = [
  {
    title: "Product",
    links: [
      ["KIT Robotics website", "https://www.keyintelligenttechnology.com"],
      ["Products", "https://www.keyintelligenttechnology.com"],
      ["Pricing", "/register"],
    ],
  },
  {
    title: "Support",
    links: [
      ["Contact", "/tickets/create"],
      ["Help Center", "/knowledge-base"],
      ["Status", "/"],
    ],
  },
  {
    title: "Community",
    links: [
      ["Forum", "/forum"],
      ["Feature Requests", "/features"],
      ["Reviews", "/reviews"],
    ],
  },
  {
    title: "Company",
    links: [
      ["About", "https://www.keyintelligenttechnology.com"],
      ["Careers", "https://www.keyintelligenttechnology.com"],
      ["Blog", "https://www.keyintelligenttechnology.com"],
    ],
  },
];

const socialLinks = [
  { icon: FaFacebook, href: "https://facebook.com", label: "Facebook" },
  { icon: FaInstagram, href: "https://instagram.com", label: "Instagram" },
  { icon: FaLinkedin, href: "https://linkedin.com", label: "LinkedIn" },
  { icon: FaTwitter, href: "https://twitter.com", label: "Twitter" },
  { icon: FaYoutube, href: "https://youtube.com", label: "YouTube" },
];

export default function Footer() {
  return (
    <footer className="bg-slate-900 px-3 pb-8 pt-16 text-slate-300 dark:bg-[#0a1628] sm:px-4">
      <div className="mx-auto max-w-[1200px]">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {columns.map((column) => (
            <div key={column.title}>
              <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                {column.title}
              </h2>
              <ul className="mt-4 grid gap-3 text-sm">
                {column.links.map(([label, to]) => (
                  <li key={label}>
                    {to.startsWith("http") ? (
                      <a
                        href={to}
                        target="_blank"
                        rel="noreferrer"
                        className="transition hover:text-white hover:underline"
                      >
                        {label}
                      </a>
                    ) : (
                      <Link
                        to={to}
                        className="transition hover:text-white hover:underline"
                      >
                        {label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 grid gap-6 border-t border-slate-700 pt-8 sm:grid-cols-2">
          <div>
            <h3 className="text-sm font-semibold text-white">Follow Us</h3>
            <div className="mt-3 flex gap-3">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={social.label}
                    className="rounded-full bg-slate-800 p-2.5 text-slate-400 transition hover:bg-blue-600 hover:text-white dark:bg-slate-800/50"
                  >
                    <Icon size={18} />
                  </a>
                );
              })}
            </div>
          </div>

          <div className="text-right sm:text-left">
            <h3 className="text-sm font-semibold text-white">Get in Touch</h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-400">
              <li className="flex items-center gap-2 justify-end sm:justify-start">
                <Mail size={16} className="text-blue-400" />
                <a
                  href="mailto:support@kitrobotics.com"
                  className="hover:text-white hover:underline"
                >
                  support@kitrobotics.com
                </a>
              </li>
              <li className="flex items-center gap-2 justify-end sm:justify-start">
                <Phone size={16} className="text-blue-400" />
                <a
                  href="tel:+212123456789"
                  className="hover:text-white hover:underline"
                >
                  +212 6 64 04 68 35
                </a>
              </li>
              <li className="flex items-center gap-2 justify-end sm:justify-start">
                <MapPin size={16} className="text-blue-400" />
                <span>Morocco</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-slate-700 pt-6 text-sm text-slate-500 sm:flex-row">
          <span>© 2026 KIT Robotics. All rights reserved.</span>
          <div className="flex gap-6">
            <Link to="/privacy" className="hover:text-white hover:underline">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-white hover:underline">
              Terms of Service
            </Link>
            <Link to="/cookies" className="hover:text-white hover:underline">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}