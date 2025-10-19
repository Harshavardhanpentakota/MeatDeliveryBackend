const crypto = require('crypto');

console.log('🔐 Generating secure JWT secret for your Meat Delivery Backend...\n');

// Generate a secure random JWT secret
const jwtSecret = crypto.randomBytes(32).toString('hex');

console.log('✅ Your secure JWT secret (copy this for Vercel):');
console.log(`JWT_SECRET=${jwtSecret}\n`);

console.log('🔗 MongoDB Atlas connection string template:');
console.log('MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@cluster0.xxxxx.mongodb.net/meat-delivery?retryWrites=true&w=majority');
console.log('Replace USERNAME and PASSWORD with your Atlas credentials\n');

console.log('📝 Complete environment variables for Vercel:');
console.log(`MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@cluster0.xxxxx.mongodb.net/meat-delivery?retryWrites=true&w=majority`);
console.log(`JWT_SECRET=${jwtSecret}`);
console.log('JWT_EXPIRE=7d');
console.log('NODE_ENV=production');
console.log('CORS_ORIGINS=https://your-frontend-domain.com\n');

console.log('💡 Next steps:');
console.log('1. Set up MongoDB Atlas (see DEPLOYMENT_CHECKLIST.md)');
console.log('2. Add these environment variables to Vercel');
console.log('3. Update CORS_ORIGINS with your actual domain');
console.log('4. Deploy to Vercel!');