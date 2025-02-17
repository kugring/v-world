function updateMarkers(filteredData) {
  if (markersLayer) {
    map.removeLayer(markersLayer)
  }

  markersLayer = new OpenLayers.Layer.Markers("Filtered Markers")
  map.addLayer(markersLayer)

  filteredData.forEach((data) => {
    const lonLat = new OpenLayers.LonLat(parseFloat(data.longitude), parseFloat(data.latitude)).transform(new OpenLayers.Projection("EPSG:4326"), map.getProjectionObject())

    const markerIcon = new OpenLayers.Icon("https://map.vworld.kr/images/ol3/marker.png", new OpenLayers.Size(21, 25), new OpenLayers.Pixel(-10, -25))

    const marker = new OpenLayers.Marker(lonLat, markerIcon)
    markersLayer.addMarker(marker)
  })
}
