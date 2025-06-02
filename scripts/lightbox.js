
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
