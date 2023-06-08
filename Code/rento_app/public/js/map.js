//This is used to display the location.
mapboxgl.accessToken =
  "pk.eyJ1IjoiZWxqZWZlNTAiLCJhIjoiY2xoODdqcXY2MDVvNjNmbGRwZnkyanBqdyJ9.O6cb9X_DgAVmAzE2GrBv0w";
const lat = 34.241667;
const lng = -118.528333;

const map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/mapbox/streets-v11",
  zoom: 16,
  center: [lng, lat],
});

const marker = new mapboxgl.Marker().setLngLat([lng, lat]).addTo(map);