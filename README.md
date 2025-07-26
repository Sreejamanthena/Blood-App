# 🩸 BloodConnect — A Smart Blood Donation Platform

BloodConnect is a web-based application designed to bridge the gap between **blood donors** and **hospitals**. This platform ensures that hospitals can quickly request and connect with eligible blood donors while providing a seamless and secure experience through Firebase authentication and a responsive modern UI.

> 🎥 **Watch Demo**: [https://youtu.be/hcvfXyZipqE](https://youtu.be/hcvfXyZipqE?si=xSNxok613r9UIyVm)

---

## 🚀 Features

### 🔐 Authentication
- Register/Login as **Donor** or **Hospital**
- Firebase Auth integration for secure access

### 👤 Donor Dashboard
- Create & manage donor profile with:
  - Name, Age, Weight  
  - Phone Number  
  - Location (City, State, Country, Pincode)  
  - Blood Group, Last Donation Date  
- Persistent login — no need to re-enter details  
- Receive and respond to hospital requests via notifications  

### 🏥 Hospital Dashboard
- Search for blood donors based on:
  - Blood group, weight, and age criteria  
- View list of matching donors with limited profile info  
- Send blood requests specifying:
  - Blood group, units needed, hospital address, contact number  
- Receive notification when a donor accepts  

---

## 🛠️ Tech Stack

- **Frontend**: Next.js, TypeScript, Tailwind CSS  
- **State Management**: React Context API  
- **Backend & Auth**: Firebase  
- **Styling**: Tailwind CSS  
- **Deployment**: Vercel / Firebase Hosting (optional)  

---

## 📁 Folder Structure

```bash
blood-donation-app/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Root layout with providers
│   ├── page.tsx                 # Landing page
│   ├── globals.css              # Global styles
│   ├── auth/
│   │   ├── donor/page.tsx       # Donor authentication
│   │   └── hospital/page.tsx    # Hospital authentication
│   ├── donor/
│   │   ├── dashboard/page.tsx   # Donor dashboard
│   │   └── profile-setup/page.tsx # Donor profile setup
│   └── hospital/
│       ├── dashboard/page.tsx   # Hospital dashboard
│       └── profile-setup/page.tsx # Hospital profile setup
├── components/                   # Reusable components
│   ├── ui/                      # shadcn/ui components
│   ├── donor-sidebar.tsx        # Donor navigation
│   ├── hospital-sidebar.tsx     # Hospital navigation
│   ├── request-blood.tsx        # Blood request functionality
│   ├── requested-donors.tsx     # Hospital's requested donors
│   ├── accepted-donors.tsx      # Hospital's accepted donors
│   ├── donor-requests.tsx       # Donor's received requests
│   ├── donor-profile.tsx        # Donor profile management
│   ├── hospital-profile.tsx     # Hospital profile management
│   ├── progress-tracker.tsx     # Request status tracking
│   ├── loading-spinner.tsx      # Loading component
│   └── toaster.tsx              # Toast notifications
├── lib/                         # Utility libraries
│   ├── firebase.ts              # Firebase configuration
│   ├── auth-context.tsx         # Authentication context
│   └── utils.ts                 # Utility functions
└── hooks/                       # Custom React hooks
    └── use-toast.ts            # Toast notification hook


## 🔐 Environment Variables

Create a .env.local file in the root of the project and add your Firebase credentials:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
