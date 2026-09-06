# 🌐 LandOfSaaS — 3D Product World

[![Vite](https://img.shields.io/badge/Vite-6.1-646CFF?style=flat&logo=vite)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=flat&logo=react)](https://react.dev/)
[![Three.js](https://img.shields.io/badge/Three.js-0.173-000000?style=flat&logo=three.js)](https://threejs.org/)
[![Dodo Payments](https://img.shields.io/badge/Dodo_Payments-Test_Mode-FF4F00?style=flat)](https://dodopayments.com/)

**LandOfSaaS** is a full-width light-themed interactive 3D product world homepage where startup founders, builders, and SaaS companies can explore, claim, customize, and outbid 3D skyscraper territory slots on a living virtual map.

---

## ✨ Features

- 🏙️ **Hyper-Realistic 3D Architecture**: 48 custom 3D skyscraper building meshes across 6 category clusters (*AI & Tech, Marketing, SaaS, Web3, Creator Economy, Open Zone*), featuring metallic facades, glass mullions, entrance lobbies, helipads, and glowing neon LED trims.
- 🎨 **Live Customization Studio**:
  - **Wall Color Swatches**: Real-time color pickers to brand your building.
  - **Brand Logo & Emoji Selector**: Choose your icon/logo displayed in 3D floating badges.
  - **Floor Growth Sliders**: Upgrade building height from 6 floors (Small) up to 38 floors (Tower).
  - **Website URL Linking**: Connect your building directly to your live startup landing page.
- 💳 **Dodo Payments Integration**:
  - **Server-Side Price Authority**: Backend verifies min bids before creating checkout sessions (never trust frontend prices).
  - **Test Mode Checkout**: Pre-configured with Dodo Product ID `pdt_0NmvqOrB01KtIWKY0htQs`.
  - **Automated Webhooks**: Real-time ownership updates upon `payment.succeeded` webhook events.
- 📐 **Responsive Full-Width UI**: Clean light-themed aesthetic (`#f3fbf6`), background landscape backdrops, camera zoom controls, interactive list/map views, and search filters.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 + Vite
- **3D Engine**: Three.js, `@react-three/fiber`, `@react-three/drei`
- **Styling**: Tailwind CSS, Lucide React icons
- **Authentication**: `@clerk/clerk-react` integration ready

### Backend
- **Runtime**: Node.js + Express
- **Payment Gateway**: Dodo Payments API
- **Tunneling**: Localtunnel (`npx lt`)

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js `v18.0.0` or higher
- npm `v9.0.0` or higher

### 1. Clone the Repository
```bash
git clone https://github.com/boobesh2912/LandOfSaaS-3d.git
cd LandOfSaaS-3d
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the root directory:

```env
PORT=5000
VITE_API_URL=http://localhost:5000
DODO_PAYMENTS_API_KEY=QXnxetjovjk8pu3L.LxOC0GS_ZgaglNmddv2vr_wgHwfxbyVCazquYZLAoA4HbPJN
DODO_PRODUCT_ID=pdt_0NmvqOrB01KtIWKY0htQs
```

### 4. Run Development Servers

**Express Backend**:
```bash
npm run server
```

**Vite Frontend**:
```bash
npm run dev
```

Open `http://localhost:3000` in your browser.

---

## 🔗 Dodo Payments Webhook Setup

To receive live payment callbacks during local development:

1. Launch a localtunnel forwarding port `5000`:
   ```bash
   npx lt --port 5000
   ```
2. Copy the generated URL (e.g. `https://your-subdomain.loca.lt`).
3. Add the Webhook endpoint in your [Dodo Payments Dashboard](https://test.dodopayments.com/developer/webhooks):
   ```
   https://your-subdomain.loca.lt/api/webhooks/dodo
   ```
4. Subscribe to the `payment.succeeded` event.

---

## 📡 API Reference

### 1. Get All Buildings
`GET /api/buildings`

Returns the authoritative state of all 48 3D territory building slots.

### 2. Create Payment Session
`POST /api/create-payment-session`

**Request Body:**
```json
{
  "buildingId": "saas-1",
  "customBrandName": "My Startup",
  "customWebsite": "https://mystartup.com",
  "customColor": "#10b981",
  "customLogo": "🚀",
  "customFloors": 14,
  "userId": "user_123"
}
```

### 3. Dodo Webhook Endpoint
`POST /api/webhooks/dodo`

Listens for `payment.succeeded` payload and updates building ownership, height, and color state.

---

## 📜 License

This project is licensed under the MIT License.
