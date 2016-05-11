var mediator = new function () {
    'use strict';

    var that = this;

    this.ID = 'mediator';

    /**
     * If "update" is false it opens a new tab to url specified by "urlToOpen". Otherwise it looks for an
     * already opened tab with url "urlToSearch". In this case the following scenarios could be present:
     * - a tab does not exist: it creates a new one and gives it the focus if "active" is true
     * - a tab exists: it updates the tab with url "urlToOpen" gives it the focus if "active" is true
     *
     * The considered tabs are those of the current window.
     *
     * @method showTab
     * @param {string}  urlToOpen     Url to be opened or updated
     * @param {boolean} active        Whether the tab should be activated
     * @param {boolean} [update]      If true it checks for an already opened tab and if so, it updates the tab
     * @param {string}  [urlToSearch] The url used to search an already opened tab. If it is not specified,
     *                                "urlToOpen" will be used. It requires "update" set to true.
     */
    this.showTab = function (urlToOpen, active, update, urlToSearch) {
        try {
            active = active ? active : false;
            update = update ? update : false;
            urlToSearch = urlToSearch ? (urlToSearch + '/*') : urlToOpen;
            if (update) {
                chrome.tabs.query({ url: urlToSearch, currentWindow: true }, function (tabs) {
                    if (tabs.length > 0) {
                        chrome.tabs.update(tabs[0].id, { active: active, url: urlToOpen });
                    }
                    else {
                        chrome.tabs.create({ url: urlToOpen, active: active });
                    }
                });
            }
            else {
                chrome.tabs.create({ url: urlToOpen, active: active });
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
