# Implement Phase 4: Reporting & Polish

This plan addresses the final phase of the MVP, incorporating business insights, data visualization, real-time alerting (in-app and email), and UI refinement for the Business Management System.

## User Review Required

> [!IMPORTANT]
> **Email Sending Context**: We will install `nodemailer` to handle email alerts. By default, I will set up a mock or console-based mailer transport if no actual SMTP credentials are provided, so you can see the emails in your server console during development. Let me know if you would prefer configuring an exact SMTP service (e.g., SendGrid, Gmail).
> 
> **Overdue Credit Checking Triggers**: Since an "overdue credit" condition progresses passively based on time, triggering an alert exactly when it becomes overdue requires a cron job. To keep the backend simpler and avoid running background jobs, I propose adding a middleware or checking hook that evaluates overdue credits periodically (e.g., when the dashboard is loaded, or when logging in) and emits the necessary alerts. Please confirm if this approach is fine.

## Proposed Changes

### Backend - Database Schema
#### [MODIFY] schema.prisma
- Add the `Notification` model to store in-app alerts (with `message`, `type`, `isRead`, and `createdAt` fields).
- Run `npx prisma db push` to synchronize the changes.

---
### Backend - Controllers & Routes
#### [NEW] src/controllers/reportController.js
- **GET `/api/reports/daily-sales`**: Uses `prisma.sale.aggregate` to return total sales, revenue today, credit/cash splits.
- **GET `/api/reports/product-performance`**: Uses `prisma.saleItem.groupBy` to aggregate quantity and subtotal by `productId`.
- **GET `/api/reports/revenue-trend`**: Retrieves daily revenue totals for the last 7/30 days.

#### [NEW] src/controllers/notificationController.js
- **GET `/api/notifications`**: Retrieves recent unread alerts.
- **PATCH `/api/notifications/:id/read`**: Marks a specific notification as read.

#### [NEW] src/routes/reportRoutes.js
- Registers endpoints under `/api/reports`.

#### [NEW] src/routes/notificationRoutes.js
- Registers endpoints under `/api/notifications`.

#### [MODIFY] src/app.js  (or server.js)
- Mount `/api/reports` and `/api/notifications`.

---
### Backend - Alerts & Email Integrations
#### [NEW] src/utils/mailer.js
- Configuration block for `nodemailer` and an `sendEmailAlert(subject, text)` utility function.

#### [NEW] src/utils/alertService.js
- Helper to process alerts: inserts a `Notification` into the database and calls `sendEmailAlert` if conditions are met.

#### [MODIFY] src/controllers/salesController.js
- Integrate `alertService` check after a successful sale:
  - If a product quantity drops below 5, send a "Low Stock" alert.
  - If a sale total exceeds a threshold (e.g., 50,000), send a "Large Sale" alert.

---
### Frontend - Visualization & Charts
- **NPM Package**: Install `recharts` for charts inside the `frontend` folder.

#### [NEW] src/components/charts/RevenueChart.js
- Renders a line chart for the 7/30 days trend payload.
#### [NEW] src/components/charts/TopProductsChart.js
- Renders a bar chart for the top products performance payload.
#### [NEW] src/components/charts/SalesBreakdownChart.js
- Renders a pie chart splitting credit vs. cash sales.

#### [MODIFY] src/app/dashboard/page.js
- Integrate the above chart components beneath the existing metric cards. Add UI skeletons while fetching data.

---
### Frontend - UI Polish & Notification Bell
#### [NEW] src/components/NotificationBell.js
- A bell icon component that checks `/api/notifications`.
- Displays an unread badge and features a dropdown to review and dismiss alerts.

#### [MODIFY] src/components/sidebar.js (or Navbar)
- Embed `NotificationBell.js` into the global layout so it is always accessible.

## Verification Plan

### Automated / Manual Tests
1. **Reporting Endpoints**: Call `/api/reports/daily-sales` and `/api/reports/revenue-trend` locally, verifying aggregations compute correctly without crashing.
2. **Notification & Email Hooks**: Perform a test cash sale that reduces a product's stock below 5. Confirm that:
   - A `Notification` entry is created and returned by `/api/notifications`.
   - The backend console logs the `nodemailer` mock dispatch for low stock.
3. **Frontend Dashboard Visualization**: Open the dashboard to verify charts render without console errors using `recharts`.
4. **UI**: Check that clicking the notification bell marks items as read and visually removes the red indicator.
