let map
let currentLayer

function initMap() {
  console.log("✅ VWorld 지도 로딩 완료")
  let options = {
    controls: [
      // new OpenLayers.Control.PanZoomBar(),
      // new OpenLayers.Control.LayerSwitcher(),
      new OpenLayers.Control.Navigation(), // ctrl + 마우스 휠로 확대,축소 가능
      // new OpenLayers.Control.Attribution({ separator: " " }),
    ],
    // EPSG:4326(일반적인 위도/경도)에서 EPSG:3857(웹 머카토르)로 변환하는 과정
    projection: new OpenLayers.Projection("EPSG:900913"),
    displayProjection: new OpenLayers.Projection("EPSG:4326"),
    units: "m",
    numZoomLevels: 21,
    maxResolution: 156543.0339,
    maxExtent: new OpenLayers.Bounds(-20037508.34, -20037508.34, 20037508.34, 20037508.34),
  }

  // ✅ OpenLayers 지도 생성
  map = new OpenLayers.Map("map", options)

  // ✅ 기본 지도 레이어 추가
  currentLayer = new vworld.Layers.Base("Base")
  map.addLayer(currentLayer)

  // ✅ 특정 좌표(서울 중심)로 지도 이동
  map.setCenter(
    new OpenLayers.LonLat(126.978, 37.5665).transform(map.displayProjection, map.projection),
    12 // 줌 레벨 (값 조절 가능)
  )
  updateMap()
  enableCircleSelection()
}

function changeMapLayer() {
  const mapType = document.getElementById("mapType").value

  if (currentLayer) {
    map.removeLayer(currentLayer)
  }

  // ✅ VWorld에서 제공하는 레이어 매핑
  const layerMapping = {
    Base: () => new vworld.Layers.Base("Base"),
    White: () => new vworld.Layers.White("White"),
    Midnight: () => new vworld.Layers.Midnight("Midnight"),
    Satellite: () => new vworld.Layers.Satellite("Satellite"),
  }

  if (layerMapping[mapType]) {
    currentLayer = layerMapping[mapType]()
    map.addLayer(currentLayer)
    console.log(`✅ 지도 타입 변경: ${mapType}`)
  } else {
    console.error("❌ 지원되지 않는 지도 타입:", mapType)
  }
}

// ✅ VWorld API가 완전히 로드된 후 initMap 실행
window.onload = function () {
  if (typeof vworld !== "undefined") {
    initMap()
  } else {
    console.error("❌ VWorld API가 로드되지 않았습니다. API Key와 도메인을 확인하세요.")
  }
}

window.onload = initMap
