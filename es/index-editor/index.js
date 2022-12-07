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
        .catch(error => alert("PUT error: " + error));
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

function LockIndexOrStop()
{
    fetch("../project2.json", {method: 'LOCK'})
    .then(response => {
        if (response.ok)
        {
            WebDavLockToken = response.headers.get("Lock-Token");
            window.onbeforeunload = UnlockIndex;
            return;
        }

        throw new Error(response.url + " : " + response.statusText + " (" + response.status + ")");
    })
    .catch(error => {
        window.stop();
        document.getElementsByTagName("body")[0].innerHTML = "";
        alert("Somebody else is editing ES index just now.\nPlease, wait for your turn!\n" + error);
    });
}

function UnlockIndex()
{
    fetch("../project2.json", {
        method: 'UNLOCK',
        headers: { 'Lock-Token': WebDavLockToken }
    })
    .then(response => {
        if (response.status == 200 || response.status == 201 || response.status == 204)
            return;

        throw new Error(response.url + " : " + response.statusText + " (" + response.status + ")");
    })
    .catch(error => {
        alert("Can't unlock index\nNobody else can edit it\n" + error);
    });
}

function BodyMain()
{
    InitializeAppReadme();
    InitializeModsList();
    InitializeModCard();
    InitializeIndex();

    ClearModCard();

    fetch("../project2.json")
    .then(response => {
        if (response.ok)
            return response.json();

        throw new Error(response.url + " : " + response.statusText + " (" + response.status + ")");
    })
    .then(data => IndexDownloaded(data))
    .catch(error => alert("GET error: " + error));
}

LockIndexOrStop();
