function ParseAutoIndex(url, html_str, callback_fn, ret_array, counter_object)
{
    let parser = new DOMParser();
    let htmlDoc = parser.parseFromString(html_str, "text/html");

    for (let anchor of htmlDoc.getElementsByTagName("a"))
    {
        if (anchor.text == "./" || anchor.text == "../")
            continue;

        if (anchor.text.endsWith("/"))
        {
            counter_object.counter++;
            LoadAutoIndex(url + anchor.text, callback_fn, ret_array, counter_object);
            continue;
        }

        ret_array.push(url + anchor.text);
    }

    counter_object.counter--;
    if (counter_object.counter == 0)
        callback_fn(ret_array);
}

function LoadAutoIndex(url, callback_fn, in_array = null, in_counter_object = null)
{
    let ret_array = in_array === null ? [] : in_array;
    let counter_object = in_counter_object === null ? {counter: 1} : in_counter_object;

    fetch(url, {cache: "no-store"})
    .then(response => {
        if (response.ok)
            return response.text();

        throw new Error(response.url + " : " + response.statusText + " (" + response.status + ")");
    })
    .then(html_str => ParseAutoIndex(url, html_str, callback_fn, ret_array, counter_object))
    .catch(error => alert("Autoindex GET error: " + error));
}
