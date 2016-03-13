
var suggestions = new Bloodhound({
  datumTokenizer: Bloodhound.tokenizers.obj.whitespace('value'),
  queryTokenizer: Bloodhound.tokenizers.whitespace,
  remote: {
    url: 'https://pillalo.herokuapp.com/suggestions?station=%QUERY',
    wildcard: '%QUERY'
  }
});

$('.typeahead').typeahead(
  {
    hint: true,
    highlight: true,
    minLength: 3
  },
  {
    name: 'best-pictures',
    display: 'value',
    source: suggestions,
    templates: {
    empty: [
      '<div class="empty-message">',
        'Unable to find any Station/Stop that match the current query',
      '</div>'
    ].join('\n'),
    suggestion: Handlebars.compile('<div><strong>{{value}}</strong></div>')
  }
});

$('.typeahead').on('typeahead:select', function(ev, suggestion) {
  $("input[name=station]").val(suggestion['value'] + '#' + suggestion['id'])
});

var timeDifference = function(t, initial) {
  // initial =  moment();
  final = moment(t, 'H:mm')
  return Math.round((final - initial)/(1000 * 60))
}

$('form').on('submit', function(e){
  e.preventDefault();
  url = 'https://pillalo.herokuapp.com/times'
  if($('input[name=station]').val() != ''){
    var current_time = moment();
    $('input[type=submit]').attr('disabled', 'disabled')
    $('input[type=submit]').val('Loading...')
    $.get(url, $(this).serialize(), function(data){
      $('.nav-tabs, .tab-content').empty();
      $.each( data, function( key, value ) {
        $('.nav-tabs').append(
          "<li role='presentation'><a href='#" + key + "' aria-controls='" + key + "' role='tab' data-toggle='tab'><h5>" + key + "</h5></a></li>"
        )
        $.each(value, function(towards_to, routes){
          $('.tab-content').append(
            "<div role='tabpanel' class='tab-pane' id='" + key + "'><ul class='list-group'></ul></div>"
          )
          $("#" + key + " ul").append(
            "<li class='list-group-item'><h4>" + towards_to + "</h4><h5></h5></li>"
          )
          times = []
          $.each(routes, function(i, route){
            if(i > 9) {
              return false;
            }
            if(route['departure_at'] != null && route['departure_at'] > route['scheduled_at']){
              times.push(timeDifference(route['departure_at'], current_time))
            } else {
              times.push(timeDifference(route['scheduled_at'], current_time))
            }
          })
          $("#" + key + " ul li:last-child h5").append("<span class='text-muted'>next in</span> <b>" + times.join(', ') + "</b> <span class='text-muted'>minutes</span>")
        })
      })
      $('.nav-tabs li').first().addClass('active')
      $('.tab-content div').first().addClass('active')
    }).always(function(){
      $('input[type=submit]').removeAttr('disabled')
      $('input[type=submit]').val('Pillalo')
    })
  }
})

function tickTock() {
  $('.clock').val(moment().format('H:mm:ss'));
}
setInterval(tickTock, 1000);