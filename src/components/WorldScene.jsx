import React, { useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { BuildingMesh } from './BuildingMesh';
import { TerrainEnvironment } from './TerrainEnvironment';
import * as THREE from 'three';

export function WorldScene({
  buildings,
  selectedBuilding,
  onSelectBuilding,
  filterCluster
}) {
  const controlsRef = useRef();

  // Filter buildings by cluster
  const filteredBuildings = buildings.filter((b) => {
    if (filterCluster === 'all') return true;
    return b.cluster === filterCluster;
  });

  return (
    <div className="w-full h-full relative">
      <Canvas
        shadows={{ type: THREE.PCFShadowMap }}
        gl={{ antialias: true, alpha: false, toneMapping: THREE.ACESFilmicToneMapping }}
        style={{ background: '#cbf3df' }}
      >
        {/* Slightly reduced tilt perspective camera */}
        <PerspectiveCamera
          makeDefault
          fov={42}
          position={[0, 28, 38]}
          near={0.5}
          far={220}
        />

        {/* Orbit Controls with smooth damping */}
        <OrbitControls
          ref={controlsRef}
          enableDamping
          dampingFactor={0.06}
          maxPolarAngle={Math.PI / 2.25}
          minDistance={12}
          maxDistance={70}
          target={[0, 0, 0]}
        />

        {/* Fog Haze */}
        <fogExp2 attach="fog" color="#cbf3df" density={0.01} />

        {/* Lighting Setup */}
        <ambientLight intensity={0.65} color="#dcfce7" />
        <hemisphereLight skyColor="#e0f2fe" groundColor="#14532d" intensity={0.5} />

        {/* Main Sunlight */}
        <directionalLight
          position={[-25, 40, 25]}
          intensity={1.25}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-near={1}
          shadow-camera-far={95}
          shadow-camera-left={-30}
          shadow-camera-right={30}
          shadow-camera-top={30}
          shadow-camera-bottom={-30}
          shadow-bias={-0.0001}
        />

        <directionalLight position={[20, 15, -20]} intensity={0.3} color="#93c5fd" />

        {/* Terrain & 5 Category Cluster Rings */}
        <TerrainEnvironment />

        {/* 3D Buildings Layer */}
        <group>
          {filteredBuildings.map((building) => (
            <BuildingMesh
              key={building.id}
              building={building}
              isSelected={selectedBuilding?.id === building.id}
              onSelect={onSelectBuilding}
            />
          ))}
        </group>
      </Canvas>
    </div>
  );
}
