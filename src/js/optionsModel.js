var optionsModel = new function () {
    'use strict';

    var that = this;

    this.ID = 'optionsModel';
    this.defaults = {
        sources: {},
        fontSize: '1',
        openPagesBackgroundEnabled: true,
        desktopNotificationsEnabled: true,
        desktopNotificationsSoundEnabled: true
    };
    this.options = {};
    this.$dispatcher = $({});
    this.EVT_SOURCE_ADDED = 'EVT_SOURCE_ADDED';
    this.EVT_SOURCE_REMOVED = 'EVT_SOURCE_REMOVED';

    this.loadOptions = function (cb) {
        try {
            mediator.getStorageWithDefaults(this.defaults, function (items) {
                try {
                    var k;
                    for (k in that.defaults) {
                        if (items[k] !== undefined) {
                            that.options[k] = items[k];
                        }
                    }
                    cb();

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

    this.setFontSize = function (value) {
        try {
            mediator.setStorageItems({
                fontSize: value
            }, function (items) {
                that.options.fontSize = value;
            });
        } catch (err) {
            console.error(err.stack);
        }
    };

    this.setEnableOpenPagesBackground = function (value) {
        try {
            mediator.setStorageItems({
                openPagesBackgroundEnabled: value
            }, function (items) {
                that.options.openPagesBackgroundEnabled = value;
            });
        } catch (err) {
            console.error(err.stack);
        }
    };

    this.setEnableDesktopNotifications = function (value) {
        try {
            mediator.setStorageItems({
                desktopNotificationsEnabled: value
            }, function (items) {
                that.options.desktopNotificationsEnabled = value;
            });
        } catch (err) {
            console.error(err.stack);
        }
    };

    this.setEnableDesktopNotificationsSound = function (value) {
        try {
            mediator.setStorageItems({
                desktopNotificationsSoundEnabled: value
            }, function (items) {
                that.options.desktopNotificationsSoundEnabled = value;
            });
        } catch (err) {
            console.error(err.stack);
        }
    };

    this.normalizeBaseUrl = function (url) {
        try {
            var arr = url.split('/');
            var urlParts = [arr[0], arr[2]];
            var returnUrl = urlParts.join('//');
            if (arr[3]) {
                var subParts = arr.slice(3);
                returnUrl += '/' + subParts.join('/');
            }
            return returnUrl;
        } catch (err) {
            console.error(err.stack);
            return url;
        }
    };

    this.addSource = function (url, cb) {
        try {
            url = this.normalizeBaseUrl(url);
            mediator.getStorageWithDefaults(this.defaults, function (items) {
                try {
                    items.sources[url] = '';

                    mediator.setStorageItems({
                        sources: items.sources
                    }, function () {
                        that.options.sources = items.sources;
                        that.$dispatcher.trigger(that.EVT_SOURCE_ADDED, url);
                        cb();
                    });
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

    this.removeSource = function (url, cb) {
        try {
            mediator.getStorageWithDefaults(this.defaults, function (items) {
                try {
                    delete items.sources[url];

                    mediator.setStorageItems({
                        sources: items.sources
                    }, function () {
                        delete that.options.sources[url];
                        that.$dispatcher.trigger(that.EVT_SOURCE_REMOVED, url);
                        cb();
                    });
                } catch (err) {
                    console.error(err.stack);
                    cb(err.stack);
                }
            });
        } catch (err) {
            console.error(err.stack);
            cb(err);
        }
    };

    this.sourcesNum = function () {
        try {
            return this.options.sources ? Object.keys(this.options.sources).length : 0;
        } catch (err) {
            console.error(err.stack);
        }
    };

    this.isDesktopNotificationsEnabled = function () {
        try {
            return this.options.desktopNotificationsEnabled;
        } catch (err) {
            console.error(err.stack);
        }
    };

    this.isOpenPagesBackgroundEnabled = function () {
        try {
            return this.options.openPagesBackgroundEnabled;
        } catch (err) {
            console.error(err.stack);
        }
    };
};
