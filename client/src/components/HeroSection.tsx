import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, Play, Users, Trophy, Gamepad2, Code, Zap } from "lucide-react";

export default function HeroSection() {
  useEffect(() => {
    // GSAP animations
    if (typeof window !== 'undefined' && (window as any).gsap) {
      const gsap = (window as any).gsap;
      
      gsap.from('.hero-title', {
        duration: 1.5,
        y: 50,
        opacity: 0,
        ease: "power2.out",
        delay: 0.5
      });

      gsap.from('.hero-subtitle', {
        duration: 1.2,
        y: 30,
        opacity: 0,
        ease: "power2.out",
        delay: 0.8
      });

      gsap.from('.hero-description', {
        duration: 1,
        y: 30,
        opacity: 0,
        ease: "power2.out",
        delay: 1.1
      });

      gsap.from('.hero-buttons', {
        duration: 1,
        y: 30,
        opacity: 0,
        ease: "power2.out",
        delay: 1.4
      });

      gsap.from('.floating-element', {
        duration: 2,
        y: 50,
        opacity: 0,
        stagger: 0.2,
        ease: "power2.out"
      });

      gsap.from('.hero-image', {
        duration: 2,
        x: 100,
        opacity: 0,
        ease: "power2.out",
        delay: 1.0
      });

      gsap.from('.hero-stats', {
        duration: 1.5,
        y: 30,
        opacity: 0,
        stagger: 0.1,
        ease: "power2.out",
        delay: 1.6
      });
    }
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden" id="home">
      {/* Enhanced background with gradient overlays */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--dark-primary)] via-[var(--dark-secondary)] to-[var(--dark-primary)]"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--accent-blue)]/10 via-transparent to-[var(--accent-purple)]/10"></div>
      </div>
      
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="floating-element absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-[var(--accent-blue)] to-[var(--accent-purple)] rounded-full animate-float blur-sm"></div>
        <div className="floating-element absolute bottom-20 right-10 w-24 h-24 bg-gradient-to-r from-[var(--accent-purple)] to-[var(--gaming-green)] rounded-full animate-float blur-sm" style={{animationDelay: '-2s'}}></div>
        <div className="floating-element absolute top-1/2 left-1/4 w-16 h-16 bg-gradient-to-r from-[var(--gaming-green)] to-[var(--accent-blue)] rounded-full animate-float blur-sm" style={{animationDelay: '-4s'}}></div>
        <div className="floating-element absolute top-1/3 right-1/4 w-20 h-20 bg-gradient-to-r from-[var(--orange-500)] to-[var(--accent-purple)] rounded-full animate-float blur-sm" style={{animationDelay: '-6s'}}></div>
      </div>
      
      <div className="container mx-auto px-4 z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <div className="text-center lg:text-left">
            <div className="hero-stats flex justify-center lg:justify-start space-x-6 mb-6">
              <div className="flex items-center space-x-2 text-[var(--accent-blue)]">
                <Users className="h-5 w-5" />
                <span className="text-sm font-medium">150+ Members</span>
              </div>
              <div className="flex items-center space-x-2 text-[var(--gaming-green)]">
                <Trophy className="h-5 w-5" />
                <span className="text-sm font-medium">45+ Projects</span>
              </div>
            </div>
            
            <h1 className="hero-title text-4xl md:text-6xl lg:text-7xl font-bold mb-6">
              <span className="bg-gradient-to-r from-[var(--accent-blue)] via-[var(--accent-purple)] to-[var(--gaming-green)] bg-clip-text text-transparent">
                Level Up
              </span>
              <br />
              <span className="text-white">Your Game Dev</span>
              <br />
              <span className="bg-gradient-to-r from-[var(--gaming-green)] via-[var(--accent-purple)] to-[var(--accent-blue)] bg-clip-text text-transparent">
                Journey
              </span>
            </h1>
            
            <h2 className="hero-subtitle text-xl md:text-2xl font-semibold text-slate-300 mb-8">
              Game Development Group Students Club
            </h2>
            
            <p className="hero-description text-lg md:text-xl text-slate-400 mb-12 max-w-2xl mx-auto lg:mx-0">
              Join our community of passionate game developers, learn cutting-edge technologies, and create amazing gaming experiences with modern tools and expert mentorship.
            </p>
            
            <div className="hero-buttons flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button className="bg-gradient-to-r from-[var(--accent-blue)] to-[var(--accent-purple)] hover:from-blue-600 hover:to-purple-600 text-white px-8 py-4 text-lg font-medium transition-all duration-300 hover:scale-105 animate-glow">
                Join Our Club
              </Button>
              <Button 
                variant="outline" 
                className="border-2 border-[var(--gaming-green)] text-[var(--gaming-green)] hover:bg-[var(--gaming-green)] hover:text-white px-8 py-4 text-lg font-medium transition-all duration-300 group"
              >
                <Play className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                Watch Demo
              </Button>
            </div>
          </div>
          
          {/* Right content - Interactive Gaming Elements */}
          <div className="hero-image relative">
            <div className="relative z-10">
              {/* Central Gaming Hub */}
              <div className="w-80 h-80 mx-auto relative">
                {/* Main circle */}
                <div className="w-full h-full bg-gradient-to-br from-[var(--accent-blue)]/20 via-[var(--accent-purple)]/30 to-[var(--gaming-green)]/20 rounded-full border-2 border-[var(--accent-blue)]/50 backdrop-blur-lg flex items-center justify-center animate-pulse-slow">
                  <div className="w-32 h-32 bg-gradient-to-br from-[var(--accent-blue)] to-[var(--accent-purple)] rounded-full flex items-center justify-center animate-glow">
                    <Gamepad2 className="h-16 w-16 text-white" />
                  </div>
                </div>
                
                {/* Orbiting elements */}
                <div className="absolute top-4 right-8 w-16 h-16 bg-[var(--gaming-green)]/20 rounded-full border border-[var(--gaming-green)] backdrop-blur-md flex items-center justify-center animate-float">
                  <Code className="h-8 w-8 text-[var(--gaming-green)]" />
                </div>
                
                <div className="absolute bottom-8 left-4 w-20 h-20 bg-[var(--accent-purple)]/20 rounded-full border border-[var(--accent-purple)] backdrop-blur-md flex items-center justify-center animate-float" style={{animationDelay: '-2s'}}>
                  <Zap className="h-10 w-10 text-[var(--accent-purple)]" />
                </div>
                
                <div className="absolute top-1/2 -right-4 w-12 h-12 bg-[var(--orange-500)]/20 rounded-full border border-[var(--orange-500)] backdrop-blur-md flex items-center justify-center animate-float" style={{animationDelay: '-4s'}}>
                  <Trophy className="h-6 w-6 text-[var(--orange-500)]" />
                </div>
              </div>
            </div>
            
            {/* Floating UI elements */}
            <div className="absolute -top-4 -right-4 gaming-card rounded-xl p-4 animate-float" style={{animationDelay: '-1s'}}>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-[var(--gaming-green)] rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-white">Live Workshop</span>
              </div>
            </div>
            
            <div className="absolute -bottom-4 -left-4 gaming-card rounded-xl p-4 animate-float" style={{animationDelay: '-3s'}}>
              <div className="text-center">
                <div className="text-2xl font-bold text-[var(--accent-purple)]">25+</div>
                <div className="text-xs text-slate-400">Active Projects</div>
              </div>
            </div>
            
            <div className="absolute top-1/4 -left-8 gaming-card rounded-xl p-3 animate-float" style={{animationDelay: '-5s'}}>
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-[var(--accent-blue)]" />
                <span className="text-xs font-medium text-white">150+ Members</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Scroll indicator */}
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
        <ChevronDown className="text-[var(--accent-blue)] h-8 w-8" />
      </div>
    </section>
  );
}
