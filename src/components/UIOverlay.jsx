import React, { useState } from 'react';
import { SignedIn, SignedOut, useAuth, useClerk, UserButton } from '@clerk/clerk-react';
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
  Upload,
  Layers,
  MapPin,
  ListFilter,
  Flame,
  Maximize2,
  Loader2,
  ShieldCheck,
  FileText,
  HelpCircle,
  ExternalLink,
  LogIn,
  AlertCircle
} from 'lucide-react';
import { WorldScene } from './WorldScene';
import { PRESET_COLORS } from '../data/buildings';

// Helper to convert hex to RGB object
function hexToRgb(hex) {
  const cleanHex = hex.replace('#', '');
  const bigint = parseInt(cleanHex.length === 3 ? cleanHex.split('').map(c => c + c).join('') : cleanHex, 16);
  if (isNaN(bigint)) return { r: 16, g: 185, b: 129 };
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255
  };
}

// Helper to convert RGB to hex string
function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(x => {
    const hex = Math.max(0, Math.min(255, x)).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

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
  customLogoScale,
  setCustomLogoScale,
  customFloors,
  setCustomFloors,
  onClaimOrOutbid,
  claimSuccess,
  isProcessingPayment
}) {
  const [viewMode, setViewMode] = useState('map'); // 'map' | 'list'
  const [searchQuery, setSearchQuery] = useState('');
  const [zoomLevel, setZoomLevel] = useState(100);
  const [activeLegalModal, setActiveLegalModal] = useState(null); // 'privacy' | 'terms' | 'rules' | null

  const { isSignedIn } = useAuth();
  const { openSignIn } = useClerk();

  // Calculate live revenue generated from all owned buildings
  const totalRevenueGenerated = buildings.reduce((acc, b) => {
    return acc + (b.status === 'owned' ? Number(b.currentPrice || 0) : 0);
  }, 0);

  // Calculate hours elapsed since launch on September 7, 2026
  const launchTimestamp = new Date('2026-09-07T00:00:00Z').getTime();
  const currentTimestamp = Date.now();
  const hoursSinceLaunch = Math.max(1, Math.floor(Math.abs(currentTimestamp - launchTimestamp) / (1000 * 60 * 60)));

  // Filter buildings by cluster and search query
  const filteredBuildings = buildings.filter((b) => {
    const matchesCluster = filterCluster === 'all' || b.cluster === filterCluster;
    const matchesSearch =
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.owner?.name && b.owner.name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCluster && matchesSearch;
  });

  // Calculate minimum outbid price & upgrade difference for selected building
  const minOutbid = selectedBuilding
    ? selectedBuilding.status === 'owned'
      ? selectedBuilding.currentPrice + 5
      : selectedBuilding.basePrice
    : 0;

  const currentPrice = selectedBuilding?.currentPrice || 0;
  const upgradeDifference = selectedBuilding
    ? selectedBuilding.status === 'owned'
      ? Math.max(1, minOutbid - currentPrice)
      : minOutbid
    : 0;

  // Selected building current color / height / logo display
  const activeColor = customColor || selectedBuilding?.customColor || selectedBuilding?.owner?.color || '#10b981';
  const activeLogo = customLogo || selectedBuilding?.customLogo || selectedBuilding?.owner?.logo;
  const activeFloors = customFloors || selectedBuilding?.floors || 16;
  const activeLogoScale = customLogoScale || selectedBuilding?.customLogoScale || 1.4;

  const currentRgb = hexToRgb(activeColor);

  // Custom Image Upload Handler
  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert('Please upload an image smaller than 2MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        const dataUrl = event.target.result;
        setCustomLogo(dataUrl);
        if (selectedBuilding) {
          selectedBuilding.customLogo = dataUrl;
          if (selectedBuilding.owner) selectedBuilding.owner.logo = dataUrl;
        }
      }
    };
    reader.readAsDataURL(file);
  };

  // Claim / Upgrade Action Handler with Strict Form Validation & Clerk Auth
  const handleClaimClick = () => {
    if (!customBrandName || !customBrandName.trim()) {
      alert('Please enter your Company / SaaS Name before placing your bid!');
      return;
    }
    if (!customWebsite || !customWebsite.trim()) {
      alert('Please enter your Website URL before placing your bid!');
      return;
    }

    if (!isSignedIn) {
      openSignIn();
      return;
    }
    onClaimOrOutbid(selectedBuilding, upgradeDifference);
  };

  return (
    <div className="w-full flex flex-col items-center font-sans text-slate-900 bg-[#f3fbf6] min-h-screen relative">

      {/* Background Landscape Image */}
      <div className="absolute top-0 left-0 right-0 h-[650px] z-0 overflow-hidden pointer-events-none bg-gradient-to-b from-emerald-100/60 via-[#f3fbf6]/80 to-[#f3fbf6]">
        <img
          src="/bg-landscape.jpg"
          alt="LandOfSaaS Background"
          className="w-full h-full object-cover opacity-30 filter brightness-105 transition-opacity duration-500"
          onError={(e) => {
            e.currentTarget.style.opacity = '0';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#f3fbf6]/30 via-transparent to-[#f3fbf6]"></div>
      </div>

      {/* ========================================================= */}
      {/* 1. TOP HEADER NAV                                         */}
      {/* ========================================================= */}
      <header className="w-full max-w-7xl px-4 md:px-8 py-4 flex items-center justify-between gap-4 z-30">
        {/* Official Product Logo & Title */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <img src="/logo.jpg" alt="LandOfSaaS Logo" className="w-10 h-10 rounded-xl object-cover shadow-md shadow-emerald-600/30 border border-white" />
          <div>
            <span className="text-lg font-black tracking-tight text-slate-900 leading-none block">LandOfSaaS</span>
            <span className="text-[10px] text-slate-500 font-semibold block tracking-normal mt-0.5">Own. Build. Get Discovered.</span>
          </div>
        </div>

        {/* Center Nav Links */}
        <nav className="hidden lg:flex items-center gap-1 font-bold text-xs text-slate-600 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full border border-emerald-100 shadow-sm">
          <a href="#world-section" className="px-3 py-1.5 hover:text-emerald-700 rounded-full transition-colors text-emerald-700 font-extrabold">Explore 3D</a>
          <button onClick={() => setActiveLegalModal('rules')} className="px-3 py-1.5 hover:text-emerald-700 rounded-full transition-colors">Rules</button>
          <a href="#how-it-works" className="px-3 py-1.5 hover:text-emerald-700 rounded-full transition-colors">How it works</a>
          <button onClick={() => setActiveLegalModal('privacy')} className="px-3 py-1.5 hover:text-emerald-700 rounded-full transition-colors">Privacy</button>
          <button onClick={() => setActiveLegalModal('terms')} className="px-3 py-1.5 hover:text-emerald-700 rounded-full transition-colors">Terms</button>
        </nav>

        {/* Right Search + User Profile Avatar */}
        <div className="flex items-center gap-3 z-30">
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

          <SignedIn>
            <div className="flex items-center gap-2">
              <UserButton />
            </div>
          </SignedIn>

          <button
            onClick={() => document.getElementById('world-section')?.scrollIntoView({ behavior: 'smooth' })}
            className="px-5 py-2 text-xs font-black text-white bg-emerald-600 hover:bg-emerald-700 rounded-full shadow-md shadow-emerald-600/30 transition-all hover:scale-105"
          >
            Get Started
          </button>
        </div>
      </header>

      {/* ========================================================= */}
      {/* 2. HERO SECTION                                           */}
      {/* ========================================================= */}
      <section className="w-full relative py-8 md:py-12 px-4 flex flex-col items-center justify-center text-center z-10">
        
        {/* Live Side Project Revenue Banner */}
        <div className="mb-4 px-5 py-2 bg-white/95 backdrop-blur-md border border-emerald-300 rounded-full text-xs font-bold text-slate-800 shadow-md flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>
            This simple side project made <strong className="text-emerald-700 font-extrabold text-sm">${totalRevenueGenerated.toLocaleString()} USD</strong> since its launch {hoursSinceLaunch} hours ago
          </span>
        </div>

        {/* Hero Title & Subtext */}
        <div className="max-w-3xl mx-auto z-10 flex flex-col items-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-tight mb-3">
            Own Your Space <br className="hidden sm:block" /> on the Internet 🌍
          </h1>

          <p className="text-sm md:text-base text-slate-700 font-semibold max-w-lg mb-6 leading-relaxed">
            Stop renting attention. Claim your 3D skyscraper space once. Get discovered forever.
          </p>

          <button
            onClick={() => document.getElementById('world-section')?.scrollIntoView({ behavior: 'smooth' })}
            className="flex items-center gap-2 px-7 py-3.5 text-sm font-black text-white bg-emerald-600 hover:bg-emerald-700 rounded-full shadow-xl shadow-emerald-600/30 transition-all hover:scale-105 mb-8"
          >
            Start Claiming Land
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Stats Bar */}
          <div className="flex items-center justify-center gap-6 md:gap-10 px-6 py-2.5 bg-white/95 backdrop-blur-md rounded-full border border-emerald-100 shadow-md text-xs font-bold text-slate-700">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-600" />
              <span><strong className="font-extrabold text-slate-900">5</strong> Founders onboard</span>
            </div>
            <div className="h-4 w-px bg-slate-200"></div>
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-600" />
              <span><strong className="font-extrabold text-slate-900">48</strong> Territory Slots</span>
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
      {/* 3. FULL-WIDTH 3D WORLD MAP (Default View)                */}
      {/* ========================================================= */}
      <section id="world-section" className="w-full relative max-w-[1440px] px-2 md:px-6 mb-16 scroll-mt-20 z-10">
        
        <div className="relative w-full h-[720px] md:h-[780px] rounded-3xl overflow-hidden border border-emerald-200/80 shadow-2xl bg-gradient-to-b from-[#bbf7d0] to-[#86efac]">

          {/* Background image fallback */}
          <div className="absolute inset-0 z-0 pointer-events-none">
            <img
              src="/bg-landscape.jpg"
              alt="Background"
              className="w-full h-full object-cover filter brightness-105 contrast-105 opacity-80 transition-opacity"
              onError={(e) => {
                e.currentTarget.style.opacity = '0';
              }}
            />
          </div>

          {/* 3D WebGL Canvas */}
          {viewMode === 'map' ? (
            <div className="relative z-10 w-full h-full">
              <WorldScene
                buildings={filteredBuildings}
                selectedBuilding={selectedBuilding}
                onSelectBuilding={(b) => {
                  onSelectBuilding(b);
                  if (b) {
                    setCustomColor(b.customColor || b.owner?.color || '#10b981');
                    setCustomLogo(b.customLogo || b.owner?.logo);
                    setCustomLogoScale(b.customLogoScale || 1.4);
                    setCustomFloors(b.floors || 16);
                    setCustomBrandName(b.owner?.name || '');
                    setCustomWebsite(b.owner?.website || '');
                  }
                }}
                filterCluster={filterCluster}
              />
            </div>
          ) : (
            <div className="relative z-10 w-full h-full overflow-y-auto p-8 bg-white/95 backdrop-blur-md">
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
                        {typeof b.owner?.logo === 'string' && b.owner.logo.startsWith('data:') ? (
                          <img src={b.owner.logo} alt="Logo" className="w-5 h-5 rounded-full object-contain" />
                        ) : (
                          <span className="text-base">🏢</span>
                        )}
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

          {/* MAP CONTROLS OVERLAY */}
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

          {/* Left Category Menu */}
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

          {/* Bottom Left Realistic Active Users */}
          <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2 px-3 py-1.5 bg-white/90 backdrop-blur-md rounded-full border border-slate-200/80 shadow-md text-xs font-bold text-slate-700">
            <div className="flex -space-x-1.5 overflow-hidden">
              <span className="inline-block h-5 w-5 rounded-full ring-2 ring-white bg-emerald-500 text-[10px] text-white font-black flex items-center justify-center">A</span>
              <span className="inline-block h-5 w-5 rounded-full ring-2 ring-white bg-blue-500 text-[10px] text-white font-black flex items-center justify-center">B</span>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span><strong className="text-slate-900 font-extrabold">5</strong> people exploring right now</span>
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
          </div>

          {/* RIGHT FLOATING INSPECTION & CUSTOMIZATION MODAL (Opens ONLY when a building is clicked) */}
          {selectedBuilding && (
            <div className="absolute top-4 right-4 z-30 max-w-sm w-full max-h-[92%] overflow-y-auto bg-white/95 backdrop-blur-2xl p-5 rounded-3xl border border-white/80 shadow-2xl text-slate-900 pointer-events-auto">
              
              {/* Card Header */}
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

              {/* 3D Render Live Preview Box */}
              <div className="relative w-full h-32 rounded-2xl bg-gradient-to-b from-slate-100 to-slate-200/80 border border-slate-300 flex items-center justify-center overflow-hidden mb-3">
                <div className="text-center">
                  <div
                    className="w-14 h-16 mx-auto rounded-lg shadow-md border border-white flex flex-col items-center justify-center text-white transition-all transform hover:scale-105"
                    style={{ backgroundColor: activeColor }}
                  >
                    {typeof activeLogo === 'string' && activeLogo.startsWith('data:') ? (
                      <img src={activeLogo} alt="Logo" className="w-7 h-7 object-contain rounded" />
                    ) : (
                      <span className="text-[9px] font-black">3D FACADE LOGO</span>
                    )}
                    <span className="text-[9px] font-black tracking-wider uppercase mt-1 opacity-90">{activeFloors}F</span>
                  </div>
                  <span className="text-[11px] font-extrabold text-slate-600 block mt-2">3D Building Preview</span>
                </div>
              </div>

              {/* Clear Pricing Breakdown (Pay Only Difference to Upgrade) */}
              <div className="bg-emerald-50/80 p-3 rounded-2xl border border-emerald-200 mb-3 space-y-1 text-xs">
                <div className="flex items-center justify-between text-slate-600 font-bold">
                  <span>Current Building Price:</span>
                  <span>${currentPrice} USD</span>
                </div>
                <div className="flex items-center justify-between text-slate-600 font-bold">
                  <span>New Target Price:</span>
                  <span>${minOutbid} USD</span>
                </div>
                <div className="flex items-center justify-between text-emerald-900 font-black pt-1 border-t border-emerald-200/60 text-sm">
                  <span>Difference to Pay Today:</span>
                  <span className="text-emerald-700">${upgradeDifference} USD</span>
                </div>
              </div>

              {/* CUSTOMIZATION OPTIONS */}
              <div className="space-y-3 pt-1 border-t border-slate-100 mb-4">
                <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-900">
                  <Palette className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Customize Building Appearance</span>
                </div>

                {/* Brand Name Input (Required) */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">
                    Company / SaaS Name <span className="text-red-500">* Required</span>
                  </label>
                  <input
                    type="text"
                    value={customBrandName}
                    onChange={(e) => {
                      setCustomBrandName(e.target.value);
                      selectedBuilding.customBrandName = e.target.value;
                    }}
                    placeholder="e.g. Acme Corp"
                    required
                    className={`w-full px-3 py-1.5 bg-slate-50 border rounded-xl text-xs font-semibold text-slate-900 focus:outline-none ${
                      !customBrandName ? 'border-amber-300 focus:border-amber-500' : 'border-slate-200 focus:border-emerald-600'
                    }`}
                  />
                </div>

                {/* Color Swatches & Flexible Visual Color Picker */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[10px] font-bold text-slate-500">Wall Color (Swatches / Visual Picker / RGB)</label>
                    <span className="text-[10px] font-mono font-bold text-slate-600">{activeColor.toUpperCase()}</span>
                  </div>

                  {/* Preset Swatches */}
                  <div className="flex items-center gap-1.5 overflow-x-auto py-1 mb-2">
                    {PRESET_COLORS.map(c => (
                      <button
                        key={c.hex}
                        onClick={() => {
                          setCustomColor(c.hex);
                          selectedBuilding.customColor = c.hex;
                        }}
                        className={`w-6 h-6 rounded-full border-2 border-white shadow-sm flex items-center justify-center transition-transform ${
                          activeColor.toLowerCase() === c.hex.toLowerCase() ? 'scale-125 ring-2 ring-emerald-600' : 'hover:scale-110'
                        }`}
                        style={{ backgroundColor: c.hex }}
                        title={c.name}
                      />
                    ))}
                  </div>

                  {/* Native Visual Color Picker + HEX input */}
                  <div className="flex items-center gap-2 mb-2">
                    <input
                      type="color"
                      value={activeColor}
                      onChange={(e) => {
                        setCustomColor(e.target.value);
                        selectedBuilding.customColor = e.target.value;
                      }}
                      className="w-9 h-8 rounded-lg cursor-pointer border border-slate-200 p-0 bg-transparent"
                    />
                    <input
                      type="text"
                      value={activeColor}
                      onChange={(e) => {
                        setCustomColor(e.target.value);
                        selectedBuilding.customColor = e.target.value;
                      }}
                      placeholder="#10b981"
                      className="flex-1 px-3 py-1 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-semibold text-slate-900 focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                </div>

                {/* Upload Company Logo File Dropzone (Renders cleanly on 4 Facades) */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">Company Logo (Renders on 4 Building Facades)</label>
                  <label className="w-full h-20 border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl bg-slate-50 hover:bg-emerald-50/50 flex flex-col items-center justify-center cursor-pointer transition-all p-2 text-center">
                    {activeLogo && typeof activeLogo === 'string' && activeLogo.startsWith('data:') ? (
                      <div className="flex items-center gap-2">
                        <img src={activeLogo} alt="Uploaded Logo" className="w-9 h-9 object-contain rounded-lg shadow-sm border bg-white" />
                        <span className="text-[11px] font-bold text-emerald-800">4-Side Facade Logo Uploaded ✓</span>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-5 h-5 text-emerald-600 mb-1" />
                        <span className="text-xs font-bold text-slate-700">Upload Company Logo Image</span>
                        <span className="text-[9px] text-slate-400 font-medium">PNG, SVG or JPG up to 2MB</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Logo Size / Scale Slider */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[10px] font-bold text-slate-500">Logo Size on Building Facades</label>
                    <span className="text-xs font-black text-emerald-700">{activeLogoScale}x</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {[
                      { scale: 1.0, label: 'Small' },
                      { scale: 1.5, label: 'Medium' },
                      { scale: 2.0, label: 'Large' },
                      { scale: 2.6, label: 'XL' }
                    ].map(tier => (
                      <button
                        key={tier.scale}
                        onClick={() => {
                          setCustomLogoScale(tier.scale);
                          selectedBuilding.customLogoScale = tier.scale;
                        }}
                        className={`flex-1 py-1 px-1.5 rounded-lg text-[10px] font-bold transition-all border ${
                          activeLogoScale === tier.scale
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {tier.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Grow Building Height (Skyscraper Towers) */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[10px] font-bold text-slate-500">Grow Tower (Floors &amp; Height)</label>
                    <span className="text-xs font-black text-emerald-700">{activeFloors} Floors</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {[
                      { floors: 8, label: 'Small (8F)', h: 4.0 },
                      { floors: 18, label: 'Medium (18F)', h: 8.0 },
                      { floors: 30, label: 'Large (30F)', h: 13.0 },
                      { floors: 48, label: 'Tower (48F)', h: 18.5 }
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

                {/* Website URL Input (Required) */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">
                    Website URL <span className="text-red-500">* Required</span>
                  </label>
                  <div className="relative">
                    <Globe className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="url"
                      value={customWebsite}
                      onChange={(e) => setCustomWebsite(e.target.value)}
                      placeholder="https://yourwebsite.com"
                      required
                      className={`w-full pl-8 pr-3 py-1.5 bg-slate-50 border rounded-xl text-xs font-semibold text-slate-900 focus:outline-none ${
                        !customWebsite ? 'border-amber-300 focus:border-amber-500' : 'border-slate-200 focus:border-emerald-600'
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* Action CTA Button */}
              <div className="space-y-2">
                <button
                  onClick={handleClaimClick}
                  disabled={isProcessingPayment}
                  className={`w-full py-3 px-4 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg transition-all ${
                    claimSuccess
                      ? 'bg-emerald-500 text-white'
                      : isProcessingPayment
                      ? 'bg-slate-400 text-white cursor-wait'
                      : selectedBuilding.status === 'owned'
                      ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/30'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30 hover:scale-[1.02]'
                  }`}
                >
                  {isProcessingPayment ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Generating Dodo Checkout Session...
                    </>
                  ) : claimSuccess ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 animate-bounce" />
                      Building Claimed &amp; Customized!
                    </>
                  ) : !isSignedIn ? (
                    <>
                      <LogIn className="w-4 h-4" />
                      Sign In &amp; Pay (${upgradeDifference})
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Pay Difference via Dodo (${upgradeDifference})
                    </>
                  )}
                </button>
              </div>

            </div>
          )}

        </div>
      </section>

      {/* ========================================================= */}
      {/* 4. SECTION: HOW IT WORKS                                  */}
      {/* ========================================================= */}
      <section id="how-it-works" className="w-full max-w-7xl px-4 py-16 text-center relative">
        <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">How It Works</h2>
        <p className="text-xs text-slate-500 font-semibold mb-12 max-w-md mx-auto">
          Simple 4-step process to claim, customize, and grow your 3D presence.
        </p>

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
              Select an unbuilt building slot and place your bid starting from $2 flat base price.
            </p>
          </div>

          <div className="p-6 bg-white rounded-3xl border border-emerald-100 shadow-sm text-left hover:shadow-md transition-shadow relative">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 font-black text-sm flex items-center justify-center mb-4">
              3
            </div>
            <h3 className="text-base font-black text-slate-900 mb-1.5">3. Customize</h3>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              Upload your company logo for 3D facades, choose wall color, website link, and grow tower height.
            </p>
          </div>

          <div className="p-6 bg-white rounded-3xl border border-emerald-100 shadow-sm text-left hover:shadow-md transition-shadow relative">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 font-black text-sm flex items-center justify-center mb-4">
              4
            </div>
            <h3 className="text-base font-black text-slate-900 mb-1.5">4. Get Discovered</h3>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              Be seen by daily visitors and grow your brand permanently in 3D.
            </p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="w-full border-t border-emerald-100 bg-white py-10 px-4 md:px-8 flex flex-col items-center justify-between gap-6 text-xs text-slate-500 font-semibold z-20">
        <div className="w-full max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-slate-900 font-black">
            <img src="/logo.jpg" alt="Logo" className="w-5 h-5 rounded object-cover" />
            <span>LandOfSaaS</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-slate-600 font-bold">
            <a href="#world-section" className="hover:text-emerald-700 transition-colors">Explore 3D</a>
            <button onClick={() => setActiveLegalModal('rules')} className="hover:text-emerald-700 transition-colors cursor-pointer">Rules of the Board</button>
            <button onClick={() => setActiveLegalModal('privacy')} className="hover:text-emerald-700 transition-colors cursor-pointer">Privacy Policy</button>
            <button onClick={() => setActiveLegalModal('terms')} className="hover:text-emerald-700 transition-colors cursor-pointer">Terms &amp; Conditions</button>
          </div>

          <div className="flex items-center gap-3 text-slate-600 font-bold text-xs">
            <span>Built by <a href="https://x.com/buildwithboo" target="_blank" rel="noopener noreferrer" className="text-emerald-700 hover:underline">@buildwithboo</a></span>
            <span>·</span>
            <a href="https://boobesh.com" target="_blank" rel="noopener noreferrer" className="text-emerald-700 hover:underline">boobesh.com</a>
            <span>·</span>
            <a href="https://www.linkedin.com/in/boobesh2912" target="_blank" rel="noopener noreferrer" className="text-emerald-700 hover:underline">LinkedIn</a>
          </div>
        </div>

        <div className="text-[11px] text-slate-400 text-center">
          © 2026 LandOfSaaS. All rights reserved. Designed &amp; built for a more open 3D internet.
        </div>
      </footer>

      {/* ========================================================= */}
      {/* 5. LEGAL MODALS (Privacy Policy, Terms, Rules)            */}
      {/* ========================================================= */}
      {activeLegalModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-2xl w-full max-h-[85vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col text-slate-900">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-emerald-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black">
                  {activeLegalModal === 'rules' && <ShieldCheck className="w-4 h-4" />}
                  {activeLegalModal === 'privacy' && <FileText className="w-4 h-4" />}
                  {activeLegalModal === 'terms' && <HelpCircle className="w-4 h-4" />}
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900">
                    {activeLegalModal === 'rules' && 'Rules of the Board — LandOfSaaS'}
                    {activeLegalModal === 'privacy' && 'Privacy Policy — LandOfSaaS'}
                    {activeLegalModal === 'terms' && 'Terms & Conditions — LandOfSaaS'}
                  </h2>
                  <span className="text-[11px] text-slate-500 font-semibold">Last updated August 25, 2026</span>
                </div>
              </div>
              <button
                onClick={() => setActiveLegalModal(null)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-700 leading-relaxed font-medium">

              {/* === RULES OF THE BOARD === */}
              {activeLegalModal === 'rules' && (
                <div className="space-y-4">
                  <p className="text-sm font-bold text-slate-800">
                    The whole system is nine rules long. Read it in a minute, then go bid.
                  </p>
                  
                  <div className="space-y-3">
                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                      <strong className="block text-emerald-800 font-black mb-1">01. Your bid is your 3D rank &amp; height</strong>
                      The board is sorted by amount paid, highest first. Higher bids build taller 3D skyscrapers. Bids start at $2 and scale up.
                    </div>

                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                      <strong className="block text-emerald-800 font-black mb-1">02. You don't need #1 to be listed</strong>
                      Bid whatever you like. If your amount is under the current leader, you land wherever it ranks (#4, #17, etc.). Everyone who pays gets a 3D slot.
                    </div>

                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                      <strong className="block text-emerald-800 font-black mb-1">03. Ties go to the latest bid</strong>
                      If two apps sit at the same amount, the one that bid most recently ranks higher.
                    </div>

                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                      <strong className="block text-emerald-800 font-black mb-1">04. Topping up costs the difference</strong>
                      Submit the same website link again with a higher amount and you're charged only the gap — not the full new price. The smallest move up is $1.
                    </div>

                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                      <strong className="block text-emerald-800 font-black mb-1">05. Ranks are permanent until outbid</strong>
                      There is no clock and no expiry. Your 3D building holds its position for as long as nobody pays more.
                    </div>

                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                      <strong className="block text-emerald-800 font-black mb-1">06. One listing per app domain</strong>
                      A website is keyed to its domain, so the same product cannot occupy two spots. Submitting it again tops up your existing building.
                    </div>

                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                      <strong className="block text-emerald-800 font-black mb-1">07. All sales are final</strong>
                      Because a bid immediately changes a public 3D ranking, payments are non-refundable except when we remove a listing ourselves.
                    </div>

                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                      <strong className="block text-emerald-800 font-black mb-1">08. What gets removed</strong>
                      Malware, scams, adult content, impersonation, and anything illegal. Removed listings are refunded.
                    </div>

                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                      <strong className="block text-emerald-800 font-black mb-1">09. Honest click counts</strong>
                      The outbound clicks to your website are counted server-side without inflation or ads.
                    </div>
                  </div>
                </div>
              )}

              {/* === PRIVACY POLICY === */}
              {activeLegalModal === 'privacy' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm mb-1">Information we collect</h3>
                    <p>
                      When you submit a product, place a bid, or customize a 3D building, we collect details you provide — such as your company name, website URL, custom wall color, logo, bid amount, and payment details needed to complete a transaction. We also collect basic usage data like outbound clicks to keep the board honest.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm mb-1">How we use it</h3>
                    <p>
                      We use your information to run the 3D bid board, process payments via Dodo Payments, display listings and 3D building rankings, and respond to support requests. Click counts are displayed publicly on the board; we never sell your personal information to third parties.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm mb-1">Payments</h3>
                    <p>
                      Payments are processed by third-party payment providers (Dodo Payments). We do not store your full payment card details on our servers.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm mb-1">Cookies and analytics</h3>
                    <p>
                      We may use cookies and analytics services to understand how the site is used, measure traffic, and improve performance.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm mb-1">Data sharing &amp; retention</h3>
                    <p>
                      We do not sell, rent, or trade your personal information. Public 3D listings remain visible until removed or outbid.
                    </p>
                  </div>

                  <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200">
                    <h3 className="font-extrabold text-emerald-900 text-sm mb-1">Your rights &amp; Contact</h3>
                    <p>
                      You may request access to, correction of, or deletion of your personal information by contacting <strong>Boobesh</strong> via:
                    </p>
                    <div className="flex flex-wrap items-center gap-3 mt-2 font-bold text-emerald-800">
                      <a href="https://boobesh.com" target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1">
                        boobesh.com <ExternalLink className="w-3 h-3" />
                      </a>
                      <a href="https://x.com/buildwithboo" target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1">
                        @buildwithboo <ExternalLink className="w-3 h-3" />
                      </a>
                      <a href="https://www.linkedin.com/in/boobesh2912" target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1">
                        LinkedIn <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* === TERMS & CONDITIONS === */}
              {activeLegalModal === 'terms' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm mb-1">Acceptance of terms</h3>
                    <p>
                      By accessing or using LandOfSaaS, you agree to be bound by these terms. If you do not agree, please do not use the service.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm mb-1">The 3D Bid Board</h3>
                    <p>
                      The board is ranked by the amount paid, highest first. Bids start at $2 and scale up. Bidding is governed by our Rules page.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm mb-1">Payments and refunds</h3>
                    <p>
                      All sales are final. Because a bid immediately changes a public 3D ranking, payments are not refundable except when we remove a listing ourselves.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm mb-1">Your content</h3>
                    <p>
                      You are responsible for the accuracy and legality of any product, link, or information you submit. You represent that you have the right to list it.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm mb-1">Removals</h3>
                    <p>
                      We may remove listings for malware, scams, adult content, impersonation, or anything illegal.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm mb-1">No warranty &amp; Limitation of liability</h3>
                    <p>
                      The service is provided "as is". LandOfSaaS is not liable for indirect or consequential damages.
                    </p>
                  </div>

                  <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200">
                    <h3 className="font-extrabold text-emerald-900 text-sm mb-1">Contact</h3>
                    <p>
                      Questions about these terms can be sent to Boobesh via:
                    </p>
                    <div className="flex flex-wrap items-center gap-3 mt-2 font-bold text-emerald-800">
                      <a href="https://boobesh.com" target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1">
                        boobesh.com <ExternalLink className="w-3 h-3" />
                      </a>
                      <a href="https://x.com/buildwithboo" target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1">
                        @buildwithboo <ExternalLink className="w-3 h-3" />
                      </a>
                      <a href="https://www.linkedin.com/in/boobesh2912" target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1">
                        LinkedIn <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500 font-semibold">
              <span>Built by <a href="https://x.com/buildwithboo" target="_blank" rel="noopener noreferrer" className="text-emerald-700 hover:underline">@buildwithboo</a> · <a href="https://boobesh.com" target="_blank" rel="noopener noreferrer" className="text-emerald-700 hover:underline">boobesh.com</a></span>
              <button
                onClick={() => setActiveLegalModal(null)}
                className="px-4 py-1.5 bg-emerald-600 text-white font-bold rounded-full hover:bg-emerald-700 transition-colors"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
