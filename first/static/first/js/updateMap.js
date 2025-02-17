let markersLayer // ✅ 마커 레이어 전역 변수

function updateMap() {
  $("#loading-spinner").show() // ✅ 로딩 시작 (보이게 설정)

  const params = new URLSearchParams({
    data_traffic: $("#data_traffic").val(),
    voice_traffic: $("#voice_traffic").val(),
    data_connection: $("#data_connection").val(),
    voice_connection: $("#voice_connection").val(),
    use_data_traffic: $("#use_data_traffic").prop("checked"),
    use_voice_traffic: $("#use_voice_traffic").prop("checked"),
    use_data_connection: $("#use_data_connection").prop("checked"),
    use_voice_connection: $("#use_voice_connection").prop("checked"),
  })

  fetch(`/filter-data/?${params.toString()}`)
    .then((response) => response.json())
    .then((data) => {
      const cellDataList = JSON.parse(data.cell_data)

      updateMarkers(cellDataList) // ✅ 마커 업데이트 함수 호출

      // ✅ 로딩 숨기기
      setTimeout(() => {
        $("#loading-spinner").hide()
      }, 50)
    })
    .catch((error) => {
      console.error("데이터 로드 실패:", error)
      $("#loading-spinner").hide() // ✅ 에러 발생 시 숨김
    })
}

// ✅ 마커 업데이트 함수 (기존 `updateMarkers` 병합)
function updateMarkers(filteredData) {
  // ✅ 기존 마커 레이어가 있으면 내부 마커만 삭제
  if (markersLayer) {
    markersLayer.clearMarkers() // ✅ 기존 마커만 제거, 레이어는 유지
  } else {
    // ✅ 마커 레이어가 없으면 새로 생성
    markersLayer = new OpenLayers.Layer.Markers("Markers")
    map.addLayer(markersLayer)
  }

  filteredData.forEach((data) => {
    const lonLat = new OpenLayers.LonLat(parseFloat(data.longitude), parseFloat(data.latitude)).transform(new OpenLayers.Projection("EPSG:4326"), map.getProjectionObject())

    const markerIcon = new OpenLayers.Icon(
      "https://map.vworld.kr/images/ol3/marker.png", // 기본 마커 이미지
      new OpenLayers.Size(21, 25),
      new OpenLayers.Pixel(-10, -25)
    )

    const marker = new OpenLayers.Marker(lonLat, markerIcon)
    markersLayer.addMarker(marker)

    // ✅ 마커 클릭 이벤트 추가
    marker.events.register("mousedown", marker, function (evt) {
      // ✅ 메시지 박스 가져오기
      let messageBox = document.getElementById("message-box")
      if (!messageBox) {
        messageBox = document.createElement("div")
        messageBox.id = "message-box"
        messageBox.className = "message-box"
        document.body.appendChild(messageBox)
      }

      // ✅ 메시지 설정
      messageBox.innerHTML = `
        <strong>Cell ID:</strong> ${data.cellId} <br>
        <strong>Company:</strong> ${data.company} <br>
        <strong>Date:</strong> ${data.date} <br>
        <strong>Band:</strong> ${data.band} <br>
        <strong>Bandwidth:</strong> ${data.bandwidth} <br>
        <strong>Address:</strong> ${data.address} <br>
        <strong>District:</strong> ${data.district}
      `

      // ✅ 메시지 박스 표시
      messageBox.classList.add("show")

      // ✅ 10초 후 메시지 사라짐
      setTimeout(() => {
        messageBox.classList.remove("show")
      }, 10000)

      // ✅ OpenLayers 이벤트 중지
      OpenLayers.Event.stop(evt)
    })
  })
}

// ✅ 맵 초기화 함수
function resetMap() {
  resetMarkers()
  removeSelectionControl()
  resetRectangleSelection()
}

// ✅ 마커 초기화 함수
function resetMarkers() {
  if (markersLayer) {
    markersLayer.clearMarkers() // ✅ 기존 마커만 제거, 레이어는 유지
  }
}

/** ✅ 선택 컨트롤 제거 */
function removeSelectionControl() {
  if (selectControl) {
    selectControl.deactivate()
    map.removeControl(selectControl)
    selectControl = null
    console.log("❌ 선택 컨트롤 비활성화")
  }
}

/** ✅ 사각형 초기화 (기존 사각형 제거) */
function resetRectangleSelection() {
  vectorLayer.removeAllFeatures()
  map.removeLayer(vectorLayer)
  vectorLayer = null
  console.log("❌ 기존 사각형 삭제 완료")
}
