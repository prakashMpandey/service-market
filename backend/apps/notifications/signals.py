from django.db.models.signals import post_save
from django.dispatch import receiver
from apps.booking.models import Booking
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from .models import Notification


@receiver(post_save,sender=Booking)
def send_booking_notification(sender,instance,created,**kwargs):
    if created :
        user_to_notify=instance.service.provider
        message=f"new booking arrived for {instance.service.title}"

        notification = Notification.objects.create(recipient=user_to_notify, message=message)

        channel_layer=get_channel_layer()
        group_name=f'user_{user_to_notify.id}'


        async_to_sync(channel_layer.group_send)(
            group_name, {
                "type": "send_notifications",
                "message": message,
                "notification_id": notification.id,
                "created_at": notification.created_at.isoformat(),
                'booking_id':instance.id
            }
        )

    else:
         if instance.status =='confirmed':
            user_to_notify=instance.customer
            message=f" booking confirmed by provider"
            notification = Notification.objects.create(recipient=user_to_notify, message=message)

            channel_layer=get_channel_layer()
            group_name=f'user_{user_to_notify.id}'


            async_to_sync(channel_layer.group_send)(
                group_name, {
                    "type": "send_notifications",
                    "message": message,
                    "notification_id": notification.id,
                    "created_at": notification.created_at.isoformat(),
                    'booking_id':instance.id
                }
            )

