function GenerateAppReadmeAddedModifiedList()
{
    let new_mods = GlobalIndex.packs.filter(m => !GlobalIndexBackup.packs.map(bm => bm.idmod).includes(m.idmod));
    let modified_mods = GlobalIndex.packs.filter(m => !(GlobalIndexBackup.packs.map(bm => JSON.stringify(bm)).includes(JSON.stringify(m)) || new_mods.map(nm => nm.idmod).includes(m.idmod)));

    if (new_mods.length == 0 && modified_mods.length == 0)
        return;

    let additional_value = new Date().toLocaleDateString("ru-RU") + "\n";

    if (new_mods.length > 0)
    {
        additional_value += "Добавлены моды:\n";
        additional_value += new_mods.map(m => "«" + m.title + "»").join(", ") + ".\n";
    }

    if (modified_mods.length > 0)
    {
        additional_value += "Обновлены моды:\n";
        additional_value += modified_mods.map(m => "«" + m.title + "»").join(", ") + ".\n";
    }

    let app_readme = document.getElementById("app_readme");
    app_readme.value = additional_value + "\n" + app_readme.value;

    document.getElementById("app_readme_save_button").disabled = (this.value == GlobalIndex.appReadMe);
    document.getElementById("app_readme_undo_button").disabled = (this.value == GlobalIndex.appReadMe);
}

function InitializeAppReadme()
{
    document.getElementById("app_readme").oninput = function() {
        document.getElementById("app_readme_save_button").disabled = (this.value == GlobalIndex.appReadMe);
        document.getElementById("app_readme_undo_button").disabled = (this.value == GlobalIndex.appReadMe);
    };

    document.getElementById("app_readme_save_button").onclick = function() {
        GlobalIndex.appReadMe = document.getElementById("app_readme").value;
        this.disabled = true;
        document.getElementById("app_readme_undo_button").disabled = true;

        UpdateIndexButtonsState();
    };

    document.getElementById("app_readme_undo_button").onclick = function() {
        document.getElementById("app_readme").value = GlobalIndex.appReadMe;
        document.getElementById("app_readme_save_button").disabled = true;
        this.disabled = true;
    };

    document.getElementById("app_generate_readme_button").onclick = GenerateAppReadmeAddedModifiedList;
}
