import React, { useState } from 'react';
import {
  Building2,
  ArrowRight,
  CheckCircle2,
  Globe,
  Sparkles,
  Search,
  Users,
  Compass,
  Plus,
  Minus,
  X,
  Palette,
  Image,
  TrendingUp,
  Layers,
  MapPin,
  ListFilter,
  Flame,
  Maximize2
} from 'lucide-react';
import { WorldScene } from './WorldScene';
import { PRESET_COLORS, PRESET_LOGOS } from '../data/buildings';

export function UIOverlay({
  buildings = [],
  selectedBuilding,
  onSelectBuilding,
  filterCluster,
  setFilterCluster,
  customBrandName,
  setCustomBrandName,
  customWebsite,
  setCustomWebsite,
  customColor,
  setCustomColor,
  customLogo,
  setCustomLogo,
  customFloors,
  setCustomFloors,
  onClaimOrOutbid,
  claimSuccess
}) {
  const [viewMode, setViewMode] = useState('map'); // 'map' | 'list'
  const [searchQuery, setSearchQuery] = useState('');
  const [zoomLevel, setZoomLevel] = useState(100);

  // Filter buildings by cluster and search query
  const filteredBuildings = buildings.filter((b) => {
    const matchesCluster = filterCluster === 'all' || b.cluster === filterCluster;
    const matchesSearch =
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.owner?.name && b.owner.name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCluster && matchesSearch;
  });

  // Calculate minimum outbid price for selected building
  const minOutbid = selectedBuilding
    ? selectedBuilding.status === 'owned'
      ? selectedBuilding.currentPrice + 5
      : selectedBuilding.basePrice
    : 0;

  // Selected building current color / height / logo display
  const activeColor = customColor || selectedBuilding?.customColor || selectedBuilding?.owner?.color || selectedBuilding?.accentColor || '#10b981';
  const activeLogo = customLogo || selectedBuilding?.owner?.logo || '🚀';
  const activeFloors = customFloors || selectedBuilding?.floors || 12;

  return (
    <div className="w-full flex flex-col items-center font-sans text-slate-900 bg-[#f3fbf6] min-h-screen">

      {/* ========================================================= */}
      {/* 1. TOP HEADER NAV (Matching Reference Image)              */}
      {/* ========================================================= */}
      <header className="w-full max-w-7xl px-4 md:px-8 py-4 flex items-center justify-between gap-4 z-30">
        {/* Brand Logo */}
        <div className="flex items-center gap-2.5 cursor-pointer">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-black shadow-md shadow-emerald-600/30">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-lg font-black tracking-tight text-slate-900 leading-none block">LandOfSaaS</span>
            <span className="text-[10px] text-slate-500 font-semibold block tracking-normal mt-0.5">Own. Build. Get Discovered.</span>
          </div>
        </div>

        {/* Center Nav Links */}
        <nav className="hidden lg:flex items-center gap-1 font-bold text-xs text-slate-600 bg-white/80 backdrop-blur-md px-4 py-1.5 rounded-full border border-emerald-100 shadow-sm">
          <a href="#world-section" className="px-3 py-1.5 hover:text-emerald-700 rounded-full transition-colors text-emerald-700 font-extrabold">Explore 3D</a>
          <a href="#how-it-works" className="px-3 py-1.5 hover:text-emerald-700 rounded-full transition-colors">How it works</a>
          <a href="#pricing" className="px-3 py-1.5 hover:text-emerald-700 rounded-full transition-colors">Pricing</a>
          <a href="#leaderboard" className="px-3 py-1.5 hover:text-emerald-700 rounded-full transition-colors">Leaderboard</a>
          <a href="#blog" className="px-3 py-1.5 hover:text-emerald-700 rounded-full transition-colors">Blog</a>
        </nav>

        {/* Right Search + Sign In + Get Started Buttons */}
        <div className="flex items-center gap-3">
          {/* Search Bar */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-white/90 border border-slate-200 rounded-full text-xs text-slate-500 shadow-sm focus-within:border-emerald-500 transition-all">
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search companies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-xs text-slate-800 font-medium w-28 md:w-36"
            />
          </div>

          <button className="px-4 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-full shadow-sm transition-all">
            Sign in
          </button>
          <button
            onClick={() => document.getElementById('world-section')?.scrollIntoView({ behavior: 'smooth' })}
            className="px-5 py-2 text-xs font-black text-white bg-emerald-600 hover:bg-emerald-700 rounded-full shadow-md shadow-emerald-600/30 transition-all hover:scale-105"
          >
            Get Started
          </button>
        </div>
      </header>

      {/* ========================================================= */}
      {/* 2. HERO SECTION OVER FULL-WIDTH LANDSCAPE BACKDROP       */}
      {/* ========================================================= */}
      <section className="w-full relative py-12 md:py-16 px-4 flex flex-col items-center justify-center text-center overflow-hidden">
        {/* Handwritten Style Annotations matching reference image */}
        <div className="hidden lg:block absolute top-12 left-[12%] max-w-[170px] text-left pointer-events-none transform -rotate-6">
          <p className="font-serif italic text-xs text-emerald-800/80 leading-snug">
            From startups to global brands — everyone belongs here.
          </p>
          <svg className="w-12 h-8 text-emerald-700/60 mt-1" viewBox="0 0 50 30" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M 5 5 Q 25 25 45 15" strokeDasharray="3 3" />
            <path d="M 38 18 L 45 15 L 42 8" />
          </svg>
        </div>

        <div className="hidden lg:block absolute top-12 right-[14%] max-w-[160px] text-right pointer-events-none transform rotate-3">
          <p className="font-serif italic text-xs text-emerald-800/80 leading-snug">
            A more open internet for builders
          </p>
          <svg className="w-12 h-8 text-emerald-700/60 mt-1 ml-auto" viewBox="0 0 50 30" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M 45 5 Q 25 25 5 15" strokeDasharray="3 3" />
            <path d="M 12 18 L 5 15 L 8 8" />
          </svg>
        </div>

        {/* Hero Title & Subtext */}
        <div className="max-w-3xl mx-auto z-10 flex flex-col items-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-tight mb-3">
            Own Your Space <br className="hidden sm:block" /> on the Internet 🌍
          </h1>

          <p className="text-sm md:text-base text-slate-600 font-medium max-w-lg mb-6 leading-relaxed">
            Stop renting attention. Claim your space once. Get discovered forever.
          </p>

          <button
            onClick={() => document.getElementById('world-section')?.scrollIntoView({ behavior: 'smooth' })}
            className="flex items-center gap-2 px-7 py-3.5 text-sm font-black text-white bg-emerald-600 hover:bg-emerald-700 rounded-full shadow-xl shadow-emerald-600/30 transition-all hover:scale-105 mb-8"
          >
            Start Claiming Land
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Stats Bar matching reference image */}
          <div className="flex items-center justify-center gap-6 md:gap-10 px-6 py-2.5 bg-white/90 backdrop-blur-md rounded-full border border-emerald-100 shadow-md text-xs font-bold text-slate-700">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-600" />
              <span><strong className="font-extrabold text-slate-900">500+</strong> Founders onboard</span>
            </div>
            <div className="h-4 w-px bg-slate-200"></div>
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-600" />
              <span><strong className="font-extrabold text-slate-900">30</strong> Buildings available</span>
            </div>
            <div className="h-4 w-px bg-slate-200"></div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span><strong className="font-extrabold text-slate-900">$2</strong> Starting price</span>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 3. FULL-WIDTH 3D WORLD INTERFACE & FLOATING CONTROLS     */}
      {/* ========================================================= */}
      <section id="world-section" className="w-full relative max-w-[1440px] px-2 md:px-6 mb-16 scroll-mt-20">
        
        {/* Main 3D World Canvas Container */}
        <div className="relative w-full h-[720px] md:h-[780px] rounded-3xl overflow-hidden border border-emerald-200/80 shadow-2xl bg-[#cbf3df]">

          {/* 3D WebGL Canvas Component */}
          {viewMode === 'map' ? (
            <WorldScene
              buildings={filteredBuildings}
              selectedBuilding={selectedBuilding}
              onSelectBuilding={(b) => {
                onSelectBuilding(b);
                if (b) {
                  setCustomColor(b.customColor || b.owner?.color || b.accentColor || '#10b981');
                  setCustomLogo(b.owner?.logo || '🚀');
                  setCustomFloors(b.floors || 12);
                  setCustomBrandName(b.owner?.name || '');
                  setCustomWebsite(b.owner?.website || '');
                }
              }}
              filterCluster={filterCluster}
            />
          ) : (
            /* List View Fallback */
            <div className="w-full h-full overflow-y-auto p-8 bg-white/95 backdrop-blur-md">
              <h3 className="text-xl font-black text-slate-900 mb-4">All Available &amp; Owned Territory Slots</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {filteredBuildings.map(b => (
                  <div
                    key={b.id}
                    onClick={() => {
                      onSelectBuilding(b);
                      setViewMode('map');
                    }}
                    className="p-4 rounded-2xl border border-slate-200 hover:border-emerald-500 bg-slate-50 hover:bg-white transition-all cursor-pointer shadow-sm flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-base">{b.owner?.logo || '🏢'}</span>
                        <h4 className="font-extrabold text-sm text-slate-900">{b.name}</h4>
                      </div>
                      <span className="text-xs text-slate-500 font-semibold">{b.clusterName} • {b.sizeLabel}</span>
                    </div>
                    <div className="text-right">
                      <span className="block text-xs font-black text-emerald-700">${b.status === 'owned' ? b.currentPrice : b.basePrice}</span>
                      <span className="text-[10px] uppercase font-bold text-slate-400">{b.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ----------------------------------------------------- */}
          {/* MAP CONTROLS OVERLAY (Matching Reference Image)       */}
          {/* ----------------------------------------------------- */}

          {/* Top Left Pills: [Map View] [List View] */}
          <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5 bg-white/90 backdrop-blur-md p-1 rounded-2xl border border-slate-200/80 shadow-md">
            <button
              onClick={() => setViewMode('map')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                viewMode === 'map'
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              Map View
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                viewMode === 'list'
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <ListFilter className="w-3.5 h-3.5" />
              List View
            </button>
          </div>

          {/* Left Floating Category Menu */}
          <div className="absolute top-16 left-4 z-20 hidden sm:flex flex-col gap-1 bg-white/90 backdrop-blur-md p-2 rounded-2xl border border-slate-200/80 shadow-lg w-44">
            {[
              { id: 'all', label: 'All Zones', icon: '🌐' },
              { id: 'ai', label: 'AI & Tech', icon: '🤖' },
              { id: 'mkt', label: 'Marketing', icon: '📣' },
              { id: 'saas', label: 'SaaS', icon: '💻' },
              { id: 'web3', label: 'Web3', icon: '⬡' },
              { id: 'crt', label: 'Creator Economy', icon: '🎨' },
              { id: 'open', label: 'Open Zone', icon: '🌱' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterCluster(tab.id)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all text-left ${
                  filterCluster === tab.id
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-700 hover:bg-emerald-50 hover:text-emerald-800'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Bottom Left Badge: 327 people exploring */}
          <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2 px-3 py-1.5 bg-white/90 backdrop-blur-md rounded-full border border-slate-200/80 shadow-md text-xs font-bold text-slate-700">
            <div className="flex -space-x-1.5 overflow-hidden">
              <span className="inline-block h-5 w-5 rounded-full ring-2 ring-white bg-emerald-500 text-[10px] text-white font-black flex items-center justify-center">A</span>
              <span className="inline-block h-5 w-5 rounded-full ring-2 ring-white bg-blue-500 text-[10px] text-white font-black flex items-center justify-center">B</span>
              <span className="inline-block h-5 w-5 rounded-full ring-2 ring-white bg-purple-500 text-[10px] text-white font-black flex items-center justify-center">C</span>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span><strong className="text-slate-900 font-extrabold">327</strong> people exploring</span>
          </div>

          {/* Bottom Right Zoom Bar */}
          <div className="absolute bottom-4 right-4 z-20 flex items-center gap-1.5 bg-white/90 backdrop-blur-md p-1.5 rounded-full border border-slate-200/80 shadow-md text-xs font-bold text-slate-700">
            <button
              onClick={() => setZoomLevel(Math.max(70, zoomLevel - 10))}
              className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center font-bold text-slate-700"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 text-[11px] font-extrabold text-slate-800">{zoomLevel}%</span>
            <button
              onClick={() => setZoomLevel(Math.min(150, zoomLevel + 10))}
              className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center font-bold text-slate-700"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
            <div className="h-4 w-px bg-slate-200 mx-1"></div>
            <button
              onClick={() => setZoomLevel(100)}
              className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700"
              title="Reset View"
            >
              <Compass className="w-3.5 h-3.5 text-emerald-700" />
            </button>
          </div>

          {/* ----------------------------------------------------- */}
          {/* RIGHT FLOATING INSPECTION & CUSTOMIZATION MODAL       */}
          {/* (Matching Reference Image Right Sidebar Card)         */}
          {/* ----------------------------------------------------- */}
          {selectedBuilding && (
            <div className="absolute top-4 right-4 z-30 max-w-sm w-full max-h-[92%] overflow-y-auto bg-white/95 backdrop-blur-2xl p-5 rounded-3xl border border-white/80 shadow-2xl text-slate-900 pointer-events-auto">
              
              {/* Card Header: Building Name | Available Badge | X Close */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-black text-slate-900 leading-snug">{selectedBuilding.name}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    selectedBuilding.status === 'owned'
                      ? 'bg-amber-100 text-amber-900'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {selectedBuilding.status === 'owned' ? 'Owned' : 'Available'}
                  </span>
                </div>
                <button
                  onClick={() => onSelectBuilding(null)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* 3D/Isometric Building Preview Card */}
              <div className="relative w-full h-32 rounded-2xl bg-gradient-to-b from-emerald-50 to-emerald-100/70 border border-emerald-200 flex items-center justify-center overflow-hidden mb-3">
                <div className="text-center">
                  <div
                    className="w-14 h-16 mx-auto rounded-lg shadow-md border border-white flex flex-col items-center justify-center text-white transition-all transform hover:scale-105"
                    style={{ backgroundColor: activeColor }}
                  >
                    <span className="text-xl">{activeLogo}</span>
                    <span className="text-[9px] font-black tracking-wider uppercase mt-1 opacity-90">{activeFloors}F</span>
                  </div>
                  <span className="text-[11px] font-extrabold text-slate-600 block mt-2">Custom Building Render</span>
                </div>
              </div>

              {/* Building Stats Table */}
              <div className="grid grid-cols-3 gap-2 py-2 px-3 bg-slate-50 rounded-xl border border-slate-200/80 text-center mb-3">
                <div>
                  <span className="block text-[10px] font-bold text-slate-400 uppercase">Size</span>
                  <span className="text-xs font-black text-slate-800">{selectedBuilding.sizeLabel}</span>
                </div>
                <div className="border-x border-slate-200">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase">Min Price</span>
                  <span className="text-xs font-black text-slate-800">${selectedBuilding.basePrice}</span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-slate-400 uppercase">Current Bid</span>
                  <span className="text-xs font-black text-emerald-700">${selectedBuilding.status === 'owned' ? selectedBuilding.currentPrice : 0}</span>
                </div>
              </div>

              {/* CUSTOMIZATION OPTIONS (User explicitly requested!) */}
              <div className="space-y-3 pt-1 border-t border-slate-100 mb-4">
                <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-900">
                  <Palette className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Customize Building Appearance</span>
                </div>

                {/* Color Swatch Picker */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1.5">Building Wall Color</label>
                  <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                    {PRESET_COLORS.map(c => (
                      <button
                        key={c.hex}
                        onClick={() => {
                          setCustomColor(c.hex);
                          selectedBuilding.customColor = c.hex;
                        }}
                        className={`w-6 h-6 rounded-full border-2 border-white shadow-sm flex items-center justify-center transition-transform ${
                          activeColor === c.hex ? 'scale-125 ring-2 ring-emerald-600' : 'hover:scale-110'
                        }`}
                        style={{ backgroundColor: c.hex }}
                        title={c.name}
                      />
                    ))}
                  </div>
                </div>

                {/* Logo & Brand Icon Picker */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1.5">Brand Logo / Icon</label>
                  <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                    {PRESET_LOGOS.map(l => (
                      <button
                        key={l.name}
                        onClick={() => {
                          setCustomLogo(l.icon);
                          if (selectedBuilding.owner) selectedBuilding.owner.logo = l.icon;
                        }}
                        className={`w-7 h-7 rounded-lg border text-sm flex items-center justify-center transition-all ${
                          activeLogo === l.icon
                            ? 'bg-emerald-100 border-emerald-600 shadow-sm scale-105'
                            : 'bg-white border-slate-200 hover:bg-slate-50'
                        }`}
                        title={l.name}
                      >
                        {l.icon}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Grow Building (Floors & Height Upgrade) */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[10px] font-bold text-slate-500">Grow Building (Floors &amp; Height)</label>
                    <span className="text-xs font-black text-emerald-700">{activeFloors} Floors</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {[
                      { floors: 6, label: 'Small (6F)', h: 2.5 },
                      { floors: 14, label: 'Medium (14F)', h: 5.0 },
                      { floors: 24, label: 'Large (24F)', h: 8.0 },
                      { floors: 38, label: 'Tower (38F)', h: 11.5 }
                    ].map(tier => (
                      <button
                        key={tier.floors}
                        onClick={() => {
                          setCustomFloors(tier.floors);
                          selectedBuilding.floors = tier.floors;
                          selectedBuilding.height = tier.h;
                        }}
                        className={`flex-1 py-1 px-1.5 rounded-lg text-[10px] font-bold transition-all border ${
                          activeFloors === tier.floors
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {tier.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Brand Name & Website URL Input */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">Website URL</label>
                  <div className="relative">
                    <Globe className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="url"
                      value={customWebsite}
                      onChange={(e) => setCustomWebsite(e.target.value)}
                      placeholder="https://yourwebsite.com"
                      className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                </div>

                {/* Your Bid USD */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">Your Bid (USD)</label>
                  <input
                    type="number"
                    value={minOutbid}
                    readOnly
                    className="w-full px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-extrabold text-slate-900"
                  />
                </div>
              </div>

              {/* Action CTA Buttons */}
              <div className="space-y-2">
                <button
                  onClick={() => onClaimOrOutbid(selectedBuilding, minOutbid)}
                  className={`w-full py-3 px-4 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg transition-all ${
                    claimSuccess
                      ? 'bg-emerald-500 text-white'
                      : selectedBuilding.status === 'owned'
                      ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/30'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30 hover:scale-[1.02]'
                  }`}
                >
                  {claimSuccess ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 animate-bounce" />
                      Building Claimed &amp; Customized!
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Place Bid &amp; Claim (${minOutbid})
                    </>
                  )}
                </button>

                <button
                  onClick={() => alert(`Showing details for ${selectedBuilding.name}`)}
                  className="w-full py-2 px-4 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl transition-all"
                >
                  View Details
                </button>
              </div>

            </div>
          )}

        </div>
      </section>

      {/* ========================================================= */}
      {/* 4. SECTION: HOW IT WORKS (Light 4-step Cards)            */}
      {/* ========================================================= */}
      <section id="how-it-works" className="w-full max-w-7xl px-4 py-16 text-center relative">
        <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">How It Works</h2>
        <p className="text-xs text-slate-500 font-semibold mb-12 max-w-md mx-auto">
          Simple 4-step process to claim, customize, and grow your 3D presence.
        </p>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
          <div className="p-6 bg-white rounded-3xl border border-emerald-100 shadow-sm text-left hover:shadow-md transition-shadow relative">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 font-black text-sm flex items-center justify-center mb-4">
              1
            </div>
            <h3 className="text-base font-black text-slate-900 mb-1.5">1. Explore</h3>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              Browse the 3D world and find your perfect spot across AI, Dev, SaaS, and Web3 clusters.
            </p>
          </div>

          <div className="p-6 bg-white rounded-3xl border border-emerald-100 shadow-sm text-left hover:shadow-md transition-shadow relative">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 font-black text-sm flex items-center justify-center mb-4">
              2
            </div>
            <h3 className="text-base font-black text-slate-900 mb-1.5">2. Choose</h3>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              Select a building slot and place your bid starting from $2 flat base price.
            </p>
          </div>

          <div className="p-6 bg-white rounded-3xl border border-emerald-100 shadow-sm text-left hover:shadow-md transition-shadow relative">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 font-black text-sm flex items-center justify-center mb-4">
              3
            </div>
            <h3 className="text-base font-black text-slate-900 mb-1.5">3. Customize</h3>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              Add your custom wall color, brand logo, website link, and grow building height.
            </p>
          </div>

          <div className="p-6 bg-white rounded-3xl border border-emerald-100 shadow-sm text-left hover:shadow-md transition-shadow relative">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 font-black text-sm flex items-center justify-center mb-4">
              4
            </div>
            <h3 className="text-base font-black text-slate-900 mb-1.5">4. Get Discovered</h3>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              Be seen by thousands of daily visitors and grow your brand permanently.
            </p>
          </div>
        </div>

        {/* Handwritten callout on bottom right */}
        <div className="hidden md:block absolute bottom-4 right-12 text-right pointer-events-none transform rotate-3">
          <p className="font-serif italic text-xs text-emerald-800/80 leading-snug">
            Same land.<br />Bigger opportunities.
          </p>
          <svg className="w-10 h-8 text-emerald-700/60 mt-1 ml-auto" viewBox="0 0 50 30" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M 40 5 Q 20 20 5 15" strokeDasharray="3 3" />
            <path d="M 12 18 L 5 15 L 8 8" />
          </svg>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 5. FOOTER                                                 */}
      {/* ========================================================= */}
      <footer className="w-full border-t border-emerald-100 bg-white py-8 px-4 md:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-semibold">
        <div className="flex items-center gap-2 text-slate-900 font-black">
          <Building2 className="w-4 h-4 text-emerald-600" />
          <span>LandOfSaaS</span>
        </div>

        <div className="flex items-center gap-6 text-slate-600 font-bold">
          <a href="#world-section" className="hover:text-emerald-700 transition-colors">Explore 3D</a>
          <a href="#how-it-works" className="hover:text-emerald-700 transition-colors">How it works</a>
          <a href="#pricing" className="hover:text-emerald-700 transition-colors">Pricing</a>
          <a href="#leaderboard" className="hover:text-emerald-700 transition-colors">Leaderboard</a>
        </div>

        <span>© 2026 LandOfSaaS. Built for a more open internet.</span>
      </footer>

    </div>
  );
}
