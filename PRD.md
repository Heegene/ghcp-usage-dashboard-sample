# Planning Guide

A powerful dashboard for analyzing GitHub Copilot usage metrics from NDJSON files, enabling users to visualize code generation data with interactive pivot-style charts.

**Experience Qualities**:
1. **Analytical** - Clear data visualization that reveals meaningful patterns in Copilot usage
2. **Intuitive** - Easy file upload and metric selection without complex configuration
3. **Professional** - A polished, data-focused interface that feels like enterprise-grade tooling

**Complexity Level**: Light Application (multiple features with basic state)
- File upload, data parsing, metric selection, and dynamic chart rendering with pivot-style filtering capabilities

## Essential Features

### 1. NDJSON File Upload
- **Functionality**: Accept and parse NDJSON files containing GitHub Copilot usage metrics
- **Purpose**: Entry point for all data analysis
- **Trigger**: Drag-and-drop or click to upload
- **Progression**: Drop file → Parse NDJSON → Validate schema → Display summary → Show dashboard
- **Success criteria**: File parsed correctly, data available for visualization

### 2. Metrics Overview Dashboard
- **Functionality**: Display key aggregated metrics (total suggestions, acceptances, acceptance rate, lines of code)
- **Purpose**: Quick snapshot of overall Copilot effectiveness
- **Trigger**: Automatic after successful file upload
- **Progression**: Data loaded → Calculate aggregates → Render stat cards → Update on filter change
- **Success criteria**: Accurate calculations displayed in clear stat cards

### 3. Pivot-Style Chart Builder
- **Functionality**: Select dimensions (date, language, editor, model) and metrics to create custom visualizations
- **Purpose**: Flexible data exploration like pivot tables
- **Trigger**: User selects grouping dimension and metric from dropdowns
- **Progression**: Select dimension → Select metric → Generate chart → Switch chart type
- **Success criteria**: Charts update dynamically based on selections

### 4. Time Series Analysis
- **Functionality**: Line/area charts showing metrics over time
- **Purpose**: Identify trends and patterns in Copilot usage
- **Trigger**: Default view or time dimension selection
- **Progression**: Select date range → View trend → Hover for details
- **Success criteria**: Clear time-based visualization with proper date formatting

### 5. Language & Editor Breakdown
- **Functionality**: Bar/pie charts showing distribution by programming language and IDE
- **Purpose**: Understand where Copilot is most effective
- **Trigger**: Select language or editor as dimension
- **Progression**: Group data → Render chart → Click segment for details
- **Success criteria**: Accurate breakdown with percentage calculations

## Edge Case Handling
- **Empty file**: Show friendly message prompting user to upload a valid file
- **Invalid JSON**: Display parsing error with line number if possible
- **Missing fields**: Use fallback values and indicate incomplete data
- **Large files**: Process in chunks with progress indicator
- **No data for selection**: Show "No data available" state with suggestion to adjust filters

## Design Direction
The design should evoke a sense of **technical precision** and **data clarity** - like a mission control dashboard for developer productivity. Dark theme with vibrant accent colors for data visualization, creating high contrast for easy reading.

## Color Selection
- **Primary Color**: `oklch(0.65 0.2 250)` - Electric blue representing technology and analytics
- **Secondary Colors**: `oklch(0.25 0.02 260)` - Deep slate for cards and containers
- **Accent Color**: `oklch(0.75 0.18 160)` - Emerald green for success metrics and positive trends
- **Background**: `oklch(0.15 0.02 260)` - Near-black with subtle blue undertone
- **Foreground/Background Pairings**:
  - Background (Dark slate): White text `oklch(0.95 0 0)` - Ratio 12:1 ✓
  - Primary (Electric blue): White text - Ratio 4.8:1 ✓
  - Accent (Emerald): Dark text `oklch(0.15 0 0)` - Ratio 7:1 ✓

## Font Selection
Technical and modern typefaces that convey data precision while maintaining excellent readability at various sizes.

- **Primary Font**: JetBrains Mono - For metrics, numbers, and code-related content
- **Secondary Font**: Inter - For UI labels and descriptions
- **Typographic Hierarchy**:
  - H1 (Page Title): Inter Bold/32px/tight
  - H2 (Section Title): Inter Semibold/24px/normal
  - H3 (Card Title): Inter Medium/18px/normal
  - Body: Inter Regular/14px/relaxed
  - Metrics: JetBrains Mono Medium/28px/tight
  - Labels: Inter Medium/12px/wide letter-spacing

## Animations
Subtle data-focused animations that guide attention without distraction - chart elements should animate in sequentially, hover states reveal additional information, and transitions between views should feel smooth and purposeful.

## Component Selection
- **Components**:
  - Card - For metric displays and chart containers
  - Select - For dimension and metric dropdowns
  - Tabs - For switching between chart types
  - Badge - For language/editor tags
  - Tooltip - For chart data points
  - Button - For file upload and actions
  - Progress - For file processing
- **Customizations**:
  - Custom file dropzone with dashed border and icon
  - Animated stat cards with trend indicators
  - Chart container with gradient borders
- **States**:
  - Buttons: Default (blue), Hover (lighter), Active (pressed effect), Disabled (muted)
  - Dropdowns: Focus ring, open state with smooth animation
  - Cards: Subtle hover lift effect
- **Icon Selection**: 
  - Upload, ChartBar, ChartLine, Code, Calendar, Funnel for filtering
- **Spacing**: 
  - Page padding: p-6
  - Card padding: p-4
  - Gap between cards: gap-4
  - Section spacing: space-y-6
- **Mobile**: 
  - Stack cards vertically
  - Full-width charts
  - Collapsible filter panel
