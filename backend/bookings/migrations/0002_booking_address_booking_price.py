# Generated manually — adds address and price fields to Booking

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('bookings', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='booking',
            name='address',
            field=models.CharField(blank=True, help_text='Service location address', max_length=255, verbose_name='Address'),
        ),
        migrations.AddField(
            model_name='booking',
            name='price',
            field=models.DecimalField(blank=True, decimal_places=2, help_text='Agreed service price in EUR', max_digits=8, null=True, verbose_name='Price'),
        ),
    ]
