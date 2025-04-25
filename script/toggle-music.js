document.addEventListener("DOMContentLoaded", function () {
  const backgroundMusic = document.getElementById("background-music");
  const musicToggle = document.getElementById("music-toggle");
  const previousButton = document.getElementById("previous-button");
  const nextButton = document.getElementById("next-button");
  let musicPlaying = false;

  // Setup music toggle
  musicToggle.addEventListener("click", toggleMusic);

  // Setup previous and next button
  previousButton.addEventListener("click", previousSong);
  nextButton.addEventListener("click", nextSong);

  // Track current song index
  let currentSongIndex = 0;
  // Get all audio sources
  const audioSources = backgroundMusic.querySelectorAll("source");
  const totalSongs = audioSources.length;

  function toggleMusic() {
    if (musicPlaying) {
      backgroundMusic.pause();
      musicToggle.classList.remove("playing");
      document.querySelector(".footer").classList.remove("show-attribution");
    } else {
      backgroundMusic.play().catch((error) => {
        console.error("Audio playback failed:", error);
      });
      musicToggle.classList.add("playing");
      document.querySelector(".footer").classList.add("show-attribution");
    }
    musicPlaying = !musicPlaying;
  }

  function previousSong() {
    // Decrease song index and handle wrap around to the end
    currentSongIndex = (currentSongIndex - 1 + totalSongs) % totalSongs;
    changeSong(currentSongIndex);
  }

  function nextSong() {
    // Increase song index and wrap around to beginning if needed
    currentSongIndex = (currentSongIndex + 1) % totalSongs;
    changeSong(currentSongIndex);
  }

  function changeSong(index) {
    // Store current playback state
    const wasPlaying = !backgroundMusic.paused;

    // Update src attribute to the selected source
    backgroundMusic.src = audioSources[index].src;

    // Update the music attribution based on the current song
    updateMusicAttribution(index);

    // If music was playing, restart it
    if (wasPlaying) {
      backgroundMusic.play().catch((error) => {
        console.error("Audio playback failed:", error);
      });
    }
  }

  function updateMusicAttribution(index) {
    const attributionText = document.querySelector(".music-attribution");

    // Attribution information for each song
    const attributions = [
      'Music: "Cruising" by Aisake, Dosi [NCS Release] - <a href="https://ncs.io/cruising" target="_blank">NoCopyrightSounds</a>',
      'Music: "Colorful Flowers" - <a href="https://www.chosic.com/free-music/all/" target="_blank">Chosic.com</a>',
      'Music: "Heartbreaking" - <a href="https://www.chosic.com/free-music/all/" target="_blank">Chosic.com</a>',
      'Music: "Melody of Nature" - <a href="https://www.chosic.com/free-music/all/" target="_blank">Chosic.com</a>',
      'Music: "Warm Memories" - <a href="https://www.chosic.com/free-music/all/" target="_blank">Chosic.com</a>',
      'Music: "Wildflowers" - <a href="https://www.chosic.com/free-music/all/" target="_blank">Chosic.com</a>',
    ];

    // Update the attribution text
    attributionText.innerHTML = attributions[index] || attributions[0];
  }
});
