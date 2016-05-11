var chrDesktopNotificationsView = new function () {
    'use strict';

    var that = this;

    this.ID = 'chrDesktopNotificationsView';
    this.ns = {};

    this.showChrRichNotificationProgress = function (title, body, sourceUrl, noturl, iconUrl) {
        try {
            var opt = {
                type: 'progress',
                title: title,
                message: body,
                iconUrl: iconUrl,
                contextMessage: sourceUrl,
                progress: 0
            };
            chrome.notifications.create(opt, function (nid) {
                try {
                    that.ns[nid] = { clickUrl: noturl };
                    that.startUpdateChrNotificationProgress(nid);
                } catch (err) {
                    console.error(err.stack);
                }
            });

        } catch (err) {
            console.error(err.stack);
        }
    };

    this.startUpdateChrNotificationProgress = function (nid) {
        try {
            var value = 0;
            var idInterval = setInterval(function () {
                value += 15;
                if (value > 100) {
                    chrome.notifications.update(nid, { progress: 100 }, function (wasUpdated) {});
                    that.stopUpdateChrNotificationProgress(nid);
                }
                else {
                    chrome.notifications.update(nid, { progress: value }, function (wasUpdated) {});
                }
            }, 1000);
            this.ns[nid].updateIdInterval = idInterval;

        } catch (err) {
            console.error(err.stack);
        }
    };

    this.stopUpdateChrNotificationProgress = function (nid) {
        try {
            if (this.ns[nid] && this.ns[nid].updateIdInterval) {
                clearInterval(this.ns[nid].updateIdInterval);
            }
        } catch (err) {
            console.error(err.stack);
        }
    };

    this.onClosedNotification = function (nid) {
        try {
            that.stopUpdateChrNotificationProgress(nid);
            delete that.ns[nid];
        } catch (err) {
            console.error(err.stack);
        }
    };

    this.onClickedNotification = function (nid) {
        try {
            if (that.ns[nid]) {
                var url = that.ns[nid].clickUrl;
                var urlToSearch = sourceController.removePostMessageNumber(url);
                mediator.showTab(url, true, true, urlToSearch);
                chrome.notifications.clear(nid, function (wasCleared) {});
            }
            else {
                chrome.notifications.clear(nid, function (wasCleared) {});
            }
        } catch (err) {
            console.error(err.stack);
        }
    };

    (function init() {
        try {
            chrome.notifications.onClosed.addListener(that.onClosedNotification);
            chrome.notifications.onClicked.addListener(that.onClickedNotification);
        } catch (err) {
            console.error(err.stack);
        }
    }());
};
