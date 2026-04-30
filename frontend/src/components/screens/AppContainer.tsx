"use client";

import { useState, useEffect } from "react";
import AddSpotScreen from "@/components/screens/AddSpotScreen";
import { API_URL } from "@/lib/api";

export default function AppContainer() {
  const [cities, setCities] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [spots, setSpots] = useState<any[]>([]);
  
  const [activeCity, setActiveCity] = useState<any>(null);
  const [activeCategory, setActiveCategory] = useState<any>(null);
  const [activeSpot, setActiveSpot] = useState<any>(null);
  
  const [screen, setScreen] = useState<"wiki" | "add">("wiki");
  const [loadingSpots, setLoadingSpots] = useState(false);
  const [citySearch, setCitySearch] = useState("");
  const [showWelcome, setShowWelcome] = useState(true);

  // Local interaction state
  const [localVotes, setLocalVotes] = useState<Record<string, number>>({});
  const [votedSpotIds, setVotedSpotIds] = useState<Set<string>>(new Set());
  const [voteLoading, setVoteLoading] = useState<Record<string, boolean>>({});
  const [localReviews, setLocalReviews] = useState<Record<string, any[]>>({});

  const [newReview, setNewReview] = useState("");
  const [reviewEmail, setReviewEmail] = useState("");
  const [handle, setHandle] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState("");

  // Edit spot state
  const [editOpen, setEditOpen] = useState(false);
  const [editFields, setEditFields] = useState<Record<string, string>>({});
  const [editEmail, setEditEmail] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");
  const [editSuccess, setEditSuccess] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/api/cities`)
      .then(res => res.json())
      .then(data => { setCities(data); });

    fetch(`${API_URL}/api/categories`)
      .then(res => res.json())
      .then(data => {
        setCategories(data);
        if (data.length > 0) setActiveCategory(data[0]);
      });
  }, []);

  useEffect(() => {
    if (activeCity && activeCategory) {
      setLoadingSpots(true);
      fetch(`${API_URL}/api/spots?cityId=${activeCity.id}&categoryId=${activeCategory.id}`)
        .then(res => res.json())
        .then(data => {
          setSpots(data);
          setActiveSpot(null);
          setLoadingSpots(false);
        });
    }
  }, [activeCity, activeCategory]);

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
    if (!reviewEmail.trim()) { setReviewError('Email is required.'); return; }
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
            ? (handle.startsWith('@') ? handle : `@${handle}`)
            : null,
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
    if (!editEmail.trim()) { setEditError('Your email is required to edit.'); return; }
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
      
      {/* Pane 1: Cities (Folders) */}
      <div className="w-[240px] bg-[#111] border-r border-[#333] flex flex-col z-20">
        <div className="p-4 pl-5 pb-2 text-[11px] font-semibold tracking-widest text-[#888] uppercase mt-2">
          BackdoorCity
        </div>
        {/* City search */}
        <div className="px-3 pb-2">
          <div className="relative">
            <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#555]" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
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
          {cities
            .filter(city => city.name.toLowerCase().includes(citySearch.toLowerCase()))
            .sort((a, b) => (b._count?.spots ?? 0) - (a._count?.spots ?? 0))
            .map(city => {
              const isActive = activeCity?.id === city.id;
              return (
                <div 
                  key={city.id}
                  onClick={() => { setActiveCity(city); setShowWelcome(false); setActiveSpot(null); }}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-colors ${
                    isActive ? 'bg-[#222] text-white' : 'hover:bg-[#1a1a1a] text-[#888]'
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
        </div>
      </div>

      {/* Pane 2: Categories (Notes List) — hidden during welcome */}
      {!showWelcome && (
      <div className="w-[300px] bg-[#0a0a0a] border-r border-[#333] flex flex-col z-20">
        <div className="p-4 pl-5 border-b border-[#333] sticky top-0">
          <div className="text-[16px] font-medium text-white tracking-tight mb-4 flex items-center justify-between">
            {activeCity?.name ?? ''}
            <button onClick={() => setScreen("add")} className="text-[#888] hover:text-white transition-colors">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
            </button>
          </div>
          <div className="relative">
            <svg className="absolute left-3 top-2 text-[#666]" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
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
                className={`flex items-start gap-3 p-4 border-b border-[#222] cursor-pointer transition-colors ${
                  isActive ? 'bg-[#1a1a1a]' : 'hover:bg-[#111]'
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
      <div className="flex-1 relative bg-black flex flex-col z-10 overflow-hidden">
        <div className="relative z-10 flex-1 overflow-y-auto px-16 py-20">
          <div className="max-w-[720px] mx-auto">
            {showWelcome ? (
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
                        className="group flex items-center justify-between p-3 -mx-3 rounded-md hover:bg-[#111] cursor-pointer transition-colors border border-transparent hover:border-[#333]"
                      >
                        <div className="flex items-center gap-4">
                          <div className="text-[14px] text-[#555] font-mono">{i + 1}</div>
                          <div className="flex flex-col">
                            <span className="text-[15px] font-medium text-white group-hover:underline underline-offset-4 decoration-[#555]">{spot.name}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-[13px] text-[#888]">{spot.area}</span>
                              {spot.submitterHandle && (
                                <span className="text-[11px] text-[#555]">· {spot.submitterHandle.startsWith('@') ? spot.submitterHandle : `@${spot.submitterHandle}`}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-[13px] text-[#555] opacity-0 group-hover:opacity-100 transition-opacity">
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
                    className={`text-[13px] font-medium px-3 py-1 rounded border transition-colors ${
                      editOpen
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
                        { key: 'name',        label: 'Name',          placeholder: 'Spot name' },
                        { key: 'area',        label: 'Area',          placeholder: 'Neighbourhood / area' },
                        { key: 'description', label: 'Description',   placeholder: 'What makes it worth going?', multi: true },
                        { key: 'time',        label: 'Best time',     placeholder: 'e.g. 11am – 8pm' },
                        { key: 'price',       label: 'Spend',         placeholder: 'e.g. ₹ under 200' },
                        { key: 'locationUrl', label: 'Map link',      placeholder: 'Google Maps URL' },
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
                    className={`flex items-center gap-2 px-4 py-2 rounded-md border text-[14px] font-medium transition-colors disabled:opacity-40 ${
                      votedSpotIds.has(activeSpot.id)
                        ? 'bg-white text-black border-white cursor-default'
                        : 'bg-transparent text-white border-[#333] hover:border-[#666]'
                    }`}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 2L22 20H2L12 2Z"/></svg>
                    {voteLoading[activeSpot.id] ? '…' : (localVotes[activeSpot.id] ?? (activeSpot.votes || 0))}
                  </button>

                  {/* Downvote — only active when user has already upvoted */}
                  <button
                    onClick={() => handleDownvote(activeSpot.id, activeSpot.votes || 0)}
                    disabled={voteLoading[activeSpot.id] || !votedSpotIds.has(activeSpot.id)}
                    title="Remove upvote"
                    className="flex items-center gap-2 px-4 py-2 rounded-md border text-[14px] font-medium transition-colors border-[#333] text-[#666] hover:border-[#666] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 22L2 4H22L12 22Z"/></svg>
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
                        <input
                          value={reviewEmail}
                          onChange={(e) => setReviewEmail(e.target.value)}
                          placeholder="your@email.com (required)"
                          type="email"
                          className="bg-transparent text-[13px] text-white outline-none placeholder-[#666] flex-1 border-b border-[#333] pb-1 focus:border-[#666] transition-colors"
                        />
                        <input
                          value={handle}
                          onChange={(e) => setHandle(e.target.value)}
                          placeholder="@handle (optional)"
                          className="bg-transparent text-[13px] text-white outline-none placeholder-[#666] w-[160px] border-b border-[#333] pb-1 focus:border-[#666] transition-colors"
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
