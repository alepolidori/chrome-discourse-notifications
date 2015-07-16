
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

var getNotifications = function(discourseUrl) {

  var url = buildNotificationsUrl(discourseUrl);
  var options = {
    credentials: 'include',
    headers: {
      'Accept': 'application/json'
    },
  };

  return fetch(url, options)
          .then (function (res) { return res; })
          .catch(function (err) { return err; });
};

var appendUrl = function(discourseUrl, n) {
  if (!n.data.badge_id) {
    n.url = discourseUrl + '/t/' + n.slug + '/' + n.topic_id + '/' + n.post_number;
  } else {
    n.url = discourseUrl + '/badges/' + n.data.badge_id + '/' + n.data.badge_name.replace(/[^A-Za-z0-9_]+/g, '-').toLowerCase();
  }
  return n;
};

var iconClassMap = {
  2:  'fa-reply',
  5:  'fa-heart',
  9:  'fa-reply',
  12: 'fa-certificate'
};

var extractData = function (n) {
  n.popNot = { icon: iconClassMap[n.notification_type] };
  if (!n.data.badge_id) {
    n.popNot.key = n.data.display_username;
    n.popNot.value = n.data.topic_title;
  } else {
    n.popNot.key = 'Earned';
    n.popNot.value = '\'' + n.data.badge_name + '\'';
  }
  return n;
};

var template = function(n) {
  var classes = 'notification js-notification-link';
  if (!n.read) classes += ' unread';
  return [
    '<a href="' + n.url + '" class="' + classes + '">',
      '<i class="fa ' + n.popNot.icon + '"></i>',
      '<span class="notification-username">',
        n.popNot.key,
      '</span>',
      '<span class="notification-title">',
        n.popNot.value,
      '</span>',
    '</a>'
  ].join('');
};

var homeTemplate = function(discourseUrl) {
  var classes = 'notification js-notification-link';
  return [
    '<a href="' + discourseUrl + '" class="' + classes + '">',
      '<span class="notification-title">',
        'Home',
      '</span>',
    '</a>'
  ].join('');
};

var olderTemplate = function(discourseUrl) {
  var classes = 'notification js-notification-link';
  return [
    '<a href="' + discourseUrl + '/my/notifications" class="' + classes + '">',
      '<span class="notification-title">',
        'view older notifications...',
      '</span>',
    '</a>'
  ].join('');
};

var doLoginTemplate = function (discourseUrl) {
  try {
    var classes = 'notification js-notification-link';
    return [
      '<a href="' + discourseUrl + '" class="' + classes + '">',
        '<span class="notification-username">',
          'You need to login to',
        '</span>',
        '<span class="notification-title">',
          discourseUrl,
        '</span>',
      '</a>'
    ].join('');
  } catch (err) {
    console.error(err.stack);
  }
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

  getNotifications(discourseUrl).then(function (res) {
    if (res.json) {
      res.json().then(function (data) {
        var html;
        if (res.ok === true && res.status === 200) {

          html = homeTemplate(discourseUrl);
          html += data.notifications.map(appendUrl.bind(null, discourseUrl))
            .map(extractData)
            .map(template)
            .join('');
          html += olderTemplate(discourseUrl);

          document.querySelector('.js-notifications').innerHTML = html;
          initLinks();
          showNotificationsPage();
          chrome.browserAction.setIcon({ path: chrome.extension.getURL('img/logo19.png') });
          chrome.browserAction.setBadgeText({ text: '' });

        } else {
          showDoLoginPage(discourseUrl);
          chrome.browserAction.setIcon({ path: chrome.extension.getURL('img/logo_bn19.png') });
          chrome.browserAction.setBadgeText({ text: '...' });
        }
      }).catch(function (err) {
        console.error(err.stack);
      });
    } else {
      showDoLoginPage(discourseUrl);
    }
  }).catch(function (err) {
    console.error(err.stack);
  });
});

function hideAllPages() {
  try {
    var sectionEls = document.querySelectorAll('section');
    var i;
    for (i = 0; i < sectionEls.length; i++) {
      sectionEls[i].classList.add('hidePage');
    }
  } catch (err) {
    console.error(err.stack);
  }
}

function showDoLoginPage(discourseUrl) {
  try {
    var html = doLoginTemplate(discourseUrl);
    document.querySelector('.do-login-page').innerHTML = html;
    initLinks();
    hideAllPages();
    document.querySelector('.do-login-page').classList.remove('hidePage');
  } catch (err) {
    console.error(err.stack);
  }
}

function showNotificationsPage() {
  try {
    hideAllPages();
    document.querySelector('.notifications-page').classList.remove('hidePage');
  } catch (err) {
    console.error(err.stack);
  }
}
