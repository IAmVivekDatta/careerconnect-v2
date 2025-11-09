# 🔧 Network Error Fix Guide - Login/Register Issues

**Status**: Network error preventing login/registration  
**Root Cause**: API URL and CORS not configured on production servers  
**Solution**: Updated code + environment variables configuration  

---

## 🎯 What Was Fixed

### Issue Analysis
When users tried to **login** or **register** on https://careerconnectv2.netlify.app:
- ❌ Browser throws network error
- ❌ Request doesn't reach backend at all
- ❌ Users stuck on login page

**Root Causes Identified:**
1. **Frontend (Netlify)**: Missing `VITE_API_URL` environment variable
   - Client axios defaults to `http://localhost:5000/api` (localhost URL!)
   - Production browser can't reach localhost
2. **Backend (Render)**: Missing `CORS_ORIGINS` configuration
   - Server doesn't allow cross-origin requests from Netlify domain
   - CORS headers not sent back to browser

### Code Changes Made

#### ✅ 1. Fixed axios API URL (client/src/lib/axios.ts)
```typescript
// BEFORE: Falls back to localhost
const baseURL = import.meta.env.VITE_API_URL ?? "http://localhost:5000/api";

// AFTER: Falls back to production Render URL
const baseURL = import.meta.env.VITE_API_URL || "https://careerconnect-v2.onrender.com/api";
```

#### ✅ 2. Improved CORS Configuration (server/src/config/env.ts)
```typescript
// BEFORE: Could read empty string if env var not set
CORS_ORIGINS: (
  (process.env.CORS_ORIGINS ?? process.env.FRONTEND_URL ?? process.env.CLIENT_URL ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
)

// AFTER: Falls back to localhost dev URLs if no env vars set
CORS_ORIGINS: (
  (process.env.CORS_ORIGINS || process.env.CLIENT_URL || process.env.FRONTEND_URL || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .length > 0
    ? /* use env vars */
    : ['http://localhost:5173', 'http://localhost:3000']  // Dev fallback
)
```

---

## 📋 Manual Configuration Steps

### STEP 1️⃣: Add VITE_API_URL to Netlify

**Navigate to:** https://app.netlify.com/sites/careerconnectv2/settings/build

1. Scroll to **"Build & Deploy"** section
2. Click **"Environment"**
3. Click **"Edit variables"** button
4. Add new environment variable:
   ```
   Key: VITE_API_URL
   Value: https://careerconnect-v2.onrender.com/api
   ```
5. Click **"Save"**

**Example Screenshot Location:**
```
Netlify Dashboard 
→ careerconnectv2 site
→ Settings
→ Build & Deploy
→ Environment
```

---

### STEP 2️⃣: Add CORS_ORIGINS to Render

**Navigate to:** https://dashboard.render.com/

1. Find **"careerconnect-v2"** service in your services list
2. Click to open service details
3. Click **"Settings"** tab (top navigation)
4. Scroll to **"Environment"** section
5. Add/Update these environment variables:

```
CORS_ORIGINS = https://careerconnectv2.netlify.app
FRONTEND_URL = https://careerconnectv2.netlify.app
CLIENT_URL = https://careerconnectv2.netlify.app
```

**Step-by-step:**
- Find each variable row (or add new if doesn't exist)
- Update the value field
- Click **"Save"** (appears at top or bottom of form)

**Example Environment Table:**
```
Variable Name              | Value
---------------------------|-------------------------------------------
CORS_ORIGINS              | https://careerconnectv2.netlify.app
FRONTEND_URL              | https://careerconnectv2.netlify.app
CLIENT_URL                | https://careerconnectv2.netlify.app
MONGODB_URI               | [already set]
JWT_SECRET                | [already set]
CLOUDINARY_CLOUD_NAME     | [already set]
... (other vars)          | ...
```

---

### STEP 3️⃣: Trigger Netlify Rebuild

**Navigate to:** https://app.netlify.com/sites/careerconnectv2/deploys

1. Click **"Trigger deploy"** button (top right)
2. Select **"Deploy site"** from dropdown
3. Wait for build to complete (2-3 minutes)
   - Status changes from "Building" → "Published"
   - Check build logs if needed

**What this does:**
- Rebuilds frontend with new `VITE_API_URL` env var
- New builds will use correct API URL

---

### STEP 4️⃣: Trigger Render Rebuild

**Navigate to:** https://dashboard.render.com/ → careerconnect-v2 service

1. Scroll to top of service page
2. Look for **"Manual Deploy"** button
3. Click **"Manual Deploy"** → **"Deploy latest commit"**
4. Wait for deployment to complete (3-5 minutes)
   - Status changes from "Building" → "Live"
   - Check build & deploy logs

**What this does:**
- Rebuilds backend with new `CORS_ORIGINS` env vars
- Server will accept requests from Netlify domain

---

## ✅ Verification Steps (After Both Rebuilds Complete)

### Test 1: Frontend Status
```
Go to: https://careerconnectv2.netlify.app
Expected: Page loads without console errors
```

### Test 2: Backend Status
```
Go to: https://careerconnect-v2.onrender.com/api/ping
Expected: See {"status":"ok"} response
```

### Test 3: Login Flow (Most Important ⭐)
```
1. Open https://careerconnectv2.netlify.app
2. Click "Login"
3. Enter test credentials:
   Email: admin@careerconnect.local
   Password: StrongPass123!
4. Click "Login" button
5. Expected: ✅ Successfully logged in → Redirect to /feed
   NOT Expected: ❌ Network error message
```

### Test 4: Register Flow
```
1. Open https://careerconnectv2.netlify.app
2. Click "Register"
3. Fill in form (email must be unique):
   Email: testuser@example.com
   Password: Test123456
   Name: Test User
4. Click "Register"
5. Expected: ✅ Successfully registered → Auto-login → Redirect to /feed
   NOT Expected: ❌ Network error message
```

### Test 5: Google OAuth
```
1. Open https://careerconnectv2.netlify.app/login
2. Click "Sign in with Google"
3. Complete Google sign-in flow
4. Expected: ✅ Successfully authenticated → Redirect to /feed
   NOT Expected: ❌ OAuth error or network error
```

---

## 🔍 Troubleshooting

### Still Getting Network Error After Following Steps?

#### Checklist:
- [ ] Netlify env var `VITE_API_URL` set to `https://careerconnect-v2.onrender.com/api`
- [ ] Render env var `CORS_ORIGINS` set to `https://careerconnectv2.netlify.app`
- [ ] Netlify rebuild completed (check status is "Published")
- [ ] Render rebuild completed (check status is "Live")
- [ ] Browser cache cleared (Ctrl+Shift+Del or Cmd+Shift+Delete)
- [ ] Hard reload page (Ctrl+F5 or Cmd+Shift+R)

#### Check Netlify Build Logs:
1. Go to https://app.netlify.com/sites/careerconnectv2/deploys
2. Click on latest deploy
3. Click **"Deploy log"** tab
4. Look for errors about missing VITE_API_URL

#### Check Render Build Logs:
1. Go to https://dashboard.render.com/ → careerconnect-v2
2. Click **"Events"** tab
3. Find latest deploy, click to expand
4. Look at full build & deploy logs for errors

#### Check Browser Console:
1. Open https://careerconnectv2.netlify.app
2. Press F12 to open DevTools
3. Click **"Console"** tab
4. Try login again
5. Look for error messages (Network tab shows failed requests)

### Network Tab Check (DevTools):
1. Press F12 → **"Network"** tab
2. Try login
3. Look for request to `/api/auth/login`
4. Check:
   - Status code: Should be 200 (success) or 401 (bad credentials), NOT network error
   - Response headers: Should include `Access-Control-Allow-Origin: https://careerconnectv2.netlify.app`

---

## 📊 Configuration Summary

### Frontend (Netlify)
| Setting | Value |
|---------|-------|
| Repository | careerconnect-v2 |
| Branch | main |
| Build Command | `npm run build --prefix client` |
| Publish Directory | `client/dist` |
| **VITE_API_URL** | **https://careerconnect-v2.onrender.com/api** |

### Backend (Render)
| Setting | Value |
|---------|-------|
| Repository | careerconnect-v2 |
| Branch | main |
| Build Command | `npm run build --prefix server` |
| Start Command | `node server/dist/index.js` |
| **CORS_ORIGINS** | **https://careerconnectv2.netlify.app** |
| **FRONTEND_URL** | **https://careerconnectv2.netlify.app** |
| **CLIENT_URL** | **https://careerconnectv2.netlify.app** |

---

## 🚀 How It Works (After Fix)

### Login Flow (Fixed):
```
1. User enters credentials on https://careerconnectv2.netlify.app/login
2. Frontend axios sends POST to https://careerconnect-v2.onrender.com/api/auth/login
3. Backend receives request from Netlify domain
4. CORS headers allow response: "Access-Control-Allow-Origin: https://careerconnectv2.netlify.app"
5. Browser accepts response (no CORS error)
6. Frontend receives JWT token
7. User logged in & redirected to /feed ✅
```

### Before vs After:
```
BEFORE (❌ Network Error):
Login Page → Axios sends to http://localhost:5000 → Browser can't reach → Network Error

AFTER (✅ Working):
Login Page → Axios sends to https://careerconnect-v2.onrender.com → CORS allowed → Works!
```

---

## 📝 Code Commit

**Commit Hash**: `34c131c`  
**Commit Message**: 
```
fix: Configure API URL and CORS properly for production

- Update axios to use Render API as fallback (careerconnect-v2.onrender.com)
- Improve CORS_ORIGINS configuration in server env
- Support multiple CORS origin sources (CORS_ORIGINS, CLIENT_URL, FRONTEND_URL)
- Add fallback origins for localhost dev environment
```

**Files Changed**:
- `client/src/lib/axios.ts` - Updated API URL fallback
- `server/src/config/env.ts` - Improved CORS handling

---

## ✅ Final Checklist

After completing all steps:

- [ ] VITE_API_URL added to Netlify environment
- [ ] CORS_ORIGINS added to Render environment
- [ ] Netlify rebuild triggered and completed
- [ ] Render rebuild triggered and completed
- [ ] Login test passed (no network error)
- [ ] Register test passed (no network error)
- [ ] Google OAuth test passed (no network error)
- [ ] Able to view feed after login
- [ ] Profile page loads
- [ ] Other features working

---

## 🎉 Success!

Once all steps are completed, users should be able to:
- ✅ Register new account without network errors
- ✅ Login with email/password without network errors
- ✅ Login with Google OAuth without network errors
- ✅ Seamlessly use all features on production

**If you encounter any issues, check the troubleshooting section above!**
