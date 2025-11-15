# Performance Monitoring Guide - BranchFeed

ეს დოკუმენტაცია აღწერს performance monitoring setup-ს და best practices-ებს production-ში.

**Last Updated**: 2025-01-15

---

## 📊 Monitoring Tools

### 1. Vercel Analytics (Built-in)

**Setup:**

1. Go to Vercel Dashboard → **Settings** → **Analytics**
2. Enable **Web Analytics**
3. Analytics automatically tracks:
   - Page views
   - Unique visitors
   - Top pages
   - Performance metrics
   - Core Web Vitals (LCP, FID, CLS)

**View Analytics:**

- Go to **Analytics** tab in Vercel Dashboard
- View real-time and historical data
- Export data if needed

**Metrics Tracked:**

- **Page Views**: Total page views
- **Unique Visitors**: Unique user count
- **Top Pages**: Most visited pages
- **Performance**: Load times, Core Web Vitals
- **Geographic Data**: Visitor locations

---

### 2. Supabase Monitoring

**Database Performance:**

1. Go to Supabase Dashboard → **Database** → **Performance**
2. Monitor:
   - **Query Performance**: Slow queries, query times
   - **Database Size**: Total database size
   - **Connection Pool**: Active connections
   - **Index Usage**: Index hit rates

**API Usage:**

1. Go to Supabase Dashboard → **Settings** → **Usage**
2. Monitor:
   - **API Requests**: Total requests, rate limits
   - **Database Size**: Storage usage
   - **Storage Usage**: File storage size
   - **Bandwidth**: Data transfer

**Alerts:**

- Set up alerts for:
  - High database size (> 80% of limit)
  - High API usage (> 80% of limit)
  - Slow queries (> 1 second)

---

### 3. Browser DevTools

**Performance Tab:**

1. Open Chrome DevTools → **Performance** tab
2. Click **Record**
3. Interact with your app
4. Stop recording
5. Analyze:
   - **FPS**: Frame rate
   - **CPU**: CPU usage
   - **Network**: Network requests
   - **Timing**: Load times

**Network Tab:**

1. Open Chrome DevTools → **Network** tab
2. Reload page
3. Check:
   - **Load Time**: Total page load time
   - **Request Count**: Number of requests
   - **Transfer Size**: Total data transferred
   - **Failed Requests**: Any failed requests

**Lighthouse:**

1. Open Chrome DevTools → **Lighthouse** tab
2. Select categories:
   - Performance
   - Accessibility
   - Best Practices
   - SEO
3. Click **Generate report**
4. Review scores and recommendations

**Target Scores:**

- **Performance**: > 80
- **Accessibility**: > 90
- **Best Practices**: > 90
- **SEO**: > 80

---

## 🎯 Key Performance Metrics

### Core Web Vitals

**Largest Contentful Paint (LCP):**
- **Target**: < 2.5 seconds
- **Poor**: > 4.0 seconds
- **Measure**: Time to render largest content element

**First Input Delay (FID):**
- **Target**: < 100 milliseconds
- **Poor**: > 300 milliseconds
- **Measure**: Time from user interaction to browser response

**Cumulative Layout Shift (CLS):**
- **Target**: < 0.1
- **Poor**: > 0.25
- **Measure**: Visual stability (layout shifts)

### Page Load Metrics

**Time to First Byte (TTFB):**
- **Target**: < 600 milliseconds
- **Measure**: Server response time

**First Contentful Paint (FCP):**
- **Target**: < 1.8 seconds
- **Measure**: Time to first content render

**Time to Interactive (TTI):**
- **Target**: < 3.8 seconds
- **Measure**: Time until page is fully interactive

---

## 🔍 Performance Monitoring Checklist

### Initial Setup
- [ ] Vercel Analytics enabled
- [ ] Supabase monitoring dashboard accessible
- [ ] Browser DevTools bookmarked
- [ ] Performance baseline established

### Regular Monitoring
- [ ] Check Vercel Analytics weekly
- [ ] Review Supabase usage monthly
- [ ] Run Lighthouse audits monthly
- [ ] Monitor Core Web Vitals weekly

### Performance Targets
- [ ] LCP < 2.5s
- [ ] FID < 100ms
- [ ] CLS < 0.1
- [ ] Page load < 3s
- [ ] No failed requests

---

## 🚀 Performance Optimization Tips

### 1. Image Optimization

**Already Implemented:**
- ✅ Next.js `<Image>` component
- ✅ Automatic image optimization
- ✅ Lazy loading
- ✅ Responsive images

**Additional Optimizations:**
- Use WebP format when possible
- Compress images before upload
- Set appropriate image sizes

### 2. Code Splitting

**Already Implemented:**
- ✅ Next.js automatic code splitting
- ✅ Dynamic imports for large components

**Additional Optimizations:**
- Lazy load non-critical components
- Split vendor bundles
- Use dynamic imports for routes

### 3. Caching

**Already Implemented:**
- ✅ Next.js automatic caching
- ✅ Supabase client caching

**Additional Optimizations:**
- Implement service worker (PWA)
- Cache API responses
- Use CDN for static assets

### 4. Database Optimization

**Already Implemented:**
- ✅ Database indexes on foreign keys
- ✅ Indexes on frequently queried columns
- ✅ Cached counts (likes_count, views_count)

**Additional Optimizations:**
- Monitor slow queries
- Add indexes for new query patterns
- Use database connection pooling

### 5. Bundle Size

**Monitor:**
```bash
pnpm build
# Check .next/analyze for bundle size
```

**Optimize:**
- Remove unused dependencies
- Use tree shaking
- Split large bundles
- Use dynamic imports

---

## 📈 Performance Monitoring Schedule

### Daily
- Check Vercel Analytics for errors
- Monitor Supabase API usage
- Review failed requests

### Weekly
- Review Core Web Vitals
- Check page load times
- Monitor database performance

### Monthly
- Run Lighthouse audit
- Review bundle sizes
- Analyze slow queries
- Check storage usage

---

## 🐛 Performance Issues Troubleshooting

### Slow Page Load

**Check:**
1. Network tab - large files?
2. Performance tab - slow JavaScript?
3. Database queries - slow queries?
4. Images - unoptimized images?

**Solutions:**
- Optimize images
- Reduce JavaScript bundle size
- Optimize database queries
- Use CDN

### High Database Usage

**Check:**
1. Supabase Dashboard → Performance
2. Slow queries
3. High connection count

**Solutions:**
- Add indexes
- Optimize queries
- Use connection pooling
- Cache frequently accessed data

### High API Usage

**Check:**
1. Supabase Dashboard → Usage
2. API request count
3. Rate limits

**Solutions:**
- Implement client-side caching
- Reduce API calls
- Use batch requests
- Optimize data fetching

---

## 📊 Performance Dashboard

**Recommended Metrics to Track:**

1. **Page Load Time**: Average, P50, P95, P99
2. **Core Web Vitals**: LCP, FID, CLS
3. **API Response Time**: Average, P95
4. **Database Query Time**: Average, slow queries
5. **Error Rate**: 4xx, 5xx errors
6. **User Engagement**: Time on page, bounce rate

**Tools:**

- **Vercel Analytics**: Built-in metrics
- **Supabase Dashboard**: Database and API metrics
- **Google Analytics**: User behavior (optional)
- **Sentry**: Error tracking (optional)

---

## 🔔 Alerts Setup

### Vercel Alerts

1. Go to Vercel Dashboard → **Settings** → **Notifications**
2. Set up alerts for:
   - Build failures
   - Deployment failures
   - High error rates

### Supabase Alerts

1. Go to Supabase Dashboard → **Settings** → **Alerts**
2. Set up alerts for:
   - High database usage (> 80%)
   - High API usage (> 80%)
   - Slow queries (> 1s)
   - Storage limits

---

## 📚 Related Documentation

- **Deployment**: `docs/PRODUCTION_DEPLOYMENT.md`
- **Architecture**: `docs/ARCHITECTURE.md`
- **Database**: `docs/DATABASE.md`
- **API**: `docs/API.md`

---

**Last Updated**: 2025-01-15  
**Status**: ✅ Ready for Production Monitoring

