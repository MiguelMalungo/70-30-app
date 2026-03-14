# Data migration — seeds the 12 home-services categories

from django.db import migrations


CATEGORIES = [
    {'slug': 'canalizacao',   'name': 'Canalização',   'icon': 'Droplets',       'description': 'Reparações e instalações de sistemas de água e saneamento em casa.'},
    {'slug': 'eletricidade',  'name': 'Eletricidade',   'icon': 'Zap',            'description': 'Instalações elétricas, quadros, tomadas e iluminação com profissionais certificados.'},
    {'slug': 'carpintaria',   'name': 'Carpintaria',    'icon': 'Hammer',         'description': 'Montagem de móveis, reparação de portas, soalhos e trabalhos em madeira à medida.'},
    {'slug': 'pintura',       'name': 'Pintura',        'icon': 'Paintbrush',     'description': 'Pintura interior e exterior, remoção de papel de parede e tratamento de madeiras.'},
    {'slug': 'montagem',      'name': 'Montagem',       'icon': 'Wrench',         'description': 'Montagem de móveis IKEA, estantes, electrodomésticos e muito mais.'},
    {'slug': 'jardim',        'name': 'Jardim',         'icon': 'Leaf',           'description': 'Corte de relva, poda, plantação e manutenção de jardins e espaços verdes.'},
    {'slug': 'reparacoes',    'name': 'Reparações',     'icon': 'Settings2',      'description': 'Reparações gerais em casa — telhado, portão, pavimento e muito mais.'},
    {'slug': 'instalacao',    'name': 'Instalação',     'icon': 'Plug',           'description': 'Ar condicionado, aquecedor, alarme, redes Wi-Fi e persianas instalados por especialistas.'},
    {'slug': 'manutencao',    'name': 'Manutenção',     'icon': 'Gauge',          'description': 'Manutenção preventiva da tua casa — caldeira, esgotos, caleiras e inspeção geral.'},
    {'slug': 'explicacoes',   'name': 'Explicações',    'icon': 'BookOpen',       'description': 'Explicações escolares, aulas de línguas, música, programação e desporto.'},
    {'slug': 'mecanica',      'name': 'Mecânica Auto',  'icon': 'Car',            'description': 'Revisão, diagnóstico, travões e reparações auto ao domicílio ou na oficina.'},
    {'slug': 'outros',        'name': 'Outros',         'icon': 'MoreHorizontal', 'description': 'Mudanças, limpeza profunda, fotografia e outros serviços especializados.'},
]


def seed_categories(apps, schema_editor):
    Category = apps.get_model('skills', 'Category')
    for cat_data in CATEGORIES:
        Category.objects.update_or_create(
            slug=cat_data['slug'],
            defaults=cat_data,
        )


def unseed_categories(apps, schema_editor):
    Category = apps.get_model('skills', 'Category')
    slugs = [c['slug'] for c in CATEGORIES]
    Category.objects.filter(slug__in=slugs).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('skills', '0002_category_description_category_slug'),
    ]

    operations = [
        migrations.RunPython(seed_categories, unseed_categories),
    ]
