$(document).ready(function() {
  chrome.storage.sync.get({
    trelloKey: '',
    trelloToken: '',
    trelloBoardId: '',
    trelloShowCardDescription: '',
    productHuntKey: ''
  }, function(items) {
    $('#trello-key').val(items.trelloKey)
    $('#trello-token').val(items.trelloToken)
    $('#trello-board-id').val(items.trelloBoardId)
    $('#product-hunt-key').val(items.productHuntKey)
    
    if (items.trelloShowCardDescription) {
      $('#trello-card-descriptions').prop('checked', true)
    }
    
  });

  $('#save-button').on('click', function(e) {
    e.preventDefault()
    $('.alert').toggleClass('d-none', true)
    saveData()
  })
})

function saveData() {

  let trelloKey = $('#trello-key').val(),
      trelloToken = $('#trello-token').val(),
      trelloBoardId = $('#trello-board-id').val()
      trelloShowCardDescription = $('#trello-card-descriptions').prop('checked'),
      productHuntKey = $('#product-hunt-key').val();

  trello.testSettings(trelloKey, trelloToken, trelloBoardId)
    .then(success => {
      console.log(trelloShowCardDescription)
      chrome.storage.sync.set({
        trelloKey: trelloKey,
        trelloToken: trelloToken,
        trelloBoardId: trelloBoardId,
        trelloShowCardDescription: trelloShowCardDescription,
        productHuntKey: productHuntKey
      }, function() {
        $('#alert-success').toggleClass('d-none', false)
        $('#alert-success').toggleClass('show', true)
        $('#success-message').text('You are setup and ready to go!')
      });
    })
    .catch(err => {
      console.log(err)
      $('#alert-error').toggleClass('d-none', false)
      $('#alert-error').toggleClass('show', true)
      $('#error-message').text('Looks like the credentials are invalid')
    })

}
