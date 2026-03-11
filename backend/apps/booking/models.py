from django.db import models
from ..users.models import User
from ..services.models import Service
# Create your models here.

class Booking(models.Model):
    class BookingStatusChoices(models.TextChoices):
        PENDING='pending'
        CONFIRMED='confirmed'
        CANCELLED='cancelled'
        FAILED='failed'

    customer=models.ForeignKey(User,on_delete=models.CASCADE,related_name='bookings')
    service=models.ForeignKey(Service, on_delete=models.CASCADE,related_name='bookings')
    booking_date=models.DateTimeField()
    status=models.CharField(choices=BookingStatusChoices.choices,default=BookingStatusChoices.PENDING)
    address=models.CharField(max_length=100)


    def __str__(self):
        return f"{self.service.title} booked by {self.customer.username}"
    