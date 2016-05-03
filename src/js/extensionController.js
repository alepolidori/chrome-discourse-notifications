var extensionController = new function () {
    'use strict';

    var that = this;

    this.ID = 'extensionController';
    this.debug = true;
    this.popupUrl = 'html/popup.html';
    this.optionsUrl = mediator.getOptionsUrl();
    this.options = {};

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
                mediator.setExtensionIconPopup({ popup: that.popupUrl });
            }
            else {
                mediator.extensionIconOnClicked(that.showOptionsView);
            }
        } catch (err) {
            console.error(err.stack);
        }
    };

    this.removeExtensionBtnListeners = function () {
        try {
            mediator.setExtensionIconPopup({ popup: '' });
            mediator.extensionIconOnClicked(this.showOptionsView);
        } catch (err) {
            console.error(err.stack);
        }
    };

    this.setCounterBadge = function (val) {
        try {
            mediator.setExtensionBtnText({ text: val.toString() });
        } catch (err) {
            console.error(err.stack);
        }
    };

    this.showOptionsView = function () {
        try {
            mediator.showTab(that.optionsUrl);
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
            mediator.getStorage(function (items) {
                if (items && items.discourseUrl) {
                    optionsModel.addSource(items.discourseUrl, function (err) {
                        mediator.storageRemoveItem('discourseUrl', function () {});
                    });
                }
            });
        } catch (err) {
            console.error(err.stack);
        }
    };

    (function () {
        mediator.doOnInstalled(that.onInstalled);
    }());
};

extensionController.init();
