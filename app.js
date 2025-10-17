// Inizializza la mappa centrata genericamente
var map = L.map('map').setView([45.0, 9.0], 13);

// Tile base
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

// AUDIO
const soundArrival = new Audio('./sounds/arrivo.mp3');
const soundFoto = new Audio('./sounds/foto.mp3');
const soundStart = new Audio('./sounds/start.mp3');

// VARIABILI GLOBALI
let lastLat = null;
let lastLng = null;
let userMarker = null;

// Funzioni di controllo punti
function checkStart(lat, lng) {
  const startLat = 45.51241;
  const startLng = 11.50781;
  const radius = 0.3;

  const dist = Math.sqrt(
    Math.pow(lat - startLat, 2) + Math.pow(lng - startLng, 2)
  ) * 111;

  if (dist <= radius) {
    L.marker([startLat, startLng])
      .addTo(map)
      .bindPopup("🚦 Sei arrivato al punto di partenza: NOGARAZZA!")
      .openPopup();
    soundStart.play();
  }
}

function checkFoto(lat, lng) {
  const fotoLat = 45.51166;
  const fotoLng = 11.45001;
  const radius = 0.3;

  const dist = Math.sqrt(
    Math.pow(lat - fotoLat, 2) + Math.pow(lng - fotoLng, 2)
  ) * 111;

  if (dist <= radius) {
    L.marker([fotoLat, fotoLng])
      .addTo(map)
      .bindPopup("📸 Sei arrivato al punto foto! Rallenta e sorridi 😎")
      .openPopup();
    soundFoto.play();
  }
}

function checkArrival(lat, lng) {
  const eventLat = 45.50386;
  const eventLng = 11.41584;
  const radius = 0.3;

  const dist = Math.sqrt(
    Math.pow(lat - eventLat, 2) + Math.pow(lng - eventLng, 2)
  ) * 111;

  if (dist <= radius) {
    L.marker([eventLat, eventLng])
      .addTo(map)
      .bindPopup("✅ Sei arrivato all'evento NIGHT RIDERS ROUTE KM3!")
      .openPopup();
    soundArrival.play();
  }
}

// GEOLOCALIZZAZIONE IN TEMPO REALE
if (navigator.geolocation) {
  navigator.geolocation.watchPosition(
    (pos) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;

      // Calcola direzione di movimento
      let heading = 0;
      if (lastLat !== null && lastLng !== null) {
        heading = Math.atan2(lng - lastLng, lat - lastLat) * (180 / Math.PI);
      }

      lastLat = lat;
      lastLng = lng;

      // Se esiste già il marker, aggiorna posizione e rotazione
      if (userMarker) {
        userMarker.setLatLng([lat, lng]);
        userMarker.setRotationAngle(heading);
      } else {
        userMarker = L.marker([lat, lng], {
          rotationAngle: 0,
          rotationOrigin: 'center center'
        })
          .addTo(map)
          .bindPopup("Sei qui!")
          .openPopup();
      }

      // Muove la mappa seguendo il marker, senza cambiare lo zoom
      const center = map.getCenter();
      const distance = map.distance(center, [lat, lng]);
      if (distance > 50) { // sposta quando sei a 50 m dal bordo
        map.panTo([lat, lng], { animate: true });
      }

      // Controlli
      checkStart(lat, lng);
      checkFoto(lat, lng);
      checkArrival(lat, lng);
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
  alert("Geolocalizzazione non supportata dal browser.");
}