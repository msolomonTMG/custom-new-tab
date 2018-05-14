let productHuntKey = ''

var phHelpers = {
  lastPostIndex: 6,
  getApiKey: function() {
    return new Promise(function(resolve, reject) {
      chrome.storage.sync.get({
        productHuntKey: false,
      }, function(items) {
        if (items.productHuntKey) {
          return resolve(items.productHuntKey)
        } else {
          return reject({
            error: {
              code: 1,
              message: 'No Product Hunt Key'
            }
          })
        }
      })
    });
  },
  makeProductHuntRequest: function(uri) {
    return new Promise(function(resolve, reject) {
      console.log('MAKING REQ')
      fetch(`https://api.producthunt.com/v1/${uri}`, {
        headers: {
          'Authorization': `Bearer ${productHuntKey}`, 
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Host': 'api.producthunt.com'
        },
      })
      .then(response => {
        return resolve(response.json())
      })
      .catch(err => {
        console.warn(err)
        return reject(err)
      })
      
    });
  },
  appendPostsToList: function(posts) {
    return new Promise(function(resolve, reject) {
      
      posts.forEach((post, index) => {
        //let time = hnHelpers.timeSince(post.time)
        $('#product-hunt-posts').append(`
          <div class="row">
            <div class="col-xs-12">
              <p class="mb-0">
                <strong><a class="white" href="${post.redirect_url}">${post.name}</a></strong><br/>
                <small>
                  <span class="yellow">${post.tagline}</span><br/>
                  <span class="pink">${post.votes_count} upvotes</span><span class="grey"> by ${post.user.name}  |</span>
                  <a class="white" href="${post.discussion_url}"><span class="blue">Comments: ${post.comments_count}</span></a></small>
              </p>
            </div>
          </div>
        `)
        
        if (posts.length === index + 1) {
          return resolve(true)
        }
      })
    }) 
  } 
}

var productHunt = {
  getPosts: function() {
    return new Promise(function(resolve, reject) {
      
      phHelpers.makeProductHuntRequest('me/feed')
      .then(response => {
        let posts = response.posts.slice(0,phHelpers.lastPostIndex-1)
        
          phHelpers.appendPostsToList(posts)
          .then(success => {
            $('#product-hunt-wrapper').append(`
              <div class="row">
                <a id="moreProductHunt" href="#" class="grey">
                  <i data-feather="more-horizontal" class="pr-1"></i>More
                </a>
              </div>
            `)
            feather.replace()
            $('#moreProductHunt').on('click', function(e) {
              e.preventDefault();
              phHelpers.appendPostsToList(response.posts.slice(phHelpers.lastPostIndex, phHelpers.lastPostIndex * 2))
              phHelpers.lastPostIndex += phHelpers.lastPostIndex
            })
          })
          
        })
    })  
  }
}

function initProductHunt() {
  phHelpers.getApiKey()
  .then(apiKey => {
    productHuntKey = apiKey
    productHunt.getPosts()
  })
}
