/**
 * Author:  Alessandro Polidori
 * Contact: alessandro.polidori@gmail.com
 */

/**
 * Save the options.
 *
 * @method saveOptions
 * @private
 */
function saveOptions() {
    try {
        var desktopNotificationsEnabled = (document.getElementById('desktop-notifications-enabler')).checked;
        var url = document.getElementById('discourse-url').value;

        chrome.storage.sync.set({
            discourseUrl: url,
            desktopNotificationsEnabled: desktopNotificationsEnabled
        }, function () {

            // update status to let user know options were saved
            var status         = document.getElementById('status');
            status.textContent = chrome.i18n.getMessage('options_saved');

            setTimeout(function () {
                if (url !== '') {
                    var a = document.createElement('a');
                    var linkText = document.createTextNode(url);
                    a.appendChild(linkText);
                    a.href = url;
                    status.textContent = chrome.i18n.getMessage('now_just_login_to') + ' ';
                    status.appendChild(a);

                } else {
                    status.textContent = '';
                }
            }, 750);

            chrome.runtime.getBackgroundPage(function (bg) {

                bg.ChrNotifications.toEnable = desktopNotificationsEnabled;

                bg.DiscourseCommunity.init(function () {
                    bg.DiscourseCommunity.restart();
                });
            });
        });
    } catch (err) {
        console.error(err.stack);
    }
}

/**
 * Restores the options initializing the gui.
 *
 * @method restoreOptions
 * @private
 */
function restoreOptions() {

    chrome.storage.sync.get({
        discourseUrl: '',
        desktopNotificationsEnabled: true
    }, function (items) {
        document.getElementById('discourse-url').value = items.discourseUrl;
        document.getElementById('desktop-notifications-enabler').checked = items.desktopNotificationsEnabled;
    });
}

/**
 * Initialize some gui components.
 *
 * @method init
 * @private
 */
function init() {
    try {
        document.getElementById('save').innerHTML = chrome.i18n.getMessage('save');
        restoreOptions();
        document.getElementById('discourse-url').focus();
    } catch (err) {
        console.error(err.stack);
    }
}

document.addEventListener('DOMContentLoaded', init);
document.getElementById('save').addEventListener('click', saveOptions);
document.getElementById('discourse-url').addEventListener('keyup', function (e) {
    if (e.keyCode === 13) { // checks whether the pressed key is "Enter"
        saveOptions();
    }
});
