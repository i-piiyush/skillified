import React, { useCallback, useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, Variants } from 'framer-motion';

export interface StaggeredMenuItem {
  label: string;
  ariaLabel: string;
  link: string;
}
export interface StaggeredMenuSocialItem {
  label: string;
  link: string;
}
export interface StaggeredMenuProps {
  position?: 'left' | 'right';
  colors?: string[];
  items?: StaggeredMenuItem[];
  socialItems?: StaggeredMenuSocialItem[];
  displaySocials?: boolean;
  displayItemNumbering?: boolean;
  className?: string;
  logoUrl?: string;
  logoContent?: React.ReactNode; // NEW: accepts any JSX as logo
  menuButtonColor?: string;
  openMenuButtonColor?: string;
  accentColor?: string;
  isFixed: boolean;
  changeMenuColorOnOpen?: boolean;
  closeOnClickAway?: boolean;
  panelColor?: string;      // slide-in panel background (default: '#ffffff')
  panelTextColor?: string;  // text/links inside the panel (default: '#000000')
  onMenuOpen?: () => void;
  onMenuClose?: () => void;
}

// Map GSAP's power eases to Framer Motion cubic-bezier curves
const easeOut4: [number, number, number, number] = [0.16, 1, 0.3, 1];
const easeIn3: [number, number, number, number] = [0.55, 0.085, 0.68, 0.53];
const easeOut2: [number, number, number, number] = [0.25, 1, 0.5, 1];
const easeOut3: [number, number, number, number] = [0.215, 0.61, 0.355, 1];
const easeInOut3: [number, number, number, number] = [0.645, 0.045, 0.355, 1];

export const Navbar: React.FC<StaggeredMenuProps> = ({
  position = 'right',
  colors = ['#B497CF', '#5227FF'],
  items = [],
  socialItems = [],
  displaySocials = true,
  displayItemNumbering = true,
  className,
  logoUrl,
  logoContent,
  menuButtonColor = '#fff',
  openMenuButtonColor = '#000',
  changeMenuColorOnOpen = true,
  accentColor = '#5227FF',
  isFixed = false,
  closeOnClickAway = true,
  panelColor = '#ffffff',
  panelTextColor = '#000000',
  onMenuOpen,
  onMenuClose
}: StaggeredMenuProps) => {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const toggleBtnRef = useRef<HTMLButtonElement | null>(null);

  const rawColors = colors && colors.length ? colors.slice(0, 4) : ['#1e1e22', '#35353c'];
  const prelayerColors = [...rawColors];
  if (prelayerColors.length >= 3) {
    const mid = Math.floor(prelayerColors.length / 2);
    prelayerColors.splice(mid, 1);
  }

  // Calculate timing syncs to match the original GSAP timeline
  const offscreen = position === 'left' ? '-100%' : '100%';
  const panelInsertTime = prelayerColors.length ? (prelayerColors.length - 1) * 0.07 + 0.08 : 0;
  const itemsStart = panelInsertTime + 0.65 * 0.15;
  const socialsStart = panelInsertTime + 0.65 * 0.4;

  const prelayerVariants: Variants = {
    closed: { x: offscreen, transition: { duration: 0.32, ease: easeIn3 } },
    open: (i: number) => ({
      x: '0%',
      transition: { delay: i * 0.07, duration: 0.5, ease: easeOut4 }
    })
  };

  const panelVariants: Variants = {
    closed: { x: offscreen, transition: { duration: 0.32, ease: easeIn3 } },
    open: {
      x: '0%',
      transition: { delay: panelInsertTime, duration: 0.65, ease: easeOut4 }
    }
  };

  const itemVariants: Variants = {
    closed: { y: '140%', rotate: 10, transition: { duration: 0.32, ease: easeIn3 } },
    open: (i: number) => ({
      y: '0%',
      rotate: 0,
      transition: { delay: itemsStart + i * 0.1, duration: 1, ease: easeOut4 }
    })
  };

  const itemNumberVariants = ({
    closed: { '--sm-num-opacity': 0 },
    open: (i: number) => ({
      '--sm-num-opacity': 1,
      transition: { delay: itemsStart + 0.1 + i * 0.08, duration: 0.6, ease: easeOut2 }
    })
  } as unknown) as Variants;

  const socialsTitleVariants: Variants = {
    closed: { opacity: 0, transition: { duration: 0.32, ease: easeIn3 } },
    open: { opacity: 1, transition: { delay: socialsStart, duration: 0.5, ease: easeOut2 } }
  };

  const socialItemVariants: Variants = {
    closed: { y: 25, opacity: 0, transition: { duration: 0.32, ease: easeIn3 } },
    open: (i: number) => ({
      y: 0,
      opacity: 1,
      transition: { delay: socialsStart + 0.04 + i * 0.08, duration: 0.55, ease: easeOut3 }
    })
  };

  const plusHVariants: Variants = {
    closed: { rotate: 0, transition: { duration: 0.35, ease: easeInOut3 } },
    open: { rotate: 45, transition: { duration: 0.5, ease: easeOut4 } }
  };

  const plusVVariants: Variants = {
    closed: { rotate: 90, transition: { duration: 0.35, ease: easeInOut3 } },
    open: { rotate: -45, transition: { duration: 0.5, ease: easeOut4 } }
  };

  const textInnerVariants: Variants = {
    closed: { y: '0%', transition: { duration: 0.35, ease: easeInOut3 } },
    open: { y: '-50%', transition: { duration: 0.5 + 2 * 0.07, ease: easeOut4 } }
  };

  const toggleMenu = useCallback(() => {
    const target = !open;
    setOpen(target);
    if (target) onMenuOpen?.();
    else onMenuClose?.();
  }, [open, setOpen, onMenuOpen, onMenuClose]);

  const closeMenu = useCallback(() => {
    if (open) {
      setOpen(false);
      onMenuClose?.();
    }
  }, [open, setOpen, onMenuClose]);

  useEffect(() => {
    if (!closeOnClickAway || !open) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target as Node) &&
        toggleBtnRef.current &&
        !toggleBtnRef.current.contains(event.target as Node)
      ) {
        closeMenu();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [closeOnClickAway, open, closeMenu]);

  // Scroll lock — prevent body scroll while menu is open
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;

    if (open) {
      // Measure scrollbar width to prevent layout shift when overflow is hidden
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      }
    } else {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
    }

    // Always clean up on unmount
    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
    };
  }, [open]);

  const currentToggleColor = changeMenuColorOnOpen && open ? openMenuButtonColor : menuButtonColor;

  return (
    // FIX: Use h-screen + w-screen when used inside a fixed nav wrapper,
    // or h-full + w-full when the parent already has explicit dimensions.
    // Here we use 100vw/100vh so the panel always covers the full viewport.
    <div
      className={`sm-scope z-40 ${isFixed ? 'fixed top-0 left-0' : 'absolute top-0 left-0'}`}
      style={{ width: '100vw', height: '100vh' }}
    >
      <motion.div
        initial="closed"
        animate={open ? 'open' : 'closed'}
        className={(className ? className + ' ' : '') + 'staggered-menu-wrapper pointer-events-none relative w-full h-full z-40'}
        style={accentColor ? ({ '--sm-accent': accentColor } as React.CSSProperties) : undefined}
        data-position={position}
        data-open={open || undefined}
      >
        {/* Prelayers */}
        <div className="sm-prelayers absolute top-0 right-0 bottom-0 pointer-events-none z-[5]" aria-hidden="true">
          {prelayerColors.map((c, i) => (
            <motion.div
              key={i}
              custom={i}
              variants={prelayerVariants}
              className="sm-prelayer absolute top-0 right-0 h-full w-full"
              style={{ background: c }}
            />
          ))}
        </div>

        {/* Header */}
        <header
          className="staggered-menu-header absolute top-0 left-0 w-full flex items-center justify-between p-[2em] bg-transparent pointer-events-none z-20"
          aria-label="Main navigation header"
        >
          {/* Logo — accepts custom JSX via logoContent, falls back to logoUrl img */}
          <div className="sm-logo flex items-center select-none pointer-events-auto" aria-label="Logo">
            {logoContent ? (
              logoContent
            ) : (
              <Image
                src={logoUrl || '/logo.svg'}
                alt="Logo"
                className="sm-logo-img block h-8 w-auto object-contain"
                draggable={false}
                width={110}
                height={24}
              />
            )}
          </div>

          {/* Toggle button — FIX: z-[60] ensures it sits above the panel */}
          <motion.button
            ref={toggleBtnRef}
            animate={{ color: currentToggleColor }}
            transition={{ delay: open ? 0.18 : 0, duration: 0.3, ease: easeOut2 }}
            className="sm-toggle relative inline-flex items-center gap-[0.3rem] bg-transparent border-0 cursor-pointer font-medium leading-none overflow-visible pointer-events-auto z-60"
            style={{ color: currentToggleColor }}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            aria-controls="staggered-menu-panel"
            onClick={toggleMenu}
            type="button"
          >
            <span
              className="sm-toggle-textWrap relative inline-block h-[1em] overflow-hidden whitespace-nowrap"
              aria-hidden="true"
            >
              <motion.span variants={textInnerVariants} className="sm-toggle-textInner flex flex-col leading-none">
                <span className="sm-toggle-line block h-[1em] leading-none">Menu</span>
                <span className="sm-toggle-line block h-[1em] leading-none">Close</span>
              </motion.span>
            </span>

            <span
              className="sm-icon relative w-3.5 h-3.5 shrink-0 inline-flex items-center justify-center"
              aria-hidden="true"
            >
              <motion.span
                variants={plusHVariants}
                className="sm-icon-line absolute left-1/2 top-1/2 w-full h-0.5 bg-current rounded-xs -translate-x-1/2 -translate-y-1/2"
              />
              <motion.span
                variants={plusVVariants}
                className="sm-icon-line sm-icon-line-v absolute left-1/2 top-1/2 w-full h-0.5 bg-current rounded-xs -translate-x-1/2 -translate-y-1/2"
              />
            </span>
          </motion.button>
        </header>

        {/* Full-screen backdrop blur — covers entire viewport when menu is open */}
        <motion.div
          aria-hidden="true"
          className="sm-backdrop absolute inset-0 pointer-events-none z-8"
          initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
          animate={open
            ? { opacity: 1, backdropFilter: 'blur(20px)' }
            : { opacity: 0, backdropFilter: 'blur(0px)' }
          }
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          style={{ background: 'rgba(0,0,0,0.25)', WebkitBackdropFilter: open ? 'blur(20px)' : 'blur(0px)' }}
        />

        {/* Slide-in panel */}
        <motion.aside
          id="staggered-menu-panel"
          ref={panelRef}
          variants={panelVariants}
          className="staggered-menu-panel absolute top-0 right-0 h-full bg-white flex flex-col p-[6em_2em_2em_2em] overflow-y-auto z-10 backdrop-blur-md pointer-events-auto"
          style={{ WebkitBackdropFilter: 'blur(12px)' }}
          aria-hidden={!open}
        >
          <div className="sm-panel-inner flex-1 flex flex-col gap-5">
            <ul
              className="sm-panel-list list-none m-0 p-0 flex flex-col gap-2"
              role="list"
              data-numbering={displayItemNumbering || undefined}
            >
              {items && items.length ? (
                items.map((it, idx) => (
                  <motion.li
                    custom={idx}
                    variants={itemNumberVariants}
                    className="sm-panel-itemWrap relative overflow-hidden leading-none"
                    key={it.label + idx}
                  >
                    <a
                      className="sm-panel-item relative text-black font-semibold text-[4rem] cursor-pointer leading-none tracking-[-2px] uppercase transition-[background,color] duration-150 ease-linear inline-block no-underline"
                      href={it.link}
                      aria-label={it.ariaLabel}
                      data-index={idx + 1}
                    >
                      <motion.span
                        custom={idx}
                        variants={itemVariants}
                        className="sm-panel-itemLabel inline-block origin-[50%_100%] will-change-transform"
                      >
                        {it.label}
                        {displayItemNumbering && (
                          <sup className="sm-panel-itemNum">
                            {String(idx + 1).padStart(2, '0')}
                          </sup>
                        )}
                      </motion.span>
                    </a>
                  </motion.li>
                ))
              ) : (
                <li className="sm-panel-itemWrap relative overflow-hidden leading-none" aria-hidden="true">
                  <span className="sm-panel-item relative text-black font-semibold text-[4rem] cursor-pointer leading-none tracking-[-2px] uppercase transition-[background,color] duration-150 ease-linear inline-block no-underline pr-[1.4em]">
                    <span className="sm-panel-itemLabel inline-block origin-[50%_100%] will-change-transform">
                      No items
                    </span>
                  </span>
                </li>
              )}
            </ul>

            {displaySocials && socialItems && socialItems.length > 0 && (
              <div className="sm-socials mt-auto pt-8 flex flex-col gap-3" aria-label="Social links">
                <motion.h3
                  variants={socialsTitleVariants}
                  className="sm-socials-title m-0 text-base font-medium text-(--sm-accent,#5227FF)"
                >
                  Socials
                </motion.h3>
                <ul
                  className="sm-socials-list list-none m-0 p-0 flex flex-row items-center gap-4 flex-wrap"
                  role="list"
                >
                  {socialItems.map((s, i) => (
                    <motion.li custom={i} variants={socialItemVariants} key={s.label + i} className="sm-socials-item">
                      <a
                        href={s.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="sm-socials-link text-[1.2rem] font-medium text-[#111] no-underline relative inline-block py-0.5 transition-[color,opacity] duration-300 ease-linear"
                      >
                        {s.label}
                      </a>
                    </motion.li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </motion.aside>
      </motion.div>

      <style>{`
        .sm-scope .staggered-menu-wrapper { position: relative; width: 100%; height: 100%; z-index: 40; pointer-events: none; }
        .sm-scope .staggered-menu-header { position: absolute; top: 0; left: 0; width: 100%; display: flex; align-items: center; justify-content: space-between; padding: 2em; background: transparent; pointer-events: none; z-index: 20; }
        .sm-scope .staggered-menu-header > * { pointer-events: auto; }
        .sm-scope .sm-logo { display: flex; align-items: center; user-select: none; }
        .sm-scope .sm-logo-img { display: block; height: 32px; width: auto; object-fit: contain; }
        .sm-scope .sm-toggle { position: relative; display: inline-flex; align-items: center; gap: 0.3rem; background: transparent; border: none; cursor: pointer; font-weight: 500; line-height: 1; overflow: visible; z-index: 60; }
        .sm-scope .sm-toggle:focus-visible { outline: 2px solid #ffffffaa; outline-offset: 4px; border-radius: 4px; }
        .sm-scope .sm-toggle-textWrap { position: relative; margin-right: 0.5em; display: inline-block; height: 1em; overflow: hidden; white-space: nowrap; }
        .sm-scope .sm-toggle-textInner { display: flex; flex-direction: column; line-height: 1; }
        .sm-scope .sm-toggle-line { display: block; height: 1em; line-height: 1; }
        .sm-scope .sm-icon { position: relative; width: 14px; height: 14px; flex: 0 0 14px; display: inline-flex; align-items: center; justify-content: center; will-change: transform; }
        .sm-scope .sm-icon-line { position: absolute; left: 50%; top: 50%; width: 100%; height: 2px; background: currentColor; border-radius: 2px; margin-left: -50%; margin-top: -1px; will-change: transform; transform-origin: center; }
        .sm-scope .sm-panel-itemWrap { position: relative; overflow: hidden; line-height: 1; }
        .sm-scope .staggered-menu-panel { position: absolute; top: 0; right: 0; width: clamp(260px, 38vw, 420px); height: 100%; background: white; backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); display: flex; flex-direction: column; padding: 6em 2em 2em 2em; overflow-y: auto; z-index: 10; }
        .sm-scope [data-position='left'] .staggered-menu-panel { right: auto; left: 0; }
        .sm-scope .sm-prelayers { position: absolute; top: 0; right: 0; bottom: 0; width: clamp(260px, 38vw, 420px); pointer-events: none; z-index: 5; }
        .sm-scope [data-position='left'] .sm-prelayers { right: auto; left: 0; }
        .sm-scope .sm-prelayer { position: absolute; top: 0; right: 0; height: 100%; width: 100%; }
        .sm-scope .sm-panel-inner { flex: 1; display: flex; flex-direction: column; gap: 1.25rem; }
        .sm-scope .sm-socials { margin-top: auto; padding-top: 2rem; display: flex; flex-direction: column; gap: 0.75rem; }
        .sm-scope .sm-socials-title { margin: 0; font-size: 1rem; font-weight: 500; color: var(--sm-accent, #5227FF); }
        .sm-scope .sm-socials-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: row; align-items: center; gap: 1rem; flex-wrap: wrap; }
        .sm-scope .sm-socials-list .sm-socials-link { opacity: 1; transition: opacity 0.3s ease; }
        .sm-scope .sm-socials-list:hover .sm-socials-link:not(:hover) { opacity: 0.35; }
        .sm-scope .sm-socials-list:focus-within .sm-socials-link:not(:focus-visible) { opacity: 0.35; }
        .sm-scope .sm-socials-list .sm-socials-link:hover,
        .sm-scope .sm-socials-list .sm-socials-link:focus-visible { opacity: 1; }
        .sm-scope .sm-socials-link:focus-visible { outline: 2px solid var(--sm-accent, #5227FF); outline-offset: 3px; }
        .sm-scope .sm-socials-link { font-size: 1.2rem; font-weight: 500; color: #111; text-decoration: none; position: relative; padding: 2px 0; display: inline-block; transition: color 0.3s ease, opacity 0.3s ease; }
        .sm-scope .sm-socials-link:hover { color: var(--sm-accent, #5227FF); }
        .sm-scope .sm-panel-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 0.5rem; }
        .sm-scope .sm-panel-item { position: relative; color: #000; font-weight: 600; font-size: 4rem; cursor: pointer; line-height: 1; letter-spacing: -2px; text-transform: uppercase; transition: background 0.25s, color 0.25s; display: inline-block; text-decoration: none; }
        .sm-scope .sm-panel-itemLabel { display: inline-block; will-change: transform; transform-origin: 50% 100%; }
        .sm-scope .sm-panel-item:hover { color: var(--sm-accent, #5227FF); }
        .sm-scope .sm-panel-itemNum { font-size: 0.9rem; font-weight: 400; letter-spacing: 0; vertical-align: super; line-height: 0; margin-left: 0.15em; color: var(--sm-accent, #5227FF); opacity: var(--sm-num-opacity, 0); transition: opacity 0.3s ease; font-family: monospace; }
        @media (max-width: 1024px) { .sm-scope .staggered-menu-panel { width: 100%; left: 0; right: 0; } .sm-scope .staggered-menu-wrapper[data-open] .sm-logo-img { filter: invert(100%); } }
        @media (max-width: 640px) { .sm-scope .staggered-menu-panel { width: 100%; left: 0; right: 0; } }
      `}</style>
    </div>
  );
};

export default Navbar;