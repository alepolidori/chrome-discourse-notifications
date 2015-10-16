var optionsModel = new function () {
    'use strict';
    
    var that = this;
    
    this.ID = 'optionsModel';
    this.defaults = {
        sources: {},
        desktopNotificationsEnabled: true,
        desktopNotificationsSoundEnabled: true
    };
    this.options = {};
    this.$dispatcher = $({});
    this.EVT_SOURCE_ADDED = 'EVT_SOURCE_ADDED';
    this.EVT_SOURCE_REMOVED = 'EVT_SOURCE_REMOVED';
    
    this.loadOptions = function (cb) {
        try {
            chrome.storage.sync.get(this.defaults, function (items) {
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
    
    this.setEnableDesktopNotifications = function (value) {
        try {
            chrome.storage.sync.set({
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
            chrome.storage.sync.set({
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
            arr = [arr[0], arr[2]];
            return arr.join('//');
        } catch (err) {
            console.error(err.stack);
            return url;
        }
    };
    
    this.addSource = function (url, cb) {
        try {
            url = this.normalizeBaseUrl(url);
            chrome.storage.sync.get(this.defaults, function (items) {
                try {
                    items.sources[url] = '';
                    
                    chrome.storage.sync.set({
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
            chrome.storage.sync.get(this.defaults, function (items) {
                try {
                    delete items.sources[url];
                    
                    chrome.storage.sync.set({
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
};
