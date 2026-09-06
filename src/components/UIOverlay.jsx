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
  AlertCircle,
  Menu
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
  const [viewMode, setViewMode] = useState('3d'); // '3d' | '2d' | 'list'
  const [searchQuery, setSearchQuery] = useState('');
  const [zoomLevel, setZoomLevel] = useState(100);
  const [activeLegalModal, setActiveLegalModal] = useState(null); // 'privacy' | 'terms' | 'rules' | null
  const [notificationModal, setNotificationModal] = useState(null); // { title: string, message: string, type: 'error' | 'success' | 'info' }
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

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

  // Filter buildings by search query
  const filteredBuildings = buildings.filter((b) => {
    return (
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.owner?.name && b.owner.name.toLowerCase().includes(searchQuery.toLowerCase()))
    );
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
      setNotificationModal({
        title: 'Image File Too Large',
        message: 'Please upload an image file smaller than 2MB in size.',
        type: 'error'
      });
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
        setNotificationModal({
          title: 'Logo Uploaded Successfully! 🖼️',
          message: 'Your logo has been applied to all 4 faces of your 3D building tower.',
          type: 'success'
        });
      }
    };
    reader.readAsDataURL(file);
  };

  // Claim / Upgrade Action Handler with Strict Form Validation & Clerk Auth
  const handleClaimClick = () => {
    if (!customBrandName || !customBrandName.trim()) {
      setNotificationModal({
        title: 'Company / SaaS Name Required',
        message: 'Please type your official Company or SaaS Name before placing your bid.',
        type: 'error'
      });
      return;
    }
    if (!customWebsite || !customWebsite.trim()) {
      setNotificationModal({
        title: 'Website URL Required',
        message: 'Please enter a valid website URL (e.g. https://yourwebsite.com) before placing your bid.',
        type: 'error'
      });
      return;
    }

    if (!isSignedIn) {
      openSignIn();
      return;
    }
    onClaimOrOutbid(selectedBuilding, upgradeDifference);
  };

  return (
    <div className="w-full flex flex-col items-center font-sans text-slate-900 bg-[#f3fbf6] min-h-screen relative overflow-x-hidden">

      {/* Background Landscape Image (Full visibility around 3D island) */}
      <div className="absolute top-0 left-0 right-0 h-[680px] z-0 overflow-hidden pointer-events-none bg-gradient-to-b from-emerald-100/40 via-[#f3fbf6]/60 to-[#f3fbf6]">
        <img
          src="/bg-landscape.jpg"
          alt="LandOfSaaS Background"
          className="w-full h-full object-cover filter brightness-110 contrast-110 opacity-95 transition-all duration-500"
          onError={(e) => {
            e.currentTarget.style.opacity = '0';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#f3fbf6]"></div>
      </div>

      {/* ========================================================= */}
      {/* 1. TOP HEADER NAV (Fully Responsive Header for Mobile & Tab)*/}
      {/* ========================================================= */}
      <header className="w-full max-w-7xl px-3 sm:px-6 md:px-8 py-3.5 flex items-center justify-between gap-2 z-30">
        {/* Official Product Logo & Title on Left */}
        <div className="flex items-center gap-2.5 cursor-pointer shrink-0" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <img src="/logo.jpg" alt="LandOfSaaS Logo" className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl object-cover shadow-md shadow-emerald-600/30 border border-white" />
          <div>
            <span className="text-base sm:text-lg font-black tracking-tight text-slate-900 leading-none block">LandOfSaaS</span>
            <span className="text-[9px] sm:text-[10px] text-slate-500 font-semibold block tracking-normal mt-0.5">Own. Build. Get Discovered.</span>
          </div>
        </div>

        {/* Desktop Header Navigation Menu (md+ screens) */}
        <div className="hidden md:flex items-center gap-3 ml-auto">
          <nav className="flex items-center gap-1 font-bold text-xs text-slate-600 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full border border-emerald-100 shadow-sm">
            <a href="#world-section" className="px-3 py-1 hover:text-emerald-700 rounded-full transition-colors text-emerald-700 font-extrabold whitespace-nowrap">Explore 3D</a>
            <button onClick={() => setActiveLegalModal('rules')} className="px-3 py-1 hover:text-emerald-700 rounded-full transition-colors whitespace-nowrap">Rules</button>
            <a href="#how-it-works" className="px-3 py-1 hover:text-emerald-700 rounded-full transition-colors whitespace-nowrap">How it works</a>
            <button onClick={() => setActiveLegalModal('privacy')} className="px-3 py-1 hover:text-emerald-700 rounded-full transition-colors whitespace-nowrap">Privacy</button>
            <button onClick={() => setActiveLegalModal('terms')} className="px-3 py-1 hover:text-emerald-700 rounded-full transition-colors whitespace-nowrap">Terms</button>
          </nav>

          <SignedIn>
            <div className="flex items-center gap-2">
              <UserButton />
            </div>
          </SignedIn>
        </div>

        {/* Mobile & Tablet Controls (< md screens) */}
        <div className="flex md:hidden items-center gap-2 shrink-0">
          <SignedIn>
            <UserButton />
          </SignedIn>
          <button
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            className="p-2 bg-white/90 backdrop-blur-md rounded-xl border border-slate-200 shadow-sm text-slate-700 hover:text-emerald-600 focus:outline-none"
            aria-label="Toggle Navigation Menu"
          >
            {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Dropdown Navigation Bar */}
      {mobileNavOpen && (
        <div className="w-full max-w-7xl px-4 md:hidden z-30 mb-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col gap-1 p-3 bg-white/95 backdrop-blur-xl rounded-2xl border border-slate-200 shadow-xl text-xs font-bold text-slate-700">
            <a
              href="#world-section"
              onClick={() => setMobileNavOpen(false)}
              className="px-3 py-2.5 hover:bg-emerald-50 rounded-xl text-emerald-700 font-extrabold flex items-center justify-between"
            >
              <span>Explore 3D Map</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
            <button
              onClick={() => { setActiveLegalModal('rules'); setMobileNavOpen(false); }}
              className="px-3 py-2.5 text-left hover:bg-slate-50 rounded-xl transition-colors"
            >
              Rules of the Board
            </button>
            <a
              href="#how-it-works"
              onClick={() => setMobileNavOpen(false)}
              className="px-3 py-2.5 hover:bg-slate-50 rounded-xl transition-colors"
            >
              How It Works
            </a>
            <button
              onClick={() => { setActiveLegalModal('privacy'); setMobileNavOpen(false); }}
              className="px-3 py-2.5 text-left hover:bg-slate-50 rounded-xl transition-colors"
            >
              Privacy Policy
            </button>
            <button
              onClick={() => { setActiveLegalModal('terms'); setMobileNavOpen(false); }}
              className="px-3 py-2.5 text-left hover:bg-slate-50 rounded-xl transition-colors"
            >
              Terms &amp; Conditions
            </button>
          </nav>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. HERO SECTION (Fully Mobile & Tablet Responsive)       */}
      {/* ========================================================= */}
      <section className="w-full relative py-6 sm:py-10 md:py-12 px-3 sm:px-4 flex flex-col items-center justify-center text-center z-10">
        
        {/* Live Side Project Revenue Banner */}
        <div className="mb-4 px-3.5 sm:px-5 py-1.5 sm:py-2 bg-white/95 backdrop-blur-md border border-emerald-300 rounded-full text-[11px] sm:text-xs font-bold text-slate-800 shadow-md flex items-center gap-2 max-w-[95%]">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
          <span className="leading-snug">
            This simple side project made <strong className="text-emerald-700 font-extrabold text-xs sm:text-sm">${totalRevenueGenerated.toLocaleString()} USD</strong> since launch {hoursSinceLaunch}h ago
          </span>
        </div>

        {/* Hero Title & Subtext */}
        <div className="max-w-3xl mx-auto z-10 flex flex-col items-center px-2">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-tight mb-3">
            Own Your Space <br className="hidden sm:block" /> on the Internet 🌍
          </h1>

          <p className="text-xs sm:text-base text-slate-700 font-semibold max-w-sm sm:max-w-lg mb-6 leading-relaxed">
            Stop renting attention. Claim your 3D skyscraper space once. Get discovered forever.
          </p>

          <button
            onClick={() => document.getElementById('world-section')?.scrollIntoView({ behavior: 'smooth' })}
            className="flex items-center gap-2 px-6 sm:px-7 py-3 sm:py-3.5 text-xs sm:text-sm font-black text-white bg-emerald-600 hover:bg-emerald-700 rounded-full shadow-xl shadow-emerald-600/30 transition-all hover:scale-105 mb-6 sm:mb-8"
          >
            Start Claiming Land
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Stats Bar (Stacked on Mobile, Horizontal on Desktop/Tablet) */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-6 md:gap-10 px-5 sm:px-6 py-2.5 bg-white/95 backdrop-blur-md rounded-2xl sm:rounded-full border border-emerald-100 shadow-md text-xs font-bold text-slate-700 w-full sm:w-auto">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-600" />
              <span><strong className="font-extrabold text-slate-900">5</strong> Founders onboard</span>
            </div>
            <div className="hidden sm:block h-4 w-px bg-slate-200"></div>
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-600" />
              <span><strong className="font-extrabold text-slate-900">48</strong> Territory Slots</span>
            </div>
            <div className="hidden sm:block h-4 w-px bg-slate-200"></div>
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
              className="w-full h-full object-cover filter brightness-110 contrast-110 opacity-90 transition-opacity"
              onError={(e) => {
                e.currentTarget.style.opacity = '0';
              }}
            />
          </div>

          {/* 3D or 2D WebGL Canvas / List View */}
          {viewMode === '3d' || viewMode === '2d' ? (
            <div className="relative z-10 w-full h-full">
              <WorldScene
                buildings={filteredBuildings}
                selectedBuilding={selectedBuilding}
                is2DMode={viewMode === '2d'}
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
            <div className="relative z-10 w-full h-full overflow-y-auto p-4 sm:p-8 bg-white/95 backdrop-blur-md">
              <h3 className="text-lg sm:text-xl font-black text-slate-900 mb-4">All Available &amp; Owned Territory Slots</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {filteredBuildings.map(b => (
                  <div
                    key={b.id}
                    onClick={() => {
                      onSelectBuilding(b);
                      setViewMode('3d');
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

          {/* MAP CONTROLS OVERLAY (3D | 2D | List) */}
          <div className="absolute top-4 left-4 z-20 flex items-center gap-1 bg-white/90 backdrop-blur-md p-1 rounded-2xl border border-slate-200/80 shadow-md max-w-[calc(100%-2rem)] overflow-x-auto">
            <button
              onClick={() => setViewMode('3d')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                viewMode === '3d'
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              3D View
            </button>
            <button
              onClick={() => setViewMode('2d')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                viewMode === '2d'
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              2D Map
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                viewMode === 'list'
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <ListFilter className="w-3.5 h-3.5" />
              List View
            </button>
          </div>

          {/* Bottom Left Realistic Active Users */}
          <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2 px-3 py-1.5 bg-white/90 backdrop-blur-md rounded-full border border-slate-200/80 shadow-md text-xs font-bold text-slate-700">
            <div className="flex -space-x-1.5 overflow-hidden">
              <span className="inline-block h-5 w-5 rounded-full ring-2 ring-white bg-emerald-500 text-[10px] text-white font-black flex items-center justify-center">A</span>
              <span className="inline-block h-5 w-5 rounded-full ring-2 ring-white bg-blue-500 text-[10px] text-white font-black flex items-center justify-center">B</span>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span><strong className="text-slate-900 font-extrabold">5</strong> active visitors</span>
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
            <div className="fixed inset-x-0 bottom-0 sm:absolute sm:inset-auto sm:top-4 sm:right-4 z-40 max-w-full sm:max-w-sm w-full max-h-[85vh] sm:max-h-[92%] overflow-y-auto bg-white/95 backdrop-blur-2xl p-4 sm:p-5 rounded-t-3xl sm:rounded-3xl border border-slate-200/80 sm:border-white/80 shadow-2xl text-slate-900 pointer-events-auto transition-all">
              
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
                <div className="space-y-5 text-xs font-medium text-slate-700">
                  <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-950 font-semibold">
                    <p className="text-sm font-black text-emerald-900 mb-1">Welcome to the Official LandOfSaaS Board Rules</p>
                    LandOfSaaS operates on an open, transparent, real-time bidding model for 3D digital skyscraper real estate. Every founder who bids gets a permanent 3D building slot. Below are the governing rules for all listings.
                  </div>
                  
                  <div className="space-y-4">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                      <strong className="block text-emerald-800 font-black text-sm mb-1">01. Bid Amounts Determine 3D Skyscraper Height &amp; Ranking</strong>
                      <p>The 3D world board ranks listings strictly by the cumulative total bid amount paid, sorted from highest to lowest. Higher bid values automatically scale your building into taller skyscraper towers (from 8 floors up to 48-floor supertowers) with primary visual prominence on the island map.</p>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                      <strong className="block text-emerald-800 font-black text-sm mb-1">02. Permanent Slot Ownership Until Outbid</strong>
                      <p>There are no recurring monthly subscription fees, hidden upkeep costs, or expiration timers. Once you claim a building slot, your company logo, wall color, facade textures, and website link remain permanently active on the board until another founder places a higher outbid on that specific slot.</p>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                      <strong className="block text-emerald-800 font-black text-sm mb-1">03. Pay-Only-Difference Outbid &amp; Top-Up Upgrades</strong>
                      <p>If you choose to increase your bid or reclaim an existing building slot, you are charged <strong>only the price difference</strong> between the current minimum bid and your previous payment amount—never the full price again. Minimum bid increments start at +$1 to +$5 USD above the current valuation.</p>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                      <strong className="block text-emerald-800 font-black text-sm mb-1">04. 4-Sided 3D Facade Logo Rendering &amp; Color Customization</strong>
                      <p>Every claimed building renders the owner's official company logo on all 4 exterior building facade walls using WebGL depth buffers to prevent bleed-through. Owners have full real-time control over wall color swatches, visual hex pickers, logo scaling (Small to XL), and tower floor height.</p>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                      <strong className="block text-emerald-800 font-black text-sm mb-1">05. Single Domain Keying &amp; Tie-Breaker Logic</strong>
                      <p>Each unique SaaS or website URL domain is keyed to a single building slot to prevent duplicate spam listings. In the rare event of identical total bid amounts across different buildings, the slot with the most recent transaction timestamp ranks higher.</p>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                      <strong className="block text-emerald-800 font-black text-sm mb-1">06. Strict Content Moderation &amp; Prohibited Content</strong>
                      <p>Listings promoting malware, phishing scams, illegal services, adult/pornographic material, hate speech, violent content, or unauthorized brand impersonation are strictly forbidden. Any prohibited listing will be immediately removed by administrators, and valid funds will be refunded.</p>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                      <strong className="block text-emerald-800 font-black text-sm mb-1">07. Refund Policy &amp; Final Sales</strong>
                      <p>Because bidding instantly updates real-time public WebGL rankings and gives immediate global visibility, all successful bid payments are final and non-refundable, except in cases where a listing is taken down by administrators for policy moderation.</p>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                      <strong className="block text-emerald-800 font-black text-sm mb-1">08. Server-Side Direct Click Tracking Integrity</strong>
                      <p>All outbound clicks from 3D buildings to founder websites are tracked directly on the server without artificial inflation, bot traffic, ad popups, or middleman redirects, ensuring authentic traffic reporting.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* === PRIVACY POLICY === */}
              {activeLegalModal === 'privacy' && (
                <div className="space-y-4 text-xs font-medium text-slate-700">
                  <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-950 font-semibold">
                    <p className="text-sm font-black text-emerald-900 mb-1">LandOfSaaS Privacy Policy &amp; Data Protection</p>
                    Effective Date: August 25, 2026. We respect your privacy and are committed to protecting the information you share with us.
                  </div>

                  <div className="space-y-3">
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-sm mb-1">1. Information We Collect</h3>
                      <p className="mb-2">When you interact with LandOfSaaS, submit a product bid, or customize a 3D building slot, we collect the following categories of information:</p>
                      <ul className="list-disc pl-5 space-y-1 text-slate-600">
                        <li><strong>Account &amp; Auth Information:</strong> Email address, user ID, and profile details managed securely through Clerk Authentication.</li>
                        <li><strong>Building Customization Data:</strong> Company/SaaS name, official website URL, custom wall color hex values, building floor height, logo scale settings, and uploaded company logo image files.</li>
                        <li><strong>Transaction &amp; Billing Data:</strong> Payment session IDs, bid amounts, currency, and payment timestamps processed securely via Dodo Payments. We do not store raw credit card numbers.</li>
                        <li><strong>Analytics &amp; Usage Data:</strong> Server-side outbound click events, visitor counts, IP address logs (for rate limiting and anti-abuse), and browser type.</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="font-extrabold text-slate-900 text-sm mb-1">2. How We Use Your Information</h3>
                      <ul className="list-disc pl-5 space-y-1 text-slate-600">
                        <li>To render your customized 3D building tower, logo facades, and company information publicly on the LandOfSaaS interactive map.</li>
                        <li>To verify payment sessions via Dodo Payments webhooks and synchronize database claim state in Supabase.</li>
                        <li>To track authentic outbound clicks to founder websites and present aggregated traffic statistics.</li>
                        <li>To prevent security threats, DDOS attacks, automated bot spam, and illegal content submissions.</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="font-extrabold text-slate-900 text-sm mb-1">3. Third-Party Data Service Providers</h3>
                      <p>We integrate with trusted enterprise infrastructure providers:</p>
                      <ul className="list-disc pl-5 space-y-1 text-slate-600">
                        <li><strong>Clerk:</strong> User authentication and identity management.</li>
                        <li><strong>Supabase:</strong> Encrypted backend database storage for building state and claims.</li>
                        <li><strong>Dodo Payments:</strong> Merchant of Record &amp; PCI-compliant payment gateway processing.</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="font-extrabold text-slate-900 text-sm mb-1">4. Data Retention &amp; Founder Control Rights</h3>
                      <p>Public building listings remain visible on the board as long as the slot is claimed. You have the right to request access to your stored personal data, request corrections to your listing, or request complete account/data deletion by contacting us directly.</p>
                    </div>

                    <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200">
                      <h3 className="font-extrabold text-emerald-900 text-sm mb-1">Privacy Contact &amp; Inquiries</h3>
                      <p>For any privacy requests or data removal inquiries, please reach out to Boobesh:</p>
                      <div className="flex flex-wrap items-center gap-3 mt-2 font-bold text-emerald-800">
                        <a href="https://boobesh.com" target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1">boobesh.com <ExternalLink className="w-3 h-3" /></a>
                        <a href="https://x.com/buildwithboo" target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1">@buildwithboo <ExternalLink className="w-3 h-3" /></a>
                        <a href="https://www.linkedin.com/in/boobesh2912" target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1">LinkedIn <ExternalLink className="w-3 h-3" /></a>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* === TERMS & CONDITIONS === */}
              {activeLegalModal === 'terms' && (
                <div className="space-y-4 text-xs font-medium text-slate-700">
                  <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-950 font-semibold">
                    <p className="text-sm font-black text-emerald-900 mb-1">LandOfSaaS Terms and Conditions of Service</p>
                    Please read these Terms carefully before using the LandOfSaaS platform, claiming 3D building slots, or submitting payments.
                  </div>

                  <div className="space-y-3">
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-sm mb-1">1. Acceptance of Terms</h3>
                      <p>By accessing LandOfSaaS, connecting an account, placing a bid, or uploading company assets, you agree to be bound by these Terms and Conditions and our Board Rules. If you do not agree to these terms, you must refrain from using the platform.</p>
                    </div>

                    <div>
                      <h3 className="font-extrabold text-slate-900 text-sm mb-1">2. Digital Building Space License</h3>
                      <p>Claiming or bidding on a 3D building slot grants you a non-exclusive, revocable, worldwide license to display your SaaS logo, company name, custom wall colors, and outbound website hyperlink on the LandOfSaaS interactive 3D map. This does not convey underlying intellectual property rights in the software, 3D models, or platform architecture.</p>
                    </div>

                    <div>
                      <h3 className="font-extrabold text-slate-900 text-sm mb-1">3. Payments, Bids &amp; No-Refund Policy</h3>
                      <p>All bids and payment transactions are processed securely through Dodo Payments in USD. Because bids immediately update 3D WebGL scene geometry and public search rankings, <strong>all payments are strictly final and non-refundable</strong>, except in instances where a listing is removed by platform moderators for policy violations.</p>
                    </div>

                    <div>
                      <h3 className="font-extrabold text-slate-900 text-sm mb-1">4. User Content &amp; Intellectual Property Warranties</h3>
                      <p>You represent and warrant that you own or possess all necessary rights, trademarks, licenses, and permissions to use and display the company logos, brand names, and website URLs submitted to LandOfSaaS. You agree not to upload copyrighted images without authorization or impersonate third-party businesses.</p>
                    </div>

                    <div>
                      <h3 className="font-extrabold text-slate-900 text-sm mb-1">5. Platform Moderation &amp; Termination</h3>
                      <p>LandOfSaaS reserves the right to review, suspend, or remove any building listing or user account that violates content policies (including malware, deceptive software, illegal services, adult content, or hate speech) at its sole discretion.</p>
                    </div>

                    <div>
                      <h3 className="font-extrabold text-slate-900 text-sm mb-1">6. Disclaimer of Warranties &amp; Limitation of Liability</h3>
                      <p>The LandOfSaaS platform and 3D map services are provided on an "AS IS" and "AS AVAILABLE" basis without warranties of any kind, express or implied. LandOfSaaS is not liable for any indirect, incidental, consequential, or punitive damages resulting from site uptime, server maintenance, or traffic fluctuations.</p>
                    </div>

                    <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200">
                      <h3 className="font-extrabold text-emerald-900 text-sm mb-1">Questions &amp; Legal Notices</h3>
                      <p>For official legal correspondence or terms inquiries, please contact Boobesh:</p>
                      <div className="flex flex-wrap items-center gap-3 mt-2 font-bold text-emerald-800">
                        <a href="https://boobesh.com" target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1">boobesh.com <ExternalLink className="w-3 h-3" /></a>
                        <a href="https://x.com/buildwithboo" target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1">@buildwithboo <ExternalLink className="w-3 h-3" /></a>
                        <a href="https://www.linkedin.com/in/boobesh2912" target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1">LinkedIn <ExternalLink className="w-3 h-3" /></a>
                      </div>
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

      {/* ========================================================= */}
      {/* 6. NOTIFICATION POPUP MODAL                               */}
      {/* ========================================================= */}
      {notificationModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white max-w-md w-full rounded-3xl shadow-2xl overflow-hidden border border-slate-100 text-slate-900 transform transition-all scale-100 p-6 flex flex-col items-center text-center">
            
            {/* Notification Icon */}
            <div className={`w-14 h-14 rounded-2xl mb-4 flex items-center justify-center font-black shadow-lg ${
              notificationModal.type === 'error'
                ? 'bg-rose-100 text-rose-600 shadow-rose-600/20'
                : notificationModal.type === 'success'
                ? 'bg-emerald-100 text-emerald-700 shadow-emerald-600/20'
                : 'bg-blue-100 text-blue-700 shadow-blue-600/20'
            }`}>
              {notificationModal.type === 'error' && <AlertCircle className="w-7 h-7" />}
              {notificationModal.type === 'success' && <CheckCircle2 className="w-7 h-7" />}
              {notificationModal.type === 'info' && <Sparkles className="w-7 h-7" />}
            </div>

            {/* Notification Title & Message */}
            <h3 className="text-lg font-black text-slate-900 mb-2">{notificationModal.title}</h3>
            <p className="text-xs text-slate-600 font-semibold leading-relaxed mb-6">
              {notificationModal.message}
            </p>

            {/* Close CTA Button */}
            <button
              onClick={() => setNotificationModal(null)}
              className={`w-full py-3 px-6 rounded-2xl font-extrabold text-xs text-white shadow-md transition-all hover:scale-[1.02] ${
                notificationModal.type === 'error'
                  ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/30'
                  : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30'
              }`}
            >
              Understand &amp; Continue
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
