import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface Link {
  href: string;
  label: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  links: Link[];
}

const overlay = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit:    { opacity: 0, transition: { duration: 0.2, delay: 0.15 } },
};

const panel = {
  hidden:  { x: '100%' },
  visible: { x: 0,      transition: { duration: 0.3, ease: [0, 0, 0.2, 1] } },
  exit:    { x: '100%', transition: { duration: 0.25, ease: [0.4, 0, 1, 1] } },
};

const list = {
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.15 } },
};

const item = {
  hidden:  { opacity: 0, x: 24 },
  visible: { opacity: 1, x: 0,  transition: { duration: 0.3, ease: [0, 0, 0.2, 1] } },
};

export default function MobileMenu({ isOpen, onClose, links }: Props) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            variants={overlay}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 z-40 bg-black/60"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Panel */}
          <motion.div
            key="panel"
            role="dialog"
            aria-modal="true"
            aria-label="Menu de navigation"
            variants={panel}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-secondary/95 backdrop-blur-glass flex flex-col shadow-nav"
          >
            {/* Header */}
            <div className="flex items-center justify-between h-20 px-6 border-b border-white/10">
              <span className="font-heading font-bold text-xl text-white tracking-wide">
                Puech Oultres
              </span>
              <button
                onClick={onClose}
                aria-label="Fermer le menu"
                className="w-10 h-10 flex items-center justify-center rounded-lg text-white hover:bg-white/10 hover:text-primary transition-colors duration-[150ms]"
              >
                <X size={20} strokeWidth={2} />
              </button>
            </div>

            {/* Links */}
            <motion.nav
              variants={list}
              initial="hidden"
              animate="visible"
              className="flex-1 overflow-y-auto flex flex-col justify-center px-6 gap-2"
              aria-label="Menu mobile"
            >
              {links.map((link) => (
                <motion.a
                  key={link.href}
                  href={link.href}
                  variants={item}
                  onClick={onClose}
                  className="group flex items-center gap-3 px-4 py-4 rounded-lg font-heading font-semibold text-lg text-white hover:text-primary hover:bg-white/5 transition-colors duration-[150ms]"
                >
                  <span className="w-0 h-0.5 bg-primary transition-[width] duration-[250ms] group-hover:w-4 rounded-full" />
                  {link.label}
                </motion.a>
              ))}
            </motion.nav>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
