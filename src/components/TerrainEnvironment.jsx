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

  // Tree positions
  const treePositions = useMemo(() => {
    const trees = [];
    const count = 52;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + (Math.random() * 0.15);
      const radius = 19.0 + Math.random() * 3.5;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const scale = 0.7 + Math.random() * 0.6;
      const type = Math.random() > 0.4 ? 'pine' : 'round';
      trees.push({ x, z, scale, type, key: i });
    }
    return trees;
  }, []);

  return (
    <group>
      {/* Main Floating Grassy Platform */}
      <mesh position={[0, -0.6, 0]} receiveShadow>
        <cylinderGeometry args={[23, 24.5, 1.2, 64]} />
        <meshStandardMaterial color="#22c55e" roughness={0.75} metalness={0.05} />
      </mesh>

      {/* Island Cliff Base Foundation */}
      <mesh position={[0, -1.8, 0]}>
        <cylinderGeometry args={[24.5, 25.8, 1.4, 64]} />
        <meshStandardMaterial color="#475569" roughness={0.9} metalness={0.1} />
      </mesh>

      {/* Surrounding Water Plane */}
      <mesh position={[0, -2.4, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[160, 160]} />
        <meshStandardMaterial color="#0ea5e9" roughness={0.15} metalness={0.25} transparent opacity={0.8} />
      </mesh>

      {/* 5 Category Clusters Ground Tint Rings */}
      {CLUSTERS.map((cluster, i) => (
        <group key={i} position={cluster.pos}>
          {/* Filled Disc */}
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[cluster.radius, 32]} />
            <meshBasicMaterial color={cluster.color} transparent opacity={0.12} side={THREE.DoubleSide} />
          </mesh>
          {/* Border Ring */}
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[cluster.radius - 0.15, cluster.radius, 32]} />
            <meshBasicMaterial color={cluster.color} transparent opacity={0.35} side={THREE.DoubleSide} />
          </mesh>
        </group>
      ))}

      {/* 3D Trees */}
      {treePositions.map((tree) => (
        <group key={tree.key} position={[tree.x, 0, tree.z]} scale={tree.scale}>
          <mesh position={[0, 0.6, 0]} castShadow>
            <cylinderGeometry args={[0.15, 0.25, 1.2, 8]} />
            <meshStandardMaterial color="#78350f" roughness={0.9} />
          </mesh>

          {tree.type === 'pine' ? (
            <group position={[0, 1.6, 0]}>
              <mesh position={[0, 0, 0]} castShadow>
                <coneGeometry args={[1.1, 1.6, 8]} />
                <meshStandardMaterial color="#166534" roughness={0.7} />
              </mesh>
              <mesh position={[0, 0.8, 0]} castShadow>
                <coneGeometry args={[0.85, 1.4, 8]} />
                <meshStandardMaterial color="#15803d" roughness={0.7} />
              </mesh>
            </group>
          ) : (
            <mesh position={[0, 1.8, 0]} castShadow>
              <dodecahedronGeometry args={[1.0, 1]} />
              <meshStandardMaterial color="#15803d" roughness={0.7} />
            </mesh>
          )}
        </group>
      ))}
    </group>
  );
}
