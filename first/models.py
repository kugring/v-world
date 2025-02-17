from django.db import models


class CellData(models.Model):
    cellId = models.TextField(primary_key=True)  # cell_id를 기본 키로 설정
    company = models.TextField()
    date = models.TextField()
    band = models.TextField()
    bandwidth = models.TextField()
    address = models.TextField()
    district = models.TextField()
    latitude = models.FloatField()
    longitude = models.FloatField()
    voice_connection = models.FloatField()
    voice_traffic = models.FloatField()
    data_connection = models.FloatField()
    data_traffic = models.FloatField()

    class Meta:
        managed = False  # Django가 이 테이블을 관리하지 않도록 설정


def create_dynamic_model(provider, tech, start_date):
    """주어진 provider, tech, start_date에 맞는 동적 모델을 생성"""
    table_name = f"mtisapp_{provider}_{tech}_{start_date[:6]}"

    # 동적으로 모델 클래스를 생성
    class DynamicCellData(models.Model):
        cellId = models.TextField(primary_key=True)
        company = models.TextField()
        date = models.TextField()
        band = models.TextField()
        bandwidth = models.TextField()
        address = models.TextField()
        district = models.TextField()
        latitude = models.FloatField()
        longitude = models.FloatField()

        # 해당 데이터  항목이 존재하지 않는 테이블도 있기 때문에 주석처리함
        # voice_connection = models.FloatField()
        # voice_traffic = models.FloatField()
        # data_connection = models.FloatField()
        # data_traffic = models.FloatField()

        class Meta:
            managed = False  # Django가 이 테이블을 관리하지 않도록 설정
            db_table = table_name  # 동적으로 테이블 이름 설정

    return DynamicCellData  # 생성된 모델 클래스를 반환
