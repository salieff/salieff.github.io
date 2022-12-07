function DisableAllRecursivelyById(element_id, is_disabled = true)
{
    DisableAllRecursively(document.getElementById(element_id), is_disabled);
}

function DisableAllRecursively(element, is_disabled = true)
{
    for (let child of element.children)
        DisableAllRecursively(child, is_disabled);

    element.disabled = is_disabled
    element.style.color = is_disabled ? 'grey' : '';
}

function IncludesCaseInsensitive(arr, str)
{
    return arr.some(element => { return element.toLowerCase().trim() === str.toLowerCase().trim(); });
}

function CapitalizeFirstLetter(str)
{
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function LocalDownload(data, filename, fileType)
{
    let fileBlob = new Blob([data], {type: fileType});
    let url = URL.createObjectURL(fileBlob);

    let anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    anchor.style.display = 'none';

    document.body.appendChild(anchor);
    anchor.click();

    setTimeout(function() {
            document.body.removeChild(anchor);
            window.URL.revokeObjectURL(url);
    }, 0);
}
