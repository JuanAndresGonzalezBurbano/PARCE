# 🚀 Deployment Guide - P.A.R.C.E

Complete guide for deploying the P.A.R.C.E application to production.

## 📋 Pre-Deployment Checklist

Before deploying, ensure:

- ✅ All dependencies installed (`npm install`)
- ✅ Application runs locally (`npm run dev`)
- ✅ Build succeeds (`npm run build`)
- ✅ No TypeScript errors (`npx tsc --noEmit`)
- ✅ Environment variables configured
- ✅ Assets optimized
- ✅ Documentation reviewed

## 🏗️ Build Process

### 1. Install Dependencies

```bash
npm install
```

### 2. Build for Production

```bash
npm run build
```

This creates an optimized production build in the `dist/` folder with:
- Minified JavaScript
- Optimized CSS (unused styles removed)
- Compressed assets
- Source maps (optional)

### 3. Preview Build Locally

```bash
npm run preview
```

Test the production build at `http://localhost:4173`

## 🌐 Deployment Options

### Option 1: Vercel (Recommended)

**Why Vercel?**
- Zero configuration
- Automatic HTTPS
- Global CDN
- Instant deployments
- Free tier available

**Steps:**

1. **Install Vercel CLI**
```bash
npm install -g vercel
```

2. **Login to Vercel**
```bash
vercel login
```

3. **Deploy**
```bash
vercel
```

4. **Deploy to Production**
```bash
vercel --prod
```

**Configuration** (`vercel.json`):
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite"
}
```

---

### Option 2: Netlify

**Why Netlify?**
- Easy drag-and-drop
- Continuous deployment
- Form handling
- Free tier available

**Steps:**

1. **Build the Project**
```bash
npm run build
```

2. **Deploy via Netlify CLI**
```bash
npm install -g netlify-cli
netlify login
netlify deploy --prod --dir=dist
```

**Or via Web Interface:**
1. Go to [netlify.com](https://netlify.com)
2. Drag `dist/` folder to deploy
3. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`

**Configuration** (`netlify.toml`):
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

### Option 3: GitHub Pages

**Why GitHub Pages?**
- Free hosting
- Integrated with GitHub
- Custom domains

**Steps:**

1. **Install gh-pages**
```bash
npm install --save-dev gh-pages
```

2. **Add to package.json**
```json
{
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  },
  "homepage": "https://yourusername.github.io/parce-app"
}
```

3. **Update vite.config.ts**
```typescript
export default defineConfig({
  base: '/parce-app/',
  // ... rest of config
})
```

4. **Deploy**
```bash
npm run deploy
```

---

### Option 4: AWS S3 + CloudFront

**Why AWS?**
- Highly scalable
- Global CDN
- Full control
- Enterprise-grade

**Steps:**

1. **Build the Project**
```bash
npm run build
```

2. **Create S3 Bucket**
```bash
aws s3 mb s3://parce-app
```

3. **Configure Bucket for Static Hosting**
```bash
aws s3 website s3://parce-app --index-document index.html --error-document index.html
```

4. **Upload Files**
```bash
aws s3 sync dist/ s3://parce-app --delete
```

5. **Set Bucket Policy**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::parce-app/*"
    }
  ]
}
```

6. **Create CloudFront Distribution**
- Origin: S3 bucket
- Default root object: `index.html`
- Error pages: 404 → `/index.html` (for SPA routing)

---

### Option 5: Docker

**Why Docker?**
- Consistent environments
- Easy scaling
- Platform independent

**Dockerfile:**
```dockerfile
# Build stage
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**nginx.conf:**
```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

**Build and Run:**
```bash
# Build image
docker build -t parce-app .

# Run container
docker run -p 80:80 parce-app
```

---

## 🔐 Environment Variables

### Create `.env` File

```bash
# API Configuration
VITE_API_URL=https://api.parce.com
VITE_API_KEY=your_api_key_here

# Maps Configuration
VITE_MAPS_API_KEY=your_maps_key_here

# Payment Configuration
VITE_STRIPE_PUBLIC_KEY=your_stripe_key_here

# Analytics
VITE_GA_TRACKING_ID=UA-XXXXXXXXX-X
```

### Platform-Specific Setup

**Vercel:**
- Add in Project Settings → Environment Variables

**Netlify:**
- Add in Site Settings → Build & Deploy → Environment

**GitHub Pages:**
- Add in Repository Settings → Secrets

**AWS:**
- Use AWS Systems Manager Parameter Store

---

## 🔧 Build Optimization

### 1. Analyze Bundle Size

```bash
npm run build -- --mode analyze
```

### 2. Optimize Images

- Use WebP format
- Compress images
- Lazy load images

### 3. Code Splitting

```typescript
// Lazy load routes
const Dashboard = lazy(() => import('./pages/DashboardPage'));

<Suspense fallback={<Loading />}>
  <Dashboard />
</Suspense>
```

### 4. Minification

Already handled by Vite in production build.

---

## 🌍 Custom Domain

### Vercel

1. Go to Project Settings → Domains
2. Add your domain
3. Update DNS records:
   - Type: `A`
   - Name: `@`
   - Value: `76.76.21.21`

### Netlify

1. Go to Domain Settings
2. Add custom domain
3. Update DNS:
   - Type: `CNAME`
   - Name: `www`
   - Value: `your-site.netlify.app`

### AWS CloudFront

1. Add alternate domain name (CNAME)
2. Request SSL certificate (ACM)
3. Update Route 53 or DNS provider

---

## 📊 Monitoring

### Setup Analytics

**Google Analytics:**

1. Add to `index.html`:
```html
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

**Vercel Analytics:**
```bash
npm install @vercel/analytics
```

```typescript
import { Analytics } from '@vercel/analytics/react';

function App() {
  return (
    <>
      <YourApp />
      <Analytics />
    </>
  );
}
```

---

## 🔒 Security

### HTTPS

All platforms provide automatic HTTPS. Ensure:
- Force HTTPS redirect
- HSTS headers enabled
- Secure cookies

### Headers

Add security headers:

**Netlify** (`netlify.toml`):
```toml
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    X-XSS-Protection = "1; mode=block"
    Referrer-Policy = "strict-origin-when-cross-origin"
```

**Vercel** (`vercel.json`):
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        }
      ]
    }
  ]
}
```

---

## 🚀 CI/CD Pipeline

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build
        run: npm run build
        
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

---

## 📈 Performance Optimization

### Lighthouse Targets

- Performance: > 90
- Accessibility: > 90
- Best Practices: > 90
- SEO: > 90

### Optimization Checklist

- ✅ Minified assets
- ✅ Compressed images
- ✅ Lazy loading
- ✅ Code splitting
- ✅ CDN delivery
- ✅ Caching headers
- ✅ Gzip/Brotli compression

---

## 🐛 Troubleshooting

### Build Fails

```bash
# Clear cache
rm -rf node_modules dist
npm install
npm run build
```

### 404 on Refresh

Add redirect rules for SPA routing (see platform-specific configs above).

### Environment Variables Not Working

- Ensure variables start with `VITE_`
- Restart dev server after changes
- Check platform-specific configuration

### Slow Build Times

- Use `npm ci` instead of `npm install`
- Enable caching in CI/CD
- Optimize dependencies

---

## 📞 Support

### Deployment Issues

1. Check build logs
2. Verify environment variables
3. Test locally with `npm run preview`
4. Review platform documentation

### Platform Support

- **Vercel**: [vercel.com/support](https://vercel.com/support)
- **Netlify**: [netlify.com/support](https://netlify.com/support)
- **AWS**: [aws.amazon.com/support](https://aws.amazon.com/support)

---

## ✅ Post-Deployment Checklist

After deployment:

- ✅ Test all pages
- ✅ Verify responsive design
- ✅ Check forms submission
- ✅ Test navigation
- ✅ Verify HTTPS
- ✅ Check performance (Lighthouse)
- ✅ Test on multiple devices
- ✅ Monitor error logs
- ✅ Setup analytics
- ✅ Configure monitoring

---

**Deployment Guide Version**: 1.0.0  
**Last Updated**: May 22, 2026  
**Status**: Production Ready

🎉 **Your P.A.R.C.E application is ready to deploy!**
