
document.addEventListener("DOMContentLoaded", () => {
  const lightboxLinks = document.querySelectorAll(".lightbox");
  const modal = document.getElementById("lightbox-modal");
  const img = document.getElementById("lightbox-img");
  let video;

  lightboxLinks.forEach(link => {
    link.addEventListener("click", function(e) {
      e.preventDefault();
      const href = this.getAttribute("href");
      const isVideo = href.endsWith(".mp4");

      if (isVideo) {
        if (!video) {
          video = document.createElement("video");
          video.controls = true;
          video.id = "lightbox-video";
          video.style.maxWidth = "90%";
          video.style.maxHeight = "90%";
          video.style.borderRadius = "10px";
          video.style.boxShadow = "0 0 20px rgba(0,0,0,0.5)";
          modal.appendChild(video);
        }
        img.style.display = "none";
        video.style.display = "block";
        video.src = href;
        video.play();
      } else {
        if (video) {
          video.pause();
          video.style.display = "none";
        }
        img.src = href;
        img.style.display = "block";
      }

      modal.style.display = "flex";
    });
  });

  window.closeLightbox = () => {
    modal.style.display = "none";
    img.src = "";
    if (video) {
      video.pause();
      video.src = "";
    }
  };
});
 const lightboxLinks = document.querySelectorAll('.lightbox');
  const modal = document.getElementById('lightbox-modal');

  lightboxLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();

      const url = this.getAttribute('href');
      let embed;

      // Detect YouTube link and extract video ID
      const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
      if (youtubeMatch) {
        const videoId = youtubeMatch[1];
        embed = document.createElement('iframe');
        embed.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
        embed.allow = 'autoplay; encrypted-media';
        embed.allowFullscreen = true;
      } else {
        // Fallback for images or unsupported media
        embed = document.createElement('img');
        embed.src = url;
      }

      // Clear and insert media
      modal.innerHTML = '';
      modal.appendChild(embed);
      modal.style.display = 'flex';
    });
  });

  // Close modal on click
  modal.addEventListener('click', () => {
    modal.innerHTML = '';
    modal.style.display = 'none';
  });