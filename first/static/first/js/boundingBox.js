let selectControl
let selectedBounds = null
let vectorLayer // ✅ 기존 사각형을 저장할 변수
let selectionActive = false // ✅ 사각형 선택 모드 활성화 여부

// ✅ 버튼 클릭 시 영역 선택 토글
$("#bounding-box-btn").on("click", function () {
  toggleRectangleSelection()
})

/** ✅ 사각형 선택 ON/OFF 토글 */
function toggleRectangleSelection() {
  if (!selectionActive) {
    enableRectangleSelection() // ✅ 선택 모드 활성화
    $("#bounding-box-btn").text("모드 종료").addClass("active") // ✅ 버튼 상태 변경
  } else {
    disableRectangleSelection() // ✅ 선택 모드 비활성화
    $("#bounding-box-btn").text("영역 선택").removeClass("active") // ✅ 버튼 상태 변경
  }
}

function enableRectangleSelection() {
  if (typeof map === "undefined" || map === null) {
    console.error("❌ OpenLayers 지도 객체(map)가 정의되지 않았습니다.")
    return
  }

  // ✅ 벡터 레이어가 없으면 생성
  if (!vectorLayer) {
    vectorLayer = new OpenLayers.Layer.Vector("Bounding Box")
    map.addLayer(vectorLayer)
  }

  // ✅ 선택 컨트롤 생성
  selectControl = new OpenLayers.Control.DrawFeature(vectorLayer, OpenLayers.Handler.RegularPolygon, {
    handlerOptions: {
      sides: 4, // 사각형
      irregular: true, // 자유롭게 조절 가능
    },
  })

  if (!selectControl || !selectControl.events) {
    console.error("❌ selectControl이 정상적으로 생성되지 않았습니다.")
    return
  }

  // ✅ 사각형 선택 이벤트 등록
  selectControl.events.register("featureadded", selectControl, function (event) {
    // ✅ 기존 사각형 삭제 (기존 도형 제거)
    vectorLayer.removeAllFeatures()

    // ✅ 새 사각형 추가
    let feature = event.feature
    vectorLayer.addFeatures([feature])

    const bounds = feature.geometry.getBounds()

    let projSrc = new OpenLayers.Projection("EPSG:3857")
    let projDest = new OpenLayers.Projection("EPSG:4326")

    let bottomLeft = new OpenLayers.LonLat(bounds.left, bounds.bottom).transform(projSrc, projDest)
    let topRight = new OpenLayers.LonLat(bounds.right, bounds.top).transform(projSrc, projDest)

    selectedBounds = {
      left: bottomLeft.lon,
      right: topRight.lon,
      bottom: bottomLeft.lat,
      top: topRight.lat,
    }

    console.log("📌 선택된 영역 (경위도 좌표):", selectedBounds)

    fetchFilteredDataByBounds(selectedBounds)
  })

  map.addControl(selectControl)
  selectControl.activate()
  selectionActive = true // ✅ 활성화 상태로 변경

  console.log("✅ 사각형 선택 모드 활성화 (연속 드래그 가능)")
}

function disableRectangleSelection() {
  if (selectControl) {
    selectControl.deactivate() // ✅ 선택 컨트롤 비활성화
    map.removeControl(selectControl)
    selectControl = null
  }

  if (vectorLayer) {
    vectorLayer.removeAllFeatures() // ✅ 기존 사각형 삭제
    map.removeLayer(vectorLayer)
    vectorLayer = null
  }

  selectedBounds = null // ✅ 선택된 데이터 초기화
  console.log("❌ 사각형 선택 모드 비활성화 & 데이터 초기화")

  selectionActive = false // ✅ 비활성화 상태로 변경
}

// ✅ 사각형 영역 안의 데이터를 가져오는 함수
function fetchFilteredDataByBounds(bounds) {
  const params = new URLSearchParams({
    left: bounds.left,
    right: bounds.right,
    top: bounds.top,
    bottom: bounds.bottom,
  })

  fetch(`/filter-data-bounds/?${params.toString()}`)
    .then((response) => response.json())
    .then((data) => {
      let filteredData
      try {
        // ✅ 문자열이면 JSON으로 변환
        filteredData = typeof data.cell_data === "string" ? JSON.parse(data.cell_data) : data.cell_data
      } catch (e) {
        console.error("❌ JSON 변환 오류:", e)
        return
      }

      if (Array.isArray(filteredData)) {
        updateMarkers(filteredData)
      } else {
        console.error("❌ 필터링된 데이터가 배열이 아닙니다:", filteredData)
      }
    })
    .catch((error) => console.error("데이터 필터링 오류:", error))
}
