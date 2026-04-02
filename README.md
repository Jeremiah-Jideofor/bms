# Business Management Suite - Inventory Admin (Phase 2)

This project is a modern inventory management dashboard built with Next.js (App Router), Express.js, Prisma, and PostgreSQL. It features a custom UI component system, JWT authentication, and robust inventory/stock management.

## Tech Stack
- **Backend:** Node.js, Express.js, Prisma ORM, PostgreSQL
- **Frontend:** Next.js 14 (App Router), TailwindCSS, Axios, Custom React Components

## Features (Current Progress)
- **Authentication:** JWT-based login/logout, protected routes
- **Products:**
  - View all products in a sortable table
  - Add new products (with validation for all fields, including price/cost)
  - Edit existing products (with POS-style currency input for price/cost)
  - Delete products (with confirmation dialog)
- **Stock Management:**
  - Update stock (add/remove) for any product
  - Stock movement type (IN/OUT) selectable in modal
  - All stock changes are recorded and reflected in product quantity
- **Low Stock Detection:**
  - Dedicated page for low stock products
  - Highlights critical stock levels
- **UI/UX:**
  - Custom Card, Table, Button, Alert, Spinner, Sidebar, Modal, CurrencyInput components
  - All forms and tables use accessible, high-contrast styles
  - All headings and important text use `text-gray-900` for visibility
  - Currency fields display as ₦30,000 but store/send raw numbers
- **Validation:**
  - Price and cost fields require valid, positive numbers
  - All required fields are enforced on the frontend and backend
  - User-friendly error messages for invalid input
- **API:**
  - All requests use Authorization header (JWT from localStorage)
  - Product and stock endpoints fully integrated

## Setup Instructions

### 1. Database Setup
1. Create a PostgreSQL database (e.g., `bms`)
2. In the `backend/.env` file, update the `DATABASE_URL` to point to your database.
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/bms?schema=public"
   ```

### 2. Backend Setup
1. Open a terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run Prisma migrations to create the database tables:
   ```bash
   npx prisma migrate dev --name init
   ```
4. Seed the database with the default Admin user (`admin@bms.com` / `admin123`):
   ```bash
   npm run prisma:seed
   ```
5. Start the backend server:
   ```bash
   npm run dev
   ```
   The backend will start at `http://localhost:5000`.

### 3. Frontend Setup
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the frontend development server:
   ```bash
   npm run dev
   ```
   The frontend will start at `http://localhost:3000`.

## Testing the Application
1. Go to `http://localhost:3000` in your browser. You will be redirected to the Login page.
2. Login with the seeded admin credentials:
   - **Email:** admin@bms.com
   - **Password:** admin123
3. Use the sidebar to navigate:
   - **Dashboard:** View analytics and stats
   - **Products:** View, add, edit, delete, and update stock for products
   - **Low Stock:** See products with low or critical stock

## Accessibility & UX
- All headings and important text use high-contrast colors for visibility
- All forms and modals are keyboard accessible
- Error messages are clear and actionable

## Next Steps
- Add sales/transactions module
- Add user management and permissions
- Add reporting and analytics

---

For any issues, please check backend logs for errors or open an issue in the repository.
