# @pacers/mobile

Placeholder for the Expo (React Native) app. Not scaffolded yet.

When ready, scaffold with:

```bash
cd apps
pnpm create expo-app mobile --template default
```

Then in `apps/mobile/package.json`:

- Add workspace deps:
  - `"@pacers/core": "workspace:*"`
  - `"@pacers/api": "workspace:*"`
  - `"@pacers/ui-tokens": "workspace:*"`
- Rename `"name"` to `"@pacers/mobile"`

Target packages for mobile:

- `expo-location` (live GPS tracking, background location)
- `expo-notifications` (daily "today's workout" push)
- `expo-health` or `react-native-health` (HealthKit on iOS)
- `react-native-google-fit` (Android)
- `react-native-maps` (or `@rnmapbox/maps`)
- `@supabase/supabase-js` + `@react-native-async-storage/async-storage` + `expo-secure-store`
- `react-native-reanimated`, `react-native-gesture-handler`
- `expo-router` for file-based routing

Payments: use `react-native-purchases` (RevenueCat) for App Store / Play Store billing. Stripe stays web-only.
