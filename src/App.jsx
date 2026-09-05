import React, { useState } from 'react';
import { UIOverlay } from './components/UIOverlay';
import { BUILDINGS_DATA } from './data/buildings';

export function App() {
  const [buildings, setBuildings] = useState(BUILDINGS_DATA);
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [filterCluster, setFilterCluster] = useState('all');
  const [customBrandName, setCustomBrandName] = useState('');
  const [customWebsite, setCustomWebsite] = useState('');
  const [customColor, setCustomColor] = useState('#10b981');
  const [customLogo, setCustomLogo] = useState('🚀');
  const [customFloors, setCustomFloors] = useState(12);
  const [claimSuccess, setClaimSuccess] = useState(false);

  // Claim or Outbid & Customization Handler
  const handleClaimOrOutbid = (building, bidAmount) => {
    if (!building) return;

    const newOwnerName = customBrandName.trim() || 'My Startup';
    const newWebsite = customWebsite.trim() || 'https://mystartup.com';
    const newColor = customColor || '#10b981';
    const newLogo = customLogo || '🚀';
    const newFloors = customFloors || 12;

    // Calculate height based on floors (roughly 0.35 per floor)
    const newHeight = Math.max(2.4, newFloors * 0.35);

    setClaimSuccess(true);

    const updatedBuilding = {
      ...building,
      status: 'owned',
      currentPrice: bidAmount,
      customColor: newColor,
      floors: newFloors,
      height: newHeight,
      owner: {
        name: newOwnerName,
        logo: newLogo,
        website: newWebsite,
        color: newColor
      }
    };

    setBuildings((prev) =>
      prev.map((b) => (b.id === building.id ? updatedBuilding : b))
    );

    setSelectedBuilding(updatedBuilding);

    setTimeout(() => {
      setClaimSuccess(false);
    }, 2500);
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
      />
    </div>
  );
}

export default App;
