# Fisheries Smart Asset Reliability & Maintenance Suite

Enterprise-grade predictive asset maintenance, real-time sensor telemetry monitoring, and reliability lifecycle suite engineered specifically for industrial aquaculture, fleet vessels, offshore marine cages, and processing facilities.

---

## 1. Problem Statement & Mission

Industrial aquaculture companies face two acute operational challenges:
1. **Maintenance is reactive rather than predictive:** Catastrophic failures of aeration paddlewheels, blast refrigeration chillers, and vessel engines result in immediate biomass asphyxiation, spoiled harvests, and exorbitant emergency salvage costs.
2. **Asset records are fragmented across operational silos:** Fish farmers, trawler skippers, cold-chain technicians, and external refrigeration vendors maintain isolated logbooks, preventing holistic reliability engineering and root-cause defect analysis.

**AquaReliability** solves these crises by uniting telemetry ingestion, transparent physics-informed condition scoring, Google Gemini AI predictive maintenance, and an 8-stage Kanban closure verification workflow into a single centralized SaaS suite.

---

## 2. Key Capabilities & All 12 Integrated Pages

| # | Page Name | Route | Core Functionality |
| :--- | :--- | :--- | :--- |
| **1** | **Secure Login Portal** | `/login` | Enterprise authentication with email/password, show/hide password, remember me, forgot-password recovery workflow, and one-click role demo switcher. |
| **2** | **Asset Registry & Health Dashboard** | `/dashboard` / `/assets` | 8 required KPI summary metrics, interactive Recharts health distribution pie charts, 8-category breakdown bars, filterable asset table, and asset registration modal. |
| **3** | **Asset Lifecycle & Maintenance History** | `/assets/:id` | Detailed asset specifications, live sensor gauges, historical telemetry trend lines, inspection checklist trail, failure prediction logs, manual telemetry recording modal, and breakdown reporting modal. |
| **4** | **Maintenance Calendar & Technician Queue** | `/calendar` | Interactive monthly calendar with color-coded priority events, day-level schedule inspection, and assigned technician dispatch queue. |
| **5** | **Planning Board & Closure Verification** | `/planning` | 8-column Kanban workflow (*Reported, Pending Review, Approved, Scheduled, In Progress, Awaiting Verification, Completed, Rejected*), drag-and-move transitions, and authorized physical closure verification signoffs. |
| **6** | **Failure Risk & Remaining Useful Life (RUL)** | `/predictions` | Physics-informed degradation curves + Google Gemini predictive synthesis, estimated RUL hours, multi-factor anomaly diagnostics, and batch fleet evaluation re-runs. |
| **7** | **AI Maintenance Recommendations** | `/recommendations` | Prescriptive maintenance actions with suggested downtime, skills, and spare parts. Supports Human-in-the-Loop **Accept** (spawns Work Order), **Reject** (with reason), and **Override** (custom parameters). |
| **8** | **Reliability & Model Performance** | `/reliability` | Model precision metrics across all 8 asset categories, false alarm rates, mean lead time days, maintenance effectiveness, and continuous user validation feedback loops. |
| **9** | **Reports & Analytics Centre** | `/reports` | 14 structured audit & reliability reports (Asset Health, Failure Risk, Downtime Analysis, Spare Parts, PM/PdM, etc.), period drill-downs, printable views, and live RFC 4180 CSV export. |
| **10** | **Notifications & Alerts Center** | `/notifications` | Live notification stream for critical telemetry excursions, breakdown alerts, maintenance assignments, and deep links to assets/work orders. |
| **11** | **User & Role Management** | `/users` | Administrator directory governance, provisioning users across the 4 primary roles, account activation/deactivation toggles, and facility scope assignments. |
| **12** | **Audit Logs & System Settings** | `/settings` | Immutable append-only audit trail with CSV export, system master configuration for telemetry thresholds, and spare parts inventory catalog with low-stock alerts. |

---

## 3. Technology Stack

### Frontend
- **Framework:** React 18 & Vite
- **Styling:** Tailwind CSS (Navy industrial palette, teal accents, custom alerts)
- **Routing:** React Router v7
- **HTTP Client:** Axios (with request & response JWT interceptors)
- **Icons:** Lucide React
- **Data Visualization:** Recharts
- **Notifications:** React Hot Toast

### Backend
- **Runtime:** Node.js (ES Modules `type: "module"`)
- **Server Framework:** Express.js
- **Authentication:** JSON Web Tokens (JWT) & bcryptjs password hashing
- **Validation:** Zod schemas
- **Database ODM:** Mongoose (MongoDB Atlas / local)
- **Background Jobs:** node-cron
- **AI Processing:** Google Gemini API (`@google/generative-ai`) with transparent physics heuristic fallback

---

## 4. Four Primary Project Roles

1. **Maintenance Admin** (`admin@fisheries.org` / `AdminPass123!`): Full enterprise governance, user provisioning, role assignments, master settings, immutable audit logs inspection, and asset decommissioning.
2. **Operations Manager** (`manager@fisheries.org` / `ManagerPass123!`): Production unit monitoring, reviewing AI predictions, approving/rejecting maintenance recommendations, assigning technicians, and authorizing closure verification.
3. **Technician** (`tech@fisheries.org` / `TechPass123!`): Field task execution, recording telemetry readings, submitting inspection checklists, reporting breakdowns, and submitting completed work orders.
4. **Vendor** (`vendor@marineparts.com` / `VendorPass123!`): Contracted service specialist, inspection of assigned assets, spare parts availability verification, and service note submission.

---

## 5. Supported Asset Categories (All 8 Industrial Classes)

1. **Ponds** (HDPE-lined raceways, brackish shrimp nursery ponds, freshwater tilapia ponds)
2. **Cages** (Offshore High-Density Polyethylene marine pens, mooring bridles)
3. **Vessels** (Aquaculture harvest tenders, feed carrier vessels, trawlers)
4. **Aerators** (Deep paddlewheel aerators, venturi micro-bubble injectors, spiral aerators)
5. **Nets** (Predator exclusion barriers, anti-fouling copper-alloy containment mesh)
6. **Ice Plants** (Continuous flake ice drums, seawater slurry ice units)
7. **Cold Rooms** (Ammonia blast freezers -35°C, refrigerated seawater holds, cold storage bays)
8. **Processing Equipment** (High-speed automated salmon filleting lines, vision graders, vacuum gutting systems)

---

## 6. Installation & Local Setup

### Prerequisites
- Node.js v18+ (tested on Node v24)
- npm v9+
- MongoDB (Local daemon or MongoDB Atlas URI)

### Step 1: Clone Repository
```bash
git clone https://github.com/your-org/fisheries-smart-asset-reliability-suite.git
cd fisheries-smart-asset-reliability-suite
```

### Step 2: Configure Environment Variables
Copy `.env.example` in both backend and frontend:
```bash
cp .env.example backend/.env
cp frontend/.env.example frontend/.env
```

Edit `backend/.env`:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/fisheries_reliability
JWT_SECRET=aquaculture-enterprise-super-secure-jwt-key-2026
GEMINI_API_KEY=your_gemini_api_key_here
```
*(Note: If `GEMINI_API_KEY` is omitted, the application automatically functions with the transparent explainable heuristic baseline engine without interruption!)*

### Step 3: Install Dependencies
```bash
npm run install:all
```

### Step 4: Seed Realistic Aquaculture Data
Populates all 4 primary roles, 8 asset categories, 500 telemetry readings, work orders, AI predictions, and spare parts:
```bash
npm run seed
```

### Step 5: Start Development Servers
In terminal 1 (Backend API):
```bash
npm run server
```
*Backend runs on http://localhost:5000*

In terminal 2 (Frontend Client):
```bash
npm run client
```
*Frontend runs on http://localhost:3000*

---

## 7. Seed Demo Credentials

| Role | Email | Password |
| :--- | :--- | :--- |
| **Maintenance Admin** | `admin@fisheries.org` | `AdminPass123!` |
| **Operations Manager** | `manager@fisheries.org` | `ManagerPass123!` |
| **Technician** | `tech@fisheries.org` | `TechPass123!` |
| **Vendor** | `vendor@marineparts.com` | `VendorPass123!` |

*(The login screen also provides a convenient 1-Click Role Switcher button for immediate demonstration).*

---

## 8. Deployment Guide

### Backend on Render
1. Create a new **Web Service** pointing to your repository.
2. Root Directory: `backend`
3. Build Command: `npm install`
4. Start Command: `npm start`
5. Configure Environment Variables: `MONGODB_URI`, `JWT_SECRET`, `NODE_ENV=production`, `GEMINI_API_KEY`.

### Frontend on Vercel
1. Import repository on Vercel.
2. Root Directory: `frontend`
3. Framework Preset: `Vite`
4. Build Command: `npm run build`
5. Output Directory: `dist`
6. Environment Variables: `VITE_API_URL=https://<your-render-backend-url>/api/v1`

---

## 9. Security & Governance

- **Password Cryptography:** bcryptjs with 10 salt rounds.
- **Transport Security:** HTTP Authorization Bearer token header verification.
- **Tenant Isolation:** Scoped database queries enforcing facility isolation.
- **Audit Immutability:** Pre-hook Mongoose triggers blocking all `updateOne` and `deleteOne` operations on audit logs.
- **API Key Confidentiality:** Google Gemini API keys exist strictly on the backend. No sensitive credentials are leaked to the browser.
