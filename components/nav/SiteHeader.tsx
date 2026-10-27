"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
} from "react";
import { WhatsAppIcon } from "@/components/contact/icons";
import {
  scrollToSection,
  setScrollLocked,
} from "@/components/experience/scroll-control";
import { stillSrc } from "@/components/experience/still-image";
import { useBeat } from "@/components/experience/store";
import {
  chapters,
  services,
  servicesPage,
  shot,
  site,
  workPage,
} from "@/lib/content";
import { blogPage } from "@/lib/blog";
import { whatsappHref } from "@/lib/contact-links";
import { threeDPage } from "@/lib/three-d";

/**
 * The Services menus (the panel and the phone menu): every service, with 3D
 * websites after premium websites. Its preview is the studio's own 3D shot.
 */
const menuServices = [
  ...services.items.slice(0, 1),
  {
    href: threeDPage.path,
    nav: threeDPage.menu.label,
    body: threeDPage.menu.body,
    navImage: stillSrc(shot("three-d"), "landscape", "dusk"),
  },
  ...services.items.slice(1),
].map(({ href, nav, body, navImage }) => ({ href, nav, body, navImage }));

const LAST_BEAT = chapters.reduce((sum, chapter) => sum + chapter.beats, 0) - 1;
/* Tweakable (ms): hover intent for the services panel. */
const OPEN_DELAY = 90;
const CLOSE_DELAY = 220;

type Variant = "tour" | "page";

/**
 * The site's header, on the home page's studio tour ("tour") and on every
 * other page ("page").
 *
 * - Wide screens: Services opens a panel listing every service, previewing
 *   each one's service image as it's pointed at; Work and Contact go straight
 *   there; "Get a quote" is always one click away.
 * - Phones: a Menu button opens a full-screen menu.
 *
 * Both close with Escape, a click elsewhere or a link, and give focus back.
 */
export function SiteHeader({ variant }: { variant: Variant }) {
  const pathname = usePathname();
  const onHome = pathname === "/";
  const [panelOpen, setPanelOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [lastPath, setLastPath] = useState(pathname);
  // On the tour, the contact form scrolls under the header: it turns solid.
  const tourSolid = useBeat() >= LAST_BEAT && variant === "tour";

  // A new page closes whatever was open.
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setPanelOpen(false);
    setMenuOpen(false);
  }

  useEffect(() => {
    if (variant !== "page") return;
    const update = () => setScrolled(window.scrollY > 24);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, [variant]);

  // Contact glides on the home page and goes there from everywhere else.
  const goToContact = useCallback(
    (event: MouseEvent<HTMLAnchorElement>) => {
      setMenuOpen(false);
      setPanelOpen(false);
      if (!onHome) return;
      event.preventDefault();
      scrollToSection("contact");
      history.replaceState(null, "", "#contact");
    },
    [onHome],
  );

  const onService = menuServices.some((item) => item.href === pathname);

  return (
    <header
      className="nav"
      data-ga-location="header"
      data-variant={variant}
      data-solid={tourSolid || scrolled || panelOpen || undefined}
    >
      <div className="nav-bar">
        <Link
          href="/"
          aria-label={`${site.name} home`}
          className="nav-logo"
          onClick={() => setMenuOpen(false)}
        >
          <Image
            src="/brand/bellops-wordmark-transparent.png"
            alt={site.name}
            width={112}
            height={35}
            sizes="(min-width: 768px) 112px, (min-width: 360px) 96px, 80px"
            className="h-auto w-20 min-[360px]:w-24 md:w-28"
          />
        </Link>

        <nav aria-label="Main" className="nav-links">
          <ServicesMenu
            open={panelOpen}
            setOpen={setPanelOpen}
            current={onService || pathname === servicesPage.path}
          />
          <Link
            href={workPage.path}
            className="nav-link"
            aria-current={
              pathname.startsWith(workPage.path) ? "page" : undefined
            }
          >
            Work
          </Link>
          <Link
            href={blogPage.path}
            className="nav-link"
            aria-current={
              pathname.startsWith(blogPage.path) ? "page" : undefined
            }
          >
            Blog
          </Link>
          <Link href="/#contact" className="nav-link" onClick={goToContact}>
            Contact
          </Link>
        </nav>

        <Link
          href="/#contact"
          className="nav-cta"
          onClick={goToContact}
          data-track="nav-start-project"
          data-cta="get_quote"
        >
          Get a quote
        </Link>

        <MobileMenu
          open={menuOpen}
          setOpen={setMenuOpen}
          pathname={pathname}
          onContact={goToContact}
        />
      </div>
    </header>
  );
}

/* ── Wide screens: the services panel ─────────────────────────────────────── */

function ServicesMenu({
  open,
  setOpen,
  current,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  current: boolean;
}) {
  const panelId = useId();
  const wrapper = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const timer = useRef(0);
  const [preview, setPreview] = useState(menuServices[0]!.href);

  const later = (next: boolean, delay: number) => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setOpen(next), delay);
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      button.current?.focus();
    };
    const onPointer = (event: PointerEvent) => {
      if (!wrapper.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open, setOpen]);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const shown = menuServices.find((item) => item.href === preview)!;

  return (
    <div
      ref={wrapper}
      className="nav-services"
      onPointerEnter={(event) => {
        if (event.pointerType === "mouse") later(true, OPEN_DELAY);
      }}
      onPointerLeave={(event) => {
        if (event.pointerType === "mouse") later(false, CLOSE_DELAY);
      }}
      onBlur={(event) => {
        if (!wrapper.current?.contains(event.relatedTarget as Node | null))
          setOpen(false);
      }}
    >
      <button
        ref={button}
        type="button"
        className="nav-link"
        aria-expanded={open}
        aria-controls={panelId}
        data-current={current || undefined}
        onClick={() => {
          window.clearTimeout(timer.current);
          setOpen(!open);
        }}
      >
        Services
        <svg aria-hidden="true" viewBox="0 0 12 12" className="nav-caret">
          <path d="M2.5 4.5 6 8l3.5-3.5" />
        </svg>
      </button>

      <div id={panelId} className="nav-panel" data-open={open || undefined}>
        <div className="nav-panel-inner">
          <ul className="nav-panel-list">
            {menuServices.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="nav-panel-item"
                  tabIndex={open ? undefined : -1}
                  onPointerEnter={() => setPreview(item.href)}
                  onFocus={() => setPreview(item.href)}
                  onClick={() => setOpen(false)}
                >
                  <span className="nav-panel-title">{item.nav}</span>
                  <span className="nav-panel-body">{item.body}</span>
                </Link>
              </li>
            ))}
          </ul>
          <div className="nav-panel-aside">
            <div className="nav-panel-preview" aria-hidden="true">
              {open &&
                menuServices.map((item) => (
                  <Image
                    key={item.href}
                    src={item.navImage}
                    alt=""
                    fill
                    sizes="22rem"
                    loading="eager"
                    fetchPriority="low"
                    data-shown={item.href === shown.href || undefined}
                  />
                ))}
            </div>
            <Link
              href={servicesPage.path}
              className="nav-panel-all"
              tabIndex={open ? undefined : -1}
              onClick={() => setOpen(false)}
            >
              See all services
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Phones: the full-screen menu ─────────────────────────────────────────── */

function MobileMenu({
  open,
  setOpen,
  pathname,
  onContact,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  pathname: string;
  onContact: (event: MouseEvent<HTMLAnchorElement>) => void;
}) {
  const menuId = useId();
  const toggle = useRef<HTMLButtonElement>(null);
  const sheet = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    setScrollLocked(true);
    const opener = toggle.current;
    const first = sheet.current?.querySelector<HTMLElement>("a, button");
    first?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        return;
      }
      if (event.key !== "Tab" || !sheet.current) return;
      // Keep focus inside the open menu.
      const focusable = [
        opener,
        ...sheet.current.querySelectorAll<HTMLElement>("a, button"),
      ].filter((element): element is HTMLElement => Boolean(element));
      const index = focusable.indexOf(document.activeElement as HTMLElement);
      const next = event.shiftKey ? index - 1 : index + 1;
      if (next < 0 || next >= focusable.length) {
        event.preventDefault();
        focusable[event.shiftKey ? focusable.length - 1 : 0]?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      setScrollLocked(false);
      opener?.focus({ preventScroll: true });
    };
  }, [open, setOpen]);

  const close = () => setOpen(false);

  return (
    <>
      <button
        ref={toggle}
        type="button"
        className="nav-menu-button"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen(!open)}
      >
        <span className="nav-menu-label">{open ? "Close" : "Menu"}</span>
        <span aria-hidden="true" className="nav-menu-icon" />
      </button>

      <div
        id={menuId}
        ref={sheet}
        className="nav-sheet"
        data-open={open || undefined}
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        hidden={!open}
      >
        <nav aria-label="Menu" className="nav-sheet-body">
          <ul className="nav-sheet-main">
            <li style={{ "--i": 0 } as CSSProperties}>
              <Link href={workPage.path} onClick={close}>
                Work
              </Link>
            </li>
            <li style={{ "--i": 1 } as CSSProperties}>
              <Link href={servicesPage.path} onClick={close}>
                Services
              </Link>
            </li>
            <li style={{ "--i": 2 } as CSSProperties}>
              <Link href={blogPage.path} onClick={close}>
                Blog
              </Link>
            </li>
            <li style={{ "--i": 3 } as CSSProperties}>
              <Link href="/#contact" onClick={onContact}>
                Contact
              </Link>
            </li>
          </ul>
          <ul className="nav-sheet-services">
            {menuServices.map((item, index) => (
              <li key={item.href} style={{ "--i": index + 4 } as CSSProperties}>
                <Link
                  href={item.href}
                  aria-current={pathname === item.href ? "page" : undefined}
                  onClick={close}
                >
                  {item.nav}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="nav-sheet-foot">
          <Link
            href="/#contact"
            className="nav-cta"
            onClick={onContact}
            data-cta="get_quote"
          >
            Get a quote
          </Link>
          <a
            href={whatsappHref()}
            target="_blank"
            rel="noopener noreferrer"
            className="contact-button contact-button--light"
            data-track="whatsapp-menu"
          >
            <WhatsAppIcon />
            WhatsApp
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
          <p className="nav-sheet-place">
            Delhi-based, working remotely across India
          </p>
        </div>
      </div>
    </>
  );
}
