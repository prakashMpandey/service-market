from celery import shared_task
from django.core.mail import EmailMessage
from django.conf import settings
from .models import User
from django.template.loader import render_to_string
from .models import Booking


@shared_task
def send_booking_confirm(booking_id):

    booking=Booking.objects.filter(pk=booking_id).first()
    
    context = {
        'booking_id': booking.id,
        'service_title': booking.service.title,
        'booking_date': booking.booking_date.strftime('%d %b %Y'),
        'arrival_otp': booking.arrival_otp,
    }
    html_message = render_to_string(template_name="send_confirmation_email.html", context=context)
    subject="booking confirmation email"

    email=EmailMessage(
        subject,
        html_message,
        settings.DEFAULT_FROM_EMAIL,
        ['ashritapandey685@gmail.com'],
    )
    email.content_subtype='html'
    email.send()
