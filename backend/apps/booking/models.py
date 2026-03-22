from django.db import models
from ..users.models import User
from ..services.models import Service
# Create your models here.

class Booking(models.Model):
    class BookingStatusChoices(models.TextChoices):
        PENDING='pending'
        CONFIRMED='confirmed'
        CANCELLED='cancelled'
        STARTED='started'
        COMPLETED='completed'

    class PaymentMethodChoices(models.TextChoices):
        ONLINE='online'
        CASH='cash'

    customer=models.ForeignKey(User,on_delete=models.CASCADE,related_name='bookings')
    service=models.ForeignKey(Service, on_delete=models.CASCADE,related_name='bookings')
    booking_date=models.DateTimeField()
    status=models.CharField(max_length=10,choices=BookingStatusChoices.choices,default=BookingStatusChoices.PENDING)
    address=models.CharField(max_length=100)
    arrival_otp=models.CharField(max_length=4,null=True)
    completion_otp=models.CharField(max_length=4,null=True,blank=True)
    created_at=models.DateTimeField(auto_now_add=True)
    payment_method=models.CharField(choices=PaymentMethodChoices.choices,default=PaymentMethodChoices.ONLINE)
    is_paid=models.BooleanField(default=False)
    amount=models.DecimalField(decimal_places=2,max_digits=10)

    def __str__(self):
        return f"{self.service.title} booked by {self.customer.username}"
    

class Payment(models.Model):
    payment_status=[
        ('initiated','INITIATED'),
        ('success','SUCCESS'),
        ('failed','FAILED')
    ]
    razorpay_order_id=models.CharField(max_length=100,unique=True)
    booking=models.ForeignKey(Booking,on_delete=models.CASCADE)
    razorpay_payment_id=models.CharField(max_length=100,blank=True,null=True)
    razorpay_signature=models.CharField(max_length=200,blank=True,null=True)
    amount=models.DecimalField(max_digits=10,decimal_places=2)
    status=models.CharField(max_length=20,choices=payment_status,default='initiated')
    created_at = models.DateTimeField(auto_now_add=True)
