var TYPE = {
    NEW_MAIL: 'New Mail',
    ALERTS: 'Alerts',
    REMINDERS: 'Reminders',
    IM_REQUESTS: 'IM requests'
};

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
    chrome.tabs.query({
        windowId: window.WINDOW_ID_CURRENT
    }, function (tabs) {
        var tab, i;
        for (i = 0; i < tabs.length; i++) {
            tab = tabs[i];
            if (tab.url && tab.url.indexOf('outlook') > 0) {
                chrome.tabs.update(tab.id, {
                    selected: true
                });
                chrome.tabs.executeScript(tab.id, { file: 'content.js' });
                return;
            }
        }
    });
});
