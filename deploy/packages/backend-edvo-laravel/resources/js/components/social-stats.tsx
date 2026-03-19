import { Youtube, Users, GraduationCap, Star } from 'lucide-react';

interface SocialStat {
  icon: React.ReactNode;
  value: string;
  label: string;
  color?: string;
}

interface SocialStatsProps {
  stats?: SocialStat[];
  className?: string;
}

const SocialStats = ({
  stats = [
    {
      icon: <Youtube className="w-8 h-8" />,
      value: "1.4M+",
      label: "YouTube Subscribers",
      color: "text-red-600",
    },
    {
      icon: <Users className="w-8 h-8" />,
      value: "667K+",
      label: "Enrolled Learners",
      color: "text-blue-600",
    },
    {
      icon: <GraduationCap className="w-8 h-8" />,
      value: "76K+",
      label: "Paid Learners",
      color: "text-green-600",
    },
    {
      icon: <Star className="w-8 h-8" />,
      value: "6000+",
      label: "5 star Reviews",
      color: "text-yellow-600",
    },
  ],
  className = "",
}: SocialStatsProps) => {
  return (
    <div className={`bg-gradient-to-r from-purple-900 via-purple-800 to-blue-900 text-white py-6 px-4 rounded-b-lg ${className}`}>
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="flex items-center gap-3 justify-center"
            >
              <div className={`${stat.color} bg-white/10 p-2 rounded-lg`}>
                {stat.icon}
              </div>
              <div className="text-left">
                <div className="text-xl md:text-2xl font-bold">
                  {stat.value}
                </div>
                <div className="text-xs md:text-sm text-gray-300">
                  {stat.label}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SocialStats;
