import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { NavArrowDown } from "iconoir-react";
import { cn } from "@/lib/utils";

interface NavAction {
  label: string;
  href: string;
}

interface NavDropdownProps {
  label: string;
  items: NavAction[];
  isActive?: boolean;
}

const NavDropdown = ({ label, items, isActive }: NavDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className="relative group"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button
        className={cn(
          "flex items-center gap-1 text-sm font-medium tracking-wide uppercase transition-colors py-2",
          isActive || isOpen
            ? "text-school-gold"
            : "text-white/90 hover:text-school-gold",
        )}
      >
        {label}
        <NavArrowDown
          className={cn(
            "w-4 h-4 transition-transform duration-300",
            isOpen ? "rotate-180" : "",
          )}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 mt-2 w-56 bg-white/95 backdrop-blur-xl border border-white/20 rounded-xl shadow-xl overflow-hidden z-50 p-2 ring-1 ring-black/5"
          >
            <div className="flex flex-col gap-1">
              {items.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className="px-4 py-2.5 text-sm text-slate-600 hover:text-school-navy hover:bg-slate-50 rounded-lg transition-colors font-medium flex items-center justify-between group/link"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NavDropdown;
