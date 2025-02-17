# first/urls.py

from django.urls import path
from . import views

# fmt: off
# 줄바꿈 안되게 막아줌 
urlpatterns = [
    path("", views.home, name="home"),
    path("cell-data/", views.cell_data_list, name="cell_data_list"),  # JSON 응답
    path('display-data/<str:provider>/<str:tech>/<str:start_date>/<str:end_date>/', views.display_data, name='display_data'),
    path("filter-data-bounds/", views.filter_data_by_bounds, name="filter_data_by_bounds"),
    path("filter-data-radius/", views.filter_data_by_radius, name="filter_data_by_radius"),




    # 트래픽, 접속량에 대한 데이터 항목이 없는 테이블이 있어서 잠시 주석처리
    # path("filter-data/", views.filter_data, name="filter_data"),

]
# fmt: on
