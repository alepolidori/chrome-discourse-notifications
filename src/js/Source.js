var Source = function (url) {
    'use strict';

    var that = this;

    this.ID = 'Source'
    this.USER_DATA_FAIL_TIMEOUT_POLLING = 15000;
    this.url = url;
    this.notificationsUrl = [ this.url, '/notifications?', 'recent=true' ].join('');
    this.sourceId = url;
    this.userId;
    this.mb;
    this.faviconUrl = [ 'http://www.google.com/s2/favicons?domain=', this.url ].join('');
    this.counter = 0;
    this.$dispatcher = $({});
    this.EVT_NEW_NOTIFICATION_ALERT = 'EVT_NEW_NOTIFICATION_ALERT';
    this.EVT_NOTIFICATION_COUNTER_UPDATE = 'EVT_NOTIFICATION_COUNTER_UPDATE';
    this.notificationsErrorMap = {
        not_logged_in: 'login to view notifications'
    };
    
    this.getUserData = function (cb) {
        try {
            var url = [ this.url, '/session/current.json' ].join('');

            $.ajax({
                url: url,
                type: 'GET',
                cache: false,
                dataType: 'json'

            }).done(function (data, textStatus, jqXHR) {
                try {
                    if (typeof data === 'object' &&
                        typeof data.current_user === 'object' &&
                        typeof data.current_user.id === 'number' &&
                        typeof data.current_user.unread_notifications === 'number' &&
                        typeof data.current_user.unread_private_messages === 'number') {

                        that.userId = data.current_user.id;

                        that.counter = data.current_user.unread_notifications + data.current_user.unread_private_messages;
                        that.$dispatcher.trigger(that.EVT_NOTIFICATION_COUNTER_UPDATE);
                        cb();
                    }
                    else {
                        cb(new Error('malformed data'));
                    }
                } catch (err) {
                    console.error(err.stack);
                    cb(err);
                }
            }).fail(function (jqXHR, textStatus, errorThrown) {
                try {
                    cb(jqXHR.status);
                } catch (err) {
                    console.error(err.stack);
                    cb(err);
                }
            });
        } catch (err) {
            console.error(err.stack);
            cb(err);
        }
    };
    
    this.getFaviconUrl = function (cb) {
        try {
            $.ajax({
                url: this.url,
                type: 'GET',
                dataType: 'html'

            }).done(function (data, textStatus, jqXHR) {
                try {
                    var pattern = '<link rel="icon" type="image/png" href="';
                    var pos = data.indexOf(pattern);
                    data = data.substring(pos + pattern.length, data.length);
                    pos = data.indexOf('"');
                    data = data.substring(0, pos);
                    cb(null, data);
                } catch (err) {
                    console.error(err.stack);
                    cb(err);
                }
            }).fail(function (jqXHR, textStatus, errorThrown) {
                try {
                    cb(jqXHR.status);
                } catch (err) {
                    console.error(err.stack);
                    cb(err);
                }
            });
        } catch (err) {
            console.error(err.stack);
            cb(err);
        }
    };

    this.unsubscribeMbAll = function () {
        try {
            that.mb.unsubscribe('/notification/*');
            that.mb.unsubscribe('/notification-alert/*');
        } catch (err) {
            console.error(err.stack);
        }
    };

    this.subscribeMbReceiveNotificationsCounters = function () {
        try {
            var str = [ '/notification/', that.userId ].join('');
            that.mb.subscribe(str, function (data) {
                try {
                    if (typeof data === 'object' &&
                        typeof data.unread_notifications === 'number' &&
                        typeof data.unread_private_messages === 'number') {

                        that.counter = data.unread_notifications + data.unread_private_messages;
                        that.$dispatcher.trigger(that.EVT_NOTIFICATION_COUNTER_UPDATE);
                    }
                    else {
                        throw new Error('malformed data');
                    }
                } catch (err) {
                    console.error(err.stack);
                }
            });
        } catch (err) {
            console.error(err.stack);
        }
    };

    this.subscribeMbReceiveNotificationsAlert = function () {
        try {
            var str = [ '/notification-alert/', that.userId ].join('');
            that.mb.subscribe(str, function (data) {
                try {
                    that.$dispatcher.trigger(that.EVT_NEW_NOTIFICATION_ALERT, { sourceId: that.sourceId, data: data });
                } catch (err) {
                    console.error(err.stack);
                }
            });
        } catch (err) {
            console.error(err.stack);
        }
    };

    this.stopReceiveMbUpdates = function () {
        try {
            that.mb.stop();
        } catch (err) {
            console.error(err.stack);
        }
    };

    this.startReceiveMbUpdates = function () {
        try {
            that.mb.start();
        } catch (err) {
            console.error(err.stack);
        }
    };
    
    this.getNotifications = function (cb) {
        try {
            var options = {
                credentials: 'include',
                headers: {
                    'Accept': 'application/json'
                }
            };
            var req = fetch(that.notificationsUrl, options);
            req.then(function (res) {
                if (res.json) {
                    res.json().then(function (data) {
                        if (typeof data === 'object' &&
                            data.notifications &&
                            data.notifications instanceof Array === true) {
                            
                            cb(null, data.notifications);
                        }
                        else if (typeof data === 'object' &&
                                 typeof data.error_type === 'string') {

                            cb(that.notificationsErrorMap[data.error_type] ? that.notificationsErrorMap[data.error_type] : data.error_type);
                        }
                        else {
                            cb('unknown data received');
                        }
                    });
                }
                else {
                    cb('incomplete response received');
                }
            });
            req.catch(function (err) {
                cb('network request failed');
            });
        } catch (err) {
            console.error(err.stack);
            cb('cannot get notifications');
        }
    };

    (function init () {
        try {
            that.getFaviconUrl(function (err, url) {
                if (err) {
                    console.error(err);
                }
                else {
                    that.faviconUrl = url;
                }
            });
            that.getUserData(function (err) {
                if (err === 404) {
                    setTimeout(function () { init(); }, that.USER_DATA_FAIL_TIMEOUT_POLLING);
                }
                else {
                    that.mb = MessageBus();
                    that.mb.baseUrl = [ that.url, '/' ].join('');
                    that.mb.start();
                    that.subscribeMbReceiveNotificationsCounters();
                    that.subscribeMbReceiveNotificationsAlert();
                }
            });
        } catch (err) {
            console.error(err.stack);
        }
    })();
};
