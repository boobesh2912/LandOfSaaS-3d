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
        gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping }}
        style={{ background: 'transparent' }}
      >
        {/* Camera Setup */}
        <PerspectiveCamera
          makeDefault
          fov={42}
          position={[0, 28, 38]}
          near={0.5}
          far={220}
        />

        {/* Orbit Controls: enableZoom={false} allows natural page wheel scrolling */}
        <OrbitControls
          ref={controlsRef}
          enableDamping
          dampingFactor={0.06}
          enableZoom={false}
          maxPolarAngle={Math.PI / 2.25}
          minDistance={12}
          maxDistance={70}
          target={[0, 0, 0]}
        />

        {/* Soft Fog Haze */}
        <fogExp2 attach="fog" color="#dcfce7" density={0.008} />

        {/* Lighting Setup */}
        <ambientLight intensity={0.7} color="#f0fdf4" />
        <hemisphereLight skyColor="#e0f2fe" groundColor="#166534" intensity={0.55} />

        {/* Sunlight */}
        <directionalLight
          position={[-25, 45, 25]}
          intensity={1.3}
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

        <directionalLight position={[20, 15, -20]} intensity={0.35} color="#93c5fd" />

        {/* Terrain & Category Cluster Rings */}
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
