from django.db import models
from apps.users.models import User
# Create your models here.


class Notification(models.Model):
    recipient=models.ForeignKey(User,on_delete=models.CASCADE)
    message=models.TextField(max_length=200)
    is_read=models.BooleanField(default=False)
    created_at=models.DateTimeField(auto_now_add=True)
    
