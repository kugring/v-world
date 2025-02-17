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
from django.views.decorators.csrf import csrf_exempt

# fmt: off
# VWORLD API 키
VWORLD_API_KEY = "D5914E9D-71E7-3FC4-AA3B-069A239E8B7D"

@require_GET
def home(request):
    filters = [
        {"id": "voice_connection", "label": "음성 연결", "checked": True},
        {"id": "voice_traffic", "label": "음성 트래픽", "checked": False},
        {"id": "data_connection", "label": "데이터 연결", "checked": False},
        {"id": "data_traffic", "label": "데이터 트래픽", "checked": False},
    ]
    return render(
        request, "first/home.html", {"filters": filters}
    )





@csrf_exempt
def filter_data(request):
    """AJAX 요청을 받아 동적으로 필터링된 데이터를 반환 (사각형 + 원형)"""
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            providers = data.get('providers', [])
            tech_types = data.get('tech_types', [])
            start_date = data.get('start_date', '')
            end_date = data.get('end_date', '')
            bounds = data.get('bounds', None)  # 사각형 영역 {left, right, top, bottom}
            center = data.get('center', None)  # 원형 필터링 {lon, lat, radius}

            if not providers or not tech_types:
                return JsonResponse({'error': '통신사 및 네트워크 종류를 선택하세요.'}, status=400)

            # 날짜 변환 (YYYY-MM-DD)
            start_date = datetime.strptime(start_date, "%Y-%m-%d").strftime("%Y-%m-%d")
            end_date = datetime.strptime(end_date, "%Y-%m-%d").strftime("%Y-%m-%d")
            table_date = datetime.strptime(start_date, "%Y-%m-%d").strftime("%Y%m")

            all_results = []

            for provider in providers:
                for tech in tech_types:
                    table_name = f"mtisapp_{provider}_{tech}_{table_date}"
                    
                    # ✅ 존재하는 테이블인지 확인
                    with connection.cursor() as cursor:
                        cursor.execute("SHOW TABLES LIKE %s", [table_name])
                        table_exists = cursor.fetchone()
                    
                    if not table_exists:
                        print(f"❌ Table {table_name} does not exist, skipping...")
                        continue  # 테이블이 없으면 건너뛰기

                    # ✅ 동적 모델 생성
                    model_class = create_dynamic_model(provider, tech, table_date[:6])

                    # ✅ 기본 날짜 필터링
                    query = model_class.objects.filter(date__gte=start_date, date__lte=end_date)

                    # ✅ 사각형 필터링 (bounds가 존재할 경우)
                    if bounds:
                        query = query.filter(
                            longitude__gte=bounds["left"],
                            longitude__lte=bounds["right"],
                            latitude__gte=bounds["bottom"],
                            latitude__lte=bounds["top"]
                        )

                    # ✅ 원형 반경 필터링 (center가 존재할 경우)
                    if center:
                        lon = float(center["lon"])
                        lat = float(center["lat"])
                        radius = float(center["radius"])

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

                        # ✅ 원형 범위 내 데이터 필터링 (먼저 대략적인 BBOX 적용 후 거리 계산)
                        rough_query = query.filter(
                            longitude__gte=lon - 0.03,
                            longitude__lte=lon + 0.03,
                            latitude__gte=lat - 0.03,
                            latitude__lte=lat + 0.03,
                        )

                        results = [entry for entry in rough_query if haversine(lat, lon, entry.latitude, entry.longitude) <= radius]
                    else:
                        results = query

                    for entry in results:
                        all_results.append({
                            'cellId': entry.cellId,
                            'company': entry.company,
                            'date': entry.date,
                            'band': entry.band,
                            'bandwidth': entry.bandwidth,
                            'latitude': entry.latitude,
                            'longitude': entry.longitude,
                            'address': entry.address,
                            'district': entry.district
                        })

            return JsonResponse({'data': all_results})

        except json.JSONDecodeError:
            return JsonResponse({'error': '잘못된 JSON 데이터입니다.'}, status=400)

    return JsonResponse({'error': 'POST 요청만 허용됩니다.'}, status=400)
