/**
 * Author:  Alessandro Polidori
 * Contact: alessandro.polidori@gmail.com
 */

/**
 * Contains all functions about notifications.
 *
 * @class ChrNotifications
 */
var ChrNotifications = (function () {

    /**
     * The identifier.
     *
     * @property ID
     * @type string
     * @default "ChrNotifications"
     */
    var ID = 'ChrNotifications';

    /**
     * True if the user has enabled the desktop notifications.
     *
     * @property toEnable
     * @type boolean
     * @default true
     */
    var toEnable = true;

    /**
     * True if display of desktop notifications is enabled.
     *
     * @property enabled
     * @type boolean
     * @default true
     */
    var enabled = true;

    /**
     * Keys are notification identifiers and their values are objects. These
     * objects has two keys:
     *
     *   updateIdInterval: the update progress interval identifier
     *   clickUrl: the url to open on notification click
     *
     * @property notificationsData
     * @type object
     * @default {}
     */
    var notificationsData = {};

    /**
     * Checks if there is at least one tab opened on the specified
     * discourse site. It checks all opened windows.
     *
     * @method isDiscourseSiteOpened
     * @param {function} cb The callback function
     * @private
     */
    function isDiscourseSiteOpened(cb) {
        try {
            chrome.tabs.query({}, function (tabs) {
                var i;
                for (i = 0; i < tabs.length; i++) {
                    if (tabs[i].url.indexOf(DiscourseCommunity.getUrlCommunity()) > -1) {
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
    }

    /**
     * Returns true if desktop notifications are enabled.
     *
     * @method isEnabled
     * @return {boolean} True if desktop notifications are enabled.
     */
    function isEnabled() {
        try {
            return enabled;
        } catch (err) {
            console.error(err.stack);
        }
    }

    /**
     * Disable the visualization of the desktop notifications.
     *
     * @method disable
     */
    function disable() {
        try {
            DiscourseCommunity.logger(ID, 'MessageBus unsubscribed "/notification-alert/*');
            MessageBus.unsubscribe('/notification-alert/*');
            closeAllNotifications();
            enabled = false;
            DiscourseCommunity.logger(ID, 'desktop notifications has been disabled');
        } catch (err) {
            console.error(err.stack);
        }
    }

    /**
     * Close all desktop notifications.
     *
     * @method closeAllNotifications
     * @private
     */
    function closeAllNotifications() {
        try {
            var notificationId;
            for (notificationId in notificationsData) {
                chrome.notifications.clear(notificationId, function (wasCleared) {});
            }
        } catch (err) {
            console.error(err.stack);
        }
    }

    /**
     * Enable the visualization of the desktop notifications.
     *
     * @method enable
     * @param {number} userId The user identifier number
     */
    function enable(userId) {
        try {
            DiscourseCommunity.logger(ID, 'MessageBus unsubscribed "/notification-alert/*');
            MessageBus.unsubscribe('/notification-alert/*');

            // subscription for new notifications
            MessageBus.subscribe('/notification-alert/' + userId, function (data) {
                try {
                    DiscourseCommunity.logger(ID, '/notification-alert/' + userId + ' - received data:', data);
                    newNotification(data);

                } catch (err) {
                    console.error(err.stack);
                }
            });
            DiscourseCommunity.logger(ID, 'MessageBus subscribed "/notification-alert/' + userId  + '"');

            chrome.notifications.onClosed.removeListener(onClosedNotification);
            chrome.notifications.onClicked.removeListener(onClickedNotification);
            chrome.notifications.onClosed.addListener(onClosedNotification);
            chrome.notifications.onClicked.addListener(onClickedNotification);
            enabled = true;
            DiscourseCommunity.logger(ID, 'desktop notifications has been enabled');

        } catch (err) {
            console.error(err.stack);
        }
    }

    /**
     * A notification has been closed.
     *
     * @method onClosedNotification
     * @param {string} notificationId The notification identifier
     * @private
     */
    function onClosedNotification(notificationId) {
        try {
            stopUpdateChrNotificationProgress(notificationId);
            delete notificationsData[notificationId];
            DiscourseCommunity.logger(ID, 'notification "' + notificationId  + '" has been closed');
        } catch (err) {
            console.error(err.stack);
        }
    }

    /**
     * A notification has been clicked.
     *
     * @method onClickedNotification
     * @param {string} notificationId The notification identifier
     * @private
     */
    function onClickedNotification(notificationId) {
        try {
            if (notificationsData[notificationId]) {
                var url = notificationsData[notificationId].clickUrl;
                chrome.tabs.create({ url: url, active: true });
                chrome.notifications.clear(notificationId, function (wasCleared) {});
                DiscourseCommunity.logger(ID, 'clicked notification "' + notificationId  + '": open "' + url + '"');
            } else {
                chrome.notifications.clear(notificationId, function (wasCleared) {});
                DiscourseCommunity.warn(ID, 'no data for clicked notification "' + notificationId  + '": close it');
            }
        } catch (err) {
            console.error(err.stack);
        }
    }

    /**
     * If no discourse tab is already opened, it shows a desktop notification.
     *
     * @method newNotification
     * @param {object} data The data about new notification
     * @private
     */
    function newNotification(data) {
        try {
            // check if there are some already opened discourse browser tabs
            isDiscourseSiteOpened(function (err, isOpened) {
                try {
                    if (isOpened === false) {
                        var title = getNotificationTitle(data);
                        var url = [ DiscourseCommunity.getUrlCommunity(), data.post_url].join('');
                        showChrRichNotificationProgress(title, data.excerpt, url);
                        return;
                    }
                    if (err) { console.error(err.stack); }

                } catch (err) {
                    console.error(err.stack);
                }
            });
        } catch (err) {
            console.error(err.stack);
        }
    }

    /**
     * Displays a test notification.
     *
     * @method testNotification
     */
    function testNotification() {
        try {
            // check if there are some already opened discourse browser tabs
            isDiscourseSiteOpened(function (err, isOpened) {
                try {
                    if (isOpened === false) {
                        // example data
                        var data = {
                            excerpt: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.",
                            notification_type: 9,
                            post_number: 2,
                            post_url: "/t/some-text/1/1",
                            topic_id: 222222,
                            topic_title: "Example of a topic title",
                            username: "john"
                        };

                        var title = getNotificationTitle(data);
                        var url = [ DiscourseCommunity.getUrlCommunity(), data.post_url].join('');
                        showChrRichNotificationProgress(title, data.excerpt, url);
                        return;
                    }
                    if (err) { console.error(err.stack); }

                } catch (err) {
                    console.error(err.stack);
                }
            });
        } catch (err) {
            console.error(err.stack);
        }
    }

    /**
     * Returns the notification title.
     *
     * @method getNotificationTitle
     * @param  {object} data The data about new notification
     * @return {string} data The notification title.
     * @private
     */
    function getNotificationTitle(data) {
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
        }
    }

    /**
     * Shows a desktop chrome rich progress notification.
     *
     * @method showChrRichNotificationProgress
     * @param {string} title The notification title
     * @param {string} body  The notification body message
     * @param {string} url   The url to open clicking the notification
     * @private
     */
    function showChrRichNotificationProgress(title, body, url) {
        try {
            var opt = {
                type: 'progress',
                title: title,
                message: body,
                iconUrl: 'img/logo256.png',
                contextMessage: DiscourseCommunity.getUrlCommunity(),
                progress: 0
            };
            chrome.notifications.create(opt, function (notificationId) {
                try {
                    DiscourseCommunity.logger(ID, 'new desktop notification - id: ' + notificationId);
                    notificationsData[notificationId] = { clickUrl: url };
                    startUpdateChrNotificationProgress(notificationId);

                } catch (err) {
                    console.error(err.stack);
                }
            });

        } catch (err) {
            console.error(err.stack);
        }
    }

    /**
     * Start the update of the progress bar.
     *
     * @method startUpdateChrNotificationProgress
     * @param {string} notificationId The notification identifier
     * @private
     */
    function startUpdateChrNotificationProgress(notificationId) {
        try {
            var value = 0;

            // the intervall will be stopped when the progress bar reaches the
            // end or when the desktop notification will be closed
            var idInterval = setInterval(function () {

                value += 15;
                if (value > 100) {
                    chrome.notifications.update(notificationId, { progress: 100 }, function (wasUpdated) {});
                    stopUpdateChrNotificationProgress(notificationId);
                } else {
                    chrome.notifications.update(notificationId, { progress: value }, function (wasUpdated) {});
                }
                DiscourseCommunity.logger(ID, 'notification progress updated - notificationId: ' + notificationId);

            }, 1000);
            notificationsData[notificationId].updateIdInterval = idInterval;

        } catch (err) {
            console.error(err.stack);
        }
    }

    /**
     * Stop the update of the progress bar.
     *
     * @method stopUpdateChrNotificationProgress
     * @param {string} notificationId The notification identifier
     * @private
     */
    function stopUpdateChrNotificationProgress(notificationId) {
        try {
            if (typeof notificationId !== 'string') {
                DiscourseCommunity.warn(ID, 'wrong argument "' + notificationId + '"');
            }

            if (notificationsData[notificationId] &&
                notificationsData[notificationId].updateIdInterval) {

                clearInterval(notificationsData[notificationId].updateIdInterval);
            }

        } catch (err) {
            console.error(err.stack);
        }
    }

    /**
     * Returns data about opened notifications.
     *
     * @method getNotificationsData
     */
    function getNotificationsData() {
        try {
            return notificationsData;
        } catch (err) {
            console.error(err.stack);
        }
    }

    return {
        enable:                enable,
        disable:               disable,
        toEnable:              toEnable,
        isEnabled:             isEnabled,
        testNotification:      testNotification,
        getNotificationsData:  getNotificationsData,
        isDiscourseSiteOpened: isDiscourseSiteOpened
    };

})();
