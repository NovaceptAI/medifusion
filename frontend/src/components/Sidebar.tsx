import {
  FaChartLine,
  FaChevronLeft,
  FaChevronRight,
  FaHome,
  FaUserMd,
} from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";

import { Link } from "react-router-dom";
import { useSidebarStore } from "../store/sidebarStore";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isCollapsed, setIsCollapsed } = useSidebarStore();

  const menuItems = [
    {
      path: "/home",
      icon: <FaHome size={20} />,
      label: "Home",
      description: "Dashboard Overview",
    },
    {
      path: "/statistics",
      icon: <FaChartLine size={20} />,
      label: "Statistics",
      description: "Analytics & Reports",
    },
  ];

  return (
    <div
      className={`bg-gradient-to-b from-white via-indigo-50 to-purple-50 border-r border-indigo-100 h-screen transition-all duration-300 shadow-lg ${
        isCollapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Top Section with Logo and Collapse Button */}
      <div className="p-4 flex justify-between items-center border-b border-indigo-100 bg-white/50 backdrop-blur-sm">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-2 rounded-lg">
              <FaUserMd className="w-5 h-5 text-white" />
            </div>
            <Link to="/" className="hover:opacity-90 transition-opacity">
            <span className="text-lg font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              MediFusion
            </span>
            </Link>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-lg hover:bg-indigo-50 transition-all duration-200 text-indigo-600 hover:text-indigo-700 hover:scale-105"
        >
          {isCollapsed ? (
            <FaChevronRight size={20} />
          ) : (
            <FaChevronLeft size={20} />
          )}
        </button>
      </div>

      {/* Navigation Menu */}
      <nav className="mt-4 px-2 space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`w-full flex items-center px-4 py-3 text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 rounded-lg transition-all duration-200 group ${
              location.pathname === item.path
                ? "bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 font-medium shadow-sm"
                : "hover:shadow-sm"
            }`}
          >
            <span
              className={`flex-shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                location.pathname === item.path
                  ? "text-indigo-700"
                  : "text-indigo-500"
              }`}
            >
              {item.icon}
            </span>
            {!isCollapsed && (
              <div className="ml-3 flex flex-col items-start">
                <span className="font-medium">{item.label}</span>
                <span className="text-xs text-indigo-400">
                  {item.description}
                </span>
              </div>
            )}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
