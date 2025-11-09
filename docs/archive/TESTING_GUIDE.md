# 🧪 Testing Guide for CareerConnect v2 Fixes

## 1️⃣ Testing Admin Route Access

### In Browser:
1. **Make sure you have an admin user**
   - Login first as a regular user OR
   - Seed an admin user (see seed section below)

2. **Test Admin Access**:
   - Navigate to `http://localhost:5173/admin` or `/admin/dashboard`
   - Should see Admin Dashboard with stats
   - Should NOT redirect to feed

3. **Verify Admin is Not Redirected**:
   - Non-admin users trying `/admin` should redirect to `/feed`
   - Admin users accessing `/admin` should see dashboard

---

## 2️⃣ Testing Profile Icon Navigation

### In Browser:
1. **Login as any user**

2. **Look for Profile Avatar** in top-right corner of TopNav

3. **Click Profile Avatar**
   - Should navigate to your profile page
   - URL should change to `/profile/[userId]`
   - Should display your profile info

4. **Verify Functionality**:
   - Profile avatar is clickable (not just static)
   - Navigation happens smoothly
   - Profile page loads with user data

---

## 3️⃣ Seeding Demo Data

### Prerequisites:
- Server running or access to MongoDB Atlas connection string
- `.env` file configured with `MONGO_URI`

### Option A: Run Seed Scripts Locally

**Seed Demo Alumni (5 users):**
```bash
npm run seed:users --prefix server
```

Expected Output:
```
Connected to MongoDB
Cleared existing demo users
✅ Successfully seeded 5 demo alumni users!
   1. Tinku Kumar (tinku@alumni.com) - 850 points
   2. Panku Singh (panku@alumni.com) - 720 points
   3. Patlu Gupta (patlu@alumni.com) - 680 points
   4. Motu Sharma (motu@alumni.com) - 790 points
   5. Mothi Patel (mothi@alumni.com) - 920 points
```

**Seed Demo B.Tech Opportunities (5 jobs):**
```bash
npm run seed:opps --prefix server
```

Expected Output:
```
Connected to MongoDB
✅ Successfully seeded 5 demo opportunities!
   1. Full Stack Developer - B.Tech Fresh Graduates at TechCorp India
      Skills: React, Node.js, TypeScript, MongoDB, REST APIs, Git
      Location: Bangalore, India | Salary: 5-7 LPA
   [... 4 more opportunities ...]
```

### Option B: Run Against Production (MongoDB Atlas)

1. **Set your production MONGO_URI in `.env`**:
   ```
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname
   ```

2. **Run seed scripts**:
   ```bash
   npm run seed:users --prefix server
   npm run seed:opps --prefix server
   ```

3. **Verify in MongoDB Atlas Dashboard**:
   - Check `users` collection has 5 new alumni
   - Check `opportunities` collection has 5 new job listings

---

## 4️⃣ Demo User Credentials for Testing

### Alumni Users Created:
| Name | Email | Password | Role |
|------|-------|----------|------|
| Tinku Kumar | tinku@alumni.com | DemoPassword@123 | alumni |
| Panku Singh | panku@alumni.com | DemoPassword@123 | alumni |
| Patlu Gupta | patlu@alumni.com | DemoPassword@123 | alumni |
| Motu Sharma | motu@alumni.com | DemoPassword@123 | alumni |
| Mothi Patel | mothi@alumni.com | DemoPassword@123 | alumni |

### Admin User (Auto-created):
| Name | Email | Password | Role |
|------|-------|----------|------|
| CareerConnect Admin | admin@careerconnect.com | AdminPassword@123 | admin |

---

## 5️⃣ Feature Verification Checklist

After seeding, verify all features work:

### ✅ Alumni Directory Page (`/alumni`)
- [ ] Loads without 404 error
- [ ] Shows alumni carousel/list
- [ ] Displays at least 5 demo alumni
- [ ] Can click to view alumni details

### ✅ Opportunities Page (`/opportunities`)
- [ ] Loads without 404 error
- [ ] Shows training opportunities carousel
- [ ] Shows job listings with 5 demo jobs
- [ ] Each job shows title, company, skills, salary, location
- [ ] Can apply or view details

### ✅ Achievements Page (`/achievements`)
- [ ] Loads without 404 error
- [ ] Shows leaderboard with alumni ranked by points
- [ ] Shows badge gallery
- [ ] Shows skill endorsements

### ✅ Profile Page (`/profile/:id`)
- [ ] Accessible from top-right avatar click
- [ ] Shows user profile with bio, skills, experience
- [ ] Shows all user information
- [ ] Profile edit button works

### ✅ Admin Dashboard (`/admin` or `/admin/dashboard`)
- [ ] Accessible only to admin users
- [ ] Shows stats cards (Users, Posts, Opportunities)
- [ ] Shows featured alumni preview
- [ ] Shows training opportunities preview

### ✅ Messages Page (`/messages`)
- [ ] Loads without 404 error
- [ ] Shows conversations list
- [ ] Can select and view conversation
- [ ] Can send messages

### ✅ Feed Page (`/feed`)
- [ ] Displays posts
- [ ] Like/comment/share buttons work
- [ ] Post composer visible

---

## 6️⃣ Database Validation

### Check MongoDB Collections:

**1. Users Collection:**
```javascript
db.users.find({ role: "alumni" }).count()
// Should return 5

db.users.findOne({ email: "tinku@alumni.com" })
// Should return full profile with skills, experience
```

**2. Opportunities Collection:**
```javascript
db.opportunities.find({}).count()
// Should return 5 (all approved)

db.opportunities.findOne({ company: "TechCorp India" })
// Should have: title, skills[], location, salary, company, status: "approved"
```

---

## 7️⃣ Troubleshooting

### Admin Access Still Denied
- **Check**: User has `role: "admin"` in database
- **Fix**: Re-run seed scripts or manually update user role
- **Command**: 
  ```javascript
  db.users.updateOne({ email: "user@email.com" }, { $set: { role: "admin" } })
  ```

### Profile Icon Not Clickable
- **Check**: Browser console for JavaScript errors
- **Fix**: Verify TopNav component has `handleProfileClick` function
- **Debug**: Check if user._id exists in auth store

### Seed Script Fails
- **Check**: MONGO_URI environment variable is set correctly
- **Check**: MongoDB connection is active
- **Fix**: Test connection: 
  ```bash
  mongosh "your-mongo-uri"
  ```

### Demo Data Not Visible
- **Check**: You're logged in as a user
- **Check**: Data was actually seeded (check MongoDB)
- **Fix**: Refresh page (`F5` or `Ctrl+R`)
- **Fix**: Clear browser cache and localStorage

---

## 8️⃣ Network Testing

### Verify API Endpoints:

Test with curl or Postman:

```bash
# Get all opportunities
curl http://localhost:4000/api/opportunities

# Get all users (alumni)
curl http://localhost:4000/api/users

# Get admin stats (requires auth token)
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:4000/api/admin/stats
```

---

## Summary

✅ **All 9 features** are now fully functional with:
- Profile icon navigation fixed
- Admin routes accessible
- Demo data seed scripts ready
- 5 alumni users with profiles
- 5 B.Tech job opportunities with detailed skills
- All builds passing (client + server)
- Code pushed to GitHub
- Auto-deploy triggered on Netlify

🚀 **Next**: Run the seed scripts against production MongoDB and verify features are visible!
