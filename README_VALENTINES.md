# Valentinstag Webseite 💕

Eine statische Single-Page-Application für einen besonderen Valentinstag!

## Features

- ✅ **Passwort-Schutz**: JavaScript-basiertes Password-Gate
- ✅ **Tailwind CSS**: Rosa-Weiß Farbschema mit Gradients
- ✅ **SPA-Architektur**: Views-Objekt für Navigation ohne Seitenwechsel
- ✅ **Grid-System**: Kategorien-basierte Navigation
- ✅ **Modularer Code**: Abstrakte Funktionen für Rendering und Navigation
- ✅ **Form-Submission**: Senden an formsubmit.co

## Setup

1. **Passwort ändern**:
   - Öffne `index.html`
   - Suche nach `password: 'valentine2024'`
   - Ändere das Passwort nach deinen Wünschen

2. **E-Mail konfigurieren**:
   - Öffne `index.html`
   - Suche nach `emailEndpoint: 'https://formsubmit.co/your-email@example.com'`
   - Ersetze `your-email@example.com` mit deiner E-Mail-Adresse
   - Beim ersten Mal musst du die E-Mail bei formsubmit.co bestätigen

## Verwendung

1. Öffne `index.html` in einem Browser
2. Gib das Passwort ein
3. Wähle eine Kategorie (z.B. Massage, Dinner, Film)
4. Wähle spezifische Optionen (z.B. Dauer, Ort)
5. Bestätige die Auswahl
6. Die Auswahl wird per E-Mail gesendet

## Kategorien

- 💆 **Massage**: Wähle Dauer (30/60/90 Min) und Ort
- 🍽️ **Dinner**: Wähle Küche, Ort und Zeit
- 🎬 **Film**: Wähle Genre, Ort und Snacks
- ✈️ **Ausflug**: Wähle Art, Dauer und Entfernung
- 🛁 **Wellness**: Wähle Aktivität, Dauer und Ort
- 🎁 **Überraschung**: Wähle Art, Intensität und Zeitpunkt

## Technische Details

### Architektur
- **Views-Objekt**: Zentrale Navigation zwischen verschiedenen Ansichten
- **Modular**: Getrennte Funktionen für Rendering, Navigation und Formular
- **State Management**: Zentrale Speicherung von Auswahl und Navigation

### Styling
- **Tailwind CSS**: Via CDN eingebunden
- **Gradients**: Rosa-Weiß Farbverläufe
- **Responsive**: Grid-System passt sich an verschiedene Bildschirmgrößen an
- **Animationen**: Fade-In und Hover-Effekte

### JavaScript-Struktur
```javascript
CONFIG          // Konfiguration (Passwort, E-Mail)
views           // Navigation und Daten-Struktur
selections      // Auswahlzustand
renderCategories()    // Hauptansicht rendern
renderSubOptions()    // Unteroptionen rendern
selectOption()        // Option auswählen
submitForm()          // Formular absenden
```

## Anpassungen

Du kannst die Webseite einfach anpassen:

1. **Kategorien hinzufügen**: Im `views.categories` Array
2. **Optionen ändern**: Im `views.subOptions` Objekt
3. **Farben anpassen**: In den Tailwind-Klassen
4. **Texte ändern**: Direkt in den HTML-Templates

## Browser-Kompatibilität

Funktioniert mit allen modernen Browsern:
- Chrome/Edge
- Firefox
- Safari
- Opera

## Deployment

Die Seite ist vollständig statisch und kann gehostet werden auf:
- GitHub Pages
- Netlify
- Vercel
- Oder einfach lokal öffnen
