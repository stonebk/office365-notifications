var TYPE = {
    NEW_MAIL: 'New Mail',
    ALERTS: 'Alerts',
    REMINDERS: 'Reminders',
    IM_REQUESTS: 'IM requests'
};

function switchTabs(callback) {
    chrome.windows.getLastFocused({}, function (win) {
        chrome.tabs.query({
            windowId: win.id
        }, function (tabs) {
            var tab, i;
            for (i = 0; i < tabs.length; i++) {
                tab = tabs[i];
                if (tab.url && tab.url.indexOf('outlook') > 0) {
                    chrome.tabs.update(tab.id, {
                        selected: true
                    });
                    if (callback) {
                        callback(tab.id);
                    }
                    return;
                }
            }
        });
    });
}

function isCurrentTab(callback) {
    chrome.tabs.getCurrent(function (tab) {
        callback(tab && tab.url && tab.url.indexOf('outlook') > 0);
    });
}

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

chrome.notifications.onClicked.addListener(function (notificationId) {
    switchTabs();
    chrome.notifications.clear(notificationId, function () {
        // required, but do nothing
    });
});

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
            notify('Outlook Notifier Reminder', [
                'You have',
                msg[TYPE.REMINDERS],
                'active reminder(s)'
            ].join(' '));
        }
        console.debug(msg);
    });
});

chrome.browserAction.onClicked.addListener(function (tab) {
    switchTabs(function (tabId) {
        chrome.tabs.executeScript(tabId, { file: 'content.js' });
    });
});
