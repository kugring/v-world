# Generated by Django 5.1.6 on 2025-02-13 06:29

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('first', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='celldata',
            name='address',
            field=models.TextField(),
        ),
        migrations.AlterField(
            model_name='celldata',
            name='band',
            field=models.TextField(),
        ),
        migrations.AlterField(
            model_name='celldata',
            name='bandwidth',
            field=models.TextField(),
        ),
        migrations.AlterField(
            model_name='celldata',
            name='cell_id',
            field=models.TextField(),
        ),
        migrations.AlterField(
            model_name='celldata',
            name='company',
            field=models.TextField(),
        ),
        migrations.AlterField(
            model_name='celldata',
            name='date',
            field=models.TextField(),
        ),
        migrations.AlterField(
            model_name='celldata',
            name='district',
            field=models.TextField(),
        ),
    ]
