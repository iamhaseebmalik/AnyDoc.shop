# Passport Perfect

# 🎯 MVP: AI Passport & ID Editing Website

## Product Name (Working)

**IDPerfect.ai** / **PassportFix.ai** (placeholder)

## Core Purpose

Allow users to **upload passport or ID documents**, then **edit both the photo and written data using AI**, while ensuring **passport-style compliance** (background, face alignment, text format).

---

# 🧩 TARGET USERS

* Individuals needing passport/visa photo correction
* Students & expats
* Travel agents
* HR & visa consultants
* Government-format photo preparation services

---

# 🏗️ MVP MODULES OVERVIEW

1. User Website (Frontend)
2. AI Document Processing Engine
3. Secure File Handling
4. Admin Dashboard
5. Compliance & Safety Layer

---

# 🌐 USER FLOW (END-TO-END)

### Step 1: Upload Document

* User uploads:

  * Passport
  * National ID
  * Driving License
* Formats:

  * JPG, PNG, PDF
* Max size:

  * 10 MB

---

### Step 2: AI Detection & Preview

AI automatically detects:

* Face photo area
* Text fields (OCR)
* MRZ zone (if passport)
* Document type & country

User sees:

* Original document preview
* Detected editable zones highlighted

---

### Step 3: Photo Editing (AI-Powered)

User can:

* Replace passport photo
* Upload new face photo OR generate via camera
* AI auto-adjusts:

  * Background (white / blue / country-specific)
  * Face centering
  * Head size & alignment
  * Lighting & shadows
  * Remove glasses / noise (optional)

**Controls**

* Background color selector
* Crop & alignment auto-lock
* Face quality score (Low / Good / Perfect)

---

### Step 4: Text Data Editing (AI OCR + Smart Edit)

AI extracts text fields:

* Full Name
* Date of Birth
* Passport / ID Number
* Nationality
* Issue Date
* Expiry Date
* Gender

User can:

* Edit text manually
* Select font style (auto-matched to original)
* Auto-align text back to original position
* Toggle:

  * Uppercase
  * Spacing correction
  * Character validation (numbers/letters)

⚠️ **MRZ fields**

* Editable only via guided input
* AI auto-regenerates MRZ format correctly

---

### Step 5: Compliance Check

Before download:

* AI verifies:

  * Face position
  * Head size
  * Eye alignment
  * Background uniformity
  * Blur & resolution
* Country-specific rules (Phase 2)

Status shown:

* ✅ Compliant
* ⚠️ Needs adjustment
* ❌ Not compliant

---

### Step 6: Export & Download

User can download:

* High-resolution image
* PDF
* Print-ready version

Watermark rules:

* Free version → watermark
* Paid → no watermark

---

# 🤖 AI & TECH STACK (MVP-LEVEL)

### AI Components

* Face Detection & Landmark Model
* OCR (passport-grade)
* Background segmentation
* Font matching (basic)
* MRZ validation engine

### AI Actions

* Auto crop
* Auto lighting correction
* Text re-rendering
* Alignment normalization

---

# 💳 MONETIZATION (MVP)

### Pricing Options

* Pay per document
* Credit system
* Monthly plan (agents)

Example:

* 1 edit → $3
* 10 edits → $20
* Unlimited monthly → $49

---

# 🔐 SECURITY & PRIVACY (CRITICAL)

Mandatory MVP Rules:

* Files auto-deleted after X hours
* No public URLs
* Encrypted storage
* GDPR-style consent checkbox

User confirmation:

> “I confirm I have legal permission to edit this document.”

---

# 🧑‍💻 ADMIN DASHBOARD (MVP)

### Admin Login

Role-based access

---

### Admin Features

#### 1. Document Management

* View uploaded files (masked preview)
* Auto-delete rules
* Download logs

---

#### 2. AI Settings

* Enable / disable:

  * Photo replacement
  * Text editing
  * MRZ editing
* Confidence threshold control

---

#### 3. Pricing & Plans

* Set prices
* Create coupons
* Enable free trials

---

#### 4. User Management

* View users
* Block suspicious activity
* Download usage logs

---

#### 5. Compliance Controls

* Country rule presets
* Allowed document types
* Watermark rules

---

# 🎨 UI / UX STYLE GUIDE (For FIGMA)

### Theme

* Clean
* Trust-focused
* Government-like feel

### Colors

* Primary: Deep Blue (#0A1F44)
* Accent: Green (#2ECC71)
* Background: Light Gray (#F5F7FA)

### Fonts

* Inter / Roboto
* High legibility

---

# 📱 RESPONSIVE REQUIREMENTS

* Desktop: Full editor
* Mobile: Upload + basic edit
* Tablet: Full edit

---

# ⚠️ LEGAL DISCLAIMER (IMPORTANT)

MVP must clearly state:

* Not affiliated with government
* Editing does not guarantee acceptance
* User responsible for legality

---

# 🚀 FUTURE PHASE (Not MVP)

* Country-specific passport presets
* API for travel agencies
* Bulk upload
* Webcam live capture
* AI auto-fill from selfie

---

## ✅ FINAL MVP SUMMARY

This MVP:
✔ Solves a **real visa & passport pain point**
✔ Uses AI where it actually matters
✔ Is monetizable immediately
✔ Can be built in **phases**
✔ Safe & compliant for launch

---

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://id-idyll.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/728e0192-e6c8-41e4-829c-58059047e6c8).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
