var TYPE = {
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
    chrome.windows.getLastFocused({}, function (win) {
        chrome.tabs.query({
            windowId: win.id
        }, function (tabs) {
            var tab, i;
            for (i = 0; i < tabs.length; i++) {
                tab = tabs[i];
                if (tab.url && tab.url.indexOf('outlook.office365.com') > 0) {
                    if (callback) {
                        callback(tab);
                    }
                    return;
                }
            }
            callback(null);
        });
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
            chrome.tabs.update(tab.id, {
                selected: true
            }, callback);
        } else {
            callback(null);
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
 */
function notify(title, message) {
    isCurrentTab(function (isCurrent) {
        if (!isCurrent) {
            chrome.notifications.create('notification' + Math.random(), {
                type: 'basic',
                title: title,
                message: message,
                iconUrl: 'outlook_256.png'
            }, function (notificationId) {
                // required, but do nothing
            });
        }
    });
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
        if (msg[TYPE.NEW_MAIL]) {
            // Use "NEW" since the new mail count seems to be inaccurate
            text = 'NEW';
        }
        chrome.browserAction.setBadgeText({
            text: text
        });

        if (msg[TYPE.REMINDERS]) {
            notify('Outlook Reminder', [
                'You have',
                msg[TYPE.REMINDERS],
                'active reminder(s)'
            ].join(' '));
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
    });
}, 60000);
