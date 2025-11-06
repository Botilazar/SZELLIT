import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../../AuthContext";
import LoadingAnimation from "../../Components/LoadingAnimation/LoadingAnimation";

interface Badge {
  badge_id: number;
  name: string;
  icon_url: string;
  min_honors: number;
  description?: string;
}

interface HonorsPayload {
  totalHonors: number;
  currentBadge: Badge | null;
  earnedBadges: Badge[];
}

const BadgesShowcasePage = () => {
  const { user } = useAuth();
  const userId = user?.user_id ?? null;

  const [badges, setBadges] = useState<Badge[]>([]);
  const [honors, setHonors] = useState<HonorsPayload | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const API_URL = import.meta.env.VITE_API_BASE_URL;

        const resBadges = await fetch(`${API_URL}/api/badges`, {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });
        if (!resBadges.ok) throw new Error("Failed to fetch badges");
        const dataBadges: Badge[] = await resBadges.json();

        let dataHonors: HonorsPayload | null = null;
        if (userId) {
          const resHonors = await fetch(`${API_URL}/api/honors/${userId}`, {
            method: "GET",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
          });
          if (!resHonors.ok) throw new Error("Failed to fetch honors");
          dataHonors = await resHonors.json();
        }

        if (alive) {
          setBadges(dataBadges);
          setHonors(dataHonors);
          setLoading(false);
        }
      } catch (err) {
        console.error(err);
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [userId]);

  if (loading) return <LoadingAnimation />;

  const particles = [
    {
      size: "w-64 h-64",
      color: "bg-blue-400",
      top: "5%",
      left: "10%",
      duration: 22,
    },
    {
      size: "w-80 h-80",
      color: "bg-pink-400",
      bottom: "15%",
      right: "5%",
      duration: 24,
    },
    {
      size: "w-48 h-48",
      color: "bg-yellow-300",
      top: "25%",
      right: "20%",
      duration: 20,
    },
    {
      size: "w-36 h-36",
      color: "bg-green-300",
      top: "60%",
      left: "15%",
      duration: 21,
    },
    {
      size: "w-72 h-72",
      color: "bg-purple-300",
      bottom: "10%",
      left: "25%",
      duration: 23,
    },
  ];

  return (
    <div className="relative w-full min-h-screen bg-gradient-to-b szellit-background  py-6 px-6 overflow-x-hidden">
      {/* Floating background particles */}
      {particles.map((p, i) => (
        <motion.div
          key={i}
          className={`absolute ${p.size} ${p.color} rounded-full opacity-10 pointer-events-none z-0`}
          style={{ top: p.top, bottom: p.bottom, left: p.left, right: p.right }}
          animate={{
            x: [0, 40, -20, 0],
            y: [0, 30, -15, 0],
            rotate: [0, 15, -15, 0],
            scale: [1, 1.3, 0.8, 1],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Minimal Header */}
      <div className="text-center mb-8 z-10 relative">
        <h1 className="text-3xl font-semibold">Honors & Badges</h1>
        <p className="szellit-text mt-2">
          Explore all achievable badges and your progress.
        </p>
      </div>

      {/* Badges content */}
      <div className="flex flex-col gap-8 max-w-5xl mx-auto relative z-10">
        {badges.map((b, idx) => {
          const unlocked = (honors?.totalHonors ?? 0) >= b.min_honors;
          const slideFrom = idx % 2 === 0 ? "-150px" : "150px";

          return (
            <motion.div
              key={b.badge_id}
              className="w-full flex flex-col md:flex-row items-center gap-6 p-6 rounded-2xl shadow-md badge-unlocked"
              initial={{ x: slideFrom, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 1, delay: idx * 0.1 }}
            >
              {/* Badge Icon */}
              <motion.div
                className="relative"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                <img
                  src={b.icon_url}
                  alt={b.name}
                  className={`w-48 h-48 md:w-56 md:h-56 flex-shrink-0 ${
                    unlocked ? "" : "grayscale opacity-50"
                  }`}
                />
              </motion.div>

              {/* Description */}
              <div className="flex-1">
                <h2 className="text-3xl font-bold mb-4">{b.name}</h2>
                <p className="text-base szellit-text-dim leading-relaxed mb-4">
                  {b.description ||
                    `Requires ${b.min_honors} honors to unlock this badge.`}
                </p>

                {/* Progress bar */}
                <div className="w-full szellit-progressbar-remaining h-4 rounded-full overflow-hidden">
                  <motion.div
                    className="h-4 rounded-full szellit-progressbar"
                    initial={{ width: 0 }}
                    animate={{
                      width: `${Math.min(
                        ((honors?.totalHonors ?? 0) / b.min_honors) * 100,
                        100
                      )}%`,
                    }}
                    transition={{ duration: 1.5 }}
                  />
                </div>
                <p className="szellit-text mt-2 text-sm">
                  {Math.min(honors?.totalHonors ?? 0, b.min_honors)} /{" "}
                  {b.min_honors} honors
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default BadgesShowcasePage;
