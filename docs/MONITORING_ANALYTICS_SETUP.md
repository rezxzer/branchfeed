# Monitoring & Analytics Setup Guide - BranchFeed

ეს დოკუმენტაცია აღწერს როგორ დავაყენოთ monitoring და analytics tools production-ისთვის.

**Last Updated**: 2025-01-15

---

## 📊 Overview

BranchFeed uses multiple monitoring and analytics tools to track:
- **Error Tracking**: Sentry (recommended) or Vercel built-in
- **Analytics**: Vercel Analytics (built-in), Google Analytics (optional)
- **Performance Monitoring**: Vercel Analytics, Supabase Dashboard
- **Logging**: Vercel logs, Supabase logs
- **Alerts**: Vercel notifications, Supabase alerts

---

## 🔴 Error Tracking Setup

### Option 1: Sentry (Recommended)

Sentry provides comprehensive error tracking, performance monitoring, and release tracking.

#### Installation

```bash
pnpm add @sentry/nextjs
```

#### Setup

1. **Create Sentry Account**
   - Go to [sentry.io](https://sentry.io)
   - Sign up for free account
   - Create new project (Next.js)
   - Copy DSN (Data Source Name)

2. **Configure Sentry**

Create `sentry.client.config.ts`:
```typescript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0, // Adjust based on traffic
  debug: false,
  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
});
```

Create `sentry.server.config.ts`:
```typescript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
  debug: false,
});
```

Create `sentry.edge.config.ts`:
```typescript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
  debug: false,
});
```

3. **Update next.config.js**

```javascript
const { withSentryConfig } = require("@sentry/nextjs");

const nextConfig = {
  // ... existing config
};

module.exports = withSentryConfig(nextConfig, {
  silent: true,
  org: "your-org",
  project: "your-project",
});
```

4. **Add Environment Variable**

```bash
NEXT_PUBLIC_SENTRY_DSN=https://your-dsn@sentry.io/project-id
```

5. **Update ErrorBoundary**

```typescript
// src/components/ErrorBoundary.tsx
import * as Sentry from "@sentry/nextjs";

// In componentDidCatch:
componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
  Sentry.captureException(error, {
    contexts: {
      react: {
        componentStack: errorInfo.componentStack,
      },
    },
  });
}
```

#### Features

- **Error Tracking**: Automatic error capture
- **Performance Monitoring**: Transaction tracking
- **Release Tracking**: Track deployments
- **User Context**: Associate errors with users
- **Breadcrumbs**: Track user actions before errors
- **Source Maps**: Better error stack traces

#### Dashboard

- Go to [sentry.io](https://sentry.io)
- View errors, performance, releases
- Set up alerts for critical errors
- Configure integrations (Slack, Email)

---

### Option 2: Vercel Built-in Error Tracking

Vercel provides basic error tracking in the dashboard.

#### Setup

1. **Enable Error Tracking**
   - Go to Vercel Dashboard → **Settings** → **Analytics**
   - Error tracking is automatically enabled

2. **View Errors**
   - Go to **Analytics** tab
   - View error logs and stack traces
   - Filter by error type, page, time

#### Limitations

- Basic error tracking only
- No performance monitoring
- Limited alerting options
- No user context

---

## 📈 Analytics Setup

### 1. Vercel Analytics (Built-in) ✅

Vercel Analytics is automatically available for Vercel deployments.

#### Setup

1. **Enable Analytics**
   - Go to Vercel Dashboard → **Settings** → **Analytics**
   - Enable **Web Analytics**
   - No code changes required

2. **View Analytics**
   - Go to **Analytics** tab in Vercel Dashboard
   - View real-time and historical data

#### Metrics Tracked

- **Page Views**: Total page views
- **Unique Visitors**: Unique user count
- **Top Pages**: Most visited pages
- **Performance**: Load times, Core Web Vitals
- **Geographic Data**: Visitor locations
- **Device Data**: Desktop, mobile, tablet
- **Browser Data**: Chrome, Firefox, Safari, etc.

#### Core Web Vitals

- **LCP** (Largest Contentful Paint): < 2.5s
- **FID** (First Input Delay): < 100ms
- **CLS** (Cumulative Layout Shift): < 0.1

---

### 2. Google Analytics (Optional)

Google Analytics provides detailed user behavior tracking.

#### Installation

```bash
pnpm add @next/third-parties
```

#### Setup

1. **Create Google Analytics Account**
   - Go to [analytics.google.com](https://analytics.google.com)
   - Create account and property
   - Copy Measurement ID (G-XXXXXXXXXX)

2. **Configure Next.js**

Update `next.config.js`:
```javascript
const { withGoogleAnalytics } = require('@next/third-parties/google')({
  id: process.env.NEXT_PUBLIC_GA_ID,
});

module.exports = withGoogleAnalytics({
  // ... existing config
});
```

3. **Add Environment Variable**

```bash
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

4. **Add to Layout**

```typescript
// src/app/layout.tsx
import { GoogleAnalytics } from '@next/third-parties/google'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
      </body>
    </html>
  )
}
```

#### Features

- **User Behavior**: Page views, sessions, bounce rate
- **Audience**: Demographics, interests, geography
- **Acquisition**: Traffic sources, campaigns
- **Conversions**: Goals, e-commerce tracking
- **Real-time**: Live user activity

---

## 📊 Performance Monitoring

### 1. Vercel Analytics Performance

Vercel Analytics automatically tracks performance metrics.

#### Metrics

- **Page Load Time**: Average, P50, P95, P99
- **Core Web Vitals**: LCP, FID, CLS
- **API Response Time**: Server-side performance
- **Build Time**: Deployment performance

#### View Performance

- Go to Vercel Dashboard → **Analytics** → **Performance**
- View performance trends
- Identify slow pages
- Compare performance over time

---

### 2. Supabase Performance Monitoring

Supabase provides database and API performance monitoring.

#### Database Performance

1. Go to Supabase Dashboard → **Database** → **Performance**
2. Monitor:
   - **Query Performance**: Slow queries, query times
   - **Database Size**: Total database size
   - **Connection Pool**: Active connections
   - **Index Usage**: Index hit rates

#### API Usage

1. Go to Supabase Dashboard → **Settings** → **Usage**
2. Monitor:
   - **API Requests**: Total requests, rate limits
   - **Database Size**: Storage usage
   - **Storage Usage**: File storage size
   - **Bandwidth**: Data transfer

---

### 3. Browser DevTools

Use Chrome DevTools for detailed performance analysis.

#### Performance Tab

1. Open Chrome DevTools → **Performance** tab
2. Click **Record**
3. Interact with your app
4. Stop recording
5. Analyze:
   - **FPS**: Frame rate
   - **CPU**: CPU usage
   - **Network**: Network requests
   - **Timing**: Load times

#### Lighthouse

1. Open Chrome DevTools → **Lighthouse** tab
2. Select categories:
   - Performance
   - Accessibility
   - Best Practices
   - SEO
3. Click **Generate report**
4. Review scores and recommendations

**Target Scores:**
- Performance: > 80
- Accessibility: > 90
- Best Practices: > 90
- SEO: > 80

---

## 📝 Logging Setup

### 1. Vercel Logs

Vercel provides built-in logging for deployments.

#### View Logs

1. Go to Vercel Dashboard → **Deployments**
2. Click on a deployment
3. View **Logs** tab
4. Filter by:
   - Build logs
   - Runtime logs
   - Function logs

#### Log Levels

- **Info**: General information
- **Warning**: Warnings
- **Error**: Errors
- **Debug**: Debug information (development only)

---

### 2. Supabase Logs

Supabase provides logs for database and API operations.

#### View Logs

1. Go to Supabase Dashboard → **Logs**
2. View:
   - **Database Logs**: Query logs
   - **API Logs**: API request logs
   - **Auth Logs**: Authentication logs
   - **Storage Logs**: Storage operation logs

---

### 3. Server-Side Logging

Add structured logging to API routes:

```typescript
// src/app/api/example/route.ts
export async function GET(request: Request) {
  const startTime = Date.now();
  
  try {
    // ... your code
    
    const duration = Date.now() - startTime;
    console.log('[API] GET /api/example', {
      duration,
      status: 200,
      timestamp: new Date().toISOString(),
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('[API] GET /api/example', {
      duration,
      status: 500,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
    
    throw error;
  }
}
```

---

## 🔔 Alerts Setup

### 1. Vercel Alerts

#### Setup

1. Go to Vercel Dashboard → **Settings** → **Notifications**
2. Configure:
   - **Email Notifications**: Build failures, deployment failures
   - **Slack Integration**: Real-time notifications
   - **Webhook Integration**: Custom integrations

#### Alert Types

- **Build Failures**: When build fails
- **Deployment Failures**: When deployment fails
- **High Error Rates**: When error rate exceeds threshold
- **Performance Degradation**: When performance drops

---

### 2. Supabase Alerts

#### Setup

1. Go to Supabase Dashboard → **Settings** → **Alerts**
2. Set up alerts for:
   - **High Database Usage**: > 80% of limit
   - **High API Usage**: > 80% of limit
   - **Slow Queries**: > 1 second
   - **Storage Limits**: > 80% of limit

#### Alert Channels

- **Email**: Email notifications
- **Slack**: Slack webhook
- **Webhook**: Custom webhook

---

### 3. Sentry Alerts (if using Sentry)

#### Setup

1. Go to Sentry Dashboard → **Settings** → **Alerts**
2. Create alert rules:
   - **Error Rate**: Alert when error rate exceeds threshold
   - **Performance**: Alert when performance degrades
   - **New Issues**: Alert when new error types appear

#### Alert Channels

- **Email**: Email notifications
- **Slack**: Slack integration
- **PagerDuty**: On-call management
- **Webhook**: Custom integrations

---

## 📊 Dashboard Setup

### 1. Vercel Dashboard

**Access**: [vercel.com/dashboard](https://vercel.com/dashboard)

**Sections:**
- **Deployments**: View all deployments
- **Analytics**: View analytics data
- **Settings**: Configure project settings
- **Logs**: View deployment logs

---

### 2. Supabase Dashboard

**Access**: [app.supabase.com](https://app.supabase.com)

**Sections:**
- **Database**: Database management
- **Storage**: File storage management
- **Auth**: Authentication management
- **Logs**: View logs
- **Settings**: Project settings

---

### 3. Sentry Dashboard (if using Sentry)

**Access**: [sentry.io](https://sentry.io)

**Sections:**
- **Issues**: View errors and issues
- **Performance**: View performance metrics
- **Releases**: Track deployments
- **Alerts**: Manage alert rules

---

## 🎯 Key Metrics to Track

### Application Metrics

1. **Error Rate**: 4xx, 5xx errors per request
2. **Response Time**: API response time (P50, P95, P99)
3. **Throughput**: Requests per second
4. **Uptime**: Service availability percentage

### User Metrics

1. **Page Views**: Total page views
2. **Unique Visitors**: Unique user count
3. **Session Duration**: Average session length
4. **Bounce Rate**: Single-page sessions
5. **Conversion Rate**: Goal completions

### Performance Metrics

1. **Core Web Vitals**: LCP, FID, CLS
2. **Page Load Time**: Average, P50, P95
3. **Time to Interactive**: TTI
4. **First Contentful Paint**: FCP

### Business Metrics

1. **User Sign-ups**: New user registrations
2. **Story Creation**: Stories created per day
3. **Engagement**: Likes, comments, shares
4. **Subscription Conversions**: Subscription sign-ups (Phase 0 - Test Mode)

---

## 📅 Monitoring Schedule

### Daily

- [ ] Check error logs (Vercel, Sentry)
- [ ] Review critical errors
- [ ] Monitor API usage (Supabase)
- [ ] Check performance metrics (Vercel Analytics)

### Weekly

- [ ] Review Core Web Vitals
- [ ] Analyze slow queries (Supabase)
- [ ] Review user engagement metrics
- [ ] Check storage usage (Supabase)

### Monthly

- [ ] Run Lighthouse audit
- [ ] Review bundle sizes
- [ ] Analyze user behavior (Google Analytics)
- [ ] Review subscription metrics (Phase 0 - Test Mode)
- [ ] Performance optimization review

---

## 🚨 Critical Alerts

Set up alerts for:

1. **Error Rate > 1%**: High error rate
2. **Response Time > 2s (P95)**: Slow performance
3. **Database Usage > 80%**: Approaching limits
4. **API Usage > 80%**: Approaching limits
5. **Storage Usage > 80%**: Approaching limits
6. **Build Failures**: Deployment issues
7. **Uptime < 99.9%**: Service availability issues

---

## 🔧 Troubleshooting

### Errors Not Appearing in Sentry

**Check:**
1. DSN is set correctly
2. Sentry is initialized
3. Source maps are uploaded
4. Environment is correct

### Analytics Not Tracking

**Check:**
1. Vercel Analytics is enabled
2. Google Analytics ID is correct (if using)
3. No ad blockers interfering
4. Tracking code is loaded

### Performance Metrics Missing

**Check:**
1. Vercel Analytics is enabled
2. Core Web Vitals are being measured
3. No browser extensions interfering
4. Sufficient traffic for metrics

---

## 📚 Related Documentation

- **Performance Monitoring**: `docs/PERFORMANCE_MONITORING.md`
- **Production Deployment Checklist**: `docs/PRODUCTION_DEPLOYMENT_CHECKLIST.md`
- **Deployment Guide**: `docs/DEPLOYMENT.md`
- **Operations Playbook**: `docs/OPERATIONS_PLAYBOOK.md`

---

## ✅ Setup Checklist

### Error Tracking

- [ ] Sentry account created (or Vercel error tracking enabled)
- [ ] Sentry DSN configured
- [ ] ErrorBoundary updated with Sentry
- [ ] Source maps uploaded (if using Sentry)
- [ ] Alerts configured

### Analytics

- [ ] Vercel Analytics enabled
- [ ] Google Analytics configured (optional)
- [ ] Analytics tracking verified
- [ ] Dashboard accessible

### Performance Monitoring

- [ ] Vercel Analytics performance tracking enabled
- [ ] Supabase performance monitoring accessible
- [ ] Performance baseline established
- [ ] Alerts configured

### Logging

- [ ] Vercel logs accessible
- [ ] Supabase logs accessible
- [ ] Server-side logging implemented
- [ ] Log retention configured

### Alerts

- [ ] Vercel alerts configured
- [ ] Supabase alerts configured
- [ ] Sentry alerts configured (if using)
- [ ] Alert channels tested

---

**Status**: Ready for Production Monitoring Setup

**Last Updated**: 2025-01-15

