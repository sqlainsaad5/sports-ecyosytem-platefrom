# Design System Document: The Midnight Stadium

## 1. Overview & Creative North Star
**Creative North Star: "The Electric Void"**
This design system captures the high-stakes atmospheric tension of a stadium at midnight—where the world is dark, but the field is hyper-illuminated. We move beyond the "flat dashboard" aesthetic by embracing **Kinetic Asymmetry** and **Radiant Depth**. 

The goal is to make the user feel like they are standing in the tunnel before a championship game. We break the traditional grid using intentional overlaps, "slice" geometries, and high-contrast typography scales. This is not just a sports app; it is a broadcast-grade digital experience that prioritizes energy over static utility.

---

## 2. Colors & Surface Architecture
The palette is rooted in the deep obsidian of a night sky, punctuated by high-frequency neon accents that denote specific user roles.

### Core Palette
- **Background:** `#080D1A` (Deep Space)
- **Surface (Cards):** `#0F1729` (Midnight Bleachers)
- **Surface-Container (Inner):** `#162035` (Press Box)

### Role-Based Accents
- **Primary (Player):** `#00FF87` — High-energy stadium turf green.
- **Secondary (Coach):** `#FF6B00` — Tactical, heat-map orange.
- **Tertiary (Biz Owner):** `#A855F7` — Premium, executive suite purple.

### The Rules of Engagement
*   **The "No-Line" Rule:** 1px solid borders are strictly prohibited for sectioning. Boundaries must be defined solely through background shifts. A card (`surface_container`) sitting on a `background` provides all the definition required.
*   **Surface Hierarchy & Nesting:** Use the tiers to create a "drilled-down" effect. The deepest level of the UI should be the darkest (`surface_container_lowest`), while active interactive elements should use `surface_bright` or `surface_container_highest` to appear closer to the "stadium lights."
*   **The "Glass & Gradient" Rule:** To avoid a "flat" feel, floating elements (modals, dropdowns) must use a `backdrop-blur` (12px-20px) with a semi-transparent `surface_variant`.
*   **Signature Textures:** Apply a 2% "Noise" grain to the background and a subtle radial gradient (15% opacity) of the role-based accent color in the top-right corner of screens to simulate the glow of floodlights.

---

## 3. Typography: The Broadcast Voice
Typography is our primary tool for conveying "Athletic Authority."

*   **Display (Bebas Neue):** Reserved for scores, hero headlines, and "Big Moments." Use `400` weight with `0.05em` letter spacing. It should feel like a stadium jumbotron.
*   **Headlines (Rajdhani):** A technical, squared-off sans-serif for section headers. Its "high-tech" feel suggests data and strategy.
*   **Body (Inter):** The workhorse. Used for all long-form content, descriptions, and settings. Prioritize legibility with a `1.5` line-height.
*   **Numbers (Orbitron):** Strictly for data visualizations, timers, and jersey numbers. This font carries a "stopwatch" DNA that reinforces the urgency of sport.

---

## 4. Elevation, Depth & Kinetic Style
We reject standard shadows. In a stadium, light is directional and harsh.

*   **The Layering Principle:** Depth is achieved by "stacking." A `surface_container_high` element on top of `background` is our primary way of showing elevation.
*   **Subtle Glows (The "Halation" Effect):** Instead of black drop shadows, use "Glows." If a Player-card is active, give it a soft 12px blur shadow using `#00FF87` at 15% opacity. It should look like the element is emitting light, not blocking it.
*   **Asymmetry & The "Slice":** Cards should not always be perfect rectangles. Use `0.75rem` (xl) rounding on three corners and a `0px` (none) or `0.125rem` (sm) rounding on one corner to create a "clipped" or "fast" aesthetic.
*   **The "Ghost Border":** If a separator is required for accessibility, use the `outline_variant` at **10% opacity**. It should be felt, not seen.

---

## 5. Components

### Buttons
- **Primary (The Power Move):** Solid accent color (`primary`, `secondary`, or `tertiary` based on role). Bold `Bebas Neue` text. No border.
- **Secondary (The Tactical):** `Ghost Border` with the accent color text. On hover, fill with 10% opacity of the accent color.
- **Tertiary:** Text-only, uppercase `Rajdhani` with a `0.5` spacing "underline" using the accent color.

### Asymmetric Cards
- **Structure:** No dividers. Use `Spacing-8` (2rem) between sections.
- **Visuals:** Use a "Slashed" corner logic. Top-left and bottom-right corners use `rounded-xl`, while top-right and bottom-left use `rounded-sm`. This creates a sense of forward motion.

### Data Chips
- Small, pill-shaped (`full` roundedness). Use `surface_container_highest` as the base. For "Live" statuses, add a pulsing dot using the `primary` (Green) token.

### Input Fields
- Background: `surface_container_low`.
- Bottom-border only: 2px wide, using `outline_variant`. On focus, the border transitions to the role-based accent color with a subtle `3px` outer glow.

---

## 6. Do’s and Don’ts

### Do:
- **Do** use overlapping elements (e.g., a player image breaking the top boundary of a card).
- **Do** lean into high-contrast typography (mixing `Bebas Neue` at 48px with `Inter` at 12px).
- **Do** use vertical white space as your primary "divider."

### Don't:
- **Don't** use pure black `#000000`. Use the `background` token to maintain depth.
- **Don't** use standard "Web 2.0" shadows. If it doesn't look like a neon light or a physical layer, it doesn't belong.
- **Don't** use centered layouts for everything. Use left-heavy or right-heavy compositions to maintain "Athletic Tension."
- **Don't** use divider lines between list items. Use a `1px` shift in background color or a `Spacing-2` gap.