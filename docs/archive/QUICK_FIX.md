# ⚡ QUICK FIX CHECKLIST - Network Error (Login/Register)

## 🚨 The Problem
Login/Register on production shows: **"Network Error"** and doesn't proceed

## 🔧 The Solution (5 Steps - 10 Minutes)

### ✅ STEP 1: Add API URL to Netlify (2 min)
```
1. Go to: https://app.netlify.com/sites/careerconnectv2/settings/build
2. Find: "Environment" section
3. Click: "Edit variables"
4. Add: VITE_API_URL = https://careerconnect-v2.onrender.com/api
5. Save
```

### ✅ STEP 2: Add CORS to Render (2 min)
```
1. Go to: https://dashboard.render.com/
2. Find: "careerconnect-v2" service
3. Click: "Settings" tab
4. Find: "Environment" section
5. Add/Update:
   CORS_ORIGINS = https://careerconnectv2.netlify.app
   FRONTEND_URL = https://careerconnectv2.netlify.app
   CLIENT_URL = https://careerconnectv2.netlify.app
6. Save
```

### ✅ STEP 3: Rebuild Netlify (3 min wait)
```
1. Go to: https://app.netlify.com/sites/careerconnectv2/deploys
2. Click: "Trigger deploy"
3. Select: "Deploy site"
4. Wait for: Status = "Published"
```

### ✅ STEP 4: Rebuild Render (4 min wait)
```
1. Go to: https://dashboard.render.com/
2. Find: "careerconnect-v2" service
3. Click: "Manual Deploy" button
4. Select: "Deploy latest commit"
5. Wait for: Status = "Live"
```

### ✅ STEP 5: Test Login (1 min)
```
1. Go to: https://careerconnectv2.netlify.app/login
2. Enter:
   Email: admin@careerconnect.local
   Password: StrongPass123!
3. Click: "Login"
4. Expected: ✅ See Feed Page (No error!)
```

---

## 🎯 What Changed?

### Code Fix (Already Done ✅)
- Updated `client/src/lib/axios.ts` - Uses production API as fallback
- Updated `server/src/config/env.ts` - Handles CORS_ORIGINS properly

### Your Action Required
- **Set environment variables** on Netlify & Render (5 steps above)

---

## ✅ Success Indicators
- [ ] Netlify deploy shows "Published"
- [ ] Render deploy shows "Live"
- [ ] Login page loads without console errors
- [ ] Can login with email/password
- [ ] Can see Feed after login
- [ ] Can register new account
- [ ] Can login with Google OAuth

---

## 🆘 If It Still Doesn't Work

### Clear Browser Cache
- Chrome: Ctrl + Shift + Delete
- Mac: Cmd + Shift + Delete
- Then hard reload: Ctrl + F5 (or Cmd + Shift + R)

### Check Netlify Deploy Logs
- https://app.netlify.com/sites/careerconnectv2/deploys
- Click latest deploy → "Deploy log"
- Look for build errors

### Check Render Logs
- https://dashboard.render.com/ → careerconnect-v2
- Click "Events" tab
- Check build & deploy logs

### Open Browser Console (F12)
1. Press F12
2. Go to "Network" tab
3. Try to login
4. Look for `/api/auth/login` request
5. Check Status code (should be 200 or 401, NOT network error)

---

## 📞 Questions?

Refer to **NETWORK_ERROR_FIX.md** for:
- Detailed troubleshooting
- How the fix works
- Complete configuration checklist
