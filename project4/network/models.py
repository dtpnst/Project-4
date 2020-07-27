from django.contrib.auth.models import AbstractUser
from django.db import models
from django.core.serializers import serialize


class User(AbstractUser):
    followers = models.ManyToManyField('self',
                                       symmetrical=False,
                                       related_name="userFollowers")
    following = models.ManyToManyField('self',
                                       symmetrical=False,
                                       related_name="userFollowing")

    def serialize(self):
        return {
            "numFollowing": self.following.count(),
            "numFollowers": self.followers.count(),
            "following": serialize("json",
                                   self.following.all(),
                                   fields=["username"]),
            "followers": serialize("json",
                                   self.followers.all(),
                                   fields=["username"])
        }


class Post(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        null=True,
        related_name="poster")
    content = models.CharField(max_length=255)
    timestamp = models.DateTimeField(auto_now_add=True)
    likes = models.IntegerField(default=0)
    likedBy = models.ManyToManyField(User, related_name="likedBy")

    def serialize(self):
        return {
            "id": self.id,
            "author": self.user.username,
            "content": self.content,
            "timestamp": self.timestamp.strftime("%b %-d %Y, %-I:%M %p"),
            "likes": self.likes,
            "likedBy": serialize(
                "json",
                self.likedBy.all(),
                fields=["username"])
        }
