const youtubePlayer = document.getElementsByClassName('video-stream')[0];

export function getVideoDuration() {
  return Math.ceil(youtubePlayer.duration);
}

export function getCurrentTime() {
  return Math.ceil(youtubePlayer.currentTime);
}

export function getChannel() {
  return document.querySelector('#text.ytd-channel-name > a').text;
}

export function getVideoTitle() {
  return document.querySelector('.ytd-video-primary-info-renderer.title > yt-formatted-string').textContent;
}

export function getVideoId() {
  return new URLSearchParams(window.location.search).get('v');
}

export function getVideoUploadDate() {
  const dateStr = document.querySelector('#date > yt-formatted-string').textContent;
  const d = new Date(Date.parse(dateStr));
  return `${d.getFullYear()}-${('0'+(d.getMonth()+1)).slice(-2)}-${('0' + d.getDate()).slice(-2)}`;
}

export function getVideoData() {
  return {
    platform: 'youtube',
    channel: getChannel(),
    source_id: getVideoId(),
    title: getVideoTitle(),
    date: getVideoUploadDate(),
  };
}

export function setCurrentTime(time) {
  youtubePlayer.currentTime = time;
}

const videoChangeListeners = [];
let videoChangeChecker = null;
let previousVideoId = null;

export function addVideoChangeListener(listener) {
  videoChangeListeners.push(listener);
  if (videoChangeChecker == null) {
    previousVideoId = getVideoId();
    videoChangeChecker = setInterval(() => {
      const newVideoId = getVideoId();
      if (newVideoId !== previousVideoId) {
        previousVideoId = newVideoId;
        videoChangeListeners.forEach(l => l(newVideoId));
      }
    }, 1000);
  }
}
