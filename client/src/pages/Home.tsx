/*
 * Style reminder: Compose this page as an Aegean Riviera Editorial travel folio.
 * Use horizon-flow sections, asymmetrical information islands, calm tactile motion,
 * and the shell-white / ocean-blue / Lotus Tide / antique-gold color logic.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { useTheme } from "@/contexts/ThemeContext";
import { trpc } from "@/lib/trpc";
import {
  Anchor,
  ArrowDownRight,
  ArrowRight,
  BedDouble,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleUserRound,
  ConciergeBell,
  Heart,
  Instagram,
  Landmark,
  Languages,
  Leaf,
  Map,
  Menu,
  Moon,
  Music2,
  Navigation,
  Phone,
  Search,
  Send,
  Sparkles,
  Star,
  Sun,
  Sunset,
  Utensils,
  Waves,
  Volume2,
  VolumeX,
  X,
  type LucideIcon,
} from "lucide-react";
import {
  activities,
  conciergeAnswers,
  destinations,
  directoryItems,
  featureCards,
  formatDateLabel,
  getActivitiesForDate,
  hotel,
  locales,
  mapPins,
  restaurants,
  roomOptions,
  staff,
  guestMedia,
  diningGalleryImages,
  activitiesGalleryImages,
  activitiesSectionCopy,
  spaGalleryImages,
  spaSectionCopy,
  restaurantBarGalleryImages,
  restaurantBarSectionCopy,
  restaurantBarVenues,
  miniClubGalleryImages,
  miniClubSectionCopy,
  miniClubWeekDays,
  miniClubWeekSchedule,
  accommodationSectionCopy,
  accommodationGalleryImages,
  ui,
  type Activity,
  type Locale,
} from "@/data/content";

const iconMap: Record<string, LucideIcon> = {
  sun: Sun,
  waves: Waves,
  utensils: Utensils,
  anchor: Anchor,
  sunset: Sunset,
  music: Music2,
  heart: Heart,
  sparkles: Sparkles,
  smile: CircleUserRound,
  sparkle: Sparkles,
  bed: BedDouble,
  map: Map,
  concierge: ConciergeBell,
};

type RoomOption = (typeof roomOptions)[number];
type LightboxState = { images: string[]; index: number; label: string };

function Icon({ name, size = 18 }: { name: string; size?: number }) {
  const Component = iconMap[name] ?? Sparkles;
  return <Component size={size} strokeWidth={1.7} aria-hidden="true" />;
}

const scheduleDates = ["2026-08-26", "2026-08-27", "2026-08-28", "2026-08-29", "2026-08-30", "2026-08-31", "2026-09-01", "2026-09-02", "2026-09-03", "2026-09-04"];
const filters = ["All", "Entertainment", "Wellness", "Dining", "Pool", "Beach", "Kids", "Excursions"];

function SectionLabel({ children, light = false }: { children: React.ReactNode; light?: boolean }) {
  return (
    <div className={`section-label ${light ? "section-label-light" : ""}`}>
      <span className="section-label-line" />
      <span>{children}</span>
    </div>
  );
}

function ActivityRow({ activity, locale, onSelect }: { activity: Activity; locale: Locale; onSelect: (activity: Activity) => void }) {
  const title = activity.title[locale] || activity.title.en;
  const description = activity.description[locale] || activity.description.en;
  return (
    <button className="activity-row" onClick={() => onSelect(activity)} aria-label={`View details for ${title}`}>
      <div className="activity-time">
        <span>{activity.start}</span>
        <small>{activity.end}</small>
      </div>
      <div className="activity-rule" />
      <div className="activity-icon"><Icon name={activity.icon} size={17} /></div>
      <div className="activity-copy">
        <div className="activity-meta"><span>{activity.category}</span><span>·</span><span>{activity.location}</span></div>
        <h3>{title}</h3>
        <p>{description}</p>
        <div className="activity-tags">
          <span className={`status-chip ${activity.status === "confirmed" ? "status-confirmed" : "status-pending"}`}>
            <span className="status-dot" />{activity.status === "confirmed" ? "Confirmed" : "Schedule to be confirmed"}
          </span>
          {activity.booking && <span className="plain-tag">Booking required</span>}
        </div>
      </div>
      <ArrowRight size={18} className="activity-arrow" aria-hidden="true" />
    </button>
  );
}

function DiningCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onPreferenceChange = () => setPrefersReducedMotion(mediaQuery.matches);
    mediaQuery.addEventListener("change", onPreferenceChange);
    return () => mediaQuery.removeEventListener("change", onPreferenceChange);
  }, []);

  useEffect(() => {
    if (isPaused || prefersReducedMotion || diningGalleryImages.length < 2) return;
    const timer = window.setInterval(() => setActiveIndex((index) => (index + 1) % diningGalleryImages.length), 5200);
    return () => window.clearInterval(timer);
  }, [isPaused, prefersReducedMotion]);

  const move = (direction: number) => setActiveIndex((index) => (index + direction + diningGalleryImages.length) % diningGalleryImages.length);
  const onTouchStart = (event: React.TouchEvent<HTMLDivElement>) => { touchStartX.current = event.touches[0]?.clientX ?? null; };
  const onTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartX.current === null) return;
    const distance = (event.changedTouches[0]?.clientX ?? touchStartX.current) - touchStartX.current;
    if (Math.abs(distance) > 42) move(distance < 0 ? 1 : -1);
    touchStartX.current = null;
  };

  return (
    <div className="dining-carousel" onMouseEnter={() => setIsPaused(true)} onMouseLeave={() => setIsPaused(false)} onFocus={() => setIsPaused(true)} onBlur={() => setIsPaused(false)}>
      <div className="dining-carousel-viewport" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        <div className="dining-carousel-track" style={{ transform: `translate3d(-${activeIndex * 100}%, 0, 0)` }}>
          {diningGalleryImages.map((image, index) => <figure className="dining-slide" data-lightbox-kind="dining" data-lightbox-index={index} key={`${image}-${index}`} style={{ backgroundImage: `url("${image}")` }} aria-hidden={index !== activeIndex}>
            <img src={image} alt={`Orka Lotus Beach resort detail ${index + 1}`} loading={index < 2 ? "eager" : "lazy"} draggable="false" />
            <figcaption><span>0{String(index + 1).padStart(2, "0")}</span><strong>Lotus Beach moments</strong><small>Swipe to explore the resort</small></figcaption>
          </figure>)}
        </div>
        <button className="dining-carousel-control dining-carousel-prev" type="button" onClick={() => move(-1)} aria-label="Previous resort image"><ChevronLeft size={20} /></button>
        <button className="dining-carousel-control dining-carousel-next" type="button" onClick={() => move(1)} aria-label="Next resort image"><ChevronRight size={20} /></button>
      </div>
      <div className="dining-carousel-toolbar" aria-label="Resort image carousel controls"><span className="dining-carousel-count">{String(activeIndex + 1).padStart(2, "0")} / {String(diningGalleryImages.length).padStart(2, "0")}</span><div className="dining-carousel-dots">{diningGalleryImages.map((image, index) => <button key={`dot-${image}-${index}`} type="button" className={`dining-carousel-dot ${index === activeIndex ? "active" : ""}`} onClick={() => setActiveIndex(index)} aria-label={`Show resort image ${index + 1}`} aria-current={index === activeIndex ? "true" : undefined} />)}</div><span className="dining-carousel-hint">{prefersReducedMotion ? "Manual view" : isPaused ? "Paused" : "Auto-advancing"}</span></div>
    </div>
  );
}

function ActivitiesCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onPreferenceChange = () => setPrefersReducedMotion(mediaQuery.matches);
    mediaQuery.addEventListener("change", onPreferenceChange);
    return () => mediaQuery.removeEventListener("change", onPreferenceChange);
  }, []);

  useEffect(() => {
    if (isPaused || prefersReducedMotion || activitiesGalleryImages.length < 2) return;
    const timer = window.setInterval(() => setActiveIndex((index) => (index + 1) % activitiesGalleryImages.length), 5200);
    return () => window.clearInterval(timer);
  }, [isPaused, prefersReducedMotion]);

  const move = (direction: number) => setActiveIndex((index) => (index + direction + activitiesGalleryImages.length) % activitiesGalleryImages.length);
  const onTouchStart = (event: React.TouchEvent<HTMLDivElement>) => { touchStartX.current = event.touches[0]?.clientX ?? null; };
  const onTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartX.current === null) return;
    const distance = (event.changedTouches[0]?.clientX ?? touchStartX.current) - touchStartX.current;
    if (Math.abs(distance) > 42) move(distance < 0 ? 1 : -1);
    touchStartX.current = null;
  };

  return (
    <div className="dining-carousel activities-carousel" onMouseEnter={() => setIsPaused(true)} onMouseLeave={() => setIsPaused(false)} onFocus={() => setIsPaused(true)} onBlur={() => setIsPaused(false)}>
      <div className="dining-carousel-viewport" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        <div className="dining-carousel-track" style={{ transform: `translate3d(-${activeIndex * 100}%, 0, 0)` }}>
          {activitiesGalleryImages.map((image, index) => <figure className="dining-slide activities-slide" data-lightbox-kind="activities" data-lightbox-index={index} key={`${image}-${index}`} style={{ backgroundImage: `url("${image}")` }} aria-hidden={index !== activeIndex}>
            <img src={image} alt={`Lotus activity ${index + 1}`} loading={index < 2 ? "eager" : "lazy"} draggable="false" />
            <figcaption><span>0{String(index + 1).padStart(2, "0")}</span><strong>Lotus Activities</strong><small>Swipe to explore the options</small></figcaption>
          </figure>)}
        </div>
        <button className="dining-carousel-control dining-carousel-prev" type="button" onClick={() => move(-1)} aria-label="Previous activity image"><ChevronLeft size={20} /></button>
        <button className="dining-carousel-control dining-carousel-next" type="button" onClick={() => move(1)} aria-label="Next activity image"><ChevronRight size={20} /></button>
      </div>
      <div className="dining-carousel-toolbar" aria-label="Lotus Activities image carousel controls"><span className="dining-carousel-count">{String(activeIndex + 1).padStart(2, "0")} / {String(activitiesGalleryImages.length).padStart(2, "0")}</span><div className="dining-carousel-dots">{activitiesGalleryImages.map((image, index) => <button key={`activity-dot-${image}-${index}`} type="button" className={`dining-carousel-dot ${index === activeIndex ? "active" : ""}`} onClick={() => setActiveIndex(index)} aria-label={`Show activity image ${index + 1}`} aria-current={index === activeIndex ? "true" : undefined} />)}</div><span className="dining-carousel-hint">{prefersReducedMotion ? "Manual view" : isPaused ? "Paused" : "Auto-advancing"}</span></div>
    </div>
  );
}

function SpaCarousel({ locale }: { locale: Locale }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onPreferenceChange = () => setPrefersReducedMotion(mediaQuery.matches);
    mediaQuery.addEventListener("change", onPreferenceChange);
    return () => mediaQuery.removeEventListener("change", onPreferenceChange);
  }, []);

  useEffect(() => {
    if (isPaused || prefersReducedMotion || spaGalleryImages.length < 2) return;
    const timer = window.setInterval(() => setActiveIndex((index) => (index + 1) % spaGalleryImages.length), 5200);
    return () => window.clearInterval(timer);
  }, [isPaused, prefersReducedMotion]);

  const move = (direction: number) => setActiveIndex((index) => (index + direction + spaGalleryImages.length) % spaGalleryImages.length);
  const onTouchStart = (event: React.TouchEvent<HTMLDivElement>) => { touchStartX.current = event.touches[0]?.clientX ?? null; };
  const onTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartX.current === null) return;
    const distance = (event.changedTouches[0]?.clientX ?? touchStartX.current) - touchStartX.current;
    if (Math.abs(distance) > 42) move(distance < 0 ? 1 : -1);
    touchStartX.current = null;
  };

  return (
    <div className="dining-carousel spa-carousel" onMouseEnter={() => setIsPaused(true)} onMouseLeave={() => setIsPaused(false)} onFocus={() => setIsPaused(true)} onBlur={() => setIsPaused(false)}>
      <div className="dining-carousel-viewport" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        <div className="dining-carousel-track" style={{ transform: `translate3d(-${activeIndex * 100}%, 0, 0)` }}>
          {spaGalleryImages.map((image, index) => <figure className="dining-slide spa-slide" data-lightbox-kind="spa" data-lightbox-index={index} key={`${image}-${index}`} style={{ backgroundImage: `url("${image}")` }} aria-hidden={index !== activeIndex}>
            <img src={image} alt={`Lotus spa area ${index + 1}`} loading={index < 2 ? "eager" : "lazy"} draggable="false" />
            <figcaption><span>0{String(index + 1).padStart(2, "0")}</span><strong>Lotus Spa</strong><small>{spaSectionCopy.photosLabel[locale]}</small></figcaption>
          </figure>)}
        </div>
        <button className="dining-carousel-control dining-carousel-prev" type="button" onClick={() => move(-1)} aria-label="Previous spa image"><ChevronLeft size={20} /></button>
        <button className="dining-carousel-control dining-carousel-next" type="button" onClick={() => move(1)} aria-label="Next spa image"><ChevronRight size={20} /></button>
      </div>
      <div className="dining-carousel-toolbar" aria-label="Lotus Spa image carousel controls"><span className="dining-carousel-count">{String(activeIndex + 1).padStart(2, "0")} / {String(spaGalleryImages.length).padStart(2, "0")}</span><div className="dining-carousel-dots">{spaGalleryImages.map((image, index) => <button key={`spa-dot-${image}-${index}`} type="button" className={`dining-carousel-dot ${index === activeIndex ? "active" : ""}`} onClick={() => setActiveIndex(index)} aria-label={`Show spa image ${index + 1}`} aria-current={index === activeIndex ? "true" : undefined} />)}</div><span className="dining-carousel-hint">{prefersReducedMotion ? "Manual view" : isPaused ? "Paused" : "Auto-advancing"}</span></div>
    </div>
  );
}

function RestaurantBarCarousel({ locale }: { locale: Locale }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onPreferenceChange = () => setPrefersReducedMotion(mediaQuery.matches);
    mediaQuery.addEventListener("change", onPreferenceChange);
    return () => mediaQuery.removeEventListener("change", onPreferenceChange);
  }, []);

  useEffect(() => {
    if (isPaused || prefersReducedMotion || restaurantBarGalleryImages.length < 2) return;
    const timer = window.setInterval(() => setActiveIndex((index) => (index + 1) % restaurantBarGalleryImages.length), 5200);
    return () => window.clearInterval(timer);
  }, [isPaused, prefersReducedMotion]);

  const move = (direction: number) => setActiveIndex((index) => (index + direction + restaurantBarGalleryImages.length) % restaurantBarGalleryImages.length);
  const onTouchStart = (event: React.TouchEvent<HTMLDivElement>) => { touchStartX.current = event.touches[0]?.clientX ?? null; };
  const onTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartX.current === null) return;
    const distance = (event.changedTouches[0]?.clientX ?? touchStartX.current) - touchStartX.current;
    if (Math.abs(distance) > 42) move(distance < 0 ? 1 : -1);
    touchStartX.current = null;
  };

  return (
    <div className="dining-carousel restaurant-bar-carousel" onMouseEnter={() => setIsPaused(true)} onMouseLeave={() => setIsPaused(false)} onFocus={() => setIsPaused(true)} onBlur={() => setIsPaused(false)}>
      <div className="dining-carousel-viewport" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        <div className="dining-carousel-track" style={{ transform: `translate3d(-${activeIndex * 100}%, 0, 0)` }}>
          {restaurantBarGalleryImages.map((image, index) => <figure className="dining-slide restaurant-bar-slide" data-lightbox-kind="restaurantBar" data-lightbox-index={index} key={`${image}-${index}`} style={{ backgroundImage: `url("${image}")` }} aria-hidden={index !== activeIndex}>
            <img src={image} alt={`Lotus restaurant and bar area ${index + 1}`} loading={index < 2 ? "eager" : "lazy"} draggable="false" />
            <figcaption><span>0{String(index + 1).padStart(2, "0")}</span><strong>Restaurant &amp; Bar</strong><small>{restaurantBarSectionCopy.photosLabel[locale]}</small></figcaption>
          </figure>)}
        </div>
        <button className="dining-carousel-control dining-carousel-prev" type="button" onClick={() => move(-1)} aria-label="Previous restaurant and bar image"><ChevronLeft size={20} /></button>
        <button className="dining-carousel-control dining-carousel-next" type="button" onClick={() => move(1)} aria-label="Next restaurant and bar image"><ChevronRight size={20} /></button>
      </div>
      <div className="dining-carousel-toolbar" aria-label="Restaurant and Bar image carousel controls"><span className="dining-carousel-count">{String(activeIndex + 1).padStart(2, "0")} / {String(restaurantBarGalleryImages.length).padStart(2, "0")}</span><div className="dining-carousel-dots">{restaurantBarGalleryImages.map((image, index) => <button key={`restaurant-bar-dot-${image}-${index}`} type="button" className={`dining-carousel-dot ${index === activeIndex ? "active" : ""}`} onClick={() => setActiveIndex(index)} aria-label={`Show restaurant and bar image ${index + 1}`} aria-current={index === activeIndex ? "true" : undefined} />)}</div><span className="dining-carousel-hint">{prefersReducedMotion ? "Manual view" : isPaused ? "Paused" : "Auto-advancing"}</span></div>
    </div>
  );
}

function MiniClubCarousel({ locale }: { locale: Locale }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onPreferenceChange = () => setPrefersReducedMotion(mediaQuery.matches);
    mediaQuery.addEventListener("change", onPreferenceChange);
    return () => mediaQuery.removeEventListener("change", onPreferenceChange);
  }, []);

  useEffect(() => {
    if (isPaused || prefersReducedMotion || miniClubGalleryImages.length < 2) return;
    const timer = window.setInterval(() => setActiveIndex((index) => (index + 1) % miniClubGalleryImages.length), 5200);
    return () => window.clearInterval(timer);
  }, [isPaused, prefersReducedMotion]);

  const move = (direction: number) => setActiveIndex((index) => (index + direction + miniClubGalleryImages.length) % miniClubGalleryImages.length);
  const onTouchStart = (event: React.TouchEvent<HTMLDivElement>) => { touchStartX.current = event.touches[0]?.clientX ?? null; };
  const onTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartX.current === null) return;
    const distance = (event.changedTouches[0]?.clientX ?? touchStartX.current) - touchStartX.current;
    if (Math.abs(distance) > 42) move(distance < 0 ? 1 : -1);
    touchStartX.current = null;
  };

  return (
    <div className="dining-carousel mini-club-carousel" onMouseEnter={() => setIsPaused(true)} onMouseLeave={() => setIsPaused(false)} onFocus={() => setIsPaused(true)} onBlur={() => setIsPaused(false)}>
      <div className="dining-carousel-viewport" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        <div className="dining-carousel-track" style={{ transform: `translate3d(-${activeIndex * 100}%, 0, 0)` }}>
          {miniClubGalleryImages.map((image, index) => <figure className="dining-slide mini-club-slide" data-lightbox-kind="miniClub" data-lightbox-index={index} key={`${image}-${index}`} style={{ backgroundImage: `url("${image}")` }} aria-hidden={index !== activeIndex}>
            <img src={image} alt={`Lotus Mini Club ${index + 1}`} loading={index < 2 ? "eager" : "lazy"} draggable="false" />
            <figcaption><span>0{String(index + 1).padStart(2, "0")}</span><strong>Mini Club</strong><small>{miniClubSectionCopy.age[locale]}</small></figcaption>
          </figure>)}
        </div>
        <button className="dining-carousel-control dining-carousel-prev" type="button" onClick={() => move(-1)} aria-label="Previous Mini Club image"><ChevronLeft size={20} /></button>
        <button className="dining-carousel-control dining-carousel-next" type="button" onClick={() => move(1)} aria-label="Next Mini Club image"><ChevronRight size={20} /></button>
      </div>
      <div className="dining-carousel-toolbar" aria-label="Mini Club image carousel controls"><span className="dining-carousel-count">{String(activeIndex + 1).padStart(2, "0")} / {String(miniClubGalleryImages.length).padStart(2, "0")}</span><div className="dining-carousel-dots">{miniClubGalleryImages.map((image, index) => <button key={`mini-club-dot-${image}-${index}`} type="button" className={`dining-carousel-dot ${index === activeIndex ? "active" : ""}`} onClick={() => setActiveIndex(index)} aria-label={`Show Mini Club image ${index + 1}`} aria-current={index === activeIndex ? "true" : undefined} />)}</div><span className="dining-carousel-hint">{prefersReducedMotion ? "Manual view" : isPaused ? "Paused" : "Auto-advancing"}</span></div>
    </div>
  );
}

function KidsActivitySchedule({ locale }: { locale: Locale }) {
  const [selectedDay, setSelectedDay] = useState(0);
  const selectedActivities = miniClubWeekSchedule.filter((item) => item.dayIndex === selectedDay);
  const dayLabels = miniClubWeekDays[locale];

  return (
    <div className="kids-schedule" aria-label={miniClubSectionCopy.scheduleTitle[locale]}>
      <div className="kids-schedule-header"><div><SectionLabel>{miniClubSectionCopy.scheduleTitle[locale]}</SectionLabel><h3>{dayLabels[selectedDay]}</h3></div><span className="kids-schedule-hours">{miniClubSectionCopy.hours}</span></div>
      <div className="kids-day-tabs" role="tablist" aria-label={miniClubSectionCopy.scheduleTitle[locale]}>
        {dayLabels.map((day, index) => <button key={day} type="button" role="tab" aria-selected={selectedDay === index} className={`kids-day-tab ${selectedDay === index ? "active" : ""}`} onClick={() => setSelectedDay(index)}><span>0{index + 1}</span><strong>{day.slice(0, 3)}</strong></button>)}
      </div>
      <div className="kids-schedule-list" role="tabpanel">
        {selectedActivities.map((item, index) => <button type="button" className="kids-schedule-item" key={`${item.dayIndex}-${item.time}-${index}`} onClick={() => toast(item.title[locale], { description: `${dayLabels[selectedDay]} · ${item.time}` })}><span className="kids-schedule-time">{item.time}</span><span className="kids-schedule-rule" /><span className="kids-schedule-title">{item.title[locale]}</span><ArrowRight size={15} /></button>)}
      </div>
    </div>
  );
}

const BRAND_LOGO_URL = "https://www.orkalotusbeach.com/wp-content/themes/yktheme/assets/img/logo_sub.png";

function BrandLogo({ className = "" }: { className?: string }) {
  return <span className={`brand-logo-scan ${className}`}><img className="brand-logo-image" src={BRAND_LOGO_URL} alt="Orka Lotus Beach" /></span>;
}

function LanguagePicker({ locale, open, onToggle, onSelect, placement = "header" }: { locale: Locale; open: boolean; onToggle: () => void; onSelect: (locale: Locale) => void; placement?: "header" | "sidebar" | "footer" }) {
  const current = locales.find((item) => item.code === locale);
  return (
    <div className={`language-wrap language-wrap-${placement}`}>
      <button className="language-button" type="button" onClick={onToggle} aria-expanded={open} aria-haspopup="listbox" aria-label="Choose language">
        <Languages size={16} /><span>{current?.native}</span><ChevronDown size={14} />
      </button>
      {open && <div className="language-menu" role="listbox" aria-label="Choose language">
        {locales.map((item) => <button key={item.code} type="button" role="option" aria-selected={item.code === locale} onClick={() => onSelect(item.code)} className={item.code === locale ? "selected" : ""}><span>{item.native}</span><small>{item.label}</small>{item.code === locale && <Check size={14} />}</button>)}
      </div>}
    </div>
  );
}

function ThemeButton() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button className="icon-button" onClick={toggleTheme} aria-label={`Switch to ${theme === "light" ? "dark" : "light"} theme`} title={`Switch to ${theme === "light" ? "dark" : "light"} theme`}>
      {theme === "light" ? <Moon size={17} /> : <Sun size={17} />}
    </button>
  );
}

function MiniCalendar({ selectedDate, locale, onSelectDate }: { selectedDate: string; locale: Locale; onSelectDate: (date: string) => void }) {
  const [viewDate, setViewDate] = useState(() => new Date(`${selectedDate}T12:00:00`));
  const monthKey = `${viewDate.getFullYear()}-${viewDate.getMonth()}`;
  const monthLabel = new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(viewDate);
  const weekDays = Array.from({ length: 7 }, (_, index) => new Intl.DateTimeFormat(locale, { weekday: "short" }).format(new Date(2026, 7, 2 + index)));
  const days = useMemo(() => {
    const first = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1, 12);
    const start = new Date(first);
    start.setDate(1 - first.getDay());
    return Array.from({ length: 42 }, (_, index) => {
      const day = new Date(start);
      day.setDate(start.getDate() + index);
      return day;
    });
  }, [monthKey]);

  useEffect(() => {
    const selected = new Date(`${selectedDate}T12:00:00`);
    if (selected.getFullYear() !== viewDate.getFullYear() || selected.getMonth() !== viewDate.getMonth()) {
      setViewDate(selected);
    }
  }, [selectedDate]);

  const moveMonth = (amount: number) => setViewDate((current) => new Date(current.getFullYear(), current.getMonth() + amount, 1, 12));
  const toIso = (day: Date) => `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, "0")}-${String(day.getDate()).padStart(2, "0")}`;

  return (
    <div className="mini-calendar" aria-label="Guest activities calendar">
      <div className="mini-calendar-top">
        <div><span className="mini-label">Shared with the live schedule</span><strong>{monthLabel}</strong></div>
        <div className="mini-calendar-controls">
          <button type="button" onClick={() => moveMonth(-1)} aria-label="Previous month"><ChevronLeft size={16} /></button>
          <button type="button" onClick={() => moveMonth(1)} aria-label="Next month"><ChevronRight size={16} /></button>
        </div>
      </div>
      <div className="mini-calendar-grid mini-calendar-weekdays" aria-hidden="true">
        {weekDays.map((day) => <span key={day}>{day.slice(0, 2)}</span>)}
      </div>
      <div className="mini-calendar-grid mini-calendar-days">
        {days.map((day) => {
          const iso = toIso(day);
          const count = getActivitiesForDate(iso).length;
          const isSelected = iso === selectedDate;
          const isCurrentMonth = day.getMonth() === viewDate.getMonth();
          return <button type="button" key={iso} className={`mini-calendar-day ${isCurrentMonth ? "" : "outside"} ${isSelected ? "selected" : ""}`} onClick={() => { onSelectDate(iso); setViewDate(day); }} aria-label={`${formatDateLabel(iso)}${count ? `, ${count} activities` : ", no activities listed"}`} aria-pressed={isSelected}><span>{day.getDate()}</span>{count > 0 && <i aria-hidden="true">{count}</i>}</button>;
        })}
      </div>
      <div className="mini-calendar-foot"><span><i className="mini-calendar-dot" />Activities listed</span><button type="button" onClick={() => { const today = new Date(); const iso = toIso(today); onSelectDate(iso); setViewDate(today); }}>Go to today <ArrowRight size={14} /></button></div>
    </div>
  );
}

export default function Home() {
  const [locale, setLocale] = useState<Locale>("en");
  const systemDate = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(scheduleDates.includes(systemDate) ? systemDate : "2026-08-26");
  const [dateWindowStart, setDateWindowStart] = useState(0);
  const [filter, setFilter] = useState("All");
  const [menuOpen, setMenuOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<RoomOption | null>(null);
  const [selectedDayPopup, setSelectedDayPopup] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState<LightboxState | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [expandedQuestion, setExpandedQuestion] = useState(0);
  const [savedActivities, setSavedActivities] = useState<string[]>([]);
  const [heroMuted, setHeroMuted] = useState(false);
  const [heroVideoStage, setHeroVideoStage] = useState<0 | 1>(0);
  const [heroLoopCount, setHeroLoopCount] = useState(0);
  const [heroMediaFailed, setHeroMediaFailed] = useState(false);
  const [heroAudioFailed, setHeroAudioFailed] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const heroVideoRef = useRef<HTMLVideoElement>(null);
  const heroEndVideoRef = useRef<HTMLVideoElement>(null);
  const heroAudioRef = useRef<HTMLAudioElement>(null);
  const heroTransitioningRef = useRef(false);
  const heroVideoReadyRef = useRef<Record<0 | 1, boolean>>({ 0: false, 1: false });
  const heroWaitingForReadyRef = useRef(false);
  const copy = ui[locale];
  const isRtl = locale === "ar" || locale === "fa";
  const lightboxSets: Record<string, { images: string[]; label: string }> = {
    dining: { images: diningGalleryImages, label: "Dining" },
    activities: { images: activitiesGalleryImages, label: "Lotus Activities" },
    spa: { images: spaGalleryImages, label: "Lotus Spa" },
    restaurantBar: { images: restaurantBarGalleryImages, label: "Restaurant & Bar" },
    miniClub: { images: miniClubGalleryImages, label: "Mini Club" },
    accommodation: { images: accommodationGalleryImages, label: accommodationSectionCopy.roomsLabel[locale] },
  };

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onPreferenceChange = () => setPrefersReducedMotion(mediaQuery.matches);
    mediaQuery.addEventListener("change", onPreferenceChange);
    return () => mediaQuery.removeEventListener("change", onPreferenceChange);
  }, []);

  useEffect(() => {
    const hero = document.querySelector<HTMLElement>(".hero-section");
    if (!hero) return;
    if (prefersReducedMotion) {
      hero.style.setProperty("--hero-parallax", "0px");
      return;
    }
    let frame = 0;
    const updateParallax = () => {
      frame = 0;
      const progress = Math.max(-0.15, Math.min(1, -hero.getBoundingClientRect().top / Math.max(hero.offsetHeight, 1)));
      hero.style.setProperty("--hero-parallax", `${progress * 110}px`);
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(updateParallax);
    };
    updateParallax();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [prefersReducedMotion]);

  useEffect(() => {
    if (prefersReducedMotion) {
      heroVideoRef.current?.pause();
      heroEndVideoRef.current?.pause();
      return;
    }

    const startInitialPlayback = () => {
      const v0 = heroVideoRef.current;
      if (v0) {
        v0.muted = true;
        v0.defaultMuted = true;
        v0.playsInline = true;
        const playPromise = v0.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            // Autoplay blocked by browser policy until interaction
          });
        }
      }
    };

    startInitialPlayback();

    const handleUserGesture = () => {
      const activeVideo = heroVideoStage === 0 ? heroVideoRef.current : heroEndVideoRef.current;
      if (activeVideo && activeVideo.paused && !prefersReducedMotion) {
        activeVideo.muted = true;
        void activeVideo.play().catch(() => undefined);
      }
    };

    window.addEventListener("click", handleUserGesture, { passive: true });
    window.addEventListener("touchstart", handleUserGesture, { passive: true });
    window.addEventListener("scroll", handleUserGesture, { passive: true, once: true });

    return () => {
      window.removeEventListener("click", handleUserGesture);
      window.removeEventListener("touchstart", handleUserGesture);
      window.removeEventListener("scroll", handleUserGesture);
    };
  }, [prefersReducedMotion, heroVideoStage]);

  useEffect(() => {
    const audio = heroAudioRef.current;
    if (!audio) return;
    audio.muted = heroMuted;
    if (!heroMuted) {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Browser policy requires user gesture: unlock audio on first interaction
          const unlockSound = () => {
            const currentAudio = heroAudioRef.current;
            if (currentAudio && !heroMuted) {
              currentAudio.muted = false;
              void currentAudio.play().catch(() => {});
            }
            window.removeEventListener("pointerdown", unlockSound);
            window.removeEventListener("click", unlockSound);
            window.removeEventListener("touchstart", unlockSound);
            window.removeEventListener("scroll", unlockSound);
            window.removeEventListener("keydown", unlockSound);
          };
          window.addEventListener("pointerdown", unlockSound, { once: true, passive: true });
          window.addEventListener("click", unlockSound, { once: true, passive: true });
          window.addEventListener("touchstart", unlockSound, { once: true, passive: true });
          window.addEventListener("scroll", unlockSound, { once: true, passive: true });
          window.addEventListener("keydown", unlockSound, { once: true, passive: true });
        });
      }
    } else {
      audio.pause();
    }
  }, [heroMuted]);

  const advanceHeroVideo = (finishedStage: 0 | 1) => {
    if (prefersReducedMotion || heroTransitioningRef.current) return;
    const nextStage: 0 | 1 = finishedStage === 0 ? 1 : 0;
    const nextVideo = nextStage === 0 ? heroVideoRef.current : heroEndVideoRef.current;
    if (!nextVideo) return;
    if (!heroVideoReadyRef.current[nextStage] && nextVideo.readyState < HTMLMediaElement.HAVE_FUTURE_DATA) {
      if (heroWaitingForReadyRef.current) return;
      heroWaitingForReadyRef.current = true;
      const retryWhenReady = () => {
        window.clearTimeout(readinessTimeout);
        heroWaitingForReadyRef.current = false;
        heroVideoReadyRef.current[nextStage] = true;
        advanceHeroVideo(finishedStage);
      };
      const readinessTimeout = window.setTimeout(() => {
        nextVideo.removeEventListener("canplay", retryWhenReady);
        heroWaitingForReadyRef.current = false;
        const currentVideo = finishedStage === 0 ? heroVideoRef.current : heroEndVideoRef.current;
        if (currentVideo) {
          currentVideo.currentTime = 0;
          void currentVideo.play().catch(() => undefined);
        }
      }, 1500);
      nextVideo.addEventListener("canplay", retryWhenReady, { once: true });
      nextVideo.load();
      return;
    }
    heroTransitioningRef.current = true;
    nextVideo.currentTime = 0;
    void nextVideo.play().catch(() => {
      const currentVideo = finishedStage === 0 ? heroVideoRef.current : heroEndVideoRef.current;
      if (currentVideo) {
        currentVideo.currentTime = 0;
        void currentVideo.play().catch(() => undefined);
      }
    });
    setHeroVideoStage(nextStage);
    if (finishedStage === 1) setHeroLoopCount((count) => count + 1);
    window.setTimeout(() => { heroTransitioningRef.current = false; }, 900);
  };

  const handleHeroVideoTimeUpdate = (stage: 0 | 1) => {
    if (prefersReducedMotion || heroTransitioningRef.current) return;
    const video = stage === 0 ? heroVideoRef.current : heroEndVideoRef.current;
    if (video && Number.isFinite(video.duration) && video.duration > 1 && video.currentTime >= video.duration - 0.8) advanceHeroVideo(stage);
  };

  const toggleHeroAudio = () => {
    if (heroAudioFailed) return;
    const nextMuted = !heroMuted;
    const audio = heroAudioRef.current;
    if (audio) {
      audio.muted = nextMuted;
      if (!nextMuted) void audio.play().catch(() => toast("Tap sound again to start the soundtrack."));
      else audio.pause();
    }
    setHeroMuted(nextMuted);
  };

  const dailyActivities = useMemo(() => {
    const selected = getActivitiesForDate(date);
    return filter === "All" ? selected : selected.filter((item) => item.category === filter);
  }, [date, filter]);

  const filteredDirectory = useMemo(() => {
    if (!query.trim()) return directoryItems;
    const normalized = query.toLowerCase();
    return directoryItems.filter((item) => `${item.title} ${item.detail}`.toLowerCase().includes(normalized));
  }, [query]);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };

  const toggleSaved = (activity: Activity) => {
    setSavedActivities((current) => current.includes(activity.id) ? current.filter((id) => id !== activity.id) : [...current, activity.id]);
    toast.success(savedActivities.includes(activity.id) ? "Removed from your day" : "Added to your day", { description: activity.title.en });
  };

  return (
    <div className="site-shell" dir={isRtl ? "rtl" : "ltr"}>
      <header className="site-header">
        <div className="header-inner">
          <button className="brand-lockup" onClick={() => scrollTo("top")} aria-label="Back to the top">
            <BrandLogo className="header-brand-logo" />
          </button>
          <nav className="desktop-nav" aria-label="Primary navigation">
            <button onClick={() => scrollTo("today")} className="nav-link nav-link-active">{copy.nav[0]}</button>
            <button onClick={() => scrollTo("directory")} className="nav-link">{copy.nav[1]}</button>
            <button onClick={() => scrollTo("dining")} className="nav-link">{copy.nav[2]}</button>
            <button onClick={() => scrollTo("wellness")} className="nav-link">{copy.nav[3]}</button>
            <button onClick={() => scrollTo("destination")} className="nav-link">{copy.nav[4]}</button>
          </nav>
          <div className="header-actions">
            <LanguagePicker locale={locale} open={languageOpen} onToggle={() => setLanguageOpen((open) => !open)} onSelect={(nextLocale) => { setLocale(nextLocale); setLanguageOpen(false); }} placement="header" />
            <ThemeButton />
            <button className="menu-button" onClick={() => setMenuOpen(true)} aria-label="Open menu"><Menu size={21} /></button>
          </div>
        </div>
      </header>

      {menuOpen && <div className="menu-backdrop" onClick={() => setMenuOpen(false)}>
        <aside className="side-menu" onClick={(event) => event.stopPropagation()}>
          <div className="side-menu-top"><BrandLogo className="sidebar-brand-logo" /><button className="icon-button" onClick={() => setMenuOpen(false)} aria-label="Close menu"><X size={19} /></button></div>
          <p className="side-menu-intro">Everything you need for a more effortless day by the Aegean.</p>
          <div className="side-menu-links">
            {[{ label: "Today at Lotus", id: "today" }, { label: "Hotel directory", id: "directory" }, { label: "Dining & bars", id: "dining" }, { label: "Wellness & spa", id: "wellness" }, { label: "Hotel map", id: "map" }, { label: "Marmaris guide", id: "destination" }].map((item) => <button key={item.id} onClick={() => scrollTo(item.id)}><span>{item.label}</span><ArrowDownRight size={17} /></button>)}
          </div>
          <div className="side-menu-footer"><LanguagePicker locale={locale} open={languageOpen} onToggle={() => setLanguageOpen((open) => !open)} onSelect={(nextLocale) => { setLocale(nextLocale); setLanguageOpen(false); }} placement="sidebar" /><p>Need a hand?</p><a href="tel:4446752"><Phone size={16} /> Dial reception</a><a href="mailto:info.orkalotus@orkahotels.com"><Send size={16} /> Email guest relations</a></div>
        </aside>
      </div>}

      <main id="top" onClick={(event) => { const figure = (event.target as HTMLElement).closest<HTMLElement>("[data-lightbox-kind]"); if (!figure) return; const item = lightboxSets[figure.dataset.lightboxKind ?? ""]; const index = Number(figure.dataset.lightboxIndex); if (item && Number.isFinite(index)) setLightbox({ images: item.images, index, label: item.label }); }}>
        <section className="hero-section" data-hero-stage={heroVideoStage} data-hero-loop={heroLoopCount}>
          {heroMediaFailed ? (
            <img src={guestMedia.heroFirstFrame} alt="Orka Lotus Beach" className="hero-video is-active" />
          ) : (
            <>
              <video
                ref={heroVideoRef}
                src={guestMedia.heroVideoIntro}
                poster={guestMedia.heroFirstFrame}
                className={`hero-video hero-video-sequence ${heroVideoStage === 0 ? "is-active" : "is-inactive"}`}
                autoPlay={!prefersReducedMotion}
                muted
                playsInline
                preload="auto"
                onCanPlay={() => { heroVideoReadyRef.current[0] = true; }}
                onTimeUpdate={() => handleHeroVideoTimeUpdate(0)}
                onEnded={() => advanceHeroVideo(0)}
                onError={() => setHeroMediaFailed(true)}
                aria-label="Orka Lotus Beach introduction video"
              >
                <source src={guestMedia.heroVideoIntro} type="video/mp4" />
              </video>
              <video
                ref={heroEndVideoRef}
                src={guestMedia.heroVideoEnd}
                poster={guestMedia.heroFirstFrame}
                className={`hero-video hero-video-sequence ${heroVideoStage === 1 ? "is-active" : "is-inactive"}`}
                muted
                playsInline
                preload="auto"
                onCanPlay={() => { heroVideoReadyRef.current[1] = true; }}
                onTimeUpdate={() => handleHeroVideoTimeUpdate(1)}
                onEnded={() => advanceHeroVideo(1)}
                onError={() => setHeroMediaFailed(true)}
                aria-label="Orka Lotus Beach ending video"
              >
                <source src={guestMedia.heroVideoEnd} type="video/mp4" />
              </video>
            </>
          )}
          <audio
            ref={heroAudioRef}
            src={guestMedia.heroAudio}
            loop
            preload="auto"
            muted={heroMuted}
            onError={() => {
              const directUrl = "https://raw.githubusercontent.com/ryusoi/orkalotusmanus1/main/AUDIO/Summer%20audio.m4a";
              if (heroAudioRef.current && heroAudioRef.current.src !== directUrl) {
                heroAudioRef.current.src = directUrl;
                if (!heroMuted) void heroAudioRef.current.play().catch(() => {});
              } else {
                setHeroAudioFailed(true);
              }
            }}
            aria-hidden="true"
          >
            <source src={guestMedia.heroAudio} type="audio/mp4" />
            <source src="https://raw.githubusercontent.com/ryusoi/orkalotusmanus1/main/AUDIO/Summer%20audio.m4a" type="audio/mp4" />
          </audio>
          <div className="container hero-content">
            <div className="hero-top-bar">
              <p className="hero-overline hero-top-overline">Marmaris · Icmeler · Aegean Sea</p>
              <h1 key={`hero-title-loop-${heroLoopCount}`} className="hero-flash-title" aria-label="YOUR STAY YOUR DAY YOUR LOTUS">
                {[
                  { text: "YOUR STAY", key: "stay" },
                  { text: "YOUR DAY", key: "day" },
                  { text: "YOUR LOTUS", key: "lotus" }
                ].map((item, lineIndex, arr) => {
                  const prevChars = arr.slice(0, lineIndex).reduce((sum, l) => sum + l.text.length, 0);
                  const linePause = lineIndex * 0.22;
                  return (
                    <span key={item.key} className="hero-flash-line">
                      {item.text.split("").map((char, charIndex) => {
                        const globalIndex = prevChars + charIndex;
                        const isSpace = char === " ";
                        return (
                          <span
                            key={charIndex}
                            className={`hero-flash-char ${isSpace ? "hero-flash-space" : ""}`}
                            style={{
                              animationDelay: `${0.35 + globalIndex * 0.11 + linePause}s`
                            }}
                            aria-hidden="true"
                          >
                            {isSpace ? "\u00A0" : char}
                          </span>
                        );
                      })}
                    </span>
                  );
                })}
              </h1>
            </div>
            <div className="hero-bottom-message">
              <p className="hero-description hero-bottom-description">Everything happening at ORKA LOTUS BEACH — in one beautifully simple place.</p>
            </div>
          </div>
          <div className="hero-bottom-bar container">
            <div className="hero-location"><Navigation size={14} /> İÇMELER, MARMARİS</div>
            <button
              className="hero-mute-button"
              type="button"
              onClick={toggleHeroAudio}
              aria-pressed={!heroMuted}
              aria-label={heroAudioFailed ? "Soundtrack unavailable" : heroMuted ? "Unmute audio" : "Mute audio"}
              title={heroAudioFailed ? "Soundtrack unavailable" : heroMuted ? "Unmute audio" : "Mute audio"}
              disabled={heroAudioFailed}
            >
              {heroAudioFailed || heroMuted ? <VolumeX size={17} /> : <Volume2 size={17} />}
            </button>
          </div>
        </section>

        <section className="arrival-bar">
          <div className="container arrival-inner">
            <div className="arrival-heading"><span className="arrival-icon"><Sun size={18} /></span><div><span className="mini-label">Now in Marmaris</span><strong>{hotel.weather} <small>Clear sky</small></strong></div></div>
            <div className="arrival-pills">
              <button type="button" onClick={() => scrollTo("today")} aria-label="Today at Lotus" title="Today at Lotus"><CalendarDays size={16} /><span>Today at Lotus</span><ArrowRight size={15} /></button>
              <button type="button" onClick={() => scrollTo("directory")} aria-label="Hotel directory" title="Hotel directory"><ConciergeBell size={16} /><span>Hotel directory</span><ArrowRight size={15} /></button>
              <button type="button" onClick={() => { setSearchOpen(true); setTimeout(() => document.getElementById("directory-search")?.focus(), 50); }} aria-label="Find something" title="Find something"><Search size={16} /><span>Find something</span><ArrowRight size={15} /></button>
            </div>
          </div>
        </section>

        <section id="today" className="section section-today">
          <div className="container">
            <div className="section-heading-row">
              <div><SectionLabel>Live schedule</SectionLabel><h2>Today at <em>Lotus.</em></h2><p className="section-lede">A gentle rhythm of sea, movement, flavour and music. Tap any moment for the details.</p></div>
              <div className="section-side-note"><span>26</span><small>August<br />2026</small></div>
            </div>
            <div className="today-layout">
              <div className="schedule-panel">
                <div className="schedule-header"><div><span className="live-pulse" /> <span>Live guest schedule</span></div><button className="text-button" onClick={() => { setFilter("All"); setDate("2026-08-26"); setDateWindowStart(0); }}>Reset view <X size={13} /></button></div>
                <div className="date-strip-shell">
                  <button className="date-strip-nav date-strip-nav-prev" type="button" onClick={() => setDateWindowStart((start) => Math.max(0, start - 1))} disabled={dateWindowStart === 0} aria-label="Show earlier dates"><ChevronLeft size={16} /></button>
                  <div className="date-strip-viewport">
                    <div className="date-strip" role="tablist" aria-label="Choose a day" style={{ transform: `translateX(-${dateWindowStart * 10}%)` }}>
                      {scheduleDates.map((item, index) => <button key={item} onClick={() => { setDate(item); setDateWindowStart(Math.min(index, Math.max(0, scheduleDates.length - 4))); }} className={date === item ? "date-tab active" : "date-tab"} role="tab" aria-selected={date === item}><small>{index === 0 ? "Today" : index === 1 ? "Tomorrow" : formatDateLabel(item).split(" ")[0]}</small><strong>{new Date(`${item}T12:00:00`).getDate()}</strong><span>{new Intl.DateTimeFormat("en-GB", { month: "short" }).format(new Date(`${item}T12:00:00`))}</span></button>)}
                    </div>
                  </div>
                  <button className="date-strip-nav date-strip-nav-next" type="button" onClick={() => setDateWindowStart((start) => Math.min(scheduleDates.length - 4, start + 1))} disabled={dateWindowStart >= scheduleDates.length - 4} aria-label="Show later dates"><ChevronRight size={16} /></button>
                </div>
                <div className="filter-strip" aria-label="Filter activities">{filters.map((item) => <button key={item} onClick={() => setFilter(item)} className={filter === item ? "filter-chip active" : "filter-chip"}>{item}</button>)}</div>
                <div className="activity-list">{dailyActivities.length ? dailyActivities.map((activity) => <ActivityRow key={activity.id} activity={activity} locale={locale} onSelect={setSelectedActivity} />) : <div className="empty-schedule"><CalendarDays size={25} /><h3>A quieter day, by design.</h3><p>No activities are listed for this filter. Ask Guest Relations for the latest update.</p><button className="button button-dark" onClick={() => setFilter("All")}>Show all moments</button></div>}</div>
              </div>
              <aside className="day-card">
                <div className="day-card-top"><span className="mini-label">Your day, at a glance</span><span className="day-card-mark"><span className="lotus-glyph lotus-glyph-light" aria-hidden="true"><i /><i /><i /><i /></span></span></div>
                <div className="day-card-date"><strong>{new Date(`${date}T12:00:00`).getDate()}</strong><span>{formatDateLabel(date)}<br /><small>Summer season</small></span></div>
                <div className="day-card-divider" />
                <div className="day-card-stat"><span>Moments listed</span><strong>{dailyActivities.length.toString().padStart(2, "0")}</strong></div>
                <div className="day-card-stat"><span>Saved to your day</span><strong>{savedActivities.length.toString().padStart(2, "0")}</strong></div>
                <div className="day-card-note"><Leaf size={16} /><p>Plans can shift with the weather. We’ll always mark what needs confirming.</p></div>
                <button className="card-link" onClick={() => toast("Guest Relations can help shape your perfect day.", { description: "Dial reception on 0 for a local recommendation." })}>Shape my day <ArrowRight size={15} /></button>
              </aside>
            </div>
          </div>
        </section>

        <section className="section mini-calendar-section" aria-labelledby="mini-calendar-title">
          <div className="container mini-calendar-layout">
            <div className="mini-calendar-intro"><SectionLabel>Plan the next moment</SectionLabel><h2 id="mini-calendar-title">A small view of<br /><em>what’s on.</em></h2><p>Tap a day to move the live schedule above. Every activity count comes from the same shared resort program.</p></div>
            <MiniCalendar selectedDate={date} locale={locale} onSelectDate={(nextDate) => { setDate(nextDate); setFilter("All"); setSelectedDayPopup(nextDate); }} />
          </div>
        </section>

        <section className="section feature-section" id="dining">
          <div className="container">
            <div className="section-heading-row feature-heading"><div><SectionLabel>Follow your appetite</SectionLabel><h2>Made for long, <em>easy</em> days.</h2></div><button className="round-arrow" onClick={() => toast("Dining directory is ready to explore.", { description: "Open the cards below for today’s service details." })} aria-label="Explore dining"><ArrowRight size={19} /></button></div>
            <DiningCarousel />
          </div>
        </section>

        <section className="section activities-section" id="activities">
          <div className="container">
            <div className="section-heading-row feature-heading activities-heading">
              <div>
                <SectionLabel>{activitiesSectionCopy.eyebrow[locale]}</SectionLabel>
                <h2>{activitiesSectionCopy.title[locale]}</h2>
                <p className="activities-description">{activitiesSectionCopy.description[locale]}</p>
              </div>
              <button className="round-arrow" onClick={() => toast("Lotus Activities are ready to explore.", { description: activitiesSectionCopy.description[locale] })} aria-label="Explore Lotus Activities"><ArrowRight size={19} /></button>
            </div>
            <ActivitiesCarousel />
          </div>
        </section>

        <section className="section spa-section" id="spa">
          <div className="container">
            <div className="section-heading-row feature-heading spa-heading">
              <div>
                <SectionLabel>{spaSectionCopy.eyebrow[locale]}</SectionLabel>
                <h2>{spaSectionCopy.title[locale]}</h2>
                <p className="activities-description">{spaSectionCopy.description[locale]}</p>
              </div>
              <button className="round-arrow" onClick={() => toast("Lotus Spa is ready to explore.", { description: spaSectionCopy.description[locale] })} aria-label="Explore Lotus Spa"><ArrowRight size={19} /></button>
            </div>
            <SpaCarousel locale={locale} />
            <div className="spa-service-grid" aria-label="Lotus Spa services">
              {spaSectionCopy.services.map((service) => <article className="spa-service-card" key={service.title.en}>
                <span className="mini-label">Lotus Spa</span>
                <h3>{service.title[locale]}</h3>
                <p>{service.description[locale]}</p>
              </article>)}
            </div>
          </div>
        </section>

        <section className="section restaurant-bar-section" id="restaurant-bar">
          <div className="container">
            <div className="section-heading-row feature-heading restaurant-bar-heading">
              <div>
                <SectionLabel>{restaurantBarSectionCopy.eyebrow[locale]}</SectionLabel>
                <h2>{restaurantBarSectionCopy.title[locale]}</h2>
                <p className="activities-description">{restaurantBarSectionCopy.description[locale]}</p>
              </div>
              <button className="round-arrow" onClick={() => toast(restaurantBarSectionCopy.title[locale], { description: restaurantBarSectionCopy.description[locale] })} aria-label="Explore Restaurant and Bar"><ArrowRight size={19} /></button>
            </div>
            <RestaurantBarCarousel locale={locale} />
            <div className="restaurant-bar-info">
              <div className="restaurant-bar-column">
                <div className="restaurant-bar-column-heading"><SectionLabel>{restaurantBarSectionCopy.restaurantsLabel[locale]}</SectionLabel></div>
                <div className="venue-list">
                  {restaurantBarVenues.restaurants.map((venue) => <article className="venue-card" key={venue.name}>
                    <h3>{venue.name}</h3>
                    <div className="venue-schedule">{venue.labels.map((label, index) => <div className="venue-schedule-row" key={`${venue.name}-${label}`}><span>{restaurantBarSectionCopy[label][locale]}</span><strong>{venue.details[index]}</strong></div>)}</div>
                    {venue.booking && <span className="venue-booking">{restaurantBarSectionCopy.booking[locale]}</span>}
                  </article>)}
                </div>
              </div>
              <div className="restaurant-bar-column bars-column">
                <div className="restaurant-bar-column-heading"><SectionLabel>{restaurantBarSectionCopy.barsLabel[locale]}</SectionLabel></div>
                <div className="bars-list">{restaurantBarVenues.bars.map((bar, index) => <div className="bar-list-item" key={bar}><span>0{index + 1}</span><strong>{bar}</strong></div>)}</div>
              </div>
            </div>
          </div>
        </section>

        <section className="section mini-club-section" id="mini-club">
          <div className="container">
            <div className="section-heading-row feature-heading mini-club-heading">
              <div>
                <SectionLabel>{miniClubSectionCopy.eyebrow[locale]}</SectionLabel>
                <h2>{miniClubSectionCopy.title[locale]}</h2>
                <p className="activities-description">{miniClubSectionCopy.description[locale]}</p>
              </div>
              <button className="round-arrow" onClick={() => scrollTo("kids-schedule")} aria-label="Explore Mini Club schedule"><ArrowRight size={19} /></button>
            </div>
            <MiniClubCarousel locale={locale} />
            <div className="mini-club-overview">
              <article className="mini-club-about">
                <div className="mini-club-meta"><span>{miniClubSectionCopy.age[locale]}</span><span>{miniClubSectionCopy.hours}</span><span>{miniClubSectionCopy.supervisors[locale]}</span></div>
                <SectionLabel>{miniClubSectionCopy.aboutTitle[locale]}</SectionLabel>
                <p>{miniClubSectionCopy.aboutDescription[locale]}</p>
                <div className="mini-club-feature-grid">{miniClubSectionCopy.features.map((feature, index) => <div className="mini-club-feature" key={`${feature.en}-${index}`}><span>0{index + 1}</span><strong>{feature[locale]}</strong></div>)}</div>
              </article>
              <div id="kids-schedule"><KidsActivitySchedule locale={locale} /></div>
            </div>
          </div>
        </section>

        <section className="section directory-section" id="directory">
          <div className="container directory-layout">
            <div className="directory-intro"><SectionLabel>Hotel directory</SectionLabel><h2>Everything you need,<br /><em>close at hand.</em></h2><p>From your room to the shoreline, the essentials are here — clear, current and easy to find.</p><div className="directory-tools"><button className="button button-dark" onClick={() => setSearchOpen(true)}><Search size={16} /> Find in the directory</button><span><Check size={15} /> Designed for your phone</span></div></div>
            <div className="directory-list">
              {searchOpen && <div className="directory-search"><Search size={16} /><input id="directory-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Try “spa”, “pool”, “room”…" autoFocus /><button onClick={() => { setSearchOpen(false); setQuery(""); }} aria-label="Close search"><X size={16} /></button></div>}
              {filteredDirectory.map((item, index) => <button key={item.title} className="directory-item" onClick={() => item.href.startsWith("#") ? scrollTo(item.href.slice(1)) : toast(`${item.title} is ready to explore.`, { description: item.detail })}><span className="directory-index">0{index + 1}</span><span className="directory-item-icon"><Icon name={item.icon} size={19} /></span><span className="directory-item-copy"><strong>{item.title}</strong><small>{item.detail}</small></span><ArrowDownRight size={18} className="directory-arrow" /></button>)}
              {!filteredDirectory.length && <div className="directory-empty">No directory entry matches that search.</div>}
            </div>
          </div>
        </section>

        <section className="section room-section accommodation-section" id="rooms">
          <div className="container">
            <div className="section-heading-row"><div><SectionLabel>{accommodationSectionCopy.eyebrow[locale]}</SectionLabel><h2>{accommodationSectionCopy.title[locale]}</h2><p className="section-lede accommodation-lede">{accommodationSectionCopy.description[locale]}</p></div><button className="text-button" onClick={() => toast(accommodationSectionCopy.roomsLabel[locale], { description: `${roomOptions.length} accommodation options` })}>{accommodationSectionCopy.roomsLabel[locale]} <ArrowRight size={14} /></button></div>
            <AccommodationCarousel locale={locale} />
            <MobileRail className="room-rail" label={accommodationSectionCopy.roomsLabel[locale]}><div className="room-rail-inner">{roomOptions.map((room, index) => { const roomName = room.name[locale]; return <article className={`room-card ${index === 1 ? "room-card-featured" : ""}`} key={room.name.en}><div className="room-image-wrap"><img src={room.image} alt={roomName} /><span className="room-number">{String(index + 1).padStart(2, "0")}</span><button className="save-room" aria-label={`Save ${roomName}`} onClick={(event) => { event.stopPropagation(); toast("Room saved for later", { description: roomName }); }}><Heart size={16} /></button></div><div className="room-card-copy"><span className="mini-label">{room.size} · {room.guests} {accommodationSectionCopy.guests[locale]}</span><h3>{roomName}</h3><div className="room-facts"><span><BedDouble size={13} /> {room.beds[locale]}</span><span><span className="room-fact-icon">m²</span> {room.size}</span><span><CircleUserRound size={13} /> {room.guests}</span><span><span className="room-fact-icon">{room.bath}</span> {accommodationSectionCopy.bath[locale]}</span></div><button onClick={() => setSelectedRoom(room)}>{accommodationSectionCopy.viewDetails[locale]} <ArrowRight size={14} /></button></div></article>; })}</div></MobileRail>
          </div>
        </section>

        <section className="section map-section" id="map">
          <div className="container map-layout"><div className="map-copy"><SectionLabel>Find your way</SectionLabel><h2>Follow the<br /><em>lotus line.</em></h2><p>A simple guide to the spaces that shape your stay. Open a pin for the next place you want to be.</p><div className="map-key"><span><i className="pin-dot pin-tide" />Guest essentials</span><span><i className="pin-dot pin-gold" />Places to linger</span></div><button className="button button-outline" onClick={() => toast("Directions are ready for your next walk.", { description: "Ask Guest Relations for the easiest route." })}><Navigation size={16} /> Get directions</button></div><div className="illustrated-map"><div className="map-skyline"><span>AEGEAN SEA</span></div><div className="map-land"><span className="land-line land-line-one" /><span className="land-line land-line-two" /><span className="land-line land-line-three" /><span className="pool-shape" /><span className="path path-one" /><span className="path path-two" />{mapPins.map((pin) => <button key={pin.label} className={`map-pin ${pin.type === "You are here" ? "current" : ""}`} style={{ left: `${pin.x}%`, top: `${pin.y}%` }} onClick={() => toast(pin.label, { description: pin.type })} aria-label={`${pin.label}, ${pin.type}`}><span className="map-pin-dot"><span /></span><span className="map-pin-label">{pin.label}</span></button>)}</div><div className="map-scale"><span>North</span><span className="compass">N</span><span>50 m</span></div></div></div>
        </section>

        <section className="section dining-section" id="wellness">
          <div className="container dining-layout"><div className="dining-visual"><img src="https://www.orkalotusbeach.com/wp-content/themes/yktheme/assets/img/service4.jpg" alt="Natural materials in the Lotus Spa" /><div className="dining-visual-note"><Sparkles size={16} /><span>Wellness is a way of<br />moving through the day.</span></div></div><div className="dining-copy"><SectionLabel>Dining & wellness</SectionLabel><h2>A little more<br /><em>time for you.</em></h2><p>Choose your pace: a long breakfast, a treatment between swims, or a quiet table when the sky goes pink.</p><div className="service-list">{restaurants.map((restaurant) => <button key={restaurant.name} onClick={() => toast(restaurant.name, { description: `${restaurant.hours} · ${restaurant.note}` })}><span className="service-icon"><Utensils size={17} /></span><span><strong>{restaurant.name}</strong><small>{restaurant.type} · {restaurant.hours}</small></span><ArrowRight size={15} /></button>)}</div><button className="inline-link" onClick={() => scrollTo("wellness")}>Open dining & wellness <ArrowRight size={15} /></button></div></div>
        </section>

        <section className="section team-section" id="services">
          <div className="container"><div className="section-heading-row"><div><SectionLabel>People who can help</SectionLabel><h2>Good to know<br /><em>who’s who.</em></h2></div><button className="text-button" onClick={() => toast("Guest Relations is your easiest first step.", { description: "Dial 0 from your room." })}>Contact the team <ArrowRight size={14} /></button></div><MobileRail className="team-rail" label="guest relations"><div className="team-rail-inner">{staff.map((person) => <button key={person.name} className="person-card" onClick={() => toast(person.name, { description: `${person.title} · ${person.contact}` })}><div className="person-avatar">{person.initials}</div><span className="mini-label">{person.title}</span><h3>{person.name}</h3><p>{person.note}</p><span className="person-contact">{person.contact} <ArrowRight size={14} /></span></button>)}</div></MobileRail></div>
        </section>
        <section className="section destination-section" id="destination"><div className="container"><div className="destination-heading"><div><SectionLabel light>Beyond the beach</SectionLabel><h2>Marmaris is<br /><em>waiting.</em></h2></div><p>Our favourite nearby moments, from an easy shoreline walk to a day shaped by the wind.</p></div><MobileRail className="destination-rail" label="destinations"><div className="destination-rail-inner">{destinations.map((destination) => <button key={destination.name} className="destination-card" onClick={() => toast(destination.name, { description: `${destination.distance} · ${destination.detail}` })}><img src={destination.image} alt="" /><div className="destination-shade" /><div className="destination-card-copy"><span className="mini-label">{destination.category} · {destination.distance}</span><h3>{destination.name}</h3><p>{destination.detail}</p><span className="feature-cta">Open guide <ArrowRight size={15} /></span></div></button>)}</div></MobileRail></div></section>
        <section className="section concierge-section"><div className="container concierge-layout"><div className="concierge-copy"><div className="concierge-symbol"><span className="lotus-glyph lotus-glyph-light" aria-hidden="true"><i /><i /><i /><i /></span></div><SectionLabel light>Your digital host</SectionLabel><h2>Ask for the<br /><em>local answer.</em></h2><p>Need a table, a transfer, a quiet corner or the quickest way to the pier? Start with a question and our concierge knowledge base will point you in the right direction.</p><button className="button button-light" onClick={() => toast("Concierge chat is ready for your integration.", { description: "Connect your AI assistant or hotel team here." })}>Ask our AI concierge <ArrowRight size={16} /></button></div><div className="concierge-panel"><div className="concierge-panel-header"><span><span className="live-pulse live-pulse-light" /> Concierge suggestions</span><Sparkles size={17} /></div><div className="question-list">{conciergeAnswers.map((item, index) => <button key={item.q} className={expandedQuestion === index ? "question-item open" : "question-item"} onClick={() => setExpandedQuestion(expandedQuestion === index ? -1 : index)}><span>{item.q}</span><span className="question-icon">{expandedQuestion === index ? <X size={14} /> : <ArrowDownRight size={15} />}</span>{expandedQuestion === index && <p>{item.a}</p>}</button>)}</div><div className="concierge-input"><span>Ask about your stay…</span><Send size={16} /></div></div></div></section>
      </main>

      <footer className="site-footer"><div className="container footer-top"><div className="footer-brand"><BrandLogo className="footer-brand-logo" /><p>Luxury, nature and the Aegean — in one living rhythm.</p><div className="footer-social"><a href="https://www.instagram.com/orkahotels/" aria-label="Instagram"><Instagram size={17} /></a><a href="mailto:info.orkalotus@orkahotels.com" aria-label="Email"><Send size={17} /></a></div></div><div className="footer-col"><span className="footer-label">Explore</span><button onClick={() => scrollTo("today")}>Today at Lotus</button><button onClick={() => scrollTo("directory")}>Hotel directory</button><button onClick={() => scrollTo("dining")}>Dining & bars</button><button onClick={() => scrollTo("destination")}>Marmaris guide</button></div><div className="footer-col"><span className="footer-label">Contact</span><a href="tel:4446752">444 6 752</a><a href="mailto:info.orkalotus@orkahotels.com">Email guest relations</a><a href="https://maps.google.com/?q=Orka+Lotus+Beach+Marmaris">İçmeler, Marmaris</a></div><div className="footer-col footer-note"><LanguagePicker locale={locale} open={languageOpen} onToggle={() => setLanguageOpen((open) => !open)} onSelect={(nextLocale) => { setLocale(nextLocale); setLanguageOpen(false); }} placement="footer" /><span className="footer-label">A softer way to stay</span><p>Save this guide to your home screen for quick access throughout your stay.</p><button onClick={() => toast("Guide saved", { description: "Add this page to your home screen from your browser menu." })}>Save the guide <ArrowRight size={14} /></button><a href="/assets" className="mt-4 inline-flex text-xs font-semibold uppercase tracking-[0.14em] underline underline-offset-4">Content desk <ArrowRight size={13} /></a></div></div><div className="footer-wave" aria-hidden="true"><svg className="footer-wave-svg footer-wave-back" viewBox="0 0 1440 120" preserveAspectRatio="none"><path d="M0 48C180 112 330 112 520 58C710 4 850 10 1030 62C1205 112 1305 102 1440 48V120H0Z" /></svg><svg className="footer-wave-svg footer-wave-mid" viewBox="0 0 1440 120" preserveAspectRatio="none"><path d="M0 74C175 20 300 22 472 72C653 126 820 126 1000 70C1173 16 1298 14 1440 68V120H0Z" /></svg><svg className="footer-wave-svg footer-wave-front" viewBox="0 0 1440 120" preserveAspectRatio="none"><path d="M0 86C158 44 307 44 470 86C630 128 800 128 973 83C1150 36 1295 36 1440 82V120H0Z" /></svg><span className="footer-wave-flash footer-wave-flash-one" /><span className="footer-wave-flash footer-wave-flash-two" /></div><div className="container footer-bottom"><span>© 2026 ORKA LOTUS BEACH</span><span>Guest experience guide · Version 01</span><span>Made for slower mornings</span></div></footer>

      {lightbox && <FullscreenImageViewer images={lightbox.images} index={lightbox.index} label={lightbox.label} onClose={() => setLightbox(null)} onChange={(index) => setLightbox((current) => current ? { ...current, index } : current)} />}

      {selectedDayPopup && <div className="detail-backdrop" onClick={() => setSelectedDayPopup(null)}><div className="day-activity-modal" onClick={(event) => event.stopPropagation()}><div className="detail-top"><span className="detail-category"><CalendarDays size={15} /> {formatDateLabel(selectedDayPopup)}</span><button className="icon-button" onClick={() => setSelectedDayPopup(null)} aria-label="Close day activities"><X size={18} /></button></div><h2>{getActivitiesForDate(selectedDayPopup).length ? "Activities for your day" : "A quieter day, by design."}</h2><p>Tap any activity for its full details.</p><div className="day-activity-modal-list">{getActivitiesForDate(selectedDayPopup).map((activity) => <ActivityRow key={activity.id} activity={activity} locale={locale} onSelect={(item) => { setSelectedDayPopup(null); setSelectedActivity(item); }} />)}</div>{getActivitiesForDate(selectedDayPopup).length === 0 && <p>No activities are listed for this date. Ask Guest Relations for the latest update.</p>}</div></div>}

      {selectedRoom && <div className="detail-backdrop" onClick={() => setSelectedRoom(null)}><div className="room-detail" onClick={(event) => event.stopPropagation()}><div className="detail-top"><span className="detail-category"><BedDouble size={15} /> {accommodationSectionCopy.roomsLabel[locale]}</span><button className="icon-button" onClick={() => setSelectedRoom(null)} aria-label="Close room details"><X size={18} /></button></div><img className="room-detail-image" src={selectedRoom.image} alt={selectedRoom.name[locale]} /><h2>{selectedRoom.name[locale]}</h2><p>{accommodationSectionCopy.description[locale]}</p><div className="detail-facts"><span><span className="room-fact-icon">m²</span> {selectedRoom.size}</span><span><CircleUserRound size={15} /> {selectedRoom.guests} {accommodationSectionCopy.guests[locale]}</span><span><BedDouble size={15} /> {selectedRoom.beds[locale]}</span><span><span className="room-fact-icon">{selectedRoom.bath}</span> {accommodationSectionCopy.bath[locale]}</span></div><button className="button button-dark" onClick={() => toast(selectedRoom.name[locale], { description: "Connect this action to your booking flow." })}>{accommodationSectionCopy.viewDetails[locale]} <ArrowRight size={14} /></button></div></div>}

      {selectedActivity && <div className="detail-backdrop" onClick={() => setSelectedActivity(null)}><div className="activity-detail" onClick={(event) => event.stopPropagation()}><div className="detail-top"><span className="detail-category"><Icon name={selectedActivity.icon} size={15} /> {selectedActivity.category}</span><button className="icon-button" onClick={() => setSelectedActivity(null)} aria-label="Close activity details"><X size={18} /></button></div><div className="detail-time"><strong>{selectedActivity.start}</strong><span>— {selectedActivity.end}</span></div><h2>{selectedActivity.title[locale] || selectedActivity.title.en}</h2><p>{selectedActivity.description[locale] || selectedActivity.description.en}</p><div className="detail-facts"><span><Navigation size={15} /> {selectedActivity.location}</span><span><ConciergeBell size={15} /> {selectedActivity.staff}</span>{selectedActivity.capacity && <span><CircleUserRound size={15} /> {selectedActivity.capacity}</span>}</div><div className="detail-actions"><button className="button button-dark" onClick={() => toggleSaved(selectedActivity)}>{savedActivities.includes(selectedActivity.id) ? <Check size={16} /> : <CalendarDays size={16} />} {savedActivities.includes(selectedActivity.id) ? "Saved to your day" : "Add to my day"}</button><button className="button button-outline" onClick={() => toast("Directions are ready", { description: selectedActivity.location })}><Navigation size={16} /> Directions</button></div><div className="detail-disclaimer">{selectedActivity.status === "pending" ? "This moment is marked schedule to be confirmed. Guest Relations has the latest update." : "A confirmed moment in today’s guest schedule."}</div></div></div>}
    </div>
  );
}

function ArrowUpRight() {
  return <ArrowDownRight size={15} className="arrow-up-right" />;
}


function AccommodationCarousel({ locale }: { locale: Locale }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const touchStartX = useRef<number | null>(null);
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onPreferenceChange = () => setPrefersReducedMotion(mediaQuery.matches);
    mediaQuery.addEventListener("change", onPreferenceChange);
    return () => mediaQuery.removeEventListener("change", onPreferenceChange);
  }, []);
  useEffect(() => {
    if (isPaused || prefersReducedMotion || accommodationGalleryImages.length < 2) return;
    const timer = window.setInterval(() => setActiveIndex((index) => (index + 1) % accommodationGalleryImages.length), 5200);
    return () => window.clearInterval(timer);
  }, [isPaused, prefersReducedMotion]);
  const move = (direction: number) => setActiveIndex((index) => (index + direction + accommodationGalleryImages.length) % accommodationGalleryImages.length);
  const onTouchStart = (event: React.TouchEvent<HTMLDivElement>) => { touchStartX.current = event.touches[0]?.clientX ?? null; };
  const onTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartX.current === null) return;
    const distance = (event.changedTouches[0]?.clientX ?? touchStartX.current) - touchStartX.current;
    if (Math.abs(distance) > 42) move(distance < 0 ? 1 : -1);
    touchStartX.current = null;
  };
  return (
    <div className="dining-carousel accommodation-gallery" onMouseEnter={() => setIsPaused(true)} onMouseLeave={() => setIsPaused(false)} onFocus={() => setIsPaused(true)} onBlur={() => setIsPaused(false)}>
      <div className="dining-carousel-viewport" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        <div className="dining-carousel-track" style={{ transform: `translate3d(-${activeIndex * 100}%, 0, 0)` }}>
          {accommodationGalleryImages.map((image, index) => <figure className="dining-slide accommodation-slide" data-lightbox-kind="accommodation" data-lightbox-index={index} key={`${image}-${index}`} style={{ backgroundImage: `url("${image}")` }} aria-hidden={index !== activeIndex}>
            <img src={image} alt={`${accommodationSectionCopy.roomsLabel[locale]} ${index + 1}`} loading={index < 2 ? "eager" : "lazy"} draggable="false" />
            <figcaption><span>{String(index + 1).padStart(2, "0")}</span><strong>{accommodationSectionCopy.roomsLabel[locale]}</strong><small>{accommodationSectionCopy.photosLabel[locale]}</small></figcaption>
          </figure>)}
        </div>
        <button className="dining-carousel-control dining-carousel-prev" type="button" onClick={() => move(-1)} aria-label="Previous accommodation image"><ChevronLeft size={20} /></button>
        <button className="dining-carousel-control dining-carousel-next" type="button" onClick={() => move(1)} aria-label="Next accommodation image"><ChevronRight size={20} /></button>
      </div>
      <div className="dining-carousel-toolbar" aria-label="Accommodation image carousel controls"><span className="dining-carousel-count">{String(activeIndex + 1).padStart(2, "0")} / {String(accommodationGalleryImages.length).padStart(2, "0")}</span><div className="dining-carousel-dots">{accommodationGalleryImages.map((image, index) => <button key={`room-dot-${image}-${index}`} type="button" className={`dining-carousel-dot ${index === activeIndex ? "active" : ""}`} onClick={() => setActiveIndex(index)} aria-label={`Show accommodation image ${index + 1}`} aria-current={index === activeIndex ? "true" : undefined} />)}</div><span className="dining-carousel-hint">{prefersReducedMotion ? "Manual view" : isPaused ? "Paused" : "Auto-advancing"}</span></div>
    </div>
  );
}


function MobileRail({ className, label, children }: { className: string; label: string; children: React.ReactNode }) {
  const railRef = useRef<HTMLDivElement>(null);
  const scroll = (direction: number) => railRef.current?.scrollBy({ left: direction * Math.max(220, railRef.current.clientWidth * 0.78), behavior: "smooth" });
  return <div className="mobile-rail-shell"><button className="mobile-rail-button mobile-rail-button-prev" type="button" onClick={() => scroll(-1)} aria-label={`Previous ${label}`}><ChevronLeft size={16} /></button><div ref={railRef} className={className}>{children}</div><button className="mobile-rail-button mobile-rail-button-next" type="button" onClick={() => scroll(1)} aria-label={`Next ${label}`}><ChevronRight size={16} /></button></div>;
}


function FullscreenImageViewer({ images, index, label, onClose, onChange }: { images: string[]; index: number | null; label: string; onClose: () => void; onChange: (index: number) => void }) {
  const touchStartX = useRef<number | null>(null);
  const viewerRef = useRef<HTMLDivElement>(null);
  useEffect(() => { if (index !== null) viewerRef.current?.focus(); }, [index]);
  if (index === null) return null;
  const move = (direction: number) => onChange((index + direction + images.length) % images.length);
  const onTouchStart = (event: React.TouchEvent<HTMLDivElement>) => { touchStartX.current = event.touches[0]?.clientX ?? null; };
  const onTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => { if (touchStartX.current === null) return; const distance = (event.changedTouches[0]?.clientX ?? touchStartX.current) - touchStartX.current; if (Math.abs(distance) > 36) move(distance < 0 ? 1 : -1); touchStartX.current = null; };
  return <div ref={viewerRef} className="fullscreen-viewer" role="dialog" aria-modal="true" aria-label={`${label} fullscreen viewer`} onClick={onClose} onKeyDown={(event) => { if (event.key === "Escape") onClose(); if (event.key === "ArrowLeft") move(-1); if (event.key === "ArrowRight") move(1); }} tabIndex={-1}><button className="fullscreen-viewer-close" type="button" onClick={onClose} aria-label="Close fullscreen image viewer"><X size={19} /></button><button className="fullscreen-viewer-nav fullscreen-viewer-prev" type="button" onClick={(event) => { event.stopPropagation(); move(-1); }} aria-label="Previous fullscreen image"><ChevronLeft size={24} /></button><div className="fullscreen-viewer-stage" onClick={(event) => event.stopPropagation()} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}><img src={images[index]} alt={`${label} ${index + 1}`} draggable="false" /><span className="fullscreen-viewer-count">{String(index + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}</span></div><button className="fullscreen-viewer-nav fullscreen-viewer-next" type="button" onClick={(event) => { event.stopPropagation(); move(1); }} aria-label="Next fullscreen image"><ChevronRight size={24} /></button></div>;
}
