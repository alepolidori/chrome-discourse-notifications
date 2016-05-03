var mediator = new function () {
    'use strict';

    var that = this;

    this.ID = 'mediator';

    this.showTab = function (url, active, update) {
        try {
            active = active ? active : false;
            update = update ? update : false;
            if (update) {
                chrome.tabs.query({ url: url }, function (tabs) {
                    if (tabs.length > 0) {
                        chrome.tabs.update(tabs[0].id, { active: active });
                        chrome.tabs.reload(tabs[0].id);
                    }
                    else {
                        chrome.tabs.create({ url: url, active: active });
                    }
                });
            }
            else {
                chrome.tabs.create({ url: url, active: active });
            }
        } catch (err) {
            console.error(err.stack);
        }
    };

    this.getBackgroundPage = function () {
        try {
            return chrome.extension.getBackgroundPage();
        } catch (err) {
            console.error(err.stack);
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

    this.getStorage = function (cb) {
        try {
            chrome.storage.sync.get(cb);
        } catch (err) {
            console.error(err.stack);
        }
    };

    this.getStorageWithDefaults = function (defaults, cb) {
        try {
            chrome.storage.sync.get(defaults, cb);
        } catch (err) {
            console.error(err.stack);
        }
    };

    this.storageRemoveItem = function (item, cb) {
        try {
            chrome.storage.sync.remove(item, cb);
        } catch (err) {
            console.error(err.stack);
        }
    };

    this.setStorageItems = function (items, cb) {
        try {
            chrome.storage.sync.set(items, cb);
        } catch (err) {
            console.error(err.stack);
        }
    };

    this.getAppVersion = function () {
        try {
            return chrome.runtime.getManifest().version;
        } catch (err) {
            console.error(err.stack);
        }
    };

    this.getBackgroundPage = function () {
        try {
            return chrome.extension.getBackgroundPage();
        } catch (err) {
            console.error(err.stack);
        }
    };

    this.getOptionsUrl = function () {
        try {
            return chrome.extension.getURL('html/options.html');
        } catch (err) {
            console.error(err.stack);
        }
    };

    this.doOnInstalled = function (cb) {
        try {
            chrome.runtime.onInstalled.addListener(function (details) {
                cb(details);
            });
        } catch (err) {
            console.error(err.stack);
        }
    };

    this.setExtensionIconPopup = function (obj) {
        try {
            chrome.browserAction.setPopup(obj);
        } catch (err) {
            console.error(err.stack);
        }
    };

    this.extensionIconOnClicked = function (cb) {
        try {
            chrome.browserAction.onClicked.addListener(cb);
        } catch (err) {
            console.error(err.stack);
        }
    };

    this.setExtensionBtnText = function (obj) {
        try {
            chrome.browserAction.setBadgeText(obj);
        } catch (err) {
            console.error(err.stack);
        }
    };

    this.showNotification = function (title, body, sourceUrl, noturl, iconUrl) {
        try {
            chrDesktopNotificationsView.showChrRichNotificationProgress(title, body, sourceUrl, noturl, iconUrl);
        } catch (err) {
            console.error(err.stack);
        }
    };
};
