from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import MinValueValidator, MaxValueValidator

# Create your models here.

class User(AbstractUser):
    class RoleChoiceField(models.TextChoices):
        PROVIDER='provider'
        CUSTOMER='customer'

    role=models.CharField(max_length=10,choices=RoleChoiceField.choices,default=RoleChoiceField.CUSTOMER)
    phone=models.CharField(max_length=13)
    latitude=models.DecimalField(max_digits=9,decimal_places=6,null=True,blank=True)
    longitude=models.DecimalField(max_digits=9,decimal_places=6,null=True,blank=True)
    radius=models.PositiveIntegerField(validators=[MinValueValidator(1),MaxValueValidator(50)],null=True,blank=True)
    profile_photo=models.ImageField(upload_to='uploads/',null=True,blank=True)
    


