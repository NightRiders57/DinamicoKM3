// Inizializza la mappa (lat/lon centrali generici, cambiare se vuoi)
var map = L.map('map').setView([45.0, 9.0], 13);

// Tile layer OpenStreetMap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19
}).addTo(map);

// Percorso GPX
var gpx = 'percorso.gpx'; // il tuo file GPX

new L.GPX(gpx, {
  async: true,
  marker_options: {
    startIconUrl: './icons/start.png',
    endIconUrl: './icons/end.png',
    shadowUrl: './icons/shadow.png',
    wptIconUrls: { '': './icons/waypoint.png' } // tutti gli altri waypoint
  },
  polyline_options: {
    color: 'orange',
    weight: 5,
    opacity: 0.8
  }
}).on('loaded', function(e) {
  map.fitBounds(e.target.getBounds());
}).addTo(map);

// Carica suono di notifica
var audio = new Audio('sounds/ping.mp3'); // metti un file ping.mp3 nella cartella sounds

// Variabili per rotazione e centro mappa
let lastLat = null, lastLng = null;
let firstView = false;

if (navigator.geolocation) {
  navigator.geolocation.watchPosition(
    (pos) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;

      // Crea o aggiorna marker
      if (window.userMarker) {
        // calcola angolo
        if (lastLat !== null && lastLng !== null) {
          const angle = Math.atan2(lng - lastLng, lat - lastLat) * 180 / Math.PI;
          window.userMarker.setRotationAngle(angle); // serve Leaflet.RotatedMarker
        }
        window.userMarker.setLatLng([lat, lng]);
      } else {
        window.userMarker = L.marker([lat, lng], { rotationAngle: 0 })
          .addTo(map)
          .bindPopup("Sei qui!")
          .openPopup();
      }

      // Centra mappa solo alla prima posizione
      if (!firstView) {
        map.setView([lat, lng], 14);
        firstView = true;
      } else {
        map.panTo([lat, lng], { animate: true, duration: 0.5 });
      }

      lastLat = lat;
      lastLng = lng;

      // Controlli punti con suono
      checkStart(lat, lng);
      checkFoto(lat, lng);
      checkArrival(lat, lng);

    },
    (err) => console.warn("Errore geolocalizzazione:", err),
    { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
  );
}

// Funzione generica per controllare arrivo a un punto
function checkPoint(userLat, userLng, pointLat, pointLng, radiusKm, message) {
  const dist = Math.sqrt(
    Math.pow(userLat - pointLat, 2) + Math.pow(userLng - pointLng, 2)
  ) * 111;

  if (dist <= radiusKm) {
    L.marker([pointLat, pointLng])
      .addTo(map)
      .bindPopup(message)
      .openPopup();

    // Suona solo la prima volta
    if (!window[`played_${message}`]) {
      audio.play();
      window[`played_${message}`] = true;
    }
  }
}

function checkStart(userLat, userLng) {
  checkPoint(userLat, userLng, 45.51241, 11.50781, 0.3, "🚦 Sei arrivato al punto di partenza: NOGARAZZA!");
}

function checkFoto(userLat, userLng) {
  checkPoint(userLat, userLng, 45.51166, 11.45001, 0.3, "📸 Sei arrivato al punto foto! Rallenta e sorridi 😎");
}

function checkArrival(userLat, userLng) {
  checkPoint(userLat, userLng, 45.50386, 11.41584, 0.3, "✅ Sei arrivato all'evento NIGHT RIDERS ROUTE KM3!");
}
