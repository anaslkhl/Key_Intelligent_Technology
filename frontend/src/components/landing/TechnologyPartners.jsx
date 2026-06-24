import { Link } from "react-router-dom";
import aiInActionLogo from "../../assets/logos/AIVISON.png";
import auboLogo from "../../assets/logos/aubo.png";
import gausiumLogo from "../../assets/logos/gausium.png";
import geekLogo from "../../assets/logos/geek.png";
import hikrobotLogo from "../../assets/logos/hikrobot.png";
import ombrullaLogo from "../../assets/logos/ombrulla.png";
import reemanLogo from "../../assets/logos/reeman.png";
import ubtechLogo from "../../assets/logos/ubtech.png";
import wheelMeLogo from "../../assets/logos/wheelme.png";
import keenon from "../../assets/logos/keenon.png";
import Reveal from "./Reveal";

const partners = [
  { name: "GAUSIUM", file: gausiumLogo },
  { name: "Geek+", file: geekLogo },
  { name: "KEENON", file: keenon },
  { name: "wheel_me", file: wheelMeLogo },
  { name: "REEMAN", file: reemanLogo },
  { name: "AI IN ACTION", file: aiInActionLogo },
  { name: "ombrulla", file: ombrullaLogo },
  { name: "AUBO", file: auboLogo },
  { name: "UBTECH", file: ubtechLogo },
  { name: "HIKROBOT", file: hikrobotLogo },
];

export default function TechnologyPartners() {
  return (
    <section className="technology-partners py-16 bg-white dark:bg-black border-t border-slate-200 dark:border-zinc-800">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center">
          <h2 className="text-sm font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            TRUSTED BY INDUSTRY LEADERS
          </h2>
          <h3 className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
            Our Technology & Industry Partners
          </h3>
          <p className="mt-4 max-w-2xl mx-auto text-slate-600 dark:text-zinc-400">
            We collaborate with leading technology providers, manufacturers, and
            industrial organizations to deliver reliable, scalable, and
            intelligent automation solutions.
          </p>
        </div>

        {/* Partners Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-10">
          {partners.map((partner, index) => (
            <div
              key={index}
              className={`partner-logo-card ${partner.name === "ombrulla" ? "partner-logo-card-dark" : ""}`}
            >
              <img
                src={partner.file}
                alt={partner.name}
                className="partner-logo"
              />
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <a
            href="/case-studies"
            className="partner-case-studies-button inline-flex items-center gap-2"
          >
            View Case Studies
          </a>
        </div>
      </div>
    </section>
  );
}
