(function () {
  const grid = document.getElementById('galleryGrid');
  const status = document.getElementById('galleryStatus');
  const sentinel = document.getElementById('gallerySentinel');
  const lightbox = document.getElementById('galleryLightbox');
  const lightboxImage = document.getElementById('galleryLightboxImage');
  const lightboxCaption = document.getElementById('galleryLightboxCaption');
  const lightboxClose = document.getElementById('galleryLightboxClose');

  if (!grid || !status || !sentinel || !lightbox || !lightboxImage || !lightboxClose) {
    return;
  }

  const batchSize = 72;
  let photos = [];
  let rendered = 0;

  function normalizePhoto(photo, index) {
    if (typeof photo === 'string') {
      return { src: photo, title: `Photo ${index + 1}` };
    }

    return {
      src: photo.src,
      title: photo.title || `Photo ${index + 1}`,
    };
  }

  function setStatus() {
    status.textContent = photos.length
      ? `${Math.min(rendered, photos.length)} / ${photos.length}`
      : '0 / 0';
  }

  function openLightbox(photo) {
    lightboxImage.src = photo.src;
    lightboxImage.alt = photo.title;
    lightboxCaption.textContent = photo.title;
    lightbox.classList.add('is-open');
    lightboxClose.focus();
  }

  function closeLightbox() {
    lightbox.classList.remove('is-open');
    lightboxImage.removeAttribute('src');
  }

  function createPhotoCard(photo) {
    const button = document.createElement('button');
    button.className = 'gallery-card';
    button.type = 'button';
    button.setAttribute('aria-label', photo.title);

    const image = document.createElement('img');
    image.src = photo.src;
    image.alt = photo.title;
    image.loading = 'lazy';
    image.decoding = 'async';

    const caption = document.createElement('span');
    caption.textContent = photo.title;

    button.append(image, caption);
    button.addEventListener('click', () => openLightbox(photo));

    return button;
  }

  function renderNextBatch() {
    const nextPhotos = photos.slice(rendered, rendered + batchSize);
    const fragment = document.createDocumentFragment();

    nextPhotos.forEach((photo) => {
      fragment.append(createPhotoCard(photo));
    });

    grid.append(fragment);
    rendered += nextPhotos.length;
    setStatus();

    if (rendered >= photos.length && observer) {
      observer.disconnect();
    }
  }

  const observer = 'IntersectionObserver' in window
    ? new IntersectionObserver((entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          renderNextBatch();
        }
      }, { rootMargin: '900px 0px' })
    : null;

  fetch('assets/gallery/photos.json')
    .then((response) => response.json())
    .then((data) => {
      photos = data.map(normalizePhoto).filter((photo) => photo.src);
      setStatus();

      if (!photos.length) {
        grid.classList.add('gallery-grid-large--empty');
        return;
      }

      renderNextBatch();

      if (observer) {
        observer.observe(sentinel);
      }
    })
    .catch(() => {
      status.textContent = '0 / 0';
      grid.classList.add('gallery-grid-large--empty');
    });

  lightboxClose.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (event) => {
    if (event.target === lightbox) {
      closeLightbox();
    }
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeLightbox();
    }
  });
})();
