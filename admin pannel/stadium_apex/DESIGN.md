# Design System Specification: The Stadium at Night

## 1. Overview & Creative North Star
**Creative North Star: "The Tactical Observer"**

This design system is engineered to evoke the high-stakes atmosphere of a professional stadium under floodlights. It moves away from the "SaaS dashboard" aesthetic toward a high-performance command center. We achieve this through **Kinetic Depth**—a technique where the interface feels like layered glass panels floating over a vast, dark pitch. 

To break the "template" look, we prioritize **Intentional Asymmetry**. Larger data visualizations should bleed off the edges of containers, and high-contrast typography scales (Orbitron vs. Inter) should be used to create a rhythmic, editorial feel. The goal is to make the user feel like they are not just managing data, but directing an elite operation.

---

## 2. Colors & Surface Architecture

### The Palette
*   **Primary BG (`surface_dim`):** #0A0F1E — The deep, infinite darkness of the stadium stands.
*   **Surface High (`surface_container_high`):** #1C2333 — The illuminated "field" where action happens.
*   **Electric Cyan (`primary_container`):** #00E5FF — The floodlights. Used for high-energy focus and active states.
*   **Burnt Orange (`secondary_container`):** #FF6B35 — The tension of a pending play or a warning.

### The "No-Line" Rule
Prohibit the use of 1px solid borders for sectioning. Definition must be achieved through background shifts. A `surface_container_lowest` card should sit atop a `surface_container_low` background. If you feel the need to draw a line, use a **16px vertical gap** from the spacing scale instead.

### Surface Hierarchy & Nesting
Treat the UI as a physical stack of semi-translucent materials:
1.  **Level 0 (Base):** `surface_dim` (#0A0F1E) - The foundation.
2.  **Level 1 (Panels):** `surface_container` (#1A1F2F) - Large layout blocks.
3.  **Level 2 (In-set):** `surface_container_highest` (#2F3445) - Interactive cards or data rows.

### The "Glass & Gradient" Rule
Floating elements (modals, dropdowns) must use **Glassmorphism**. Apply a 12px `backdrop-blur` with a 60% opacity fill of `surface_container_low`. For primary CTAs, use the signature gradient: `linear-gradient(135deg, #00E5FF, #0066FF)`. This provides a "soul" to the action that flat colors cannot replicate.

---

## 3. Typography: The Editorial Hierarchy

We utilize a tri-font system to separate intent:
*   **Headings (Rajdhani):** Bold and geometric. Used for `headline-lg` through `headline-sm`. This font conveys the "Industrial/Athletic" authority of the platform.
*   **Body (Inter):** Clean and professional. Used for `body-md` and `title-sm`. It ensures long-form data remains legible and "quiet."
*   **Numbers/Stats (Orbitron):** Futuristic and precise. Used exclusively for data points, scores, and timers. This is the "Scoreboard" layer.

**Hierarchy Strategy:** 
Always pair a `display-sm` Orbitron number with a `label-sm` Inter description in `on_surface_variant` (Muted Slate). This high-contrast pairing creates an authoritative, high-end editorial look.

---

## 4. Elevation & Depth

### Tonal Layering
Avoid shadows for structural containment. Depth is achieved by placing `surface_container_lowest` (#090E1C) "wells" inside `surface_container` panels. This "inverted elevation" creates a sense of technical precision.

### Ambient Shadows
For floating components (Modals/Toasts), use an extra-diffused shadow:
`box-shadow: 0 20px 40px rgba(0, 229, 255, 0.08);`
The shadow must be tinted with the `primary` cyan to simulate light bleed from the "stadium floodlights."

### The "Ghost Border" Fallback
If accessibility requires a boundary, use a **Ghost Border**: 
`border: 1px solid rgba(148, 163, 184, 0.1);`
Never use 100% opaque borders. The interface should feel "optical," not "mechanical."

---

## 5. Components

### Buttons (Tactical Actions)
*   **Primary:** Gradient fill (`#00E5FF` to `#0066FF`), white text, 0.5rem (sm) radius. On hover: Add a `0 0 15px rgba(0, 229, 255, 0.4)` outer glow.
*   **Secondary:** Ghost style. Transparent background, Ghost Border, Cyan text.
*   **Tertiary:** No background. `label-md` Inter typography in `on_surface_variant`.

### Cards & Data Rows
Forbid divider lines. Use `surface_container_high` for the card and a 1.1rem (5) spacing gap between them. Use a vertical `2px` accent bar of `primary` cyan on the far left to indicate an "Active" or "Selected" row.

### Pill-Shaped Status Badges
Status indicators must be fully rounded (`rounded-full`). 
*   **Live:** Background: `rgba(0, 200, 150, 0.1)`; Text: `#00C896`.
*   **Pending:** Background: `rgba(255, 107, 53, 0.1)`; Text: `#FF6B35`.

### Tactical Modals
Use `backdrop-blur: 12px`. The modal container should have a `surface_variant` background at 80% opacity. Animate entry with a staggered Y-offset (20px) using Framer Motion for a "sliding into view" effect.

---

## 6. Do's and Don'ts

### Do:
*   **Do** use `Orbitron` for any value that changes in real-time (clocks, scores, percentages).
*   **Do** use staggered animations. When a dashboard loads, panels should slide in 0.05s apart.
*   **Do** use "Cyan Glow" on hover for interactive elements to mimic the energy of an active stadium.

### Don't:
*   **Don't** use pure black (#000000). It kills the "Stadium at Night" atmospheric depth. Use `#0A0F1E`.
*   **Don't** use standard 1px borders to separate table rows. Use subtle background alternating or vertical white space.
*   **Don't** use rounded corners larger than `0.75rem` (md) for main containers; we want an authoritative, sharp-edged architectural feel, not a consumer "bubbly" look.