import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

export function BuildingMesh({ building, isSelected, onSelect }) {
  const groupRef = useRef();
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
    floors = 14
  } = building;

  // Smooth lerp hover lift animation
  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const targetY = (hovered ? 0.5 : 0) + (isSelected ? 0.3 : 0);
    groupRef.current.position.y = THREE.MathUtils.lerp(
      groupRef.current.position.y,
      position[1] + targetY,
      delta * 8
    );
  });

  // Building Color Priority: customColor -> owner color -> accentColor -> default green
  const baseColor = customColor || (status === 'owned' && owner?.color ? owner.color : accentColor || '#10b981');

  // Architectural Dimensions
  const slabW = width + 0.6;
  const slabD = depth + 0.6;
  const slabH = 0.3;

  const lobbyW = width + 0.2;
  const lobbyD = depth + 0.2;
  const lobbyH = Math.min(1.2, height * 0.25);

  const mainTowerH = height - lobbyH;
  const crownH = 0.5;

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
          <ringGeometry args={[slabW * 0.6, slabW * 1.0, 32]} />
          <meshBasicMaterial
            color={isSelected ? '#10b981' : '#38bdf8'}
            transparent
            opacity={isSelected ? 0.85 : 0.5}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* 1. Base Concrete Foundation Slab */}
      <mesh position={[0, slabH / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[slabW, slabH, slabD]} />
        <meshStandardMaterial color="#1e293b" roughness={0.5} metalness={0.3} />
      </mesh>

      {/* 2. Glass Lobby Podium Tier (Ground Floor) */}
      <mesh position={[0, slabH + lobbyH / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[lobbyW, lobbyH, lobbyD]} />
        <meshStandardMaterial
          color="#0f172a"
          roughness={0.2}
          metalness={0.6}
          emissive="#38bdf8"
          emissiveIntensity={hovered ? 0.3 : 0.1}
        />
      </mesh>

      {/* Lobby Glass Entrance Canopy */}
      <mesh position={[0, slabH + lobbyH * 0.7, lobbyD / 2 + 0.2]} castShadow>
        <boxGeometry args={[lobbyW * 0.6, 0.08, 0.5]} />
        <meshStandardMaterial color={baseColor} metalness={0.8} roughness={0.2} />
      </mesh>

      {/* 3. Main Architectural Skyscraper Body */}
      <mesh
        position={[0, slabH + lobbyH + mainTowerH / 2, 0]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[width, mainTowerH, depth]} />
        <meshStandardMaterial
          color={baseColor}
          roughness={0.2}
          metalness={0.5}
          emissive={hovered ? baseColor : (isSelected ? '#047857' : '#000000')}
          emissiveIntensity={hovered ? 0.4 : (isSelected ? 0.2 : 0)}
        />
      </mesh>

      {/* 4. Reflective Glass Window Facade Ribs (Mullions & Grid) */}
      <mesh position={[0, slabH + lobbyH + mainTowerH / 2, 0]}>
        <boxGeometry args={[width * 1.02, mainTowerH * 0.92, depth * 0.98]} />
        <meshStandardMaterial
          color="#e0f2fe"
          emissive="#7dd3fc"
          emissiveIntensity={hovered ? 0.6 : 0.25}
          transparent
          opacity={0.4}
          roughness={0.1}
          metalness={0.9}
        />
      </mesh>

      {/* Horizontal Architectural Floor Bands */}
      {Array.from({ length: Math.min(10, Math.floor(floors / 3)) }).map((_, i) => {
        const yPos = slabH + lobbyH + (i + 1) * (mainTowerH / (Math.min(10, Math.floor(floors / 3)) + 1));
        return (
          <mesh key={i} position={[0, yPos, 0]}>
            <boxGeometry args={[width * 1.04, 0.12, depth * 1.04]} />
            <meshStandardMaterial color="#0f172a" roughness={0.3} metalness={0.7} />
          </mesh>
        );
      })}

      {/* 5. Setback Crown & Roof Penthouse */}
      <mesh position={[0, slabH + height + crownH / 2, 0]} castShadow>
        <boxGeometry args={[width * 0.75, crownH, depth * 0.75]} />
        <meshStandardMaterial color="#0f172a" roughness={0.3} metalness={0.8} />
      </mesh>

      {/* Glowing Neon LED Roof Trim */}
      <mesh position={[0, slabH + height + crownH, 0]}>
        <boxGeometry args={[width * 0.77, 0.08, depth * 0.77]} />
        <meshStandardMaterial
          color={baseColor}
          emissive={baseColor}
          emissiveIntensity={0.9}
        />
      </mesh>

      {/* 6. Roof Helipad & Spire Antenna */}
      {height >= 6 && (
        <group position={[0, slabH + height + crownH + 0.05, 0]}>
          {/* Helipad Ring */}
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.4, 0.55, 24]} />
            <meshBasicMaterial color="#f59e0b" side={THREE.DoubleSide} />
          </mesh>

          {/* Roof Spire Antenna with Red Aircraft Warning Light */}
          {height >= 8 && (
            <group position={[0, 0, 0]}>
              <mesh position={[0, 0.8, 0]}>
                <cylinderGeometry args={[0.03, 0.1, 1.6, 12]} />
                <meshStandardMaterial color="#64748b" metalness={0.9} roughness={0.1} />
              </mesh>
              {/* Aircraft Beacon Light */}
              <mesh position={[0, 1.6, 0]}>
                <sphereGeometry args={[0.1, 12, 12]} />
                <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={1.2} />
              </mesh>
            </group>
          )}
        </group>
      )}

      {/* Floating Badge Overlay */}
      <Html
        position={[0, slabH + height + crownH + (height >= 8 ? 2.2 : 1.4), 0]}
        center
        distanceFactor={28}
      >
        {status === 'owned' && owner ? (
          <div className="flex items-center gap-1.5 px-3 py-1 bg-white/95 backdrop-blur-md rounded-full shadow-xl border border-slate-200 text-xs font-black text-slate-900 pointer-events-none whitespace-nowrap transform hover:scale-105 transition-all">
            <span style={{ color: owner.color }} className="text-sm font-black">{owner.logo}</span>
            <span>{owner.name}</span>
          </div>
        ) : badgeLabel ? (
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-600/95 text-white backdrop-blur-md rounded-full shadow-lg border border-emerald-400/60 text-[11px] font-black pointer-events-none whitespace-nowrap">
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
