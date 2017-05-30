var notifications = {},
    TYPE = {
        NEW_MAIL: 'New Mail',
        ALERTS: 'Alerts',
        REMINDERS: 'Reminders',
        IM_REQUESTS: 'IM requests'
    };

/**
 * Get the Office 365 tab.
 *
 * @method getTab
 * @param {Function} callback Returns the tab object if it exists, or null
 */
function getTab(callback) {
    chrome.windows.getAll({
        populate: true
    }, function (windows) {
        var i, j, tabs, tab;
        for (i = 0; i < windows.length; i += 1) {
            tabs = windows[i].tabs;
            for (j = 0; j < tabs.length; j += 1) {
                tab = tabs[j];
                if (tab.url && tab.url.indexOf('outlook.office.com') > 0) {
                    if (callback) {
                        callback(tab);
                    }
                    return;
                }
            }
        }
        if (callback) {
            callback(null);
        }
    });
}

/**
 * Switch to the Office 365 tab.
 *
 * @method switchTab
 * @param {Function} callback Returns the tab object switched to, or null if
 *     there was no switch.
 */
function switchTab(callback) {
    getTab(function (tab) {
        if (tab) {
            chrome.windows.update(tab.windowId, {
                focused: true
            }, function () {
                chrome.tabs.update(tab.id, {
                    selected: true
                }, callback);
            });
        } else {
            if (callback) {
                callback(null);
            }
        }
    });
}

/**
 * Create a new Office 365 tab.
 *
 * @method createTab
 * @param {Function} callback Returns the tab object
 */
function createTab(callback) {
    chrome.storage.sync.get({
        domain: ''
    }, function (items) {
        chrome.tabs.create({
            url: 'http://outlook.com/' + items.domain
        }, callback);
    });
}

/**
 * Checks if the Office 365 tab is the current tab.
 *
 * @method isCurrentTab
 * @param {Function} callback Returns true if current, false otherwise
 */
function isCurrentTab(callback) {
    chrome.tabs.getCurrent(function (tab) {
        callback(tab && tab.url && tab.url.indexOf('outlook') > 0);
    });
}

/**
 * Create a desktop notification.
 *
 * @method notify
 * @param {String} title
 * @param {String} message
 * @param {Function} callback Returns the notificationId
 */
function notify(title, message, callback) {
    isCurrentTab(function (isCurrent) {
        if (!isCurrent) {
            chrome.notifications.create('notification' + Math.random(), {
                type: 'basic',
                title: title,
                message: message,
                iconUrl: 'images/outlook_256.png',
                isClickable: true
            }, function (notificationId) {
                if (callback) {
                    callback(notificationId);
                }
            });
        }
    });
}

/**
 * Update the status of our connection to Office 365
 *
 * @method updateConnectionStatus
 * @param {Boolean} online
 */
function updateConnectionStatus(online) {
    var path = 'images/outlook_32.png';
    if (!online) {
        path = 'images/outlook_grayscale_32.png';

        // Reset notification text
        chrome.browserAction.setBadgeText({
            text: ''
        });
    }
    chrome.browserAction.setIcon({
        path: path
    }, function () { /* noop */ });
}

// Listen for clicks on desktop notifications and switch tabs
chrome.notifications.onClicked.addListener(function (notificationId) {
    switchTab();
    chrome.notifications.clear(notificationId, function () {
        // required, but do nothing
    });
});

// Listen for messages from the content script
chrome.runtime.onConnect.addListener(function (port) {
    port.onMessage.addListener(function (msg) {
        var text = '';
        if (typeof msg[TYPE.NEW_MAIL] === 'number' && msg[TYPE.NEW_MAIL] > 0) {
            text += msg[TYPE.NEW_MAIL];
        }

        // Update browser action alert
        chrome.browserAction.setBadgeText({
            text: text
        });

        // Send desktop notification
        if (msg[TYPE.REMINDERS]) {

            // Clear previous notification
            if (notifications[TYPE.REMINDER]) {
                chrome.notifications.clear(notifications[TYPE.REMINDER], function () {
                    // required, but do nothing
                });
            }

            // Create new notification
            notify('Outlook Reminder', [
                'You have',
                msg[TYPE.REMINDERS],
                'active reminder(s)'
            ].join(' '), function (notificationId) {
                notifications[TYPE.REMINDER] = notificationId;
            });
        }

        console.debug(msg);
    });
});

// Listen for clicks on the browser action button
chrome.browserAction.onClicked.addListener(function (tabId) {
    switchTab(function (tab) {
        if (!tab) {
            createTab();
        }
    });
});

// Periodically search for Office 365 tab and initialize
setInterval(function () {
    getTab(function (tab) {
        if (tab) {
            chrome.tabs.executeScript(tab.id, { file: 'content.js' });
        }
        updateConnectionStatus(!!tab);
    });
}, 5000);
