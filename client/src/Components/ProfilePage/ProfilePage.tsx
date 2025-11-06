import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Mail, Facebook, Instagram, UserCircle2, Star } from "lucide-react";
import { motion } from "framer-motion";
import LoadingAnimation from "../LoadingAnimation/LoadingAnimation";
import ItemCard from "../ItemCard/ItemCard";
import useDarkMode from "../../hooks/useDarkMode";
import PleaseLogin from "../Other/pleaseLogin";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../AuthContext";

interface User {
  user_id: number;
  email: string;
  fname: string;
  lname: string;
  prof_pic_url?: string;
}

interface Item {
  item_id: number;
  title: string;
  description: string;
  price: number;
  created_at: string;
  category_name: string;
  city: string;
  seller_name: string;
  image_url?: string;
  user_id: number;
}

interface Badge {
  badge_id: number;
  name: string;
  icon_url: string;
  min_honors: number;
}

const ProfilePage = () => {
  const { t } = useTranslation();
  const { userId, lng } = useParams<{ userId: string; lng: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);
  const { isDarkMode } = useDarkMode();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const [badges, setBadges] = useState<Badge[]>([]);
  // @ts-expect-error TS2345
  const [currentBadge, setCurrentBadge] = useState<Badge | null>(null);
  const [totalHonors, setTotalHonors] = useState<number>(0);
  const [honorProgress, setHonorProgress] = useState<{
    current: number;
    needed: number;
    percent: number;
  } | null>(null);
  const [hasHonored, setHasHonored] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);

  //const numUserId = Number(userId);
  const isOwner = currentUser?.user_id.toString() === userId;

  useEffect(() => {
    let alive = true;

    const check401 = (res: Response) => {
      if (res.status === 401) {
        setUnauthorized(true);
        return true;
      }
      return false;
    };

    const fetchData = async () => {
      const API_URL = import.meta.env.VITE_API_BASE_URL;

      try {
        setLoading(true);
        const resUser = await fetch(`${API_URL}/api/users/${userId}`, {
          credentials: "include",
        });
        if (check401(resUser)) return;
        if (!resUser.ok) throw new Error(t("profile.fetchUserError"));
        const userData = await resUser.json();

        const resItems = await fetch(`${API_URL}/api/users/${userId}/items`, {
          credentials: "include",
        });
        if (check401(resItems)) return;
        if (!resItems.ok) throw new Error(t("profile.fetchItemsError"));
        const itemData = await resItems.json();

        const resHonors = await fetch(`${API_URL}/api/honors/${userId}`, {
          credentials: "include",
        });
        if (check401(resHonors)) return;
        const honorsData = await resHonors.json();

        let hasHonoredRes = false;
        if (!isOwner) {
          try {
            const resCheck = await fetch(
              `${API_URL}/api/honors/${userId}`, ///status`,
              {
                credentials: "include",
              }
            );
            if (resCheck.ok) {
              const honorsStatus = await resCheck.json();
              hasHonoredRes = honorsStatus.hasHonored || false;
            }
          } catch (err) {
            console.error("Failed to fetch honor status", err);
          }
        }

        if (alive) {
          setHasHonored(hasHonoredRes); // ✅ make sure this is set after fetching
        }

        let favData: number[] = [];
        if (currentUser) {
          const favRes = await fetch(`${API_URL}/api/favourites`, {
            credentials: "include",
          });
          if (favRes.ok) favData = await favRes.json();
        }

        if (alive) {
          if (Array.isArray(favData)) setFavoriteIds(favData as number[]);
          setUser(userData);
          setItems(itemData);
          setTotalHonors(honorsData.totalHonors);
          setCurrentBadge(honorsData.currentBadge);
          setBadges(honorsData.earnedBadges);

          if (isOwner) {
            const nextBadgeRes = await fetch(
              `${API_URL}/api/badges/next/${userId}`,
              {
                credentials: "include",
              }
            );
            const nextBadgeData = await nextBadgeRes.json();
            if (nextBadgeData) {
              setHonorProgress({
                current: honorsData.totalHonors,
                needed: nextBadgeData.min_honors,
                percent:
                  (honorsData.totalHonors / nextBadgeData.min_honors) * 100,
              });
            } else {
              setHonorProgress(null); // Max rank
            }
          }

          setHasHonored(hasHonoredRes);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (alive) setLoading(false);
      }
    };

    fetchData();
    return () => {
      alive = false;
    };
  }, [userId, t, isOwner, currentUser]);

  const handleHonorClick = async () => {
    const API_URL = import.meta.env.VITE_API_BASE_URL;

    if (!currentUser) return;
    try {
      const method = hasHonored ? "DELETE" : "POST";
      const res = await fetch(`${API_URL}/api/honors/${userId}`, {
        method,
        headers: { "Content-Type": "application/json", credentials: "include" },
      });
      if (!res.ok) throw new Error("Failed to update honor");

      const data = await res.json();
      setTotalHonors(data.totalHonors);

      setHasHonored(!hasHonored);

      const badgeRes = await fetch(`${API_URL}/api/honors/${userId}`, {
        credentials: "include",
      });
      const honorsData = await badgeRes.json();
      setCurrentBadge(honorsData.currentBadge);
      setBadges(honorsData.earnedBadges);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <LoadingAnimation />;
  if (unauthorized) return <PleaseLogin />;
  if (!user)
    return <div className="text-center p-10">{t("profile.userNotFound")}</div>;

  return (
    <div
      className={`max-w-7xl mx-auto p-8 space-y-10 ${isDarkMode ? "text-gray-200" : "text-gray-900"}`}
    >
      {/* Header Card */}
      <div className="flex flex-col md:flex-row items-center justify-between szellit-navbar p-6 rounded-2xl shadow-md gap-6">
        {/* Left: Profile Picture + Info */}
        <div className="flex gap-6 items-center">
          <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden shadow-md">
            {user.prof_pic_url ? (
              <img
                src={`http://localhost:5000${user.prof_pic_url}`}
                alt={`${user.fname} ${user.lname}`}
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              <UserCircle2 className="w-20 h-20 text-gray-400" />
            )}
          </div>
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-bold">
              {user.lname} {user.fname}
            </h1>
            <p className="text-gray-500">{user.email}</p>

            {/* Star icon + total honors */}
            <div className="flex items-center gap-1 text-yellow-500 mt-1 font-semibold">
              <Star className="w-5 h-5" />
              <span>{totalHonors}</span>
            </div>

            {/* Progress bar for owner */}
            {isOwner && honorProgress && (
              <div className="mt-2 w-56">
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
                  <motion.div
                    className="h-3 rounded-full bg-blue-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${honorProgress.percent}%` }}
                    transition={{ duration: 1 }}
                  />
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  {honorProgress.current}/{honorProgress.needed} honors to next
                  badge
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Badge + Honor Button */}
        <div className="flex flex-col items-center gap-3">
          {/* Badges row */}
          {badges.length > 0 && (
            <div className="flex justify-center mt-4">
              <div className="flex gap-4 px-6 py-4 szellit-background rounded-3xl shadow-md">
                {badges.slice(0, 6).map((b) => (
                  <motion.div
                    key={b.badge_id}
                    whileHover={{ y: -8 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className="flex items-center justify-center"
                  >
                    <img
                      src={b.icon_url}
                      alt={b.name}
                      className="w-16 h-16 cursor-pointer" // bigger badges
                      onClick={() => {
                        navigate(`/${lng}/badges`);
                      }}
                    />
                  </motion.div>
                ))}
                {badges.length > 6 && (
                  <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gray-200 text-base font-bold">
                    +{badges.length - 6}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Max Rank */}
          {isOwner && !honorProgress && (
            <span className="text-xs text-gray-500 mt-1 font-semibold">
              (MAX RANK)
            </span>
          )}

          {/* Honor button */}
          {!isOwner && (
            <button
              className={`mt-2 flex items-center gap-2 px-4 py-2 rounded-full font-semibold shadow-lg
                                ${hasHonored ? "bg-gray-400 text-gray-800" : "bg-yellow-400 text-gray-900 hover:bg-yellow-500"}`}
              onClick={handleHonorClick}
            >
              <Star className="w-5 h-5" /> {hasHonored ? "Honored" : "Honor"}
            </button>
          )}
        </div>
      </div>

      {/* Contact Info */}
      <div className="szellit-navbar p-6 rounded-2xl shadow-md">
        <h2 className="text-xl font-semibold mb-4">{t("profile.contact")}</h2>
        <div className="flex gap-6 items-center">
          <a
            href={`mailto:${user.email}`}
            className="flex items-center gap-2 hover:text-blue-500"
          >
            <Mail className="w-5 h-5" /> {user.email}
          </a>
          <span className="flex items-center gap-2 text-gray-400 cursor-not-allowed">
            <Facebook className="w-5 h-5" /> facebook.com/username
          </span>
          <span className="flex items-center gap-2 text-gray-400 cursor-not-allowed">
            <Instagram className="w-5 h-5" /> instagram.com/username
          </span>
        </div>
      </div>

      {/* Listings */}
      <div>
        <h2 className="text-2xl font-bold mb-6 szellit-text">
          {user.fname} {t("profile.listings")}
        </h2>
        {items.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <ItemCard
                key={item.item_id}
                category={item.category_name}
                date={new Date(item.created_at).toLocaleDateString()}
                title={item.title}
                description={item.description}
                price={item.price}
                location={item.city}
                sellerName={item.seller_name}
                imgUrl={item.image_url}
                itemId={item.item_id}
                isFavorited={favoriteIds.includes(item.item_id)}
                sellerProfilePic={user.prof_pic_url}
                onCardClick={() => navigate(`/${lng}/items/${item.item_id}`)}
                sellerId={item.user_id}
              />
            ))}
          </div>
        ) : (
          <p className="text-gray-500">{t("profile.noListings")}</p>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
