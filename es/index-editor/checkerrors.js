function CheckModErrorsDoublingFiles(mod)
{
    let err_arr = [];

    for (let other_mod of GlobalIndex.packs.filter(m => m != mod))
        if (mod.hasOwnProperty("files_android") && other_mod.hasOwnProperty("files_android"))
            for (let andr_file of mod.files_android)
                if (other_mod.files_android.includes(andr_file))
                    err_arr.push(other_mod.idmod + " " + other_mod.title + " [" + other_mod.status + "] <" + other_mod.lang + "> refers to the same file " + andr_file);

    return err_arr;
}

function CheckModErrorsNonExistentFiles(mod)
{
    let err_arr = [];

    if (mod.hasOwnProperty("files_android"))
        for (let mod_file of mod.files_android)
            if (!ModFilesList.includes(mod_file))
                err_arr.push("There is non-existent " + mod_file + " in mod.files_android");

    return err_arr;
}

function CheckModErrorsDoublingDescription(mod)
{
    let err_arr = [];

    for (let other_mod of GlobalIndex.packs.filter(m => m != mod))
        if (mod.hasOwnProperty("infouri_android") && other_mod.hasOwnProperty("infouri_android"))
            if (mod.infouri_android.trim() == other_mod.infouri_android.trim())
                err_arr.push(other_mod.idmod + " " + other_mod.title + " [" + other_mod.status + "] <" + other_mod.lang + "> has the same infouri_android");

    return err_arr;
}

function CheckModErrorsDoublingTitle(mod)
{
    let err_arr = [];
    let simplified_title = mod.title.toLowerCase().trim().replace(/s+/g, " ");

    for (let other_mod of GlobalIndex.packs.filter(m => m != mod))
    {
        let simplified_other_title = other_mod.title.toLowerCase().trim().replace(/s+/g, " ");
        if (simplified_title == simplified_other_title)
            err_arr.push(other_mod.idmod + " " + other_mod.title + " [" + other_mod.status + "] <" + other_mod.lang + "> has a similar title");
    }

    return err_arr;
}

function CheckModErrorsDoublingId(mod)
{
    let err_arr = [];

    for (let other_mod of GlobalIndex.packs.filter(m => m != mod))
        if (mod.idmod == other_mod.idmod)
            err_arr.push(other_mod.idmod + " " + other_mod.title + " [" + other_mod.status + "] <" + other_mod.lang + "> has the same idmod");

    return err_arr;
}

function CheckModErrorsStructIncludes(mod, prop, arr, err_arr)
{
    let chk_arr = mod[prop];
    if (!Array.isArray(chk_arr))
        chk_arr = chk_arr.replace(new RegExp("\s*,\s*", "g"), ",").split(",").filter(Boolean);

    if (mod.hasOwnProperty(prop))
        for (bad_el of new Set(chk_arr.filter(el => !arr.includes(el))))
            err_arr.push("There is wrong " + prop + ": " + bad_el);
}

function CheckModErrorsStruct(mod)
{
    let err_arr = [];
    for (let prop of ["idmod", "platforms", "title", "lang", "status", "infouri_android", "files_android"])
    {
        if (!mod.hasOwnProperty(prop))
        {
            err_arr.push("There isn't property " + prop + " in mod");
            continue;
        }

        if (!mod[prop] || !String(mod[prop]))
            err_arr.push("There is empty property " + prop + " in mod");
    }

    if (mod.hasOwnProperty("idmod") && !(Number.isInteger(+mod.idmod) && +mod.idmod > 0))
        err_arr.push("There is wrong idmod " + mod.idmod);

    CheckModErrorsStructIncludes(mod, "platforms", ['android', 'ios'], err_arr);
    CheckModErrorsStructIncludes(mod, "lang", ['Ru', 'Eng', 'Spa'], err_arr);
    CheckModErrorsStructIncludes(mod, "status", ["окончен", "в разработке", "надстройка", "обучаловка", "демо", "заморожен"], err_arr);

    if (mod.hasOwnProperty("infouri_android") && !new RegExp("^http[s]?://").test(mod.infouri_android))
        err_arr.push("infouri_android " + mod.infouri_android + " doesn't start from http[s]?://");

    if (mod.hasOwnProperty("files_android"))
        for (let dblf of new Set(mod.files_android.filter((f, i) => mod.files_android.indexOf(f) != i)))
            err_arr.push("There is double usage of " + dblf + " in mod.files_android");

    return err_arr;
}

function CheckModErrors(mod)
{
    return CheckModErrorsStruct(mod).concat(
           CheckModErrorsDoublingId(mod),
           CheckModErrorsDoublingTitle(mod),
           CheckModErrorsDoublingDescription(mod),
           CheckModErrorsDoublingFiles(mod),
           CheckModErrorsNonExistentFiles(mod));
}
