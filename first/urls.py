# first/urls.py

from django.urls import path
from . import views

# fmt: off
# 줄바꿈 안되게 막아줌 
urlpatterns = [
    path("", views.home, name="home"),
    path("filter-data/", views.filter_data, name="filter_data"),
]
# fmt: on
