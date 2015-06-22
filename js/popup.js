
// Ensures the base Discourse URL *does not* have an trailing slash
var normalizeBaseUrl = function(url) {
  var lastCharPos = url.length - 1;
  var hasSlash = url[lastCharPos] === '/';
  return hasSlash ? url.substr(0, lastCharPos) : url;
};

var buildNotificationsUrl = function(discourseUrl) {
  return [
    discourseUrl,
    '/notifications?',
    'recent=true'
  ].join('');
};

var getNotificaitons = function(discourseUrl) {

  var url = buildNotificationsUrl(discourseUrl);
  var options = {
    credentials: 'include',
    headers: {
      'Accept': 'application/json'
    },
  };

  return fetch(url, options)
          .then(function(res) { return res.json(); });
};

var appendUrl = function(discourseUrl, n) {
  n.url = discourseUrl + '/t/' + n.slug + '/' + n.topic_id + '/' + n.post_number;
  return n;
};

var template = function(n) {
  var classes = 'notification js-notification-link';
  if (!n.read) classes += ' unread';
  return [
    '<a href="' + n.url + '" class="' + classes + '">',
      '<span class="notification-username">',
        n.data.display_username,
      '</span>',
      '<span class="notification-title">',
        n.data.topic_title,
      '</span>',
    '</a>'
  ].join('');
};

var initLinks = function() {
  var links = document.querySelectorAll('a[href]');

  [].forEach.call(links, function(link) {
    link.addEventListener('click', function(e) {
      e.preventDefault();

      chrome.tabs.create({ url: e.currentTarget.href });

    }, false);
  });
};

chrome.storage.sync.get({ discourseUrl: '' }, function (items) {

  var discourseUrl = normalizeBaseUrl(items.discourseUrl);

  getNotificaitons(discourseUrl).then(function(data) {

      var html = data.notifications.map(appendUrl.bind(null, discourseUrl))
                                   .map(template)
                                   .join('');

      document.querySelector('.js-notifications').innerHTML = html;
      initLinks();
    });

});