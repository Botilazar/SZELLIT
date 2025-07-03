import { Link } from "react-router-dom";
import { Heart, MessageSquare, ShoppingCart } from "lucide-react";
import "./WelcomePage.css";

const WelcomePage = () => {
  return (
    <div className="min-h-screen bg-zinc-900 text-white flex flex-col">
      <main className="flex-grow flex flex-col items-center justify-center text-center px-4 py-8 space-y-6">
        <h1 className="text-3xl md:text-5xl font-bold">
          Buy, Sell, Connect – All in One Place.
        </h1>
        <p className="text-zinc-400 max-w-md">
          List your items, discover local deals, and save your favorites – fast,
          secure, and easy to use.
        </p>

        <div className="flex flex-col md:flex-row gap-4 mt-6">
          <Link to="/register">
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition">
              Get Started
            </button>
          </Link>
          <Link to="/login">
            <button className="bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-600 px-6 py-3 rounded-lg transition">
              Sign In
            </button>
          </Link>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-12 w-full max-w-4xl">
          <div className="flex flex-col items-center space-y-2">
            <MessageSquare className="w-8 h-8 text-blue-400" />
            <p className="text-sm">Message sellers directly</p>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <Heart className="w-8 h-8 text-pink-400" />
            <p className="text-sm">Save items to your favorites</p>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <ShoppingCart className="w-8 h-8 text-green-400" />
            <p className="text-sm">Post your listings in seconds</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default WelcomePage;
