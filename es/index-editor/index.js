function IndexDownloaded(indexObject)
{
    indexObject.packs.forEach(function(item) {
        item.platforms = ['android'];

        if (item.hasOwnProperty("status"))
            item.status = item.status.toLowerCase();

        if (item.hasOwnProperty("lang"))
            item.lang = item.lang.replace(/\s/g, "").split(",").filter(Boolean).filter(l => CapitalizeFirstLetter(l.toLowerCase())).join();

        delete item.infouri_ios;
        delete item.files_ios;
    });

    GlobalIndex = indexObject;
    GlobalIndexBackup = JSON.parse(JSON.stringify(indexObject));

    IndexFill(indexObject);
}

function IndexFill(indexObject)
{
    let app_readme = document.getElementById("app_readme");
    app_readme.value = indexObject.appReadMe;
    app_readme.disabled = false;

    let ul = document.getElementById("mods_list");
    ul.innerHTML = "";

    for (let mod of indexObject.packs.filter(m => FilterListMod(m)))
        AddModAsListEntry(mod);

    ClearModCard();
    DisableAllRecursivelyById("mods_list_container", false);
    CheckListErrors();
}

function UpdateIndexButtonsState()
{
    let unchanged = (JSON.stringify(GlobalIndex) === JSON.stringify(GlobalIndexBackup));
    document.getElementById("index_save_button").disabled = unchanged;
    document.getElementById("index_undo_button").disabled = unchanged;
}

function InitializeIndex()
{
    document.getElementById("index_save_button").onclick = function() {
        fetch("../project2.json", {
            cache: "no-store",
            method: 'PUT',
            headers: { 'Content-Type': 'application/json',
                       'If': "(" + WebDavLockToken + ")" },
            body: JSON.stringify(GlobalIndex, null, 4)
        })
        .then(response => {
            if (response.status == 200 || response.status == 201 || response.status == 204)
            {
                this.disabled = true;
                document.getElementById("index_undo_button").disabled = true;
                GlobalIndexBackup = JSON.parse(JSON.stringify(GlobalIndex));
                return;
            }

            throw new Error(response.url + " : " + response.statusText + " (" + response.status + ")");
        })
        .catch(error => ShowModalDialog("PUT error", error, "Mods index wasn't copied to the server"));
    };

    document.getElementById("index_undo_button").onclick = function() {
        document.getElementById("index_save_button").disabled = true;
        this.disabled = true;
        IndexDownloaded(GlobalIndexBackup);
    };

    document.getElementById("index_save_local_button").onclick = function() {
        LocalDownload(JSON.stringify(GlobalIndex, null, 4), "project2.json", "application/json");
    }

    document.getElementById("index_load_local_button").onchange = function() {
        let reader = new FileReader();
        reader.onload = function() {
            GlobalIndex = JSON.parse(reader.result);
            IndexFill(GlobalIndex);
            UpdateIndexButtonsState();
        };
        reader.readAsText(this.files[0]);
        this.value = "";
    }

}

function FetchIndex()
{
    fetch("../project2.json", {cache: "no-store"})
    .then(response => {
        if (response.ok)
            return response.json();

        throw new Error(response.url + " : " + response.statusText + " (" + response.status + ")");
    })
    .then(data => IndexDownloaded(data))
    .catch(error => ShowModalDialog("GET error", error, "Mods index wasn't loaded from the server"));
}

function LockIndexRenew(lock_timeout)
{
    if (!WebDavLockToken)
        return;

    fetch("../project2.json", {
        method: 'LOCK',
        cache: "no-store",
        headers: { 'If': "(" + WebDavLockToken + ")" }
    })
    .then(response => {
        if (!response.ok)
            throw new Error(response.url + " : " + response.statusText + " (" + response.status + ")", { cause: response.status });
    })
    .catch(error => {
        ShowModalDialog("LOCK error", error, "Failed to renew lock in " + lock_timeout + " seconds");
    });
}

function LockIndexOrStop(success_function)
{
    fetch("../project2.json", {method: 'LOCK', cache: "no-store"})
    .then(response => {
        if (response.ok)
        {
            WebDavLockToken = response.headers.get("Lock-Token");
            window.onbeforeunload = UnlockIndex;

            success_function();

            return response.text();
        }

        throw new Error(response.url + " : " + response.statusText + " (" + response.status + ")", { cause: response.status });
    })
    .then(body_text => {
        let lock_timeout = 30;

        try
        {
            xml_parser = new DOMParser();
            xml_doc = xml_parser.parseFromString(body_text, "text/xml");
            lock_timeout = xml_doc.getElementsByTagName("D:timeout")[0].childNodes[0].nodeValue.replace(/\D+/g, "") / 2;
        }
        catch(err)
        {
            lock_timeout = 30;
        }

        LockRenewIntervalId = setInterval(LockIndexRenew, lock_timeout * 1000, lock_timeout)
    })
    .catch(error => {
        if (error.cause == 423)
        {
            window.stop();
            ShowModalDialog("Shared access to the index is denied",
                            `<p>Somebody else is editing ES index just now</p>
                             <p>It’s impossible to edit the index simultaneously together and merge the result afterwards, unfortunately</p>`,
                            "Please, wait for your turn",
                            () => { document.getElementsByTagName("body")[0].innerHTML = ""; });
        }
        else
        {
            ShowModalDialog("LOCK error", error, "The user session was not locked on the server side");
        }
    });
}

function UnlockIndex()
{
    if (LockRenewIntervalId)
    {
        clearInterval(LockRenewIntervalId);
        LockRenewIntervalId = undefined;
    }

    fetch("../project2.json", {
        method: 'UNLOCK',
        cache: "no-store",
        keepalive: true,
        headers: { 'Lock-Token': WebDavLockToken }
    })
    .then(response => {
        if (response.status == 200 || response.status == 201 || response.status == 204)
            return;

        throw new Error(response.url + " : " + response.statusText + " (" + response.status + ")");
    })
    .catch(error => {
        ShowModalDialog("UNLOCK error", error, "No one will be able to edit the index until the timeout expires");
    });
}

function BodyMain()
{
    InitializeAppReadme();
    InitializeModsList();
    InitializeModCard();
    InitializeIndex();

    ClearModCard();

    LockIndexOrStop(() => LoadModFilesList(FetchIndex));
}
