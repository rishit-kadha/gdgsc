import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Link } from "wouter";
import { ArrowLeft, Star, Trophy, Users, Code, Palette, Rocket } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export default function Dashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();

  const { data: userEvents, isLoading: eventsLoading } = useQuery({
    queryKey: ["/api/user/events"],
    enabled: isAuthenticated,
  });

  const { data: userBadges, isLoading: badgesLoading } = useQuery({
    queryKey: ["/api/user/badges"],
    enabled: isAuthenticated,
  });

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-[var(--dark-primary)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[var(--accent-blue)]"></div>
      </div>
    );
  }

  const expProgress = ((user.exp || 0) % 1000) / 10; // Progress to next level
  const nextLevelExp = 1000 - ((user.exp || 0) % 1000);

  return (
    <div className="min-h-screen bg-[var(--dark-primary)] pt-16">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Dashboard Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <img 
              src={user.profileImageUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&w=80&h=80&fit=crop&crop=face"} 
              alt="Profile" 
              className="w-16 h-16 rounded-full border-4 border-[var(--accent-blue)] object-cover" 
            />
            <div>
              <h1 className="text-3xl font-bold text-white">
                {user.firstName} {user.lastName}
              </h1>
              <p className="text-slate-400">Game Developer</p>
            </div>
          </div>
          <Link
            href="/"
            className="bg-[var(--dark-secondary)] hover:bg-slate-600 text-white px-6 py-2 rounded-lg transition-colors inline-flex items-center"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </div>

        {/* Bento Grid Dashboard */}
        <div className="bento-grid">
          {/* EXP Card */}
          <div className="bento-item gaming-card rounded-xl p-6 flex flex-col justify-center">
            <div className="text-center">
              <div className="w-20 h-20 bg-[var(--accent-blue)] rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">{user.exp || 0}</h3>
              <p className="text-slate-400">Experience Points</p>
              <div className="w-full bg-[var(--dark-secondary)] rounded-full h-2 mt-4">
                <Progress value={expProgress} className="h-2" />
              </div>
              <p className="text-xs text-slate-500 mt-2">{nextLevelExp} XP to next level</p>
            </div>
          </div>

          {/* Rank & Level Card */}
          <div className="bento-item gaming-card rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Rank & Level</h3>
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-3xl font-bold text-[var(--accent-purple)]">{user.rank || "Beginner"}</div>
                <div className="text-slate-400">Level <span className="text-white font-semibold">{user.level || 1}</span></div>
              </div>
              <div className="w-16 h-16 bg-[var(--accent-purple)] rounded-full flex items-center justify-center">
                <Trophy className="h-8 w-8 text-white" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Projects Completed</span>
                <span className="text-white">{user.projectsCompleted || 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Workshops Attended</span>
                <span className="text-white">{user.workshopsAttended || 0}</span>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bento-item gaming-card rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Recent Activity</h3>
            {eventsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-slate-600 rounded mb-2"></div>
                    <div className="h-3 bg-slate-700 rounded w-2/3"></div>
                  </div>
                ))}
              </div>
            ) : userEvents && userEvents.length > 0 ? (
              <div className="space-y-3">
                {userEvents.slice(0, 3).map((participation: any, index: number) => (
                  <div key={participation.id} className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${
                      index === 0 ? 'bg-[var(--gaming-green)]' : 
                      index === 1 ? 'bg-[var(--accent-blue)]' : 'bg-[var(--accent-purple)]'
                    }`}></div>
                    <div className="flex-1">
                      <p className="text-sm text-white">{participation.event.title}</p>
                      <p className="text-xs text-slate-400">
                        {new Date(participation.participationDate).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`text-sm ${
                      index === 0 ? 'text-[var(--gaming-green)]' : 
                      index === 1 ? 'text-[var(--accent-blue)]' : 'text-[var(--accent-purple)]'
                    }`}>
                      +{participation.expGained || 50} XP
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-400">No recent activity</p>
            )}
          </div>

          {/* Events Participated */}
          <div className="bento-item gaming-card rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Events Participated</h3>
            {eventsLoading ? (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <Card key={i} className="bg-slate-600 animate-pulse">
                    <CardContent className="p-4">
                      <div className="h-4 bg-slate-500 rounded mb-2"></div>
                      <div className="h-3 bg-slate-500 rounded w-2/3"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : userEvents && userEvents.length > 0 ? (
              <div className="space-y-4">
                {userEvents.slice(0, 3).map((participation: any) => (
                  <div key={participation.id} className="border border-slate-600 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-white">{participation.event.title}</h4>
                      <span className="text-xs bg-[var(--gaming-green)] text-white px-2 py-1 rounded">
                        {participation.event.status}
                      </span>
                    </div>
                    <p className="text-sm text-slate-400 mb-2">
                      {new Date(participation.event.date).toLocaleDateString()}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-400">
                        {participation.rank ? 'Rank' : 'Skill Gained'}
                      </span>
                      <span className="text-sm text-[var(--accent-blue)]">
                        {participation.rank || participation.event.skillGained || 'Unity Basics'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-400">No events participated yet</p>
            )}
          </div>

          {/* Skills & Badges */}
          <div className="bento-item gaming-card rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Skills & Badges</h3>
            {badgesLoading ? (
              <div className="grid grid-cols-2 gap-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-slate-600 rounded-lg p-3 animate-pulse">
                    <div className="h-6 w-6 bg-slate-500 rounded mx-auto mb-2"></div>
                    <div className="h-3 bg-slate-500 rounded"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[var(--dark-secondary)] rounded-lg p-3 text-center">
                  <Code className="h-6 w-6 text-[var(--accent-blue)] mx-auto mb-2" />
                  <p className="text-xs text-white font-medium">Unity Master</p>
                </div>
                
                <div className="bg-[var(--dark-secondary)] rounded-lg p-3 text-center">
                  <Palette className="h-6 w-6 text-[var(--accent-purple)] mx-auto mb-2" />
                  <p className="text-xs text-white font-medium">Game Artist</p>
                </div>
                
                <div className="bg-[var(--dark-secondary)] rounded-lg p-3 text-center">
                  <Users className="h-6 w-6 text-[var(--gaming-green)] mx-auto mb-2" />
                  <p className="text-xs text-white font-medium">Team Player</p>
                </div>
                
                <div className="bg-[var(--dark-secondary)] rounded-lg p-3 text-center">
                  <Rocket className="h-6 w-6 text-[var(--orange-500)] mx-auto mb-2" />
                  <p className="text-xs text-white font-medium">Game Jammer</p>
                </div>
              </div>
            )}
            
            <div className="mt-4">
              <h4 className="text-sm font-medium text-white mb-2">Progress to Next Badge</h4>
              <Progress value={60} className="h-2" />
              <p className="text-xs text-slate-400 mt-1">Advanced Developer - 2 projects away</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
