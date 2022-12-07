function UpdateListEntryWithMod(li, mod)
{
    let regex = document.getElementById("mod_list_title_filter").regex;
    let colored_title = mod.title;
    if (regex)
        colored_title = mod.title.replaceAll(regex, s => s.fontcolor("fuchsia"));

    li.innerHTML = mod.idmod + " " + colored_title.bold() + " [" + mod.status + "] &lt;" + mod.lang + "&gt;";
    li.modObject = mod;
    li.modErrors = [];
}

function AddModAsListEntry(mod)
{
    let ul = document.getElementById("mods_list");
    let li = document.createElement("li");
    UpdateListEntryWithMod(li, mod);
    ul.prepend(li);

    return li;
}

function FilterListModTitle(mod)
{
    let regex = document.getElementById("mod_list_title_filter").regex;
    if (!regex)
        return true;

    return regex.test(mod.title);
}

function FilterListModStatus(mod)
{
    if (document.getElementById("mod_list_status_filter_all").checked)
        return true;

    let norm_status = mod.status.trim().toLowerCase();
    if (!(norm_status in GlobalStatuses))
        return false;

    return document.getElementById("mod_list_status_filter_" + GlobalStatuses[norm_status]).checked;
}

function FilterListModLang(mod)
{
    if (document.getElementById("mod_list_lang_filter_all").checked)
        return true;

    let mod_lang_arr = mod.lang.replace(/\s/g, "").split(",").filter(Boolean);
    for (let mod_lang of mod_lang_arr)
    {
        let mod_lang_checkbox = document.getElementById("mod_list_lang_filter_" + mod_lang.toLowerCase());
        if (mod_lang_checkbox && mod_lang_checkbox.checked)
            return true;
    }

    return false;
}

function FilterListMod(mod)
{
    let ret = true;
    ret &&= FilterListModTitle(mod);
    ret &&= FilterListModStatus(mod);
    ret &&= FilterListModLang(mod);
    return ret;
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
    FillModCard(entry.modObject, entry.modErrors);
}

function AddListEntry()
{
    let newMod = {
        "idmod": Math.max(0, ...GlobalIndex.packs.map(o=>o.idmod)) + 1,
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

function NearestListSibling(li)
{
    let sibling = li;
    do sibling = sibling.nextElementSibling; while (sibling && sibling.style.display == "none")

    if (!sibling || sibling.style.display == "none")
    {
        sibling = li;
        do sibling = sibling.previousElementSibling; while (sibling && sibling.style.display == "none")
    }

    return sibling;
}

function DeleteListEntry()
{
    let ul = document.getElementById("mods_list");
    let selected = ul.querySelector('.selected');
    if (!selected || selected.style.display == "none")
        return;

    let sibling = NearestListSibling(selected);

    let index = GlobalIndex.packs.indexOf(selected.modObject);
    if (index !== -1)
        GlobalIndex.packs.splice(index, 1);

    ul.removeChild(selected);

    if (sibling && sibling.style.display != "none")
        SelectListEntry(sibling);
    else
        ClearModCard();
}

function CheckListErrors()
{
    let ul = document.getElementById("mods_list");
    let broken_chk = document.getElementById("mod_list_broken_filter");
    let broken_count = 0;

    for (let li of ul.getElementsByTagName("li"))
    {
        li.modErrors = CheckModErrors(li.modObject);
        if (li.modErrors.length)
        {
            li.style.color = "red";
            broken_count++;
            continue;
        }

        li.style.color = "";
        li.style.display = broken_chk.checked ? "none" : "";
    }

    document.getElementById("mod_list_broken_filter_label").innerHTML = "Only broken (" + broken_count + ")";

    ClearModCard();

    let selected = ul.querySelector('.selected');
    if (!selected)
        return;

    if (selected.style.display == "none")
        selected = NearestListSibling(selected);

    if (selected && selected.style.display != "none")
        SelectListEntry(selected);
}

function InitializeModsList()
{
    let ul = document.getElementById("mods_list");
    ul.disabled = false;
    ul.onclick = function(event) { if (!this.disabled) ListClicked(event); }
    ul.onmousedown = function() { return false; };

    document.getElementById("add_list_entry_button").onclick = function() {
        AddListEntry();
        UpdateIndexButtonsState();
        CheckListErrors();
    }

    document.getElementById("delete_list_entry_button").onclick = function() {
        DeleteListEntry();
        UpdateIndexButtonsState();
        CheckListErrors();
    }

    document.getElementById("mod_list_title_filter").oninput = function() {
        if (/^\s*$/.test(this.value))
            this.regex = undefined;
        else
            try
            {
                this.regex = new RegExp(this.value, "gi");
            }
            catch(e)
            {
                this.regex = undefined;
            }

        ClearModCard();
        IndexFill(GlobalIndex);
    }

    for (let mod_list_status_filter_radio of document.getElementsByName("mod_list_status_filter"))
        mod_list_status_filter_radio.onchange = function() {
            ClearModCard();
            IndexFill(GlobalIndex);
        }

    for (let mod_lang_checkbox of document.getElementsByClassName("mod_list_lang_filter"))
        mod_lang_checkbox.onchange = function() {
            ClearModCard();
            IndexFill(GlobalIndex);
        }

    document.getElementById("mod_list_broken_filter").onchange = function() {
        ClearModCard();
        IndexFill(GlobalIndex);
    }
}
