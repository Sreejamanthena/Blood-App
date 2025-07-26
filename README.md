# 🩸 BloodConnect — A Smart Blood Donation Platform

BloodConnect is a web-based application designed to bridge the gap between *blood donors* and *hospitals*. This platform ensures that hospitals can quickly request and connect with eligible blood donors while providing a seamless and secure experience through Firebase authentication and a responsive modern UI.

---

## 🚀 Features

### 🔐 Authentication
- Register/Login as *Donor* or *Hospital*
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

## 🛠 Tech Stack

- *Frontend*: Next.js, TypeScript, Tailwind CSS
- *State Management*: React Context API
- *Backend & Auth*: Firebase
- *Styling*: Tailwind CSS
- *Deployment*: Vercel / Firebase Hosting (optional)

---

## 📁 Folder Structure (Key Parts)

```bash
BloodConnect/
│
├── app/                  # Main application structure
│   ├── auth/             # Auth-related pages (signup/login)
│   ├── donor/            # Donor dashboard & profile
│   ├── hospital/         # Hospital dashboard & request flow
│   ├── layout.tsx        # App layout component
│   └── globals.css       # Global styles
│
├── components/           # Reusable UI components
├── hooks/                # Custom React hooks
├── lib/                  # Utility and config files
│   ├── auth-context.tsx  # Auth state context
│   ├── firebase.ts       # Firebase config & setup
│   └── utils.ts          # Helper functions
│
├── public/               # Static assets
├── styles/               # Tailwind or custom styles
├── package.json          # Project dependencies
└── tailwind.config.ts    # Tailwind setup
