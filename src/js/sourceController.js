var sourceController = new function () {
    'use strict';

    var that = this;

    this.ID = 'sourceController';
    this.counter = 0;
    this.sources = {};
    this.TIMEOUT_CHECK_URL = 2000;

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
                mediator.isDiscourseSiteOpened(sourceUrl, function (err, opened) {
                    if (!err && opened === false) {
                        var title = that.extractNotificationTitle(data.data);
                        var noturl = [ sourceUrl, data.data.post_url].join('');
                        var iconUrl = that.sources[data.sourceId].faviconUrl;
                        mediator.showNotification(title, data.data.excerpt, sourceUrl, noturl, iconUrl);
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

    this.checkUrl = function (url, cb) {
        try {
            $.ajax({
                url: url,
                type: 'HEAD',
                timeout: this.TIMEOUT_CHECK_URL

            }).success(function (data, textStatus, jqXHR){
                cb(null, { status: jqXHR.status })

            }).error(function (jqXHR, textStatus, errorThrown) {
                cb({ status: jqXHR.status });
            });
        } catch (err) {
            console.error(err.stack);
            cb(err);
        }
    };

    this.isUrlValid = function (url) {
        try {
            return /^(https?):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i.test(url);
        } catch (err) {
            console.error(err.stack);
        }
    }
};
