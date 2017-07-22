$(function() {

  var setupAutocomplete = function() {
    var go = function(name) {
      location.href = '/@/' + name;
    }
    var $input = $(this);
    lichess.loadCss('/assets/stylesheets/autocomplete.css');
    lichess.loadScript('/assets/javascripts/vendor/typeahead.jquery.min.js').done(function() {
      $input.typeahead(null, {
        minLength: 2,
        hint: true,
        highlight: true,
        source: function(query, sync, async) {
          $.ajax({
            url: '/player/autocomplete?term=' + query,
            cache: true,
            success: function(res) {
              // hack to fix typeahead limit bug
              if (res.length === 10) res.push(null);
              async(res);
            }
          });
        },
        limit: 10,
        templates: {
          empty: '<div class="empty">No player found</div>',
          pending: lichess.spinnerHtml,
          suggestion: function(a) {
            return '<span class="ulpt" data-href="/@/' + a + '">' + a + '</span>';
          }
        }
      }).on('typeahead:select', function(ev, sel) {
        go(sel);
      }).keypress(function(e) {
        if (e.which == 10 || e.which == 13) go($(this).val());
      }).focus();
    });
  };

  $('input.user-autocomplete-jump').each(setupAutocomplete);

  $('div.user_show .mod_zone_toggle').each(function() {
    $(this).click(function() {
      var $zone = $('div.user_show .mod_zone');
      if ($zone.is(':visible')) $zone.hide();
      else {
        $zone.html(lichess.spinnerHtml).show();
        $zone.load($(this).attr('href'));
      }
      return false;
    });
    if (location.search.indexOf('mod') === 1) $(this).click();
  });

  $("div.user_show .note_zone_toggle").each(function() {
    $(this).click(function() {
      $("div.user_show .note_zone").toggle();
    });
    if (location.search.indexOf('note') != -1) $(this).click();
  });

  $('form.autosubmit').each(function() {
    var $form = $(this);
    $form.find('input').change(function() {
      $.ajax({
        url: $form.attr('action'),
        method: $form.attr('method'),
        data: $form.serialize(),
        success: function() {
          $form.find('.saved').fadeIn();
          lichess.reloadOtherTabs();
        }
      });
    });
  });

  $("div.user_show .claim_title_zone").each(function() {
    var $zone = $(this);
    $zone.find('.actions a').click(function() {
      $.post($(this).attr('href'));
      $zone.remove();
      return false;
    });
  });

  if ($('#perfStat.correspondence .view_games').length &&
    lichess.once('user-correspondence-view-games')) lichess.hopscotch(function() {
      hopscotch.configure({
        i18n: {
          nextBtn: 'OK, got it'
        }
      }).startTour({
        id: 'correspondence-games',
        showPrevButton: true,
        isTourBubble: false,
        steps: [{
          title: "Recently finished games",
          content: "Would you like to display the list of your correspondence games, sorted by completion date?",
          target: $('#perfStat.correspondence .view_games')[0],
          placement: "bottom"
        }]
      });
    });

    $('.content_box_inter.angles').each(function() {
      var $angles = $(this),
      $content = $('.angle_content');
      function browseTo(path) {
        $.get(path).then(function(html) {
          $content.html(html);
          lichess.pubsub.emit('content_loaded')();
          history.replaceState({}, '', path);
          lichess.loadInfiniteScroll('.angle_content .infinitescroll');
        });
      }
      $angles.on('click', 'a', function() {
        $angles.find('.active').removeClass('active');
        $(this).addClass('active');
        browseTo($(this).attr('href'));
        if ($(this).data('tab') === 'activity') lichess.loadCss('/assets/stylesheets/activity.css');
        return false;
      });
      $('.user_show').on('click', '#games a', function() {
        $filters = $(this).parent();
        $(this).addClass('active');
        browseTo($(this).attr('href'));
        return false;
      });
    });
});
