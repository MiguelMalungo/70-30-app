# Data migration — seeds the subcategory Skills linked to their parent Categories

from django.db import migrations


# category_slug → list of (skill_name,)
SKILLS_BY_CATEGORY = {
    'canalizacao': [
        'Reparação de torneira',
        'Desentupimento',
        'Substituição de sanita',
        'Instalação de chuveiro/banheira',
        'Deteção de fugas de água',
    ],
    'eletricidade': [
        'Instalação de tomadas e interruptores',
        'Revisão do quadro elétrico',
        'Instalação de iluminação',
        'Diagnóstico de avaria elétrica',
        'Instalação de video porteiro',
    ],
    'carpintaria': [
        'Montagem de móveis',
        'Reparação de portas e janelas',
        'Reparação de soalho/parquet',
        'Armários e roupeiros à medida',
        'Decks e estruturas exteriores',
    ],
    'pintura': [
        'Pintura de quarto',
        'Pintura de sala',
        'Pintura de exterior',
        'Verniz e tratamento de madeiras',
        'Remoção de papel de parede',
    ],
    'montagem': [
        'Montagem IKEA e mobiliário',
        'Estantes e prateleiras',
        'Instalação de electrodomésticos',
        'Fixação de TV na parede',
        'Ligação de máquinas lavar/secar',
    ],
    'jardim': [
        'Corte de relva e aparação',
        'Poda de árvores e arbustos',
        'Limpeza e manutenção de jardim',
        'Sistema de rega automática',
        'Plantação e paisagismo',
    ],
    'reparacoes': [
        'Reparação de telhado e telhas',
        'Reparação de portão e vedações',
        'Reparação de pavimento e azulejos',
        'Aplicação de silicone e vedações',
        'Reparações gerais em casa',
    ],
    'instalacao': [
        'Instalação de ar condicionado',
        'Instalação de aquecedor/esquentador',
        'Sistema de alarme e segurança',
        'Instalação de redes e Wi-Fi',
        'Instalação de estores e persianas',
    ],
    'manutencao': [
        'Manutenção de caldeira',
        'Inspeção geral da habitação',
        'Manutenção preventiva de esgotos',
        'Limpeza de caleiras e coberturas',
    ],
    'explicacoes': [
        'Matemática e Ciências',
        'Línguas estrangeiras',
        'Programação e Informática',
        'Música e instrumento',
        'Desporto e Fitness pessoal',
    ],
    'mecanica': [
        'Revisão geral do veículo',
        'Troca e equilíbrio de pneus',
        'Diagnóstico electrónico',
        'Revisão do sistema de travagem',
        'Substituição de bateria',
    ],
    'outros': [
        'Mudanças e transporte',
        'Limpeza profissional',
        'Fotografia e vídeo',
        'Organização de eventos',
    ],
}


def seed_skills(apps, schema_editor):
    Category = apps.get_model('skills', 'Category')
    Skill = apps.get_model('skills', 'Skill')

    for cat_slug, skill_names in SKILLS_BY_CATEGORY.items():
        try:
            category = Category.objects.get(slug=cat_slug)
        except Category.DoesNotExist:
            continue  # skip if category not seeded yet

        for name in skill_names:
            Skill.objects.update_or_create(
                name=name,
                defaults={'category': category},
            )


def unseed_skills(apps, schema_editor):
    Skill = apps.get_model('skills', 'Skill')
    all_names = []
    for names in SKILLS_BY_CATEGORY.values():
        all_names.extend(names)
    Skill.objects.filter(name__in=all_names).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('skills', '0003_seed_categories'),
    ]

    operations = [
        migrations.RunPython(seed_skills, unseed_skills),
    ]
