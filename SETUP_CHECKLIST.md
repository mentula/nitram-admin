# ✅ Setup Checklist - Get Running in 15 Minutes

Complete these steps in order to start using the Nitram CRM.

---

## Phase 1: Dependencies (2 minutes)

### Step 1.1: Install Node Packages
```powershell
npm install
```

**Expected**: ~1-2 minutes, should complete without errors  
**Troubleshooting**: If errors, delete `node_modules` and try again

---

## Phase 2: Supabase Setup (8 minutes)

### Step 2.1: Create Supabase Account & Project
- [ ] Go to [supabase.com](https://supabase.com)
- [ ] Click "Start your project"
- [ ] Sign up (free tier is fine)
- [ ] Create new project:
  - Name: `nitram-logistics`
  - Database Password: **Save this somewhere safe!**
  - Region: Choose closest to Zambia
  - Click "Create new project"
- [ ] Wait ~2 minutes for provisioning

### Step 2.2: Run Database Migrations

1. **Open SQL Editor**:
   - [ ] In Supabase Dashboard, click "SQL Editor" in sidebar
   - [ ] Click "+ New query"

2. **Run Migration 1** (Initial Schema):
   - [ ] Open `supabase/migrations/001_initial_schema.sql` in your editor
   - [ ] Copy ALL content (Ctrl+A, Ctrl+C)
   - [ ] Paste into Supabase SQL Editor
   - [ ] Click "RUN" button (bottom right)
   - [ ] Wait for "Success" message (~10 seconds)

3. **Run Migration 2** (RLS Policies):
   - [ ] Click "+ New query" again
   - [ ] Open `supabase/migrations/002_rls_policies.sql`
   - [ ] Copy and paste entire file
   - [ ] Click "RUN"
   - [ ] Wait for success

4. **Run Migration 3** (Storage Setup):
   - [ ] Click "+ New query" again
   - [ ] Open `supabase/storage_setup.sql`
   - [ ] Copy and paste entire file
   - [ ] Click "RUN"
   - [ ] Wait for success

**Verify Migration Success**:
- [ ] Go to "Table Editor" in sidebar
- [ ] You should see tables: `profiles`, `customers`, `leads`, `quotes`, `shipments`, etc.
- [ ] If you see tables, migrations worked! ✅

### Step 2.3: Get API Keys

- [ ] In Supabase Dashboard, go to "Settings" → "API"
- [ ] Copy these two values:
  1. **Project URL**: `https://xxxxx.supabase.co`
  2. **anon public key**: Long string starting with `eyJ...`

---

## Phase 3: Environment Configuration (1 minute)

### Step 3.1: Create Environment File

- [ ] In project root, create file `.env.local`
- [ ] Copy this template:

```env
VITE_SUPABASE_URL=paste_project_url_here
VITE_SUPABASE_ANON_KEY=paste_anon_key_here
VITE_SITE_URL=http://localhost:5173
VITE_SITE_NAME=Nitram Logistics
```

- [ ] Replace `paste_project_url_here` with your Project URL
- [ ] Replace `paste_anon_key_here` with your anon key
- [ ] Save file

**Example**:
```env
VITE_SUPABASE_URL=https://abc123.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_SITE_URL=http://localhost:5173
VITE_SITE_NAME=Nitram Logistics
```

---

## Phase 4: First User Setup (3 minutes)

### Step 4.1: Create Admin User in Supabase

1. **Create Auth User**:
   - [ ] In Supabase Dashboard, go to "Authentication" → "Users"
   - [ ] Click "Add user" → "Create new user"
   - [ ] Fill in:
     - Email: `admin@nitramclearing.co.zm` (or your email)
     - Password: Choose a strong password
     - **Check** "Auto Confirm User" checkbox ⚠️ IMPORTANT!
   - [ ] Click "Create User"

2. **Create Profile**:
   - [ ] Go to "Table Editor" → `profiles` table
   - [ ] Click "Insert" → "Insert row"
   - [ ] Fill in:
     - `id`: Copy the user ID from Auth Users page
     - `email`: Same email you used above
     - `full_name`: Your name
     - `role`: Select `super_admin`
     - `is_active`: Check the box
   - [ ] Click "Save"

**Quick Copy**:
- To get user ID: Auth → Users → Click user → Copy ID from URL or user details
- To insert profile: Table Editor → profiles → Insert → Fill fields → Save

---

## Phase 5: Start Application (1 minute)

### Step 5.1: Run Dev Server

```powershell
npm run dev
```

**Expected Output**:
```
VITE v7.x.x ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

### Step 5.2: Open Browser

- [ ] Open browser to: http://localhost:5173
- [ ] You should see the Nitram marketing site
- [ ] Go to: http://localhost:5173/login

### Step 5.3: Login

- [ ] Enter your admin email
- [ ] Enter your password
- [ ] Click "Sign In"
- [ ] You should be redirected to dashboard! 🎉

---

## Phase 6: Verification (2 minutes)

### Test Core Features:

#### Dashboard
- [ ] Navigate to http://localhost:5173/admin/dashboard
- [ ] See KPI cards (showing 0s is normal)
- [ ] See empty charts
- [ ] See "No recent activity"

#### Create Test Customer
- [ ] Click "Customers" in sidebar
- [ ] Click "New Customer"
- [ ] Fill in:
  - Company Name: `Test Company Ltd`
  - Contact Person: `John Doe`
  - Email: `john@example.com`
- [ ] Click "Create Customer"
- [ ] See customer in list ✅

#### Create Test Lead
- [ ] Click "Leads" in sidebar
- [ ] Click "New Lead"
- [ ] Fill in:
  - Contact Name: `Jane Smith`
  - Email: `jane@example.com`
  - Company Name: `Acme Corp`
- [ ] Click "Create Lead"
- [ ] See lead card in "New Leads" column ✅
- [ ] **Try dragging** the card to "Contacted" column ✅

#### Create Test Quote
- [ ] Click "Quotes" in sidebar
- [ ] Click "New Quote"
- [ ] Select the test customer you created
- [ ] Fill in service type: `Customs Clearance`
- [ ] Fill in origin/destination
- [ ] Fill in estimated cost: `5000`
- [ ] Click "Create Quote"
- [ ] Click on the quote to view details
- [ ] Click "Download PDF" ✅
- [ ] PDF should download! ✅

#### Create Test Shipment
- [ ] From quote detail, click "Approve Quote"
- [ ] Then click "Convert to Shipment"
- [ ] See shipment page
- [ ] Click "Add Update" in timeline
- [ ] Change status to "Collected"
- [ ] Add location: `Warehouse A`
- [ ] Add notes: `Cargo collected successfully`
- [ ] Click "Add Update"
- [ ] See update in timeline ✅

---

## ✅ Success Criteria

You're all set up if you can:

- [x] Login as admin
- [x] See the dashboard
- [x] Create a customer
- [x] Create and drag a lead
- [x] Create a quote
- [x] Download a PDF quote
- [x] Convert quote to shipment
- [x] Add shipment timeline updates

**If all checked**: Congratulations! 🎉 Your CRM is fully operational!

---

## 🚨 Troubleshooting

### Problem: Can't login
**Check**:
- [ ] User exists in Auth → Users
- [ ] Profile exists in Table Editor → profiles
- [ ] Profile `id` matches Auth user ID
- [ ] Profile `is_active` is TRUE
- [ ] Profile `role` is `super_admin`

### Problem: "Permission denied" errors
**Fix**:
- [ ] Verify RLS policies were run (002_rls_policies.sql)
- [ ] Check user has profile with correct role
- [ ] Go to SQL Editor, run:
  ```sql
  SELECT * FROM profiles WHERE email = 'your-email@example.com';
  ```
- [ ] Should return one row with your profile

### Problem: npm install errors
**Fix**:
- [ ] Make sure Node.js is installed: `node --version`
- [ ] Delete `node_modules` folder
- [ ] Delete `package-lock.json`
- [ ] Run `npm install` again
- [ ] Restart terminal if still fails

### Problem: "Module not found" errors
**Fix**:
- [ ] Restart dev server (Ctrl+C, then `npm run dev`)
- [ ] Check file paths in imports
- [ ] Make sure file exists

### Problem: Database migration errors
**Fix**:
- [ ] Run migrations in correct order (001, then 002, then storage)
- [ ] Don't run same migration twice
- [ ] If stuck, reset: Project Settings → Database → Reset Database (WARNING: deletes all data)
- [ ] Then run migrations again

### Problem: Can't see data
**Check**:
- [ ] Look in Supabase Table Editor
- [ ] Data might exist but RLS blocking view
- [ ] Check browser console for errors
- [ ] Verify user has correct role

---

## 📞 Still Stuck?

### Debug Checklist:
1. **Check browser console** (F12 → Console tab)
2. **Check terminal** for errors
3. **Check Supabase logs** (Dashboard → Logs)
4. **Verify environment variables** in `.env.local`
5. **Restart everything**: Close terminal, close browser, start fresh

### Common Error Messages:

**"Invalid API key"**
- Check `.env.local` has correct `VITE_SUPABASE_ANON_KEY`
- Make sure key starts with `eyJ`
- No extra spaces or quotes

**"Failed to fetch"**
- Check `.env.local` has correct `VITE_SUPABASE_URL`
- Make sure URL starts with `https://`
- Supabase project might be paused (free tier)

**"Row level security policy violation"**
- User doesn't have profile in `profiles` table
- Or profile `is_active` is false
- Or profile `role` doesn't have permission

---

## 🎉 Next Steps After Setup

Once everything works:

1. **Explore Features**: Click around, try all modules
2. **Create Real Data**: Add your actual customers
3. **Test Workflows**: Complete a full sales cycle
4. **Customize**: Adjust to your business needs
5. **Continue Building**: See `CONTINUE_HERE.md` for next features

---

## 📚 Reference Documents

After setup, read these:
- `QUICK_START.md` - Detailed usage guide
- `CONTINUE_HERE.md` - Next development steps
- `PROJECT_STATUS.md` - What's built, what's next
- `SESSION_SUMMARY.md` - Complete technical overview

---

**Estimated Total Time**: 15-20 minutes if everything goes smoothly

**Pro Tip**: Do this on a fast internet connection. Supabase project creation and npm install download a lot of data.

Good luck! 🚀
