function IndexDownloaded(indexObject)
{
    GlobalIndex = indexObject;
    GlobalIndexBackup = JSON.parse(JSON.stringify(indexObject));

    let app_readme = document.getElementById("app_readme");
    app_readme.value = indexObject.appReadMe;
    app_readme.disabled = false;

    let ul = document.getElementById("mods_list");
    ul.innerHTML = "";

    for (let mod of indexObject.packs.filter(m => FilterListMod(m)))
        AddModAsListEntry(mod);

    ClearModCard();
    DisableAllRecursivelyById("mods_list_container", false);
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
        this.disabled = true;
        document.getElementById("index_undo_button").disabled = true;
        GlobalIndexBackup = JSON.parse(JSON.stringify(GlobalIndex));
    };

    document.getElementById("index_undo_button").onclick = function() {
        document.getElementById("index_save_button").disabled = true;
        this.disabled = true;
        IndexDownloaded(GlobalIndexBackup);
    };
}

function BodyMain()
{
    InitializeAppReadme();
    InitializeModsList();
    InitializeModCard();
    InitializeIndex();

    ClearModCard();
    fetch("project2.json").then(response => response.json()).then(data => IndexDownloaded(data)).catch(error => alert("GET error: " + error));
}
