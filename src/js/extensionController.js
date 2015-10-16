var extensionController = new function () {
    'use strict';

    var that = this;

    this.ID = 'extensionController';
    this.debug = true;
    this.popupUrl = 'html/popup.html';
    this.optionsUrl = chrome.extension.getURL('html/options.html');
    this.options = {};

    (function () {
        chrome.runtime.onInstalled.addListener(function (details) {
            that.onInstalled(details);
        });
    }());

    this.onInstalled = function (details) {
        try {
            if (details.reason === 'install') {
                that.showOptionsView();
            }
            else if (details.reason === 'update' &&
                     details.previousVersion === '0.3') {

                that.migrateOptionsFromVer03();
            }
        } catch (err) {
            console.error(err.stack);
        }
    };

    this.init = function () {
        try {
            optionsModel.$dispatcher.on(optionsModel.EVT_SOURCE_ADDED, this.updateExtensionBtnBehaviour);
            optionsModel.$dispatcher.on(optionsModel.EVT_SOURCE_REMOVED, this.updateExtensionBtnBehaviour);

            optionsModel.loadOptions(this.onOptionsLoaded);
        } catch (err) {
            console.error(err.stack);
        }
    };

    this.onOptionsLoaded = function () {
        try {
            that.updateExtensionBtnBehaviour();
            sourceController.init();
        } catch (err) {
            console.error(err.stack);
        }
    };

    this.updateExtensionBtnBehaviour = function () {
        try {
            that.removeExtensionBtnListeners();
            if (optionsModel.sourcesNum() > 0) {
                chrome.browserAction.setPopup({ popup: that.popupUrl });
            }
            else {
                chrome.browserAction.onClicked.addListener(that.showOptionsView);
            }
        } catch (err) {
            console.error(err.stack);
        }
    };

    this.removeExtensionBtnListeners = function () {
        try {
            chrome.browserAction.setPopup({ popup: '' });
            chrome.browserAction.onClicked.removeListener(this.showOptionsView);
        } catch (err) {
            console.error(err.stack);
        }
    };

    this.setCounterBadge = function (val) {
        try {
            chrome.browserAction.setBadgeText({ text: val.toString() });
        } catch (err) {
            console.error(err.stack);
        }
    };

    this.showOptionsView = function () {
        try {
            chrome.tabs.query({ url: that.optionsUrl }, function (tabs) {
                if (tabs.length > 0) {
                    chrome.tabs.update(tabs[0].id, { active: true });
                    chrome.tabs.reload(tabs[0].id);
                }
                else {
                    chrome.tabs.create({ url: that.optionsUrl });
                }
            });
        } catch (err) {
            console.error(err.stack);
        }
    }

    this.logger = function (str, obj) {
        try {
            if (that.debug) {
                console.log('[' + this.ID + '] - ' + str);
                if (obj) { console.log(obj); }
            }
        } catch (err) {
            console.error(err.stack);
        }
    }

    this.warn = function (str, obj) {
        try {
            console.warn('[' + this.ID + '] - ' + str);
            if (obj) { console.warn(obj); }
        } catch (err) {
            console.error(err.stack);
        }
    }

    this.migrateOptionsFromVer03 = function () {
        try {
            chrome.storage.sync.get(function (items) {
                if (items && items.discourseUrl) {
                    optionsModel.addSource(items.discourseUrl, function (err) {
                        chrome.storage.sync.remove('discourseUrl', function () {});
                    });
                }
            });
        } catch (err) {
            console.error(err.stack);
        }
    };
};

extensionController.init();