import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

export function BuildingMesh({ building, isSelected, onSelect }) {
  const groupRef = useRef();
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);

  const {
    name,
    position,
    width,
    height,
    depth,
    status,
    owner,
    accentColor = '#10b981',
    customColor,
    tier,
    badgeLabel,
    floors = 12
  } = building;

  // Smooth lerp hover lift animation
  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const targetY = (hovered ? 0.6 : 0) + (isSelected ? 0.4 : 0);
    groupRef.current.position.y = THREE.MathUtils.lerp(
      groupRef.current.position.y,
      position[1] + targetY,
      delta * 8
    );
  });

  // Base slab dimensions
  const slabWidth = width + 0.5;
  const slabDepth = depth + 0.5;
  const slabHeight = 0.2;

  // Building color customization priority: customColor -> owner color -> accentColor -> default green
  const baseColor = customColor || (status === 'owned' && owner?.color ? owner.color : accentColor || '#10b981');

  return (
    <group
      ref={groupRef}
      position={[position[0], position[1], position[2]]}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        setHovered(false);
        document.body.style.cursor = 'auto';
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(building);
      }}
    >
      {/* Selection / Hover Glowing Ring on Ground */}
      {(isSelected || hovered) && (
        <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[slabWidth * 0.6, slabWidth * 0.95, 32]} />
          <meshBasicMaterial
            color={isSelected ? '#10b981' : '#6ee7b7'}
            transparent
            opacity={isSelected ? 0.85 : 0.45}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* Foundation Base Slab */}
      <mesh position={[0, slabHeight / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[slabWidth, slabHeight, slabDepth]} />
        <meshStandardMaterial
          color="#334155"
          roughness={0.4}
          metalness={0.2}
        />
      </mesh>

      {/* Main 3D Building Tower Body */}
      <mesh
        ref={meshRef}
        position={[0, height / 2 + slabHeight, 0]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial
          color={baseColor}
          roughness={0.3}
          metalness={0.2}
          emissive={hovered ? baseColor : (isSelected ? '#047857' : '#000000')}
          emissiveIntensity={hovered ? 0.4 : (isSelected ? 0.25 : 0)}
        />
      </mesh>

      {/* Glass Window Lines / Stripe Accent Layers */}
      <mesh position={[0, height / 2 + slabHeight, 0]}>
        <boxGeometry args={[width * 1.02, height * 0.88, depth * 0.98]} />
        <meshStandardMaterial
          color="#f0fdf4"
          emissive="#6ee7b7"
          emissiveIntensity={hovered ? 0.5 : 0.2}
          transparent
          opacity={0.35}
        />
      </mesh>

      {/* Top Roof Structure & Spire Antenna */}
      <mesh position={[0, height + slabHeight + 0.3, 0]} castShadow>
        <boxGeometry args={[width * 0.7, 0.6, depth * 0.7]} />
        <meshStandardMaterial color="#1e293b" roughness={0.3} metalness={0.4} />
      </mesh>

      {/* Spire Antenna for Large Towers */}
      {height >= 7 && (
        <mesh position={[0, height + slabHeight + 1.2, 0]}>
          <cylinderGeometry args={[0.05, 0.15, 1.2, 16]} />
          <meshStandardMaterial
            color={baseColor}
            emissive={baseColor}
            emissiveIntensity={0.8}
          />
        </mesh>
      )}

      {/* Floating Badge / Pin Matching Reference Image UI */}
      <Html
        position={[0, height + slabHeight + (height >= 7 ? 2.0 : 1.2), 0]}
        center
        distanceFactor={28}
      >
        {status === 'owned' && owner ? (
          <div className="flex items-center gap-1.5 px-3 py-1 bg-white/95 backdrop-blur-md rounded-full shadow-lg border border-slate-200 text-xs font-black text-slate-900 pointer-events-none whitespace-nowrap hover:scale-105 transition-transform">
            <span style={{ color: owner.color }} className="text-sm font-black">{owner.logo}</span>
            <span>{owner.name}</span>
          </div>
        ) : badgeLabel ? (
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-600/90 text-white backdrop-blur-md rounded-full shadow-lg border border-emerald-400/50 text-[11px] font-extrabold pointer-events-none whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse"></span>
            {badgeLabel}
          </div>
        ) : (
          <div className="flex items-center gap-1 px-2 py-0.5 bg-white/90 backdrop-blur-md rounded-full shadow-md border border-slate-200 text-[10px] font-bold text-slate-700 pointer-events-none whitespace-nowrap">
            Available
          </div>
        )}
      </Html>
    </group>
  );
}
