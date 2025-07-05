import { useQuery } from "@tanstack/react-query";
import { ExternalLink, Github, Linkedin, Twitter } from "lucide-react";

export default function MentorsSection() {
  const { data: mentors, isLoading } = useQuery({
    queryKey: ["/api/mentors"],
    refetchOnWindowFocus: false,
  });

  if (isLoading) {
    return (
      <section className="py-20 bg-[var(--dark-secondary)]" id="mentors">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16 text-white">Our Mentors</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="gaming-card rounded-xl p-8 text-center animate-pulse">
                <div className="w-24 h-24 bg-slate-600 rounded-full mx-auto mb-4"></div>
                <div className="h-6 bg-slate-600 rounded mb-2"></div>
                <div className="h-4 bg-slate-500 rounded mb-4"></div>
                <div className="h-16 bg-slate-600 rounded mb-4"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  const defaultMentors = [
    {
      id: 1,
      name: "Dr. Sarah Johnson",
      role: "Senior Game Developer",
      bio: "15+ years experience in AAA game development. Former lead at Epic Games.",
      imageUrl: "https://images.unsplash.com/photo-1494790108755-2616b612b977?ixlib=rb-4.0.3&w=150&h=150&fit=crop&crop=face",
      linkedinUrl: "#",
      twitterUrl: "#"
    },
    {
      id: 2,
      name: "Maria Rodriguez",
      role: "Game Designer",
      bio: "Award-winning indie game designer specializing in narrative-driven games.",
      imageUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&w=150&h=150&fit=crop&crop=face",
      linkedinUrl: "#",
      portfolioUrl: "#"
    },
    {
      id: 3,
      name: "Alex Chen",
      role: "Technical Director",
      bio: "Expert in game engine architecture and performance optimization.",
      imageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&w=150&h=150&fit=crop&crop=face",
      githubUrl: "#",
      linkedinUrl: "#"
    }
  ];

  const mentorsToShow = mentors && Array.isArray(mentors) && mentors.length > 0 ? mentors : defaultMentors;

  const getRoleColor = (role: string) => {
    if (role.toLowerCase().includes('developer')) return 'var(--accent-blue)';
    if (role.toLowerCase().includes('designer')) return 'var(--accent-purple)';
    if (role.toLowerCase().includes('director')) return 'var(--gaming-green)';
    return 'var(--accent-blue)';
  };

  return (
    <section className="py-20 bg-[var(--dark-secondary)]" id="mentors">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-16 text-white">Our Mentors</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {mentorsToShow.map((mentor: any) => (
            <div key={mentor.id} className="gaming-card card-hover-effect rounded-xl p-6 text-center relative group">
              <div className="relative mb-6">
                <div 
                  className="w-20 h-20 rounded-full mx-auto mb-4 object-cover border-4 animate-pulse-slow relative z-10"
                  style={{ borderColor: getRoleColor(mentor.role) }}
                >
                  <img 
                    src={mentor.imageUrl} 
                    alt={mentor.name} 
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>
                <div 
                  className="absolute inset-0 w-20 h-20 mx-auto rounded-full blur-md opacity-30 animate-pulse"
                  style={{ backgroundColor: getRoleColor(mentor.role) }}
                ></div>
              </div>
              
              <h3 className="text-lg font-semibold text-white mb-2">{mentor.name}</h3>
              <p className="text-sm mb-3 font-medium" style={{ color: getRoleColor(mentor.role) }}>
                {mentor.role}
              </p>
              <p className="text-slate-400 text-xs mb-6 leading-relaxed line-clamp-3">{mentor.bio}</p>
              
              <div className="flex justify-center space-x-3">
                {mentor.linkedinUrl && (
                  <a 
                    href={mentor.linkedinUrl} 
                    className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-125 group/icon"
                    style={{ backgroundColor: getRoleColor(mentor.role) + '20' }}
                  >
                    <Linkedin className="h-4 w-4 group-hover/icon:animate-pulse" style={{ color: getRoleColor(mentor.role) }} />
                  </a>
                )}
                {mentor.twitterUrl && (
                  <a 
                    href={mentor.twitterUrl} 
                    className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-125 group/icon"
                    style={{ backgroundColor: getRoleColor(mentor.role) + '20' }}
                  >
                    <Twitter className="h-4 w-4 group-hover/icon:animate-pulse" style={{ color: getRoleColor(mentor.role) }} />
                  </a>
                )}
                {mentor.githubUrl && (
                  <a 
                    href={mentor.githubUrl} 
                    className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-125 group/icon"
                    style={{ backgroundColor: getRoleColor(mentor.role) + '20' }}
                  >
                    <Github className="h-4 w-4 group-hover/icon:animate-pulse" style={{ color: getRoleColor(mentor.role) }} />
                  </a>
                )}
                {mentor.portfolioUrl && (
                  <a 
                    href={mentor.portfolioUrl} 
                    className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-125 group/icon"
                    style={{ backgroundColor: getRoleColor(mentor.role) + '20' }}
                  >
                    <ExternalLink className="h-4 w-4 group-hover/icon:animate-pulse" style={{ color: getRoleColor(mentor.role) }} />
                  </a>
                )}
              </div>
              
              {/* Corner decoration */}
              <div 
                className="absolute top-4 right-4 w-2 h-2 rounded-full opacity-60 animate-pulse"
                style={{ backgroundColor: getRoleColor(mentor.role) }}
              ></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
