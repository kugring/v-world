let markersLayer // ✅ 마커 레이어 전역 변수

$(document).ready(function () {
    initializeDatePickers() // ✅ 날짜 선택기 설정
})

function initializeDatePickers() {
    var today = new Date()
    var fiveYearsAgo = new Date()
    fiveYearsAgo.setFullYear(today.getFullYear() - 2)

    // ✅ yyyy-mm-dd 형식으로 날짜 변환
    var todayFormatted = today.toISOString().split("T")[0]
    var fiveYearsAgoFormatted = fiveYearsAgo.toISOString().split("T")[0]

    // ✅ datepicker 적용 및 기본 날짜 설정
    $("#start_date").datepicker({ dateFormat: "yy-mm-dd" })
    $("#end_date").datepicker({ dateFormat: "yy-mm-dd" })

    // ✅ HTML 요소에 기본값 설정 (문서가 로드되기 전에 설정)
    $("#start_date").val(fiveYearsAgoFormatted)
    $("#end_date").val(todayFormatted)

    // ✅ datepicker 값 동기화
    $("#start_date").datepicker("setDate", fiveYearsAgoFormatted)
    $("#end_date").datepicker("setDate", todayFormatted)
}

// ✅ 페이지가 로드된 후 실행
$(document).ready(function () {
    initializeDatePickers()
})

function updateMap(request) {
    $("#loading-spinner").show() // ✅ 로딩 시작

    // ✅ 체크된 통신사(provider) 목록 가져오기
    const selectedProviders = []
    $("input[name='provider']:checked").each(function () {
        selectedProviders.push($(this).val())
    })

    // ✅ 체크된 네트워크 유형(3G, 4G, 5G) 목록 가져오기
    const selectedTechTypes = []
    $("input[name='tech']:checked").each(function () {
        selectedTechTypes.push($(this).val())
    })

    // ✅ 날짜 선택값 가져오기
    const startDate = $("#start_date").val()
    const endDate = $("#end_date").val()

    if (selectedProviders.length === 0 || selectedTechTypes.length === 0) {
        alert("통신사 및 네트워크 종류를 최소 한 개 이상 선택하세요.")
        $("#loading-spinner").hide()
        return
    }

    // ✅ JSON 형식으로 요청 데이터 구성
    let requestData = {
        // `let`으로 선언하여 재할당 가능하도록 변경
        providers: selectedProviders,
        tech_types: selectedTechTypes,
        start_date: startDate,
        end_date: endDate,
    }

    console.log("초기 requestData:", requestData)
    console.log("전달된 request:", request) // request 값 확인

    // ✅ request 객체가 존재하면 병합
    if (request && typeof request === "object") {
        requestData = { ...requestData, ...request } // ✅ 병합
        console.log("병합된 requestData:", requestData)
    } else {
        console.warn("⚠️ 전달된 request가 유효하지 않습니다.")
    }
    fetch("/filter-data/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
    })
        .then((response) => response.json())
        .then((data) => {
            const cellDataList = data.data // ✅ JSON 데이터에서 목록 추출
            updateMarkers(cellDataList) // ✅ 마커 업데이트 함수 호출
            $("#loading-spinner").hide() // ✅ 로딩 숨기기
            console.log(cellDataList)
        })
        .catch((error) => {
            console.error("데이터 로드 실패:", error)
            $("#loading-spinner").hide() // ✅ 에러 발생 시 숨김
        })
}

// ✅ 마커 업데이트 함수
function updateMarkers(filteredData) {
    if (markersLayer) {
        markersLayer.clearMarkers() // ✅ 기존 마커만 제거
    } else {
        markersLayer = new OpenLayers.Layer.Markers("Markers")
        map.addLayer(markersLayer)
    }

    filteredData.forEach((data) => {
        const lonLat = new OpenLayers.LonLat(parseFloat(data.longitude), parseFloat(data.latitude)).transform(new OpenLayers.Projection("EPSG:4326"), map.getProjectionObject())

        function createSVGMarker(color, borderColor, borderWidth, width, height) {
            const svg = `
          <svg width="${width}" height="${height}" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
                    fill="${color}" stroke="${borderColor}" stroke-width="${borderWidth}"/>
              <circle cx="12" cy="9" r="2.5" fill="white" stroke="${borderColor}" stroke-width="${borderWidth}"/>
          </svg>
        `

            const blob = new Blob([svg], { type: "image/svg+xml" })
            const url = URL.createObjectURL(blob)

            return new OpenLayers.Icon(url, new OpenLayers.Size(width, height), new OpenLayers.Pixel(-width / 2, -height))
        }

        // ✅ 통신사별 마커 색상 지정
        let markerIcon
        switch (data.company) {
            case "KT":
                markerIcon = createSVGMarker("#21B7B1", "#FFFFFF", 0.7, 30, 40) // 빨강 + 검정 테두리
                break
            case "LGU":
                markerIcon = createSVGMarker("#DC1C86", "#FFFFFF", 0.7, 30, 40) // 핑크 + 검정 테두리
                break
            case "SKT":
                markerIcon = createSVGMarker("#E87C0A", "#FFFFFF", 0.7, 30, 40) // 오렌지 + 빨강 테두리
                break
            default:
                markerIcon = createSVGMarker("#808080", "#000000", 0.7, 30, 40) // 기본 회색 마커
        }

        const marker = new OpenLayers.Marker(lonLat, markerIcon)
        markersLayer.addMarker(marker)

        marker.events.register("mousedown", marker, function (evt) {
            let messageBox = document.getElementById("message-box")
            if (!messageBox) {
                messageBox = document.createElement("div")
                messageBox.id = "message-box"
                messageBox.className = "message-box"
                document.body.appendChild(messageBox)
            }

            messageBox.innerHTML = `
              <strong>Cell ID:</strong> ${data.cellId} <br>
              <strong>Company:</strong> ${data.company} <br>
              <strong>Date:</strong> ${data.date} <br>
              <strong>Band:</strong> ${data.band} <br>
              <strong>Bandwidth:</strong> ${data.bandwidth} <br>
              <strong>Address:</strong> ${data.address} <br>
              <strong>District:</strong> ${data.district}
            `

            messageBox.classList.add("show")
            setTimeout(() => {
                messageBox.classList.remove("show")
            }, 10000)

            OpenLayers.Event.stop(evt)
        })
    })
}
