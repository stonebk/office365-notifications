(function () {
    var port = chrome.runtime.connect(),
        TYPE = {
            NEW_MAIL: 'New Mail',
            ALERTS: 'Alerts',
            REMINDERS: 'Reminders',
            IM_REQUESTS: 'IM requests'
        };

    // "New Mail: 2", "Alerts: 0", "Reminders: 0", "IM requests:0"
    function getNotificationType(title) {
        if (title.indexOf(TYPE.NEW_MAIL) >= 0) {
            return TYPE.NEW_MAIL;
        } else if (title.indexOf(TYPE.ALERTS) >= 0) {
            return TYPE.ALERTS;
        } else if (title.indexOf(TYPE.REMINDERS) >= 0) {
            return TYPE.REMINDERS;
        } else if (title.indexOf(TYPE.IM_REQUESTS) >= 0) {
            return TYPE.IM_REQUESTS;
        }
        port.postMessage({
            error: 'Unknown notification type: ' + title
        });
        return null;
    }

    // "New Mail: 2", "Alerts: 0", "Reminders: 0", "IM requests:0"
    function getNotificationNumber(title) {
        return parseInt(title.match(/\d+/)[0], 10);
    }

    function getNotifications() {
        var msg = {},
            notifications = document.querySelectorAll('.o365cs-notifications-notificationEntryButton');
        notifications = Array.prototype.slice.call(notifications);
        notifications.forEach(function (notification) {
            var title = notification.getAttribute('title');
            msg[getNotificationType(title)] = 0;
            // Make sure notification is visible (up-to-date)
            if (notification.clientHeight) {
                msg[getNotificationType(title)] = getNotificationNumber(title);
            }
        });

        // Post message back to plugin for new message display
        port.postMessage(msg);
    }

    getNotifications();
    if (!window.OUTLOOK_NOTIFIER) {
        window.OUTLOOK_NOTIFIER = setInterval(getNotifications, 60000);
    }

}());
