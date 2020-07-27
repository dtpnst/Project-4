var pageCount = 1;

document.addEventListener('DOMContentLoaded', function () {
    
    show_posts("all", null, 1);
    
  
  });

  function show_profile(username) {
    show_posts('user', username, 1);
    currentUser = JSON.parse(document.getElementById('username').textContent);

    fetch('/profile/' + username)
    .then(response => response.json())
    .then(data => {

        if(currentUser === username) {
            document.querySelector('#profile-info').innerHTML = `
            <span id="numFollowers"><b>Followers:</b> ${data.numFollowers}&nbsp</span>
            <span id="numFollowing"><b>Following:</b> ${data.numFollowing}</span>
            `;
        }
        else {
            if(data.followers.includes(currentUser)){
                document.querySelector('#profile-info').innerHTML = `
                 <button type="button" class="btn-sm btn-secondary" onclick="unfollow('${username}')">Unfollow</button>`;
            } else {
                document.querySelector('#profile-info').innerHTML = `
                 <button type="button" class="btn-sm btn-success" onclick="follow('${username}')">Follow</button>`;
            }
            

            document.querySelector('#profile-info').innerHTML += `
            <span id="numFollowers"><b>Followers:</b> ${data.numFollowers}&nbsp</span>
            <span id="numFollowing"><b>Following:</b> ${data.numFollowing}</span>
            
            `;
        }
        
    });
  }

  function follow(username) {
    token = document.getElementsByName("csrfmiddlewaretoken")[0].value;
    fetch('/follow/' + username, {
        method: 'PUT',
        headers: {
          "X-CSRFToken": token
        }
      })
        .then(response => response.json())
        .then(function (data) {
          console.log('Request succeeded with JSON response', data);
          show_profile(username);
        })
        .catch(function (error) {
          console.log('Request failed', error);
        });
  }

  function unfollow(username) {
    token = document.getElementsByName("csrfmiddlewaretoken")[0].value;
    fetch('/unfollow/' + username, {
        method: 'PUT',
        headers: {
          "X-CSRFToken": token
        }
      })
        .then(response => response.json())
        .then(function (data) {
          console.log('Request succeeded with JSON response', data);
          show_profile(username);
        })
        .catch(function (error) {
          console.log('Request failed', error);
        });
  }

  function create_post(event) {
    event.preventDefault();
    token = document.getElementsByName("csrfmiddlewaretoken")[0].value;
    fetch('/posts', {
        method: 'POST',
        headers: {
          "Content-type": "application/json;",
          "X-CSRFToken": token
        },
        body: JSON.stringify({
          content: document.querySelector('#compose-body').value
        })
        
      })
        .then(response => response.json())
        .then(function (data) {
          console.log('Request succeeded with JSON response', data);
          show_posts("all", null, 1);
          document.querySelector('#compose-body').value = "";
        })
        .catch(function (error) {
          console.log('Request failed', error);
        });
  }

  function edit_post(post_id) {
    document.querySelector('#content-' + post_id).style.display='none';
    document.querySelector('#edit-post-' + post_id).style.display='block';
    document.querySelector('#edit-button-' + post_id).style.display='none';
    document.querySelector('#save-button-' + post_id).style.display='block';
  }

  function save_post(post_id) {
    token = document.getElementsByName("csrfmiddlewaretoken")[0].value;
    fetch('/posts/' + post_id, {
        method: 'PUT',
        headers: {
          "Content-type": "application/json;",
          "X-CSRFToken": token
        },
        body: JSON.stringify({
          content: document.querySelector('#edit-body-' + post_id).value
        })
        
      })
        .then(response => response.json())
        .then(function (data) {
          console.log('Request succeeded with JSON response', data);
          show_posts("all", null, 1);
        })
        .catch(function (error) {
          console.log('Request failed', error);
        });
  }

  
  function show_posts(post_type, username, pageNumber){
    document.querySelector('#all-posts').style.display='block';
    currentUser = JSON.parse(document.getElementById('username').textContent);
    allPostHtml = '<div class="row">';
    document.querySelector('#profile-info').style.display='none';
    if(post_type === "following") {
        document.querySelector('#page-title').textContent = 'Posts by users you folowed';
        requestUrl = 'posts?onlyFollowing=True';
        
        if(pageNumber) {
            requestUrl += '&page=' + pageNumber;
        } else {
            pageNumnber = 1;
        }
    } else if(post_type === "user") {
        document.querySelector('#profile-info').style.display='block';
        document.querySelector('#page-title').textContent = username + "'s Posts";
        requestUrl = 'posts?username=' + username + '';
        
        if(pageNumber) {
            requestUrl += '&page=' + pageNumber;
        } else {
            pageNumnber = 1;
        }
    } else {
        document.querySelector('#page-title').textContent = 'All Posts';
        requestUrl = 'posts';

        if(pageNumber) {
            requestUrl += '?page=' + pageNumber;
        } else {
            pageNumnber = 1;
        }
    }

    
    fetch(requestUrl)
    .then(response => response.json())
    .then(data => {
        if(data.data.length === 0) {
            allPostHtml += `<p><i data-feather="frown" width="100" height="100"></i></p>
                            <p class="card-text">No Posts Found</p>
                            `;
        }
        
        data.data.forEach(post => {
            allPostHtml += `<div class="card col-3">
                                <div class="card-body">
                                    <h5 class="card-title" onclick="show_profile('${post.author}')">${post.author}</h5>                                                               
                                    <p class="card-text" id="content-${post.id}">${post.content}</p>
                                    <div id="edit-post-${post.id}" style="display:none">
                                    <textarea type="textinput" class="form-control" id="edit-body-${post.id}">${post.content}</textarea>
                                    </div>
                                    <p class="timestamp">${post.timestamp}</p>
                                    <p class="likes"><i data-feather="heart" color="red"></i> &nbsp${post.likes}</p>`;
            
            if(currentUser === post.author) {
                allPostHtml += `<p class="edit-button" id="edit-button-${post.id}"><a href="#" onclick="edit_post(${post.id});" class="btn btn-secondary"><i data-feather="edit" color="white"></i> &nbspEdit</a></p>
                <p class="edit-button" id="save-button-${post.id}" style="display:none"><a href="#" onclick="save_post(${post.id});" class="btn btn-primary"><i data-feather="save" color="white"></i> &nbspSave</a></p>
                                </div>
                            </div>
                `;
            } else {
                if(post.likedBy.includes(currentUser)) {
                    allPostHtml += `<p class="unlike-button"><a href="#" onclick="unlike(${post.id}, '${post_type}', ${pageNumber}, '${username}')" class="btn btn-secondary"><i data-feather="thumbs-down" color="white"></i> &nbspUnlike</a></p>
                                </div>
                            </div>
                    `;
                } else {
                    allPostHtml += `<p class="like-button"><a href="#" onclick="like(${post.id}, '${post_type}', ${pageNumber}, '${username}')"  class="btn btn-primary"><i data-feather="thumbs-up" color="white"></i> &nbspLike</a></p>
                                </div>
                            </div>
                    `;
                }
                
            }
                                    
        })
        allPostHtml += '</div>';

        pageCount = data.num_pages;
        allPostHtml += `<nav id="pagination-nav">
                            <ul class="pagination justify-content-center">`;
        var i;
        for(i=1; i <= pageCount; i++) {
            if(i == pageNumber) {
                allPostHtml += `<li class="page-item active"><a class="page-link" href="#" onclick="show_posts('${post_type}', '${username}', ${i})">${i}</a></li>`
            } else {
                allPostHtml += `<li class="page-item"><a class="page-link" href="#" onclick="show_posts('${post_type}', '${username}', ${i})">${i}</a></li>`
            }
            
        }

        allPostHtml +=      `</ul>
                        </nav>`;
        

        // Add post to DOM
        document.querySelector('#all-posts').innerHTML = allPostHtml;
        feather.replace();
    })
  }

  function like(post_id, post_type, pageNumber, username) {
    if(post_type === 'null') {
        post_type = null;
    }
    if(pageNumber === 'null') {
        pageNumber = 1;
    }
    if(username === 'null') {
        username = null;
    }
    token = document.getElementsByName("csrfmiddlewaretoken")[0].value;
    fetch('/likePost/' + post_id, {
        method: 'PUT',
        headers: {
          "X-CSRFToken": token
        }
      })
        .then(response => response.json())
        .then(function (data) {
          console.log('Request succeeded with JSON response', data);
          show_posts(post_type, username, pageNumber);
        })
        .catch(function (error) {
          console.log('Request failed', error);
        });
  }

  function unlike(post_id, post_type, pageNumber, username) {
    if(post_type === 'null') {
        post_type = null;
    }
    if(pageNumber === 'null') {
        pageNumber = 1;
    }
    if(username === 'null') {
        username = null;
    }
    token = document.getElementsByName("csrfmiddlewaretoken")[0].value;
    fetch('/unlikePost/' + post_id, {
        method: 'PUT',
        headers: {
          "X-CSRFToken": token
        }
      })
        .then(response => response.json())
        .then(function (data) {
          console.log('Request succeeded with JSON response', data);
          show_posts(post_type, username, pageNumber);
        })
        .catch(function (error) {
          console.log('Request failed', error);
        });
  }