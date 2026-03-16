from django.db import models
from ..users.models import User
# Create your models here.


class ServiceCategory(models.Model):
    name=models.CharField(max_length=50,unique=True)
    def __str__(self):
        return f"{self.name}"
    # description=models.TextField(max_length=5)

class Service(models.Model):
    provider=models.ForeignKey(User,on_delete=models.CASCADE,related_name='services')
    title=models.CharField(max_length=60)
    description=models.TextField(max_length=250,default='')
    price=models.DecimalField(max_digits=10,decimal_places=2)
    category=models.ForeignKey(ServiceCategory,on_delete=models.SET_NULL,null=True)
    location=models.CharField(max_length=100)
    image=models.ImageField(upload_to='uploads/',null=True,blank=True)
    created_at=models.DateTimeField(auto_now_add=True)
    

    def __str__(self):
        return f"{self.title}"
