var TYPE = {
    NEW_MAIL: 'New Mail',
    ALERTS: 'Alerts',
    REMINDERS: 'Reminders',
    IM_REQUESTS: 'IM requests'
};

chrome.runtime.onConnect.addListener(function (port) {
    port.onMessage.addListener(function (msg) {
        var text = '';
        if (msg[TYPE.NEW_MAIL]) {
            text += msg[TYPE.NEW_MAIL];
        }
        chrome.browserAction.setBadgeText({
            text: text
        });

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
