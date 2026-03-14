# Generated manually — adds slug and description fields to Category

from django.db import migrations, models
from django.utils.text import slugify


def populate_slugs(apps, schema_editor):
    """Generate slugs from names for any existing categories."""
    Category = apps.get_model('skills', 'Category')
    for cat in Category.objects.all():
        if not cat.slug:
            cat.slug = slugify(cat.name)
            cat.save(update_fields=['slug'])


class Migration(migrations.Migration):

    dependencies = [
        ('skills', '0001_initial'),
    ]

    operations = [
        # 1. Add slug without unique (allows empty default for existing rows)
        migrations.AddField(
            model_name='category',
            name='slug',
            field=models.SlugField(blank=True, help_text='URL-friendly identifier', max_length=100, default='', verbose_name='Slug'),
            preserve_default=False,
        ),
        # 2. Add description
        migrations.AddField(
            model_name='category',
            name='description',
            field=models.TextField(blank=True, help_text='Category description', verbose_name='Description'),
        ),
        # 3. Populate slugs from names
        migrations.RunPython(populate_slugs, migrations.RunPython.noop),
        # 4. Now make slug unique
        migrations.AlterField(
            model_name='category',
            name='slug',
            field=models.SlugField(blank=True, help_text='URL-friendly identifier', max_length=100, unique=True, verbose_name='Slug'),
        ),
    ]
