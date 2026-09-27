/* =====================================================
   ALISA X // JARVIS VOICE CORE
===================================================== */

const mic = document.getElementById("mic");
const voiceText = document.getElementById("voiceText");
const heard = document.getElementById("heard");
const responseText = document.getElementById("responseText");
const coreState = document.getElementById("coreState");
const voiceStatus = document.getElementById("voiceStatus");
const footerStatus = document.getElementById("footerStatus");
const equalizer = document.getElementById("equalizer");
const terminal = document.getElementById("terminal");
const clock = document.getElementById("clock");
const uptime = document.getElementById("uptime");
const alertBox = document.getElementById("alert");
const alertTitle = document.getElementById("alertTitle");
const alertText = document.getElementById("alertText");
const fullscreen = document.getElementById("fullscreen");
const search = document.getElementById("search");


/* =====================================================
   TIME
===================================================== */

function updateClock() {

    const now = new Date();

    clock.textContent =
        now.toLocaleTimeString("uz-UZ");
}

setInterval(updateClock, 1000);
updateClock();


/* =====================================================
   UPTIME
===================================================== */

let startTime = Date.now();

setInterval(() => {

    const seconds =
        Math.floor(
            (Date.now() - startTime) / 1000
        );

    const h =
        String(Math.floor(seconds / 3600))
            .padStart(2, "0");

    const m =
        String(Math.floor(seconds % 3600 / 60))
            .padStart(2, "0");

    const s =
        String(seconds % 60)
            .padStart(2, "0");

    uptime.textContent =
        `${h}:${m}:${s}`;

}, 1000);


/* =====================================================
   NORMALIZE
===================================================== */

function normalize(text) {

    return text
        .toLowerCase()
        .replace(/[ʻ’‘`]/g, "'")
        .replace(/[?!.,;:()[\]{}]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}


/* =====================================================
   ALERT
===================================================== */

function showAlert(title, text) {

    alertTitle.textContent = title;
    alertText.textContent = text;

    alertBox.classList.add("show");

    setTimeout(() => {

        alertBox.classList.remove("show");

    }, 3000);
}


/* =====================================================
   TERMINAL
===================================================== */

function terminalLog(text) {

    const line =
        document.createElement("div");

    line.textContent =
        "> " + text;

    terminal.appendChild(line);

    while (terminal.children.length > 8) {

        terminal.removeChild(
            terminal.firstChild
        );
    }
}


/* =====================================================
   ANSWER
===================================================== */

function answer(text) {

    responseText.textContent = text;

    terminalLog(text);

    showAlert(
        "ALISA",
        text
    );
}


/* =====================================================
   SPEECH
===================================================== */

function speak(text) {

    if (!window.speechSynthesis) {
        return;
    }

    speechSynthesis.cancel();

    const speech =
        new SpeechSynthesisUtterance(text);

    speech.lang = "uz-UZ";

    speech.rate = 1;

    speech.pitch = .9;

    speech.volume = 1;

    coreState.textContent =
        "SPEAKING";

    voiceText.textContent =
        "ALISA IS SPEAKING";

    speech.onend = () => {

        coreState.textContent =
            "STANDBY";

        voiceText.textContent =
            "VOICE COMMAND READY";
    };

    speechSynthesis.speak(speech);
}


/* =====================================================
   VOICE RECOGNITION
===================================================== */

const Recognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;

let recognition = null;

let listening = false;

if (Recognition) {

    recognition =
        new Recognition();

    recognition.lang =
        "uz-UZ";

    recognition.continuous =
        false;

    recognition.interimResults =
        false;

    recognition.maxAlternatives =
        5;


    recognition.onstart = () => {

        listening = true;

        mic.classList.add("active");

        equalizer.classList.add("active");

        coreState.textContent =
            "LISTENING";

        voiceText.textContent =
            "LISTENING...";

        voiceStatus.textContent =
            "ACTIVE";

        footerStatus.textContent =
            "LISTENING";

        heard.textContent =
            "Gapiring...";

        terminalLog(
            "VOICE INPUT ACTIVE"
        );
    };


    recognition.onresult = event => {

        const text =
            event.results[0][0]
                .transcript;

        heard.textContent =
            `"${text}"`;

        terminalLog(
            "COMMAND: " + text
        );

        execute(text);
    };


    recognition.onerror = event => {

        terminalLog(
            "VOICE ERROR: " +
            event.error
        );

        if (
            event.error ===
            "not-allowed"
        ) {

            answer(
                "Mikrofonga ruxsat berilmadi."
            );

            speak(
                "Mikrofonga ruxsat berilmadi"
            );
        }
    };


    recognition.onend = () => {

        listening = false;

        mic.classList.remove(
            "active"
        );

        equalizer.classList.remove(
            "active"
        );

        coreState.textContent =
            "STANDBY";

        voiceText.textContent =
            "VOICE COMMAND READY";

        voiceStatus.textContent =
            "READY";

        footerStatus.textContent =
            "WAITING";
    };

} else {

    answer(
        "Chrome brauzeridan foydalaning."
    );
}


/* =====================================================
   MICROPHONE
===================================================== */

mic.addEventListener(
    "click",
    () => {

        if (!recognition) {

            answer(
                "Ovozli boshqaruv bu brauzerda mavjud emas."
            );

            return;
        }

        if (listening) {

            recognition.stop();

            return;
        }

        try {

            recognition.start();

        } catch (error) {

            console.log(error);

        }
    }
);


/* =====================================================
   OPEN SITE
===================================================== */

function openSite(url, name) {

    answer(
        `${name} ishga tushirilmoqda...`
    );

    speak(
        `${name} ochilmoqda`
    );

    terminalLog(
        "OPEN: " + name
    );

    const win =
        window.open(
            url,
            "_blank"
        );

    if (!win) {

        setTimeout(() => {

            window.location.href =
                url;

        }, 400);
    }
}


/* =====================================================
   GOOGLE SEARCH
===================================================== */

function googleSearch(query) {

    query = query
        .replace(
            /google'?da/gi,
            ""
        )
        .replace(
            /google/gi,
            ""
        )
        .replace(
            /qidir(uv)?/gi,
            ""
        )
        .replace(
            /izla/gi,
            ""
        )
        .trim();

    if (!query) {

        answer(
            "Google'da nimani qidiray?"
        );

        speak(
            "Google'da nimani qidiray?"
        );

        return;
    }

    const url =
        "https://www.google.com/search?q=" +
        encodeURIComponent(query);

    answer(
        `"${query}" Google'da qidirilmoqda`
    );

    speak(
        `${query} Google'da qidirilmoqda`
    );

    window.open(
        url,
        "_blank"
    );
}


/* =====================================================
   YOUTUBE SEARCH
===================================================== */

function youtubeSearch(query) {

    query = query
        .replace(
            /youtube'?dan/gi,
            ""
        )
        .replace(
            /youtube da/gi,
            ""
        )
        .replace(
            /youtube/gi,
            ""
        )
        .replace(
            /qidir(uv)?/gi,
            ""
        )
        .replace(
            /izla/gi,
            ""
        )
        .trim();

    if (!query) {

        answer(
            "YouTube'da nimani qidiray?"
        );

        speak(
            "YouTube'da nimani qidiray?"
        );

        return;
    }

    const url =
        "https://www.youtube.com/results?search_query=" +
        encodeURIComponent(query);

    answer(
        `"${query}" YouTube'da qidirilmoqda`
    );

    speak(
        `${query} YouTube'da qidirilmoqda`
    );

    window.open(
        url,
        "_blank"
    );
}


/* =====================================================
   TIME
===================================================== */

function tellTime() {

    const now =
        new Date();

    const text =
        "Hozir soat " +
        now.toLocaleTimeString(
            "uz-UZ",
            {
                hour: "2-digit",
                minute: "2-digit"
            }
        );

    answer(text);

    speak(text);
}


/* =====================================================
   DATE
===================================================== */

function tellDate() {

    const now =
        new Date();

    const text =
        "Bugun " +
        now.toLocaleDateString(
            "uz-UZ",
            {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric"
            }
        );

    answer(text);

    speak(text);
}


/* =====================================================
   DARK MODE
===================================================== */

function darkMode() {

    document.body.style.background =
        "#020303";

    answer(
        "Qorong'i rejim yoqildi."
    );

    speak(
        "Qorong'i rejim yoqildi"
    );
}


/* =====================================================
   HELP
===================================================== */

function help() {

    const text =
        "Mavjud buyruqlar ko'rsatildi.";

    answer(text);

    speak(
        "Mavjud buyruqlarni ishlatishingiz mumkin"
    );

    alertBox.classList.add(
        "show"
    );

    alertTitle.textContent =
        "COMMANDS";

    alertText.textContent =
        "YouTube, Google, Telegram, Instagram, qidiruv, vaqt, sana, dark mode, calculator va boshqalar.";
}


/* =====================================================
   CALCULATOR
===================================================== */

function calculator() {

    answer(
        "Kalkulyator ochilmoqda."
    );

    speak(
        "Kalkulyator ochilmoqda"
    );

    window.open(
        "https://www.google.com/search?q=calculator",
        "_blank"
    );
}


/* =====================================================
   MAIN AI COMMAND ENGINE
===================================================== */

function execute(original) {

    const c =
        normalize(original);


    /* HELP */

    if (
        c === "yordam" ||
        c.includes("yordam ber") ||
        c.includes("buyruqlar")
    ) {

        help();

        return;
    }


    /* YOUTUBE SEARCH */

    if (
        c.includes("youtube") &&
        (
            c.includes("qidir") ||
            c.includes("izla") ||
            c.includes("top")
        )
    ) {

        youtubeSearch(original);

        return;
    }


    /* GOOGLE SEARCH */

    if (
        (
            c.includes("google da") ||
            c.includes("googleda") ||
            c.includes("google'da")
        ) &&
        (
            c.includes("qidir") ||
            c.includes("izla") ||
            c.includes("top")
        )
    ) {

        googleSearch(original);

        return;
    }


    /* YOUTUBE */

    if (
        c.includes("youtube") &&
        (
            c.includes("och") ||
            c.includes("kir")
        )
    ) {

        openSite(
            "https://www.youtube.com/",
            "YouTube"
        );

        return;
    }


    /* GOOGLE */

    if (
        c.includes("google") &&
        (
            c.includes("och") ||
            c === "google"
        )
    ) {

        openSite(
            "https://www.google.com/",
            "Google"
        );

        return;
    }


    /* TELEGRAM */

    if (
        c.includes("telegram")
    ) {

        openSite(
            "https://web.telegram.org/",
            "Telegram"
        );

        return;
    }


    /* INSTAGRAM */

    if (
        c.includes("instagram")
    ) {

        openSite(
            "https://www.instagram.com/",
            "Instagram"
        );

        return;
    }


    /* TIKTOK */

    if (
        c.includes("tiktok")
    ) {

        openSite(
            "https://www.tiktok.com/",
            "TikTok"
        );

        return;
    }


    /* FACEBOOK */

    if (
        c.includes("facebook")
    ) {

        openSite(
            "https://www.facebook.com/",
            "Facebook"
        );

        return;
    }


    /* GITHUB */

    if (
        c.includes("github")
    ) {

        openSite(
            "https://github.com/",
            "GitHub"
        );

        return;
    }


    /* CHATGPT */

    if (
        c.includes("chatgpt")
    ) {

        openSite(
            "https://chatgpt.com/",
            "ChatGPT"
        );

        return;
    }


    /* GMAIL */

    if (
        c.includes("gmail")
    ) {

        openSite(
            "https://mail.google.com/",
            "Gmail"
        );

        return;
    }


    /* MAP */

    if (
        c.includes("xarita") ||
        c.includes("google maps") ||
        c.includes("maps")
    ) {

        openSite(
            "https://maps.google.com/",
            "Google Maps"
        );

        return;
    }


    /* CALCULATOR */

    if (
        c.includes("kalkulyator") ||
        c.includes("hisoblagich")
    ) {

        calculator();

        return;
    }


    /* TIME */

    if (
        c.includes("soat nech") ||
        c.includes("vaqt nech") ||
        c === "vaqt"
    ) {

        tellTime();

        return;
    }


    /* DATE */

    if (
        c.includes("bugungi sana") ||
        c.includes("bugun sana") ||
        c.includes("sana nima")
    ) {

        tellDate();

        return;
    }


    /* DARK */

    if (
        c.includes("qorong") ||
        c.includes("dark mode")
    ) {

        darkMode();

        return;
    }


    /* FULLSCREEN */

    if (
        c.includes("fullscreen") ||
        c.includes("to'liq ekran") ||
        c.includes("toliq ekran")
    ) {

        if (
            !document.fullscreenElement
        ) {

            document.documentElement
                .requestFullscreen();

            answer(
                "Fullscreen yoqildi."
            );

            speak(
                "To'liq ekran yoqildi"
            );

        } else {

            document.exitFullscreen();

        }

        return;
    }


    /* RELOAD */

    if (
        c.includes("sahifani yangila") ||
        c.includes("qayta yukla")
    ) {

        speak(
            "Sahifa yangilanmoqda"
        );

        setTimeout(
            () => location.reload(),
            700
        );

        return;
    }


    /* SCROLL TOP */

    if (
        c.includes("yuqoriga chiq") ||
        c === "yuqoriga"
    ) {

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

        answer(
            "Yuqoriga o'tdim."
        );

        speak(
            "Yuqoriga o'tdim"
        );

        return;
    }


    /* GREETING */

    if (
        c === "salom" ||
        c.includes("salom alisa")
    ) {

        answer(
            "Salom. Men Alisaman. Buyruq kutyapman."
        );

        speak(
            "Salom. Men Alisaman. Buyruq kutyapman."
        );

        return;
    }


    /* WHO */

    if (
        c.includes("kimsan") ||
        c.includes("sen kimsan")
    ) {

        answer(
            "Men Alisa X. Ovozli sun'iy intellekt yordamchisiman."
        );

        speak(
            "Men Alisa X. Ovozli sun'iy intellekt yordamchisiman."
        );

        return;
    }


    /* THANKS */

    if (
        c.includes("rahmat") ||
        c.includes("raxmat")
    ) {

        answer(
            "Arzimaydi."
        );

        speak(
            "Arzimaydi"
        );

        return;
    }


    /* UNKNOWN */

    answer(
        `"${original}" buyrug'ini hali tanimadim.`
    );

    speak(
        "Bu buyruqni hali tanimadim"
    );
}


/* =====================================================
   COMMAND BUTTONS
===================================================== */

document
    .querySelectorAll(
        ".commands button"
    )
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const command =
                    button.dataset.command;

                heard.textContent =
                    `"${command}"`;

                execute(command);
            }
        );

    });


/* =====================================================
   COMMAND SEARCH
===================================================== */

search.addEventListener(
    "input",
    () => {

        const value =
            normalize(search.value);

        document
            .querySelectorAll(
                ".commands button"
            )
            .forEach(button => {

                const text =
                    normalize(
                        button.textContent
                    );

                button.style.display =
                    text.includes(value)
                        ? "flex"
                        : "none";
            });
    }
);


/* =====================================================
   FULLSCREEN BUTTON
===================================================== */

fullscreen.addEventListener(
    "click",
    () => {

        if (
            !document.fullscreenElement
        ) {

            document.documentElement
                .requestFullscreen();

        } else {

            document.exitFullscreen();

        }
    }
);


/* =====================================================
   KEYBOARD
===================================================== */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.code === "Space" &&
            document.activeElement.tagName
                !== "INPUT"
        ) {

            event.preventDefault();

            mic.click();
        }

        if (
            event.key === "Escape"
        ) {

            speechSynthesis.cancel();
        }
    }
);


/* =====================================================
   STARTUP
===================================================== */

setTimeout(() => {

    terminalLog(
        "ALISA-X CORE ONLINE"
    );

    terminalLog(
        "VOICE RECOGNITION READY"
    );

    terminalLog(
        "AWAITING COMMAND..."
    );

}, 500);