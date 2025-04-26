from django.contrib.auth.mixins import LoginRequiredMixin, UserPassesTestMixin
from django.views.generic import View

class MasonicDegreeRequiredMixin(LoginRequiredMixin, UserPassesTestMixin):
    """
    Mixin para requerir un grado masónico mínimo para acceder a una vista.
    """
    required_degree = 1  # Por defecto, requiere al menos ser Aprendiz
    
    def test_func(self):
        return self.request.user.degree >= self.required_degree

class FellowCraftRequiredMixin(MasonicDegreeRequiredMixin):
    """
    Mixin para requerir al menos el grado de Compañero.
    """
    required_degree = 2

class MasterMasonRequiredMixin(MasonicDegreeRequiredMixin):
    """
    Mixin para requerir el grado de Maestro.
    """
    required_degree = 3

class OfficerRequiredMixin(LoginRequiredMixin, UserPassesTestMixin):
    """
    Mixin para requerir que el usuario tenga un cargo oficial.
    """
    def test_func(self):
        return self.request.user.is_officer()

class SpecificOfficerRequiredMixin(LoginRequiredMixin, UserPassesTestMixin):
    """
    Mixin para requerir un cargo oficial específico.
    """
    required_roles = []  # Lista de roles permitidos (códigos)
    
    def test_func(self):
        if not self.request.user.is_officer():
            return False
        return self.request.user.officer_role.role in self.required_roles

class WorshipfulMasterRequiredMixin(SpecificOfficerRequiredMixin):
    """
    Mixin para requerir el cargo de Venerable Maestro.
    """
    required_roles = ['VM']

class WardenRequiredMixin(SpecificOfficerRequiredMixin):
    """
    Mixin para requerir el cargo de Primer o Segundo Vigilante.
    """
    required_roles = ['PV', 'SV']

class SecretaryRequiredMixin(SpecificOfficerRequiredMixin):
    """
    Mixin para requerir el cargo de Secretario.
    """
    required_roles = ['SEC']

class TreasurerRequiredMixin(SpecificOfficerRequiredMixin):
    """
    Mixin para requerir el cargo de Tesorero.
    """
    required_roles = ['TES']
