from django.db.models.signals import post_save,post_delete
from django.dispatch import receiver
from .models import Service
from django.core.cache import cache
from django_redis import get_redis_connection
@receiver([post_save,post_delete],sender=Service)
def invalidate_service_cache(sender,instance,**kwargs):
    # con = get_redis_connection("default")
    cache.delete_pattern("*public_list*")
    # count = con.delete_pattern("*public_list*")
    # print(f"Deleted {count} keys matching pattern: {"*public_list*"}")