
import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

import {
  LayoutDashboard,
  Users,
  FileText,
  Wallet,
  Settings,
  Flower2,
  Menu,
  X,
} from "lucide-react";

const menuItems = [
  { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { name: "Customers", path: "/customers", icon: Users },
  { name: "Bills", path: "/bills", icon: FileText },
  { name: "Payments", path: "/payments", icon: Wallet },
];

function Logo() {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-purple-400 text-white">
        <Flower2 size={25} />
      </div>

      <div className="min-w-0">
        <h1 className="truncate text-base font-bold text-white sm:text-lg">
          Gouranga Florist
        </h1>
        <p className="text-xs text-purple-300">Business Manager</p>
      </div>
    </div>
  );
}

function Navigation({ onNavigate }) {
  return (
    <nav className="space-y-2">
      {menuItems.map(({ name, path, icon: Icon }) => (
        <NavLink
          key={path}
          to={path}
          end={path === "/dashboard"}
          onClick={onNavigate}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-colors duration-200 ${
              isActive
                ? "bg-purple-600 text-white"
                : "text-purple-200 hover:bg-purple-800 hover:text-white"
            }`
          }
        >
          <Icon size={21} />
          <span>{name}</span>
        </NavLink>
      ))}
    </nav>
  );
}

function SettingsButton() {
  return (
    <button
      type="button"
      onClick={() => alert("Settings page abhi available nahi hai.")}
      className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-purple-200 transition-colors hover:bg-purple-800 hover:text-white"
    >
      <Settings size={20} />
      Settings
    </button>
  );
}

export default function Sidebar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  // Close mobile drawer whenever the route changes.
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  // Close drawer with Escape key.
  useEffect(() => {
    if (!menuOpen) return;

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [menuOpen]);

  return (
    <>
      {/* MOBILE TOP NAVBAR */}
      <header className="relative z-30 flex h-16 w-full shrink-0 items-center justify-between bg-[#29143F] px-4 shadow-md md:hidden">
        <Logo />

        <button
          type="button"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((previous) => !previous)}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-700 text-white transition-colors hover:bg-purple-600"
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </header>

      {/* MOBILE DRAWER */}
      <AnimatePresence>
        {menuOpen && (
          <>
            {/* BACKDROP */}
            <motion.button
              type="button"
              aria-label="Close navigation menu"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              onClick={() => setMenuOpen(false)}
              className="fixed inset-0 z-40 cursor-default bg-black/50 md:hidden"
            />

            {/* DRAWER */}
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{
                type: "tween",
                duration: 0.22,
                ease: "easeInOut",
              }}
              className="fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col overflow-y-auto bg-[#29143F] p-5 shadow-2xl md:hidden"
            >
              <div className="mb-10 flex items-center justify-between gap-2">
                <Logo />

                <button
                  type="button"
                  aria-label="Close menu"
                  onClick={() => setMenuOpen(false)}
                  className="shrink-0 rounded-lg p-2 text-purple-200 transition hover:bg-purple-800"
                >
                  <X size={21} />
                </button>
              </div>

              <p className="mb-4 text-xs font-semibold tracking-widest text-purple-300">
                MAIN MENU
              </p>

              <Navigation
                onNavigate={() => setMenuOpen(false)}
              />

              <div className="mt-auto border-t border-purple-800 pt-4">
                <SettingsButton />
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* DESKTOP SIDEBAR */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col bg-[#29143F] p-6 text-white md:flex">
        <div className="mb-12">
          <Logo />
        </div>

        <p className="mb-4 text-xs font-semibold tracking-widest text-purple-300">
          MAIN MENU
        </p>

        <Navigation />

        <div className="mt-auto border-t border-purple-800 pt-4">
          <SettingsButton />
        </div>
      </aside>
    </>
  );
}
