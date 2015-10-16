var sourceController = new function () {
    'use strict';

    var that = this;

    this.ID = 'sourceController';
    this.counter = 0;
    this.sources = {};

    this.init = function () {
        try {
            optionsModel.$dispatcher.on(optionsModel.EVT_SOURCE_ADDED, this.onEvtSourceAdded);
            optionsModel.$dispatcher.on(optionsModel.EVT_SOURCE_REMOVED, this.onEvtSourceRemoved);
            this.addSources();
        } catch (err) {
            console.error(err.stack);
        }
    };

    this.addSource = function (url) {
        try {
            if (that.sources[url] === undefined) {
                var source = new Source(url);
                source.$dispatcher.on(source.EVT_NOTIFICATION_COUNTER_UPDATE, this.onEvtNotificationCounterUpdate);
                source.$dispatcher.on(source.EVT_NEW_NOTIFICATION_ALERT, this.onEvtNewNotificationAlert);
                this.sources[source.sourceId] = source;
            }
        } catch (err) {
            console.error(err.stack);
        }
    };

    this.addSources = function () {
        try {
            var url;
            for (url in optionsModel.options.sources) {
                this.addSource(url);
            }
        } catch (err) {
            console.error(err.stack);
        }
    };

    this.onEvtSourceAdded = function (evt, url) {
        try {
            that.addSource(url);
        } catch (err) {
            console.error(err.stack);
        }
    };

    this.onEvtSourceRemoved = function (evt, url) {
        try {
            that.removeSource(url);
        } catch (err) {
            console.error(err.stack);
        }
    };

    this.removeSource = function (url) {
        try {
            this.sources[url].$dispatcher.off(this.sources[url].EVT_NOTIFICATION_COUNTER_UPDATE, this. onEvtNotificationCounterUpdate);
            this.sources[url].$dispatcher.off(this.sources[url].EVT_NEW_NOTIFICATION_ALERT, this.onEvtNewNotificationAlert);
            delete this.sources[url];
            this.updateCounter();
        } catch (err) {
            console.error(err.stack);
        }
    };

    this.onEvtNotificationCounterUpdate = function () {
        try {
            that.updateCounter();
        } catch (err) {
            console.error(err.stack);
        }
    };

    this.onEvtNewNotificationAlert = function (ev, data) {
        try {
            if (optionsModel.isDesktopNotificationsEnabled() === true) {
                var sourceUrl = that.sources[data.sourceId].url;
                that.isDiscourseSiteOpened(sourceUrl, function (err, opened) {
                    if (!err && opened === false) {
                        var title = that.extractNotificationTitle(data.data);
                        var noturl = [ sourceUrl, data.data.post_url].join('');
                        var iconUrl = that.sources[data.sourceId].faviconUrl;
                        desktopNotificationsView.showChrRichNotificationProgress(title, data.data.excerpt, sourceUrl, noturl, iconUrl);
                    }
                });
            }
        } catch (err) {
            console.error(err.stack);
        }
    };

    this.extractNotificationTitle = function (data) {
        try {
            var notificationTypes = [
                undefined,
                'mentioned',
                'replied',
                'quoted',
                'edited',
                'liked',
                'private_message',
                'invited_to_private_message',
                'invitee_accepted',
                'posted',
                'moved_post',
                'linked',
                'granted_badge',
                'invited_to_topic'
            ];

            var templates = {
                mentioned: '{{username}} mentioned you in "{{topic}}" - {{site_title}}',
                quoted: '{{username}} quoted you in "{{topic}}" - {{site_title}}',
                replied: '{{username}} replied to you in "{{topic}}" - {{site_title}}',
                posted: '{{username}} posted in "{{topic}}" - {{site_title}}',
                private_message: '{{username}} sent you a private message in "{{topic}}" - {{site_title}}',
                linked: '{{username}} linked to your post from "{{topic}}" - {{site_title}}'
            };

            var title = templates[notificationTypes[data.notification_type]];
            title = title.replace('{{username}}', data.username);
            title = title.replace('{{topic}}', data.topic_title);
            title = title.replace(' - {{site_title}}', '');

            return title;

        } catch (err) {
            console.error(err.stack);
            return '';
        }
    };

    this.updateCounter = function () {
        try {
            this.counter = 0;
            var s;
            for (s in this.sources) {
                this.counter += this.sources[s].counter;
            }
            if (this.counter > 0) {
                extensionController.setCounterBadge(this.counter);
            }
            else {
                extensionController.setCounterBadge('');
            }
        } catch (err) {
            console.error(err.stack);
        }
    };

    this.getAllSourcesNotifications = function (cb) {
        try {
            var results = {};
            async.each(this.sources, function (source, callback) {
                source.getNotifications(function (err, data) {
                    if (err) {
                        results[source.sourceId] = { error: err };
                    }
                    else {
                        results[source.sourceId] = { notifications: data };
                    }
                    callback();
                });
            },
                       function (err) {
                cb(null, results);
            });
        } catch (err) {
            console.error(err.stack);
            cb(err.stack);
        }
    };

    this.isDiscourseSiteOpened = function (url, cb) {
        try {
            chrome.tabs.query({}, function (tabs) {
                var i;
                for (i = 0; i < tabs.length; i++) {
                    if (tabs[i].url.indexOf(url) > -1) {
                        cb(null, true);
                        return;
                    }
                }
                cb(null, false);
            });
        } catch (err) {
            console.error(err.stack);
            cb(err);
        }
    };
};
