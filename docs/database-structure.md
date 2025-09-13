# Database Structure and Relationships

## Database Schema Overview

The Amazon Keyword Tracking system uses PostgreSQL with Supabase, implementing Row-Level Security (RLS) for data isolation and real-time subscriptions for live updates.

## Core Tables

### 1. `auth.users` (Supabase Auth)
**Purpose**: Built-in authentication table managed by Supabase
```sql
- id: UUID (Primary Key)
- email: TEXT
- encrypted_password: TEXT
- email_confirmed_at: TIMESTAMPTZ
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ
- raw_user_meta_data: JSONB
```

### 2. `user_profiles`
**Purpose**: Extended user information and application settings
```sql
- id: UUID (Primary Key, References auth.users.id)
- email: TEXT (NOT NULL)
- full_name: TEXT
- company_name: TEXT
- subscription_tier: TEXT (DEFAULT 'free')
- daily_api_limit: INTEGER (DEFAULT 100)
- created_at: TIMESTAMPTZ (DEFAULT now())
- updated_at: TIMESTAMPTZ (DEFAULT now())
```

**Relationships**:
- One-to-one with `auth.users`
- Automatically created via trigger on user signup

**RLS Policies**:
- Users can only view/update their own profile
- Automatic profile creation on user registration

### 3. `tracking_jobs`
**Purpose**: Core tracking configurations for ASIN/keyword combinations
```sql
- id: UUID (Primary Key, DEFAULT gen_random_uuid())
- user_id: UUID (References auth.users.id, NOT NULL)
- asin: TEXT (NOT NULL)
- marketplace: marketplace_type (DEFAULT 'US')
- keywords: TEXT[] (NOT NULL)
- tracking_frequency: tracking_frequency (DEFAULT 'daily')
- status: tracking_status (DEFAULT 'active')
- random_delay_min: INTEGER (DEFAULT 20)
- random_delay_max: INTEGER (DEFAULT 30)
- last_tracked_at: TIMESTAMPTZ
- next_tracking_at: TIMESTAMPTZ
- created_at: TIMESTAMPTZ (DEFAULT now())
- updated_at: TIMESTAMPTZ (DEFAULT now())
```

**Relationships**:
- Belongs to one user (user_id)
- Has many position_history records
- Has many api_requests
- Has many tracking_schedules

**Business Logic**:
- Stores array of keywords for batch tracking
- Manages scheduling with next_tracking_at
- Supports multiple marketplaces per user
- Anti-detection timing with random delays

### 4. `position_history`
**Purpose**: Time-series data for keyword ranking positions
```sql
- id: UUID (Primary Key, DEFAULT gen_random_uuid())
- tracking_job_id: UUID (References tracking_jobs.id, NOT NULL)
- keyword: TEXT (NOT NULL)
- organic_position: INTEGER
- sponsored_position: INTEGER
- search_volume: INTEGER
- competition_level: TEXT
- tracked_at: TIMESTAMPTZ (DEFAULT now())
- created_at: TIMESTAMPTZ (DEFAULT now())
```

**Relationships**:
- Belongs to one tracking_job
- Indirectly belongs to user through tracking_job

**Data Patterns**:
- One record per keyword per tracking cycle
- Nullable positions (product may not be found)
- Timestamp-based for trend analysis
- Indexed on tracked_at for performance

### 5. `api_requests`
**Purpose**: Request logging for rate limiting and anti-detection monitoring
```sql
- id: UUID (Primary Key, DEFAULT gen_random_uuid())
- user_id: UUID (References auth.users.id, NOT NULL)
- tracking_job_id: UUID (References tracking_jobs.id, NULLABLE)
- marketplace: marketplace_type (NOT NULL)
- keyword: TEXT
- success: BOOLEAN (DEFAULT false)
- error_message: TEXT
- response_time_ms: INTEGER
- user_agent: TEXT
- ip_address: INET
- data_used: BIGINT (DEFAULT 0)
- created_at: TIMESTAMPTZ (DEFAULT now())
```

**Relationships**:
- Belongs to one user
- Optionally belongs to tracking_job
- Used for analytics and monitoring

**Monitoring Purposes**:
- Success rate calculation
- Response time analysis
- CAPTCHA detection tracking
- Data usage monitoring
- Anti-detection effectiveness

### 6. `tracking_schedules`
**Purpose**: Automated scheduling and execution tracking
```sql
- id: UUID (Primary Key, DEFAULT gen_random_uuid())
- user_id: UUID (References auth.users.id, NOT NULL)
- tracking_job_id: UUID (References tracking_jobs.id, NOT NULL)
- scheduled_at: TIMESTAMPTZ (NOT NULL)
- executed_at: TIMESTAMPTZ
- status: tracking_status (DEFAULT 'active')
- created_at: TIMESTAMPTZ (DEFAULT now())
```

**Relationships**:
- Belongs to one user
- Belongs to one tracking_job
- Used by scheduler Edge Function

**Scheduling Logic**:
- Created automatically based on tracking_frequency
- Updated when jobs are executed
- Supports retry logic for failed executions

### 7. `proxy_configurations`
**Purpose**: Store proxy provider settings and credentials
```sql
- id: UUID (Primary Key, DEFAULT gen_random_uuid())
- user_id: UUID (NOT NULL)
- provider_id: TEXT (NOT NULL)
- configuration: JSONB (DEFAULT '{}')
- last_test_result: JSONB
- metrics: JSONB
- created_at: TIMESTAMPTZ (DEFAULT now())
- updated_at: TIMESTAMPTZ (DEFAULT now())
- UNIQUE(user_id, provider_id)
```

**Configuration Structure** (JSONB):
```json
{
  "endpoint": "proxy.provider.com",
  "username": "user123",
  "password": "encrypted_password",
  "port": "22225",
  "zones": "US,GB,DE,FR",
  "enabled": true
}
```

**Test Result Structure** (JSONB):
```json
{
  "success": true,
  "message": "Connection successful",
  "timestamp": 1640995200000,
  "responseTime": 1250
}
```

### 8. `data_usage_settings`
**Purpose**: User preferences for data optimization and usage alerts
```sql
- id: UUID (Primary Key, DEFAULT gen_random_uuid())
- user_id: UUID (UNIQUE, NOT NULL)
- settings: JSONB (DEFAULT '{}')
- created_at: TIMESTAMPTZ (DEFAULT now())
- updated_at: TIMESTAMPTZ (DEFAULT now())
```

**Settings Structure** (JSONB):
```json
{
  "blockImages": true,
  "blockCSS": true,
  "blockJS": false,
  "blockFonts": true,
  "blockAds": true,
  "compressRequests": true,
  "cacheResponses": true,
  "maxCacheSize": 100,
  "alerts": {
    "enableAlerts": true,
    "dailyLimit": 1000,
    "weeklyLimit": 5000,
    "monthlyLimit": 10000,
    "emailNotifications": true,
    "slackWebhook": ""
  }
}
```

---

## Custom Types (Enums)

### `marketplace_type`
```sql
'US', 'UK', 'DE', 'FR', 'IT', 'ES', 'CA', 'JP', 'AU', 'IN', 'MX', 'BR'
```
**Purpose**: Standardize Amazon marketplace identifiers

### `tracking_frequency`
```sql
'hourly', 'every_6_hours', 'daily', 'weekly'
```
**Purpose**: Define allowed tracking intervals

### `tracking_status`
```sql
'active', 'paused', 'completed', 'failed'
```
**Purpose**: Track job and schedule execution states

---

## Database Relationships Diagram

```
auth.users (Supabase)
    ↓ (1:1)
user_profiles
    ↓ (1:many)
tracking_jobs
    ↓ (1:many)
position_history

tracking_jobs
    ↓ (1:many)
api_requests

tracking_jobs
    ↓ (1:many)
tracking_schedules

auth.users
    ↓ (1:many)
proxy_configurations

auth.users
    ↓ (1:1)
data_usage_settings
```

---

## Indexes for Performance

### Primary Indexes
- All tables have UUID primary keys with automatic indexing
- Foreign key relationships automatically indexed

### Custom Indexes
```sql
-- Tracking Jobs
CREATE INDEX idx_tracking_jobs_user_id ON tracking_jobs(user_id);
CREATE INDEX idx_tracking_jobs_status ON tracking_jobs(status);
CREATE INDEX idx_tracking_jobs_next_tracking ON tracking_jobs(next_tracking_at);

-- Position History
CREATE INDEX idx_position_history_tracking_job ON position_history(tracking_job_id);
CREATE INDEX idx_position_history_keyword ON position_history(keyword);
CREATE INDEX idx_position_history_tracked_at ON position_history(tracked_at DESC);

-- API Requests
CREATE INDEX idx_api_requests_user_id ON api_requests(user_id);
CREATE INDEX idx_api_requests_created_at ON api_requests(created_at DESC);

-- Tracking Schedules
CREATE INDEX idx_tracking_schedules_scheduled_at ON tracking_schedules(scheduled_at);
CREATE INDEX idx_tracking_schedules_status ON tracking_schedules(status);
```

---

## Row-Level Security (RLS) Implementation

### Security Model
- **User Isolation**: Each user can only access their own data
- **Service Role Access**: Edge Functions use service role for system operations
- **Automatic Enforcement**: Database-level security prevents data leaks

### Policy Examples

#### User Data Access
```sql
-- Users can only see their own tracking jobs
CREATE POLICY "Users can view their own tracking jobs" 
ON tracking_jobs FOR SELECT 
USING (auth.uid() = user_id);
```

#### Indirect Access via Relationships
```sql
-- Users can see position history for their tracking jobs
CREATE POLICY "Users can view their own position history" 
ON position_history FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM tracking_jobs 
    WHERE tracking_jobs.id = position_history.tracking_job_id 
    AND tracking_jobs.user_id = auth.uid()
  )
);
```

#### System Operations
```sql
-- Edge Functions can insert data using service role
CREATE POLICY "System can insert position history" 
ON position_history FOR INSERT 
WITH CHECK (true);
```

---

## Data Flow Patterns

### 1. User Registration Flow
```
User Signs Up → auth.users created → Trigger fires → user_profiles created
```

### 2. Tracking Job Creation Flow
```
User submits form → tracking_jobs inserted → Scheduler picks up job → 
next_tracking_at calculated → Job queued for execution
```

### 3. Keyword Tracking Flow
```
Scheduler identifies due jobs → amazon-scraper Edge Function called → 
Amazon search performed → Results parsed → position_history inserted → 
tracking_jobs updated with last_tracked_at → Real-time notifications sent
```

### 4. Real-time Update Flow
```
Database change occurs → PostgreSQL trigger → Supabase real-time → 
WebSocket message → Frontend subscription → UI update → User notification
```

---

## Data Integrity and Constraints

### Foreign Key Constraints
- All user_id fields reference auth.users(id) with CASCADE DELETE
- tracking_job_id references maintain referential integrity
- Proxy configurations use composite unique constraints

### Data Validation
- ASIN format validation in application layer
- Keyword array constraints (non-empty)
- Marketplace enum enforcement
- Timestamp consistency checks

### Backup and Recovery
- Supabase automatic backups
- Point-in-time recovery capability
- Data export functionality for user data portability

---

## Performance Optimization

### Query Optimization
- Strategic indexing on frequently queried columns
- Efficient JOIN operations for related data
- Pagination for large datasets
- Query result caching via React Query

### Real-time Optimization
- Selective subscriptions to relevant changes only
- Efficient WebSocket message filtering
- Batched updates for multiple changes
- Connection pooling for database access

### Storage Optimization
- JSONB for flexible configuration storage
- Efficient array storage for keywords
- Timestamp indexing for time-series queries
- Automatic cleanup of old data (future enhancement)

This database structure provides a robust foundation for the Amazon keyword tracking system with proper relationships, security, and performance optimization.