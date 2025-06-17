import Logo from "../Logo/Logo";
import { FaUserCircle, FaWallet } from "react-icons/fa";
import { MdDarkMode } from "react-icons/md";
import { useState } from "react";
import hu from "../../assets/hungary.png";
import gb from "../../assets/united-kingdom.png";
import de from "../../assets/germany.png";

const Navbar = () => {
  const [profileOpen, setProfileOpen] = useState(false);
  return (
    <nav className="flex items-center justify-between px-6 pt-6 bg-white shadow-md">
      {/* Left Side - Logo */}
      <div className="flex items-center">
        <Logo />
      </div>

      {/* Desktop View - Full Navbar */}
      <div className="hidden md:flex items-center space-x-4">
        {/* Sell Button */}
        <button className="flex items-center space-x-2 border-2 border-gray-700 px-4 py-2 rounded-lg text-gray-700 font-bold hover:bg-gray-100 transition">
          <FaWallet />
          <span>ELADÁS</span>
        </button>

        {/* Language Selector */}
        <div className="flex border-2 border-gray-700 px-1 py-2 rounded-lg">
          <div className="p-2 border-r-2 border-gray-700 hover:bg-gray-400">
            <img src={hu} alt="HU" className="h-5 w-6 " />
          </div>
          <div className="p-2 border-r-2 border-gray-700 hover:bg-gray-400">
            <img src={gb} alt="EN" className="h-5 w-6" />
          </div>
          <div className="p-2 border-gray-700 hover:bg-gray-400">
            <img src={de} alt="DE" className="h-5 w-6" />
          </div>
        </div>

        {/* Dark Mode Toggle */}
        <button className="text-gray-700 text-2xl">
          <MdDarkMode />
        </button>
      </div>

      {/* Profile Icon with Dropdown (Always Visible) */}
      <div className="relative">
        <button
          onClick={() => setProfileOpen(!profileOpen)}
          className="text-gray-700 text-3xl focus:outline-none"
        >
          <FaUserCircle />
        </button>

        {/* Profile Dropdown */}
        {profileOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg">
            {/* Mobile View - Move Language Selector & Dark Mode Here */}
            <div className="md:hidden flex flex-col px-4 py-2">
              <div className="flex space-x-2 mb-2">
                <img src={hu} alt="HU" className="h-5 w-7 hover:bg-gray-100" />
                <img src={gb} alt="EN" className="h-5 w-7 hover:bg-gray-100" />
                <img src={de} alt="DE" className="h-5 w-7 hover:bg-gray-100" />
              </div>
              <button className="flex items-center space-x-2 text-gray-700">
                <MdDarkMode className="text-xl" />
                <span>Dark Mode</span>
              </button>
            </div>

            <a href="#" className="block px-4 py-2 hover:bg-gray-100">
              Profile
            </a>
            <a href="#" className="block px-4 py-2 hover:bg-gray-100">
              Settings
            </a>
            <a
              href="#"
              className="block px-4 py-2 text-red-600 hover:bg-gray-100"
            >
              Logout
            </a>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
