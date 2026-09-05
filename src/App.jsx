import React, { useState, useEffect } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { UIOverlay } from './components/UIOverlay';
import { BUILDINGS_DATA } from './data/buildings';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export function App() {
  // Top-Level Unconditional React Hooks (Strict React Rules of Hooks)
  const auth = useAuth();
  const userObj = useUser();
  const isSignedIn = auth?.isSignedIn || false;
  const userId = auth?.userId || null;
  const user = userObj?.user || null;

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
                    name: user?.firstName ? `${user.firstName}'s Startup` : 'Verified Owner',
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
  }, [user]);

  // SECURE BACKEND PAYMENT INITIATION HANDLER
  const handleClaimOrOutbid = async (building) => {
    if (!building) return;

    setIsProcessingPayment(true);

    try {
      // 1. Call Backend API (Server validates price)
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
          userId: userId || 'anonymous'
        })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        alert(`Payment session error: ${data.error || 'Failed to initialize Dodo payment session'}`);
        setIsProcessingPayment(false);
        return;
      }

      // 2. Redirect User to Dodo Payments Checkout Page
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
      />
    </div>
  );
}

export default App;
