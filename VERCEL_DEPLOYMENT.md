# 🚀 Vercel Deployment Guide for Meat Delivery Backend

## Prerequisites

1. **GitHub Account** - Your code should be pushed to GitHub
2. **Vercel Account** - Sign up at [vercel.com](https://vercel.com)
3. **MongoDB Atlas** - Cloud database (free tier available)

## Step-by-Step Deployment

### 1. Prepare MongoDB Atlas

```bash
# 1. Go to https://mongodb.com/atlas
# 2. Create a free cluster
# 3. Create a database user
# 4. Whitelist IP addresses (0.0.0.0/0 for all IPs)
# 5. Get your connection string
```

### 2. Push to GitHub

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit changes
git commit -m "Initial commit - Meat delivery backend"

# Add remote repository
git remote add origin https://github.com/yourusername/meat-delivery-backend.git

# Push to GitHub
git push -u origin main
```

### 3. Deploy to Vercel

1. **Connect to Vercel:**
   - Go to [vercel.com/dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your GitHub repository

2. **Configure Build Settings:**
   - Framework Preset: `Other`
   - Build Command: `npm install` (default)
   - Output Directory: Leave empty
   - Install Command: `npm install` (default)

3. **Set Environment Variables:**
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/meat-delivery
   JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
   JWT_EXPIRE=7d
   NODE_ENV=production
   CORS_ORIGINS=https://your-frontend-domain.com
   ```

4. **Deploy:**
   - Click "Deploy"
   - Wait for deployment to complete
   - Get your deployment URL (e.g., `https://meat-delivery-backend.vercel.app`)

### 4. Test Your Deployment

```bash
# Test health endpoint
curl https://your-app.vercel.app/api/health

# Expected response:
{
  "success": true,
  "message": "Meat Delivery API is running!",
  "timestamp": "2025-10-19T..."
}
```

### 5. Set up Custom Domain (Optional)

1. Go to your project dashboard in Vercel
2. Click "Domains"
3. Add your custom domain
4. Update DNS records as instructed

## 📋 Deployment Checklist

### ✅ Pre-deployment
- [ ] Code is pushed to GitHub
- [ ] MongoDB Atlas cluster is set up
- [ ] Database user created with proper permissions
- [ ] IP whitelist configured (0.0.0.0/0 for production)
- [ ] Connection string obtained

### ✅ Vercel Configuration
- [ ] Project imported from GitHub
- [ ] Environment variables set
- [ ] Build settings configured
- [ ] CORS origins updated

### ✅ Post-deployment
- [ ] Health endpoint working
- [ ] Database connection successful
- [ ] API endpoints responding
- [ ] Authentication working
- [ ] CORS configured for frontend

## 🔧 Environment Variables Reference

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `MONGODB_URI` | ✅ | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/dbname` |
| `JWT_SECRET` | ✅ | JWT signing secret | `your-super-secret-key-32-chars-min` |
| `JWT_EXPIRE` | ✅ | JWT token expiration | `7d` |
| `NODE_ENV` | ✅ | Environment mode | `production` |
| `CORS_ORIGINS` | ✅ | Allowed frontend domains | `https://myapp.com,https://www.myapp.com` |
| `PORT` | ❌ | Server port (Vercel manages this) | `5000` |

## 🛠️ Troubleshooting

### Common Issues

1. **"Function not found" error**
   - Ensure `vercel.json` is properly configured
   - Check that `api/index.js` exists and exports the app

2. **Database connection timeout**
   - Verify MongoDB Atlas IP whitelist includes 0.0.0.0/0
   - Check MONGODB_URI environment variable
   - Ensure database user has proper permissions

3. **CORS errors**
   - Update CORS_ORIGINS environment variable
   - Include both www and non-www versions of your domain
   - Add protocol (https://) to origins

4. **Environment variables not working**
   - Check variable names for typos
   - Ensure variables are set for correct environment (Production/Preview)
   - Redeploy after changing environment variables

### Debug Commands

```bash
# Check deployment logs
vercel logs https://your-app.vercel.app

# Test specific endpoints
curl -X POST https://your-app.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Test","lastName":"User","email":"test@example.com","password":"password123","phone":"+1234567890"}'
```

## 🔄 Continuous Deployment

Once connected to GitHub, Vercel will automatically deploy:
- **Main branch** → Production deployment
- **Other branches** → Preview deployments
- **Pull requests** → Preview deployments with unique URLs

## 📊 Monitoring

1. **Vercel Dashboard:**
   - Function invocations
   - Response times
   - Error rates
   - Bandwidth usage

2. **Set up alerts:**
   - Go to Project Settings → Notifications
   - Configure email alerts for deployment failures

## 🚀 Your API Endpoints

After deployment, your API will be available at:

```
Base URL: https://your-app.vercel.app/api

Authentication:
POST /api/auth/register
POST /api/auth/login
POST /api/auth/send-otp
POST /api/auth/verify-otp

Products:
GET /api/products
GET /api/products/:id

Orders:
POST /api/orders
GET /api/orders
GET /api/orders/:id

Cart:
GET /api/cart
POST /api/cart/items
DELETE /api/cart/items/:itemId

Addresses:
GET /api/addresses
POST /api/addresses
PUT /api/addresses/:id
DELETE /api/addresses/:id

Coupons:
GET /api/coupons
POST /api/coupons/validate
POST /api/cart/apply-coupon
```

## 🎉 Success!

Your Meat Delivery Backend is now live on Vercel! 

Next steps:
1. Test all API endpoints
2. Update your React Native app to use the new API URL
3. Set up monitoring and logging
4. Configure custom domain (optional)
5. Set up CI/CD pipeline for automated testing