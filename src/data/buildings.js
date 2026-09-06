// 48 Territory Building Slots across 6 Category Clusters:
// AI & Tech, Marketing, SaaS, Web3, Creator Economy, Open Zone
// All slots start as clean, unbuilt/unclaimed slate gray building plots.

export const PRESET_COLORS = [
  { name: 'Emerald', hex: '#10b981', ring: 'ring-emerald-500' },
  { name: 'Sapphire', hex: '#2563eb', ring: 'ring-blue-500' },
  { name: 'Indigo', hex: '#6366f1', ring: 'ring-indigo-500' },
  { name: 'Amethyst', hex: '#8b5cf6', ring: 'ring-purple-500' },
  { name: 'Rose', hex: '#f43f5e', ring: 'ring-rose-500' },
  { name: 'Amber', hex: '#f59e0b', ring: 'ring-amber-500' },
  { name: 'Cyan', hex: '#06b6d4', ring: 'ring-cyan-500' },
  { name: 'Obsidian', hex: '#1e293b', ring: 'ring-slate-800' }
];

export const BUILDINGS_DATA = [
  // ==========================================
  // 1. AI & TECH (Top-Left: x: -16 to -5, z: -16 to -5)
  // ==========================================
  { id: "ai-1", name: "AI Tech Slot #01", cluster: "ai", clusterName: "AI & Tech", tier: "large", sizeLabel: "Large", position: [-12, 0, -12], width: 2.6, height: 9.5, depth: 2.6, floors: 28, basePrice: 5, currentPrice: 5, status: "available", owner: null, customColor: null, customLogo: null },
  { id: "ai-2", name: "AI Tech Slot #02", cluster: "ai", clusterName: "AI & Tech", tier: "medium", sizeLabel: "Medium", position: [-8, 0, -14], width: 2.0, height: 5.4, depth: 2.0, floors: 16, basePrice: 3, currentPrice: 3, status: "available", owner: null, customColor: null, customLogo: null },
  { id: "ai-3", name: "AI Tech Slot #03", cluster: "ai", clusterName: "AI & Tech", tier: "medium", sizeLabel: "Medium", position: [-14, 0, -8], width: 1.9, height: 4.8, depth: 1.9, floors: 14, basePrice: 3, currentPrice: 3, status: "available", owner: null, customColor: null, customLogo: null },
  { id: "ai-4", name: "AI Tech Slot #04", cluster: "ai", clusterName: "AI & Tech", tier: "small", sizeLabel: "Small", position: [-15, 0, -13], width: 1.4, height: 2.4, depth: 1.4, floors: 6, basePrice: 2, currentPrice: 2, status: "available", owner: null, customColor: null, customLogo: null },
  { id: "ai-5", name: "AI Tech Slot #05", cluster: "ai", clusterName: "AI & Tech", tier: "medium", sizeLabel: "Medium", position: [-10, 0, -9], width: 1.8, height: 5.0, depth: 1.8, floors: 15, basePrice: 3, currentPrice: 3, status: "available", owner: null, customColor: null, customLogo: null },
  { id: "ai-6", name: "AI Tech Slot #06", cluster: "ai", clusterName: "AI & Tech", tier: "small", sizeLabel: "Small", position: [-6, 0, -10], width: 1.5, height: 2.6, depth: 1.5, floors: 7, basePrice: 2, currentPrice: 2, status: "available", owner: null, customColor: null, customLogo: null },
  { id: "ai-7", name: "AI Tech Slot #07", cluster: "ai", clusterName: "AI & Tech", tier: "medium", sizeLabel: "Medium", position: [-11, 0, -5], width: 1.9, height: 4.5, depth: 1.9, floors: 13, basePrice: 3, currentPrice: 3, status: "available", owner: null, customColor: null, customLogo: null },

  // ==========================================
  // 2. SAAS CLUSTER (Center / Top-Right)
  // ==========================================
  { id: "saas-1", name: "SaaS Prime Tower #01", cluster: "saas", clusterName: "SaaS", tier: "large", sizeLabel: "Large", position: [0, 0, -4], width: 2.8, height: 11.5, depth: 2.8, floors: 36, basePrice: 5, currentPrice: 5, status: "available", owner: null, customColor: null, customLogo: null },
  { id: "saas-2", name: "SaaS Slot #02", cluster: "saas", clusterName: "SaaS", tier: "medium", sizeLabel: "Medium", position: [6, 0, -12], width: 2.1, height: 5.6, depth: 2.1, floors: 18, basePrice: 3, currentPrice: 3, status: "available", owner: null, customColor: null, customLogo: null },
  { id: "saas-3", name: "SaaS Slot #03", cluster: "saas", clusterName: "SaaS", tier: "medium", sizeLabel: "Medium", position: [-2, 0, -10], width: 2.0, height: 5.2, depth: 2.0, floors: 16, basePrice: 3, currentPrice: 3, status: "available", owner: null, customColor: null, customLogo: null },
  { id: "saas-4", name: "SaaS Slot #04", cluster: "saas", clusterName: "SaaS", tier: "medium", sizeLabel: "Medium", position: [-4, 0, 2], width: 2.0, height: 5.4, depth: 2.0, floors: 17, basePrice: 3, currentPrice: 3, status: "available", owner: null, customColor: null, customLogo: null },
  { id: "saas-5", name: "SaaS Slot #05", cluster: "saas", clusterName: "SaaS", tier: "medium", sizeLabel: "Medium", position: [11, 0, -13], width: 1.9, height: 4.8, depth: 1.9, floors: 14, basePrice: 3, currentPrice: 3, status: "available", owner: null, customColor: null, customLogo: null },
  { id: "saas-6", name: "SaaS Slot #06", cluster: "saas", clusterName: "SaaS", tier: "large", sizeLabel: "Large", position: [3, 0, -11], width: 2.5, height: 8.0, depth: 2.5, floors: 25, basePrice: 5, currentPrice: 5, status: "available", owner: null, customColor: null, customLogo: null },
  { id: "saas-7", name: "SaaS Slot #07", cluster: "saas", clusterName: "SaaS", tier: "small", sizeLabel: "Small", position: [14, 0, -10], width: 1.4, height: 2.5, depth: 1.4, floors: 6, basePrice: 2, currentPrice: 2, status: "available", owner: null, customColor: null, customLogo: null },
  { id: "saas-8", name: "SaaS Slot #08", cluster: "saas", clusterName: "SaaS", tier: "medium", sizeLabel: "Medium", position: [9, 0, -7], width: 1.9, height: 4.6, depth: 1.9, floors: 14, basePrice: 3, currentPrice: 3, status: "available", owner: null, customColor: null, customLogo: null },

  // ==========================================
  // 3. MARKETING CLUSTER (Bottom-Right)
  // ==========================================
  { id: "mkt-1", name: "Marketing Slot #01", cluster: "mkt", clusterName: "Marketing", tier: "large", sizeLabel: "Large", position: [12, 0, 12], width: 2.4, height: 7.8, depth: 2.4, floors: 24, basePrice: 5, currentPrice: 5, status: "available", owner: null, customColor: null, customLogo: null },
  { id: "mkt-2", name: "Marketing Slot #02", cluster: "mkt", clusterName: "Marketing", tier: "medium", sizeLabel: "Medium", position: [8, 0, 14], width: 2.0, height: 5.2, depth: 2.0, floors: 16, basePrice: 3, currentPrice: 3, status: "available", owner: null, customColor: null, customLogo: null },
  { id: "mkt-3", name: "Marketing Slot #03", cluster: "mkt", clusterName: "Marketing", tier: "small", sizeLabel: "Small", position: [14, 0, 8], width: 1.4, height: 2.3, depth: 1.4, floors: 5, basePrice: 2, currentPrice: 2, status: "available", owner: null, customColor: null, customLogo: null },
  { id: "mkt-4", name: "Marketing Slot #04", cluster: "mkt", clusterName: "Marketing", tier: "medium", sizeLabel: "Medium", position: [10, 0, 9], width: 1.8, height: 4.4, depth: 1.8, floors: 13, basePrice: 3, currentPrice: 3, status: "available", owner: null, customColor: null, customLogo: null },
  { id: "mkt-5", name: "Marketing Slot #05", cluster: "mkt", clusterName: "Marketing", tier: "small", sizeLabel: "Small", position: [15, 0, 13], width: 1.3, height: 2.2, depth: 1.3, floors: 5, basePrice: 2, currentPrice: 2, status: "available", owner: null, customColor: null, customLogo: null },
  { id: "mkt-6", name: "Marketing Slot #06", cluster: "mkt", clusterName: "Marketing", tier: "medium", sizeLabel: "Medium", position: [6, 0, 10], width: 1.9, height: 4.9, depth: 1.9, floors: 15, basePrice: 3, currentPrice: 3, status: "available", owner: null, customColor: null, customLogo: null },

  // ==========================================
  // 4. WEB3 CLUSTER (Center / Right)
  // ==========================================
  { id: "web3-1", name: "Web3 Slot #01", cluster: "web3", clusterName: "Web3", tier: "large", sizeLabel: "Large", position: [12, 0, -2], width: 2.5, height: 8.5, depth: 2.5, floors: 26, basePrice: 5, currentPrice: 5, status: "available", owner: null, customColor: null, customLogo: null },
  { id: "web3-2", name: "Web3 Slot #02", cluster: "web3", clusterName: "Web3", tier: "medium", sizeLabel: "Medium", position: [14, 0, 3], width: 2.0, height: 5.2, depth: 2.0, floors: 16, basePrice: 3, currentPrice: 3, status: "available", owner: null, customColor: null, customLogo: null },
  { id: "web3-3", name: "Web3 Slot #03", cluster: "web3", clusterName: "Web3", tier: "small", sizeLabel: "Small", position: [16, 0, -4], width: 1.4, height: 2.4, depth: 1.4, floors: 6, basePrice: 2, currentPrice: 2, status: "available", owner: null, customColor: null, customLogo: null },
  { id: "web3-4", name: "Web3 Slot #04", cluster: "web3", clusterName: "Web3", tier: "medium", sizeLabel: "Medium", position: [10, 0, 2], width: 1.9, height: 4.6, depth: 1.9, floors: 14, basePrice: 3, currentPrice: 3, status: "available", owner: null, customColor: null, customLogo: null },

  // ==========================================
  // 5. CREATOR ECONOMY (Bottom-Left)
  // ==========================================
  { id: "crt-1", name: "Creator Slot #01", cluster: "crt", clusterName: "Creator Economy", tier: "large", sizeLabel: "Large", position: [-12, 0, 12], width: 2.4, height: 7.5, depth: 2.4, floors: 23, basePrice: 5, currentPrice: 5, status: "available", owner: null, customColor: null, customLogo: null },
  { id: "crt-2", name: "Creator Slot #02", cluster: "crt", clusterName: "Creator Economy", tier: "medium", sizeLabel: "Medium", position: [-8, 0, 14], width: 2.0, height: 5.0, depth: 2.0, floors: 15, basePrice: 3, currentPrice: 3, status: "available", owner: null, customColor: null, customLogo: null },
  { id: "crt-3", name: "Creator Slot #03", cluster: "crt", clusterName: "Creator Economy", tier: "small", sizeLabel: "Small", position: [-14, 0, 8], width: 1.4, height: 2.3, depth: 1.4, floors: 5, basePrice: 2, currentPrice: 2, status: "available", owner: null, customColor: null, customLogo: null },
  { id: "crt-4", name: "Creator Slot #04", cluster: "crt", clusterName: "Creator Economy", tier: "medium", sizeLabel: "Medium", position: [-10, 0, 9], width: 1.8, height: 4.4, depth: 1.8, floors: 13, basePrice: 3, currentPrice: 3, status: "available", owner: null, customColor: null, customLogo: null },

  // ==========================================
  // 6. OPEN ZONE (Outer edges)
  // ==========================================
  { id: "open-1", name: "Open Land Slot #01", cluster: "open", clusterName: "Open Zone", tier: "small", sizeLabel: "Small", position: [0, 0, 12], width: 1.5, height: 2.5, depth: 1.5, floors: 6, basePrice: 2, currentPrice: 2, status: "available", owner: null, customColor: null, customLogo: null },
  { id: "open-2", name: "Open Land Slot #02", cluster: "open", clusterName: "Open Zone", tier: "small", sizeLabel: "Small", position: [-4, 0, 14], width: 1.4, height: 2.3, depth: 1.4, floors: 5, basePrice: 2, currentPrice: 2, status: "available", owner: null, customColor: null, customLogo: null },
  { id: "open-3", name: "Open Land Slot #03", cluster: "open", clusterName: "Open Zone", tier: "small", sizeLabel: "Small", position: [4, 0, 14], width: 1.4, height: 2.4, depth: 1.4, floors: 6, basePrice: 2, currentPrice: 2, status: "available", owner: null, customColor: null, customLogo: null },
  { id: "open-4", name: "Open Land Slot #04", cluster: "open", clusterName: "Open Zone", tier: "medium", sizeLabel: "Medium", position: [0, 0, 8], width: 1.9, height: 4.8, depth: 1.9, floors: 14, basePrice: 3, currentPrice: 3, status: "available", owner: null, customColor: null, customLogo: null }
];
