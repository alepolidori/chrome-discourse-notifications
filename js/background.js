/**
 * Author:  Alessandro Polidori
 * Contact: alessandro.polidori@gmail.com
 * Description: displays the number of unread notifications of the specified discourse.
 *              You can also click the button to open discourse.
 */

/**
 * Contains all extension functions.
 *
 * @class DiscourseCommunity
 */
var DiscourseCommunity = (function () {

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
     * Interval time to update the notifications counter.
     *
     * @property intervalPolling
     * @type number
     * @default 10 seconds
     */
    var intervalPolling = 10000;

    /**
     * Interval time to update the notifications counter when some error occurs.
     *
     * @property intervalPolling
     * @type number
     * @default 8 seconds
     */
    var errorIntervalPolling = 8000;

    /**
     * Timeout identifier.
     *
     * @property idTimeoutUpdate
     * @type number
     */
    var idTimeoutUpdate;

    /**
     * The options page url.
     *
     * @property optionsUrl
     * @type string
     */
    var optionsUrl = chrome.extension.getURL('options.html');

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
                    if (items.discourseUrl !== '' && typeof items.discourseUrl === 'string') {
                        initialized = true;
                        setUrlCommunity(items.discourseUrl);
                        chrome.browserAction.onClicked.removeListener(openOptionsTab);
                        chrome.browserAction.onClicked.addListener(openDiscourseTab);

                    } else {
                        initialized = false;
                        chrome.browserAction.setIcon({ path: chrome.extension.getURL('../img/logo_bn19.png') });
                        chrome.browserAction.onClicked.removeListener(openDiscourseTab);
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
     * Start the update of the notifications counter.
     *
     * @method start
     */
    function start() {
        try {
            if (initialized === true) {
                updateBadge();
                if (debug) { console.log('updating started'); }

            } else {
                if (debug) { console.log('specify a discourse url in the option page'); }
            }
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
            clearTimeout(idTimeoutUpdate);
            idTimeoutUpdate = undefined;
            if (debug) { console.log('updating stopped'); }

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
     * Change the update interval polling and restart the update service.
     *
     * @method setIntervalPolling
     * @param {number} value The interval time in milliseconds
     */
    function setIntervalPolling(value) {
        try {
            intervalPolling = value;
            if (idTimeoutUpdate) { restart(); }
        } catch (err) {
            console.error(err.stack);
        }
    }

    /**
     * Returns the timeout id.
     *
     * @method getIdTimeoutUpdate
     * @return {number} The timeout id.
     */
    function getIdTimeoutUpdate() {
        try {
            return idTimeoutUpdate;
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
     * Gets the total Discourse community notifications number and update the graphic display.
     *
     * @method updateBadge
     * @private
     */
    function updateBadge() {
        try {
            if (debug) { console.log('update badge'); }
            getDiscourseCommunityNotifications(function (value) {
                try {
                    chrome.browserAction.setBadgeText({ text: value.toString() });
                } catch (err) {
                    console.error(err.stack);
                    chrome.browserAction.setBadgeText({ text: '?' });
                }
            });
        } catch (err) {
            console.error(err.stack);
            chrome.browserAction.setBadgeText({ text: '?' });
        }
    }

    /**
     * Gets the total number of Discourse community notifications.
     *
     * @method getDiscourseCommunityNotifications
     * @param {function} cb The Callback function to call on ajax completion
     * @private
     */
    function getDiscourseCommunityNotifications(cb) {
        try {
            $.ajax({
                url:   urlCommunity,
                type:  'GET',
                cache: false

            }).done(function (data, textStatus, jqXHR) {
                try {
                    var pos = data.indexOf('currentUser');

                    if (pos < 0) {
                        // user is not logged into community or data format has been changed
                        chrome.browserAction.setIcon({ path: chrome.extension.getURL('img/logo_bn19.png') });
                        tot = '';

                    } else {
                        pos         = pos + 'currentUser",'.length;
                        var val     = data.substring(pos, data.length);
                        var val     = val.split('});')[0] + '}';
                        var jsonObj = JSON.parse(val);
                        var tot     = jsonObj.unread_notifications + jsonObj.unread_private_messages;

                        if (tot === 0) { tot = ''; }

                        chrome.browserAction.setIcon({ path: chrome.extension.getURL('img/logo19.png') });
                    }
                    cb(tot);
                    idTimeoutUpdate = setTimeout(updateBadge, intervalPolling);

                } catch (err) {
                    console.error(err.stack);
                    cb('?');
                }

            }).fail(function (jqHXR, textStatus, errorThrown) {
                try {
                    console.error(textStatus);
                    cb('...');
                    idTimeoutUpdate = setTimeout(updateBadge, errorIntervalPolling);

                } catch (err) {
                    console.error(err.stack);
                    cb('?');
                }
            });
        } catch (err) {
            console.error(err.stack);
            cb('?');
        }
    }

    /**
     * Returns true if the extension has been initialized.
     *
     * @method start
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

                if (tabs.length) { chrome.tabs.update(tabs[0].id, { active: true }); }
                else             { chrome.tabs.create({url: optionsUrl});            }
            });
        } catch (err) {
            console.error(err.stack);
        }
    }

    return {
        init:               init,
        stop:               stop,
        start:              start,
        restart:            restart,
        setDebug:           setDebug,
        isInitialized:      isInitialized,
        getUrlCommunity:    getUrlCommunity,
        getIdTimeoutUpdate: getIdTimeoutUpdate,
        setIntervalPolling: setIntervalPolling
    };

})();

DiscourseCommunity.init(function () {
    DiscourseCommunity.start();
});