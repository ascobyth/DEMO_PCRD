# NextgenPCRD - Project Index

## Overview
**NextgenPCRD** (Next Generation Process Control and Research Development) is a comprehensive laboratory management system built with Next.js, designed for polymer testing workflows, equipment management, and request processing in industrial research environments.

**Technology Stack:**
- **Frontend:** Next.js 15.1.0, React 19, TypeScript
- **UI Framework:** Tailwind CSS, Radix UI components, Shadcn/ui
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** Custom JWT-based authentication
- **Deployment:** Vercel-ready

---

## 📁 Project Structure

### 🎯 Core Application (`/app`)

#### **Authentication & Access Control**
- `/login` - User authentication interface
- `/unauthorized` - Access denied page
- **Auth Provider** (`components/auth-provider.tsx`) - Centralized authentication management

#### **Main Dashboard & Navigation**
- `/dashboard` - Main dashboard with request overview, statistics, and notifications
- **Dashboard Layout** (`components/dashboard-layout.tsx`) - Shared layout component
- **User Header** (`components/user-header.tsx`) - User information and navigation

#### **Request Management System**

##### **Request Creation** (`/request/new`)
- **Request Type Selection** (`page.tsx`) - Choose between NTR, ASR, or ER
- **Normal Test Request (NTR)** (`/ntr`) - Standard polymer testing workflows
  - Form interface, smart assistant, test method selection
  - Summary and confirmation pages
- **Analysis Solution Request (ASR)** (`/asr`) - Custom analysis solutions
  - Problem definition, methodology specification
  - Business impact and urgency assessment
- **Equipment Reservation (ER)** (`/er`) - Laboratory equipment booking
  - Equipment selection, time slot management
  - Booking confirmation and management

##### **Request Processing** (`/request-management`)
- **Manager Approval** (`/manager-approval`) - Request approval workflows
- **ASR Management** (`/asr`) - ASR-specific processing
- **ER Management** (`/er`) - Equipment reservation management
- **Assignment Management** (`/assign-due`) - Task assignment and due dates

#### **Laboratory Operations** (`/lab360`)
- **Equipment Management** (`/equipment`) - Laboratory equipment tracking
- **Main Lab Interface** (`page.tsx`) - Laboratory operations dashboard

#### **Administrative Functions** (`/admin`)
- **Database Configuration** (`/database-config`) - System configuration
  - Add/manage capabilities, locations, I/O numbers, app technologies
  - User management and system settings

#### **Analysis & Reporting**
- `/analysis-toolkit` - Data analysis tools
- `/results-repository` - Test results storage and retrieval
- `/requests` - Historical request management

---

## 🔧 Core Components (`/components`)

### **Request Management Components**
- `request-card.tsx` - Request display cards
- `request-details-dialog.tsx` - Detailed request information
- `request-status-badge.tsx` - Status indicators
- `asr-evaluation-dialog.tsx` - ASR evaluation interface
- `evaluation-dialog.tsx` - General evaluation forms
- `terminate-request-dialog.tsx` - Request termination

### **Equipment & Laboratory**
- `add-equipment-dialog.tsx` - Equipment registration
- `edit-equipment-dialog.tsx` - Equipment modification
- `er-booking-details-dialog.tsx` - Booking information
- `er-slot-approval-dialog.tsx` - Booking approval

### **Sample Management** (`/components/samples`)
- `SampleForm.tsx` - Sample data entry
- `SampleTable.tsx` - Sample data display
- `SampleDialog.tsx` - Sample management dialogs
- `LoadSampleDialog.tsx` & `SaveSampleDialog.tsx` - Sample I/O operations

### **UI Infrastructure** (`/components/ui`)
Comprehensive UI component library built on Radix UI:
- Form controls, dialogs, navigation, data display
- Consistent design system with Tailwind CSS

---

## 🔌 API Layer (`/app/api`)

### **Authentication** (`/auth`)
- `login/route.js` - User authentication endpoint

### **Request Management** (`/requests`)
- CRUD operations for all request types
- Status management and approval workflows
- File uploads and document management

### **Specialized Request Types**
- `/asrs` - ASR-specific operations with sub-requests
- `/commercial-samples` - Commercial sample management
- `/testing-samples` - Testing sample operations

### **Equipment & Resources** (`/equipment`)
- Equipment management, booking, and approval
- Slot management and availability checking

### **Administrative APIs**
- `/users` - User management
- `/capabilities` - Testing capability management
- `/locations` - Laboratory location management
- `/notifications` - System notifications

### **File Management** (`/upload`)
- File upload and storage
- Test result document management

---

## 🗄️ Data Models (`/models`)

### **Core Entities**
- **User.js/ts** - User accounts and authentication
- **RequestList.js** - General request management
- **AsrList.js/ts** - Analysis Solution Requests
- **ErList.js** - Equipment Reservations
- **TestingERList.js** - Testing equipment reservations

### **Laboratory Resources**
- **Equipment.js/ts** - Laboratory equipment catalog
- **Capability.js/ts** - Testing capabilities
- **TestingMethod.js** - Available test methods
- **Location.js** - Laboratory locations

### **Sample Management**
- **TestingSample.js** - Individual test samples
- **TestingSampleList.js** - Sample collections
- **SampleCommercial.js** - Commercial samples
- **SampleSet.js** - Sample groupings

### **System Features**
- **Notification.js/ts** - System notifications
- **UserScore.js** - User performance tracking
- **Complaint.js** - Issue reporting
- **TimeReservation.js** - Time slot management

---

## ⚙️ Configuration & Infrastructure

### **Database Configuration** (`/lib`)
- `db.ts` - MongoDB connection management
- `auth.ts` - Authentication utilities
- `api-client.ts` - API communication layer

### **Development Tools**
- `restart-dev.ps1` & `restart-dev.bat` - Development server management
- `clean-start.sh` - Clean development environment setup
- Various debugging and testing scripts

### **Build Configuration**
- `next.config.mjs` - Next.js configuration with optimization
- `tailwind.config.js` - Tailwind CSS theming
- `tsconfig.json` - TypeScript configuration

---

## 🚀 Key Features

### **Multi-Type Request System**
1. **Normal Test Requests (NTR)** - Standard testing workflows
2. **Analysis Solution Requests (ASR)** - Custom analysis development
3. **Equipment Reservations (ER)** - Self-service equipment booking

### **Smart Workflow Management**
- Intelligent method selection and recommendations
- Automated approval workflows
- Progress tracking and status management

### **Laboratory Integration**
- Equipment availability and booking
- Sample tracking and management
- Test result documentation

### **Administrative Control**
- User role management and permissions
- System configuration and maintenance
- Performance tracking and reporting

### **Real-time Features**
- Live notifications and updates
- Real-time status tracking
- Interactive dashboards

---

## 📋 Request Workflow

1. **Request Creation** - Users select request type and provide details
2. **Smart Assistant** - AI-powered recommendations for test methods
3. **Review & Submit** - Request validation and submission
4. **Manager Approval** - Supervisor review and approval process
5. **Laboratory Assignment** - Task assignment to technical staff
6. **Execution Tracking** - Progress monitoring and updates
7. **Results Management** - Documentation and delivery
8. **Evaluation & Feedback** - Quality assessment and scoring

---

## 🔐 Security & Access Control

### **Role-Based Permissions**
- **SuperAdmin/Admin** - Full system access
- **ATCManager/RequesterManager** - Management functions
- **EngineerResearcher** - Standard user access
- **Technician/TechnicianAssistant** - Laboratory operations

### **Authentication Features**
- Secure login with session management
- Protected routes and middleware
- User session persistence

---

## 📊 Database Schema

**Primary Database:** `smr_augment` (MongoDB)

**Core Collections:**
- Users, Requests (NTR/ASR/ER), Equipment, Samples
- Capabilities, Locations, Notifications, TestingMethods
- UserScores, Complaints, TimeReservations

---

## 🛠️ Development Commands

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Code quality check

# Database Management
node export-database.js     # Database backup
node migrate-to-atlas.js    # Database migration

# Development Server Management
./restart-dev.ps1           # Restart with cache clear
./clean-start.sh           # Clean environment setup
```

---

## 📄 Documentation Files

- `CLAUDE.md` - Development guidelines and commands
- `STATUS_UPDATE_INSTRUCTIONS.md` - Status update procedures
- `PROJECT_INDEX.md` - This comprehensive project index

---

*This index serves as a navigation guide and architectural overview for the NextgenPCRD laboratory management system. For specific implementation details, refer to individual component files and their documentation.* 