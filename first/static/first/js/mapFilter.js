// 체크박스로 인한 활성화 상태
$(document).ready(function () {
  $(".filter-check").change(function () {
    let $filterItem = $(this).closest(".filter-item") // 부모 요소 찾기
    $filterItem.css("opacity", this.checked ? "1" : "0.4")
  })
  // 페이지 로드 시 체크 상태에 따라 opacity 설정
  $(".filter-check").each(function () {
    let $filterItem = $(this).closest(".filter-item")
    $filterItem.css("opacity", this.checked ? "1" : "0.4")
  })
})

//  활성화된 게이지 변동시 업데이트
$(".filter-range").on("input change", function () {
  // 해당 슬라이더에 연결된 체크박스가 체크된 경우에만 updateMap 실행
  if ($(this).closest(".filter-item").find(".filter-check").prop("checked")) {
    updateMap()
  }
})

//  체크박스 클릭시 업데이트
$(".filter-check").on("click", function () {
  updateMap() // ✅ 체크박스 클릭 시에는 항상 updateMap 실행
})

// 게이지 변동시  (N%)퍼센트 표기
$("input[type='range']").on("input", function () {
  $("#" + this.id + "_val").text(this.value)
})
