import json
from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import render
from django.urls import reverse
from django.core.paginator import Paginator

from .models import User, Post


def index(request):
    return render(request, "network/index.html")


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")

def profile(request, username):
    if request.method != "GET":
        return JsonResponse({"error": "GET request required."}, status=400) 
    
    user = User.objects.get(username=username)

    return JsonResponse(user.serialize(), safe=False)

def follow(request, username):
    if request.method != "PUT":
        return JsonResponse({"error": "PUT request required."}, status=400) 
    
    try:
        userToFollow = User.objects.get(username=username)
    except User.DoesNotExist:
        return JsonResponse({"error": "User not found."}, status=404)

    user = request.user
    
    if user in userToFollow.followers.all():
        return JsonResponse({"error": "Current user is already following this user"}, status=400) 

    userToFollow.followers.add(user)
    userToFollow.save()

    user.following.add(userToFollow)
    user.save()

    return JsonResponse({"message": "Users updated successfully."}, status=201)

def unfollow(request, username):
    if request.method != "PUT":
        return JsonResponse({"error": "PUT request required."}, status=400) 
    
    try:
        userToUnfollow = User.objects.get(username=username)
    except User.DoesNotExist:
        return JsonResponse({"error": "User not found."}, status=404)

    user = request.user
    
    if user not in userToUnfollow.followers.all():
        return JsonResponse({"error": "Current user is not following this user"}, status=400) 

    userToUnfollow.followers.remove(user)
    userToUnfollow.save()

    user.following.remove(userToUnfollow)
    user.save()

    return JsonResponse({"message": "Users updated successfully."}, status=201)

# POST/GET All endpoint for posts
def posts(request):

    if request.method == "POST":

        data = json.loads(request.body)

        content = data.get("content")

        post = Post(user=request.user, content=content)

        post.save()

        return JsonResponse({"message": "Post created successfully."}, status=201)
    
    if request.method == "GET":
        onlyFollowing = request.GET.get('onlyFollowing')
        onlyUser = request.GET.get('username')
        page_number = request.GET.get('page')

        postList = Post.objects.all()

        if onlyFollowing is not None and onlyFollowing == 'True':
            following = request.user.following.all()
            postList = Post.objects.filter(user__in=following)
        
        if onlyUser is not None:
            requestedUser = User.objects.get(username=onlyUser)
            postList = Post.objects.filter(user=requestedUser)

        postList = postList.order_by("-timestamp").all()

        
        paginator = Paginator(postList, 10)
        postsToReturn = paginator.get_page(page_number)

        return JsonResponse({"data": [post.serialize() for post in postsToReturn],
                             "num_pages": paginator.num_pages}, safe=False)

    else:
        return JsonResponse({"error": "POST or GET request required."}, status=400) 


# PUT endpoint for individual post
def post(request, post_id):
    if request.method != "PUT":
        return JsonResponse({"error": "PUT request required."}, status=400) 
    
    try:
        post = Post.objects.get(user=request.user, pk=post_id)
    except Post.DoesNotExist:
        return JsonResponse({"error": "Post not found."}, status=404)

    data = json.loads(request.body)
    content = data.get("content")

    post.content = content
    post.save()

    return JsonResponse({"message": "Post updated successfully."}, status=201)


def likePost(request, post_id):
    if request.method != "PUT":
        return JsonResponse({"error": "PUT request required."}, status=400) 
    
    try:
        post = Post.objects.get(pk=post_id)
    except Post.DoesNotExist:
        return JsonResponse({"error": "Post not found."}, status=404)

    user = request.user
    
    if user in post.likedBy.all():
        return JsonResponse({"error": "User already liked this post"}, status=400) 

    post.likes += 1
    post.likedBy.add(user)
    post.save()

    return JsonResponse({"message": "Post updated successfully."}, status=201)


def unlikePost(request, post_id):
    if request.method != "PUT":
        return JsonResponse({"error": "PUT request required."}, status=400) 
    
    try:
        post = Post.objects.get(pk=post_id)
    except Post.DoesNotExist:
        return JsonResponse({"error": "Post not found."}, status=404)

    user = request.user
    
    if user not in post.likedBy.all():
        return JsonResponse({"error": "User already unliked this post"}, status=400) 

    post.likes -= 1
    post.likedBy.remove(user)
    post.save()

    return JsonResponse({"message": "Post updated successfully."}, status=201)

# Load Profile Page
