import { Gamepad2, Mail, Phone, MapPin, ExternalLink } from "lucide-react";
import { FaDiscord, FaInstagram, FaTwitter } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-[var(--dark-secondary)] border-t border-slate-700 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gaming-gradient rounded-lg flex items-center justify-center">
                <Gamepad2 className="text-white h-6 w-6" />
              </div>
              <span className="text-xl font-bold text-white">GDGSC</span>
            </div>
            <p className="text-slate-400 mb-4">
              Empowering students to create amazing games and build the future of interactive entertainment.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-[var(--accent-blue)] hover:text-blue-400 transition-colors">
                <FaDiscord className="h-6 w-6" />
              </a>
              <a href="#" className="text-[var(--accent-blue)] hover:text-blue-400 transition-colors">
                <FaInstagram className="h-6 w-6" />
              </a>
              <a href="#" className="text-[var(--accent-blue)] hover:text-blue-400 transition-colors">
                <FaTwitter className="h-6 w-6" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="#home" className="text-slate-400 hover:text-[var(--accent-blue)] transition-colors">Home</a></li>
              <li><a href="#events" className="text-slate-400 hover:text-[var(--accent-blue)] transition-colors">Events</a></li>
              <li><a href="#mentors" className="text-slate-400 hover:text-[var(--accent-blue)] transition-colors">Mentors</a></li>
              <li><a href="#about" className="text-slate-400 hover:text-[var(--accent-blue)] transition-colors">About</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Contact</h3>
            <ul className="space-y-2 text-slate-400">
              <li className="flex items-center">
                <Mail className="h-4 w-4 mr-2 text-[var(--accent-blue)]" />
                gdgsc@university.edu
              </li>
              <li className="flex items-center">
                <Phone className="h-4 w-4 mr-2 text-[var(--accent-blue)]" />
                (555) 123-4567
              </li>
              <li className="flex items-center">
                <MapPin className="h-4 w-4 mr-2 text-[var(--accent-blue)]" />
                CS Building, Room 204
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Meeting Times</h3>
            <ul className="space-y-2 text-slate-400">
              <li>
                <strong className="text-white">Weekly Meetings:</strong><br />
                Thursdays 6:00 PM
              </li>
              <li>
                <strong className="text-white">Workshops:</strong><br />
                Saturdays 2:00 PM
              </li>
              <li>
                <strong className="text-white">Office Hours:</strong><br />
                Mon-Fri 3:00-5:00 PM
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-slate-700 mt-8 pt-8 text-center text-slate-400">
          <p>&copy; 2024 Game Development Group Students Club. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
