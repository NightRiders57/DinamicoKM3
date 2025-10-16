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
    startIconUrl: 'icons/start.png',
    endIconUrl: 'icons/end.png',
    shadowUrl: 'icons/shadow.png',
    wptIconUrls: { '': 'icons/waypoint.png' } // tutti gli altri waypoint
  },
  polyline_options: {
    color: 'orange',
    weight: 5,
    opacity: 0.8
  }
}).on('loaded', function(e) {
  map.fitBounds(e.target.getBounds());
}).addTo(map);

// Controlla se il browser supporta la geolocalizzazione
if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
        // Coordinate dell’utente
        var lat = position.coords.latitude;
        var lon = position.coords.longitude;

        // Aggiungi un marker sulla mappa
        L.marker([lat, lon]).addTo(map)
            .bindPopup("Sei qui!")
            .openPopup();

        // Centra la mappa sulla posizione
        map.setView([lat, lon], 14);
    }, function(error) {
        console.error("Errore geolocalizzazione:", error);
    });
} else {
    console.log("Geolocalizzazione non supportata dal browser");
}

