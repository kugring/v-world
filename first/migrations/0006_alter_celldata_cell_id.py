# Generated by Django 5.1.6 on 2025-02-13 07:00

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('first', '0005_alter_celldata_cell_id'),
    ]

    operations = [
        migrations.AlterField(
            model_name='celldata',
            name='cell_id',
            field=models.BinaryField(),
        ),
    ]
