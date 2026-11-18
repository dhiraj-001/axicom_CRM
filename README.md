# AcxiomCRM - Enterprise Customer Relationship Management System

AcxiomCRM is a full-featured enterprise Customer Relationship Management (CRM) platform designed to manage the entire sales lifecycle—from lead capture and customer onboarding to pipeline forecasting, automated follow-up tracking, interaction logging, security compliance, and executive BI reporting.

The project is structured with two interchangeable production-ready implementations:
1. **MERN Stack Edition** (Node.js, Express, MongoDB Atlas, React 18, Vite)
2. **ASP.NET Core Edition** (.NET 8 MVC, Entity Framework Core, SQLite)

---

## 1. MERN Stack Edition

### Technology Stack
- **Backend**: Node.js & Express.js REST API
- **Database**: MongoDB (Local or MongoDB Atlas Cloud)
- **Object Modeling**: Mongoose ODM
- **Frontend**: React 18, React Router v6, Axios, Bootstrap 5, Bootstrap Icons, Chart.js (`react-chartjs-2`)
- **Bundler & Tooling**: Vite 6
- **Authentication**: Stateless JWT Authentication with HTTP-Only Cookies & Bearer tokens, bcryptjs hashing, account lockout after 5 failed attempts
- **Data Export**: Native CSV streaming engine (`json2csv`)

---

### Project Directory Structure
```
axicom_CRM/
├── client/                     # React + Vite Frontend
│   ├── src/
│   │   ├── api/                # Axios interceptors & base config
│   │   ├── components/         # Layout, Sidebar, Header, ProtectedRoute
│   │   ├── context/            # AuthContext & Session Provider
│   │   ├── pages/              # Dashboard, Customers, Leads, Deals, Kanban, etc.
│   │   ├── App.jsx             # Role-based route definitions
│   │   └── main.jsx            # Entry point
│   ├── index.html
│   └── vite.config.js
│
├── server/                     # Node.js + Express Backend
│   ├── config/                 # Database connection (Mongoose)
│   ├── controllers/            # Auth, Customer, Lead, Opportunity, Reports, etc.
│   ├── middleware/             # auth.js, role.js (RBAC), audit.js
│   ├── models/                 # User, Customer, Lead, Opportunity, FollowUp, etc.
│   ├── routes/                 # Express API routes
│   ├── seed/                   # Seed script with realistic CRM dataset
│   ├── server.js               # Application entry point
│   ├── .env                    # Environment configuration
│   └── .env.example
│
└── package.json                # Root orchestration scripts
```

---

### Seed Credentials for Testing
| Role | Email | Password | Access Scope |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@acxiomcrm.com` | `Admin@123` | System-wide visibility, user management, lockout override, audit trail |
| **Manager** | `manager@acxiomcrm.com` | `Manager@123` | Team pipeline, deals, customers, leads, reports, audit logs |
| **Sales Executive** | `sales@acxiomcrm.com` | `Sales@123` | Scoped to own assigned leads, deals, follow-ups, and clients |
| **Sales Executive 2** | `sales2@acxiomcrm.com` | `Sales@123` | Scoped to own assigned leads, deals, follow-ups, and clients |

---

### Local Quickstart

#### 1. Setup Environment
In `server/.env`:
```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/acxiom_crm?retryWrites=true&w=majority
JWT_SECRET=super_secret_jwt_key_acxiom_crm_2026_secure
CLIENT_URL=http://localhost:5173
```

#### 2. Seed Initial Database
```bash
npm run seed
```

#### 3. Run Backend and Frontend
In terminal 1 (Backend API):
```bash
npm run server
```

In terminal 2 (Frontend Client):
```bash
npm run client
```

Navigate to `http://localhost:5173`.

---

## 2. Free Cloud Hosting Deployment Guide

### Step 1: Free Cloud Database (MongoDB Atlas)
MongoDB Atlas offers a lifetime 100% free cloud cluster (M0 sandbox tier) with 512 MB storage and zero credit card requirement.

1. Go to [https://www.mongodb.com/cloud/atlas/register](https://www.mongodb.com/cloud/atlas/register) and create an account.
2. Select **M0 Free Tier** and pick any cloud provider/region (e.g. AWS / Mumbai or Frankfurt).
3. Under **Security &rarr; Database Access**, click **Add New Database User**:
   - Authentication Method: **Password**
   - Username: `crmadmin`
   - Password: `<choose_a_strong_password>`
   - Database User Privileges: `Read and write to any database`
4. Under **Security &rarr; Network Access**, click **Add IP Address**:
   - Choose **Allow Access from Anywhere** (`0.0.0.0/0`) so cloud servers (Render/Vercel) can connect.
5. Under **Deployments &rarr; Database**, click **Connect &rarr; Drivers (Node.js)**:
   - Copy connection string:
     `mongodb+srv://crmadmin:<password>@cluster0.xxxxx.mongodb.net/acxiom_crm?retryWrites=true&w=majority`
   - Replace `<password>` with your database password.
6. Paste this URI into `server/.env` as `MONGODB_URI` and run `npm run seed` to populate demo data.

---

### Step 2: Free Backend Hosting (Render.com)
Render provides free web services for Node.js backends.

1. Push your repository to GitHub:
   ```bash
   git init
   git add .
   git commit -m "AcxiomCRM initial commit"
   git remote add origin https://github.com/<your-username>/axicom_crm.git
   git push -u origin main
   ```
2. Log into [Render.com](https://render.com) with GitHub.
3. Click **New + &rarr; Web Service**.
4. Select your `axicom_crm` repository.
5. Configure service settings:
   - **Name**: `acxiom-crm-api`
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Instance Type**: `Free`
6. Under **Environment Variables**, add:
   - `MONGODB_URI`: `<Your MongoDB Atlas connection URI>`
   - `JWT_SECRET`: `<Your strong JWT secret string>`
   - `NODE_ENV`: `production`
   - `CLIENT_URL`: `*` (or your frontend Vercel URL)
7. Click **Create Web Service**. Your API URL will be:
   `https://acxiom-crm-api.onrender.com`

---

### Step 3: Free Frontend Hosting (Vercel)
Vercel offers instant, high-speed static hosting on its free tier.

1. Log into [Vercel.com](https://vercel.com) with GitHub.
2. Click **Add New... &rarr; Project** and select `axicom_crm`.
3. In configuration:
   - **Root Directory**: Click Edit and select `client`
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Under **Environment Variables**, add:
   - `VITE_API_URL`: `https://acxiom-crm-api.onrender.com/api`
5. Click **Deploy**. Your frontend is live with automatic SSL!

---

## 3. Core Functional Modules

1. **Role-Based Access Control (RBAC)**
   - Role scoping across Admin, Manager, and SalesExecutive.
   - Resource Scoping: SalesExecutives can only access their assigned leads, opportunities, follow-ups, and clients.
   - Password policy & account lockout protection (5 failed attempts locks account for 15 minutes).

2. **Customer Master Management**
   - Unique code generation (`CUST-XXXX`), duplicate phone/email detection, customer profile 360° view with linked deals and follow-ups.

3. **Lead Management & Conversion**
   - Source tracking, deal size estimation, sales rep assignment.
   - 1-Click Lead-to-Customer conversion promoting prospects to Customer master and optional Opportunity.

4. **Opportunities & Kanban Pipeline Board**
   - Deal stages: Qualification, Proposal, Negotiation, Won, Lost.
   - Visual Kanban board with stage transition controls and weighted pipeline value calculation (`Amount * Probability / 100`).
   - Business validations: Amount > 0, probability 0-100%, close date >= today.

5. **Follow-Up Scheduling & Overdue Alerts**
   - Reminders for Calls, Meetings, Emails, Tasks.
   - Overdue highlight banners and quick completion toggles.

6. **Activity Timeline**
   - Interaction logs, call notes, and customer touchpoints.

7. **Governance & Audit Trail**
   - Immutable audit logs capturing user actions, IP address, data mutations, and security events.

8. **Reports & BI Analytics**
   - Pipeline breakdown, conversion funnel by source, executive sales leaderboards, and 1-click CSV data export.
