// =====================
// Inizializzazione mappa
// =====================
var map = L.map('map').setView([45.0, 9.0], 13);

// Tile layer OpenStreetMap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19
}).addTo(map);

// Percorso GPX
var gpx = 'percorso.gpx';
new L.GPX(gpx, {
  async: true,
  marker_options: {
    startIconUrl: './icons/start.png',
    endIconUrl: './icons/end.png',
    shadowUrl: './icons/shadow.png',
    wptIconUrls: { '': './icons/waypoint.png' }
  },
  polyline_options: {
    color: 'orange',
    weight: 5,
    opacity: 0.8
  }
}).on('loaded', function (e) {
  map.fitBounds(e.target.getBounds());
}).addTo(map);

// =====================
// Audio di notifica
// =====================
const soundStart = new Audio('./sounds/start.mp3');
const soundFoto = new Audio('./sounds/foto.mp3');
const soundArrivo = new Audio('./sounds/arrivo.mp3');

// =====================
// Funzioni di controllo punti
// =====================
function checkPoint(userLat, userLng, pointLat, pointLng, radiusKm, message, sound, flagName) {
  const dist = Math.sqrt(
    Math.pow(userLat - pointLat, 2) + Math.pow(userLng - pointLng, 2)
  ) * 111; // da gradi a km

  if (dist <= radiusKm && !window[flagName]) {
    window[flagName] = true;
    L.marker([pointLat, pointLng])
      .addTo(map)
      .bindPopup(message)
      .openPopup();
    sound.play().catch(e => console.warn("Audio non riprodotto:", e));
  }
}

// =====================
// Coordinate dei punti
// =====================
const startPoint = { lat: 45.51241, lng: 11.50781 };
const fotoPoint = { lat: 45.51166, lng: 11.45001 };
const endPoint = { lat: 45.50386, lng: 11.41584 };

// =====================
// Tracciamento in tempo reale
// =====================
let lastLat = null, lastLng = null;
let firstView = false;

if (navigator.geolocation) {
  navigator.geolocation.watchPosition(
    (pos) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;

      // crea o aggiorna marker ruotabile
      if (window.userMarker) {
        if (lastLat !== null && lastLng !== null) {
          const angle = Math.atan2(lng - lastLng, lat - lastLat) * 180 / Math.PI;
          window.userMarker.setRotationAngle(angle);
        }
        window.userMarker.setLatLng([lat, lng]);
      } else {
        window.userMarker = L.marker([lat, lng], { rotationAngle: 0 })
          .addTo(map)
          .bindPopup("Sei qui!")
          .openPopup();
      }

      // la mappa segue dolcemente la posizione
      if (!firstView) {
        map.setView([lat, lng], 14);
        firstView = true;
      } else {
        map.panTo([lat, lng], { animate: true, duration: 0.5 });
      }

      lastLat = lat;
      lastLng = lng;

      // controlli punti
      checkPoint(lat, lng, startPoint.lat, startPoint.lng, 0.3,
        "🚦 Sei arrivato al punto di partenza: NOGARAZZA!", soundStart, "startDone");
      checkPoint(lat, lng, fotoPoint.lat, fotoPoint.lng, 0.3,
        "📸 Sei arrivato al punto foto! Rallenta e sorridi 😎", soundFoto, "fotoDone");
      checkPoint(lat, lng, endPoint.lat, endPoint.lng, 0.3,
        "✅ Sei arrivato all'evento NIGHT RIDERS ROUTE KM3!", soundArrivo, "arrivoDone");
    },
    (err) => {
      console.warn("Errore geolocalizzazione:", err);
    },
    {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 10000
    }
  );
} else {
  console.log("Geolocalizzazione non supportata dal browser");
}