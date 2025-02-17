from django.core.management.base import BaseCommand
from django.db import connection

class Command(BaseCommand):
    help = 'Check DB connection and execute a query'

    def handle(self, *args, **kwargs):
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT * FROM mtisapp_kt_3g_201802 LIMIT 1;")
                result = cursor.fetchall()
                self.stdout.write(self.style.SUCCESS(f"Query result: {result}"))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Error: {e}"))
