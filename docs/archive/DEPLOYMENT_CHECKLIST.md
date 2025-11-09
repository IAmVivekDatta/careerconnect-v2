# Deployment Checklist - CareerConnect v2

## Pre-Deployment Verification (DO THIS FIRST)

### Code Quality
- [ ] Run `npm run lint --prefix client` - no errors
- [ ] Run `npm run lint --prefix server` - no errors
- [ ] Run `npm run build --prefix client` - succeeds, dist folder created
- [ ] Run `npm run build --prefix server` - succeeds, no TypeScript errors

### Git Status
- [ ] All changes committed: `git status` shows clean working tree
- [ ] Latest commit is on `main` branch: `git branch`
- [ ] No uncommitted changes with `git diff`

### Testing
- [ ] Manual smoke test locally: register, login, create post, like, comment
- [ ] Admin login works: access `/admin/dashboard`
- [ ] Feed loads without errors (console clean)
- [ ] Notifications appear when actions occur
- [ ] No 404s or failed API calls in Network tab

## Render Backend Deployment

### Prerequisites
- [ ] Render account created at https://render.com
- [ ] Connected GitHub repository to Render
- [ ] Environment variables set in Render dashboard:
  - `MONGODB_URI` (MongoDB Atlas connection string)
  - `JWT_SECRET` (strong random string)
  - `JWT_REFRESH_SECRET` (strong random string)
  - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
  - `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
  - `FRONTEND_URL` (Netlify domain)
  - `CORS_ORIGINS` (Netlify domain URL)
  - `NODE_VERSION` (set to `20.x`)
  - `ADMIN_SEED_EMAIL` and `ADMIN_SEED_PASS` (for initial admin seeding)

### Deployment Steps
1. [ ] Go to Render dashboard and select the careerconnect-v2 service
2. [ ] Check "Auto-Deploy" is enabled for the `main` branch
3. [ ] Go to "Deploys" tab and trigger a manual redeploy if needed
4. [ ] Wait for build to complete (check logs for errors)
5. [ ] Once deployed, test the API:
   ```bash
   curl https://careerconnect-v2.onrender.com/api/ping
   # Should return: {"status":"ok"}
   ```
6. [ ] Check CORS headers are present in response
7. [ ] Monitor the "Metrics" tab for CPU/Memory usage
8. [ ] Check logs for any runtime errors

### Seed Admin User (if needed)
```bash
# If admin wasn't seeded during first deployment, manually trigger:
# Option 1: Via Render shell (if available)
# Option 2: Via POST request to /api/seed endpoint (implement if needed)
```

## Netlify Frontend Deployment

### Prerequisites
- [ ] Netlify account created and connected to GitHub repo
- [ ] Build settings configured:
  - Base directory: `client`
  - Build command: `npm run build`
  - Publish directory: `client/dist`
- [ ] Environment variables set in Netlify dashboard:
  - `VITE_API_URL` (Render API domain, e.g., `https://careerconnect-v2.onrender.com/api`)
  - `VITE_GOOGLE_CLIENT_ID` (from Google Cloud Console)
  - `VITE_SENTRY_DSN` (optional, for error tracking)
- [ ] Redirect rules in `client/public/_redirects`:
  ```
  /* /index.html 200
  ```

### Deployment Steps
1. [ ] Go to Netlify dashboard and select the careerconnect-v2 site
2. [ ] Trigger a manual deploy or wait for auto-deploy from main branch
3. [ ] Check "Deploys" tab for successful build (green checkmark)
4. [ ] Review build logs for warnings or errors
5. [ ] Test the live site:
   - Visit https://careerconnectv2.netlify.app
   - Check homepage loads without errors
   - Verify navigation works
   - Test login flow (should redirect to API correctly)
6. [ ] Check Network tab for failed API requests (should all be to Render domain)
7. [ ] Verify images load (avatars, post images)
8. [ ] Test on mobile (responsive design)

## Production Verification

### API Endpoints (via Render)
```bash
# Test ping endpoint
curl https://careerconnect-v2.onrender.com/api/ping

# Test auth endpoint (should require credentials, but should not 500)
curl -X POST https://careerconnect-v2.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test"}'
# Expected: 400 or 401, not 500

# Test feed endpoint (requires auth, should return 401 without token)
curl https://careerconnect-v2.onrender.com/api/posts
# Expected: 401 Unauthorized, not 500
```

### Frontend User Flows
1. [ ] **Public Access**:
   - [ ] Landing page loads
   - [ ] Login page loads
   - [ ] Register page loads

2. [ ] **Student Flow**:
   - [ ] Register as student
   - [ ] Login with email/password
   - [ ] View feed (should be empty initially)
   - [ ] Create a post
   - [ ] Like/comment on own post
   - [ ] View profile
   - [ ] Edit profile (add skills, experience)
   - [ ] View alumni recommendations
   - [ ] View training opportunities

3. [ ] **Alumni Flow**:
   - [ ] Register as alumni (or promote via admin)
   - [ ] Login
   - [ ] View leaderboard
   - [ ] Endorse a skill on another user
   - [ ] View messages
   - [ ] Send a message to student

4. [ ] **Admin Flow**:
   - [ ] Login with admin credentials
   - [ ] Access admin dashboard
   - [ ] View stats cards (users, posts, opportunities)
   - [ ] View and approve opportunities
   - [ ] Manage users (change role, deactivate)
   - [ ] Award badge to user

### Google Sign-In
- [ ] Google Sign-In button visible on login page
- [ ] Click button opens Google consent screen
- [ ] Successful sign-in creates/logs in user
- [ ] Redirects to feed after sign-in
- [ ] Profile shows correct email

### Performance Check
- [ ] Feed page loads in <3 seconds (first visit)
- [ ] Liking/commenting feels instant (<500ms)
- [ ] Images load properly
- [ ] No console errors or warnings (Ctrl+Shift+K)
- [ ] Lighthouse score >80 for Performance (optional, but good practice)

### Error Handling
- [ ] Network error displays gracefully (no white screen)
- [ ] 404 page for invalid routes
- [ ] 403/401 redirects to login when needed
- [ ] Server errors show user-friendly messages

## MongoDB Atlas Verification

### Connection
- [ ] Connection string in Render env vars is correct
- [ ] MongoDB Atlas cluster is running and accessible
- [ ] Database `careerconnect` exists and has collections:
  - `users`
  - `posts`
  - `opportunities`
  - `achievements`
  - `messages`
  - `conversations`
  - `notifications`
  - `endorsements`

### Backup
- [ ] Automated daily backups are enabled in MongoDB Atlas
- [ ] Backup retention is set appropriately (7+ days)

## Release & Version Tagging

### Git Release
```bash
# Create an annotated tag for this release
git tag -a v1.0.0 -m "Production Release: CareerConnect v2 with 9 completed feature steps"

# Push tag to GitHub
git push origin v1.0.0

# Create GitHub Release
# Go to https://github.com/IAmVivekDatta/careerconnect-v2/releases
# Draft new release, select v1.0.0 tag
# Add release notes with summary of all 9 steps
```

### Release Notes Template
```markdown
# CareerConnect v2 - Production Release v1.0.0

## 🎉 Features Completed

### Step 1: Admin Console Foundations
- Real-time stats dashboard with user metrics
- Quick action buttons for admin tasks

### Step 2: Alumni Recommendations
- Skill-based alumni matching algorithm
- Interactive carousel UI

### Step 3: Training Opportunities
- Curated training/course recommendations
- Multi-provider support (Udemy, Coursera, etc.)

### Step 4: Feed Engagement Enhancements
- Like/unlike posts with real-time counters
- Inline comment threads with delete capability
- Native share functionality

### Step 5: Achievements & Badges
- Peer-to-peer skill endorsements
- Badge gallery with points system
- Community leaderboard

### Step 6: Messaging & Notifications
- Direct messaging with conversation history
- Real-time notification bell
- Notification center with unread badge

### Step 7: Profile Personalization
- Enhanced hero section with profile picture
- Editable skills, experience, education
- Badge and endorsement showcase

### Step 8: Documentation
- Comprehensive README with feature matrix
- QA testing checklist (60+ items)
- Deployment guide

## 🚀 Deployment Information
- **Frontend**: https://careerconnectv2.netlify.app
- **Backend API**: https://careerconnect-v2.onrender.com
- **Database**: MongoDB Atlas (shared cluster)

## 📋 Testing Performed
- [ ] All lint checks pass
- [ ] Client builds without errors
- [ ] Server builds without errors
- [ ] Manual smoke testing completed
- [ ] Admin dashboard verified
- [ ] User flows tested end-to-end

## 🔐 Security
- All secrets stored in environment variables
- CORS configured for Netlify domain
- JWT tokens with secure expiry
- Password hashing with bcrypt
- Rate limiting enabled

## ⚡ Performance
- Feed loads in <3 seconds
- API response time <500ms median
- Images optimized via Cloudinary
- No console errors or warnings

## 📝 Known Limitations
- WebSocket messaging not yet implemented (HTTP polling)
- No AI resume scoring (future)
- Mobile app not yet available

## 🙏 Thank You
Thanks to the entire team for making CareerConnect v2 a reality!
```

## Post-Deployment Monitoring

### Daily Checks (First Week)
- [ ] Check Render logs for errors
- [ ] Verify Netlify build logs are clean
- [ ] Monitor MongoDB Atlas metrics (connection count, queries)
- [ ] Test key user flows manually
- [ ] Check for any user-reported issues

### Weekly Checks
- [ ] Review error logs (if Sentry/logging tool is set up)
- [ ] Monitor API response times
- [ ] Verify backups are running
- [ ] Check certificate expiration (HTTPS)

### Monthly Checks
- [ ] Review user growth and engagement metrics
- [ ] Analyze admin moderation queue
- [ ] Check database storage usage
- [ ] Update dependencies if security patches available

## Rollback Plan (If Needed)

### Frontend (Netlify)
```bash
# Go to Netlify Dashboard > Deploys
# Click on a previous successful deploy
# Click "Restore this deploy" to roll back
```

### Backend (Render)
```bash
# Go to Render Dashboard > Deploys
# Select the last known-good deploy
# Click "Redeploy" to roll back
```

## Support & Troubleshooting

### Common Issues

**Frontend won't load:**
- Check VITE_API_URL is set correctly in Netlify
- Verify CORS headers in Render API response
- Clear browser cache (Ctrl+Shift+Delete)

**API returns 500 errors:**
- Check Render logs for server errors
- Verify MONGODB_URI is correct and MongoDB Atlas is accessible
- Check environment variables are set

**Login fails:**
- Verify JWT_SECRET and MONGODB_URI are correct
- Check browser console for specific error messages
- Test with curl to see raw error response

**Google Sign-In not working:**
- Verify GOOGLE_CLIENT_ID is set in both server and client
- Check authorized origins in Google Cloud Console (must include Netlify domain)
- Clear browser cookies and try again

## Sign-Off
- [ ] Product Owner approval
- [ ] QA approval
- [ ] DevOps/Infrastructure approval
- [ ] Final go-live confirmation

---

**Release Date**: October 21, 2025
**Deployed By**: [Your Name]
**Approval**: [Approver Name]
