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
