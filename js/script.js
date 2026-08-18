let currentSong = new Audio();
let songs = [];
let currFolder;

const songData = {
    "songs/ncs": [
        "Guzaara.mp3",
        "Haye Mera DIL.mp3",
        "Sheesha.mp3"
    ],

    "songs/Bairan": [
        "Bairan.mp3"
    ],

    "songs/cs": [
        "Legends of 70s.mp3"
    ],

    "songs/Dhurandhar": [
        "Hum Pyaar Karne Wale.mp3",
        "Jaan Se Guzarte Hain.mp3"
    ],

    "songs/Karan Aujla": [
        "For A Reason.mp3"
    ]
};

// 1. Helper: Format Time
function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) return "00:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

// 2. Helper: Update the UI Song List
function updateSongList() {
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0];
    songUL.innerHTML = "";
    for (const song of songs) {
        songUL.innerHTML += `<li><img src="img/music.svg" alt="">
                                <div class="info">
                                    <div>${song}</div>
                                    <div>Harry</div>
                                </div>
                                <div class="playnow">
                                    <span>Play Now</span>
                                    <img class="isize" src="img/play.svg" alt="">
                                </div> </li>`;
    }

    // Attach click listener to each new list item
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", () => {
            let songName = e.querySelector(".info").firstElementChild.innerHTML.trim();
            playMusic(songName);
        });
    });
}

// 3. Fetch Songs
async function getSongs(folder) {
    currFolder = folder;

    songs = songData[folder] || [];

    updateSongList();

    return songs;
}

const menuIcon = document.getElementById("menuIcon");

const leftMenu = document.querySelector(".left");



menuIcon.addEventListener("click", () => {

    if (leftMenu.style.left === "0px") {

        // menu is open → close it

        leftMenu.style.left = "-450px"; // move off-screen

        menuIcon.src = "img/hamburger.svg"; // show hamburger icon

    } else {

        // menu is closed → open it

        leftMenu.style.left = "0";

        menuIcon.src = "img/close.svg"; // show close icon

    }

});

const playMusic = (track, pause = false) => {
    currentSong.src = `${currFolder}/${encodeURIComponent(track)}`;
    if (!pause) {
        currentSong.play();
        play.src = "img/pause.svg";
    }
    document.querySelector(".songinfo").innerHTML = track;
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
}

// Gemini code beacuse of code with harry code is not working

async function displayAlbums() {
    let res = await fetch(`/songs/`);
    let responseText = await res.text();
    let div = document.createElement("div");
    div.innerHTML = responseText;
    let anchors = div.getElementsByTagName("a");
    let cardContainer = document.querySelector(".cardcontainer");

    // Use a for...of loop so we can use 'await' safely inside
    let array = Array.from(anchors);
    for (let index = 0; index < array.length; index++) {
        const e = array[index];

        // 1. Decode the URL to handle %5C (\)
        let decodedHref = decodeURIComponent(e.href);

        // 2. Check if it's a folder inside /songs
        if (decodedHref.includes("/songs") || decodedHref.includes("\\songs")) {

            // 3. Split by / or \ and get folder name
            let parts = decodedHref.split(/[\/\\]/);
            let folder = decodedHref.endsWith("/") || decodedHref.endsWith("\\")
                ? parts[parts.length - 2]
                : parts[parts.length - 1];

            if (folder !== "songs" && folder !== "..") {
                try {
                    // 4. Fetch the metadata (info.json)
                    let infoFetch = await fetch(`/songs/${folder}/info.json`);
                    let infoJson = await infoFetch.json();

                    // 5. Add the card to the container
                    cardContainer.innerHTML = cardContainer.innerHTML + `
                    <div data-folder="${folder}" class="card">
                        <div class="play">
                            <img src="img/play.svg" alt="">
                        </div>
                        <img src="/songs/${folder}/cover.jpg" alt="">
                        <h3>${infoJson.title}</h3>
                        <p>${infoJson.description}</p>
                    </div>`;
                } catch (error) {
                    console.error("Error loading info.json for folder:", folder, error);
                }
            }
        }
    }

    // 6. Attach Event Listeners to the NEW cards
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async (item) => {
            console.log("", item.currentTarget.dataset.folder);
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
            if (songs.length > 0) {
                playMusic(songs[0]);
            }
        });
    });
}

async function main() {

    // Initial Load
    await getSongs("songs/ncs");
    if (songs.length > 0) {
        playMusic(songs[0], true);
    }

    //Display all the Albums on the page
    displayAlbums()


    // Play/Pause Toggle
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "img/pause.svg";
        } else {
            currentSong.pause();
            play.src = "img/playbtn.svg";
        }
    });

    // Time & Seekbar
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML =
            `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`;
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    });

    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100;
    });

    // Prev/Next Logic
    previous.addEventListener("click", () => {
        let currentFileName = decodeURI(currentSong.src.split(/[\/\\]/).pop());
        let index = songs.indexOf(currentFileName);
        if ((index - 1) >= 0) playMusic(songs[index - 1]);
    });

    next.addEventListener("click", () => {
        let currentFileName = decodeURI(currentSong.src.split(/[\/\\]/).pop());
        let index = songs.indexOf(currentFileName);
        if ((index + 1) < songs.length) playMusic(songs[index + 1]);
    });


    // Volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        currentSong.volume = parseInt(e.target.value) / 100;
    });

     // Add event listener to mute the track
    document.querySelector(".volume>img").addEventListener("click", e=>{ 
        if(e.target.src.includes("volume.svg")){
            e.target.src = e.target.src.replace("volume.svg", "mute.svg")
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        }
        else{
            e.target.src = e.target.src.replace("mute.svg", "volume.svg")
            currentSong.volume = .10;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
        }

    })
}

main();