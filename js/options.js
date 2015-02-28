(function () {

    var domainNode = document.getElementById('domain');

    function load() {
        chrome.storage.sync.get({
            domain: ''
        }, function (items) {
            domainNode.value = items.domain;
        });
    }

    function save() {
        chrome.storage.sync.set({
            domain: domainNode.value
        }, function () {
            // complete
        });
    }

    document.addEventListener('DOMContentLoaded', load);
    document.getElementById('save').addEventListener('click', save);

}());
