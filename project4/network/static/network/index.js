document.addEventListener('DOMContentLoaded', function () {
    
    show_posts("all", null, 1);
    
  
  });

  function show_profile(username) {
    show_posts('user', username, 1);
  }

  
  function show_posts(post_type, username, pageNumber){
    document.querySelector('#all-posts').style.display='block';
    currentUser = JSON.parse(document.getElementById('username').textContent);
    allPostHtml = '<div class="post-container">';
    
    if(post_type === "following") {
        document.querySelector('#page-title').textContent = 'Posts by users you folowed';
        requestUrl = 'posts?onlyFollowing="True"';
        
        if(pageNumber) {
            requestUrl += '&page=' + pageNumber;
        }
    } else if(post_type === "user") {
        document.querySelector('#page-title').textContent = username + "'s Posts";
        requestUrl = 'posts?username="' + username + '"';
        
        if(pageNumber) {
            requestUrl += '&page=' + pageNumber;
        }
    } else {
        document.querySelector('#page-title').textContent = 'All Posts';
        requestUrl = 'posts';

        if(pageNumber) {
            requestUrl += '?page=' + pageNumber;
        }
    }

    
    fetch(requestUrl)
    .then(response => response.json())
    .then(data => {
        data.forEach(post => {
            allPostHtml += `<div class="card">
                                <div class="card-body">
                                    <h5 class="card-title">${post.author}</h5>                                                               
                                    <p class="card-text">${post.content}</p>
                                    <p class="timestamp">${post.timestamp}</p>
                                    <p class="likes"><i data-feather="heart" color="red"></i> &nbsp${post.likes}</p>`;
            
            if(currentUser === post.author) {
                allPostHtml += `<p class="edit-button"><a href="#" class="btn btn-secondary"><i data-feather="edit" color="white"></i> &nbspEdit</a></p>
                                </div>
                            </div>
                `;
            } else {
                allPostHtml += `<p class="like-button"><a href="#" class="btn btn-primary"><i data-feather="thumbs-up" color="white"></i> &nbspLike</a></p>
                                </div>
                            </div>
                `;
            }
                                    
        })
        allPostHtml += '</div>';
        // Add post to DOM
        document.querySelector('#all-posts').innerHTML = allPostHtml;
        feather.replace();
    })



  }