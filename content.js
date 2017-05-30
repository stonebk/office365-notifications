(function () {
    var port = chrome.runtime.connect();
        TYPE = {
            NEW_MAIL: 'New Mail',
            ALERTS: 'Alerts',
            REMINDERS: 'Reminders',
            IM_REQUESTS: 'IM requests'
        };

    function getNotifications() {
        var msg = {},
            notifications = document.querySelectorAll('.o365cs-notifications-reminders-container');
        msg[TYPE.REMINDERS] = notifications.length;

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
        var folderPane = document.querySelector('[aria-label="Folder Pane"]'),
            folderNode;
        if (folderPane) {
            folderNode = folderPane.querySelector('[title=' + folder + ']');
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
