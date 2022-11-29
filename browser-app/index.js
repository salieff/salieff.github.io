var GlobalIndex = undefined;
var GlobalIndexBackup = undefined;

var GlobalStatuses = {
    "окончен": "completed",
    "в разработке": "development",
    "надстройка": "addon",
    "обучаловка": "tutorial",
    "демо": "demo",
    "заморожен": "frozen"
};

function UpdateListEntryWithMod(li, mod)
{
    li.innerHTML = mod.idmod + " " + mod.title.bold() + " [" + mod.status + "] {" + mod.platforms.join(", ").italics() + "} &lt;" + mod.lang + "&gt;";
    li.modObject = mod;
}

function AddModAsListEntry(mod)
{
    let ul = document.getElementById("mods_list");
    let li = document.createElement("li");
    UpdateListEntryWithMod(li, mod);
    ul.prepend(li);

    return li;
}

function IndexDownloaded(indexObject)
{
    GlobalIndex = indexObject;
    GlobalIndexBackup = JSON.parse(JSON.stringify(indexObject));

    let app_readme = document.getElementById("app_readme");
    app_readme.value = indexObject.appReadMe;
    app_readme.disabled = false;

    let ul = document.getElementById("mods_list");
    ul.innerHTML = "";

    for (let mod of indexObject.packs)
        AddModAsListEntry(mod);

    ClearModCard();
    DisableList(false);
}

function RequestIndex(url)
{
    let xh = new XMLHttpRequest();
    xh.onreadystatechange = function() {
        if (xh.readyState != 4)
            return;

        if (xh.status != 200)
            alert("GET error: " + xh.responseText + " (" + xh.status +")");
        else
            IndexDownloaded(JSON.parse(xh.responseText));
    };

    xh.open("GET", url);
    xh.send();
}

function ListClicked(event)
{
    let clickedElement = event.target;
    while (clickedElement.tagName != "LI")
    {
        clickedElement = clickedElement.parentElement;
        if (!clickedElement)
            return;
    }

    SelectListEntry(clickedElement);
}

function SelectListEntry(entry)
{
    let ul = document.getElementById("mods_list");
    let selected = ul.querySelectorAll('.selected');
    for (let elem of selected)
        elem.classList.remove('selected');

    entry.classList.add('selected');

    ClearModCard();
    FillModCard(entry.modObject);
}

function DisableList(disable_flag)
{
    document.getElementById("add_list_entry_button").disabled = disable_flag;
    document.getElementById("delete_list_entry_button").disabled = disable_flag;

    let ul = document.getElementById("mods_list");
    ul.disabled = disable_flag;
    for (let li of ul.getElementsByTagName("li"))
        li.style.color = disable_flag ? 'grey' : 'black';
}

function TogglePlatformBlocksVisibility(platform, visible)
{
    document.getElementById("mod_" + platform + "_uri_block").style.display = visible ? "" : "none";
    document.getElementById("mod_" + platform + "_files_block").style.display = visible ? "" : "none";
}

function ClearModCard()
{
    document.getElementById("mod_id").value = "";
    document.getElementById("mod_title").value = "";

    for (let mod_platform_checkbox of document.getElementsByClassName("mod_platform"))
        mod_platform_checkbox.checked = false;

    for (let mod_lang_checkbox of document.getElementsByClassName("mod_lang"))
        mod_lang_checkbox.checked = false;

    for (let mod_status_radio of document.getElementsByName("mod_status"))
        mod_status_radio.checked = false;

    for (let platform of ['android', 'ios'])
    {
        TogglePlatformBlocksVisibility(platform, false);

        document.getElementById("mod_" + platform + "_uri").removeAttribute("href");
        document.getElementById("mod_" + platform + "_uri_text").value = "";
        document.getElementById("mod_" + platform + "_files").value = "";
    }

    document.getElementById("mod_card_save_button").disabled = true;
    document.getElementById("mod_card_undo_button").disabled = true;
}

function FillModCard(mod)
{
    document.getElementById("mod_id").value = mod.idmod;
    document.getElementById("mod_title").value = mod.title;

    for (let mod_platform of mod.platforms)
    {
        let platform = mod_platform.trim().toLowerCase();
        document.getElementById("mod_platform_" + platform).checked = true;
        TogglePlatformBlocksVisibility(platform, true);
    }

    let mod_lang_arr = mod.lang.replace(/\s/g, "").split(",");
    for (let mod_lang of mod_lang_arr)
    {
        let mod_lang_checkbox = document.getElementById("mod_lang_" + mod_lang.toLowerCase());
        if (mod_lang_checkbox)
            mod_lang_checkbox.checked = true;
    }

    let norm_status = mod.status.trim().toLowerCase();
    if (norm_status in GlobalStatuses)
        document.getElementById("mod_status_" + GlobalStatuses[norm_status]).checked = true;

    for (let platform of ['android', 'ios'])
    {
        if (mod.hasOwnProperty("infouri_" + platform))
        {
            document.getElementById("mod_" + platform + "_uri").href = mod["infouri_" + platform];
            document.getElementById("mod_" + platform + "_uri_text").value = mod["infouri_" + platform];
        }

        if (mod.hasOwnProperty("files_" + platform))
            document.getElementById("mod_" + platform + "_files").value = mod["files_" + platform].join(", ");
    }
}

function AddListEntry()
{
    let newMod = {
        "idmod": Math.max(...GlobalIndex.packs.map(o=>o.idmod)) + 1,
        "platforms": [],
        "title": "",
        "lang": "",
        "status": ""
    };

    GlobalIndex.packs.push(newMod);

    let li = AddModAsListEntry(newMod);
    SelectListEntry(li);
    li.scrollIntoView();
}

function DeleteListEntry()
{
    let ul = document.getElementById("mods_list");
    let selected = ul.querySelector('.selected');
    if (!selected)
        return;

    let sibling = selected.nextElementSibling;
    if (!sibling)
        sibling = selected.previousElementSibling;

    let index = GlobalIndex.packs.indexOf(selected.modObject);
    if (index !== -1)
        GlobalIndex.packs.splice(index, 1);

    ul.removeChild(selected);

    if (sibling)
        SelectListEntry(sibling);
    else
        ClearModCard();
}

function IncludesCaseInsensitive(arr, str)
{
    return arr.some(element => { return element.toLowerCase().trim() === str.toLowerCase().trim(); });
}

function CapitalizeFirstLetter(str)
{
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function UpdateModCardButtonsState()
{
    let ul = document.getElementById("mods_list");
    let selected = ul.querySelector('.selected');
    if (!selected)
        return;

    let mod = selected.modObject;
    let unchanged = true;

    unchanged &&= (document.getElementById("mod_id").value == mod.idmod);
    unchanged &&= (document.getElementById("mod_title").value == mod.title);

    let norm_status = mod.status.trim().toLowerCase();
    unchanged &&= (norm_status in GlobalStatuses && document.getElementById("mod_status_" + GlobalStatuses[norm_status]).checked);

    let mod_lang_arr = mod.lang.replace(/\s/g, "").split(",");
    for (let mod_lang_checkbox of document.getElementsByClassName("mod_lang"))
        if (mod_lang_checkbox.checked)
            unchanged &&= IncludesCaseInsensitive(mod_lang_arr, mod_lang_checkbox.value);
        else
            unchanged &&= !IncludesCaseInsensitive(mod_lang_arr, mod_lang_checkbox.value);

    for (let mod_platform_checkbox of document.getElementsByClassName("mod_platform"))
        if (mod_platform_checkbox.checked)
            unchanged &&= IncludesCaseInsensitive(mod.platforms, mod_platform_checkbox.value);
        else
            unchanged &&= !IncludesCaseInsensitive(mod.platforms, mod_platform_checkbox.value);

    for (let platform of ['android', 'ios'])
    {
        if (mod.hasOwnProperty("infouri_" + platform))
            unchanged &&= (document.getElementById("mod_" + platform + "_uri_text").value == mod["infouri_" + platform]);
        else
            unchanged &&= !document.getElementById("mod_" + platform + "_uri_text").value;

        if (mod.hasOwnProperty("files_" + platform))
            unchanged &&= (document.getElementById("mod_" + platform + "_files").value.replace(/\s*,\s*/g, ",") == mod["files_" + platform].join(","));
        else
            unchanged &&= !document.getElementById("mod_" + platform + "_files").value;
    }

    document.getElementById("mod_card_save_button").disabled = unchanged;
    document.getElementById("mod_card_undo_button").disabled = unchanged;

    DisableList(!unchanged);
}

function SaveModCard()
{
    let ul = document.getElementById("mods_list");
    let selected = ul.querySelector('.selected');
    if (!selected)
        return;

    let mod = selected.modObject;

    mod.idmod = +document.getElementById("mod_id").value; // + for forcing cast to integer
    mod.title = document.getElementById("mod_title").value;

    for (let mod_status_radio of document.getElementsByName("mod_status"))
        if (mod_status_radio.checked)
        {
            mod.status = mod_status_radio.value.toLowerCase();
            break;
        }

    mod.lang = Array.from(document.getElementsByClassName("mod_lang")).filter(chk => chk.checked).map(chk => CapitalizeFirstLetter(chk.value)).join();
    mod.platforms = Array.from(document.getElementsByClassName("mod_platform")).filter(chk => chk.checked).map(chk => chk.value.toLowerCase());

    for (let platform of ['android', 'ios'])
        if (IncludesCaseInsensitive(mod.platforms, platform))
        {
            mod["infouri_" + platform] = document.getElementById("mod_" + platform + "_uri_text").value;
            mod["files_" + platform] = document.getElementById("mod_" + platform + "_files").value.replace(/\s*,\s*/g, ",").split(",");
        }
        else
        {
            delete mod["infouri_" + platform];
            delete mod["files_" + platform];
        }

    UpdateListEntryWithMod(selected, mod);

    document.getElementById("mod_card_save_button").disabled = true;
    document.getElementById("mod_card_undo_button").disabled = true;

    DisableList(false);
}

function UpdateIndexButtonsState()
{
    let unchanged = (JSON.stringify(GlobalIndex) === JSON.stringify(GlobalIndexBackup));
    document.getElementById("index_save_button").disabled = unchanged;
    document.getElementById("index_undo_button").disabled = unchanged;
}

function BodyMain()
{
    let ul = document.getElementById("mods_list");
    ul.disabled = false;
    ul.onclick = function(event) { if (!this.disabled) ListClicked(event); }
    ul.onmousedown = function() { return false; };

    document.getElementById("add_list_entry_button").onclick = function() {
        AddListEntry();
        UpdateIndexButtonsState();
    }

    document.getElementById("delete_list_entry_button").onclick = function() {
        DeleteListEntry();
        UpdateIndexButtonsState();
    }

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

    document.getElementById("mod_id").oninput = UpdateModCardButtonsState;
    document.getElementById("mod_title").oninput = UpdateModCardButtonsState;

    for (let mod_status_radio of document.getElementsByName("mod_status"))
        mod_status_radio.onchange = UpdateModCardButtonsState;

    for (let mod_lang_checkbox of document.getElementsByClassName("mod_lang"))
        mod_lang_checkbox.onchange = UpdateModCardButtonsState;

    for (let mod_platform_checkbox of document.getElementsByClassName("mod_platform"))
        mod_platform_checkbox.onchange = function() {
            TogglePlatformBlocksVisibility(this.value, this.checked);
            UpdateModCardButtonsState();
        };

    for (let platform of ['android', 'ios'])
    {
        document.getElementById("mod_" + platform + "_uri_text").oninput = function() {
            if (/^\s*$/.test(this.value))
                document.getElementById("mod_" + platform + "_uri").removeAttribute("href");
            else
                document.getElementById("mod_" + platform + "_uri").href = this.value;

            UpdateModCardButtonsState();
        };

        document.getElementById("mod_" + platform + "_files").oninput = UpdateModCardButtonsState;
    }

    document.getElementById("mod_card_save_button").onclick = function() {
        SaveModCard();
        UpdateIndexButtonsState();
    }

    document.getElementById("mod_card_undo_button").onclick = function() {
        ClearModCard();

        let ul = document.getElementById("mods_list");
        let selected = ul.querySelector('.selected');
        if (selected)
            FillModCard(selected.modObject);

        DisableList(false);
    };

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

    RequestIndex("project2.json");
}
