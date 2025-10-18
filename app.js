// Inizializza la mappa con supporto rotazione
var map = L.map('map', {
  zoomControl: false,
  rotate: true,       // abilita rotazione
  touchRotate: true,  // permette rotazione da touch
  bearing: 0          // angolo iniziale
}).setView([45.0, 9.0], 13);

// Layer base
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

// Suoni
const soundArrival = new Audio('./sounds/arrivo.mp3');
const soundFoto = new Audio('./sounds/foto.mp3');
const soundStart = new Audio('./sounds/start.mp3');

let userMarker = null;
let firstUpdate = true;
let lastLat = null;
let lastLng = null;
let lastAngle = 0;

// Funzione per calcolare la direzione (bearing)
function getBearing(lat1, lon1, lat2, lon2) {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const toDeg = (rad) => (rad * 180) / Math.PI;
  const dLon = toRad(lon2 - lon1);
  const y = Math.sin(dLon) * Math.cos(toRad(lat2));
  const x =
    Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
    Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(dLon);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

// Funzione per controllare punti e suoni
function checkPoint(userLat, userLng, pointLat, pointLng, radiusKm, message, sound) {
  const dist = Math.sqrt(Math.pow(userLat - pointLat, 2) + Math.pow(userLng - pointLng, 2)) * 111;
  if (dist <= radiusKm) {
    L.marker([pointLat, pointLng]).addTo(map).bindPopup(message).openPopup();
    if (sound) sound.play();
  }
}

// Geolocalizzazione continua
if (navigator.geolocation) {
  console.log("Geolocalizzazione attiva...");
  navigator.geolocation.watchPosition(
    (pos) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      console.log(`Posizione aggiornata: ${lat}, ${lng}`);

      if (userMarker) {
        if (lastLat !== null && lastLng !== null) {
          const angle = getBearing(lastLat, lastLng, lat, lng);
          lastAngle = angle;

          // 👉 Ruota la mappa seguendo la direzione di marcia
          map.setBearing(angle);
        }
        userMarker.setLatLng([lat, lng]);
      } else {
        // Marker fisso (freccia sempre rivolta in avanti)
        const icon = L.icon({
          iconUrl: './icons/arrow.png',
          iconSize: [40, 40],
          iconAnchor: [20, 20]
        });
        userMarker = L.marker([lat, lng], { icon: icon }).addTo(map);
      }

      // Centra e segue il movimento
      if (firstUpdate) {
        map.setView([lat, lng], 15);
        firstUpdate = false;
      } else {
        map.panTo([lat, lng], { animate: true });
      }

      // Controlli tappe
      checkPoint(lat, lng, 45.51241, 11.50781, 0.3, "🚦 Sei al punto di partenza!", soundStart);
      checkPoint(lat, lng, 45.51166, 11.45001, 0.3, "📸 Punto foto!", soundFoto);
      checkPoint(lat, lng, 45.50386, 11.41584, 0.3, "✅ Sei arrivato all'evento!", soundArrival);

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
}