import { useState, useEffect, memo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Icon } from '../ui/Icon';
import { popover } from '../../motion/tokens';

interface NavbarProps {
  onEnterOrbit: () => void;
}

const LINKS = [
  { href: '#paradigm', label: 'Why ORBIT' },
  { href: '#mechanics', label: 'How it works' },
  { href: '#interactive', label: 'Try it' },
  { href: '#architecture', label: 'Under the hood' },
];

export const Navbar = memo(function Navbar({ onEnterOrbit }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 pt-[env(safe-area-inset-top)] transition-[background-color,border-color,backdrop-filter] duration-300 border-b ${
        scrolled || open ? 'bg-[#030308]/80 backdrop-blur-xl border-white/[0.06]' : 'bg-transparent border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <a href="#landing" className="flex items-center gap-2.5 group" aria-label="ORBIT home">
          <span className="relative w-6 h-6 flex items-center justify-center" aria-hidden>
            <span className="absolute inset-0 rounded-full border border-white/25 group-hover:border-sky-300/70 transition-colors duration-300" />
            <span className="w-1.5 h-1.5 rounded-full bg-starlight" />
          </span>
          <span className="font-display text-sm font-medium tracking-[0.2em] text-white">ORBIT</span>
        </a>

        <nav className="hidden md:flex items-center gap-8 text-sm text-slate-400" aria-label="Page sections">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} className="hover:text-white transition-colors duration-150">
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button onClick={onEnterOrbit} className="btn btn-primary hidden sm:inline-flex">
            Launch app
          </button>
          <button
            onClick={() => setOpen((v) => !v)}
            className="btn-icon md:hidden !w-10 !h-10"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
          >
            <Icon name={open ? 'close' : 'menu'} size={20} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            variants={popover}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="md:hidden px-6 pb-6 pt-1 flex flex-col"
          >
            {LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="py-3 text-base text-slate-300 hover:text-white border-b border-white/[0.06]"
              >
                {l.label}
              </a>
            ))}
            <button
              onClick={() => {
                setOpen(false);
                onEnterOrbit();
              }}
              className="btn btn-primary !min-h-11 mt-5"
            >
              Launch app
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
});
