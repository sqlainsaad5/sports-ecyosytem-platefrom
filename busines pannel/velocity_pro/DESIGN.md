# The Sports Ecosystem Design System: Editorial Excellence

## 1. Overview & Creative North Star
**Creative North Star: "The Kinetic Arena"**

This design system moves beyond the "SaaS Dashboard" template to create a high-end, editorial experience for the modern sports business owner. It is built on the concept of **Kinetic Architecture**—where the UI feels like a living, breathing high-performance environment. 

By leveraging intentional asymmetry, high-contrast typography scales, and tonal layering, we move away from "boxes within boxes." The layout should feel like a premium sports retail floor or a high-tech broadcast command center: energetic, authoritative, and impeccably structured. We break the grid with overlapping "Glassmorphism" elements and bold, technical data displays to ensure the platform feels custom-engineered, not assembled.

---

## 2. Colors & Surface Philosophy
The palette is rooted in deep obsidian tones, punctuated by high-energy neon accents.

### Color Tokens
- **Primary (Vivid Purple):** `#cc97ff` (Surface-level) / `#A855F7` (Core) – Used for high-action CTAs and brand moments.
- **Secondary (Amber):** `#f8a010` – Used for performance highlights, alerts, and "Elite" status indicators.
- **Tertiary (Emerald):** `#9bffce` – Used strictly for positive growth and success metrics.
- **Background:** `#070e1d` – The deep "pitch" upon which all elements sit.

### The "No-Line" Rule
Standard 1px borders are strictly prohibited for sectioning. We define space through **Tonal Transitions**. To separate the sidebar from the main content or a card from the background, use a shift from `surface` to `surface-container-low`. The eye should perceive depth through color value, not a stroke line.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers:
1.  **Base Layer:** `surface` (`#070e1d`) – The stadium floor.
2.  **Sub-Section Layer:** `surface-container-low` (`#0b1324`) – Large layout blocks.
3.  **Actionable Card Layer:** `surface-container` (`#11192c`) – Standard interactive containers.
4.  **Floating/Highlight Layer:** `surface-container-highest` (`#1c253b`) – Hover states or active modals.

### The "Glass & Gradient" Rule
To add "soul" to the dark mode, use a subtle linear gradient on primary buttons: from `primary` (`#cc97ff`) to `primary-dim` (`#9c48ea`) at a 135-degree angle. Floating panels should utilize `backdrop-blur(12px)` with a 20% opacity `surface-variant` fill to create a premium "frosted glass" look.

---

## 3. Typography: The Triple-Threat
We use a specialized triad of fonts to communicate different tiers of information.

*   **Headings (Rajdhani):** Industrial, condensed, and aggressive. Use `headline-lg` for section headers. The squared-off terminals of Rajdhani mirror sports apparel branding.
*   **Body (Inter):** The workhorse. Used for all `body-md` and `label-sm` text to ensure maximum legibility against dark backgrounds.
*   **Data/Numbers (Orbitron):** The "Scoreboard" font. All dynamic metrics, percentages, and currency values must use Orbitron. This creates an immediate visual distinction between "reading" and "monitoring."

---

## 4. Elevation & Depth
We eschew traditional drop shadows for **Ambient Glows** and **Tonal Stacking**.

*   **The Layering Principle:** A `surface-container-highest` card placed on a `surface-container-low` background creates a natural lift. Do not add a shadow unless the element is floating (like a dropdown).
*   **Ambient Shadows:** For floating elements, use a shadow with a `24px` blur and `8%` opacity. The shadow color should be a deep purple tint (`#360061`) rather than black, mimicking the way bright stadium lights cast colored shadows.
*   **The "Ghost Border" Fallback:** If a container requires a border for accessibility (e.g., input fields), use `outline-variant` (`#414859`) at `20%` opacity. It should feel like a suggestion of a line, not a boundary.

---

## 5. Components

### Buttons & Interaction
*   **Primary Action:** Rajdhani Bold, Uppercase. Gradient fill (`primary` to `primary-dim`). Use Framer Motion to scale the button to `1.02` on hover with a subtle `primary` outer glow.
*   **Secondary Action:** Ghost style. Transparent background with a `Ghost Border`.

### Cards & Lists
*   **The "No-Divider" Rule:** Never use horizontal lines to separate list items. Use `8px` of vertical whitespace or alternating background shifts between `surface-container-low` and `surface-container`.
*   **Data Cards:** Must feature an `Orbitron` metric in the top right. Use a `1.5rem` corner radius (`xl`) for a modern, approachable feel.

### Input Fields
*   **Style:** `surface-container-lowest` fill. On focus, the "Ghost Border" should transition to a `1px` solid `primary` stroke with a `primary` drop-shadow glow (opacity 15%).

### Specialized Components
*   **Performance Momentum Sparkline:** A micro-chart using the `tertiary` (Emerald) color with a gradient area fill (opacity 10% to 0%).
*   **Status Badges:** Use `9999px` (full) roundedness. The text should be `label-sm` Inter Bold, with a low-opacity background of the status color (e.g., Success color at 15% opacity).

---

## 6. Do's and Don'ts

### Do
*   **Use Asymmetry:** Place a large `headline-lg` title on the left and a small `Orbitron` metric on the right to create an editorial "magazine" feel.
*   **Embrace Negative Space:** Allow `surface` backgrounds to breathe. Large margins between sections enhance the "premium" feel.
*   **Animate with Intent:** Use Framer Motion for a `0.4s` ease-out "slide-up" when cards load.

### Don't
*   **Don't Use Pure Black:** It kills the depth. Stick to the `surface` palette.
*   **Don't Mix Fonts:** Never use Orbitron for body text or Inter for large headlines. The hierarchy depends on the font-switch.
*   **Don't Over-Border:** If you find yourself adding borders to every element, stop. Re-evaluate your `surface-container` nesting.
*   **Don't Use High-Contrast Grids:** Avoid rigid, visible grid lines. Let the alignment of typography create the "invisible" grid.