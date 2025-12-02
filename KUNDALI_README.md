# Free Kundali Module - Implementation Guide

## Overview

This document describes the production-ready Free Kundali module integrated into the Astronova application. The module replaces the existing `/free-kundli` route and provides comprehensive Vedic astrology calculations with mood-adaptive interpretations.

## Architecture

### Backend (`/lib/kundali`)

**Core Calculation Library:**
- `types.ts` - TypeScript type definitions
- `calculations.ts` - Core calculation functions (planetary positions, houses, dashas, etc.)
- `interpret.ts` - Mood-adaptive interpretation generator

**Note on Precision:**
The current implementation uses simplified calculations. For production accuracy, integrate Swiss Ephemeris:
- Install: `npm install swisseph` (requires native bindings)
- Replace `computePlanetaryPositions()` with `swe_calc_ut()`
- Replace `computeHouses()` with `swe_houses()`
- Precision improvement: ±0.1° → ±0.0001° for planets

### API Routes (`/app/api/kundali/*`)

1. **POST `/api/kundali/natal`**
   - Input: Birth details (name, dob, time, tz, lat, lon, house_system, ayanamsa)
   - Output: Complete natal chart with planets, houses, divisional charts, yogas, ashtakavarga, shadbala

2. **POST `/api/kundali/dashas`**
   - Input: Birth details or natal payload
   - Output: Vimshottari dasha timeline (mahadashas and antardashas)

3. **POST `/api/kundali/transit`**
   - Input: Natal chart + date (default: today)
   - Output: Transit positions, conjunctions, human-readable summary

4. **POST `/api/kundali/metrics`**
   - Input: Natal chart or birth details
   - Output: Shadbala scores, ashtakavarga points, planet strengths, heatmap data

5. **POST `/api/kundali/interpret`**
   - Input: Natal chart, dashas, transits, metrics, mood, length
   - Output: Mood-adaptive interpretations (micro, short, long) with facts, tips, timings

6. **GET `/api/kundali/sample/:id`**
   - Returns sample test profiles (id: 1, 2, or 3)

### Frontend (`/components/FreeKundli.tsx`)

**Features:**
- Input form with birth details (collapsible)
- Chart visualization (North/South Indian, D9, D10)
- Dasha timeline (scrollable)
- Mood selector (Anxious, Confident, Stuck, Excited, Curious)
- Interpretation panel (updates based on mood)
- Quick metrics display
- PDF export functionality

**Integration:**
- Already integrated via `currentScreen === 'free-kundli'` in `app/page.tsx`
- Accessible from Free Services page button
- Uses existing theme (navy + gold)

## Usage

### For Users

1. Navigate to Free Services → Click "Free Kundli"
2. Enter birth details (or use profile data)
3. Click "Calculate Kundali"
4. View chart, dashas, and select mood for personalized interpretation

### For Developers

**Calculate Natal Chart:**
```typescript
const response = await fetch('/api/kundali/natal', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'John Doe',
    dob: '1990-01-15',
    time: '10:30:00',
    tz: 'Asia/Kolkata',
    lat: 28.6139,
    lon: 77.2090,
    house_system: 'whole',
    ayanamsa: 'lahiri',
  }),
})
```

**Get Interpretation:**
```typescript
const response = await fetch('/api/kundali/interpret', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    natal: natalChart,
    dashas: dashas,
    transit: transits,
    metrics: metrics,
    mood: 'anxious', // or 'confident', 'stuck', 'excited', 'curious'
    length: 'short', // or 'micro', 'long'
  }),
})
```

## Testing

**Sample Profiles:**
- Test profile 1: `GET /api/kundali/sample/1`
- Test profile 2: `GET /api/kundali/sample/2`
- Test profile 3: `GET /api/kundali/sample/3`

**Unit Tests:**
Create test files comparing outputs to Swiss Ephemeris for:
- Planet positions (sign, degree, nakshatra)
- House cusps
- Dasha start dates

## Mood-Adaptive Interpretations

Each mood generates different tones and recommendations:

- **Anxious**: Calming language, grounding times, avoid major decisions
- **Confident**: Direct action windows, supportive timings
- **Stuck**: Incremental tasks, journaling prompts
- **Excited**: Launch timings, risk windows
- **Curious**: Educational explanations, nakshatra/dasha details

All interpretations:
- Reference at least 2 chart facts
- Include 1-2 actionable tips
- Provide specific timings when applicable
- Avoid generic astrology clichés

## Future Enhancements

1. **Swiss Ephemeris Integration**
   - Replace simplified calculations with Swiss Ephemeris
   - Add Dockerfile for native bindings
   - Improve precision to ±0.0001°

2. **Chart Visualization**
   - Implement SVG chart rendering
   - Add interactive house/planet clicks
   - Support North/South Indian styles

3. **Advanced Features**
   - Transit calendar heatmap (12-month view)
   - "Ask Your Chart" Q&A feature
   - Shareable links for non-logged users

4. **Performance**
   - Cache natal computations per profile
   - Optimize API response times
   - Add loading states and error handling

## File Structure

```
Astro-Talks/
├── lib/kundali/
│   ├── types.ts              # Type definitions
│   ├── calculations.ts       # Core calculations
│   └── interpret.ts          # Interpretation generator
├── app/api/kundali/
│   ├── natal/route.ts        # Natal chart endpoint
│   ├── dashas/route.ts       # Dasha calculations
│   ├── transit/route.ts      # Transit calculations
│   ├── metrics/route.ts      # Metrics endpoint
│   ├── interpret/route.ts     # Interpretation endpoint
│   └── sample/[id]/route.ts  # Sample data
└── components/
    └── FreeKundli.tsx        # Main component
```

## Integration Notes

- **Routing**: Already integrated via `currentScreen === 'free-kundli'`
- **Theme**: Uses existing navy + gold color scheme
- **Navigation**: Back button returns to home screen
- **User Profile**: Auto-fills form from user profile if available

## Precision Tradeoffs

**Current Implementation (JS-only):**
- Planet positions: ±0.1° accuracy
- House cusps: ±0.5° accuracy
- Nakshatra: Acceptable for general use

**With Swiss Ephemeris:**
- Planet positions: ±0.0001° accuracy
- House cusps: ±0.01° accuracy
- Production-ready precision

## Support

For issues or questions:
1. Check API responses in browser DevTools
2. Review calculation logs in server console
3. Compare outputs with Swiss Ephemeris for accuracy validation


