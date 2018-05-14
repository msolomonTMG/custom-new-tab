var trelloSettings = {
  key: '',
  token: '',
  boardId: '',
  showDescriptions: ''
}

var trelloHelpers = {
  makeTrelloRequest: function(method, uri, queryParams) {
    return new Promise(function(resolve, reject) {

      // queryParams should be a string like this: key1=value1&key2=value2
      let params = `key=${trelloSettings.key}&token=${trelloSettings.token}&${queryParams}`

      fetch(`https://api.trello.com/1/${uri}?${params}`, {
        method: method
      })
      .then(response => {
        return resolve(response.json())
      })
      .catch(err => {
        return reject(err)
      })

    })
  },
  makeTrelloRequestWithCustomCredentials: function(key, token, method, uri) {
    return new Promise(function(resolve, reject) {

      // queryParams should be a string like this: key1=value1&key2=value2
      let params = `key=${key}&token=${token}`

      fetch(`https://api.trello.com/1/${uri}?${params}`, {
        method: method
      })
      .then(response => {
        if (response.status == 401) {
          return reject(response)
        } else {
          console.log(response)
          return resolve(response.json())
        }
      })
      .catch(err => {
        console.log(err)
        return reject(err)
      })

    });
  },
  getSettings: function() {
    return new Promise(function(resolve, reject) {

      chrome.storage.sync.get({
        trelloKey: false,
        trelloToken: false,
        trelloBoardId: false,
        trelloShowCardDescription: false
      }, function(items) {
        
        if (!items.trelloKey && !items.trelloToken && !items.boardId) {
          return reject({
            error: {
              code: 1,
              message: 'Trello is not setup'
            }
          })
        } else if (!items.trelloKey) {
          return reject({
            error: {
              code: 2,
              message: 'Trello key is missing'
            }
          })
        } else if (!items.trelloToken) {
          return reject({
            error: {
              code: 3,
              message: 'Trello token is missing'
            }
          })
        } else if (!items.trelloBoardId) {
          return reject({
            error: {
              code: 4,
              message: 'Trello board is missing'
            }
          })
        } else {
          return resolve({
            key: items.trelloKey,
            token: items.trelloToken,
            boardId: items.trelloBoardId,
            showDescriptions: items.trelloShowCardDescription
          })
        }
      });

    });
  }
}

var trello = {
  testSettings: function(key, token, boardId) {
    // test the key, token, and board by making an api call for the board
    // with the inputted key and token
    return new Promise(function(resolve, reject) {

      trelloHelpers.makeTrelloRequestWithCustomCredentials(key, token, 'get', `boards/${boardId}`)
        .then(success => {
          return resolve(success)
        })
        .catch(err => {
          return reject(err)
        })

    });
  },
  getLists: function(boardId) {
    return new Promise(function(resolve, reject) {

      trelloHelpers.makeTrelloRequest('get', `boards/${boardId}/lists`)
        .then(lists => {
          return resolve(lists)
        })
        .catch(err => {
          console.warn(err)
        })

    });
  },
  archiveAllCardsInList: function(listId) {
    return new Promise(function(resolve, reject) {

      trelloHelpers.makeTrelloRequest('post', `lists/${listId}/archiveAllCards`)
        .then(success => {
          return resolve(success)
        })
        .catch(err => {
          console.warn(err)
          return reject(err)
        })

    });
  },
  getCards: function(listId) {
    return new Promise(function(resolve, reject) {

      trelloHelpers.makeTrelloRequest('get', `lists/${listId}/cards`)
        .then(cards => {
          return resolve(cards)
        })
        .catch(err => {
          console.warn(err)
        })

    });
  },
  getCard: function(cardId) {
    return new Promise(function(resolve, reject) {

      trelloHelpers.makeTrelloRequest('get', `cards/${cardId}`)
        .then(card => {
          return resolve(card)
        })
        .catch(err => {
          console.warn(err)
          return reject(card)
        })

    });
  },
  updateCardPosition: function(cardId, position) {
    return new Promise(function(resolve, reject) {

      trelloHelpers.makeTrelloRequest('put', `cards/${cardId}`, `pos=${position}`)
        .then(success => {
          return resolve(success)
        })
        .catch(err => {
          console.warn(err)
          return reject(err)
        })
    });
  },
  moveCard: function(cardId, newListId) {
    return new Promise(function(resolve, reject) {

      trelloHelpers.makeTrelloRequest('put', `cards/${cardId}`, `idList=${newListId}`)
        .then(success => {
          return resolve(success)
        })
        .catch(err => {
          console.warn(err)
        })

    });
  },
  createCard: function(name, desc, listId) {
    return new Promise(function(resolve, reject) {

      trelloHelpers.makeTrelloRequest('post', `cards`, `name=${name}&desc=${desc}&idList=${listId}`)
        .then(success => {
          return resolve(success)
        })
        .catch(err => {
          console.warn(err)
        })

    });
  }
}

function initTrello() {
  trelloHelpers.getSettings()
  .then(settings => {
    
    // assign values to global vars
    trelloSettings.key = settings.key
    trelloSettings.token = settings.token
    trelloSettings.boardId = settings.boardId
    trelloSettings.showDescriptions = settings.showDescriptions

    trello.getLists(trelloSettings.boardId).then(lists => {
      lists.forEach((list, index) => {
        $('#trello-columns').append(`
          <div id="${list.id}" class="col list">
            <h4 class="green">${list.name}</h4>
          </div>`
        )

        //add a create card button to first list
        if (index === 0) {
          $(`#${list.id}`).find('h4').append(`
            <a href="#" data-toggle="modal" data-target="#createCardModal">
              <i data-feather="plus-circle"></i>
            </a>`
          )

          $('#create-card').on('click', function(e) {
            e.preventDefault();
            let name = $('#card-name').val();
            let desc = $('#card-description').val();

            trello.createCard(name, desc, list.id)
              .then(card => {
                $('#trello-columns').empty();
                initTrello();
              })
              .catch(err => {
                console.log(err)
              })
          })

          feather.replace()
        } else if (index +1 === lists.length) {
          // add an archive-all-cards button to last list
          $(`#${list.id}`).find('h4').append(`
            <a href="#" class="grey" data-toggle="modal" data-target="#archiveAllCardsInListModal">
              <i data-feather="archive"></i>
            </a>`
          )

          $('#archive-all-cards-in-list').on('click', function(e) {
            e.preventDefault();

            trello.archiveAllCardsInList(list.id)
              .then(card => {
                $('#trello-columns').empty();
                initTrello();
              })
              .catch(err => {
                console.log(err)
              })
          })

          feather.replace()
        }

        trello.getCards(list.id)
          .then(cards => {
            cards.forEach((card, index) => {
              $(`#${list.id}`).append(
                `<div id=${card.id} class="card">
                  <div class="card-body">
                    <h6 class="card-title">
                      <a class="white" href="${card.url}">${card.name}</a>
                    </h6>
                  </div>
                </div>`
              )

              if (trelloSettings.showDescriptions) {
                $(`#${card.id} > .card-body`).append(`
                  <p class="card-text white">
                    <small>${card.desc}</small>
                  </p>
                `)
              }

            })

          })

        if (index + 1 == lists.length) {
          $('.list').droppable({
            drop: function(ev, ui) {
              //snap into place
              //$(ui.draggable).detach().css({top: 0,left: 0}).appendTo(this);
              let list = ev.target.id
              let card = ui.draggable[0].id

              trello.moveCard(card, list)

            }
          }).sortable({
            connectWith: '.list',
            handle: '.card-body',
            start: function (event, ui) {
              ui.item.addClass('tilt');
              //tilt_direction(ui.item);
            },
            stop: function (event, ui) {
              ui.item.removeClass("tilt");
              $("html").unbind('mousemove', ui.item.data("move_handler"));
              ui.item.removeData("move_handler");

              // get the pos of the cards above and below
              let cardAboveElement = ui.item[0].previousElementSibling
              let cardBelowElement = ui.item[0].nextElementSibling
              let targetCardId = ui.item[0].id

              if (!cardAboveElement.id) {
                trello.updateCardPosition(targetCardId, 'top')
              } else if (!cardBelowElement) {
                trello.updateCardPosition(targetCardId, 'bottom')
              } else {
                let cardAbove = trello.getCard(cardAboveElement.id)
                let cardBelow = trello.getCard(cardBelowElement.id)

                Promise.all([cardAbove, cardBelow])
                .then(values => {
                  let cardAbovePos = values[0].pos
                  let cardBelowPos = values[1].pos
                  let cardBetweenPos = (cardAbovePos + cardBelowPos) / 2

                  trello.updateCardPosition(targetCardId, cardBetweenPos)

                })
              }
            }
          });
        }
      })
    })

  })
  .catch(err => {
    console.log(err)
    //TODO: go to options page if no trello credentials are found
  })

}
