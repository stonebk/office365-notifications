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
    chrome.tabs.executeScript({ file: 'content.js' });
});
