from django.db import models
from django.contrib.auth.models import AbstractUser
# Create your models here.

class User(AbstractUser):
    class RoleChoiceField(models.TextChoices):
        PROVIDER='provider'
        CUSTOMER='customer'

    role=models.CharField(max_length=10,choices=RoleChoiceField.choices,default=RoleChoiceField.CUSTOMER)
    location=models.TextField(max_length=250)
    phone=models.CharField(max_length=13)


