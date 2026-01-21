# Deployment Checklist ✅

## ✅ Environment Variables Set
- `DATABASE_URL` - ✅ Set in Vercel (added 29m ago)
- `BLOB_READ_WRITE_TOKEN` - Should be set for image uploads

## ⏳ Next Steps

### 1. Commit and Push Code Changes
The database connection code has been updated but needs to be deployed:

```bash
git add .
git commit -m "Fix Neon Postgres connection for serverless"
git push
```

### 2. Redeploy in Vercel
After pushing, Vercel should auto-deploy. Or manually:
- Go to Deployments tab
- Click "Redeploy" on latest deployment
- This ensures environment variables are picked up

### 3. Test After Deployment
Visit: `https://entreete.com/api/test-db`

Should show:
```json
{
  "postgres_configured": true,
  "has_database_url": true,
  "connection_test": "connected"
}
```

### 4. Check Logs if Still Failing
- Vercel Dashboard → Logs
- Look for database connection errors
- Check if DATABASE_URL is being read correctly

## Common Issues

**503 errors persist:**
- Redeploy after setting environment variables
- Check that code changes are pushed
- Verify DATABASE_URL format is correct

**Connection timeouts:**
- Check Neon dashboard - database should be active
- Verify connection string includes SSL parameters
- Check Vercel function logs for specific errors
