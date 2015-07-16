/**
 * Author:  Alessandro Polidori
 * Contact: alessandro.polidori@gmail.com
 */

/**
 * Contains all extension functions.
 *
 * @class DiscourseCommunity
 */
var DiscourseCommunity = (function () {

    /**
     * User identifier.
     *
     * @property userId
     * @type number
     */
    var userId;

    /**
     * Total unread notification counter.
     *
     * @property totUnreadCounter
     * @type number
     */
    var totUnreadCounter;

    /**
     * Url to open when click the icon.
     *
     * @property urlCommunity
     * @type string
     */
    var urlCommunity;

    /**
     * True if the current extension has been initialized.
     *
     * @property initialized
     * @type boolean
     * @default false
     */
    var initialized = false;

    /**
     * If debug is activated.
     *
     * @property debug
     * @type boolean
     * @default false
     */
    var debug = false;

    /**
     * Timeout identifier.
     *
     * @property idTimeoutLogin
     * @type number
     */
    var idTimeoutLogin;

    /**
     * Interval time to use to check current user data again after a failure
     * for not logged in user into the community.
     *
     * @property noLoggedInIntervalPolling
     * @type number
     * @default 1 minute
     */
    var noLoggedInIntervalPolling = 60000;

    /**
     * The options page url.
     *
     * @property optionsUrl
     * @type string
     */
    var optionsUrl = chrome.extension.getURL('options.html');

    /**
     * Ensures the base Discourse URL *does not* have an trailing slash
     *
     * @method normalizeBaseUrl
     * @param {string} url The url to be normalized
     */
    var normalizeBaseUrl = function (url) {
        try {
            var lastCharPos = url.length - 1;
            var hasSlash    = url[lastCharPos] === '/';
            return hasSlash ? url.substr(0, lastCharPos) : url;
        } catch (err) {
            console.error(err.stack);
            return url;
        }
    };

    /**
     * Initialize.
     *
     * @method init
     * @param {function} cb The callback function
     */
    function init(cb) {
        try {
            chrome.browserAction.setBadgeText({ text: '' });

            chrome.storage.sync.get({ discourseUrl: '' }, function (items) {
                try {
                    chrome.browserAction.setPopup({ popup: '' });
                    chrome.browserAction.onClicked.removeListener(openOptionsTab);

                    if (items.discourseUrl !== '' && typeof items.discourseUrl === 'string') {
                        initialized = true;
                        items.discourseUrl = normalizeBaseUrl(items.discourseUrl);
                        setUrlCommunity(items.discourseUrl);
                        chrome.browserAction.setPopup({ popup: '../popup.html' });

                    } else {
                        initialized = false;
                        chrome.browserAction.setIcon({ path: chrome.extension.getURL('../img/logo_bn19.png') });
                        chrome.browserAction.onClicked.addListener(openOptionsTab);
                    }
                    if (cb) { cb(); }

                } catch (err) {
                    console.error(err.stack);
                }
            });

            // automatically open options tab on install
            chrome.runtime.onInstalled.addListener(function (details) {
                if (details.reason === 'install') { openOptionsTab(); }
            });

            if (debug) { console.log('initialized'); }

        } catch (err) {
            console.error(err.stack);
        }
    }

    /**
     * Start getting json initial data and subscribe for polling.
     *
     * @method start
     */
    function start() {
        try {
            if (initialized === true) {
                getCurrentUserData(function (err) {
                    if (err) { setTotUnreadCounter(err); }
                    else     { startPolling(); }
                });
            } else {
                if (debug) { console.log('specify a discourse url in the option page'); }
            }
        } catch (err) {
            console.error(err.stack);
        }
    }

    /**
     * Get json data about the current logged in user.
     *
     * @method getCurrentUserData
     * @param {function} cb The callback function
     * @private
     */
    function getCurrentUserData(cb) {
        try {
            var url = urlCommunity + '/session/current.json';

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

                        userId = data.current_user.id;
                        if (debug) { console.log('user id: ' + userId); }

                        var totUnreadCounter = data.current_user.unread_notifications + data.current_user.unread_private_messages;
                        setTotUnreadCounter(totUnreadCounter);
                        cb(null);

                    } else {
                        // maybe data format has been changed
                        console.warn('no current_user data from: ' + url);
                        cb('?');
                    }
                } catch (err) {
                    console.error(err.stack);
                    cb('?');
                }

            }).fail(function (jqHXR, textStatus, errorThrown) {
                try {
                    // user is not logged into community or other errors
                    console.warn(url + ' failed: try to login to ' + urlCommunity);
                    cb('...');
                    idTimeoutLogin = setTimeout(start, noLoggedInIntervalPolling);

                } catch (err) {
                    console.error(err.stack);
                    cb('?');
                }
            });
        } catch (err) {
            console.error(err.stack);
        }
    }

    /**
     * Start polling using MessageBus.
     *
     * @method startPolling
     * @private
     */
    function startPolling() {
        try {
            MessageBus.baseUrl = urlCommunity + '/';
            MessageBus.start();
            if (debug) { console.log('MessageBus started with baseUrl: ' + MessageBus.baseUrl); }

            MessageBus.subscribe("/notification/" + userId, function (data) {
                try {
                    if (debug) { console.log('/notification/' + userId + ' - received data:', data); }

                    if (typeof data === 'object' &&
                        typeof data.unread_notifications === 'number' &&
                        typeof data.unread_private_messages === 'number') {

                        var totUnreadCounter = data.unread_notifications + data.unread_private_messages;
                        setTotUnreadCounter(totUnreadCounter);

                    } else {
                        throw new Error('/notification/' + userId + ': received unknown data');
                    }
                } catch (err) {
                    console.error(err.stack);
                    setTotUnreadCounter('?');
                }
            });
            if (debug) { console.log('MessageBus subscribed "/notification/' + userId  + '"'); }

        } catch (err) {
            console.error(err.stack);
        }
    }

    /**
     * Stop the update of the notifications counter.
     *
     * @method stop
     */
    function stop() {
        try {
            clearTimeout(idTimeoutLogin);
            MessageBus.stop();
            if (debug) { console.log('MessageBus stopped'); }

        } catch (err) {
            console.error(err.stack);
        }
    }

    /**
     * Restart the update of the notifications counter.
     *
     * @method restart
     */
    function restart() {
        try {
            stop();
            start();
        } catch (err) {
            console.error(err.stack);
        }
    }

    /**
     * Set debug modality to on or off.
     *
     * @method setDebug
     * @param {boolean} value True to activate console debug
     */
    function setDebug(value) {
        try {
            debug = value;
        } catch (err) {
            console.error(err.stack);
        }
    }

    /**
     * Returns the url of Discourse community.
     *
     * @method getUrlCommunity
     * @return {string} The Discourse community url.
     */
    function getUrlCommunity() {
        try {
            return urlCommunity;
        } catch (err) {
            console.error(err.stack);
        }
    }

    /**
     * Returns the timeout id.
     *
     * @method getIdTimeoutLogin
     * @return {number} The timeout id.
     */
    function getIdTimeoutLogin() {
        try {
            return idTimeoutLogin;
        } catch (err) {
            console.error(err.stack);
        }
    }

    /**
     * Sets the url of discourse.
     *
     * @method setUrlCommunity
     * @param {string} url The discourse url
     * @private
     */
    function setUrlCommunity(url) {
        try {
            urlCommunity = url;
        } catch (err) {
            console.error(err.stack);
        }
    }

    /**
     * Sets the total unread notification counter.
     *
     * @method setTotUnreadCounter
     * @param {string} value The value to be set
     */
    function setTotUnreadCounter(value) {
        try {
            if (typeof value !== 'string' && typeof value !== 'number') {
                throw new Error('wrong counter value: ' + value);
            }

            if (isNaN(parseInt(value))) {
                chrome.browserAction.setIcon({ path: chrome.extension.getURL('img/logo_bn19.png') });
            } else {
                chrome.browserAction.setIcon({ path: chrome.extension.getURL('img/logo19.png') });
            }

            value = (value === 0 ? "" : value);

            if (debug)  { console.log('set total unread counter: "' + value + '"'); }

            totUnreadCounter = value.toString();
            chrome.browserAction.setBadgeText({ text: totUnreadCounter });

        } catch (err) {
            console.error(err.stack);
            chrome.browserAction.setBadgeText({ text: '?' });
        }
    }

    /**
     * Returns true if the extension has been initialized.
     *
     * @method isInitialized
     * @return {boolean} True if the extension has been initialized.
     */
    function isInitialized() {
        try {
            return initialized;
        } catch (err) {
            console.error(err.stack);
        }
    }

    /**
     * Open new tab to the specified discourse url.
     *
     * @method openDiscourseTab
     * @private
     */
    function openDiscourseTab() {
        try {
            chrome.tabs.create({ url: urlCommunity });
        } catch (err) {
            console.error(err.stack);
        }
    }

    /**
     * Open new tab to the options page.
     *
     * @method openOptionsTab
     * @private
     */
    function openOptionsTab() {
        try {
            chrome.tabs.query({ url: optionsUrl }, function (tabs) {
                if (tabs.length) {
                    chrome.tabs.update(tabs[0].id, { active: true });
                    chrome.tabs.reload(tabs[0].id);
                } else {
                    chrome.tabs.create({url: optionsUrl});
                }
            });
        } catch (err) {
            console.error(err.stack);
        }
    }

    return {
        init:                init,
        stop:                stop,
        start:               start,
        restart:             restart,
        setDebug:            setDebug,
        isInitialized:       isInitialized,
        getUrlCommunity:     getUrlCommunity,
        getIdTimeoutLogin:   getIdTimeoutLogin,
        setTotUnreadCounter: setTotUnreadCounter
    };

})();

$(function () {
    DiscourseCommunity.init(function () {
        DiscourseCommunity.start();
    });
});
