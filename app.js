// Inizializza la mappa centrata su un punto qualsiasi
var map = L.map('map').setView([45.0, 9.0], 13);

// Aggiungi layer base
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

// === AUDIO ===
const soundArrival = new Audio('./sounds/arrivo.mp3');
const soundFoto = new Audio('./sounds/foto.mp3');
const soundStart = new Audio('./sounds/start.mp3');

// === VARIABILI GLOBALI ===
let userMarker = null;
let firstUpdate = true;
let lastLat = null;
let lastLng = null;

// === FUNZIONI DI CONTROLLO ===
function checkPoint(userLat, userLng, pointLat, pointLng, radiusKm, message, sound) {
  const dist = Math.sqrt(Math.pow(userLat - pointLat, 2) + Math.pow(userLng - pointLng, 2)) * 111;
  if (dist <= radiusKm) {
    L.marker([pointLat, pointLng]).addTo(map).bindPopup(message).openPopup();
    if (sound) sound.play();
  }
}

// === GEOLOCALIZZAZIONE ===
if (navigator.geolocation) {
  console.log("Geolocalizzazione attiva...");
  navigator.geolocation.watchPosition(
    (pos) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      console.log(`Posizione aggiornata: ${lat}, ${lng}`);

      // Se il marker esiste, aggiorna posizione
      if (userMarker) {
        userMarker.setLatLng([lat, lng]);
      } else {
        userMarker = L.marker([lat, lng]).addTo(map).bindPopup("Sei qui!").openPopup();
      }

      // La prima volta centra la mappa
      if (firstUpdate) {
        map.setView([lat, lng], 15);
        firstUpdate = false;
      } else {
        map.panTo([lat, lng], { animate: true });
      }

      // Controlli personalizzati
      checkPoint(lat, lng, 45.51241, 11.50781, 0.3, "🚦 Sei al punto di partenza!", soundStart);
      checkPoint(lat, lng, 45.51166, 11.45001, 0.3, "📸 Punto foto!", soundFoto);
      checkPoint(lat, lng, 45.50386, 11.41584, 0.3, "✅ Sei arrivato all'evento!", soundArrival);

      // Memorizza l’ultima posizione
      lastLat = lat;
      lastLng = lng;
    },
    (err) => {
      console.error("Errore geolocalizzazione:", err);
      alert("Errore nella geolocalizzazione: " + err.message);
    },
    {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 10000
    }
  );
} else {
  alert("Geolocalizzazione non supportata dal browser.");
}