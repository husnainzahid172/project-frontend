# AZ Labs — Premium Peptide Research Ecommerce & WhatsApp Ordering Platform

> **“Research. Refined.”**  
> Primary Domain: [azlabs.pro](https://azlabs.pro) | Direct UK WhatsApp: **+44 7448 399290**  
> A premium, minimalist, and scientific ecommerce landing page and order flow built for **AZ Labs**, supplying certified research peptides, 10-vial longitudinal research kits, and reconstitution media to verified research institutions and qualified laboratories across the UK and EU.

---

## 🔬 Key Features & Reference Site Architecture (Inspired by VitraLab Research)

### 1. Brand Identity & Visual Aesthetic
- **Charcoal Black & Emerald Green**: Deep charcoal black (`#070a0c`, `#0b1013`) surfaces with precision emerald green accents (`#10b981`), hairlines, and glassmorphism cards.
- **Official AZ Labs Vector Identity**: Custom scientific reticle monogram and typography featuring the official tagline **“RESEARCH • REFINED”**.
- **Realistic 3D Lyophilized Peptide Vial Visualizer**: High-fidelity CSS/SVG 3D peptide vials with aluminium crimp collars, flip-off seals in custom cap colors, vacuum powder cake, and batch labels.
- **Strict Compliance Stance**: Zero unsupported medical, therapeutic, or human consumption claims. Strictly designated for *in-vitro* laboratory research.

### 2. Research Peptide Catalogue & Kit Volume Pricing
- **Authorized Peptide Portfolio (12 SKUs)**:
  - **BPC-157** (10mg) — Red flip-off cap | 99.4% HPLC Purity
  - **TB-500 / Thymosin Beta-4** (10mg) — Royal Blue cap | 99.1% HPLC Purity
  - **BPC-157 + TB-500 Blend** (5mg + 5mg = 10mg) — Purple cap | Dual-fraction 99.3%
  - **GLP3-RT Retatrutide** (10mg) — Emerald Green cap | 99.6% HPLC Purity
  - **GLP2-TZ Tirzepatide** (15mg) — Cyan Teal cap | 99.5% HPLC Purity
  - **GLP1-SM Semaglutide** (5mg) — Cobalt Blue cap | 99.2% HPLC Purity
  - **GHK-Cu Copper Peptide** (50mg) — Deep Blue / Copper cap | 99.7% HPLC Purity
  - **NAD+ (Nicotinamide Adenine Dinucleotide)** (500mg) — Gold cap | 99.0% HPLC Purity
  - **CJC-1295 (No DAC) + Ipamorelin Blend** (10mg) — Magenta cap | 99.2% HPLC Purity
  - **MOTS-c Mitochondrial Derived Peptide** (10mg) — Amber cap | 98.9% HPLC Purity
  - **Epithalon / Epitalon** (10mg) — Lavender cap | 99.4% HPLC Purity
  - **Bacteriostatic Water with 0.9% Benzyl Alcohol** (30mL) — Clear / Silver cap | Sterile Reconstitution Medium
- **Single Vial vs. 10-Vial Research Kit Toggle**: Instant switcher on every product card with built-in volume discount (~20% savings per vial) for longitudinal institutional studies.
- **Dual Currency Selector**: Instant client-side switching between **GBP (£)** and **EUR (€)**.
- **Interactive Certificate of Analysis (CoA) Modal**: Displays live interactive HPLC chromatograms, analytical QC parameters (retention time, peak area, purity, ESI-MS molecular mass verification), and standard reconstitution protocols.

### 3. Direct WhatsApp Order Builder & Server Price Validation
- **Landing Page Quick Order Builder**: Allows researchers to configure quantities, choose single vials or 10-vial kit boxes, enter delivery details, sign the research declaration, and initiate an order with a single click.
- **Interactive Slide-Over Shopping Cart**: Full cart drawer supporting single vials, kit boxes, and reconstitution media with automatic cold-chain shipping calculation.
- **Zero Client Trust Security**: Never trusts prices submitted by the browser. The `/api/orders` backend endpoint retrieves canonical products from the database, enforces stock limits, validates UK/EU delivery countries, and authoritatively recalculates line items, packaging fees, and totals.
- **Direct WhatsApp Click-to-Chat Routing**:
  - UK Phone Number: `+44 7448 399290` (international format: `447448399290`).
  - Generates unique order reference: `AZ-2026-XXXXX`.
  - Saves order to database as `pending_contact`.
  - Automatically redirects customer to pre-filled WhatsApp conversation with formatted reference, item breakdown, shipping address, and validated totals.
  - Transparent messaging that order is pending laboratory dispatch review.

### 4. Regulatory & Safety Compliance Gate
- **21+ Age Verification & In-Vitro Research Acknowledgement**: Modal prompt on entry verifying institutional credentials and research-only intent. Persists in browser local storage.
- **Territory Verification**: Strictly restricted to the United Kingdom and authorized EU jurisdictions (Germany, France, Netherlands, Ireland, Belgium, Italy, Spain, Austria, Switzerland, Sweden, Denmark).

### 5. Admin Console (`/admin`)
- **Key Performance Indicators (KPIs)**: Total orders count, pending WhatsApp contact, confirmed orders, and gross order value (£ and €).
- **Orders Registry**: Full table with search, status filtering (`pending_contact`, `confirmed`, `processing`, `dispatched`, `completed`, `cancelled`), detailed customer and delivery viewer, and status updater.
- **Catalogue Inventory Management**: View active products, prices, stock levels, batch CoA codes, and toggle in-stock/reserve status.
- **CSV Export**: One-click export of complete order logs to CSV for laboratory accounting.
- **System Diagnostics**: Live inspection of database engine, Row Level Security, server price validation, and WhatsApp configuration.

---

## 🛠 Technology Stack

- **Framework**: [Next.js 15 (App Router)](https://nextjs.org/)
- **UI & Styling**: [React 19](https://react.dev/), [Tailwind CSS](https://tailwindcss.com/), [Radix UI](https://www.radix-ui.com/), [Lucide React](https://lucide.dev/)
- **Database**: [Supabase PostgreSQL](https://supabase.com/) with Row Level Security (RLS) policies
- **Forms & Validation**: [Zod](https://zod.dev/) & [React Hook Form](https://react-hook-form.com/)
- **Deployment**: [Vercel](https://vercel.com/)

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** v18+ or v20+ (tested on Node v24)
- **npm**

### 2. Installation
```bash
# Navigate to the project root
cd frontend

# Install dependencies
npm install
```

### 3. Environment Configuration
Create a `.env.local` file in the project root:

```bash
cp .env.example .env.local
```

Populate the required environment variables:
```env
# Official AZ Labs WhatsApp Business Contact
AZ_LABS_WHATSAPP_NUMBER="+44 7448 399290"
NEXT_PUBLIC_WHATSAPP_NUMBER="+44 7448 399290"

# Primary Brand Domain
NEXT_PUBLIC_DOMAIN="azlabs.pro"

# Supabase Credentials (optional for development; local in-memory fallback is built-in)
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-public-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-secret-key"

# Admin Authentication Token
ADMIN_SECRET_KEY="az-admin-2026"
```

> **Note on Local Development**: When Supabase credentials are not configured, the application runs on an in-memory/fallback database pre-seeded with all 12 peptide products and sample orders. No database setup is required to immediately test all features.

### 4. Running the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the storefront, or [http://localhost:3000/admin](http://localhost:3000/admin) to view the Admin Console.

### 5. Running Automated Unit Tests
```bash
node test/order-validation.test.mjs
```
The test suite validates:
1. UK WhatsApp number international sanitization (`447448399290`).
2. Order reference format (`AZ-2026-XXXXX`).
3. Correct WhatsApp message encoding and structure.
4. Single vial vs. 10-vial kit box server pricing calculations.
5. Server-side price spoof neutralization (tampered client prices are rejected and recalculated).

---

## 🗄 Supabase Database Setup & Schema

To connect the application to your live Supabase PostgreSQL project:

1. Create a project at [supabase.com](https://supabase.com).
2. Open the **SQL Editor** in the Supabase dashboard.
3. Open `supabase/schema.sql` in this repository, copy its contents, and execute the script.
4. The script will:
   - Enable the `uuid-ossp` extension.
   - Create tables: `products`, `orders`, `order_items`, and `admin_profiles`.
   - Configure foreign keys, unique constraints, and check constraints (`status IN (...)`).
   - Enable **Row Level Security (RLS)** with read and admin policies.
   - Pre-seed the authorized AZ Labs research peptide catalogue.

---

## ⚖️ Compliance & Research Use Only Notice

- **Lawful End-Use Policy**: All peptides supplied by AZ Labs are strictly restricted to verified *in-vitro* laboratory research, chemical characterization, and analytical assay development.
- **Prohibited Uses**: Products are strictly **NOT** for human consumption, medical diagnosis, therapeutic application, or veterinary administration.
- **Destination Verification**: Products are authorized for sale and dispatch exclusively within the United Kingdom and authorized EU jurisdictions under UK REACH and CLP regulations.

---

## 🚢 Deployment to Vercel

1. Push your repository to GitHub or GitLab.
2. Import the project into [Vercel](https://vercel.com/new).
3. Under **Environment Variables**, add:
   - `AZ_LABS_WHATSAPP_NUMBER` (`+44 7448 399290`)
   - `NEXT_PUBLIC_WHATSAPP_NUMBER` (`+44 7448 399290`)
   - `NEXT_PUBLIC_DOMAIN` (`azlabs.pro`)
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `ADMIN_SECRET_KEY`
4. Click **Deploy**.
