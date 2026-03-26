# E-Commerce Admin Panel

A modern, full-featured e-commerce admin dashboard built with **Next.js 16**, **TypeScript**, **Tailwind CSS v4**, and **shadcn/ui**. Designed to manage every aspect of an online store from a single, clean interface.

## Features

### Dashboard
- Real-time KPI cards: Total Revenue, Total Orders, Total Sales, Total Products
- Sales trend chart (Recharts)
- Recent orders table
- Top-performing products
- Recent customers with a link to the full customers list
- Low-stock and out-of-stock product alerts

### Pages
| Route | Description |
|---|---|
| `/dashboard` | Analytics overview with KPIs, charts, and activity feeds |
| `/customers` | List all customers with delete confirmation |
| `/orders` | Search & filter orders by ID, date range, payment status, and method; view order details and update order status |
| `/products` | Tabular product list with featured toggle, edit, and delete |
| `/products/new` | Rich product creation form (title, description, SKU, discount, categories, sizes, benefits, ingredients, rich-text long description, multi-image upload) |
| `/categories` | Add, edit, and delete product categories with image upload |
| `/subcategories` | Add, edit, and delete subcategories linked to a parent category |
| `/coupons` | Create coupons with date range picker; list, edit, and delete coupons |
| `/topbar` | Manage promotional topbar banners with optional CTA button |
| `/website-banners` | Upload and manage website banner images |
| `/app-banners` | Upload and manage app banner images |
| `/offers` | Home screen offer management |
| `/reviews` | Customer review management |
| `/analytics` | Detailed analytics page |
| `/admins` | Admin user management |

### Layout
- Persistent collapsible **sidebar** with icon-only mode
- Fixed **navbar** with logo, notifications, and settings icons
- Sidebar links with Lucide React icons for all sections

## Tech Stack

| Technology | Purpose |
|---|---|
| Next.js 16 (App Router) | Framework with Turbopack |
| TypeScript | Type safety |
| Tailwind CSS v4 | Styling |
| shadcn/ui + Radix UI | UI components (Dialog, Select, Switch, Popover, etc.) |
| Recharts | Charts and data visualization |
| Lucide React | Icons |
| Quill (react-quill-new) | Rich text editor for product descriptions |
| React Day Picker | Date range picker for coupons and order filters |
| date-fns | Date utilities |
| cookies-next | Cookie-based auth handling |

## Getting Started

### Prerequisites
- Node.js 18+
- Backend API running (NestJS-based e-commerce API)

### Installation

```bash
npm install
```

### Environment Setup

Create a `.env.local` file in the root:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
npm run build
npm start
```

## Project Structure

```
app/
├── layout.tsx            # Root layout with sidebar and navbar
├── page.tsx              # Entry redirect
├── dashboard/            # Dashboard home
├── customers/            # Customer management
├── orders/               # Order management
├── products/             # Product list and creation
├── categories/           # Category management
├── subcategories/        # Subcategory management
├── coupons/              # Coupon management
├── topbar/               # Topbar banner management
├── website-banners/      # Website banner management
├── app-banners/          # App banner management
├── offers/               # Home screen offers
├── reviews/              # Review management
├── analytics/            # Analytics page
└── admins/               # Admin management

components/               # Reusable UI components
lib/                      # API client and utilities
hooks/                    # Custom React hooks
types/                    # TypeScript type definitions
```
