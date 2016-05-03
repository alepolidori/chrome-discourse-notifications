var notificationsView = new function () {
    'use strict';

    var that = this;

    this.ID = 'notificationsView';
    this.bg = mediator.getBackgroundPage();
    this.$notificationsPage;
    this.numNotifications = 10;
    this.iconClassMap = {
        2:  'fa-reply',
        5:  'fa-heart',
        9:  'fa-reply',
        12: 'fa-certificate'
    };

    $(function () {
        try {
            that.$notificationsPage = $('#notifications-page');
            that.$notificationsPage.css('font-size', notificationsView.bg.optionsModel.options.fontSize + 'em');
            that.bg.sourceController.getAllSourcesNotifications(function (err, data) {
                if (err) {
                    that.$notificationsPage.html(err);
                }
                else {
                    that.$notificationsPage.html(that.viewTemplate(data));
                    that.initLinks();
                }
            });
        } catch (err) {
            console.error(err.stack);
        }
    });

    this.appendUrl = function (url, n) {
        try {
            if (!n.data.badge_id) {
                n.url = url + '/t/' + n.slug + '/' + n.topic_id + '/' + n.post_number;
            }
            else {
                n.url = url + '/badges/' + n.data.badge_id + '/' + n.data.badge_name.replace(/[^A-Za-z0-9_]+/g, '-').toLowerCase();
            }
            return n;
        } catch (err) {
            console.error(err.stack);
        }
    };

    this.appendSourceId = function (id, n) {
        try {
            n.sourceId = id;
            return n;
        } catch (err) {
            console.error(err.stack);
        }
    };

    this.extractData = function (n) {
        try {
            n.popNot = { icon: that.iconClassMap[n.notification_type] };
            if (!n.data.badge_id) {
                n.popNot.key = n.data.display_username;
                n.popNot.value = n.data.topic_title;
            } else {
                n.popNot.key = 'Earned';
                n.popNot.value = '\'' + n.data.badge_name + '\'';
            }
            return n;
        } catch (err) {
            console.error(err.stack);
        }
    };

    this.sourceNotificationTemplate = function (n) {
        try {
            var classes = 'notification js-notification-link';
            if (!n.read) { classes += ' unread'; }
            return [
                '<a href="', n.url, '" class="', classes, '" data-source-id="', n.sourceId, '">',
                '<i class="fa ', n.popNot.icon, '"></i>',
                '<span class="notification-username">',
                n.popNot.key,
                '</span>',
                '<span class="notification-title">',
                n.popNot.value,
                '</span>',
                '</a>'
            ].join('');
        } catch (err) {
            console.error(err.stack);
        }
    };

    this.sourceHeaderTemplate = function (sourceId) {
        try {
            var name = that.bg.sourceController.sources[sourceId].name;
            var faviconUrl = that.bg.sourceController.sources[sourceId].faviconUrl;
            return [
                '<a href="', sourceId, '" class="source-header">',
                    '<img height="16" width="16" src="' + faviconUrl + '">',
                    '<span>', name, '</span>',
                '</a>'
            ].join('');
        } catch (err) {
            console.error(err.stack);
        }
    };

    this.oldSourceNotificationsLinkTemplate = function (url) {
        try {
            var classes = 'notification js-notification-link unread';
            return [
                '<a href="', url, '/my/notifications" class="', classes, '">',
                '<span class="notification-title">',
                'view older notifications...',
                '</span>',
                '</a>'
            ].join('');
        } catch (err) {
            console.error(err.stack);
        }
    };

    this.toolbarTemplate = function () {
        try {
            var optUrl = mediator.getOptionsUrl();
            var classes = 'toolbar';
            return [
                '<div class="', classes, '">',
                    '<a href="', optUrl, '">',
                        '<i class="fa fa-gear"></i>',
                        '<span class="toolbar-text">Options</span>',
                    '</a>',
                '</div>'
            ].join('');
        } catch (err) {
            console.error(err.stack);
        }
    };

    this.initLinks = function () {
        try {
            var links = $('a[href]');
            [].forEach.call(links, function (link) {
                link.addEventListener('click', function (e) {
                    e.preventDefault();
                    mediator.showTab(e.currentTarget.href, false);
                    var sourceId = $(this).data('source-id');
                    if (sourceId) {
                        that.bg.sourceController.sources[sourceId].updateNotifications();
                    }
                }, false);
            });
        } catch (err) {
            console.error(err.stack);
        }
    };

    this.sourceErrorTemplate = function (str, url) {
        try {
            var classes = 'notification js-notification-link';
            return [
                '<a href="', url, '" class="', classes, '">',
                '<span class="notification-title">',
                str,
                '</span>',
                '</a>'
            ].join('');
        } catch (err) {
            console.error(err.stack);
        }
    };

    this.viewTemplate = function (data) {
        try {
            var ns, sourceId;
            var html = '';
            html += that.toolbarTemplate();
            for (sourceId in data) {
                html += that.sourceHeaderTemplate(sourceId);
                if (data[sourceId].notifications) {
                    ns = data[sourceId].notifications.slice(0, that.numNotifications);
                    ns.map(that.appendUrl.bind(null, sourceId));
                    ns.map(that.appendSourceId.bind(null, sourceId));
                    ns.map(that.extractData);
                    html += ns.map(that.sourceNotificationTemplate).join('');
                    html += that.oldSourceNotificationsLinkTemplate(sourceId);
                }
                else if (data[sourceId].error) {
                    html += that.sourceErrorTemplate(data[sourceId].error, sourceId);
                }
            }
            return html;
        } catch (err) {
            console.error(err.stack);
        }
    };
};
