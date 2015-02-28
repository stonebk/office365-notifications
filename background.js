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

function notify(title, message) {
    chrome.notifications.create('notification' + Math.random(), {
        type: 'basic',
        title: title,
        message: message,
        iconUrl: 'outlook_256.png'
    }, function (notificationId) {
        // do nothing
    });
}

chrome.notifications.onClicked.addListener(function () {
    switchTabs();
});

chrome.runtime.onConnect.addListener(function (port) {
    port.onMessage.addListener(function (msg) {
        var text = '';
        if (msg[TYPE.NEW_MAIL]) {
            text += msg[TYPE.NEW_MAIL];
        }
        chrome.browserAction.setBadgeText({
            text: text
        });

        if (msg[TYPE.ALERTS] + msg[TYPE.REMINDERS]) {
            notify('Alert', 'You have an outlook alert/reminder');
        }
        console.debug(msg);
    });
});

chrome.browserAction.onClicked.addListener(function (tab) {
    switchTabs(function (tabId) {
        chrome.tabs.executeScript(tabId, { file: 'content.js' });
    });
});
