let radius = 5000 // 기본 반경 (5km)

function enableCircleSelection() {
  map.events.register("click", map, function (event) {
    const lonLat = map.getLonLatFromPixel(event.xy)
    console.log("클릭 위치:", lonLat)

    // 원형 반경 내 데이터 가져오기
    fetchFilteredDataByRadius(lonLat, radius)
  })
}

// ✅ 원형 반경 내 데이터 필터링 함수
function fetchFilteredDataByRadius(center, radius) {
  const params = new URLSearchParams({
    lon: center.lon,
    lat: center.lat,
    radius: radius,
  })

  fetch(`/filter-data-radius/?${params.toString()}`)
    .then((response) => response.json())
    .then((data) => {
      console.log("반경 내 데이터:", data)
      updateMarkers(data)
    })
    .catch((error) => console.error("반경 필터링 오류:", error))
}
