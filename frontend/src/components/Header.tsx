import { Menu, Stethoscope } from "lucide-react";

import { Link } from "react-router-dom";
import { useSidebar } from "../contexts/SidebarContext";

const Header = () => {
  const { toggleSidebar } = useSidebar();

  return (
    <header className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white px-6 py-4 flex justify-between items-center shadow-lg">
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="text-white hover:text-indigo-100 focus:outline-none lg:hidden transition-colors p-2 rounded-lg hover:bg-white/10"
        >
          <Menu className="w-6 h-6" />
        </button>
        <div className="flex items-center gap-3">
          <div className="bg-white/10 p-2 rounded-lg">
            <Stethoscope className="w-6 h-6 text-white" />
          </div>
          <Link to="/" className="hover:opacity-90 transition-opacity">
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-100 to-pink-100">
              MediFusion
            </span>
          </Link>
        </div>
      </div>
      {/* <nav className="space-x-8 hidden md:block">
        <Link
          to="/"
          className={`text-lg transition-all duration-200 hover:text-indigo-100 ${
            location.pathname === "/"
              ? "font-bold text-white relative after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-white after:rounded-full"
              : "text-white/80"
          }`}
        >
          Home
        </Link>
        <Link
          to="/statistics"
          className={`text-lg transition-all duration-200 hover:text-indigo-100 ${
            location.pathname === "/statistics"
              ? "font-bold text-white relative after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-white after:rounded-full"
              : "text-white/80"
          }`}
        >
          Statistics
        </Link>
      </nav> */}
    </header>
  );
};

export default Header;
