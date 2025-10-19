# MongoDB Setup for Windows

## Quick MongoDB Installation

### Method 1: Download and Install (Recommended)

1. **Download MongoDB Community Server:**
   - Visit: https://www.mongodb.com/try/download/community
   - Select: Windows x64
   - Click: Download

2. **Install MongoDB:**
   - Run the downloaded .msi file
   - Choose "Complete" installation
   - ✅ Check "Install MongoDB as a Service"
   - ✅ Check "Run service as Network Service user"
   - ✅ Check "Install MongoDB Compass" (GUI tool)

3. **Start MongoDB Service:**
   ```powershell
   # Open PowerShell as Administrator and run:
   net start MongoDB
   ```

4. **Verify Installation:**
   ```powershell
   # Check if MongoDB is running:
   netstat -an | findstr :27017
   
   # You should see: TCP 0.0.0.0:27017 0.0.0.0:0 LISTENING
   ```

### Method 2: Using Chocolatey (If you have Chocolatey installed)

```powershell
# Install MongoDB via Chocolatey
choco install mongodb

# Start the service
net start MongoDB
```

### Method 3: Using Docker (If you have Docker installed)

```powershell
# Pull and run MongoDB container
docker run -d -p 27017:27017 --name mongodb-container mongo:latest

# Verify it's running
docker ps
```

## Common Issues and Solutions

### Issue 1: "Access is denied" when starting service
**Solution:** Run PowerShell as Administrator

```powershell
# Right-click PowerShell -> "Run as Administrator"
net start MongoDB
```

### Issue 2: Service name not found
**Solution:** Check the actual service name

```powershell
# List all MongoDB services
sc query | findstr MongoDB

# Common service names:
net start "MongoDB Server"
# or
net start "MongoDB"
```

### Issue 3: Port 27017 already in use
**Solution:** Check what's using the port

```powershell
# Check what's using port 27017
netstat -ano | findstr :27017

# Kill the process if needed (replace PID with actual process ID)
taskkill /PID <PID> /F
```

### Issue 4: MongoDB won't start
**Solution:** Check MongoDB logs

```powershell
# Check Windows Event Viewer:
# Windows Logs -> Application -> Look for MongoDB entries

# Or check MongoDB log files (usually in):
# C:\Program Files\MongoDB\Server\7.0\log\mongod.log
```

## Alternative: MongoDB Atlas (Cloud)

If local installation is problematic, use MongoDB Atlas:

1. **Sign up:** https://www.mongodb.com/atlas
2. **Create free cluster** (512MB free tier)
3. **Get connection string** from Atlas dashboard
4. **Update .env file:**
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/meat-delivery?retryWrites=true&w=majority
   ```

## Test Your MongoDB Connection

After setting up MongoDB, test the connection:

```powershell
# Navigate to your project directory
cd "C:\Users\harsh\OneDrive\Documents\Prasad\MeatDeliveryBackend"

# Start the server
node server.js
```

You should see:
```
Attempting to connect to MongoDB...
✅ MongoDB Connected: localhost
Server running in development mode on port 5000
```

## MongoDB Compass (GUI Tool)

If you installed MongoDB Compass:
1. Open MongoDB Compass
2. Connect to: `mongodb://localhost:27017`
3. You should see your `meat-delivery` database after running the server

## Need Help?

If you're still having issues:
1. **Check Windows Services:** Press `Win + R` → type `services.msc` → look for MongoDB service
2. **Use MongoDB Atlas:** Easier cloud-based solution
3. **Check firewall:** Ensure port 27017 isn't blocked

## Quick Commands Reference

```powershell
# Start MongoDB service
net start MongoDB

# Stop MongoDB service  
net stop MongoDB

# Check if running
netstat -an | findstr :27017

# Run your app
node server.js
```