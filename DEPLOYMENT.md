# Deployment Guide - Netlify

## ✅ Pre-Deployment Checklist

All critical fixes have been applied:
- ✅ Database indexes created for performance
- ✅ N+1 query problems fixed
- ✅ Error boundary added
- ✅ All paywalls removed for testing
- ✅ Build successful

## 🚀 Deploy to Netlify

### Step 1: Push to GitHub

1. Make sure all changes are committed:
```bash
git add .
git commit -m "Prepare for deployment - remove paywalls for testing"
git push origin master
```

### Step 2: Connect to Netlify

1. Go to [Netlify](https://app.netlify.com/)
2. Click **"Add new site"** → **"Import an existing project"**
3. Choose **GitHub** and select your repository
4. Netlify will auto-detect the settings from `netlify.toml`:
   - Build command: `npm run build`
   - Publish directory: `dist`

### Step 3: Set Environment Variables

In Netlify dashboard:
1. Go to **Site settings** → **Environment variables**
2. Add these variables:

```
VITE_SUPABASE_URL=https://aueubexqcgpqlbmvkqvv.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_9LsKfvfgi4FJkiH3wXozZg_If1NkAUa
```

*(Get these from your `.env` file)*

### Step 4: Deploy

1. Click **"Deploy site"**
2. Wait 2-3 minutes for build to complete
3. Netlify will give you a URL like: `https://random-name-12345.netlify.app`

### Step 5: Custom Domain (Optional)

1. Go to **Domain settings**
2. Click **"Add custom domain"**
3. Follow instructions to add your domain

## 🧪 Testing

Once deployed, test these features:
1. ✅ Sign up / Login
2. ✅ Complete onboarding
3. ✅ Add multiple properties (no limit!)
4. ✅ Add valuations
5. ✅ Track cashflow
6. ✅ View Advanced Dashboard (no paywall!)
7. ✅ Export CSV

## 📝 Notes

- **All features unlocked** for testing (no Pro tier required)
- **No property limit** during testing phase
- **Database is shared** with development (same Supabase instance)

## 🔄 Re-enabling Paywalls Later

When ready to add payment system:

1. Uncomment code in `src/components/ProFeatureGate.tsx`
2. Uncomment code in `src/pages/AddProperty.tsx` (property limit)
3. Restore tier indicators in Dashboard
4. Commit and redeploy

## 🐛 Troubleshooting

**Site won't load:**
- Check environment variables are set correctly
- Check Netlify build logs for errors

**Database connection issues:**
- Verify Supabase credentials
- Check RLS policies are enabled

**Slow performance:**
- Verify database indexes were created (run `verify-indexes.sql`)
- Check Supabase region matches your target audience

## 📧 Support

If you encounter issues:
1. Check Netlify build logs
2. Check browser console for errors
3. Verify environment variables match `.env` file
