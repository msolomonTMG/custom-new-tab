var hnHelpers = {
  lastStoryIndex: 6,
  makeHackerNewsRequest: function(uri) {
    return new Promise(function(resolve, reject) {

      fetch(`https://hacker-news.firebaseio.com/v0/${uri}.json?print=pretty`)
      .then(response => {
        return resolve(response.json())
      })
      .catch(err => {
        return reject(err)
      })

    });
  },
  appendStoriesToList: function(stories) {
    return new Promise(function(resolve, reject) {

      stories.forEach((storyId, index) => {

        hnHelpers.makeHackerNewsRequest(`item/${storyId}`)
        .then(story => {
          let time = hnHelpers.timeSince(story.time)
          
          // if there is no story url, it is hosted on ycombinator
          if (!story.url) {
            story.url = `https://news.ycombinator.com/item?id=${storyId}`
          }
          
          let storyDomain = story.url.split('//')[1].split(/\//)[0]
          $('#hacker-news-stories').append(`
            <div class="row">
              <div class="col-xs-12">
                <p class="mb-0">
                  <strong><a class="white" href="${story.url}">${story.title}</a></strong><br/>
                  <small>
                    <span class="pink">${story.score} points</span><span class="grey"> by ${story.by} ${time} ago on <a href="${story.url}" class="yellow">${storyDomain}</a> |</span>
                    <a class="white" href="https://news.ycombinator.com/item?id=${story.id}"><span class="blue">Comments: ${story.descendants}</span></a></small>
                </p>
              </div>
            </div>
          `)

          if (stories.length === index + 1) {
            return resolve(true)
          }
        })
      })
    });
  },
  timeSince: function(date) {
    var seconds = Math.floor(Date.now()/1000 - date);
    var interval = Math.floor(seconds / 31536000);

    if (interval > 1) {
      return interval + " years";
    }
    interval = Math.floor(seconds / 2592000);
    if (interval > 1) {
      return interval + " months";
    }
    interval = Math.floor(seconds / 86400);
    if (interval > 1) {
      return interval + " days";
    }
    interval = Math.floor(seconds / 3600);
    if (interval > 1) {
      return interval + " hours";
    }
    interval = Math.floor(seconds / 60);
    if (interval > 1) {
      return interval + " minutes";
    }
    return Math.floor(seconds) + " seconds";
  }

}

var hackerNews = {
  getTopStories: function() {
    return new Promise(function(resolve, reject) {
      hnHelpers.makeHackerNewsRequest('topstories')
      .then((topstories) => {
        let stories = topstories.slice(0,hnHelpers.lastStoryIndex-1)
        hnHelpers.appendStoriesToList(stories)
          .then(success => {
            $('#hacker-news-wrapper').append(`
              <div class="row">
                <a id="moreHackerNews" href="#" class="grey">
                  <i data-feather="more-horizontal" class="pr-1"></i>More
                </a>
              </div>
            `)
            feather.replace()
            $('#moreHackerNews').on('click', function(e) {
              e.preventDefault();
              hnHelpers.appendStoriesToList(topstories.slice(hnHelpers.lastStoryIndex, hnHelpers.lastStoryIndex * 2))
              hnHelpers.lastStoryIndex += hnHelpers.lastStoryIndex
            })
          })
      })

    });
  }

}

function initHackerNews() {
  hackerNews.getTopStories()
}
