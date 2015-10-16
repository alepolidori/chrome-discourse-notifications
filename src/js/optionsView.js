var optionsView = new function () {
    'use strict';

    var that = this;

    this.ID = 'optionsView';
    this.bg = chrome.extension.getBackgroundPage();
    this.$enableDesktopNotificationsChk;
    this.$enableDesktopNotificationsSoundChk;
    this.$addSourceBtn;
    this.$addSourceInput;
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

    this.onEvtAddSource = function () {
        try {
            var url = that.$addSourceInput.val();
            if (url !== '') {
                that.bg.optionsModel.addSource(url, that.updateSourcesList);
                optionsView.$addSourceInput.val('');
            }
        } catch (err) {
            console.error(err.stack);
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