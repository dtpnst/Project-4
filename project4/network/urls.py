
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),

    #API Routes
    path("posts", views.posts, name="posts"),
    path("posts/<int:post_id>", views.post, name="post"),
    path("likePost/<int:post_id>", views.likePost, name="likePost"),
    path("unlikePost/<int:post_id>", views.unlikePost, name="unlikePost"),
    path("profile/<str:username>", views.profile, name="profile"),
    path("follow/<str:username>", views.follow, name="follow"),
    path("unfollow/<str:username>", views.unfollow, name="unfollow")
]
