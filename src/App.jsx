import React, { useState, useEffect } from 'react';
import { UIOverlay } from './components/UIOverlay';
import { BUILDINGS_DATA } from './data/buildings';

const API_BASE = import.meta.env.VITE_API_URL || '';


export function App() {
  const [buildings, setBuildings] = useState(BUILDINGS_DATA);
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [filterCluster, setFilterCluster] = useState('all');
  const [customBrandName, setCustomBrandName] = useState('');
  const [customWebsite, setCustomWebsite] = useState('');
  const [customColor, setCustomColor] = useState('#10b981');
  const [customLogo, setCustomLogo] = useState('🚀');
  const [customFloors, setCustomFloors] = useState(14);
  const [claimSuccess, setClaimSuccess] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(true);

  // Fetch Authoritative Server State
  useEffect(() => {
    fetch(`${API_BASE}/api/buildings`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.success && Array.isArray(data.buildings)) {
          setBuildings(data.buildings);
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
        setBuildings((prev) =>
          prev.map((b) =>
            b.id === bId
              ? {
                  ...b,
                  status: 'owned',
                  owner: {
                    name: 'Verified Owner',
                    logo: '🚀',
                    website: 'https://mystartup.com',
                    color: '#10b981'
                  }
                }
              : b
          )
        );
      }

      setTimeout(() => setClaimSuccess(false), 4000);
    }
  }, []);

  // SECURE BACKEND PAYMENT INITIATION HANDLER
  const handleClaimOrOutbid = async (building) => {
    if (!building) return;

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
          customFloors,
          userId: 'user_123'
        })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        alert(`Payment session error: ${data.error || 'Failed to initialize Dodo payment session'}`);
        setIsProcessingPayment(false);
        return;
      }

      if (data.checkout_url) {
        window.location.href = data.checkout_url;
      } else {
        setClaimSuccess(true);
        setIsProcessingPayment(false);
      }
    } catch (err) {
      console.error('Payment checkout error:', err);
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
        customFloors={customFloors}
        setCustomFloors={setCustomFloors}
        onClaimOrOutbid={handleClaimOrOutbid}
        claimSuccess={claimSuccess}
        isProcessingPayment={isProcessingPayment}
        isSignedIn={isSignedIn}
        setIsSignedIn={setIsSignedIn}
      />
    </div>
  );
}

export default App;
