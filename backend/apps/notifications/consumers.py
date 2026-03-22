from channels.generic.websocket import WebsocketConsumer
from asgiref.sync import async_to_sync
import json

class NotificationConsumer(WebsocketConsumer):

    def connect(self):
        user = self.scope.get('user')

        # Reject connection if user is not authenticated
        if not user or user.is_anonymous:
            self.close()
            return

        self.user_id = user.id
        self.room_group_name = f"user_{self.user_id}"

        async_to_sync(self.channel_layer.group_add)(
            self.room_group_name, self.channel_name
        )

        self.accept()


    def disconnect(self, close_code):
        if hasattr(self, 'room_group_name'):
            async_to_sync(self.channel_layer.group_discard)(
                self.room_group_name, self.channel_name
            )

    def send_notifications(self, event):
        message = event['message']
        notification_id = event.get('notification_id')
        created_at = event.get('created_at')

        self.send(text_data=json.dumps({
            "message": message,
            "notification_id": notification_id,
            "created_at": created_at
        }))
