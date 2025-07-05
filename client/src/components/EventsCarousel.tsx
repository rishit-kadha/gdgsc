import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function EventsCarousel() {
  const { data: events, isLoading } = useQuery({
    queryKey: ["/api/events"],
    refetchOnWindowFocus: false,
  });



  if (isLoading) {
    return (
      <section className="py-20" id="events">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16 text-white">Club Events</h2>
          <div className="flex space-x-6 overflow-x-auto pb-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex-none w-80 gaming-card rounded-xl overflow-hidden animate-pulse">
                <div className="w-full h-48 bg-slate-600"></div>
                <div className="p-6">
                  <div className="h-4 bg-slate-600 rounded mb-2"></div>
                  <div className="h-6 bg-slate-500 rounded mb-3"></div>
                  <div className="h-16 bg-slate-600 rounded mb-4"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-[var(--gaming-green)]';
      case 'upcoming':
        return 'bg-[var(--accent-purple)]';
      case 'ongoing':
        return 'bg-[var(--accent-blue)]';
      default:
        return 'bg-slate-500';
    }
  };

  return (
    <section className="py-20" id="events">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-16 text-white">Club Events</h2>
        <div className="relative overflow-hidden">
          <div className="infinite-carousel flex space-x-6 py-8">
            {events && Array.isArray(events) && events.length > 0 ? (
              // Triple the events for seamless infinite scroll
              [...events, ...events, ...events].map((event: any, index: number) => (
                <div key={`event-${event.id}-${Math.floor(index / events.length)}`} className="flex-none w-80 gaming-card card-hover-effect rounded-xl overflow-hidden">
                  <div className="relative">
                    <img 
                      src={event.imageUrl || "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&w=400&h=200&fit=crop"} 
                      alt={event.title} 
                      className="w-full h-48 object-cover" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[var(--dark-primary)]/80 via-transparent to-transparent"></div>
                    <Badge className={`absolute top-4 right-4 ${getStatusColor(event.status)} text-white font-medium`}>
                      {event.status}
                    </Badge>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm text-[var(--accent-blue)] font-medium">
                        {new Date(event.date).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </div>
                      <div className="flex items-center text-xs text-slate-400">
                        <span className="w-2 h-2 bg-[var(--gaming-green)] rounded-full mr-1 animate-pulse"></span>
                        {event.participants} joined
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-3 line-clamp-2">{event.title}</h3>
                    <p className="text-slate-400 mb-4 line-clamp-3 text-sm leading-relaxed">{event.description}</p>
                    <div className="flex items-center justify-between pt-4 border-t border-slate-700">
                      <div className="text-xs text-slate-500">
                        Skill: <span className="text-[var(--accent-purple)] font-medium">{event.skillGained}</span>
                      </div>
                      <button className="bg-gradient-to-r from-[var(--accent-blue)] to-[var(--accent-purple)] text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-blue-600 hover:to-purple-600 transition-all duration-300 hover:scale-105">
                        Learn More
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="w-full text-center text-slate-400 py-12">
                <p>No events available at the moment</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
