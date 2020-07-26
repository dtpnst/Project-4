from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    pass

class Post(models.Model):
    user = models.ForeignKey('User', on_delete=models.CASCADE, null=True)
    content = models.CharField(max_length=255)
    timestamp = models.DateTimeField(auto_now_add=True)
    like = models.IntegerField()

    def serialize(self):
        return {
            "id": self.id,
            "user": self.user,
            "content": self.content,
            "timestamp": self.timestamp.strftime("%b %-d %Y, %-I:%M %p"),
            "like": self.like
        }