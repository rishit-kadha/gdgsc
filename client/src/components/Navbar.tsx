import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";
import { Gamepad2, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  const { user, isAuthenticated } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  return (
    <nav className="fixed top-0 w-full z-50 glass-effect">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 cursor-pointer">
            <div className="w-10 h-10 bg-gaming-gradient rounded-lg flex items-center justify-center">
              <Gamepad2 className="text-white h-6 w-6" />
            </div>
            <span className="text-xl font-bold text-white">GDGSC</span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-slate-300 hover:text-[var(--accent-blue)] transition-colors duration-300">Home</Link>
            {isAuthenticated && (
              <>
                <Link href="/events" className="text-slate-300 hover:text-[var(--accent-blue)] transition-colors duration-300">Events</Link>
                {(user as any)?.email === "rkadha226@gmail.com" && (
                  <Link href="/admin" className="text-[var(--accent-gold)] hover:text-yellow-400 transition-colors duration-300">Admin</Link>
                )}
              </>
            )}
            <a href="#mentors" className="text-slate-300 hover:text-[var(--accent-blue)] transition-colors duration-300">Mentors</a>
            <a href="#about" className="text-slate-300 hover:text-[var(--accent-blue)] transition-colors duration-300">About</a>
          </div>
          
          {/* Auth Section */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <Link href="/dashboard" className="flex items-center space-x-3 cursor-pointer hover:bg-[var(--dark-secondary)] p-2 rounded-lg transition-colors">
                  <img 
                    src={(user as any)?.profileImageUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&w=40&h=40&fit=crop&crop=face"} 
                    alt="Profile" 
                    className="w-8 h-8 rounded-full object-cover border-2 border-[var(--accent-blue)]" 
                  />
                  <span className="text-sm font-medium hidden sm:block">
                    {(user as any)?.firstName} {(user as any)?.lastName}
                  </span>
                </Link>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  size="sm"
                  className="border-slate-600 text-slate-300 hover:text-white hover:bg-slate-700"
                >
                  Logout
                </Button>
              </div>
            ) : (
              <Button
                onClick={handleLogin}
                className="bg-[var(--accent-blue)] hover:bg-blue-600 text-white transition-all duration-300 hover:scale-105"
              >
                Login
              </Button>
            )}
            
            {/* Mobile Menu Button */}
            <button 
              className="md:hidden text-slate-300"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-[var(--dark-secondary)] rounded-lg mt-2 p-4">
            <div className="space-y-4">
              <Link href="/" className="block text-slate-300 hover:text-[var(--accent-blue)] transition-colors">Home</Link>
              {isAuthenticated && (
                <>
                  <Link href="/events" className="block text-slate-300 hover:text-[var(--accent-blue)] transition-colors">Events</Link>
                  {(user as any)?.email === "rkadha226@gmail.com" && (
                    <Link href="/admin" className="block text-[var(--accent-gold)] hover:text-yellow-400 transition-colors">Admin</Link>
                  )}
                </>
              )}
              <a href="#mentors" className="block text-slate-300 hover:text-[var(--accent-blue)] transition-colors">Mentors</a>
              <a href="#about" className="block text-slate-300 hover:text-[var(--accent-blue)] transition-colors">About</a>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
