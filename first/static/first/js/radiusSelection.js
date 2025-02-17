let radius = 5000; // 기본 반경 (5km)
let circleLayer; // ✅ 전역 변수 선언

// ✅ 원형 반경 내 데이터 필터링 함수
function fetchFilteredDataByRadius(center_dot, radius) {
    let projSrc = new OpenLayers.Projection("EPSG:3857"); // 현재 좌표계
    let projDest = new OpenLayers.Projection("EPSG:4326"); // 변환할 좌표계

    // 클릭한 중심 좌표를 EPSG:4326으로 변환
    let transformedCenter = new OpenLayers.LonLat(center_dot.lon, center_dot.lat).transform(projSrc, projDest);

    const center = {
        lon: transformedCenter.lon.toFixed(10),
        lat: transformedCenter.lat.toFixed(10),
        radius: radius,
    };
    updateMap({ center }); // ✅ 객체 그대로 전달
}

// ✅ 원형 반경 선택 활성화 함수
function enableCircleSelection() {
    map.events.unregister("click", map, handleMapClick); // 기존 이벤트 핸들러 제거
    map.events.register("click", map, handleMapClick);
}

// ✅ 지도 클릭 핸들러 함수
function handleMapClick(event) {
  const lonLat = map.getLonLatFromPixel(event.xy);
  fetchFilteredDataByRadius(lonLat, radius);
  drawCircle(lonLat, radius); // ✅ EPSG:3857 좌표를 유지
}

// ✅ 지도에 원을 그리는 함수 (좌표 변환 수정)
function drawCircle(center, radius) {
    // ✅ `circleLayer`가 없으면 초기화
    if (!circleLayer) {
        circleLayer = new OpenLayers.Layer.Vector("Circle Layer");
        map.addLayer(circleLayer); // ✅ 한 번만 추가
    }

    // ✅ 기존 원이 있다면 삭제
    circleLayer.removeAllFeatures();

    let projSrc = new OpenLayers.Projection("EPSG:4326"); // 원래 좌표계
    let projDest = new OpenLayers.Projection("EPSG:3857"); // 변환할 좌표계

    // ✅ 중심 좌표 변환 (EPSG:4326 → EPSG:3857)
    let transformedCenter = new OpenLayers.LonLat(center.lon, center.lat).transform(projSrc, projDest);

    // ✅ 변환된 중심 좌표로 원을 생성
    let point = new OpenLayers.Geometry.Point(center.lon, center.lat);
    let radiusInMeters = radius; // ✅ OpenLayers 2는 미터 단위를 직접 사용 가능

    let circle = OpenLayers.Geometry.Polygon.createRegularPolygon(
        point,
        radiusInMeters,
        40, // 다각형의 점 개수
        0
    );

    // ✅ 원 스타일 적용
    let circleFeature = new OpenLayers.Feature.Vector(circle, null, {
        strokeColor: "#FF0000", // 빨간색 테두리
        strokeOpacity: 0.8,
        strokeWidth: 2,
        fillColor: "#FF0000",
        fillOpacity: 0.2,
    });
    
    // ✅ 새로운 원 추가
    circleLayer.addFeatures([circleFeature]);
}

