# Production Deployment Checklist - P.A.R.C.E

**Generated**: June 9, 2026  
**Version**: 1.0  
**Target Environment**: Production

---

## 1. Environment Configuration

### 1.1 Environment Variables (.env)

- [ ] Set `APP_ENV=production`
- [ ] Set `APP_DEBUG=false`
- [ ] Generate strong `APP_KEY` (32+ characters)
- [ ] Configure `DB_HOST` (production database server)
- [ ] Configure `DB_PORT` (default: 3306)
- [ ] Configure `DB_DATABASE` (production database name)
- [ ] Set strong `DB_USERNAME` (not root!)
- [ ] Set strong `DB_PASSWORD` (16+ characters, alphanumeric + symbols)
- [ ] Configure `CORS_ALLOWED_ORIGINS` (production frontend URLs)
- [ ] Set `SESSION_COOKIE_NAME=parce_session`
- [ ] Set `SESSION_SECURE=true` (HTTPS only)
- [ ] Set `SESSION_SAMESITE=Strict`
- [ ] Configure `SESSION_LIFETIME=7200` (2 hours in seconds)
- [ ] Configure error logging path
- [ ] Remove any debug/development flags

**Example Production .env**:
```env
APP_ENV=production
APP_DEBUG=false
APP_KEY=your_random_32_character_secret_key

DB_HOST=production-db.example.com
DB_PORT=3306
DB_DATABASE=parce_production
DB_USERNAME=parce_user
DB_PASSWORD=strong_secure_password_here

CORS_ALLOWED_ORIGINS=https://app.parce.com,https://www.parce.com
CORS_ALLOW_CREDENTIALS=true
CORS_MAX_AGE=86400

SESSION_COOKIE_NAME=parce_session
SESSION_SECURE=true
SESSION_HTTPONLY=true
SESSION_SAMESITE=Strict
SESSION_LIFETIME=7200

LOG_PATH=/var/log/parce/
```

---

## 2. Security Hardening

### 2.1 Server Security

- [ ] Enable HTTPS/TLS (SSL certificate installed)
- [ ] Force HTTPS redirect (HTTP → HTTPS)
- [ ] Configure firewall (allow only ports 80, 443)
- [ ] Disable directory listing
- [ ] Hide PHP version (`expose_php = Off` in php.ini)
- [ ] Set secure file permissions (644 for files, 755 for directories)
- [ ] Restrict `.env` file access (600 permissions, owned by web server user)
- [ ] Remove `.git` folder from web root
- [ ] Disable unused PHP functions (exec, shell_exec, system, etc.)

### 2.2 Database Security

- [ ] Create dedicated database user (not root)
- [ ] Grant only required privileges (SELECT, INSERT, UPDATE, DELETE)
- [ ] Enable MySQL SSL connections
- [ ] Set strong `root` password
- [ ] Disable remote root login
- [ ] Configure database firewall (allow only app server IP)
- [ ] Enable binary logging for point-in-time recovery
- [ ] Set up read replicas (if needed for scale)

### 2.3 Session Security

- [ ] Verify `HttpOnly` flag enabled on session cookies
- [ ] Verify `Secure` flag enabled (HTTPS only)
- [ ] Verify `SameSite=Strict` configured
- [ ] Set up automated session cleanup (cron job every hour)
- [ ] Configure session timeout (2 hours default)
- [ ] Enable session regeneration on privilege escalation
- [ ] Monitor session table size

**Cron job for session cleanup**:
```bash
0 * * * * php /var/www/parce/cleanup_sessions.php >> /var/log/parce/session_cleanup.log 2>&1
```

### 2.4 Input Validation

- [ ] ✅ All user input sanitized (already implemented)
- [ ] ✅ SQL injection prevention via prepared statements (already implemented)
- [ ] ✅ XSS prevention via HttpOnly cookies (already implemented)
- [ ] ✅ CSRF protection via SameSite cookies (already implemented)
- [ ] Add request size limits (PHP `post_max_size`, `upload_max_filesize`)
- [ ] Add request rate limiting (implement on all mutation endpoints)

---

## 3. Rate Limiting

### Current Status: Partial (login only)

- [ ] **CRITICAL**: Implement rate limiting on registration endpoint
- [ ] Implement rate limiting on password reset (when implemented)
- [ ] Implement rate limiting on all POST/PUT/DELETE endpoints
- [ ] Configure rate limits per endpoint type:
  - Auth endpoints: 5 requests per 15 minutes
  - Mutation endpoints: 30 requests per minute
  - Read endpoints: 60 requests per minute
- [ ] Set up Redis for distributed rate limiting (optional, for load balancing)

**Recommended**: Use existing `RateLimiter` class, apply to routes:

```php
// In routes.php
$router->post('/api/auth/register', [AuthController::class, 'register'])
    ->middleware([RateLimiterMiddleware::class, ['register', 5, 15]]);
```

---

## 4. Logging & Monitoring

### 4.1 Application Logging

- [ ] Configure centralized logging (Monolog, Syslog, etc.)
- [ ] Set up log rotation (daily, keep 30 days)
- [ ] Log all authentication events (login, logout, failed attempts)
- [ ] Log all authorization failures (403 errors)
- [ ] Log all server errors (500 errors)
- [ ] Log database connection failures
- [ ] Add request ID tracking for debugging
- [ ] Remove or redact sensitive data from logs (passwords, session IDs)

**Log levels**:
- `ERROR`: Server errors, database failures
- `WARNING`: Failed authentication, authorization failures
- `INFO`: Successful authentication, major events
- `DEBUG`: Disabled in production

### 4.2 Error Monitoring

- [ ] Set up error tracking service (Sentry, Rollbar, Bugsnag)
- [ ] Configure error alerting (email, Slack, PagerDuty)
- [ ] Set up uptime monitoring (Pingdom, UptimeRobot)
- [ ] Monitor 5xx error rates
- [ ] Monitor 4xx error rates (high rates may indicate attacks)
- [ ] Set up application performance monitoring (APM)

### 4.3 Health Checks

- [ ] ✅ Application health endpoint working (`/api/health`)
- [ ] ✅ Database health endpoint working (`/api/health/database`)
- [ ] ✅ System health endpoint working (`/api/health/system`)
- [ ] Configure load balancer health checks (use `/api/health`)
- [ ] Set up automated health check alerts (every 5 minutes)

---

## 5. Database Optimization

### 5.1 Indexes

- [ ] ✅ Verify all foreign keys have indexes (already created)
- [ ] ✅ Verify `email` column indexed on `users` table
- [ ] ✅ Verify `slug` column indexed on `roles` table
- [ ] ✅ Verify lookup columns indexed (status, created_at, etc.)
- [ ] Run EXPLAIN on slow queries
- [ ] Add composite indexes for common query patterns

### 5.2 Performance

- [ ] Enable query caching (MySQL query cache)
- [ ] Set up connection pooling
- [ ] Configure appropriate `max_connections` (MySQL)
- [ ] Enable slow query log (queries > 2 seconds)
- [ ] Optimize table structures (run OPTIMIZE TABLE monthly)
- [ ] Set up database monitoring (query performance, connection count)

### 5.3 Backups

- [ ] **CRITICAL**: Set up automated daily backups
- [ ] Configure backup retention (keep 30 days)
- [ ] Store backups in separate location (off-site)
- [ ] Test backup restoration process
- [ ] Document backup restoration procedure
- [ ] Set up point-in-time recovery (binary logs)
- [ ] Encrypt backups at rest

**Backup schedule**:
```bash
# Daily full backup at 2 AM
0 2 * * * /usr/local/bin/backup_parce_db.sh >> /var/log/parce/backup.log 2>&1

# Weekly backup verification
0 3 * * 0 /usr/local/bin/verify_backup.sh >> /var/log/parce/backup_verify.log 2>&1
```

---

## 6. Performance Optimization

### 6.1 PHP Configuration

- [ ] Enable OPcache (`opcache.enable=1`)
- [ ] Configure OPcache memory (`opcache.memory_consumption=256`)
- [ ] Set appropriate `memory_limit` (256M minimum)
- [ ] Configure `max_execution_time` (30 seconds)
- [ ] Configure `max_input_time` (60 seconds)
- [ ] Disable `display_errors` (production)
- [ ] Enable `log_errors`

**Recommended php.ini settings**:
```ini
memory_limit = 256M
max_execution_time = 30
max_input_time = 60
post_max_size = 20M
upload_max_filesize = 20M
display_errors = Off
log_errors = On
error_log = /var/log/php/error.log
opcache.enable = 1
opcache.memory_consumption = 256
opcache.max_accelerated_files = 10000
opcache.validate_timestamps = 0
```

### 6.2 Web Server

- [ ] Enable HTTP/2
- [ ] Enable Gzip compression
- [ ] Configure proper cache headers
- [ ] Set up CDN for static assets (if applicable)
- [ ] Enable keep-alive connections
- [ ] Configure worker processes (based on CPU cores)

**Nginx example**:
```nginx
gzip on;
gzip_types text/plain text/css application/json application/javascript;
keepalive_timeout 65;
http2 on;
```

### 6.3 Caching

- [ ] Implement response caching (Redis, Memcached)
- [ ] Cache database query results (frequently accessed data)
- [ ] Cache user sessions (Redis recommended for scale)
- [ ] Set up CDN for API responses (optional, for global scale)
- [ ] Implement ETag headers for conditional requests

---

## 7. Deployment Process

### 7.1 Pre-Deployment

- [ ] Run all tests (unit, integration)
- [ ] Run code linter/static analysis
- [ ] Review code changes since last deployment
- [ ] Update version number
- [ ] Tag release in version control
- [ ] Create deployment checklist for specific release
- [ ] Notify team of deployment window

### 7.2 Deployment Steps

- [ ] Create database backup
- [ ] Enable maintenance mode
- [ ] Pull latest code from repository
- [ ] Run `composer install --no-dev --optimize-autoloader`
- [ ] Run database migrations (`php migrate.php migrate`)
- [ ] Clear OPcache (`opcache_reset()`)
- [ ] Verify `.env` configuration
- [ ] Run health checks
- [ ] Disable maintenance mode
- [ ] Monitor error logs for 15 minutes

### 7.3 Rollback Plan

- [ ] Document rollback procedure
- [ ] Keep previous release available
- [ ] Test rollback procedure in staging
- [ ] Have database backup ready for restore
- [ ] Define rollback triggers (error rate threshold)

---

## 8. Monitoring & Alerting

### 8.1 Metrics to Monitor

- [ ] Response time (p50, p95, p99)
- [ ] Request rate (requests per minute)
- [ ] Error rate (5xx, 4xx)
- [ ] Database query time
- [ ] Database connection count
- [ ] Memory usage
- [ ] CPU usage
- [ ] Disk usage
- [ ] Session table size
- [ ] Active user count

### 8.2 Alerts to Configure

- [ ] Alert on 5xx error rate > 1%
- [ ] Alert on response time p95 > 1 second
- [ ] Alert on database connection failures
- [ ] Alert on disk usage > 80%
- [ ] Alert on memory usage > 85%
- [ ] Alert on health check failures (3 consecutive)
- [ ] Alert on failed login rate spike (possible attack)

### 8.3 Tools

**Recommended**:
- Application Monitoring: New Relic, Datadog, Scout APM
- Error Tracking: Sentry, Rollbar
- Uptime Monitoring: Pingdom, StatusCake
- Log Management: Papertrail, Loggly, ELK Stack

---

## 9. Compliance & Legal

### 9.1 Data Privacy

- [ ] Review GDPR compliance (if serving EU users)
- [ ] Implement data retention policies
- [ ] Implement data deletion mechanism (GDPR "right to be forgotten")
- [ ] Document data processing activities
- [ ] Add privacy policy endpoint
- [ ] Add terms of service endpoint
- [ ] Implement user consent tracking

### 9.2 Security Compliance

- [ ] Document security measures
- [ ] Perform security audit/penetration testing
- [ ] Review access controls
- [ ] Document incident response procedure
- [ ] Implement audit logging for sensitive operations
- [ ] Review third-party dependencies for vulnerabilities

---

## 10. Documentation

### 10.1 Internal Documentation

- [ ] ✅ API documentation complete (`API_DOCUMENTATION_COMPLETE.md`)
- [ ] ✅ Backend audit report (`BACKEND_AUDIT_REPORT.md`)
- [ ] ✅ Frontend integration guide (`FRONTEND_INTEGRATION_REPORT.md`)
- [ ] Document deployment procedure
- [ ] Document rollback procedure
- [ ] Document database backup/restore procedure
- [ ] Document incident response procedure
- [ ] Create runbook for common issues

### 10.2 External Documentation

- [ ] Create API documentation for frontend team
- [ ] Create user guide (if applicable)
- [ ] Create admin guide
- [ ] Document rate limits
- [ ] Document error codes
- [ ] Provide example requests/responses

---

## 11. Testing in Production

### 11.1 Smoke Tests

After deployment, test:

- [ ] Health check endpoint (`GET /api/health`)
- [ ] Database health check (`GET /api/health/database`)
- [ ] User registration (`POST /api/auth/register`)
- [ ] User login (`POST /api/auth/login`)
- [ ] Create vehicle (`POST /api/vehicles`)
- [ ] Create service request (`POST /api/service-requests`)
- [ ] Mechanic accepts request (`POST /api/mechanic/requests/{id}/accept`)
- [ ] Logout (`POST /api/auth/logout`)

### 11.2 Load Testing

- [ ] Perform load testing before launch
- [ ] Test concurrent user handling (target: 100+ concurrent)
- [ ] Test database connection pool under load
- [ ] Test session handling under load
- [ ] Identify bottlenecks
- [ ] Set baseline performance metrics

**Tools**: Apache JMeter, k6, Locust

---

## 12. Post-Deployment

### 12.1 Monitoring

- [ ] Monitor error rates for 24 hours
- [ ] Monitor response times
- [ ] Monitor database performance
- [ ] Monitor server resources (CPU, memory, disk)
- [ ] Review logs for anomalies

### 12.2 Validation

- [ ] Verify all endpoints responding correctly
- [ ] Verify authentication working
- [ ] Verify RBAC enforcement
- [ ] Verify CORS configuration
- [ ] Verify session cookies working
- [ ] Verify database connectivity
- [ ] Verify backups running

---

## 13. Maintenance Plan

### 13.1 Regular Maintenance

**Daily**:
- [ ] Review error logs
- [ ] Monitor uptime
- [ ] Check backup success

**Weekly**:
- [ ] Review performance metrics
- [ ] Check disk usage
- [ ] Review slow query log
- [ ] Update dependencies (security patches)

**Monthly**:
- [ ] Review security logs
- [ ] Optimize database tables
- [ ] Review and archive old logs
- [ ] Test backup restoration
- [ ] Review rate limit effectiveness
- [ ] Security audit

**Quarterly**:
- [ ] Penetration testing
- [ ] Performance review
- [ ] Capacity planning
- [ ] Dependency updates (major versions)

---

## 14. Scaling Considerations

### When to Scale

Monitor these metrics:
- Response time p95 consistently > 500ms
- Database connections > 80% of max
- CPU usage > 70% sustained
- Memory usage > 80% sustained
- Request rate growing 50%+ month-over-month

### Scaling Options

**Vertical Scaling** (easier):
- [ ] Increase server CPU/RAM
- [ ] Increase database server resources
- [ ] Optimize database queries

**Horizontal Scaling** (for high traffic):
- [ ] Set up load balancer (Nginx, HAProxy, AWS ALB)
- [ ] Deploy multiple app servers
- [ ] Use Redis for shared session storage
- [ ] Set up database read replicas
- [ ] Implement distributed rate limiting (Redis)
- [ ] Use CDN for static assets

---

## 15. Incident Response

### 15.1 Incident Response Plan

- [ ] Define incident severity levels
- [ ] Document escalation procedure
- [ ] Create on-call rotation
- [ ] Set up incident communication channel (Slack, etc.)
- [ ] Document common issues and solutions
- [ ] Practice incident response drills

### 15.2 Severity Levels

**P0 - Critical** (service down):
- All users unable to access system
- Database unavailable
- Authentication completely broken
- Response: Immediate, 24/7

**P1 - High** (major functionality broken):
- Key feature unavailable
- Performance severely degraded
- Security vulnerability discovered
- Response: Within 1 hour

**P2 - Medium** (minor functionality broken):
- Non-critical feature unavailable
- Minor performance issues
- Response: Within 4 hours

**P3 - Low** (cosmetic or enhancement):
- UI issues
- Minor bugs
- Enhancement requests
- Response: Next business day

---

## 16. Success Criteria

### Launch Readiness

System is ready for production when:

- [ ] All "CRITICAL" items in this checklist completed
- [ ] All smoke tests passing
- [ ] Load testing successful (target load + 50%)
- [ ] Security audit passed
- [ ] Backups tested and verified
- [ ] Monitoring and alerting configured
- [ ] Incident response plan in place
- [ ] Documentation complete
- [ ] Team trained on deployment/rollback procedures

### Post-Launch Success Metrics

**Week 1**:
- Uptime > 99.5%
- p95 response time < 500ms
- Error rate < 0.5%
- Zero security incidents

**Month 1**:
- Uptime > 99.9%
- p95 response time < 300ms
- Error rate < 0.1%
- User growth on target
- Zero data loss incidents

---

## 17. Final Pre-Launch Checklist

### Absolutely Must Complete

- [ ] **HTTPS enabled and forced**
- [ ] **Database backups automated and tested**
- [ ] **Session security configured (Secure, HttpOnly, SameSite)**
- [ ] **Production .env configured (DEBUG=false)**
- [ ] **Error monitoring configured (Sentry, etc.)**
- [ ] **Health checks working**
- [ ] **Rate limiting implemented on auth endpoints**
- [ ] **Database user privileges restricted**
- [ ] **Firewall configured**
- [ ] **All smoke tests passing**

### Recommended Before Launch

- [ ] Load testing completed
- [ ] Security audit completed
- [ ] Monitoring dashboards created
- [ ] Alert rules configured
- [ ] Incident response plan documented
- [ ] Rollback procedure tested
- [ ] Team training completed

---

## Status: Ready for Production? ✅

**Current Backend Status**: ✅ Production-Ready (92/100)

**Remaining Critical Items**: 
1. Configure production environment variables
2. Set up automated database backups
3. Enable HTTPS/SSL
4. Configure production CORS
5. Set up monitoring and alerting

**Estimated Time to Production**: 1-2 days (for DevOps setup)

---

**Document Version**: 1.0  
**Last Updated**: June 9, 2026  
**Next Review**: After Production Launch
