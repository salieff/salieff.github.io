function ClearModCard()
{
    document.getElementById("mod_id").value = "";
    document.getElementById("mod_title").value = "";

    for (let mod_lang_checkbox of document.getElementsByClassName("mod_lang"))
        mod_lang_checkbox.checked = false;

    for (let mod_status_radio of document.getElementsByName("mod_status"))
        mod_status_radio.checked = false;

    document.getElementById("mod_uri").removeAttribute("href");
    document.getElementById("mod_uri_text").value = "";
    document.getElementById("mod_files_block").innerHTML = "";

    document.getElementById("mod_errors").value = "";
    document.getElementById("mod_errors_block").style.display = "none";

    DisableAllRecursivelyById("mod_card_container");
}

function FillModCard(mod, mod_errors)
{
    DisableAllRecursivelyById("mod_card_container", false);
    document.getElementById("mod_card_save_button").disabled = true;
    document.getElementById("mod_card_undo_button").disabled = true;

    document.getElementById("mod_id").value = mod.idmod;
    document.getElementById("mod_title").value = mod.title;

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

    if (mod.hasOwnProperty("infouri_android"))
    {
        document.getElementById("mod_uri").href = mod.infouri_android;
        document.getElementById("mod_uri_text").value = mod.infouri_android;
    }

    if (mod.hasOwnProperty("files_android"))
        for (let file_el of mod.files_android.map(el => el.replace(new RegExp("^android/"), "")))
            AddModCardFileSelect(file_el);

    if (mod_errors.length > 0)
    {
        document.getElementById("mod_errors_block").style.display = "";

        let mod_err_el = document.getElementById("mod_errors");
        mod_err_el.value = mod_errors.join("\n");
        mod_err_el.style.height = "auto";
        mod_err_el.style.height = mod_err_el.scrollHeight + "px";
    }
    else
    {
        document.getElementById("mod_errors_block").style.display = "none";
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

    if (mod.hasOwnProperty("infouri_android"))
        unchanged &&= document.getElementById("mod_uri_text").value == mod.infouri_android;
    else
        unchanged &&= !document.getElementById("mod_uri_text").value;

    let html_files = Array.from(document.getElementById("mod_files_block").getElementsByTagName("select")).map(el => "android/" + el.value);
    if (mod.hasOwnProperty("files_android"))
        unchanged &&= JSON.stringify(html_files.slice().sort()) == JSON.stringify(mod.files_android.slice().sort());
    else
        unchanged &&= html_files.length == 0;


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
    mod.platforms = ['android'];

    mod.infouri_android = document.getElementById("mod_uri_text").value;
    mod.files_android = Array.from(document.getElementById("mod_files_block").getElementsByTagName("select")).map(el => "android/" + el.value).slice().sort();

    UpdateListEntryWithMod(selected, mod);

    document.getElementById("mod_card_save_button").disabled = true;
    document.getElementById("mod_card_undo_button").disabled = true;

    DisableAllRecursivelyById("mods_list_container", false);
}

function AddModCardFileSelect(file_name = null) {
    let mod_files_block = document.getElementById("mod_files_block");

    let br = document.createElement("br");
    let sel = mod_files_block.select_file_template.cloneNode(true);
    sel.onchange = UpdateModCardButtonsState;
    if (file_name)
        sel.value = file_name;

    let but = document.createElement("button");
    but.type = "button";
    but.innerText = "X";
    but.onclick = function() {
        this.previousSibling.remove();
        this.nextSibling.remove();
        this.remove();
        UpdateModCardButtonsState();
    }

    mod_files_block.append(sel);
    mod_files_block.append(but);
    mod_files_block.append(br);
}

function InitializeModCard()
{
    document.getElementById("mod_id").oninput = UpdateModCardButtonsState;
    document.getElementById("mod_title").oninput = UpdateModCardButtonsState;

    for (let mod_status_radio of document.getElementsByName("mod_status"))
        mod_status_radio.onchange = UpdateModCardButtonsState;

    for (let mod_lang_checkbox of document.getElementsByClassName("mod_lang"))
        mod_lang_checkbox.onchange = UpdateModCardButtonsState;

    document.getElementById("mod_uri_text").oninput = function() {
        if (/^\s*$/.test(this.value))
            document.getElementById("mod_uri").removeAttribute("href");
        else
            document.getElementById("mod_uri").href = this.value;

        UpdateModCardButtonsState();
    };

    document.getElementById("mod_card_save_button").onclick = function() {
        SaveModCard();
        UpdateIndexButtonsState();
        CheckListErrors();
    }

    document.getElementById("mod_card_undo_button").onclick = function() {
        ClearModCard();

        let ul = document.getElementById("mods_list");
        let selected = ul.querySelector('.selected');
        if (selected)
            FillModCard(selected.modObject, selected.modErrors);

        DisableAllRecursivelyById("mods_list_container", false);
        CheckListErrors();
    };

    LoadAutoIndex("../android/", function(arr) {
        let sel = document.createElement("select");
        for (let el of arr.map(el => el.replace(new RegExp("^../android/"), "")))
        {
            let opt = document.createElement("option");
            opt.text = el;
            opt.value = el;
            sel.append(opt);
        }

        let mod_files_block = document.getElementById("mod_files_block");
        mod_files_block.select_file_template = sel;

        let btn = document.createElement("button");
        btn.type = "button";
        btn.innerText = "+";
        btn.onclick = function() { AddModCardFileSelect(); UpdateModCardButtonsState(); };
        btn.disabled = document.getElementById("mod_card_container").disabled;

        document.getElementById("mod_files_label").append(btn);
    });
}
