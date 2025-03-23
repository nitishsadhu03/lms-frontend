import { adminLogout } from "@/store/features/adminAuthSlice";
import { userLogout } from "@/store/features/userAuthSlice";
import { ChevronFirst, ChevronLast, LogOut } from "lucide-react";
import { createContext, useContext, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";

const SidebarContext = createContext();

export default function Sidebar({ children }) {
  const [expanded, setExpanded] = useState(true);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const adminToken = localStorage.getItem('adminToken');
  const userToken = localStorage.getItem('userToken');

  const handleLogout = () => {
    if (adminToken) {
      dispatch(adminLogout());
      localStorage.removeItem('adminToken');
      navigate('/admin');
    } else if (userToken) {
      dispatch(userLogout());
      localStorage.removeItem('userToken');
      navigate('/');
    }
  };


  // Handle initial state and window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setExpanded(false);
      }
    };

    // Set initial state
    handleResize();

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      <aside
        className={`h-screen ${
          expanded ? "w-64" : "w-16"
        } transition-all duration-200`}
      >
        <nav className="h-full flex flex-col bg-white border-r shadow-sm">
          <div
            className={`p-4 pb-2 flex justify-between items-center ${
              expanded ? "" : "justify-center"
            }`}
          >
            {expanded && (
              <img src="/assets/logo.png" alt="logo" className="w-28 h-10" />
            )}

            <button
              onClick={() => setExpanded((curr) => !curr)}
              className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 hidden md:block"
            >
              {expanded ? <ChevronFirst /> : <ChevronLast />}
            </button>
          </div>

          <SidebarContext.Provider value={{ expanded }}>
            <ul className={`flex-1 ${expanded ? "px-3" : "px-2"}`}>
              {children}
            </ul>
          </SidebarContext.Provider>
          <hr />
          <div
            onClick={handleLogout}
            className={`relative flex items-center ${
              expanded ? "mx-2" : "mx-1"
            } my-3 py-2 px-3 font-medium rounded-md cursor-pointer transition-colors group hover:bg-indigo-50 text-gray-600 hover:text-primary ${
              !expanded && "justify-center"
            }`}
          >
            <LogOut size={20} />
            <span
              className={`overflow-hidden transition-all ${
                expanded ? "w-52 ml-3" : "w-0"
              }`}
            >
              Logout
            </span>
            {!expanded && (
              <div
                className={`absolute left-full rounded-md px-2 py-1 ml-6 bg-indigo-100 text-primary text-sm invisible opacity-20 -translate-x-3 transition-all group-hover:visible group-hover:opacity-100 group-hover:translate-x-0 whitespace-nowrap h-8 flex items-center`}
              >
                Logout
              </div>
            )}
          </div>
        </nav>
      </aside>
    </>
  );
}

export function SidebarItem({ icon, text, active, alert, link }) {
  const { expanded } = useContext(SidebarContext);

  return (
    <Link to={link}>
      <li
        className={`relative flex items-center py-2 px-3 my-1 font-medium rounded-md cursor-pointer transition-colors group ${
          active
            ? "bg-gradient-to-tr from-indigo-200 to-indigo-100 text-primary"
            : "hover:bg-indigo-50 text-gray-600"
        } ${!expanded && "justify-center"} h-10`}
      >
        {icon}
        <span
          className={`overflow-hidden transition-all ${
            expanded ? "w-52 ml-3" : "w-0"
          }`}
        >
          {text}
        </span>
        {!expanded && (
          <div
            className={`absolute left-full rounded-md px-2 py-1 ml-6 bg-indigo-100 text-indigo-800 text-sm invisible opacity-20 -translate-x-3 transition-all group-hover:visible group-hover:opacity-100 group-hover:translate-x-0 whitespace-nowrap h-8 flex items-center`}
          >
            {text}
          </div>
        )}
      </li>
    </Link>
  );
}
