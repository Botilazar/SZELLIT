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
    <nav className="w-full h-[93px] bg-white shadow-md flex items-center justify-between px-6">
      {/* Left: Logo (vertically centered by flex) */}
      <div className="flex items-center h-full">
        <Logo />
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-4">
        {/* Eladás Button */}
        <button className="flex items-center gap-2 border-2 border-[#313944] rounded-[15px] px-6 py-3 text-[#313944] font-extrabold uppercase hover:bg-gray-100 transition">
          <FaWallet className="text-xl" />
          <span>Eladás</span>
        </button>

        {/* Language Flags */}
        <div className="flex items-center gap-1 border-2 border-[#313944] rounded-[15px] px-1 py-1 bg-[#f3f3f3]">
          {[hu, gb, de].map((flag, index) => (
            <div key={index} className="p-1 rounded-md hover:bg-gray-300 transition">
              <img src={flag} alt={`flag-${index}`} className="h-[30px] w-[40px] object-cover" />
            </div>
          ))}
        </div>

        {/* Dark Mode Toggle */}
        <button className="flex items-center justify-center border-2 border-[#313944] rounded-full w-[57px] h-[57px] text-[#313944] hover:bg-gray-100 transition">
          <MdDarkMode className="text-2xl" />
        </button>

        {/* Profile Icon with Dropdown */}
        <div className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="text-[#313944] text-[2.7rem] focus:outline-none"
          >
            <FaUserCircle />
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
              <a href="#" className="block px-4 py-2 hover:bg-gray-100">Profile</a>
              <a href="#" className="block px-4 py-2 hover:bg-gray-100">Settings</a>
              <a href="#" className="block px-4 py-2 text-red-600 hover:bg-gray-100">Logout</a>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
