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

    DisableAllRecursivelyById("mod_card_container");
}

function FillModCard(mod)
{
    DisableAllRecursivelyById("mod_card_container", false);
    document.getElementById("mod_card_save_button").disabled = true;
    document.getElementById("mod_card_undo_button").disabled = true;

    document.getElementById("mod_id").value = mod.idmod;
    document.getElementById("mod_title").value = mod.title;

    for (let mod_platform of mod.platforms)
    {
        let platform = mod_platform.trim().toLowerCase();
        document.getElementById("mod_platform_" + platform).checked = true;
        TogglePlatformBlocksVisibility(platform, true);
    }

    let mod_lang_arr = mod.lang.replace(/\s/g, "").split(",").filter(Boolean);
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

    let mod_lang_arr = mod.lang.replace(/\s/g, "").split(",").filter(Boolean);
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

    DisableAllRecursivelyById("mods_list_container", !unchanged);
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
            mod["files_" + platform] = document.getElementById("mod_" + platform + "_files").value.replace(/\s*,\s*/g, ",").split(",").filter(Boolean);
        }
        else
        {
            delete mod["infouri_" + platform];
            delete mod["files_" + platform];
        }

    UpdateListEntryWithMod(selected, mod);

    document.getElementById("mod_card_save_button").disabled = true;
    document.getElementById("mod_card_undo_button").disabled = true;

    DisableAllRecursivelyById("mods_list_container", false);
}

function InitializeModCard()
{
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

        DisableAllRecursivelyById("mods_list_container", false);
    };
}
