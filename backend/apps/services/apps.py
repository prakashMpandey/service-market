from django.apps import AppConfig


class ServicesConfig(AppConfig):
    name = 'apps.services'
    def ready(self):
        from . import signals