import React, { useMemo } from 'react';
import * as THREE from 'three';

export function TerrainEnvironment() {
  // Category Clusters ground ring configurations
  const CLUSTERS = [
    { name: "AI Zone", color: "#22c55e", pos: [-11, 0.02, -11], radius: 7.5 },
    { name: "Dev Zone", color: "#38bdf8", pos: [11, 0.02, -11], radius: 7.5 },
    { name: "Marketing Zone", color: "#f97316", pos: [-11, 0.02, 11], radius: 7.5 },
    { name: "Creator Zone", color: "#a855f7", pos: [11, 0.02, 11], radius: 7.5 },
    { name: "Open Zone", color: "#14b8a6", pos: [0, 0.02, 0], radius: 6.5 }
  ];

  // Procedural Tree, Bush, Flower & Lamp Locations
  const { trees, bushes, flowers, lamps } = useMemo(() => {
    const treeList = [];
    const bushList = [];
    const flowerList = [];
    const lampList = [];

    // Outer Ring Forest (56 detailed trees)
    const treeCount = 56;
    for (let i = 0; i < treeCount; i++) {
      const angle = (i / treeCount) * Math.PI * 2 + (Math.random() * 0.12);
      const radius = 18.5 + Math.random() * 4.0;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const scale = 0.75 + Math.random() * 0.55;
      const type = i % 3 === 0 ? 'pine' : i % 3 === 1 ? 'deciduous' : 'birch';
      treeList.push({ x, z, scale, type, key: `tree-${i}` });
    }

    // Garden Bushes (40 bushes scattered near paths)
    const bushCount = 40;
    for (let i = 0; i < bushCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 6.0 + Math.random() * 11.0;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const scale = 0.4 + Math.random() * 0.45;
      const bushColor = ['#15803d', '#166534', '#047857', '#10b981', '#059669'][i % 5];
      bushList.push({ x, z, scale, color: bushColor, key: `bush-${i}` });
    }

    // 3D Colorful Flower Patch Clusters (64 vibrant flowers around central walkways & garden paths)
    const flowerCount = 64;
    const flowerColors = ['#f43f5e', '#fbbf24', '#a855f7', '#ef4444', '#38bdf8', '#ffffff', '#f472b6'];
    for (let i = 0; i < flowerCount; i++) {
      const angle = (i / flowerCount) * Math.PI * 2 + (Math.random() * 0.2);
      const radius = 4.5 + Math.random() * 13.0;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const scale = 0.25 + Math.random() * 0.3;
      const color = flowerColors[i % flowerColors.length];
      flowerList.push({ x, z, scale, color, key: `flower-${i}` });
    }

    // Street Lamp Posts (12 glowing lamps along central walkway)
    const lampCount = 12;
    for (let i = 0; i < lampCount; i++) {
      const angle = (i / lampCount) * Math.PI * 2;
      const radius = 10.5;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      lampList.push({ x, z, key: `lamp-${i}` });
    }

    return { trees: treeList, bushes: bushList, flowers: flowerList, lamps: lampList };
  }, []);

  return (
    <group>
      {/* Main Grassy Island Platform */}
      <mesh position={[0, -0.6, 0]} receiveShadow>
        <cylinderGeometry args={[23.5, 25.0, 1.2, 64]} />
        <meshStandardMaterial color="#22c55e" roughness={0.7} metalness={0.05} />
      </mesh>

      {/* Island Cliff Foundation Wall */}
      <mesh position={[0, -1.8, 0]}>
        <cylinderGeometry args={[25.0, 26.2, 1.4, 64]} />
        <meshStandardMaterial color="#334155" roughness={0.85} metalness={0.15} />
      </mesh>

      {/* Surrounding Ocean Water Plane (Translucent so actual background image shines through) */}
      <mesh position={[0, -2.4, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[180, 180]} />
        <meshStandardMaterial color="#38bdf8" roughness={0.1} metalness={0.2} transparent opacity={0.12} />
      </mesh>

      {/* Central Pedestrian Walkway Ring */}
      <mesh position={[0, -0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[9.5, 11.2, 64]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.9} />
      </mesh>

      {/* 5 Category Cluster Ground Zones */}
      {CLUSTERS.map((cluster, i) => (
        <group key={i} position={cluster.pos}>
          {/* Soft Disc Tint */}
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[cluster.radius, 32]} />
            <meshBasicMaterial color={cluster.color} transparent opacity={0.14} side={THREE.DoubleSide} />
          </mesh>
          {/* Glowing Border Ring */}
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[cluster.radius - 0.15, cluster.radius, 32]} />
            <meshBasicMaterial color={cluster.color} transparent opacity={0.4} side={THREE.DoubleSide} />
          </mesh>
        </group>
      ))}

      {/* 3D Trees Layer */}
      {trees.map((tree) => (
        <group key={tree.key} position={[tree.x, 0, tree.z]} scale={tree.scale}>
          {/* Wooden Trunk */}
          <mesh position={[0, 0.6, 0]} castShadow>
            <cylinderGeometry args={[0.16, 0.28, 1.2, 8]} />
            <meshStandardMaterial color="#78350f" roughness={0.9} />
          </mesh>

          {tree.type === 'pine' ? (
            /* Multi-tier Pine Tree */
            <group position={[0, 1.6, 0]}>
              <mesh position={[0, 0, 0]} castShadow>
                <coneGeometry args={[1.2, 1.6, 8]} />
                <meshStandardMaterial color="#166534" roughness={0.7} />
              </mesh>
              <mesh position={[0, 0.8, 0]} castShadow>
                <coneGeometry args={[0.9, 1.4, 8]} />
                <meshStandardMaterial color="#15803d" roughness={0.7} />
              </mesh>
              <mesh position={[0, 1.5, 0]} castShadow>
                <coneGeometry args={[0.6, 1.1, 8]} />
                <meshStandardMaterial color="#22c55e" roughness={0.7} />
              </mesh>
            </group>
          ) : tree.type === 'birch' ? (
            /* Birch Round Canopy */
            <group position={[0, 1.7, 0]}>
              <mesh position={[0, 0, 0]} castShadow>
                <icosahedronGeometry args={[1.1, 1]} />
                <meshStandardMaterial color="#10b981" roughness={0.65} />
              </mesh>
            </group>
          ) : (
            /* Deciduous Multi-Sphere Canopy */
            <group position={[0, 1.7, 0]}>
              <mesh position={[0, 0, 0]} castShadow>
                <dodecahedronGeometry args={[1.0, 1]} />
                <meshStandardMaterial color="#15803d" roughness={0.7} />
              </mesh>
              <mesh position={[0.4, 0.4, 0.2]} castShadow>
                <dodecahedronGeometry args={[0.6, 1]} />
                <meshStandardMaterial color="#166534" roughness={0.7} />
              </mesh>
            </group>
          )}
        </group>
      ))}

      {/* 3D Garden Bushes */}
      {bushes.map((b) => (
        <mesh key={b.key} position={[b.x, b.scale * 0.4, b.z]} scale={b.scale} castShadow>
          <dodecahedronGeometry args={[0.8, 1]} />
          <meshStandardMaterial color={b.color} roughness={0.8} />
        </mesh>
      ))}

      {/* 3D Flower Blossoms & Garden Plants */}
      {flowers.map((fl) => (
        <group key={fl.key} position={[fl.x, 0, fl.z]} scale={fl.scale}>
          {/* Flower Stem */}
          <mesh position={[0, 0.15, 0]}>
            <cylinderGeometry args={[0.03, 0.04, 0.3, 6]} />
            <meshStandardMaterial color="#15803d" roughness={0.8} />
          </mesh>
          {/* Flower Blossom Petals */}
          <mesh position={[0, 0.32, 0]} castShadow>
            <dodecahedronGeometry args={[0.22, 1]} />
            <meshStandardMaterial color={fl.color} roughness={0.4} emissive={fl.color} emissiveIntensity={0.2} />
          </mesh>
        </group>
      ))}

      {/* Street Lamps */}
      {lamps.map((lamp) => (
        <group key={lamp.key} position={[lamp.x, 0, lamp.z]}>
          {/* Post */}
          <mesh position={[0, 0.7, 0]}>
            <cylinderGeometry args={[0.04, 0.06, 1.4, 8]} />
            <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.2} />
          </mesh>
          {/* Light Fixture */}
          <mesh position={[0, 1.4, 0]}>
            <sphereGeometry args={[0.12, 12, 12]} />
            <meshStandardMaterial color="#fef08a" emissive="#fef08a" emissiveIntensity={1.2} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
