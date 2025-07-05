import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Users, Trophy, Calendar, Award } from "lucide-react";

interface Stat {
  icon: React.ComponentType<any>;
  value: number;
  label: string;
  color: string;
}

export default function StatsSection() {
  const [animatedStats, setAnimatedStats] = useState([0, 0, 0, 0]);
  
  const { data: stats } = useQuery({
    queryKey: ["/api/stats"],
    refetchOnWindowFocus: false,
  });

  const statsConfig: Stat[] = [
    {
      icon: Users,
      value: stats?.members || 150,
      label: "Active Members",
      color: "var(--accent-blue)"
    },
    {
      icon: Trophy,
      value: stats?.projects || 45,
      label: "Projects Completed",
      color: "var(--accent-purple)"
    },
    {
      icon: Calendar,
      value: stats?.events || 25,
      label: "Events Hosted",
      color: "var(--gaming-green)"
    },
    {
      icon: Award,
      value: stats?.awards || 12,
      label: "Awards Won",
      color: "var(--orange-500)"
    }
  ];

  useEffect(() => {
    // Animate counters when component mounts
    statsConfig.forEach((stat, index) => {
      let current = 0;
      const increment = stat.value / 50; // 50 steps
      const timer = setInterval(() => {
        current += increment;
        if (current >= stat.value) {
          current = stat.value;
          clearInterval(timer);
        }
        setAnimatedStats(prev => {
          const newStats = [...prev];
          newStats[index] = Math.floor(current);
          return newStats;
        });
      }, 40);
    });
  }, [stats]);

  return (
    <section className="py-20 bg-[var(--dark-secondary)]">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-16 text-white">Club Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {statsConfig.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <div 
                key={index}
                className="gaming-card rounded-xl p-8 text-center hover:scale-105 transition-transform duration-300"
              >
                <div 
                  className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{ backgroundColor: stat.color }}
                >
                  <IconComponent className="h-8 w-8 text-white" />
                </div>
                <div className="text-3xl font-bold text-white mb-2">
                  {animatedStats[index]}+
                </div>
                <div className="text-slate-400">{stat.label}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
