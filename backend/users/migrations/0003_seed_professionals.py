# Data migration — seeds 8 professional (MENTOR) users with Profiles and UserSkills

from django.contrib.auth.hashers import make_password
from django.db import migrations


PROFESSIONALS = [
    {
        'username': 'vitor.costa',
        'first_name': 'Vítor',
        'last_name': 'Costa',
        'email': 'vitor.costa@7030.pt',
        'bio': 'Canalizador certificado com mais de 12 anos de experiência em reparações e instalações residenciais.',
        'years_of_experience': 12,
        'skills': ['canalizacao', 'instalacao', 'manutencao'],
    },
    {
        'username': 'manuel.rodrigues',
        'first_name': 'Manuel',
        'last_name': 'Rodrigues',
        'email': 'manuel.rodrigues@7030.pt',
        'bio': 'Carpinteiro de profissão há 18 anos. Especialista em montagem de móveis e restauro de madeiras.',
        'years_of_experience': 18,
        'skills': ['carpintaria', 'montagem', 'reparacoes'],
    },
    {
        'username': 'joao.ferreira',
        'first_name': 'João',
        'last_name': 'Ferreira',
        'email': 'joao.ferreira@7030.pt',
        'bio': 'Electricista certificado pelo DGEG. Instalações, avarias e projetos de iluminação.',
        'years_of_experience': 10,
        'skills': ['eletricidade', 'instalacao'],
    },
    {
        'username': 'ana.sousa',
        'first_name': 'Ana',
        'last_name': 'Sousa',
        'email': 'ana.sousa@7030.pt',
        'bio': 'Pintora profissional com formação em design de interiores. Transformo espaços com cor e criatividade.',
        'years_of_experience': 8,
        'skills': ['pintura', 'reparacoes'],
    },
    {
        'username': 'pedro.oliveira',
        'first_name': 'Pedro',
        'last_name': 'Oliveira',
        'email': 'pedro.oliveira@7030.pt',
        'bio': 'Faz-tudo com experiência em montagem, instalação e pequenas reparações domésticas.',
        'years_of_experience': 6,
        'skills': ['montagem', 'instalacao', 'reparacoes'],
    },
    {
        'username': 'carlos.mendes',
        'first_name': 'Carlos',
        'last_name': 'Mendes',
        'email': 'carlos.mendes@7030.pt',
        'bio': 'Jardineiro paisagista com paixão pelo verde. Manutenção de jardins, podas e sistemas de rega.',
        'years_of_experience': 15,
        'skills': ['jardim'],
    },
    {
        'username': 'rui.santos',
        'first_name': 'Rui',
        'last_name': 'Santos',
        'email': 'rui.santos@7030.pt',
        'bio': 'Mecânico automóvel com oficina própria. Revisões, diagnósticos e reparações com garantia.',
        'years_of_experience': 20,
        'skills': ['mecanica'],
    },
    {
        'username': 'sofia.lopes',
        'first_name': 'Sofia',
        'last_name': 'Lopes',
        'email': 'sofia.lopes@7030.pt',
        'bio': 'Professora particular de Matemática, Ciências e Programação. Estudantes do 5º ao 12º ano.',
        'years_of_experience': 5,
        'skills': ['explicacoes'],
    },
]


def seed_professionals(apps, schema_editor):
    User = apps.get_model('users', 'User')
    Profile = apps.get_model('users', 'Profile')
    Category = apps.get_model('skills', 'Category')
    UserSkill = apps.get_model('skills', 'UserSkill')
    Skill = apps.get_model('skills', 'Skill')

    for pro in PROFESSIONALS:
        # Create or get User
        user, created = User.objects.update_or_create(
            username=pro['username'],
            defaults={
                'first_name': pro['first_name'],
                'last_name': pro['last_name'],
                'email': pro['email'],
                'user_type': 'MENTOR',
                'is_active': True,
            },
        )
        if created:
            user.password = make_password('7030pro2026')
            user.save()

        # Create or update Profile
        Profile.objects.update_or_create(
            user=user,
            defaults={
                'bio': pro['bio'],
                'years_of_experience': pro['years_of_experience'],
            },
        )

        # Link user to ALL skills inside each of their categories
        for cat_slug in pro['skills']:
            try:
                category = Category.objects.get(slug=cat_slug)
            except Category.DoesNotExist:
                continue
            for skill in Skill.objects.filter(category=category):
                UserSkill.objects.update_or_create(
                    user=user,
                    skill=skill,
                    defaults={
                        'proficiency': 'EXPERT',
                        'years_of_experience': pro['years_of_experience'],
                    },
                )


def unseed_professionals(apps, schema_editor):
    User = apps.get_model('users', 'User')
    usernames = [p['username'] for p in PROFESSIONALS]
    User.objects.filter(username__in=usernames).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0002_alter_profile_location'),
        ('skills', '0004_seed_skills'),
    ]

    operations = [
        migrations.RunPython(seed_professionals, unseed_professionals),
    ]
