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
            var title = notification.getAttribute('title'),
                type = getNotificationType(title);

            // Mail notifications are handled separately
            if (type !== TYPE.NEW_MAIL) {
                msg[type] = 0;
                // Make sure notification is visible (up-to-date)
                if (notification.clientHeight) {
                    msg[type] = getNotificationNumber(title);
                }
            }
        });

        // Post message back to plugin for new message display
        port.postMessage(msg);
    }

    if (!window.CALENDAR_INTERVAL) {
        getNotifications();
        window.CALENDAR_INTERVAL = setInterval(getNotifications, 60000);
    }


    /**
     * Get the id for the given subfolder.
     *
     * @method getSubFolderId
     * @param {String} [folder=Inbox]
     * @return {String} folder ID
     */
    function getSubFolderId(folder) {
        folder = folder || 'Inbox';
        var subfolder = document.querySelector('.subfolders[aria-label=' + folder + ']');
        if (subfolder) {
            return subfolder.id.replace('.subfolders', '');
        } else {
            return null;
        }
    }

    /**
     * Get the id for the given favorites folder.
     *
     * @method getFavFolderId
     * @param {String} [folder=Inbox]
     * @return {String} folder ID
     */
    function getFavFolderId(folder) {
        folder = folder || 'Inbox';
        var favorites = document.getElementById('MailFolderPane.FavoritesFolders'),
            folderNode;
        if (favorites) {
            folderNode = favorites.querySelector('[title=' + folder + ']');
            if (folderNode) {
                return folderNode.id.replace('.folder', '');
            }
        }
        return null;
    }

    /**
     * Get the unread mail count for the given folder ID.
     *
     * @method getUnreadCount
     * @param {String} id Folder id
     * @return {Number} Unread count
     */
    function getUnreadCount(id) {
        var node = document.getElementById(id + '.ucount');
        if (node) {
            return parseInt(node.textContent, 10) || 0;
        } else {
            return 0;
        }
    }

    if (!window.MAIL_INTERVAL) {
        window.MAIL_INTERVAL = setInterval(function () {
            var msg = {},
                unread = getUnreadCount(getFavFolderId() || getSubFolderId());
            if (!isNaN(unread)) {
                msg[TYPE.NEW_MAIL] = unread;
                port.postMessage(msg);
            }
        }, 1000);
    }

}());
