var optionsView = new function () {
    'use strict';

    var that = this;

    this.ID = 'optionsView';
    this.bg = chrome.extension.getBackgroundPage();
    this.$enableDesktopNotificationsChk;
    this.$enableDesktopNotificationsSoundChk;
    this.$addSourceBtn;
    this.$addSourceInput;
    this.$sourceSpinner;
    this.$sourceOutput;
    this.$sourcesList;
    this.$version;

    $(function () {
        try {
            that.$version = $('#version-lbl');
            that.$version.text('Version ' + chrome.runtime.getManifest().version);
            that.$enableDesktopNotificationsChk = $('#desktop-notifications-chk');
            that.$enableDesktopNotificationsSoundChk = $('#desktop-notifications-sound-chk');
            that.$addSourceBtn = $('#add-source-btn');
            that.$addSourceInput = $('#add-source-input');
            that.$sourcesList = $('#sources-list');
            that.$sourceOutput = $('#source-output-lbl');
            that.$sourceSpinner = $('#source-spinner');

            that.$addSourceInput.on('keyup', that.onEvtSourceInputKeyup);
            that.$enableDesktopNotificationsChk.on('click', that.onEvtEnableDesktopNotificationsClicked);
            that.$enableDesktopNotificationsSoundChk.on('click', that.onEvtEnableDesktopNotificationsSoundClicked);
            that.$addSourceBtn.on('click', that.onEvtAddSource);
            $('#sources-list').on('click', '.remove-source-btn', that.onEvtRemoveSource);

            that.$enableDesktopNotificationsChk.prop('checked', that.bg.optionsModel.options.desktopNotificationsEnabled);
            that.$enableDesktopNotificationsSoundChk.prop('checked', that.bg.optionsModel.options.desktopNotificationsSoundEnabled);
            that.updateSourcesList();
        } catch (err) {
            console.error(err.stack);
        }
    });

    this.onEvtSourceInputKeyup = function (ev) {
        try {
            if (ev.keyCode === 13) { that.onEvtAddSource(); }
        } catch (err) {
            console.error(err.stack);
        }
    };

    this.onEvtEnableDesktopNotificationsClicked = function () {
        try {
            var value = $(this).prop('checked');
            that.bg.optionsModel.setEnableDesktopNotifications(value);
        } catch (err) {
            console.error(err.stack);
        }
    };

    this.onEvtEnableDesktopNotificationsSoundClicked = function () {
        try {
            var value = $(this).prop('checked');
            that.bg.optionsModel.setEnableDesktopNotificationsSound(value);
        } catch (err) {
            console.error(err.stack);
        }
    };

    this.blockWaitingSourceInput = function () {
        try {
            that.$addSourceInput.prop('disabled', true);
            $('#add-source-btn').toggle();
            $('#source-spinner').toggle();
        } catch (err) {
            console.error(err.stack);
        }
    };

    this.unblockWaitingSourceInput = function () {
        try {
            that.$addSourceInput.prop('disabled', false);
            $('#add-source-btn').toggle();
            $('#source-spinner').toggle();
        } catch (err) {
            console.error(err.stack);
        }
    };

    this.onEvtAddSource = function () {
        try {
            var checkProtocols = false;
            var url = that.$addSourceInput.val();

            that.$sourceOutput.text('');
            that.blockWaitingSourceInput();

            if (!url.startsWith('http')) {
                checkProtocols = true;
                url = 'https://' + url;
            }
            if (!that.bg.sourceController.isUrlValid(url)) {
                that.$sourceOutput.text('invalid url');
                that.unblockWaitingSourceInput();
                return;
            }

            that.bg.sourceController.checkUrl(url, function (err, res) {
                if (err && !checkProtocols) {
                    that.$sourceOutput.text('url is unreachable');
                    that.unblockWaitingSourceInput();
                }
                else if (err && checkProtocols) {
                    url = url.replace('https://', 'http://');
                    that.bg.sourceController.checkUrl(url, function (err, res) {
                        if (err) {
                            that.$sourceOutput.text('url is unreachable');
                        }
                        else {
                            that.bg.optionsModel.addSource(url, that.updateSourcesList);
                            optionsView.$addSourceInput.val('');
                        }
                        that.unblockWaitingSourceInput();
                    });
                }
                else if (!err) {
                    that.bg.optionsModel.addSource(url, that.updateSourcesList);
                    optionsView.$addSourceInput.val('');
                    that.unblockWaitingSourceInput();
                }
            });
        } catch (err) {
            console.error(err.stack);
            that.unblockWaitingSourceInput();
        }
    };

    this.onEvtRemoveSource = function () {
        try {
            var url = $(this).data('url');
            that.bg.optionsModel.removeSource(url, that.updateSourcesList);
        } catch (err) {
            console.error(err.stack);
        }
    };

    this.sourceTemplate = function (url) {
        try {
            return [
                '<div>',
                '<i class="fa fa-times-circle remove-source-btn" data-url="', url, '"></i>',
                '<a href="', url, '">', url, '</a>',
                '</div>'
            ].join('');
        } catch (err) {
            console.error(err.stack);
        }
    };

    this.updateSourcesList = function () {
        try {
            var url;
            var html = '';
            for (url in that.bg.optionsModel.options.sources) {
                html += that.sourceTemplate(url);
            }
            that.$sourcesList.html(html);
        } catch (err) {
            console.error(err.stack);
        }
    };
};