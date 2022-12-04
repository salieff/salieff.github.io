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
}
