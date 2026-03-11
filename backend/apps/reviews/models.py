from django.db import models
from ..users.models import User
from ..services.models import Service
from django.core.validators import MinValueValidator,MaxValueValidator
# Create your models here.

class Review(models.Model):
    user=models.ForeignKey(User,on_delete=models.CASCADE,related_name='reviews')
    service=models.ForeignKey(Service,on_delete=models.CASCADE,related_name='reviews')
    comment=models.TextField(max_length=200)
    rating=models.PositiveIntegerField(validators=[MinValueValidator(1),MaxValueValidator(5)])