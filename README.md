# Gratu Focus — App

App real de **Gratu Focus**: tag NFC físico + bloqueo de apps distractoras. React Native (Expo) para iOS y Android.

> El prototipo de diseño y la landing de preventa viven en [`juanfelareal/gratu-focus`](https://github.com/juanfelareal/gratu-focus).

## Arquitectura

| Capa | iOS | Android |
|---|---|---|
| **Bloqueo** | Screen Time API vía [`react-native-device-activity`](https://github.com/kingstinct/react-native-device-activity) — el shield lo aplica el OS (sobrevive kill + reboot) | Módulo Expo local `modules/gratu-blocker` (Kotlin): foreground service + UsageStatsManager + pantalla escudo. **Sin AccessibilityService** (riesgo Play Store) |
| **Selector de apps** | `FamilyActivityPicker` de Apple (tokens opacos — Apple no nos dice qué eligió el usuario) | Selector propio con `queryIntentActivities` (Play-safe, sin `QUERY_ALL_PACKAGES`) |
| **NFC** | `react-native-nfc-manager`, lectura foreground con sheet del sistema | Igual, lectura directa |
| **Estado** | zustand + AsyncStorage (persistente) | Igual + `SharedPreferences` en el módulo nativo (el servicio lee el estado sin JS) |

**Modo demo:** en Expo Go (sin módulos nativos) toda la UI funciona con bloqueo/NFC simulados — útil para iterar diseño.

### Decisiones de producto cableadas en el código

- **WhatsApp nunca se bloquea por defecto** y al seleccionarlo se advierte: en iOS las notificaciones de apps bloqueadas se silencian (imposición de Apple) y las llamadas de WhatsApp probablemente no suenan. Crítico para LatAm.
- **Las llamadas celulares siempre funcionan** — la app Teléfono no es bloqueable en ninguna plataforma (verificado: FAQ de Brick + docs de Apple).
- **5 desbloqueos de emergencia de por vida** con fricción de 5 segundos.
- El estado del bloqueo Android vive en disco: **apagar el celular no es escape** (BootReceiver reanuda la sesión).

## Desarrollo

```bash
npm install
npx expo start        # Expo Go = modo demo (UI completa, bloqueo simulado)
```

### Build nativo (dev build)

```bash
# iOS (requiere Xcode + cuenta Apple Developer)
npx expo prebuild --platform ios
npx expo run:ios --device

# Android (requiere Android Studio / SDK)
npx expo prebuild --platform android
npx expo run:android
```

`/ios` y `/android` están en `.gitignore` — se regeneran con `prebuild` (CNG).

## ⚠️ Antes de poder distribuir en iOS (hacer YA — tarda hasta 4 semanas)

1. Cuenta [Apple Developer](https://developer.apple.com) ($99 USD/año).
2. Poner el **Team ID** real en `app.json` → plugin `react-native-device-activity` → `appleTeamId` (hoy dice `REEMPLAZAR_TEAM_ID`).
3. Crear el App Group `group.com.gratu.focus` en el portal de Apple.
4. Solicitar el entitlement **Family Controls (Distribution)** en
   <https://developer.apple.com/contact/request/family-controls-distribution>
   — **una solicitud por cada bundle ID**:
   - `com.gratu.focus`
   - `com.gratu.focus.ActivityMonitor`
   - `com.gratu.focus.ShieldAction`
   - `com.gratu.focus.ShieldConfiguration`

   Sin esta aprobación NO hay TestFlight (los builds locales con Xcode sí funcionan en desarrollo).

## Matriz de pruebas físicas pre-lanzamiento

En iPhone real y 2-3 Androids (incluir Samsung/Xiaomi, que matan servicios agresivamente):

- [ ] Llamada celular entrante durante modo enfoque → debe sonar
- [ ] **Llamada de WhatsApp con WhatsApp bloqueado** (iOS) → documentar si suena (incógnita CallKit)
- [ ] Mensaje de WhatsApp con WhatsApp bloqueado → confirmar que NO notifica (esperado)
- [ ] Matar la app durante sesión → el bloqueo debe seguir (iOS: sí por OS; Android: START_STICKY)
- [ ] Force stop en Android → documentar comportamiento (escape conocido; mitigar en v2 bloqueando Ajustes)
- [ ] Reboot en plena sesión → el bloqueo debe reanudarse (iOS: automático; Android: BootReceiver)
- [ ] Tag NFC: vincular, escanear con tag correcto, rechazar tag ajeno
- [ ] Revocar permiso de Screen Time en Ajustes iOS → documentar (mitigación v2: Shortcut que bloquea Ajustes)

## Roadmap corto

- **v0.2:** racha real por días, historial semanal para el chart de stats, background tag reading (iOS universal link + Android intent filter para que el tag abra la app sola)
- **v0.3 (modo estricto completo):** iOS `denyAppRemoval` + guía del Shortcut anti-Ajustes; Android Device Admin
- **v1.0:** modo "Monje" (`.all(except:)` — bloquear todo excepto whitelist), modos predefinidos LatAm (Trabajo, Estudio, Familia, Dormir), launcher minimalista Android

## Estructura

```
App.tsx                      # Navegación + fuentes
src/
  theme.ts                   # Tokens de diseño v2 (crema/orbe/verde)
  store.ts                   # Estado persistente (zustand)
  focus.ts                   # Orquestación: toggle de enfoque + emergencia
  nfc.ts                     # Lectura de tags (UID)
  blocking/                  # Abstracción de bloqueo (ios/android/demo)
  components/                # Orb, Tri, GlassCard, Pill, NfcOverlay, EmergencyModal
  screens/                   # Welcome → How → Permissions → SelectApps → PairTag → Main(Home/Stats/Settings)
modules/gratu-blocker/       # Módulo nativo Android (Kotlin)
```
