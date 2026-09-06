import React, { useRef, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { BuildingMesh } from './BuildingMesh';
import { TerrainEnvironment } from './TerrainEnvironment';
import * as THREE from 'three';

function CameraController({ is2DMode, controlsRef }) {
  const { camera } = useThree();

  useEffect(() => {
    if (!controlsRef.current) return;
    if (is2DMode) {
      camera.position.set(0, 52, 0.01);
      camera.lookAt(0, 0, 0);
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.maxPolarAngle = 0.05;
      controlsRef.current.minPolarAngle = 0;
      controlsRef.current.update();
    } else {
      camera.position.set(0, 28, 38);
      camera.lookAt(0, 0, 0);
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.maxPolarAngle = Math.PI / 2.25;
      controlsRef.current.minPolarAngle = 0;
      controlsRef.current.update();
    }
  }, [is2DMode, camera, controlsRef]);

  return null;
}

export function WorldScene({
  buildings,
  selectedBuilding,
  onSelectBuilding,
  is2DMode = false
}) {
  const controlsRef = useRef();

  // All buildings are unconditionally rendered in the 3D scene
  const filteredBuildings = buildings;

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
          position={is2DMode ? [0, 52, 0.01] : [0, 28, 38]}
          near={0.5}
          far={220}
        />

        <CameraController is2DMode={is2DMode} controlsRef={controlsRef} />

        {/* Orbit Controls */}
        <OrbitControls
          ref={controlsRef}
          enableDamping
          dampingFactor={0.06}
          enableZoom={false}
          maxPolarAngle={is2DMode ? 0.05 : Math.PI / 2.25}
          minDistance={10}
          maxDistance={80}
          target={[0, 0, 0]}
        />

        {/* Soft Fog Haze */}
        <fogExp2 attach="fog" color="#dcfce7" density={0.001} />

        {/* Lighting Setup */}
        <ambientLight intensity={0.85} color="#f0fdf4" />
        <hemisphereLight skyColor="#e0f2fe" groundColor="#166534" intensity={0.65} />

        {/* Sunlight */}
        <directionalLight
          position={[-25, 45, 25]}
          intensity={1.4}
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

        <directionalLight position={[20, 15, -20]} intensity={0.4} color="#93c5fd" />

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
