from django_filters import FilterSet
from .models import Service
class ServiceFilter(FilterSet):
    class Meta:
        model=Service
        fields={
            'price':['lt','gt','range'],
            'category':['exact']
        }