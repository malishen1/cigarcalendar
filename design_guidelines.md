# Design Guidelines: Cigar Tracking Application

## Design Approach

**Selected Approach**: Reference-Based with Premium Lifestyle Influence

Drawing inspiration from premium tracking applications like Vivino (wine) and Untappud (beer), combined with the clean data organization of Notion. This creates a sophisticated yet approachable experience befitting a connoisseur's tool.

**Core Principle**: Elegant simplicity - celebrate the ritual and appreciation of cigars through refined, uncluttered design that makes logging and reviewing effortless.

---

## Typography System

**Font Families** (Google Fonts via CDN):
- **Primary**: Crimson Pro (serif) - for headings and cigar names, conveying tradition and sophistication
- **Secondary**: Inter (sans-serif) - for body text, UI elements, and data, ensuring clarity

**Type Scale**:
- Hero/Page Titles: text-5xl md:text-6xl, font-semibold
- Section Headers: text-3xl md:text-4xl, font-semibold  
- Card Titles/Cigar Names: text-xl md:text-2xl, font-medium
- Body Text: text-base, font-normal
- Metadata/Labels: text-sm, font-medium, uppercase tracking-wide
- Small Text: text-xs

---

## Layout System

**Spacing Primitives**: Use Tailwind units of 2, 4, 6, and 8 consistently
- Micro spacing: p-2, gap-2
- Standard spacing: p-4, m-4, gap-4
- Section spacing: p-6, my-6
- Large spacing: p-8, my-8, py-12

**Container Strategy**:
- Main app container: max-w-7xl mx-auto px-4 md:px-6
- Content areas: max-w-4xl for forms and reading content
- Card grids: grid gap-4 md:gap-6

**Responsive Breakpoints**:
- Mobile: base (single column)
- Tablet: md: (2 columns where appropriate)
- Desktop: lg: (multi-column layouts, side navigation)

---

## Application Structure

### Navigation
**Desktop**: Persistent sidebar (w-64) with navigation items, user profile at top, and quick-add button prominently placed
**Mobile**: Bottom navigation bar (fixed) with 4-5 primary actions (Home, Log, History, Calendar, Profile)

Navigation items: Icon + Label combination using Heroicons

### Main Layout
**Dashboard View** (Homepage):
- Recent activity feed showing last 5-7 entries
- Quick stats cards in 2-3 column grid: Total Cigars Logged, Average Rating, This Month's Count, Favorite Brand
- "Quick Log" floating action button (fixed bottom-right on desktop, integrated into mobile nav)

### Logging Interface
**Form Layout**: Single column, max-w-2xl centered
- Large, clear input fields with ample padding (p-4)
- Grouped sections with subtle dividers (space-y-6)
- Star rating component: Large, tappable stars (text-4xl)
- Date/Time picker: Native browser inputs styled consistently
- Tasting notes: Textarea with h-32 minimum height
- "Add to Calendar" toggle switch prominently placed
- Submit button: Full-width on mobile, centered on desktop (px-12 py-4)

### History/Browse View
**List Layout**: 
- Card-based design (rounded-lg border shadow-sm)
- Each card: Grid layout with cigar image placeholder (if implemented), name, rating, date, and brief notes preview
- Responsive grid: grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6
- Filter/Sort bar: Sticky at top with dropdowns for date range, rating, and search input

**Individual Entry Detail**: Modal or dedicated page with:
- Large rating display at top
- Full tasting notes and metadata in organized sections (space-y-4)
- Calendar event link if applicable
- Edit/Delete actions

### Calendar Integration View
- Monthly calendar visualization showing cigar sessions
- Day cells with indicator dots for logged sessions
- Click to view day's details or add new entry

---

## Component Library

### Cards
- Base card: rounded-lg border p-6 shadow-sm hover:shadow-md transition-shadow
- Stats card: Centered content with large number (text-4xl font-bold) and label below
- Cigar entry card: Image/placeholder left, content right on desktop; stacked on mobile

### Buttons
**Primary Action**: px-6 py-3 rounded-lg font-medium shadow-sm hover:shadow-md transition
**Secondary**: px-6 py-3 rounded-lg border font-medium
**Icon Button**: p-3 rounded-full (for floating action, compact actions)
**Link Style**: underline underline-offset-4 hover:no-underline

### Form Elements
- Input fields: w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-offset-2
- Labels: block mb-2 text-sm font-medium
- Textareas: Same styling as inputs, min-h-32
- Select dropdowns: Styled to match inputs
- Star Rating: Interactive with hover states, using Heroicons star icon

### Rating Display
- Large format: text-3xl with star icons
- Compact format: text-lg with numerical display (4.5/5)
- Use half-stars for precision

### Badges/Tags
- Rounded-full px-3 py-1 text-xs font-medium for categories, strength indicators

---

## Images

**Hero Section**: None required - this is a utility app focused on functionality

**Cigar Placeholder Images**: 
- Use subtle cigar/tobacco-leaf texture as placeholder backgrounds for entry cards
- Dimensions: 4:3 aspect ratio, approximately 300x225px for card thumbnails
- If actual cigar images implemented, maintain consistent aspect ratio and use object-cover

**Empty States**: 
- Illustration or icon representing cigars/smoking ritual when no entries exist
- Centered in viewport with helpful text encouraging first log

---

## Iconography

**Icon Library**: Heroicons (outline style for navigation, solid for emphasis)

**Key Icons**:
- Plus/Add icon for logging
- Calendar icon for calendar features
- Star for ratings
- Clock for time/history
- Search icon for search functionality
- Filter icon for filtering
- Pencil/Edit for editing entries
- Trash for deletion

---

## Accessibility & Interaction

- Focus states: Prominent ring-2 with offset on all interactive elements
- Minimum touch target: 44x44px on mobile
- Form validation: Inline error messages (text-sm text-red-600 mt-1)
- Loading states: Subtle spinner or skeleton screens for data fetching
- Empty states: Informative with clear call-to-action

---

## Animations

**Minimal, Purposeful Animations**:
- Page transitions: None (instant)
- Card hover: shadow-sm to shadow-md (transition-shadow duration-200)
- Button states: Standard browser defaults
- Modal/Dialog entry: Simple fade-in (if needed)
- NO scroll-triggered animations, NO complex transitions

---

## Special Considerations

**Calendar Integration Indicator**: Visual badge or icon on entries that have been synced to Google Calendar

**Quick Log Feature**: Streamlined single-screen form with pre-filled date/time, focus on speed of entry

**Search & Filter**: Always visible search bar with instant filtering of results, dropdown filters for rating ranges and date ranges

**Data Density**: Balance between showing enough information at a glance and maintaining visual breathing room - use whitespace generously (space-y-6 between sections)