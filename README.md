# VelvetStock | Enterprise Inventory & Requisition Management System

An end-to-end full-stack Inventory Management System featuring a high-performance **Spring Boot 3 + MySQL** REST backend and a bespoke **React 18 + Redux Toolkit** frontend crafted with a custom **Deep Plum / Burgundy / Terracotta / Warm Gold** design system using **100% Plain CSS** (zero third-party UI component libraries).

---

## 1. Project Overview

VelvetStock is built for multi-tier enterprise operations requiring strict role separation across three functional domains:
1. **Executive Administration (`ADMIN`)**: High-level governance, product catalog lifecycle, vendor directories, user access control, broadcast bulletins, and executive financial/inventory valuation intelligence.
2. **Warehouse Operations (`STAFF`)**: Real-time fulfillment queue, physical stock intake, cycle count adjustments, return evaluations (RMA), and dispatch logistics.
3. **Requisition Portal (`VIEWER`)**: E-commerce customer experience for browsing equipment, adding to cart, submitting requisitions, tracking shipments, and initiating returns.

---

## 2. Technology Stack

### Backend
- **Java**: 17 (LTS)
- **Framework**: Spring Boot 3.3.4
- **Security**: Spring Security 6 with stateless JWT (`HMAC-SHA512`)
- **Persistence**: Spring Data JPA / Hibernate 6
- **Database**: MySQL 8.0+
- **Build Tool**: Apache Maven 3.9+

### Frontend
- **Framework**: React 18
- **State Management**: Redux Toolkit (`@reduxjs/toolkit` 2.x) & React Redux
- **Routing**: React Router 6 (`react-router-dom`)
- **Styles**: 100% Pure Vanilla CSS (Variables, modern flexbox/grid, animations, glassmorphism)
- **Icons**: Custom SVG Icon system (0 third-party icon packages)
- **Charts**: Custom interactive SVG Charts (Line, Bar, Donut with tooltips and animations)
- **Bundler**: Vite 5

---

## 3. Production Deployment Architecture

```
┌─────────────────────────────────┐
│     End Users / Browsers        │
└────────────────┬────────────────┘
                 │
                 ▼
┌─────────────────────────────────┐
│        Vercel (Frontend)        │
│   • React 18 SPA + Redux        │
│   • vercel.json SPA rewrites    │
│   • VITE_API_URL -> Render      │
└────────────────┬────────────────┘
                 │ HTTPS REST API + Bearer JWT
                 ▼
┌─────────────────────────────────┐
│        Render (Backend)         │
│   • Spring Boot 3.3.4 (Java 17) │
│   • Port dynamic via $PORT      │
│   • Strict CORS (FRONTEND_URL)  │
│   • Health check: /api/health   │
└────────────────┬────────────────┘
                 │ JDBC / TLS
                 ▼
┌─────────────────────────────────┐
│      Cloud MySQL Database       │
│   • Aiven / Railway / AWS RDS   │
│   • MySQL 8.0+ with UTF8MB4     │
│   • Schema auto-managed (update)│
└─────────────────────────────────┘
```

---

## 4. Environment Variables Reference

### Public Frontend Variables (Vercel)
> [!IMPORTANT]
> Frontend variables are bundled into client-side JavaScript. Only expose public configuration (`VITE_*`). Never store database passwords or JWT secrets here.

| Variable Name | Required | Default (Local Dev) | Production Example | Description |
|---|:---:|---|---|---|
| `VITE_API_URL` | **Yes** | `http://localhost:8080` (or empty for proxy) | `https://velvetstock-api.onrender.com` | Base URL of deployed Spring Boot backend. |

### Private Backend Secrets & Settings (Render)
> [!WARNING]
> Keep backend credentials strictly within your cloud provider's Secret Environment settings. Never commit them to Git.

| Variable Name | Required | Default (Local Dev) | Production Example | Classification | Description |
|---|:---:|---|---|:---:|---|
| `PORT` | Auto | `8080` | Provided by Render (`10000`) | System | HTTP server listening port. |
| `SPRING_DATASOURCE_URL` | Optional | `""` | `jdbc:mysql://host:port/db?useSSL=true` | Secret | Full JDBC connection string if provided by DB host. |
| `DB_HOST` | **Yes\*** | `localhost` | `mysql-prod.aivencloud.com` | Secret | Cloud MySQL hostname. |
| `DB_PORT` | **Yes\*** | `3306` | `15234` | Config | Cloud MySQL port. |
| `DB_NAME` | **Yes\*** | `inventory_management` | `inventory_management` | Config | Target database schema name. |
| `DB_USERNAME` | **Yes\*** | `root` | `avnadmin` | Secret | Cloud database user. |
| `DB_PASSWORD` | **Yes\*** | `1234` | `<strong-db-password>` | Secret | Cloud database password. |
| `DB_SSL` | **Yes** | `false` | `true` | Config | Set `true` for cloud DBs requiring TLS/SSL. |
| `FRONTEND_URL` | **Yes** | `http://localhost:3000,http://localhost:5173` | `https://velvetstock.vercel.app` | Config | Allowed origins for CORS (no trailing slash). |
| `JWT_SECRET` | **Yes** | Built-in default key | `<generated-256bit-base64-secret>` | Secret | Cryptographic signing key for JWT tokens. |
| `JWT_EXPIRATION_MS`| No | `86400000` (24h) | `86400000` | Config | JWT token lifetime in milliseconds. |
| `SEED_DEMO_DATA` | No | `true` | `false` (or `true` for initial setup)| Config | Set `false` in production to prevent inserting demo data. |

*\* Note: `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USERNAME`, and `DB_PASSWORD` are not needed if `SPRING_DATASOURCE_URL` is set.*

---

## 5. Local Development Setup

### Prerequisites
- Java 17 LTS installed (`java -version`)
- Apache Maven 3.9+ (`mvn -version`)
- Node.js 18+ and npm 9+ (`node -v`, `npm -v`)
- MySQL 8.0+ running locally on port `3306`

### 1. Database Setup
```sql
CREATE DATABASE IF NOT EXISTS inventory_management
CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. Start the Backend
```bash
# Navigate to backend directory
cd backend

# Build executable JAR
mvn clean package -DskipTests

# Run application
java -jar target/inventory-management-backend-1.0.0.jar
```
The backend starts at `http://localhost:8080`.
Verify backend health: `http://localhost:8080/api/health`

### 3. Start the Frontend
In a new terminal:
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Run Vite development server
npm run dev
```
The frontend starts at `http://localhost:3000` with Vite automatic API proxying to port `8080`.

---

## 6. Step-by-Step Production Deployment Guide

### Phase 1: Set Up Cloud MySQL Database
Choose a managed cloud MySQL provider (e.g., **Aiven**, **Railway**, **Clever Cloud**, or **AWS RDS**):
1. Create a MySQL 8.0 instance.
2. Note the credentials:
   - Host (e.g. `mysql-velvetstock.aivencloud.com`)
   - Port (e.g. `24581`)
   - Database name: `inventory_management`
   - Username and Password
   - SSL requirement (`DB_SSL=true`)
3. Connect with any SQL client (MySQL Workbench, DBeaver) and create the initial database schema:
   ```sql
   CREATE DATABASE IF NOT EXISTS inventory_management
   CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

### Phase 2: Deploy Spring Boot Backend to Render
1. Push your repository to GitHub.
2. Log in to [Render](https://render.com) and click **New +** $\rightarrow$ **Web Service**.
3. Connect your repository.
4. Configure service details:
   - **Name**: `velvetstock-backend`
   - **Language / Runtime**: `Java` (Ensure Java 17 is selected)
   - **Root Directory**: `backend` (or leave empty if targeting root, using `mvn -f backend/pom.xml`)
   - **Build Command**:
     ```bash
     mvn clean package -DskipTests
     ```
   - **Start Command**:
     ```bash
     java -jar target/inventory-management-backend-1.0.0.jar
     ```
5. Add the **Environment Variables** in Render:
   - `DB_HOST`: `<your-cloud-db-host>`
   - `DB_PORT`: `<your-cloud-db-port>`
   - `DB_NAME`: `inventory_management`
   - `DB_USERNAME`: `<your-cloud-db-username>`
   - `DB_PASSWORD`: `<your-cloud-db-password>`
   - `DB_SSL`: `true`
   - `FRONTEND_URL`: `https://velvetstock.vercel.app` *(update once Vercel domain is created)*
   - `JWT_SECRET`: `<generate-a-strong-secret-key>`
   - `SEED_DEMO_DATA`: `true` *(on first run to populate initial catalog, then set to `false`)*
6. Click **Deploy Web Service**.
7. Once deployed, verify the endpoint:
   `https://<your-render-backend-url>/api/health`
   Should return: `{"status": "UP", "service": "velvetstock-inventory-backend", ...}`

### Phase 3: Deploy Frontend to Vercel
1. Log in to [Vercel](https://vercel.com) and click **Add New Project**.
2. Import your GitHub repository.
3. Configure project settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
4. Add the **Environment Variable**:
   - `VITE_API_URL`: `https://<your-render-backend-url>`
5. Click **Deploy**.
6. Vercel deploys the application and generates your live frontend URL (e.g. `https://velvetstock.vercel.app`).

### Phase 4: Sync CORS & Final Verification
1. Return to the Render dashboard $\rightarrow$ **Environment Variables**.
2. Ensure `FRONTEND_URL` is set to your exact Vercel URL (e.g. `https://velvetstock.vercel.app`).
3. If your Render backend restarts, test:
   - Navigate to `https://velvetstock.vercel.app/login`
   - Log in using demo accounts or registered user.
   - Test catalog browsing, cart operations, orders, reports, and real-time status updates.
   - Verify that hard-reloading `/viewer/cart` or `/admin/users` works seamlessly without 404s (handled by `vercel.json`).

---

## 7. Demo Accounts & Credentials

| Role | Email Address | Password | Permissions & Scope |
|---|---|---|---|
| **ADMIN** | `admin@inventory.com` | `admin123` | Full system access: Products, Categories, Suppliers, Users, Orders, Reports, Announcements, Settings |
| **STAFF** | `staff@inventory.com` | `staff123` | Warehouse intake, stock adjustments, order fulfillment, return approvals, inventory reports, messaging |
| **VIEWER** | `viewer@inventory.com` | `viewer123` | Browse catalog, requisition cart, place orders, order tracking timeline, request returns, message staff |

*The login page also provides 1-click quick-fill buttons for each demo account.*

---

## 8. Role-Based Navigation & Access Rules

| Feature / Page | ADMIN | STAFF | VIEWER | Endpoint Protection |
|---|:---:|:---:|:---:|---|
| **Executive Dashboard** | ✅ | ❌ | ❌ | Backend `/api/reports/*` protected |
| **Warehouse Operations Dashboard** | ✅ | ✅ | ❌ | Route & role checked |
| **Viewer Marketplace Home** | ❌ | ❌ | ✅ | Route & role checked |
| **Inventory Master Ledger** | ✅ | ✅ | ❌ | Staff can view & move stock; Admin can CRUD |
| **Product CRUD** | ✅ | ❌ | ❌ | `POST/PUT/DELETE /api/products` restricted to `ADMIN` |
| **Stock Entry & Movement** | ✅ | ✅ | ❌ | `POST /api/stock-movements` requires `ADMIN` or `STAFF` |
| **Category Management** | ✅ | View Only | View Only | `POST/PUT/DELETE /api/categories` restricted to `ADMIN` |
| **Supplier Directory** | ✅ | ❌ | ❌ | `ADMIN` only |
| **User Account Management** | ✅ | ❌ | ❌ | `/api/users/**` strictly restricted to `ADMIN` |
| **Order Fulfillment** | ✅ | ✅ | ❌ | Updating status restricted to `ADMIN` or `STAFF` |
| **Requisition Catalog & Cart** | ❌ | ❌ | ✅ | Viewer e-commerce workflow |
| **Place Requisition Orders** | ❌ | ❌ | ✅ | `POST /api/orders` creates `SALE_ORDER` |
| **Track Orders** | ❌ | ❌ | ✅ | Viewer personal orders view |
| **Return Requests (RMA)** | ❌ | ❌ | ✅ | Viewer submits claim |
| **Process Returns (RMA)** | ✅ | ✅ | ❌ | Staff approves/completes; restocks inventory |
| **Announcements Broadcast** | ✅ | ❌ | ❌ | `POST /api/announcements` restricted to `ADMIN` |
| **Messaging Channel** | Staff only | Admin & Viewer | Staff only | Role-based participant isolation |

---

## 9. Key Business Logic

### Stock Lifecycle & Automatic Health Evaluation
Every quantity adjustment triggers an automatic status check:
- `OUT_OF_STOCK`: Quantity = 0
- `CRITICAL`: Quantity $\le$ (Minimum Stock / 2)
- `LOW_STOCK`: Quantity $\le$ Minimum Stock
- `EXPIRED`: Current Date $\ge$ Expiry Date
- `EXPIRING_SOON`: Current Date within 30 days of Expiry Date
- `HEALTHY`: Normal optimal operating buffer

### Immutable Stock Movements
Stock quantity is never mutated without recording an immutable `StockMovement` audit record.
Supported movement types:
- `STOCK_IN`: Warehouse shipment intake (+ quantity)
- `PURCHASE`: Vendor Purchase Order intake (+ quantity)
- `STOCK_OUT`: Disposal or damaged product write-off (- quantity)
- `SALE`: Customer order fulfillment dispatch (- quantity)
- `ADJUSTMENT`: Physical cycle count reconciliation (+ or - quantity)
- `RETURN`: Completed customer RMA return (+ quantity restored)
*Negative stock protection is strictly enforced by the backend (`400 Bad Request`).*

### Requisition Order Lifecycle
1. `PENDING`: Placed by viewer; inventory reserved/deducted immediately.
2. `CONFIRMED`: Warehouse accepts the requisition.
3. `PROCESSING`: Order queued for physical picking.
4. `PACKED`: Items boxed and labeled with tracking reference.
5. `SHIPPED`: Courier dispatch in transit.
6. `DELIVERED`: Handed over to destination facility.
7. `CANCELLED`: If cancelled while pending, stock is automatically returned to inventory.
8. `RETURNED`: Processed via RMA workflow.

### Returns (RMA) Workflow
1. Viewer requests return on a `DELIVERED` order specifying reason and notes.
2. Status set to `REQUESTED`.
3. Warehouse Staff reviews claim:
   - `APPROVED`: Authorized for shipment back.
   - `REJECTED`: Declined with staff inspection notes.
   - `COMPLETED`: Items verified by warehouse; automatically restocked into inventory with a `RETURN` movement record.

### Isolated Messaging Architecture
- Supported channels: `ADMIN_STAFF` and `STAFF_VIEWER`.
- Viewers can only communicate with Warehouse Staff regarding orders.
- Warehouse Staff can communicate with Administrators for replenishment and with Viewers for support.
- Unauthorized users attempting to fetch conversations they do not belong to receive `403 Forbidden`.

---

## 10. REST API Reference Overview

| HTTP Method | Endpoint | Allowed Roles | Description |
|---|---|---|---|
| `GET` | `/api/health` | Public | System status and health check |
| `POST` | `/api/auth/login` | Public | Authenticates credentials; returns JWT + User profile |
| `POST` | `/api/auth/register` | Public | Registers new user account |
| `GET` | `/api/auth/me` | Authenticated | Returns currently authenticated user context |
| `GET` | `/api/products` | Authenticated | List products with query, category, subcategory, status filters |
| `GET` | `/api/products/{id}` | Authenticated | Product detail by ID |
| `POST` | `/api/products` | `ADMIN` | Create new product |
| `PUT` | `/api/products/{id}` | `ADMIN` | Update product attributes |
| `DELETE` | `/api/products/{id}` | `ADMIN` | Delete product (with safety checks) |
| `GET` | `/api/categories` | Authenticated | List all departments/categories and subcategories |
| `POST` | `/api/categories` | `ADMIN` | Create category |
| `PUT` | `/api/categories/{id}` | `ADMIN` | Update category |
| `DELETE` | `/api/categories/{id}` | `ADMIN` | Delete category |
| `GET` | `/api/suppliers` | `ADMIN` | List authorized vendors |
| `POST` | `/api/suppliers` | `ADMIN` | Register supplier |
| `GET` | `/api/stock-movements` | `ADMIN`, `STAFF` | Audit trail of inventory movements |
| `POST` | `/api/stock-movements` | `ADMIN`, `STAFF` | Record intake, adjustment, or write-off |
| `GET` | `/api/orders` | Authenticated | List orders (Viewers see only their own) |
| `POST` | `/api/orders` | Authenticated | Place requisition order (`SALE_ORDER` or `PURCHASE_ORDER`) |
| `PUT` | `/api/orders/{id}/status` | `ADMIN`, `STAFF` | Advance order fulfillment status |
| `GET` | `/api/returns` | Authenticated | List return claims |
| `POST` | `/api/returns` | `VIEWER` | Submit return request |
| `PUT` | `/api/returns/{id}` | `ADMIN`, `STAFF` | Process RMA decision (APPROVED, REJECTED, COMPLETED) |
| `GET` | `/api/conversations` | Authenticated | List user's conversations |
| `POST` | `/api/conversations` | Authenticated | Create discussion thread |
| `GET` | `/api/conversations/{id}/messages`| Authenticated | Get message stream (participant only) |
| `POST` | `/api/conversations/{id}/messages`| Authenticated | Send message |
| `GET` | `/api/notifications` | Authenticated | Get user notifications feed |
| `PUT` | `/api/notifications/{id}/read` | Authenticated | Mark notification read |
| `PUT` | `/api/notifications/read-all` | Authenticated | Mark all notifications read |
| `GET` | `/api/announcements` | Authenticated | List broadcast bulletins |
| `POST` | `/api/announcements` | `ADMIN` | Broadcast new bulletin |
| `GET` | `/api/reports/inventory` | `ADMIN`, `STAFF` | Valuation and category breakdown |
| `GET` | `/api/reports/sales` | `ADMIN`, `STAFF` | Sales revenue and order volume |
| `GET` | `/api/reports/purchases` | `ADMIN`, `STAFF` | Supplier procurement analytics |
| `GET` | `/api/reports/stock-movements` | `ADMIN`, `STAFF` | Movement velocity metrics |
| `GET` | `/api/users` | `ADMIN` | User accounts directory |
| `POST` | `/api/users` | `ADMIN` | Create user account |
| `PUT` | `/api/users/{id}` | `ADMIN` | Update user account |
| `DELETE` | `/api/users/{id}` | `ADMIN` | Deactivate/delete user account |

---

## 11. Troubleshooting Common Errors

### 1. Port 8080 or Port 3000 already in use
- **Symptoms**: `Web server failed to start. Port 8080 was already in use.`
- **Resolution**:
  ```powershell
  # Find PID using port 8080
  netstat -ano | findstr :8080
  # Terminate process by PID
  taskkill /PID <PID> /F
  ```

### 2. MySQL Connection Refused
- **Symptoms**: `Communications link failure`, `Access denied for user 'root'@'localhost'`
- **Resolution**:
  - Verify MySQL service is active: `Get-Service MySQL*` or `services.msc`.
  - Verify credentials in `backend/src/main/resources/application.properties` or environment variables.
  - Ensure schema `inventory_management` exists.

### 3. Session Expired (401 Unauthorized)
- **Symptoms**: User automatically redirected to `/login?expired=true`.
- **Resolution**: JWT tokens expire after 24 hours. Log back in with valid credentials.

### 4. CORS Issues in Production
- **Symptoms**: Browser console shows `Access-Control-Allow-Origin: No 'Access-Control-Allow-Origin' header is present`.
- **Resolution**:
  - Check the `FRONTEND_URL` environment variable on your Render backend.
  - Ensure it matches your Vercel URL exactly without a trailing slash (e.g. `https://velvetstock.vercel.app`).

### 5. Vercel SPA Direct Reload 404
- **Symptoms**: Direct navigation or page refresh on `/viewer/cart` or `/admin/users` gives 404 Not Found.
- **Resolution**: Ensured by `frontend/vercel.json` rewrite rule redirecting all requests to `/index.html`.

---

## 12. License & Author
Developed for VelvetStock Enterprise Inventory Management System. All rights reserved.
