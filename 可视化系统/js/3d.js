document.getElementById('playPauseButton').addEventListener('click', () => {
  const video = document.getElementById('embedded-video');
  if (video.paused) {
    video.play();
    document.getElementById('playPauseButton').textContent = 'Pause';
  } else {
    video.pause();
    document.getElementById('playPauseButton').textContent = 'Play';
  }
});
