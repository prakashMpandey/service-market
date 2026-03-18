from celery import shared_task
from django.core.mail import EmailMessage
from django.conf import settings
from .models import User
from django.template.loader import render_to_string

# (bind=True,autoretry_for=(Exception,),retry_backoff=True,max_retries=3)

@shared_task
def send_welcome_email(user_id):
    user=User.objects.filter(pk=user_id).first()

    if not user:
        return "user not found"
    print(user)
    subject='welcome to our service marketplace'
   
    html_message=render_to_string('welcome_email.html')
    email = EmailMessage(
        subject,
        html_message,
        settings.DEFAULT_FROM_EMAIL,
        [user.email],
    )

    email.content_subtype='html'
    return email.send()