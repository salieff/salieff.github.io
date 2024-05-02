function HideModalDialog(post_close_func)
{
    fade_screen = document.getElementById("myModal");
    fade_screen.style.animation = "none";
    fade_screen.style.opacity = 0;
    fade_screen.offsetHeight;
    fade_screen.style.animation = "fadeIn 0.4s reverse";

    modal_window = document.getElementById("modal_content_window");
    modal_window.style.animation = "none";
    modal_window.style.top = "-300px";
    modal_window.style.opacity = 0;
    modal_window.offsetHeight;
    modal_window.style.animation = "animatetop 0.4s reverse";

    setTimeout(() => {
        fade_screen.style.display = "none";

        if (post_close_func)
            post_close_func();
    }, 520);
}

function ShowModalDialog(header_text, main_text, footer_text, post_close_func = null)
{
    fade_screen = document.getElementById("myModal");
    fade_screen.style.animation = "none";
    fade_screen.style.opacity = 1;
    fade_screen.offsetHeight;
    fade_screen.style.animation = "fadeIn 0.4s";

    modal_window = document.getElementById("modal_content_window");
    modal_window.style.animation = "none";
    modal_window.style.top = "0px";
    modal_window.style.opacity = 1;
    modal_window.offsetHeight;
    modal_window.style.animation = "animatetop 0.4s";

    document.getElementById("modal_close_button").onclick = () => { HideModalDialog(post_close_func); };

    document.getElementById("modal_header_text").innerHTML = header_text;
    document.getElementById("modal_main_text").innerHTML = main_text;
    document.getElementById("modal_footer_text").innerHTML = footer_text;

    fade_screen.style.display = "block";
}
