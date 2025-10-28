import React, { useEffect, useMemo, useRef, useState } from "react";
/**
 * Hangout — v4.2 Prototype (React-only)
 * Fixes based on your notes:
 * - Restored the floating **Add** FAB on the map (left side)
 * - Search click reliably opens the modal (SearchSheet)
 * - Bottom sheets now **z-60** + **pb-24** so Save is not hidden by navbar
 * - Profile icons replaced with more relevant ones; badges now visible with icons
 * - Removed dynamic Tailwind color tokens that could break; use inline styles for ACCENT
 */

/* ------------------------------- THEME ------------------------------- */
const ACCENT = "#3EB489";
const ACCENT_TEXT_ON = "#ffffff";

/* ------------------------------- DATA -------------------------------- */
const PLACES_SEED = [
  { id: "p1", name: "Montag Coffee", type: "Kafe", hood: "Kadıköy", x: 640, y: 740, visited: true, wantAgain: true, rating: 5, notes: "Filtre kahve sakin, çalışmaya uygun", photos: ["https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?q=80&w=640&auto=format&fit=crop"], wifi: true, petFriendly: true, seating: ["outdoor", "bar"], vibe: ["rahat"], view: "—", price: "₺₺", openNow: true },
  { id: "p2", name: "Alexandra", type: "Bar", hood: "Karaköy", x: 420, y: 520, visited: true, wantAgain: false, rating: 3, notes: "Manzara güzel ama kalabalık", photos: ["https://images.unsplash.com/photo-1544145945-f90425340c7e?q=80&w=640&auto=format&fit=crop"], wifi: false, petFriendly: false, seating: ["bar"], vibe: ["hareketli"], view: "boğaz", price: "₺₺₺", openNow: true },
  { id: "p3", name: "Foxy Nişantaşı", type: "Restoran", hood: "Nişantaşı", x: 520, y: 360, visited: false, wantAgain: false, rating: 0, notes: "", photos: ["https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=640&auto=format&fit=crop"], wifi: true, petFriendly: false, seating: ["booth"], vibe: ["hareketli"], view: "şehir", price: "₺₺₺", openNow: false, priority: "Yüksek", wishlist: true },
  { id: "p4", name: "Voi", type: "Kafe", hood: "Beşiktaş", x: 560, y: 440, visited: false, wishlist: true, rating: 0, notes: "", photos: ["https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=640&auto=format&fit=crop"], wifi: true, petFriendly: true, seating: ["outdoor"], vibe: ["rahat"], view: "sahil", price: "₺₺", openNow: true, priority: "Orta" },
  { id: "p5", name: "Aida Kadıköy", type: "Restoran", hood: "Kadıköy", x: 700, y: 780, visited: true, wantAgain: true, rating: 4, notes: "Tatlılar başarılı", photos: ["https://images.unsplash.com/photo-1552566626-52f8b828add9?q=80&w=640&auto=format&fit=crop"], wifi: false, petFriendly: false, seating: ["table"], vibe: ["rahat"], view: "—", price: "₺₺₺", openNow: false },
  { id: "p6", name: "Feriye", type: "Restoran", hood: "Beşiktaş", x: 540, y: 420, visited: false, wishlist: true, rating: 0, notes: "", photos: ["https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=640&auto=format&fit=crop"], wifi: true, petFriendly: false, seating: ["table", "outdoor"], vibe: ["manzaralı"], view: "boğaz", price: "₺₺₺₺", openNow: true, priority: "Düşük" },
];

const HOODS = ["Tümü", "Kadıköy", "Beşiktaş", "Karaköy", "Nişantaşı"];
const RECENTS_SEED = ["Kadıköy kahve", "Karaköy bar", "Brunch", "Manzaralı"];

/* ------------------------------ ICONS ------------------------------ */
const Svg = {
  Search: (p) => (<svg viewBox="0 0 24 24" width={18} height={18} {...p}><path fill="currentColor" d="m21 20-5.2-5.2a7.5 7.5 0 1 0-1.1 1.1L20 21zM10.5 17a6.5 6.5 0 1 1 0-13 6.5 6.5 0 0 1 0 13"/></svg>),
  Back: (p) => (<svg viewBox="0 0 24 24" width={20} height={20} {...p}><path fill="currentColor" d="M20 11H7.8l4.6-4.6L11 5 4 12l7 7 1.4-1.4L7.8 13H20z"/></svg>),
  Tune: (p) => (<svg viewBox="0 0 24 24" width={18} height={18} {...p}><path fill="currentColor" d="M3 6h8v2H3V6m10 0h8v2h-8V6m-6 5h8v2H7v-2m10 0h4v2h-4v-2M3 16h4v2H3v-2m8 0h10v2H11v-2"/></svg>),
  Add: (p) => (<svg viewBox="0 0 24 24" width={20} height={20} {...p}><path fill="currentColor" d="M11 11V6h2v5h5v2h-5v5h-2v-5H6v-2h5z"/></svg>),
  Locate: (p) => (<svg viewBox="0 0 24 24" width={20} height={20} {...p}><path fill="currentColor" d="M12 2a1 1 0 0 1 1 1v1.1A8 8 0 0 1 19.9 11H21a1 1 0 1 1 0 2h-1.1A8 8 0 0 1 13 19.9V21a1 1 0 1 1-2 0v-1.1A8 8 0 0 1 4.1 13H3a1 1 0 1 1 0-2h1.1A8 8 0 0 1 11 4.1V3a1 1 0 0 1 1-1Zm0 5a5 5 0 1 0 0 10 5 5 0 0 0 0-10Z"/></svg>),
  Map: (p) => (<svg viewBox="0 0 24 24" width={20} height={20} {...p}><path fill="currentColor" d="M15 4v16l-6-2-6 2V4l6-2 6 2 6-2v16l-6 2V4l-6-2v16"/></svg>),
  List: (p) => (<svg viewBox="0 0 24 24" width={20} height={20} {...p}><path fill="currentColor" d="M3 6h18v2H3V6m0 5h18v2H3v-2m0 5h18v2H3v-2"/></svg>),
  Person: (p) => (<svg viewBox="0 0 24 24" width={20} height={20} {...p}><path fill="currentColor" d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm0 2c-4.4 0-8 2.2-8 5v1h16v-1c0-2.8-3.6-5-8-5Z"/></svg>),
  Star: (p) => (<svg viewBox="0 0 24 24" width={14} height={14} {...p}><path fill="currentColor" d="m12 17.3 5.8 3.5-1.6-6.6 5-4.3-6.7-.6L12 3 9.5 9.3l-6.7.6 5 4.3-1.6 6.6L12 17.3Z"/></svg>),
  Check: (p) => (<svg viewBox="0 0 24 24" width={14} height={14} {...p}><path fill="currentColor" d="m9 16.2-3.5-3.5L4 14.2l5 5 11-11-1.5-1.5L9 16.2Z"/></svg>),
  Gear: (p) => (<svg viewBox="0 0 24 24" width={22} height={22} {...p}><path fill="currentColor" d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8m8.9 4a6.9 6.9 0 0 0-.2-1.6l2-1.5-2-3.5-2.4 1a7 7 0 0 0-2.6-1.5l-.4-2.6H9.7l-.4 2.6a7 7 0 0 0-2.6 1.5l-2.4-1-2 3.5 2 1.5A6.9 6.9 0 0 0 4 12c0 .6.1 1.1.3 1.6l-2 1.5 2 3.5 2.4-1a7 7 0 0 0 2.6 1.5l.4 2.6h4.6l.4-2.6a7 7 0 0 0 2.6-1.5l2.4 1 2-3.5-2-1.5c.2-.5.3-1 .3-1.6Z"/></svg>),
  Trophy: (p) => (<svg viewBox="0 0 24 24" width={18} height={18} {...p}><path fill="currentColor" d="M19 4h-3V3H8v1H5v4a5 5 0 0 0 4 4.9V15H7v2h10v-2h-2v-2.1A5 5 0 0 0 19 8V4Zm-2 4a3 3 0 0 1-6 0V5h6v3ZM5 6H4a2 2 0 0 0 2 2V6Z"/></svg>),
  Flame: (p) => (<svg viewBox="0 0 24 24" width={18} height={18} {...p}><path fill="currentColor" d="M13.5 2.5s.5 2.5-1.5 4.5S8 9.5 8 12a4 4 0 0 0 8 0c0-2-1-3.5-2.5-4.5S13.5 2.5 13.5 2.5ZM6 12a6 6 0 1 0 12 0c0-2.6-1.6-4.5-3.1-5.6.1 1.4-.5 2.6-1.5 3.6-1.3 1.3-3.4 2.3-3.4 4 0 1.6 1.3 3 3 3s3-1.4 3-3a1 1 0 1 1 2 0 5 5 0 0 1-10 0Z"/></svg>),
  Medal: (p) => (<svg viewBox="0 0 24 24" width={18} height={18} {...p}><path fill="currentColor" d="M7 2h10l-2 5h-6L7 2Zm3 7h4a5 5 0 1 1-4 0Zm2 12-3.1 1.6.6-3.4-2.5-2.4 3.4-.5 1.5-3 1.5 3 3.4.5-2.5 2.4.6 3.4L12 21Z"/></svg>),
  Pin: (p) => (<svg viewBox="0 0 24 24" width={18} height={18} {...p}><path fill="currentColor" d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7Zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5Z"/></svg>),
  Bookmark: (p) => (<svg viewBox="0 0 24 24" width={18} height={18} {...p}><path fill="currentColor" d="M6 2h12v20l-6-4-6 4V2Z"/></svg>),
  Coffee: (p) => (<svg viewBox="0 0 24 24" width={18} height={18} {...p}><path fill="currentColor" d="M3 4h13v8a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5V4Zm13 2h2a3 3 0 0 1 0 6h-2V6Z"/></svg>),
  Beer: (p) => (<svg viewBox="0 0 24 24" width={18} height={18} {...p}><path fill="currentColor" d="M5 6h9v12a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3V6Zm9 0h4a2 2 0 0 1 0 4h-2"/></svg>),
  Utensils: (p) => (<svg viewBox="0 0 24 24" width={18} height={18} {...p}><path fill="currentColor" d="M8 2v9H6V2H4v9H2V2H1v9a3 3 0 0 0 3 3h1v8h2v-8h1a3 3 0 0 0 3-3V2H8Zm9 0h-2v8h-2v3h2v9h2V13h2V10h-2V2Z"/></svg>),
};

/* ------------------------------ HELPERS ------------------------------ */
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const pinShadow = (ring = "rgba(0,0,0,.06)") => ({ boxShadow: `0 0 0 10px ${ring}, 0 8px 18px rgba(0,0,0,.25)` });

function Img({ src, alt = "", className }) {
  const [ok, setOk] = useState(true);
  return ok ? (
    <img src={src} alt={alt} className={className} onError={() => setOk(false)} />
  ) : (
    <div className={`${className} grid place-items-center bg-neutral-100 text-neutral-400`}>IMG</div>
  );
}

/* ------------------------------ MAP MOCK ----------------------------- */
function MapMock({ items, selectedId, onPick, centerOn, onZoomChanged, onRecenter, zoom, setZoom }) {
  const wrapRef = useRef(null);
  const [offset, setOffset] = useState({ x: -220, y: -220 });
  const [drag, setDrag] = useState(null); // {x,y,start}
  const [pulseId, setPulseId] = useState(null);

  // Drag to pan
  useEffect(() => {
    const wrap = wrapRef.current; if (!wrap) return;
    const down = (e) => { const pt = e.touches ? e.touches[0] : e; setDrag({ x: pt.clientX, y: pt.clientY, start: { ...offset } }); };
    const move = (e) => { if (!drag) return; const pt = e.touches ? e.touches[0] : e; const dx = pt.clientX - drag.x; const dy = pt.clientY - drag.y; setOffset({ x: clamp(drag.start.x + dx, -900, 50), y: clamp(drag.start.y + dy, -900, 50) }); };
    const up = () => setDrag(null);
    wrap.addEventListener('mousedown', down); wrap.addEventListener('touchstart', down);
    window.addEventListener('mousemove', move); window.addEventListener('touchmove', move, { passive: false });
    window.addEventListener('mouseup', up); window.addEventListener('touchend', up);
    return () => { wrap.removeEventListener('mousedown', down); wrap.removeEventListener('touchstart', down); window.removeEventListener('mousemove', move); window.removeEventListener('touchmove', move); window.removeEventListener('mouseup', up); window.removeEventListener('touchend', up); };
  }, [drag, offset]);

  // Animate center + zoom when centerOn changes
  useEffect(() => {
    if (!centerOn || !wrapRef.current) return;
    const wrap = wrapRef.current.getBoundingClientRect();
    const targetX = wrap.width / 2 - centerOn.x * zoom;
    const targetY = wrap.height / 2 - centerOn.y * zoom;
    const x = clamp(targetX, -900, 50); 
    const y = clamp(targetY, -900, 50);
    setOffset({ x, y });
    
    // Only set zoom if it's at the default level, otherwise keep current zoom
    if (zoom === 1) {
      const newZoom = clamp(1.5, 0.6, 2);
      setZoom(newZoom); 
      onZoomChanged?.(newZoom);
    }
    
    setPulseId(centerOn.id || null);
    const t = setTimeout(() => setPulseId(null), 900);
    return () => clearTimeout(t);
  }, [centerOn, zoom, onZoomChanged, setZoom]);

  return (
    <div ref={wrapRef} className="absolute inset-0 z-10 overflow-hidden bg-[linear-gradient(180deg,#fafafa,#f4f4f5)] select-none touch-none">
      <div
        className="absolute h-[1000px] w-[1000px] rounded-[24px] border border-neutral-200 bg-[radial-gradient(circle_at_30%_30%,#f0fdf4,transparent_30%),radial-gradient(circle_at_70%_60%,#eef2ff,transparent_30%)] shadow-inner"
        style={{ transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`, transformOrigin: "0 0", transition: drag ? "none" : "transform .35s cubic-bezier(.2,.8,.2,1)" }}
      >
        {/* fake water & roads */}
        <div className="absolute left-10 top-10 h-[260px] w-[420px] rounded-3xl bg-[#e6f7ff]" />
        <div className="absolute left-1/2 top-1/4 h-2 w-[420px] -translate-x-1/2 rounded bg-neutral-200" />
        <div className="absolute left-[120px] top-[520px] h-2 w-[520px] rounded bg-neutral-200 rotate-[15deg]" />

        {/* pins */}
        {items.map((p) => {
          const ring = p.visited ? "rgba(62,180,137,.22)" : p.notAgain ? "rgba(239,68,68,.18)" : "rgba(17,24,39,.18)";
          return (
            <button
              key={p.id}
              onClick={() => onPick?.(p)}
              className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2`}
              style={{ left: p.x, top: p.y, width: 24, height: 24, ...(pinShadow(ring)), background: p.notAgain ? "#fff" : p.visited ? ACCENT : "#111", borderColor: p.notAgain ? "#ef4444" : p.visited ? "#0c6247" : "#111", transform: `translate(-50%,-50%) ${selectedId===p.id || pulseId===p.id ? "scale(1.25)" : "scale(1)"}`, transition: "transform .25s" }}
              title={p.name}
            />
          );
        })}
      </div>
      {/* Enhanced Map Controls - Vertical Column */}
      <div className="absolute bottom-4 right-3 z-30 flex flex-col gap-3">
        {/* Zoom Controls */}
        <button 
          className="h-12 w-12 rounded-2xl border border-gray-200 bg-white/95 backdrop-blur-sm text-gray-700 shadow-lg hover:bg-white hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed" 
          onClick={() => {
            const newZoom = Math.max(0.6, zoom - 0.2);
            setZoom(newZoom);
            onZoomChanged?.(newZoom);
          }}
          title="Zoom Out"
          disabled={zoom <= 0.6}
        >
          <span className="text-xl font-bold">−</span>
        </button>
        
        <button 
          className="h-12 w-12 rounded-2xl border border-gray-200 bg-white/95 backdrop-blur-sm text-gray-700 shadow-lg hover:bg-white hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed" 
          onClick={() => {
            const newZoom = Math.min(2, zoom + 0.2);
            setZoom(newZoom);
            onZoomChanged?.(newZoom);
          }}
          title="Zoom In"
          disabled={zoom >= 2}
        >
          <span className="text-xl font-bold">+</span>
        </button>
        
        {/* Compass Button */}
        <button 
          className="h-12 w-12 rounded-2xl border border-gray-200 bg-white/95 backdrop-blur-sm text-gray-700 shadow-lg hover:bg-white hover:shadow-xl transition-all duration-200" 
          title="Reset Orientation"
          onClick={() => {
            setOffset({ x: -220, y: -220 });
            setZoom(1);
            onZoomChanged?.(1);
          }}
        >
          <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        </button>
        
        {/* Location Button */}
        <button 
          className="h-12 w-12 rounded-2xl border border-gray-200 bg-white/95 backdrop-blur-sm text-gray-700 shadow-lg hover:bg-white hover:shadow-xl transition-all duration-200" 
          title="Konumum" 
          onClick={() => onRecenter?.()}
        >
          <Svg.Locate />
        </button>
      </div>
      
      {/* Zoom Level Indicator */}
      <div className="absolute bottom-4 left-3 z-30 px-3 py-2 rounded-2xl bg-white/95 backdrop-blur-sm border border-gray-200 text-sm font-semibold text-gray-700 shadow-lg">
        {Math.round(zoom * 100)}%
      </div>
    </div>
  );
}

/* --------------------------- SMALL PARTS ---------------------------- */
function PrimaryButton({ className = "", children, ...rest }) {
  return (
    <button className={`rounded-lg px-3 py-2 text-[13px] font-medium text-white shadow ${className}`} style={{ background: ACCENT, color: ACCENT_TEXT_ON }} {...rest}>{children}</button>
  );
}

function Chip({ active, children, onClick }) {
  return (
    <button onClick={onClick} className={`rounded-full px-3 py-1.5 text-sm border transition ${active ? "text-white" : "text-neutral-900"}`} style={{ background: active ? ACCENT : "white", borderColor: active ? ACCENT : "#e5e5e5" }}>{children}</button>
  );
}

function Badge({ children }) { return (<span className="rounded bg-neutral-100 px-2 py-[2px] text-[11px] text-neutral-800">{children}</span>); }
function Stars({ n = 0 }) { return (<span className="inline-flex items-center gap-1 text-[11px] text-amber-600">{Array.from({ length: n }).map((_, i) => (<Svg.Star key={i} />))}{n === 0 && <span className="text-neutral-400">—</span>}</span>); }

/* ------------------------------ SEARCH SHEET --------------------------- */
function SearchSheet({ open, onClose, query, setQuery, recents, onPick, places }) {
  const q = (query || "").trim().toLowerCase();
  const results = useMemo(() => {
    if (!q) return places;
    return places.filter((p) => p.name.toLowerCase().includes(q) || p.type.toLowerCase().includes(q) || p.hood.toLowerCase().includes(q));
  }, [q, places]);
  const top = useMemo(() => places.filter((p) => p.visited && (p.wantAgain || p.rating >= 4)).slice(0, 12), [places]);
  if (!open) return null;
  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/20 z-[9998]" onClick={onClose} />
      <div className="absolute inset-x-0 bottom-0 z-[9999] h-[70%] rounded-t-2xl border bg-white p-4 shadow-[0_-10px_30px_rgba(0,0,0,0.12)] pb-24">
      <div className="mx-auto h-1.5 w-12 rounded-full bg-slate-200 mb-3" />
      <div className="text-lg font-semibold">Ara</div>
      <div className="mt-2 flex items-center gap-2 rounded-lg border px-3 py-2">
        <Svg.Search className="text-slate-500" />
        <input className="flex-1 outline-none text-sm" placeholder="Yer veya semt ara…" value={query} onChange={(e) => setQuery(e.target.value)} />
        <button className="text-slate-500 text-sm" onClick={() => setQuery("")}>Temizle</button>
      </div>
      {!q && (
        <>
          <div className="mt-3 text-[10px] uppercase tracking-wider text-slate-500">Son Aramalar</div>
          <div className="mt-1 flex gap-2 overflow-x-auto pb-1">
            {recents.map((r) => (<button key={r} className="rounded-full border bg-white px-3 py-1 text-sm" onClick={() => setQuery(r)}>{r}</button>))}
          </div>
          <div className="mt-2 text-[10px] uppercase tracking-wider text-slate-500">Top Lokasyonlar</div>
          <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
            {top.map((p) => (<TopCard key={p.id} p={p} onPick={() => onPick(p)} />))}
          </div>
        </>
      )}
      <div className="mt-2 text-[10px] uppercase tracking-wider text-slate-500">Sonuçlar</div>
      <div className="mt-2 h-[45%] overflow-y-auto pr-2 space-y-2">
        {results.map((p) => (<ResultRow key={p.id} p={p} onPick={() => onPick(p)} />))}
        {results.length === 0 && (<div className="py-8 text-center text-slate-500">Sonuç yok — <button className="underline" onClick={() => alert("Yer ekle — prototip")}>Yer ekleyin</button></div>)}
      </div>
      <div className="mt-auto pt-4 flex justify-end"><button className="rounded-lg border bg-white px-4 py-2" onClick={onClose}>Kapat</button></div>
      </div>
    </>
  );
}

function TopCard({ p, onPick }) {
  return (
    <button onClick={onPick} className="min-w-[180px] rounded-xl border bg-white shadow-sm overflow-hidden text-left">
      <Img src={p.photos?.[0]} className="h-24 w-full object-cover" />
      <div className="p-2">
        <div className="truncate text-sm font-semibold">{p.name}</div>
        <div className="truncate text-xs text-neutral-500">{p.type} • {p.hood}</div>
        <div className="mt-1 flex items-center gap-1">
          <Stars n={p.rating || 0} />
          {p.visited && <Badge>Ziyaret</Badge>}
          {p.wishlist && <Badge>Listemde</Badge>}
        </div>
      </div>
    </button>
  );
}

function ResultRow({ p, onPick }) {
  return (
    <div onClick={onPick} className="flex items-center gap-3 rounded-lg border p-2 cursor-pointer hover:bg-slate-50">
      <Img src={p.photos?.[0]} className="h-12 w-12 rounded object-cover border" />
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-semibold">{p.name}</div>
        <div className="truncate text-xs text-slate-500">{p.type} • {p.hood}</div>
        <div className="mt-1 flex flex-wrap gap-1 text-[10px]">
          <Stars n={p.rating || 0} />
          {p.visited && <Badge>Ziyaret</Badge>}
          {p.wantAgain && <Badge>Tekrar</Badge>}
          {p.notAgain && <Badge>Yok</Badge>}
          {p.wifi && <Badge>wifi</Badge>}
          {p.petFriendly && <Badge>evcil</Badge>}
        </div>
      </div>
      <PrimaryButton className="px-2 py-1 text-xs">Seç</PrimaryButton>
    </div>
  );
}

/* ------------------------------ PAGES ------------------------------- */
function MapPage({ places, hood, setHood, onOpenSearch, onOpenAdd, onPickPlace, selected, centerOn, recents }) {
  const filtered = useMemo(() => places.filter((p) => hood === "Tümü" || p.hood === hood), [places, hood]);
  const [zoom, setZoom] = useState(1);
  const recenter = () => alert("Konum — prototip");
  
  return (
    <div className="absolute inset-0">
      {/* Floating search bar over map */}
      <div className="absolute top-3 left-3 right-3 z-40 flex items-center gap-3 rounded-2xl border border-gray-200 bg-white/95 backdrop-blur-sm px-4 py-3 shadow-lg">
        <button className="flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-gray-900 transition-colors" onClick={() => onOpenSearch()}>
          <Svg.Search className="text-gray-500" /> 
          <span>Ara</span>
        </button>
        <div className="ml-auto text-lg font-bold text-gray-900">Hangout</div>
      </div>

      {/* Recent Searches */}
      <div className="absolute top-[72px] left-3 right-3 z-30">
        <div className="flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none]">
          {recents.slice(0, 4).map((r) => (
            <button 
              key={r} 
              className="rounded-full border border-gray-200 bg-white/90 backdrop-blur-sm px-4 py-2 text-sm font-medium text-gray-700 hover:bg-white hover:shadow-md transition-all duration-200 whitespace-nowrap"
              onClick={() => onOpenSearch()}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Hood chips with extra spacing from top */}
      <div className="absolute top-[120px] left-0 right-0 z-20 flex gap-2 overflow-x-auto px-3 pb-2 [scrollbar-width:none]">
        {HOODS.map((h) => (<Chip key={h} active={h === hood} onClick={() => setHood(h)}>{h}</Chip>))}
      </div>

      {/* Map */}
      <MapMock 
        items={filtered} 
        selectedId={selected?.id} 
        onPick={onPickPlace} 
        centerOn={centerOn} 
        onZoomChanged={setZoom} 
        onRecenter={recenter}
        zoom={zoom}
        setZoom={setZoom}
      />

      {/* Floating Add FAB (left) */}
      <button
        className="absolute bottom-20 left-3 z-40 h-12 w-12 rounded-full shadow grid place-items-center border"
        style={{ background: ACCENT, color: ACCENT_TEXT_ON, borderColor: ACCENT }}
        onClick={() => onOpenAdd()}
        aria-label="Yer ekle"
      >
        <Svg.Add />
      </button>

      {/* Floating card */}
      {selected && (
        <div className="absolute bottom-28 left-3 right-3 z-30">
          <div className="bg-white border rounded-2xl shadow-lg p-4 flex gap-3">
            <Img src={selected.photos?.[0]} className="h-16 w-16 rounded-xl border object-cover" />
            <div className="flex-1 min-w-0">
              <div className="text-[15px] font-semibold truncate">{selected.name}</div>
              <div className="text-[12px] text-slate-500 truncate">{selected.type} • {selected.hood}</div>
              <div className="mt-1 flex items-center gap-2 text-[11px]">
                <Stars n={selected.rating || 0} />
                {selected.visited && <Badge>Ziyaret</Badge>}
                {selected.wantAgain && <Badge style={{ color: ACCENT }}>Tekrar giderim</Badge>}
                {selected.wishlist && <Badge>Listemde{selected.priority ? ` • ${selected.priority}` : ""}</Badge>}
                <Badge>{selected.price || "—"}</Badge>
              </div>
              <div className="mt-2 flex gap-2">
                <button className="rounded-lg border px-3 py-1.5 text-[13px]" onClick={() => onPickPlace(null)}>Kapat</button>
                <PrimaryButton className="px-3 py-1.5" onClick={onOpenAdd}>Düzenle / Ekle</PrimaryButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ListsPage({ places, onBack, onOpenFilters }) {
  return (
    <div className="absolute inset-0 bg-white">
      <div className="sticky top-0 z-20 flex items-center gap-2 border-b bg-white p-3">
        <button className="rounded-lg border h-9 w-9 grid place-items-center" onClick={onBack}><Svg.Back /></button>
        <div className="text-lg font-semibold">Listelerim</div>
        <PrimaryButton className="ml-auto px-3 py-1.5 flex items-center gap-1" onClick={onOpenFilters}><Svg.Tune /> Filtreler</PrimaryButton>
      </div>
      <div className="grid grid-cols-2 gap-3 p-3">
        {places.map((p) => (<ListCard key={p.id} p={p} />))}
      </div>
    </div>
  );
}

function ListCard({ p }) {
  const [open, setOpen] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer" onClick={() => setOpen((v) => !v)}>
      <div className="h-32 w-full bg-gray-100 relative">
        <Img src={p.photos?.[0]} className="h-32 w-full object-cover" />
        {/* Quick Actions Overlay */}
        <div className="absolute top-2 right-2 flex gap-1">
          <button 
            className="h-8 w-8 rounded-full bg-white/90 backdrop-blur-sm border border-gray-200 grid place-items-center hover:bg-white transition-all duration-200"
            onClick={(e) => { e.stopPropagation(); setIsFavorite(!isFavorite); }}
            title={isFavorite ? "Favorilerden çıkar" : "Favorilere ekle"}
          >
            <svg className={`w-4 h-4 transition-all duration-200 ${isFavorite ? 'text-red-500 fill-red-500' : 'text-black fill-white stroke-black'}`} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
          <button 
            className="h-8 w-8 rounded-full bg-white/90 backdrop-blur-sm border border-gray-200 grid place-items-center hover:bg-white transition-colors"
            onClick={(e) => { e.stopPropagation(); alert("Paylaş"); }}
            title="Paylaş"
          >
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
            </svg>
          </button>
        </div>
        {/* Status Badge */}
        <div className="absolute bottom-2 left-2 h-6 px-3 rounded-full text-xs font-semibold grid place-items-center shadow-sm" 
             style={{ 
               background: p.visited ? "rgba(62,180,137,.12)" : p.wishlist ? "rgba(139,92,246,.12)" : "rgba(156,163,175,.12)", 
               color: p.visited ? ACCENT : p.wishlist ? "#8B5CF6" : "#6B7280" 
             }}>
          {p.visited ? "Ziyaret" : p.wishlist ? "Listemde" : "—"}
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <div className="text-base font-bold text-gray-900 truncate mb-1">{p.name}</div>
            <div className="text-sm text-gray-600 truncate">{p.type} • {p.hood}</div>
          </div>
          <button 
            className="h-8 w-8 rounded-lg border border-gray-200 grid place-items-center hover:bg-gray-50 transition-colors flex-shrink-0"
            onClick={(e) => { e.stopPropagation(); alert("Düzenle"); }}
            title="Düzenle"
          >
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
        </div>
        
        {open && (
          <div className="space-y-3 text-sm text-gray-700 border-t border-gray-100 pt-3">
            {/* Status and Rating Row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Stars n={p.rating || 0} />
                <span className="text-gray-600">
                  {p.wantAgain ? "Tekrar giderim" : p.visited ? "—" : p.priority ? `Öncelik: ${p.priority}` : "—"}
                </span>
              </div>
              <Badge>{p.price || "—"}</Badge>
            </div>
            
            {/* Notes */}
            {p.notes && <div className="text-gray-600">Not: {p.notes}</div>}
            
            {/* Features Row */}
            <div className="flex flex-wrap gap-2">
              {p.wifi && <Badge>wifi</Badge>}
              {p.petFriendly && <Badge>evcil</Badge>}
              {p.seating?.map((s) => <Badge key={s}>{s}</Badge>)}
              {p.vibe?.map((v) => <Badge key={v}>{v}</Badge>)}
              {p.view && <Badge>{p.view}</Badge>}
            </div>
            
            {/* Action Buttons Row */}
            <div className="flex gap-2 pt-2">
              <button className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm hover:bg-gray-50 transition-colors" onClick={(e) => { e.stopPropagation(); onPickPlace(null); }}>
                Kapat
              </button>
              <button className="flex-1 rounded-lg px-3 py-2 text-sm font-medium text-white shadow transition-colors" style={{ background: ACCENT }} onClick={(e) => { e.stopPropagation(); alert("Düzenle / Ekle"); }}>
                Düzenle / Ekle
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ProfilePage() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  return (
    <div className="absolute inset-0 bg-white">
      {/* Profile Cover Image with Floating Settings Button */}
      <div className="relative h-40 bg-gradient-to-br from-blue-500 to-purple-600">
        <img 
          src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=1000&auto=format&fit=crop" 
          alt="Profile Cover" 
          className="w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        
        {/* Floating Settings Button */}
        <button 
          className="absolute top-4 right-4 h-10 w-10 grid place-items-center rounded-2xl border border-white/20 bg-white/90 backdrop-blur-sm hover:bg-white transition-all duration-200 shadow-lg" 
          onClick={() => setSettingsOpen((v)=>!v)} 
          aria-label="Ayarlar"
        >
          <Svg.Gear />
        </button>
      </div>

      {/* Enhanced Settings Panel */}
      {settingsOpen && (
        <div className="mx-4 mt-4 rounded-2xl border border-gray-200 p-4 bg-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="text-base font-semibold text-gray-900">Ayarlar</div>
            <button 
              className="text-sm text-gray-500 hover:text-gray-700"
              onClick={() => setSettingsOpen(false)}
            >
              Kapat
            </button>
          </div>
          <div className="space-y-3">
            <Toggle label="Bildirimler" />
            <button className="w-full rounded-xl border border-gray-200 px-4 py-3 text-left hover:bg-gray-50 transition-colors text-sm font-medium">
              Şifre Değiştir
            </button>
            <button className="w-full rounded-xl border border-gray-200 px-4 py-3 text-left hover:bg-gray-50 transition-colors text-sm font-medium">
              Hesabı Sil
            </button>
          </div>
        </div>
      )}

      <div className="px-4 -mt-20 relative z-10">
        {/* Enhanced Profile Section */}
        <div className="flex items-end gap-4 mb-6">
          <div className="relative">
            <div className="h-20 w-20 grid place-items-center rounded-2xl border-4 text-2xl font-bold text-white shadow-lg" style={{ background: ACCENT, borderColor: "white" }}>
              EA
            </div>
            <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-green-500 border-2 border-white" />
          </div>
          <div className="flex-1 pb-2">
            <div className="flex items-center gap-2 mb-2">
              <div className="text-2xl font-bold text-white">Emre</div>
              <button className="h-7 w-7 grid place-items-center rounded-lg border border-white/30 bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
            </div>
            {/* Location moved under name */}
            <div className="flex items-center gap-2 text-sm text-white/90">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>İstanbul • Katıldı 2025</span>
            </div>
          </div>
        </div>

        {/* Enhanced Stats with Progress */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Stat n={12} t="Ziyaret" icon={<Svg.Pin />} bgColor="#EFF6FF" iconColor="#3B82F6" progress={80} />
          <Stat n={8} t="Listede" icon={<Svg.Bookmark />} bgColor="#F3E8FF" iconColor="#8B5CF6" progress={65} />
          <Stat n={5} t="Rozet" icon={<Svg.Medal />} bgColor="#FEF3C7" iconColor="#F59E0B" progress={50} />
        </div>

        {/* Enhanced Achievement Cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card title="Streak" subtitle="7 gün" icon={<Svg.Flame />} bgColor="#FEF3C7" iconColor="#F59E0B" />
          <Card title="Seviye" subtitle="3 (Kaşif)" icon={<Svg.Trophy />} bgColor="#DBEAFE" iconColor="#2563EB" />
        </div>

        {/* Redesigned Badges Grid - Made Smaller */}
        <div className="rounded-2xl border border-gray-200 p-4 bg-white shadow-sm mb-6">
          <div className="text-base font-semibold text-gray-900 mb-4">Rozetler</div>
          <div className="grid grid-cols-2 gap-3">
            {[
              {t:"Semt Kaşifi",icon:<Svg.Pin/>,color:"#3B82F6",bgColor:"#EFF6FF",progress:75},
              {t:"Kahve Gurmesi",icon:<Svg.Coffee/>,color:"#8B5CF6",bgColor:"#F3E8FF",progress:90},
              {t:"Gece Kuşu",icon:<Svg.Beer/>,color:"#F59E0B",bgColor:"#FEF3C7",progress:60},
              {t:"Gurme",icon:<Svg.Utensils/>,color:"#EF4444",bgColor:"#FEF2F2",progress:45}
            ].map((b) => (
              <div key={b.t} className="rounded-xl border border-gray-200 p-3 text-center bg-white hover:shadow-md transition-all duration-200 hover:-translate-y-1">
                <div className="mx-auto grid h-12 w-12 place-items-center rounded-full mb-2" style={{ background: b.bgColor, color: b.color }}>
                  {b.icon}
                </div>
                <div className="text-xs font-semibold text-gray-900 mb-2">{b.t}</div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div className="h-1.5 rounded-full transition-all duration-300" style={{ width: `${b.progress}%`, background: b.color }} />
                </div>
                <div className="text-[10px] text-gray-500 mt-1">{b.progress}%</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Card({ title, subtitle, icon, bgColor, iconColor }) {
  return (
    <div className="rounded-xl border border-gray-200 p-4 flex items-center gap-4 hover:shadow-md transition-all duration-200 hover:-translate-y-1 bg-white shadow-sm">
      <div className="h-12 w-12 grid place-items-center rounded-xl border border-gray-100" style={{ background: bgColor || "#FEF3C7", color: iconColor || "#F59E0B" }}>{icon}</div>
      <div className="flex-1">
        <div className="text-base font-semibold text-gray-900">{title}</div>
        <div className="text-sm text-gray-600">{subtitle}</div>
      </div>
    </div>
  );
}

function Stat({ n, t, icon, bgColor, iconColor, progress }) {
  return (
    <div className="rounded-xl border border-gray-200 p-4 text-center hover:shadow-md transition-all duration-200 hover:-translate-y-1 bg-white shadow-sm">
      <div className="mx-auto mb-2 h-10 w-10 grid place-items-center rounded-xl border border-gray-100" style={{ background: bgColor || "#EFF6FF", color: iconColor || "#3B82F6" }}>{icon}</div>
      <div className="text-2xl font-bold text-gray-900 mb-1">{n}</div>
      <div className="text-sm text-gray-600 mb-2">{t}</div>
      {progress && (
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div className="h-1.5 rounded-full transition-all duration-300" style={{ width: `${progress}%`, background: iconColor || "#3B82F6" }} />
        </div>
      )}
    </div>
  );
}

function Toggle({ label }) {
  const [on, setOn] = useState(true);
  return (
    <button className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 ${on ? "bg-neutral-50" : "bg-white"}`} onClick={() => setOn((v) => !v)}>
      <span className="text-sm">{label}</span>
      <span className="inline-block h-5 w-9 rounded-full" style={{ background: on ? ACCENT : '#d1d5db' }} />
    </button>
  );
}

/* ------------------------------ SHEETS ------------------------------ */
function Segmented({ options, value, onChange }) {
  return (
    <div className="inline-flex rounded-lg border overflow-hidden text-sm">
      {options.map((opt) => (
        <button key={opt} onClick={() => onChange(opt)} className={`px-3 py-1.5 ${opt===value?"text-white" : "text-neutral-800"}`} style={{ background: opt===value?ACCENT:"white" }}>{opt || "Tümü"}</button>
      ))}
    </div>
  );
}

function RadioRow({ name, value, onChange, items }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((it) => (
        <label key={it.value} className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm`} style={{ borderColor: value===it.value? ACCENT : '#e5e5e5' }}>
          <input type="radio" name={name} checked={value===it.value} onChange={() => onChange(it.value)} />
          {it.label}
        </label>
      ))}
    </div>
  );
}

function AddPlaceSheet({ open, onClose }) {
  const [type, setType] = useState("Kafe");
  const [visited, setVisited] = useState("Ziyaret edilmedi");
  const [again, setAgain] = useState("Kararsız");
  const [price, setPrice] = useState("₺₺");
  if (!open) return null;
  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/20 z-[9998]" onClick={onClose} />
      <div className="absolute inset-x-0 bottom-0 z-[9999] h-[75%] rounded-t-2xl border bg-white p-4 shadow-[0_-10px_30px_rgba(0,0,0,0.12)] overflow-y-auto pb-24">
      <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-slate-200" />
      <div className="text-lg font-semibold">Yer Ekle</div>
      <div className="mt-3 grid gap-3 text-sm">
        <input className="rounded-lg border px-3 py-2" placeholder="Mekan adı" />
        <input className="rounded-lg border px-3 py-2" placeholder="Semt" />
        <div>
          <div className="mb-1 text-xs text-neutral-500">Tür</div>
          <Segmented options={["Kafe","Bar","Restoran","Diğer"]} value={type} onChange={setType} />
        </div>
        <div>
          <div className="mb-1 text-xs text-neutral-500">Ziyaret</div>
          <RadioRow name="visited" value={visited} onChange={setVisited} items={[{label:"Ziyaret edildi", value:"Ziyaret"},{label:"Ziyaret edilmedi", value:"Ziyaret edilmedi"}]} />
        </div>
        <div>
          <div className="mb-1 text-xs text-neutral-500">Tekrar gider misin?</div>
          <RadioRow name="again" value={again} onChange={setAgain} items={[{label:"Evet", value:"Evet"},{label:"Hayır", value:"Hayır"},{label:"Kararsız", value:"Kararsız"}]} />
        </div>
        <div>
          <div className="mb-1 text-xs text-neutral-500">Fiyat</div>
          <Segmented options={["₺","₺₺","₺₺₺","₺₺₺₺"]} value={price} onChange={setPrice} />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <label className="flex items-center gap-2 rounded-lg border px-3 py-2"><input type="checkbox"/> Wi‑Fi</label>
          <label className="flex items-center gap-2 rounded-lg border px-3 py-2"><input type="checkbox"/> Evcil</label>
          <label className="flex items-center gap-2 rounded-lg border px-3 py-2"><input type="checkbox"/> Açık oturma</label>
          <label className="flex items-center gap-2 rounded-lg border px-3 py-2"><input type="checkbox"/> Bar oturma</label>
        </div>
        <input type="number" min={1} max={5} className="rounded-lg border px-3 py-2" placeholder="Puan (1-5)" />
        <textarea className="rounded-lg border px-3 py-2" rows={2} placeholder="Kısa yorum" />
        <input type="url" className="rounded-lg border px-3 py-2" placeholder="Fotoğraf URL (opsiyonel)" />
      </div>
      <div className="mt-auto pt-4 flex justify-end gap-2">
        <button className="rounded-lg border px-4 py-2" onClick={onClose}>Vazgeç</button>
        <PrimaryButton className="px-4 py-2" onClick={onClose}>Kaydet</PrimaryButton>
      </div>
      </div>
    </>
  );
}

function FiltersSheet({ open, onClose, value, onChange }) {
  const [local, setLocal] = useState(value);
  useEffect(() => setLocal(value), [value]);
  if (!open) return null;
  const toggle = (k) => setLocal((s) => ({ ...s, [k]: !s[k] }));
  const set = (k, v) => setLocal((s) => ({ ...s, [k]: v }));
  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/20 z-[9998]" onClick={onClose} />
      <div className="absolute inset-x-0 bottom-0 z-[9999] h-[70%] rounded-t-2xl border bg-white p-4 shadow-[0_-10px_30px_rgba(0,0,0,0.12)] overflow-y-auto pb-24">
      <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-slate-200" />
      <div className="text-lg font-semibold">Filtreler</div>
      <div className="mt-3 grid gap-3 text-sm">
        <div className="grid grid-cols-2 gap-2">
          <ToggleRow label="Wi‑Fi" on={local.wifi} onToggle={() => toggle("wifi")} />
          <ToggleRow label="Evcil dostu" on={local.petFriendly} onToggle={() => toggle("petFriendly")} />
          <ToggleRow label="Açık oturma" on={local.outdoor} onToggle={() => toggle("outdoor")} />
          <ToggleRow label="Bar oturma" on={local.barSeating} onToggle={() => toggle("barSeating")} />
          <ToggleRow label="Açık şimdi" on={local.openNow} onToggle={() => toggle("openNow")} />
          <ToggleRow label="Daha önce ziyaret" on={local.visited} onToggle={() => toggle("visited")} />
          <ToggleRow label="Tekrar giderim" on={local.wantAgain} onToggle={() => toggle("wantAgain")} />
          <ToggleRow label="Listemde" on={local.wishlist} onToggle={() => toggle("wishlist")} />
        </div>
        <div>
          <div className="text-xs text-neutral-500 mb-1">Fiyat</div>
          <Segmented options={["","₺","₺₺","₺₺₺","₺₺₺₺"]} value={local.price} onChange={(v)=>set("price", v)} />
        </div>
        <div>
          <div className="text-xs text-neutral-500 mb-1">Vibe</div>
          <div className="flex flex-wrap gap-2">
            {["rahat", "hareketli", "manzaralı"].map((v) => (
              <button key={v} className={`rounded-full border px-3 py-1 ${local.vibe?.includes(v) ? "text-white" : "text-neutral-900"}`} style={{ background: local.vibe?.includes(v) ? ACCENT : "white", borderColor: local.vibe?.includes(v) ? ACCENT : "#e5e5e5" }} onClick={() => set("vibe", local.vibe?.includes(v) ? local.vibe.filter((x) => x !== v) : [...(local.vibe || []), v])}>{v}</button>
            ))}
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-auto pt-4">
          <button className="rounded-lg border px-4 py-2" onClick={onClose}>Kapat</button>
          <PrimaryButton className="px-4 py-2" onClick={() => { onChange(local); onClose(); }}>Uygula</PrimaryButton>
        </div>
      </div>
      </div>
    </>
  );
}

function ToggleRow({ label, on, onToggle }) {
  return (
    <button className="flex items-center justify-between rounded-xl border border-gray-200 px-4 py-3 hover:bg-gray-50 transition-all duration-200" onClick={onToggle}>
      <span className="text-sm font-medium text-gray-900">{label}</span>
      <div className="relative">
        <div className={`h-6 w-11 rounded-full transition-all duration-300 ${on ? 'bg-green-500' : 'bg-gray-300'}`}>
          <div className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-all duration-300 ${on ? 'translate-x-5' : 'translate-x-0'}`} />
        </div>
      </div>
    </button>
  );
}

/* --------------------------------- APP -------------------------------- */
export default function App() {
  const [tab, setTab] = useState("map");
  const [hood, setHood] = useState("Tümü");
  const [places] = useState(PLACES_SEED);
  const [recents, setRecents] = useState(RECENTS_SEED);

  const [selected, setSelected] = useState(null);
  const [centerOn, setCenterOn] = useState(null);

  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");

  const [addOpen, setAddOpen] = useState(false);

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState({ wifi:false, petFriendly:false, outdoor:false, barSeating:false, openNow:false, visited:false, wantAgain:false, wishlist:false, price:"", vibe:[] });

  // Apply filters for Lists page
  const filteredForList = useMemo(() => {
    return places.filter((p) => {
      if (filters.wifi && !p.wifi) return false;
      if (filters.petFriendly && !p.petFriendly) return false;
      if (filters.outdoor && !p.seating?.includes("outdoor")) return false;
      if (filters.barSeating && !p.seating?.includes("bar")) return false;
      if (filters.openNow && !p.openNow) return false;
      if (filters.visited && !p.visited) return false;
      if (filters.wantAgain && !p.wantAgain) return false;
      if (filters.wishlist && !p.wishlist) return false;
      if (filters.price && p.price !== filters.price) return false;
      if (filters.vibe?.length && !filters.vibe.some((v) => p.vibe?.includes(v))) return false;
      return true;
    });
  }, [places, filters]);

  const handlePickPlace = (p) => { if (!p) { setSelected(null); return; } setSelected(p); setCenterOn({ x: p.x, y: p.y, id: p.id }); };

  const fromSearchPick = (p) => { setSearchOpen(false); setSelected(p); setCenterOn({ x: p.x, y: p.y, id: p.id }); setQuery(""); setRecents((r) => [p.name, ...r.filter((x) => x !== p.name)].slice(0, 6)); if (tab !== "map") setTab("map"); };

  return (
    <div className="min-h-screen grid place-items-center bg-white">
      <div className="relative h-[852px] w-[393px] overflow-hidden rounded-[28px] border border-neutral-200 bg-white shadow-xl">
        {/* Pages with Transitions */}
        <div className="absolute inset-0">
          {tab === "map" && (
            <div className="absolute inset-0 transition-all duration-300 ease-in-out">
              <MapPage places={places} hood={hood} setHood={setHood} onOpenSearch={() => setSearchOpen(true)} onOpenAdd={() => setAddOpen(true)} onPickPlace={handlePickPlace} selected={selected} centerOn={centerOn} recents={recents} />
            </div>
          )}
          {tab === "lists" && (
            <div className="absolute inset-0 transition-all duration-300 ease-in-out">
              <ListsPage places={filteredForList} onBack={() => setTab("map")} onOpenFilters={() => setFiltersOpen(true)} />
            </div>
          )}
          {tab === "profile" && (
            <div className="absolute inset-0 transition-all duration-300 ease-in-out">
              <ProfilePage />
            </div>
          )}
        </div>

        {/* Enhanced Modals with Better Animations */}
        {searchOpen && <SearchSheet open={searchOpen} onClose={() => setSearchOpen(false)} query={query} setQuery={setQuery} recents={recents} places={places} onPick={fromSearchPick} />}
        {addOpen && <AddPlaceSheet open={addOpen} onClose={() => setAddOpen(false)} />}
        {filtersOpen && <FiltersSheet open={filtersOpen} onClose={() => setFiltersOpen(false)} value={filters} onChange={setFilters} />}

        {/* Bottom Nav with Enhanced Styling */}
        <div className="absolute bottom-0 left-0 right-0 z-50 flex justify-around border-t border-gray-200 bg-white/95 backdrop-blur-sm h-16 items-center">
          <button 
            className={`flex flex-col items-center transition-all duration-200 ${tab === "map" ? "text-gray-900" : "text-gray-400"}`} 
            onClick={() => setTab("map")}
          >
            <Svg.Map className={`transition-transform duration-200 ${tab === "map" ? "scale-110" : ""}`} />
            <div className={`text-[11px] mt-1 font-medium transition-colors duration-200 ${tab === "map" ? "text-gray-900" : "text-gray-400"}`}>Harita</div>
          </button>
          <button 
            className={`flex flex-col items-center transition-all duration-200 ${tab === "lists" ? "text-gray-900" : "text-gray-400"}`} 
            onClick={() => setTab("lists")}
          >
            <Svg.List className={`transition-transform duration-200 ${tab === "lists" ? "scale-110" : ""}`} />
            <div className={`text-[11px] mt-1 font-medium transition-colors duration-200 ${tab === "lists" ? "text-gray-900" : "text-gray-400"}`}>Listeler</div>
          </button>
          <button 
            className={`flex flex-col items-center transition-all duration-200 ${tab === "profile" ? "text-gray-900" : "text-gray-400"}`} 
            onClick={() => setTab("profile")}
          >
            <Svg.Person className={`transition-transform duration-200 ${tab === "profile" ? "scale-110" : ""}`} />
            <div className={`text-[11px] mt-1 font-medium transition-colors duration-200 ${tab === "profile" ? "text-gray-900" : "text-gray-400"}`}>Profil</div>
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------ "Tests" (smoke) ------------------------------ */
if (typeof window !== 'undefined') {
  console.assert(typeof SearchSheet === 'function', 'SearchSheet should be defined');
  console.assert(typeof MapMock === 'function', 'MapMock should be defined');
  console.assert(typeof MapPage === 'function', 'MapPage should be defined');
}
