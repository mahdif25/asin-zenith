# Component Architecture Documentation

## Component Hierarchy and Relationships

### Root Level Components

#### `App.tsx`
**Purpose**: Application root with routing and global providers
**Dependencies**: React Router, React Query, Auth Provider, Toast providers
**Children**: Auth page, Protected routes, Error boundaries
**State Management**: Global query client, authentication context

#### `ProtectedRoute.tsx`
**Purpose**: Route protection wrapper ensuring authenticated access
**Dependencies**: useAuth hook, React Router
**Functionality**: Redirects unauthenticated users to login

---

## Page Components

### `Index.tsx` (Main Dashboard Page)
**Purpose**: Primary application interface with tabbed navigation
**Layout**: Header with user info + logout, tabbed content area
**Tabs**: Dashboard, Setup, Tracking, Reports, Settings
**State**: Active tab management, user session display

### `Auth.tsx` (Authentication Page)
**Purpose**: User login and registration interface
**Layout**: Centered card with sign-in/sign-up tabs
**Features**: Form validation, loading states, error handling
**Integration**: Supabase Auth, automatic redirect on success

### `NotFound.tsx`
**Purpose**: 404 error page for invalid routes
**Functionality**: Error logging, navigation back to home

---

## Dashboard Components

### `Dashboard.tsx`
**Purpose**: System overview and key performance indicators
**Layout**: 
- Overview cards (4-column grid)
- Performance widgets (3-column grid)
- Trend analysis and quick actions (2-column grid)
- Recent activity feed

**Data Sources**:
- `useKeywordRankings()` - Current ranking data
- `useTrackingJobs()` - Job status information
- Real-time calculations for metrics

**Key Metrics**:
- Total keywords being tracked
- Active tracking jobs count
- Top 10 rankings count
- Average position across all keywords

### `PerformanceWidget.tsx`
**Purpose**: Real-time system performance monitoring
**Metrics Displayed**:
- System health status with color coding
- Total keywords and active jobs
- Top rankings and average position
- Trend distribution (improving/declining/stable)
- Last update timestamp

**Data Flow**:
1. Fetches data from `usePerformanceMetrics()` hook
2. Calculates health score based on multiple factors
3. Updates every minute via polling
4. Displays color-coded status indicators

### `SystemHealthWidget.tsx`
**Purpose**: Comprehensive system health monitoring
**Health Indicators**:
- Overall system health (excellent/good/fair/poor)
- API performance metrics
- Tracking job health
- Anti-detection effectiveness
- Actionable recommendations

**Calculation Logic**:
- Success rate from API requests
- Response time analysis
- CAPTCHA detection frequency
- Active vs failed job ratios

### `AntiDetectionMonitor.tsx`
**Purpose**: Monitor scraping detection and evasion effectiveness
**Metrics Tracked**:
- Total requests vs successful requests
- CAPTCHA detection rate
- User agent rotation count
- Average response times
- Session health status

**Real-time Updates**: Refreshes every 30 seconds with latest detection metrics

---

## Setup Components

### `KeywordSetup.tsx`
**Purpose**: Complete tracking job configuration interface
**Sections**:

#### Tracking Configuration
- ASIN input with validation
- Marketplace selection (9 supported regions)
- Tracking frequency options

#### Keywords Management
- Individual keyword addition
- Bulk keyword import (textarea)
- Keyword list with removal capability
- Duplicate prevention

#### Tracking Schedule
- Frequency selection
- Random delay configuration (anti-detection)
- Schedule preview

#### Existing Jobs Management
- List of current tracking jobs
- Job status indicators
- Manual job execution
- Quick job overview

**Validation Rules**:
- ASIN format checking
- Keyword uniqueness
- Delay range constraints (10-60 seconds)
- Required field validation

**Data Flow**:
1. Form data collected and validated
2. Job created via `createTrackingJob()` mutation
3. Database insertion with user association
4. Automatic scheduling initialization
5. UI updates with new job information

---

## Tracking Components

### `TrackingResults.tsx`
**Purpose**: Real-time display of keyword ranking results
**Layout**:
- Status overview cards (3-column grid)
- Tracking progress indicator
- Results table with filtering
- Action buttons for manual operations

**Table Columns**:
- Keyword name
- ASIN identifier
- Marketplace region
- Organic position (with badge styling)
- Sponsored position (with badge styling)
- Trend indicator (visual arrows)
- Last checked timestamp
- Job status
- Action buttons (view history)

**Filtering Options**:
- All results
- Organic only
- Sponsored only

**Real-time Features**:
- Live progress tracking during scraping cycles
- Automatic data refresh every 60 seconds
- WebSocket updates for immediate changes
- Loading states and error handling

### `KeywordHistoryView.tsx`
**Purpose**: Detailed historical analysis for individual keywords
**Sections**:

#### Header
- Keyword name and ASIN
- Back navigation
- Export functionality

#### Controls
- Time period selection (7/15/30/90 days)
- Chart type selection (line/area)

#### Key Metrics Cards
- Current positions (organic/sponsored)
- Performance statistics (avg/best/worst)
- Tracking summary information

#### Data Visualization
- Position history chart (placeholder for future implementation)
- Recent data table with full history
- Trend analysis and insights

**Data Processing**:
1. Filters position history by keyword and ASIN
2. Calculates analytics from historical data
3. Determines trends based on position changes
4. Generates performance statistics

---

## Reports Components

### `ReportsView.tsx`
**Purpose**: Comprehensive reporting and data export functionality
**Sections**:

#### Report Configuration
- Report type selection (combined/organic/sponsored)
- Time frame selection (24h/7d/30d/90d)
- ASIN filtering
- Export format options (CSV/PDF)

#### Tabbed Reports
- **Combined Report**: Organic vs sponsored comparison
- **Organic Report**: Natural search rankings
- **Sponsored Report**: Paid advertisement positions

#### Quick Stats
- Best organic rank achieved
- Best sponsored rank achieved
- Total keywords tracked

**Chart Integration**:
- Line charts for position trends
- Bar charts for sponsored analysis
- Responsive chart containers
- Interactive tooltips and legends

**Export Functionality**:
- CSV generation with proper formatting
- PDF export (placeholder for future implementation)
- Filename generation with timestamps
- Download trigger and file management

---

## Settings Components

### `SettingsPage.tsx`
**Purpose**: Main settings container with tabbed interface
**Tabs**: Proxies, Status, Data Usage
**Layout**: Responsive tab navigation with icon indicators

### `ProxySettingsCard.tsx`
**Purpose**: Proxy provider configuration and management
**Providers Supported**:
- **Bright Data**: Residential proxy leader
- **SmartProxy**: High-quality proxy service
- **Oxylabs**: Enterprise proxy solutions

**Configuration Fields**:
- Endpoint URL
- Port number
- Username/password credentials
- Available zones/countries
- Connection testing

**Features**:
- Real-time connection testing
- Configuration validation
- Setup instructions for each provider
- Test result history and error messages

### `ApiStatusOverview.tsx`
**Purpose**: Monitor proxy connections and API performance
**Metrics Displayed**:
- Overall connection status
- Connected providers count
- Daily data usage tracking
- Active request monitoring
- Provider-specific performance metrics

**Status Indicators**:
- Color-coded connection status
- Response time measurements
- Success rate percentages
- Data usage tracking
- Last test timestamps

### `DataUsageSettings.tsx`
**Purpose**: Optimize data consumption and set usage alerts
**Optimization Options**:
- Content filtering (images, CSS, JS, fonts, ads)
- Request compression
- Response caching
- HTML minification

**Usage Monitoring**:
- Real-time consumption tracking
- Daily/weekly/monthly limits
- Provider-specific usage breakdown
- Historical usage trends

**Alert Configuration**:
- Usage threshold alerts
- Email notifications
- Slack webhook integration
- Custom limit settings

---

## Utility Components

### `NotificationCenter.tsx`
**Purpose**: Centralized notification management
**Features**:
- Notification badge with unread count
- Popover interface with scrollable list
- Mark as read functionality
- Clear all notifications
- Timestamp formatting

**Notification Types**:
- Position changes (significant improvements)
- Tracking completion alerts
- System errors and warnings
- Broadcast messages

### UI Components (`/components/ui/`)
**Purpose**: Consistent design system components
**Components**: 40+ reusable UI elements
**Features**: 
- Consistent styling with CSS variables
- Dark/light mode support
- Accessibility compliance
- TypeScript type safety

---

## Custom Hooks

### `useAuth.tsx`
**Purpose**: Authentication state management
**Functions**: signUp, signIn, signOut
**State**: user, session, loading
**Integration**: Supabase Auth with automatic profile creation

### `useTrackingJobs.tsx`
**Purpose**: Tracking job CRUD operations
**Functions**: create, update, delete, run jobs
**Queries**: React Query integration with caching
**Real-time**: Automatic refetch on mutations

### `usePositionHistory.tsx`
**Purpose**: Historical ranking data management
**Queries**: Position history with filtering
**Calculations**: Trend analysis and statistics
**Caching**: Intelligent query invalidation

### `useKeywordRankings.tsx`
**Purpose**: Current ranking data aggregation
**Processing**: Latest position for each keyword
**Trend Calculation**: Comparison with previous positions
**Real-time**: 60-second refresh interval

### `useProxyManager.tsx`
**Purpose**: Proxy configuration and testing
**Functions**: save, test, load configurations
**State**: Provider status and metrics
**Integration**: Edge Functions for connection testing

### `useRealtimeUpdates.tsx`
**Purpose**: WebSocket notification handling
**Subscriptions**: Database change events
**Notifications**: Position changes, job updates
**State**: Notification list and unread counts

### `usePerformanceMetrics.tsx`
**Purpose**: System performance calculation
**Metrics**: Health scores, trend analysis
**Sources**: Multiple data tables aggregation
**Updates**: Real-time metric calculation

### `useSystemHealth.tsx`
**Purpose**: Comprehensive health monitoring
**Analysis**: API, tracking, and anti-detection health
**Recommendations**: Actionable improvement suggestions
**Refresh**: Manual and automatic updates

### `useDataUsageSettings.tsx`
**Purpose**: Data optimization configuration
**Settings**: Content filtering and caching options
**Usage**: Real-time consumption tracking
**Alerts**: Threshold monitoring and notifications

### `useExportData.tsx`
**Purpose**: Report generation and export
**Formats**: CSV and PDF export capabilities
**Processing**: Data aggregation and formatting
**Download**: File generation and browser download

---

## Component Communication Patterns

### Data Flow Architecture
1. **Top-down Props**: Configuration and callbacks
2. **Context Providers**: Authentication and global state
3. **Custom Hooks**: Business logic and API integration
4. **React Query**: Server state management and caching
5. **WebSocket Subscriptions**: Real-time updates

### State Management Strategy
- **Local State**: Component-specific UI state
- **Context**: Authentication and global settings
- **React Query**: Server data with intelligent caching
- **Real-time**: WebSocket subscriptions for live updates

### Error Handling Approach
- **Error Boundaries**: Component-level error catching
- **Try-catch**: Async operation error handling
- **Toast Notifications**: User-friendly error messages
- **Fallback UI**: Graceful degradation on failures

### Performance Considerations
- **Lazy Loading**: Code splitting for large components
- **Memoization**: Expensive calculations cached
- **Debouncing**: Input handling optimization
- **Pagination**: Large dataset management

This component architecture ensures maintainable, scalable, and performant code with clear separation of concerns and robust error handling throughout the application.