"use client";

import { useState, useEffect } from "react";
import AddSpotScreen from "@/components/screens/AddSpotScreen";
import { API_URL } from "@/lib/api";

const toSlug = (str: string) => str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

export default function AppContainer({ slug }: { slug?: string[] }) {
  const [cities, setCities] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [spots, setSpots] = useState<any[]>([]);

  const [activeCity, setActiveCity] = useState<any>(null);
  const [activeCategory, setActiveCategory] = useState<any>(null);
  const [activeSpot, setActiveSpot] = useState<any>(null);

  const [screen, setScreen] = useState<"wiki" | "add">("wiki");
  const [loadingSpots, setLoadingSpots] = useState(false);
  const [loadingSidebar, setLoadingSidebar] = useState(true);
  const [citySearch, setCitySearch] = useState("");
  const [showWelcome, setShowWelcome] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [initialSpotLoaded, setInitialSpotLoaded] = useState(false);

  // Local interaction state
  const [localVotes, setLocalVotes] = useState<Record<string, number>>({});
  const [votedSpotIds, setVotedSpotIds] = useState<Set<string>>(new Set());
  const [voteLoading, setVoteLoading] = useState<Record<string, boolean>>({});
  const [localReviews, setLocalReviews] = useState<Record<string, any[]>>({});

  const [newReview, setNewReview] = useState("");
  const [reviewEmail, setReviewEmail] = useState("anonymous@example.com");
  const [handle, setHandle] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState("");

  // Edit spot state
  const [editOpen, setEditOpen] = useState(false);
  const [editFields, setEditFields] = useState<Record<string, string>>({});
  const [editEmail, setEditEmail] = useState("anonymous@example.com");
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");
  const [editSuccess, setEditSuccess] = useState(false);

  useEffect(() => {
    setLoadingSidebar(true);
    Promise.all([
      fetch(`${API_URL}/api/cities`).then(res => {
        if (!res.ok) throw new Error("Failed to fetch cities");
        return res.json();
      }),
      fetch(`${API_URL}/api/categories`).then(res => {
        if (!res.ok) throw new Error("Failed to fetch categories");
        return res.json();
      })
    ])
      .then(([citiesData, categoriesData]) => {
        setCities(citiesData);
        
        // Override category name for display
        const mappedCategories = categoriesData.map((c: any) => {
          if (c.name.includes("Co-working") || c.name === "Co Working") {
            return { ...c, name: "Co Working Space" };
          }
          return c;
        });
        setCategories(mappedCategories);

        let initialCity = null;
        let initialCategory = null;

        if (slug && slug[0]) {
          initialCity = citiesData.find((c: any) => toSlug(c.name) === slug[0]);
        }
        if (slug && slug[1]) {
          initialCategory = mappedCategories.find((c: any) => toSlug(c.name) === slug[1]);
        }

        if (initialCity) {
          setActiveCity(initialCity);
          setShowWelcome(false);
        }
        if (initialCategory) {
          setActiveCategory(initialCategory);
        } else if (mappedCategories.length > 0 && (!slug || !slug[1])) {
          setActiveCategory(mappedCategories[0]);
        }
      })
      .catch(err => {
        console.error("Failed to fetch initial sidebar data:", err);
      })
      .finally(() => {
        setLoadingSidebar(false);
      });
  }, []);

  useEffect(() => {
    if (activeCity && activeCategory) {
      setLoadingSpots(true);
      fetch(`${API_URL}/api/spots?cityId=${activeCity.id}&categoryId=${activeCategory.id}`)
        .then(res => res.json())
        .then(data => {
          setSpots(data);
          let initialSpot = null;
          if (slug && slug[2] && !initialSpotLoaded) {
            initialSpot = data.find((s: any) => toSlug(s.name) === slug[2]);
            setInitialSpotLoaded(true);
          }
          if (initialSpot) {
            setActiveSpot(initialSpot);
          } else if (activeSpot) {
            const found = data.find((s: any) => s.id === activeSpot.id);
            setActiveSpot(found || null);
          } else {
            setActiveSpot(null);
          }
          setLoadingSpots(false);
        })
        .catch(err => {
          console.error("Failed to fetch spots:", err);
          setLoadingSpots(false);
        });
    }
  }, [activeCity, activeCategory, slug, initialSpotLoaded]);

  useEffect(() => {
    if (loadingSidebar) return;
    let path = '/';
    if (showWelcome) {
      path = '/';
    } else if (activeCity) {
      path = `/${toSlug(activeCity.name)}`;
      if (activeCategory) {
        path += `/${toSlug(activeCategory.name)}`;
        if (activeSpot) {
          path += `/${toSlug(activeSpot.name)}`;
        }
      }
    }
    window.history.pushState(null, '', path);
  }, [activeCity, activeCategory, activeSpot, showWelcome, loadingSidebar]);

  const handleUpvote = async (spotId: string, currentVotes: number) => {
    if (voteLoading[spotId] || votedSpotIds.has(spotId)) return;
    setVoteLoading(prev => ({ ...prev, [spotId]: true }));
    try {
      const res = await fetch(`${API_URL}/api/spots/${spotId}/upvote`, { method: 'POST' });
      if (res.ok) {
        setLocalVotes(prev => ({ ...prev, [spotId]: (prev[spotId] ?? currentVotes) + 1 }));
        setVotedSpotIds(prev => { const n = new Set(prev); n.add(spotId); return n; });
      }
    } catch (err) {
      console.error('Upvote failed:', err);
    } finally {
      setVoteLoading(prev => ({ ...prev, [spotId]: false }));
    }
  };

  const handleDownvote = async (spotId: string, currentVotes: number) => {
    if (voteLoading[spotId] || !votedSpotIds.has(spotId)) return;
    setVoteLoading(prev => ({ ...prev, [spotId]: true }));
    try {
      const res = await fetch(`${API_URL}/api/spots/${spotId}/downvote`, { method: 'POST' });
      if (res.ok) {
        setLocalVotes(prev => ({ ...prev, [spotId]: Math.max(0, (prev[spotId] ?? currentVotes) - 1) }));
        setVotedSpotIds(prev => { const n = new Set(prev); n.delete(spotId); return n; });
      }
    } catch (err) {
      console.error('Downvote failed:', err);
    } finally {
      setVoteLoading(prev => ({ ...prev, [spotId]: false }));
    }
  };

  const handlePostReview = async (spotId: string) => {
    if (!newReview.trim()) { setReviewError('Review text is required.'); return; }
    // Email is commented out
    // if (!reviewEmail.trim()) { setReviewError('Email is required.'); return; }
    setReviewError('');
    setReviewLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: newReview.trim(),
          spotId,
          submitterEmail: reviewEmail.trim(),
          submitterHandle: handle.trim()
            ? (handle.startsWith('@') ? handle.trim() : `@${handle.trim()}`)
            : "anonymous",
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setReviewError(err?.message || 'Failed to submit review.');
        return;
      }

      const saved = await res.json();
      setLocalReviews(prev => ({
        ...prev,
        [spotId]: [saved, ...(prev[spotId] || [])],
      }));
      setNewReview('');
      setReviewEmail('');
      setHandle('');
    } catch (err) {
      console.error('Review failed:', err);
      setReviewError('Network error. Please try again.');
    } finally {
      setReviewLoading(false);
    }
  };

  const handleEditSubmit = async () => {
    // Email is commented out
    // if (!editEmail.trim()) { setEditError('Your email is required to edit.'); return; }
    setEditError('');
    setEditLoading(true);
    setEditSuccess(false);
    try {
      const payload: Record<string, string> = { submitterEmail: editEmail.trim() };
      Object.entries(editFields).forEach(([k, v]) => {
        if (v.trim()) payload[k] = v.trim();
      });
      const res = await fetch(`${API_URL}/api/spots/${activeSpot.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setEditError(err?.message || 'Update failed. Check your email matches the original submitter.');
        return;
      }
      const updated = await res.json();
      setActiveSpot(updated);
      setSpots(prev => prev.map(s => s.id === updated.id ? updated : s));
      setEditSuccess(true);
      setEditOpen(false);
      setEditFields({});
      setEditEmail('');
    } catch (err) {
      console.error('Edit failed:', err);
      setEditError('Network error. Please try again.');
    } finally {
      setEditLoading(false);
    }
  };

  if (screen === "add") {
    return <AddSpotScreen onBack={() => setScreen("wiki")} />;
  }

  return (
    <div className="w-full h-screen flex bg-black text-white font-sans overflow-hidden">

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Pane 1: Cities (Folders) */}
      <div className={`fixed inset-y-0 left-0 w-[280px] z-50 transform transition-transform duration-300 md:relative md:translate-x-0 md:flex md:w-[240px] shrink-0 bg-[#111] border-r border-[#333] flex-col ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-4 pl-5 pb-2 flex items-center justify-between mt-2">
          <span className="text-[11px] font-semibold tracking-widest text-[#888] uppercase">BackdoorCity</span>
          <button className="md:hidden text-[#888] text-[18px]" onClick={() => setMobileMenuOpen(false)}>✕</button>
        </div>
        {/* City search */}
        <div className="px-3 pb-2">
          <div className="relative">
            <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#555]" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
            <input
              id="city-search"
              value={citySearch}
              onChange={e => setCitySearch(e.target.value)}
              placeholder="search city..."
              className="w-full bg-black border border-[#2a2a2a] rounded py-1 pl-7 pr-3 text-[12px] text-white outline-none focus:border-[#555] transition-colors placeholder-[#555]"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-3 space-y-0.5 mt-1">
          {loadingSidebar ? (
            <div className="space-y-3 px-3 py-2">
              {/* Premium Waking Up Disclaimer */}
              <div className="text-[11px] text-[#888] leading-relaxed bg-[#1a1a1a] rounded-md p-3 border border-[#2a2a2a] mb-4 animate-pulse">
                <div className="flex items-center gap-2 text-amber-500/90 mb-1 font-semibold">
                  <svg className="w-3 h-3 animate-spin shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Waking up database...</span>
                </div>
                The backend on Render is waking up from its free-tier sleep. It will load in just a second!
              </div>
              {/* Pulse skeletons */}
              {Array.from({ length: 12 }).map((_, idx) => {
                const widths = ["w-1/2", "w-2/3", "w-3/4", "w-3/5", "w-5/6", "w-4/5"];
                const widthClass = widths[idx % widths.length];
                return (
                  <div key={idx} className="flex items-center gap-3 py-1.5 animate-pulse">
                    <div className="w-4 h-4 rounded bg-neutral-800" />
                    <div className={`h-3.5 bg-neutral-800 rounded ${widthClass}`} />
                    <div className="ml-auto w-5 h-3 bg-neutral-800/40 rounded-sm" />
                  </div>
                );
              })}
            </div>
          ) : (
            <>
              {cities
                .filter(city => city.name.toLowerCase().includes(citySearch.toLowerCase()))
                .sort((a, b) => (b._count?.spots ?? 0) - (a._count?.spots ?? 0))
                .map(city => {
                  const isActive = activeCity?.id === city.id;
                  return (
                    <div
                      key={city.id}
                      onClick={() => { setActiveCity(city); setShowWelcome(false); setActiveSpot(null); setMobileMenuOpen(false); }}
                      className={`flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-colors ${isActive ? 'bg-[#222] text-white' : 'hover:bg-[#1a1a1a] text-[#888]'
                        }`}
                    >
                      <div className="text-[14px] opacity-90">{city.icon || '❖'}</div>
                      <div className="text-[14px] font-medium flex-1">{city.name.toLowerCase()}</div>
                      {city._count?.spots > 0 && (
                        <div className="text-[10px] text-[#555]">{city._count.spots}</div>
                      )}
                    </div>
                  )
                })
              }
              {citySearch && cities.filter(c => c.name.toLowerCase().includes(citySearch.toLowerCase())).length === 0 && (
                <div className="px-3 py-2 text-[12px] text-[#555] italic">no cities found</div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Pane 2: Categories (Notes List) — hidden during welcome */}
      {!showWelcome && (
        <div className="hidden md:flex w-[300px] shrink-0 bg-[#0a0a0a] border-r border-[#333] flex-col z-20">
          <div className="p-4 pl-5 border-b border-[#333] sticky top-0">
            <div className="text-[16px] font-medium text-white tracking-tight mb-4 flex items-center justify-between">
              {activeCity?.name ?? ''}
              <button onClick={() => setScreen("add")} className="text-[#888] hover:text-white transition-colors">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14" /></svg>
              </button>
            </div>
            <div className="relative">
              <svg className="absolute left-3 top-2 text-[#666]" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
              <input placeholder="Search pages..." className="w-full bg-black border border-[#333] rounded py-1 pl-9 pr-3 text-[13px] text-white outline-none focus:border-[#555] transition-colors" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {categories.map(cat => {
              const isActive = activeCategory?.id === cat.id;
              return (
                <div
                  key={cat.id}
                  onClick={() => setActiveCategory(cat)}
                  className={`flex items-start gap-3 p-4 border-b border-[#222] cursor-pointer transition-colors ${isActive ? 'bg-[#1a1a1a]' : 'hover:bg-[#111]'
                    }`}
                >
                  <div className="text-[16px] mt-0.5 grayscale">{cat.icon}</div>
                  <div className="flex-1">
                    <div className={`text-[14px] font-medium mb-0.5 ${isActive ? 'text-white' : 'text-[#aaa]'}`}>{cat.name}</div>
                    <div className="text-[12px] text-[#666] line-clamp-1">{cat.name} spots in {activeCity?.name}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Pane 3: Content Area (Welcome / Spot List / Detail) */}
      <div className="flex flex-1 relative bg-black flex-col z-10 overflow-hidden w-full">

        {/* Mobile Header (Always visible on small screens) */}
        <div className="md:hidden flex flex-col border-b border-[#333] bg-[#0a0a0a] sticky top-0 z-20">
          <div className="flex items-center p-3 justify-between">
            {/* Left Box */}
            <div className="flex-1 flex justify-start min-w-0">
              {activeSpot ? (
                <button onClick={() => setActiveSpot(null)} className="text-[#888] flex items-center gap-1 text-[14px]">
                  ← Back
                </button>
              ) : !activeCity ? (
                <button onClick={() => setMobileMenuOpen(true)} className="text-[#888] flex items-center gap-2 text-[14px] truncate">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0"><path d="M3 12h18M3 6h18M3 18h18" /></svg>
                  <span className="truncate">Select City</span>
                </button>
              ) : (
                <button onClick={() => setMobileMenuOpen(true)} className="text-[#888] flex items-center gap-2 text-[14px] truncate">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0"><path d="M3 12h18M3 6h18M3 18h18" /></svg>
                  <span className="truncate">Cities</span>
                </button>
              )}
            </div>

            {/* Center Box */}
            <div className="text-[15px] font-medium text-white text-center truncate shrink-0 px-2 max-w-[50%]">
              {activeSpot ? activeSpot.name : activeCity ? activeCity.name : "BackdoorCity"}
            </div>

            {/* Right Box */}
            <div className="flex-1 flex justify-end min-w-0">
              {activeCity && !activeSpot && (
                <button onClick={() => setScreen("add")} className="text-[#888] hover:text-white transition-colors">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14" /></svg>
                </button>
              )}
            </div>
          </div>
        </div>
        <div className="relative z-10 flex-1 overflow-y-auto px-6 md:px-16 py-8 md:py-20">
          <div className="max-w-[720px] mx-auto">
            {showWelcome && !activeCity ? (
              <div className="animate-in fade-in duration-500">
                {/* Hero */}
                <div className="mb-14">
                  <div className="text-[11px] font-semibold tracking-[0.25em] text-[#555] uppercase mb-4">backdoorcity</div>
                  <h1 className="text-[48px] font-bold text-white tracking-tight leading-[1.1] mb-5">
                    India's underground<br />city guide.
                  </h1>
                  <p className="text-[16px] text-[#666] leading-relaxed max-w-[480px]">
                    A community-built wiki of the best spots across Indian cities — cafés, street food, hidden gems, viewpoints, and more. No ads. No sponsored posts. Just real recommendations.
                  </p>

                  <div className="mt-8 flex flex-wrap gap-3">
                    {/* Twitter/X Share */}
                    <button
                      onClick={() => {
                        const text = "Discover India's underground city guide. Skip the tourist traps and find real recommendations curated by locals. 🇮🇳✨";
                        const url = window.location.origin;
                        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
                      }}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-[#333] text-[14px] font-medium text-white hover:border-white/50 hover:bg-white/10 transition-colors w-fit"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                      X
                    </button>

                    {/* WhatsApp Share */}
                    <button
                      onClick={() => {
                        const text = "Check out BackdoorCity - India's underground city guide:";
                        const url = window.location.origin;
                        window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
                      }}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-[#333] text-[14px] font-medium text-green-400 hover:border-green-400/50 hover:bg-green-400/10 transition-colors w-fit"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.489-1.761-1.663-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>
                      WhatsApp
                    </button>

                    {/* Generic / IG Share */}
                    <button
                      onClick={() => {
                        if (navigator.share) {
                          navigator.share({
                            title: "BackdoorCity",
                            text: "Check out BackdoorCity - India's underground city guide.",
                            url: window.location.origin,
                          }).catch(console.error);
                        } else {
                          navigator.clipboard.writeText(window.location.origin);
                          alert("Link copied to clipboard!");
                        }
                      }}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-[#333] text-[14px] font-medium text-pink-400 hover:border-pink-400/50 hover:bg-pink-400/10 transition-colors w-fit"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg>
                      Share / Story
                    </button>
                  </div>
                </div>

                {/* How to navigate */}
                <div className="mb-12 border-t border-[#222] pt-10">
                  <div className="text-[11px] font-semibold tracking-[0.2em] text-[#555] uppercase mb-6">How it works</div>
                  <div className="space-y-5">
                    {[
                      { step: '01', label: 'Pick a city', desc: 'Choose a city from the left sidebar. Cities with the most spots are at the top.' },
                      { step: '02', label: 'Browse categories', desc: 'Select a category — Food, Cafés, Hidden Gems, Nightlife, and more.' },
                      { step: '03', label: 'Open a spot', desc: 'Click any spot to read the full description, location, price range, and community reviews.' },
                    ].map(({ step, label, desc }) => (
                      <div key={step} className="flex gap-5 items-start">
                        <div className="text-[12px] font-mono text-[#444] w-6 shrink-0 mt-0.5">{step}</div>
                        <div>
                          <div className="text-[15px] font-semibold text-white mb-1">{label}</div>
                          <div className="text-[13px] text-[#666] leading-relaxed">{desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* What you can do */}
                <div className="mb-12 border-t border-[#222] pt-10">
                  <div className="text-[11px] font-semibold tracking-[0.2em] text-[#555] uppercase mb-6">What you can do</div>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { icon: '＋', label: 'Add a spot', desc: 'Know a great place? Hit the + button on any city and submit it. Your email stays private.' },
                      { icon: '▲', label: 'Upvote', desc: 'Vouch for a spot you love. High-vote spots rise to the top of their category.' },
                      { icon: '▼', label: 'Remove vote', desc: 'Changed your mind? You can undo your upvote anytime.' },
                      { icon: '✎', label: 'Leave a review', desc: 'Add a personal note or tip to any spot. Use your @handle or stay anonymous.' },
                    ].map(({ icon, label, desc }) => (
                      <div key={label} className="bg-[#0a0a0a] border border-[#222] rounded-md p-5 hover:border-[#333] transition-colors">
                        <div className="text-[18px] mb-3 text-[#555]">{icon}</div>
                        <div className="text-[14px] font-semibold text-white mb-1.5">{label}</div>
                        <div className="text-[12px] text-[#666] leading-relaxed">{desc}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CTA */}
                <div className="border-t border-[#222] pt-8 flex items-center gap-4">
                  <div className="text-[13px] text-[#555]">← Pick a city from the sidebar to get started</div>
                </div>
              </div>
            ) : !activeSpot ? (
              <div className="animate-in fade-in duration-300">
                {/* Mobile Categories (Scrollable with content) */}
                <div className="md:hidden flex flex-wrap gap-2 mb-8">
                  {categories.map(cat => {
                    const isActive = activeCategory?.id === cat.id;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setActiveCategory(cat)}
                        className={`whitespace-nowrap px-3 py-1.5 rounded-full text-[13px] transition-colors border flex items-center gap-1.5 ${isActive ? 'bg-white text-black border-white font-medium' : 'bg-[#111] text-[#888] border-[#333]'
                          }`}
                      >
                        <span className={isActive ? '' : 'grayscale'}>{cat.icon}</span> {cat.name}
                      </button>
                    )
                  })}
                </div>

                <div className="mb-12 border-b border-[#333] pb-8">
                  <div className="text-[40px] font-bold text-white tracking-tight mb-2 flex items-center gap-3">
                    <span className="grayscale">{activeCategory?.icon}</span>
                    {activeCategory?.name}
                  </div>
                  <div className="text-[15px] text-[#888] font-medium">A curated guide for {activeCity?.name}</div>
                </div>

                {loadingSpots ? (
                  <div className="text-[#666] text-[14px]">Loading pages...</div>
                ) : (
                  <div className="space-y-2">
                    {spots.map((spot, i) => (
                      <div
                        key={spot.id}
                        onClick={() => setActiveSpot(spot)}
                        className="group flex items-center justify-between py-4 px-3 -mx-3 rounded-md hover:bg-[#111] cursor-pointer transition-colors border border-transparent hover:border-[#333]"
                      >
                        <div className="flex items-center gap-4">
                          <div className="text-[14px] text-[#555] font-mono">{i + 1}</div>
                          <div className="flex flex-col">
                            <span className="text-[15px] font-medium text-white group-hover:underline underline-offset-4 decoration-[#555]">{spot.name}</span>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[13px] text-[#888]">{spot.area}</span>
                              {spot.submitterHandle && (
                                <span className="text-[11px] text-[#555]">· {spot.submitterHandle.startsWith('@') ? spot.submitterHandle : `@${spot.submitterHandle}`}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-[13px] text-[#555] opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                          Open ↗
                        </div>
                      </div>
                    ))}
                    {spots.length === 0 && (
                      <div className="text-[#666] text-[14px]">No pages found for this category.</div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              // Spot Detail View Inline
              <div className="animate-in fade-in duration-300">
                {/* Breadcrumb + Edit toggle */}
                <div className="mb-8 text-[13px] font-medium text-[#666] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="cursor-pointer hover:text-white transition-colors" onClick={() => { setActiveSpot(null); setEditOpen(false); setEditSuccess(false); }}>
                      {activeCategory?.name}
                    </span>
                    <span>/</span>
                    <span className="text-white">{activeSpot.name}</span>
                  </div>
                  <button
                    onClick={() => {
                      if (!editOpen) {
                        setEditFields({
                          name: activeSpot.name || '',
                          area: activeSpot.area || '',
                          description: activeSpot.description || activeSpot.desc || '',
                          time: activeSpot.time || '',
                          price: activeSpot.price || '',
                          locationUrl: activeSpot.locationUrl || '',
                        });
                        setEditEmail('');
                        setEditError('');
                        setEditSuccess(false);
                      }
                      setEditOpen(o => !o);
                    }}
                    className={`text-[13px] font-medium px-3 py-1 rounded border transition-colors ${editOpen
                      ? 'bg-white text-black border-white'
                      : 'bg-transparent text-[#888] border-[#333] hover:text-white hover:border-[#666]'
                      }`}
                  >
                    {editOpen ? 'Cancel' : 'Edit'}
                  </button>
                </div>

                {/* Inline Edit Form */}
                {editOpen && (
                  <div className="mb-10 bg-[#0a0a0a] border border-[#333] rounded-md p-6">
                    <div className="text-[12px] font-semibold text-[#666] uppercase tracking-[0.2em] mb-5">Edit Spot</div>
                    <div className="space-y-4">
                      {([
                        { key: 'name', label: 'Name', placeholder: 'Spot name' },
                        { key: 'area', label: 'Area', placeholder: 'Neighbourhood / area' },
                        { key: 'description', label: 'Description', placeholder: 'What makes it worth going?', multi: true },
                        { key: 'time', label: 'Best time', placeholder: 'e.g. 11am – 8pm' },
                        { key: 'price', label: 'Spend', placeholder: 'e.g. ₹ under 200' },
                        { key: 'locationUrl', label: 'Map link', placeholder: 'Google Maps URL' },
                      ] as { key: string; label: string; placeholder: string; multi?: boolean }[]).map(({ key, label, placeholder, multi }) => (
                        <div key={key} className="flex gap-4 items-start">
                          <label className="text-[13px] text-[#666] w-[110px] pt-1.5 shrink-0">{label}</label>
                          {multi ? (
                            <textarea
                              value={editFields[key] || ''}
                              onChange={e => setEditFields(prev => ({ ...prev, [key]: e.target.value }))}
                              placeholder={placeholder}
                              className="flex-1 bg-black border border-[#333] rounded px-3 py-2 text-[13px] text-white outline-none focus:border-[#666] resize-none min-h-[72px] transition-colors"
                            />
                          ) : (
                            <input
                              value={editFields[key] || ''}
                              onChange={e => setEditFields(prev => ({ ...prev, [key]: e.target.value }))}
                              placeholder={placeholder}
                              className="flex-1 bg-black border border-[#333] rounded px-3 py-2 text-[13px] text-white outline-none focus:border-[#666] transition-colors"
                            />
                          )}
                        </div>
                      ))}

                      {/* Email field commented out
                      <div className="border-t border-[#333] pt-4 flex gap-4 items-start">
                        <label className="text-[13px] text-[#666] w-[110px] pt-1.5 shrink-0">Your email</label>
                        <input
                          value={editEmail}
                          onChange={e => setEditEmail(e.target.value)}
                          type="email"
                          placeholder="your@email.com (required)"
                          className="flex-1 bg-black border border-[#333] rounded px-3 py-2 text-[13px] text-white outline-none focus:border-[#666] transition-colors"
                        />
                      </div>
                      */}

                      {editError && <div className="text-[12px] text-red-400">{editError}</div>}

                      <div className="flex justify-end">
                        <button
                          onClick={handleEditSubmit}
                          disabled={editLoading}
                          className="px-5 py-2 bg-white text-black text-[13px] font-bold rounded hover:bg-[#eee] transition-colors disabled:opacity-50"
                        >
                          {editLoading ? 'Saving…' : 'Save changes'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {editSuccess && (
                  <div className="mb-6 text-[13px] text-green-400 border border-green-400/30 bg-green-400/5 rounded px-4 py-2">
                    ✓ Spot updated successfully.
                  </div>
                )}

                <div className="mb-8 rounded-md overflow-hidden border border-[#333] h-[200px] md:h-[280px] w-full relative bg-[#0a0a0a]">
                  <iframe
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg)' }}
                    src={`https://maps.google.com/maps?q=${encodeURIComponent((activeSpot.name + " " + (activeSpot.area || "") + " " + (activeCity?.name || "")).trim())}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                    allowFullScreen
                    loading="lazy"
                  ></iframe>
                </div>

                <div className="mb-10">
                  <h1 className="text-[40px] font-bold text-white tracking-tight leading-[1.2] mb-6">{activeSpot.name}</h1>

                  <div className="flex flex-wrap items-center gap-4 py-4 border-y border-[#333]">
                    <div className="flex flex-col">
                      <span className="text-[12px] text-[#666] uppercase tracking-wider mb-1">Area</span>
                      <span className="text-[14px] font-medium text-white">{activeSpot.area}</span>
                    </div>
                    <div className="w-[1px] h-8 bg-[#333]"></div>
                    <div className="flex flex-col">
                      <span className="text-[12px] text-[#666] uppercase tracking-wider mb-1">Time</span>
                      <span className="text-[14px] font-medium text-white">{activeSpot.time || "Anytime"}</span>
                    </div>
                    <div className="w-[1px] h-8 bg-[#333]"></div>
                    <div className="flex flex-col">
                      <span className="text-[12px] text-[#666] uppercase tracking-wider mb-1">Spend</span>
                      <span className="text-[14px] font-medium text-white">{activeSpot.price || "Variable"}</span>
                    </div>
                    {activeSpot.locationUrl && (
                      <>
                        <div className="w-[1px] h-8 bg-[#333]"></div>
                        <div className="flex flex-col">
                          <span className="text-[12px] text-[#666] uppercase tracking-wider mb-1">Map</span>
                          <a href={activeSpot.locationUrl} target="_blank" className="text-[14px] font-medium text-white underline underline-offset-2 decoration-[#666] hover:decoration-white transition-colors">
                            View Location ↗
                          </a>
                        </div>
                      </>
                    )}
                    {activeSpot.submitterHandle && (
                      <>
                        <div className="w-[1px] h-8 bg-[#333]"></div>
                        <div className="flex flex-col">
                          <span className="text-[12px] text-[#666] uppercase tracking-wider mb-1">Added by</span>
                          <span className="text-[14px] font-medium text-white">
                            {activeSpot.submitterHandle.startsWith('@') ? activeSpot.submitterHandle : `@${activeSpot.submitterHandle}`}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="text-[16px] text-[#ddd] leading-relaxed mb-12">
                  {activeSpot.description || activeSpot.desc}
                </div>

                <div className="flex items-center gap-2 mb-12">
                  {/* Upvote */}
                  <button
                    onClick={() => handleUpvote(activeSpot.id, activeSpot.votes || 0)}
                    disabled={voteLoading[activeSpot.id] || votedSpotIds.has(activeSpot.id)}
                    title="Upvote"
                    className={`flex items-center gap-2 px-4 py-2 rounded-md border text-[14px] font-medium transition-colors disabled:opacity-40 ${votedSpotIds.has(activeSpot.id)
                      ? 'bg-white text-black border-white cursor-default'
                      : 'bg-transparent text-white border-[#333] hover:border-[#666]'
                      }`}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 2L22 20H2L12 2Z" /></svg>
                    {voteLoading[activeSpot.id] ? '…' : (localVotes[activeSpot.id] ?? (activeSpot.votes || 0))}
                  </button>

                  {/* Downvote — only active when user has already upvoted */}
                  <button
                    onClick={() => handleDownvote(activeSpot.id, activeSpot.votes || 0)}
                    disabled={voteLoading[activeSpot.id] || !votedSpotIds.has(activeSpot.id)}
                    title="Remove upvote"
                    className="flex items-center gap-2 px-4 py-2 rounded-md border text-[14px] font-medium transition-colors border-[#333] text-[#666] hover:border-[#666] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 22L2 4H22L12 22Z" /></svg>
                  </button>

                  <div className="w-[1px] h-6 bg-[#333] mx-2"></div>

                  {/* Share buttons */}
                  <button
                    onClick={() => {
                      const url = window.location.href;
                      const text = `Check out ${activeSpot.name} on BackdoorCity:`;
                      window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-md border border-[#333] text-[14px] font-medium text-green-400 hover:border-green-400/50 hover:bg-green-400/10 transition-colors hidden sm:flex"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.489-1.761-1.663-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>
                    WhatsApp
                  </button>
                  <button
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({
                          title: activeSpot.name,
                          text: `Check out ${activeSpot.name} on BackdoorCity`,
                          url: window.location.href,
                        }).catch(console.error);
                      } else {
                        navigator.clipboard.writeText(window.location.href);
                        alert("Link copied to clipboard!");
                      }
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-md border border-[#333] text-[14px] font-medium text-pink-400 hover:border-pink-400/50 hover:bg-pink-400/10 transition-colors"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg>
                    <span className="hidden sm:inline">IG Story / Share</span>
                    <span className="sm:hidden">Share</span>
                  </button>
                </div>

                <div className="border-t border-[#333] pt-12">
                  <h3 className="text-[18px] font-bold text-white mb-6">Reviews & Notes</h3>

                  <div className="space-y-6 mb-10">
                    {(() => {
                      const spotRevs = [...(localReviews[activeSpot.id] || []), ...(activeSpot.reviews || [])];
                      if (spotRevs.length === 0) {
                        return <div className="text-[#666] text-[14px] italic">No reviews yet. Be the first to add a note.</div>;
                      }
                      return spotRevs.map((r: any, i: number) => (
                        <div key={i} className="flex gap-4">
                          <div className="w-8 h-8 rounded bg-[#111] border border-[#333] flex items-center justify-center text-[12px] font-bold text-[#888]">
                            {(r.submitterHandle || r.h || "@").charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-[14px] font-bold text-white">{r.submitterHandle || r.h}</span>
                              <span className="text-[12px] text-[#666]">{r.createdAt ? new Date(r.createdAt).toLocaleDateString() : ''}</span>
                            </div>
                            <p className="text-[14px] text-[#aaa] leading-relaxed">{r.text || r.t}</p>
                          </div>
                        </div>
                      ));
                    })()}
                  </div>

                  <div className="bg-[#0a0a0a] border border-[#333] rounded-md p-4">
                    <textarea
                      value={newReview}
                      onChange={(e) => setNewReview(e.target.value)}
                      placeholder="Add a note or review..."
                      className="w-full bg-transparent text-[14px] text-white outline-none resize-none min-h-[80px] placeholder-[#666]"
                    />
                    <div className="border-t border-[#333] pt-3 mt-2 flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        {/* Email input commented out
                        <input
                          value={reviewEmail}
                          onChange={(e) => setReviewEmail(e.target.value)}
                          placeholder="your@email.com (required)"
                          type="email"
                          className="bg-transparent text-[13px] text-white outline-none placeholder-[#666] flex-1 border-b border-[#333] pb-1 focus:border-[#666] transition-colors"
                        />
                        */}
                        <input
                          value={handle}
                          onChange={(e) => setHandle(e.target.value)}
                          placeholder="@handle (optional)"
                          className="bg-transparent text-[13px] text-white outline-none placeholder-[#666] flex-1 border-b border-[#333] pb-1 focus:border-[#666] transition-colors"
                        />
                      </div>
                      {reviewError && (
                        <div className="text-[12px] text-red-400">{reviewError}</div>
                      )}
                      <div className="flex justify-end">
                        <button
                          onClick={() => handlePostReview(activeSpot.id)}
                          disabled={reviewLoading}
                          className="px-4 py-1.5 bg-white text-black text-[13px] font-bold rounded hover:bg-[#eee] transition-colors disabled:opacity-50"
                        >
                          {reviewLoading ? 'Submitting...' : 'Submit'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
