# Generated by Django 5.2 on 2025-04-28 02:01

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('communications', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='RitualPlan',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=200, verbose_name='título')),
                ('description', models.TextField(blank=True, verbose_name='descripción')),
                ('date', models.DateField(verbose_name='fecha')),
                ('start_time', models.TimeField(verbose_name='hora de inicio')),
                ('end_time', models.TimeField(blank=True, null=True, verbose_name='hora de finalización')),
                ('ritual_type', models.CharField(choices=[('regular', 'Tenida Regular'), ('initiation', 'Iniciación'), ('passing', 'Pase de Grado'), ('raising', 'Exaltación'), ('installation', 'Instalación de Oficiales'), ('special', 'Ceremonia Especial')], default='regular', max_length=20, verbose_name='tipo de ritual')),
                ('degree', models.PositiveSmallIntegerField(choices=[(1, 'Aprendiz'), (2, 'Compañero'), (3, 'Maestro')], default=1, verbose_name='grado')),
                ('status', models.CharField(choices=[('draft', 'Borrador'), ('approved', 'Aprobado'), ('completed', 'Completado'), ('cancelled', 'Cancelado')], default='draft', max_length=20, verbose_name='estado')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='fecha de creación')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='fecha de actualización')),
                ('approved_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='approved_ritual_plans', to=settings.AUTH_USER_MODEL, verbose_name='aprobado por')),
                ('created_by', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='created_ritual_plans', to=settings.AUTH_USER_MODEL, verbose_name='creado por')),
                ('event', models.OneToOneField(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='ritual_plan', to='communications.event', verbose_name='evento asociado')),
            ],
            options={
                'verbose_name': 'plan ritual',
                'verbose_name_plural': 'planes rituales',
                'ordering': ['-date', '-created_at'],
            },
        ),
        migrations.CreateModel(
            name='RitualMinutes',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('content', models.TextField(verbose_name='contenido')),
                ('attendance_count', models.PositiveIntegerField(default=0, verbose_name='número de asistentes')),
                ('visitors_count', models.PositiveIntegerField(default=0, verbose_name='número de visitantes')),
                ('status', models.CharField(choices=[('draft', 'Borrador'), ('finalized', 'Finalizada'), ('approved', 'Aprobada')], default='draft', max_length=20, verbose_name='estado')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='fecha de creación')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='fecha de actualización')),
                ('approved_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='approved_minutes', to=settings.AUTH_USER_MODEL, verbose_name='aprobada por')),
                ('created_by', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='created_minutes', to=settings.AUTH_USER_MODEL, verbose_name='creada por')),
                ('ritual_plan', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='minutes', to='rituals.ritualplan', verbose_name='plan ritual')),
            ],
            options={
                'verbose_name': 'acta ritual',
                'verbose_name_plural': 'actas rituales',
                'ordering': ['-created_at'],
            },
        ),
        migrations.CreateModel(
            name='RitualAttachment',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=200, verbose_name='título')),
                ('description', models.TextField(blank=True, verbose_name='descripción')),
                ('attachment_type', models.CharField(choices=[('lecture', 'Plancha'), ('ceremony_script', 'Guión de Ceremonia'), ('music', 'Música'), ('image', 'Imagen'), ('diagram', 'Diagrama'), ('other', 'Otro')], default='other', max_length=20, verbose_name='tipo de adjunto')),
                ('file', models.FileField(upload_to='ritual_attachments/', verbose_name='archivo')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='fecha de creación')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='fecha de actualización')),
                ('uploaded_by', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='uploaded_ritual_attachments', to=settings.AUTH_USER_MODEL, verbose_name='subido por')),
                ('ritual_plan', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='attachments', to='rituals.ritualplan', verbose_name='plan ritual')),
            ],
            options={
                'verbose_name': 'adjunto ritual',
                'verbose_name_plural': 'adjuntos rituales',
                'ordering': ['-created_at'],
            },
        ),
        migrations.CreateModel(
            name='RitualWork',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=200, verbose_name='título')),
                ('description', models.TextField(blank=True, verbose_name='descripción')),
                ('work_type', models.CharField(choices=[('lecture', 'Plancha'), ('ceremony', 'Ceremonia'), ('discussion', 'Discusión'), ('presentation', 'Presentación'), ('other', 'Otro')], default='lecture', max_length=20, verbose_name='tipo de trabajo')),
                ('estimated_duration', models.PositiveIntegerField(default=15, verbose_name='duración estimada (minutos)')),
                ('order', models.PositiveIntegerField(default=1, verbose_name='orden')),
                ('attachment', models.FileField(blank=True, null=True, upload_to='ritual_works/', verbose_name='adjunto')),
                ('status', models.CharField(choices=[('pending', 'Pendiente'), ('confirmed', 'Confirmado'), ('completed', 'Completado'), ('cancelled', 'Cancelado')], default='pending', max_length=20, verbose_name='estado')),
                ('responsible', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='ritual_works', to=settings.AUTH_USER_MODEL, verbose_name='responsable')),
                ('ritual_plan', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='works', to='rituals.ritualplan', verbose_name='plan ritual')),
            ],
            options={
                'verbose_name': 'trabajo ritual',
                'verbose_name_plural': 'trabajos rituales',
                'ordering': ['ritual_plan', 'order'],
            },
        ),
        migrations.CreateModel(
            name='RitualRole',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('role_type', models.CharField(choices=[('vm', 'Venerable Maestro'), ('pv', 'Primer Vigilante'), ('sv', 'Segundo Vigilante'), ('sec', 'Secretario'), ('tes', 'Tesorero'), ('pd', 'Primer Diácono'), ('sd', 'Segundo Diácono'), ('gi', 'Guarda Templo Interior'), ('gt', 'Guarda Templo Exterior'), ('cap', 'Capellán'), ('ora', 'Orador'), ('mce', 'Maestro de Ceremonias'), ('exp', 'Experto'), ('hos', 'Hospitalario'), ('mus', 'Músico'), ('other', 'Otro')], max_length=10, verbose_name='tipo de rol')),
                ('custom_role', models.CharField(blank=True, max_length=100, verbose_name='rol personalizado')),
                ('notes', models.TextField(blank=True, verbose_name='notas')),
                ('is_confirmed', models.BooleanField(default=False, verbose_name='confirmado')),
                ('assigned_to', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='ritual_roles', to=settings.AUTH_USER_MODEL, verbose_name='asignado a')),
                ('ritual_plan', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='roles', to='rituals.ritualplan', verbose_name='plan ritual')),
            ],
            options={
                'verbose_name': 'rol ritual',
                'verbose_name_plural': 'roles rituales',
                'ordering': ['ritual_plan', 'role_type'],
                'unique_together': {('ritual_plan', 'role_type')},
            },
        ),
    ]
