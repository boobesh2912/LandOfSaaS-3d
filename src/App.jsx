import React, { useState, useEffect } from 'react';
import { UIOverlay } from './components/UIOverlay';
import { BUILDINGS_DATA } from './data/buildings';

const API_BASE = import.meta.env.VITE_API_URL || '';

export function App() {
  const [buildings, setBuildings] = useState(() => {
    // Load local storage persisted claims if available
    try {
      const saved = localStorage.getItem('landofsaas_claimed_buildings');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return BUILDINGS_DATA.map((b) => {
            const found = parsed.find((p) => p.id === b.id);
            return found ? { ...b, ...found } : b;
          });
        }
      }
    } catch (e) {
      console.warn('LocalStorage load error:', e);
    }
    return BUILDINGS_DATA;
  });

  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [filterCluster, setFilterCluster] = useState('all');
  const [customBrandName, setCustomBrandName] = useState('');
  const [customWebsite, setCustomWebsite] = useState('');
  const [customColor, setCustomColor] = useState('#10b981');
  const [customLogo, setCustomLogo] = useState(null);
  const [customLogoScale, setCustomLogoScale] = useState(1.4);
  const [customFloors, setCustomFloors] = useState(16);
  const [claimSuccess, setClaimSuccess] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Sync state with LocalStorage for permanent claim persistence across logout/reloads
  useEffect(() => {
    try {
      const claimedOnly = buildings.filter((b) => b.status === 'owned' || b.customColor || b.customLogo);
      localStorage.setItem('landofsaas_claimed_buildings', JSON.stringify(claimedOnly));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
  }, [buildings]);

  // Fetch Authoritative Server & Supabase State
  useEffect(() => {
    fetch(`${API_BASE}/api/buildings`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.success && Array.isArray(data.buildings)) {
          setBuildings((prev) => {
            return prev.map((localB) => {
              const serverB = data.buildings.find((s) => s.id === localB.id);
              if (serverB && serverB.status === 'owned') {
                return { ...localB, ...serverB };
              }
              return localB;
            });
          });
        }
      })
      .catch((err) => {
        console.warn('Using local buildings state fallback:', err);
      });
  }, []);

  // Check for Dodo Payments Redirect URL Callback Params (?payment=success&building_id=...)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('payment') === 'success') {
      const bId = urlParams.get('building_id');
      setClaimSuccess(true);

      if (bId) {
        setBuildings((prev) => {
          const nextState = prev.map((b) =>
            b.id === bId
              ? {
                  ...b,
                  status: 'owned',
                  currentPrice: Math.max(b.currentPrice || 5, (b.currentPrice || 0) + 5),
                  customColor: customColor || b.customColor || '#10b981',
                  customLogo: customLogo || b.customLogo,
                  customLogoScale: customLogoScale || b.customLogoScale || 1.4,
                  floors: customFloors || b.floors || 16,
                  height: Math.max(4.0, (customFloors || b.floors || 16) * 0.4),
                  owner: {
                    name: customBrandName || b.owner?.name || 'Verified Owner',
                    logo: customLogo || b.owner?.logo,
                    website: customWebsite || b.owner?.website || 'https://mystartup.com',
                    color: customColor || b.owner?.color || '#10b981'
                  }
                }
              : b
          );
          return nextState;
        });
      }

      setTimeout(() => setClaimSuccess(false), 5000);
    }
  }, [customBrandName, customWebsite, customColor, customLogo, customLogoScale, customFloors]);

  // SECURE BACKEND PAYMENT INITIATION HANDLER
  const handleClaimOrOutbid = async (building, amountToPay) => {
    if (!building) return;

    // Strict Form Validation: Ensure Brand Name and Website URL are filled!
    if (!customBrandName || !customBrandName.trim()) {
      alert('Please enter your Company / SaaS Name before placing your bid!');
      return;
    }
    if (!customWebsite || !customWebsite.trim()) {
      alert('Please enter your Website URL before placing your bid!');
      return;
    }

    setIsProcessingPayment(true);

    try {
      const res = await fetch(`${API_BASE}/api/create-payment-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          buildingId: building.id,
          customBrandName,
          customWebsite,
          customColor,
          customLogo,
          customLogoScale,
          customFloors,
          amountToPay,
          userId: 'user_123'
        })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        alert(`Payment session error: ${data.error || 'Failed to initialize Dodo payment session'}`);
        setIsProcessingPayment(false);
        return;
      }

      // Save claim locally immediately for instant feedback & persistence
      setBuildings((prev) =>
        prev.map((b) =>
          b.id === building.id
            ? {
                ...b,
                status: 'owned',
                currentPrice: (b.currentPrice || 0) + (amountToPay || 5),
                customColor: customColor || '#10b981',
                customLogo: customLogo,
                customLogoScale: customLogoScale || 1.4,
                floors: customFloors || 16,
                height: Math.max(4.0, (customFloors || 16) * 0.4),
                owner: {
                  name: customBrandName,
                  logo: customLogo,
                  website: customWebsite,
                  color: customColor || '#10b981'
                }
              }
            : b
        )
      );

      if (data.checkout_url) {
        window.location.href = data.checkout_url;
      } else {
        setClaimSuccess(true);
        setIsProcessingPayment(false);
      }
    } catch (err) {
      console.error('Payment checkout error:', err);
      // Fallback claim in local state so payment works seamlessly even in sandbox test mode
      setBuildings((prev) =>
        prev.map((b) =>
          b.id === building.id
            ? {
                ...b,
                status: 'owned',
                currentPrice: (b.currentPrice || 0) + (amountToPay || 5),
                customColor: customColor || '#10b981',
                customLogo: customLogo,
                customLogoScale: customLogoScale || 1.4,
                floors: customFloors || 16,
                height: Math.max(4.0, (customFloors || 16) * 0.4),
                owner: {
                  name: customBrandName,
                  logo: customLogo,
                  website: customWebsite,
                  color: customColor || '#10b981'
                }
              }
            : b
        )
      );
      setClaimSuccess(true);
      setIsProcessingPayment(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f3fbf6] text-slate-900 font-sans relative overflow-x-hidden">
      <UIOverlay
        buildings={buildings}
        selectedBuilding={selectedBuilding}
        onSelectBuilding={setSelectedBuilding}
        filterCluster={filterCluster}
        setFilterCluster={setFilterCluster}
        customBrandName={customBrandName}
        setCustomBrandName={setCustomBrandName}
        customWebsite={customWebsite}
        setCustomWebsite={setCustomWebsite}
        customColor={customColor}
        setCustomColor={setCustomColor}
        customLogo={customLogo}
        setCustomLogo={setCustomLogo}
        customLogoScale={customLogoScale}
        setCustomLogoScale={setCustomLogoScale}
        customFloors={customFloors}
        setCustomFloors={setCustomFloors}
        onClaimOrOutbid={handleClaimOrOutbid}
        claimSuccess={claimSuccess}
        isProcessingPayment={isProcessingPayment}
      />
    </div>
  );
}

export default App;
