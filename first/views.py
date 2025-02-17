# first/views.py
import math
import json
import requests
from .models import CellData, create_dynamic_model
from datetime import datetime
from django.db import connection, DatabaseError
from django.http import JsonResponse, HttpResponse
from django.shortcuts import render
from django.views.decorators.http import require_GET

# fmt: off
# VWORLD API 키
VWORLD_API_KEY = "D5914E9D-71E7-3FC4-AA3B-069A239E8B7D"

@require_GET
def home(request):
    """홈 화면 - 기본 지도 및 데이터 로드"""
    cell_data = CellData.objects.all()
    cell_data_json = json.dumps(list(cell_data.values()))

    filters = [
        {"id": "voice_connection", "label": "음성 연결", "checked": True},
        {"id": "voice_traffic", "label": "음성 트래픽", "checked": False},
        {"id": "data_connection", "label": "데이터 연결", "checked": False},
        {"id": "data_traffic", "label": "데이터 트래픽", "checked": False},
    ]
    return render(
        request, "first/home.html", {"cell_data": cell_data_json, "filters": filters}
    )


@require_GET
def cell_data_list(request):
    """데이터베이스에서 데이터 리스트 가져오기"""
    cell_data = CellData.objects.all()
    return render(request, "first/cell_data_list.html", {"cell_data": cell_data})



@require_GET
def filter_data_by_bounds(request):
    """사용자가 드래그한 사각형 영역 내 데이터를 필터링"""
    try:
        left = float(request.GET.get("left"))
        right = float(request.GET.get("right"))
        top = float(request.GET.get("top"))
        bottom = float(request.GET.get("bottom"))

        filtered_cells = CellData.objects.filter(
            longitude__gte=left,
            longitude__lte=right,
            latitude__gte=bottom,
            latitude__lte=top,
        )
        print(filtered_cells)

        return JsonResponse({"cell_data": json.dumps(list(filtered_cells.values()))})

    except (TypeError, ValueError) as e:
        return JsonResponse({"error": str(e)}, status=400)


@require_GET
def filter_data_by_radius(request):
    """사용자가 클릭한 지점에서 반경 내 데이터를 필터링"""
    try:
        lon = float(request.GET.get("lon"))
        lat = float(request.GET.get("lat"))
        radius = float(request.GET.get("radius"))

        def haversine(lat1, lon1, lat2, lon2):
            """Haversine 공식으로 두 좌표 사이 거리 계산 (미터 단위)"""
            R = 6371000  # 지구 반지름 (m)
            phi1, phi2 = math.radians(lat1), math.radians(lat2)
            delta_phi = math.radians(lat2 - lat1)
            delta_lambda = math.radians(lon2 - lon1)

            a = (
                math.sin(delta_phi / 2.0) ** 2
                + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0) ** 2
            )
            c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
            return R * c

        filtered_cells = [
            cell
            for cell in CellData.objects.all()
            if haversine(lat, lon, cell.latitude, cell.longitude) <= radius
        ]

        return JsonResponse(
            {"cell_data": json.dumps([cell.__dict__ for cell in filtered_cells])}
        )

    except (TypeError, ValueError) as e:
        return JsonResponse({"error": str(e)}, status=400)








def get_filtered_data(provider, tech, start_date, end_date):
    """동적으로 생성된 모델을 사용하여 필터링된 데이터를 가져오기"""
    model_class = create_dynamic_model(provider, tech, start_date)  # 동적 모델 생성

    # 날짜 형식 변환 (YYYYMM → YYYY-MM-DD)
    start_date = datetime.strptime(start_date, "%Y%m").strftime("%Y-%m-%d")
    end_date = datetime.strptime(end_date, "%Y%m").strftime("%Y-%m-%d")

    # ORM을 사용하여 데이터 필터링
    data = model_class.objects.filter(date__gte=start_date, date__lte=end_date)


    return data


def display_data(request, provider, tech, start_date, end_date):
    """Django 템플릿을 사용하여 데이터를 렌더링"""
    data_list = get_filtered_data(provider, tech, start_date, end_date)
    print(data_list)

    return render(request, 'first/display_data.html', {'data_list': data_list})
