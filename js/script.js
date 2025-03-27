console.log("let's write javascript")
let currentsong = new Audio();
let songs;
let currfolder;
currentsong.volume = 0.5;

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}



async function getsongs(folder) {
    currfolder = folder;
    let a = await fetch(`http://127.0.0.1:5500/${folder}/`)
    let response = await a.text();

    // console.log(response)
    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")

    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`).pop());
        }
    }

    // console.log(songs)
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0]
    songUL.innerHTML = ""
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + ` <li>
                             <img class="invert" src="img/music.svg" alt="">
                             <div class="info">
                                 <div class="song">${song.replaceAll("%20", " ")}</div>
                                 <div>Bhargavi</div>
                             </div>
                             <div class="playnow">
                                 <span>Play Now</span>
                                 <div><img class="invert" src="img/play.svg" alt=""></div>
                             </div>
                         </li>`
    }

    // Attach an event listener to each song
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {

            playMusic(e.querySelector(".info").firstElementChild.innerHTML)
        })
    })

    return songs
}

const playMusic = (track, pause = false) => {

    // let audio = new Audio("/spotify%20project/songs/" + track)
    currentsong.src = `http://127.0.0.1:5500/${currfolder}/` + track;
    if (!pause) {
        currentsong.play()
        play.src = "img/pause.svg"
    }
    document.querySelector(".songinfo").innerHTML = track.replaceAll("%20", " ")
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"

}

async function displayAlbums() {
    let a = await fetch(`http://127.0.0.1:5500/songs/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let anchores = div.getElementsByTagName("a")
    let cardcontainer = document.querySelector(".cardcontainer")
    let arr = Array.from(anchores)

    for (let index = 0; index < arr.length; index++) {
        const e = arr[index];

        if (e.href.includes("/songs/")) {
            let folder = e.href.split("/").slice(-2)[1]

            //get the metadata of the folder
            let a = await fetch(`http://127.0.0.1:5500/songs/${folder}/info.json`)
            let response = await a.json();
            cardcontainer.innerHTML = cardcontainer.innerHTML + ` <div data-folder="${folder}" class="card">
                        <div class="play-button">
                            <div class="triangle"></div>
                        </div>
                        <img src="/songs/${folder}/cover.jpg" alt="HappyHits">
                        <h2>${response.title}</h2>
                        <p>${response.description}</p>
                    </div>`
        }
    }

    //load the playlist whenever card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {

        e.addEventListener("click", async item => {
            songs = await getsongs(`songs/${item.currentTarget.dataset.folder}`)
            playMusic(songs[0])
        })

    })
}

async function main() {


    await getsongs("/songs/Bollywood")
    playMusic(songs[0], true)

    // display all the Albums on the page
    displayAlbums()

    //attach an event listener to play , previous and next
    play.addEventListener("click", element => {
        if (currentsong.paused) {
            currentsong.play()
            play.src = "img/pause.svg"
        }
        else {
            currentsong.pause()
            play.src = "img/play.svg"
        }
    })

    // Listen for timeupdate event
    currentsong.addEventListener("timeupdate", () => {

        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentsong.currentTime)} / ${secondsToMinutesSeconds(currentsong.duration)}`
        document.querySelector(".circle").style.left = (currentsong.currentTime / currentsong.duration) * 100 + "%";
    })

    // add event listner to seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let persent = (e.offsetX / e.target.getBoundingClientRect().width) * 100
        document.querySelector(".circle").style.left = persent + "%"
        currentsong.currentTime = (currentsong.duration * persent) / 100
    })

    // add event listner to hemburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    })

    // add event listner to close button
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%"
    })

    //add an event listner to previous and next
    previous.addEventListener("click", () => {
        console.log("previous clicked")
        let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0])
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1])
        }
    })

    next.addEventListener("click", () => {
        console.log("next clicked")
        let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0])
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1])
        }
    })

    //ad an event to volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {

        currentsong.volume = parseInt(e.target.value) / 100
        if (currentsong.volume > 0) {
            vol.src = vol.src.replace("img/mute.svg", "img/volume.svg")
        }
        if (currentsong.volume == 0) {
            vol.src = "img/mute.svg"
        }

    })

    //add an event listner to mute the trak
    document.querySelector(".volume>img").addEventListener("click", () => {
        if (vol.src.includes("img/volume.svg")) {
            vol.src = vol.src.replace("img/volume.svg", "img/mute.svg")
            currentsong.volume = 0
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;

        }
        else {
            vol.src = vol.src.replace("img/mute.svg", "img/volume.svg")
            currentsong.volume = .1
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
        }

    })

    // add an event listner to play next song automaticly
    currentsong.addEventListener("ended", () => {
        let Index = songs.indexOf(currentsong.src.split("/").pop());
        if (Index + 1 < songs.length) {
            playMusic(songs[Index + 1]);
        }
    });

    // add an event listner for keypress
    document.addEventListener("keydown", function (event) {

        console.log(event.key)
        switch (event.key) {
            case "ArrowUp": // Increase volume
                currentsong.volume = currentsong.volume + 0.1;
                document.querySelector(".range").getElementsByTagName("input")[0].value = currentsong.volume * 100;
                document.getElementById("vol").src = "img/volume.svg";
                break;
            case "ArrowDown": // Decrease volume
                currentsong.volume = currentsong.volume - 0.1;
                document.querySelector(".range").getElementsByTagName("input")[0].value = currentsong.volume * 100;
                if (document.getElementById("rangex").value==0){
                    vol.src = "img/mute.svg";
                }
                break;
            case "ArrowRight": // Seek forward
                let Index = songs.indexOf(currentsong.src.split("/").slice(-1)[0])
                if ((Index + 1) < songs.length) {
                    playMusic(songs[Index + 1])
                }
                break;
            case "ArrowLeft": // Seek forward
                let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0])
                if ((index - 1) >= 0) {
                    playMusic(songs[index - 1])
                }
                break;
            case " ": // Seek backward
                if (currentsong.paused) {
                    currentsong.play()
                    play.src = "img/pause.svg"
                }
                else {
                    currentsong.pause()
                    play.src = "img/play.svg"
                }
                break;
        }

    });



}

main()