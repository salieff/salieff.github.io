let WebDavLockToken = undefined;
let LockRenewIntervalId = undefined;
let ModFilesList = [];
let GlobalIndex = {appTitle: "Установщик дополнений для Everlasting Summer", appReadMe: "", packs: []};
let GlobalIndexBackup = {appTitle: "Установщик дополнений для Everlasting Summer", appReadMe: "", packs: []};

const GlobalStatuses = Object.freeze({
    "окончен": "completed",
    "в разработке": "development",
    "надстройка": "addon",
    "обучаловка": "tutorial",
    "демо": "demo",
    "заморожен": "frozen"
});
