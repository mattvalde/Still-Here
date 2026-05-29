(function () {
  const grid = document.getElementById('galleryGrid');
  const status = document.getElementById('galleryStatus');
  const sentinel = document.getElementById('gallerySentinel');
  const lightbox = document.getElementById('galleryLightbox');
  const lightboxImage = document.getElementById('galleryLightboxImage');
  const lightboxCaption = document.getElementById('galleryLightboxCaption');
  const lightboxClose = document.getElementById('galleryLightboxClose');
  const filterButtons = Array.from(document.querySelectorAll('[data-gallery-place]'));

  if (!grid || !status || !sentinel || !lightbox || !lightboxImage || !lightboxClose) {
    return;
  }

  const batchSize = 72;
  const places = ['majdanek', 'belzec', 'auschwitz'];
  const placeLabels = {
    majdanek: 'Majdanek',
    belzec: 'Belzec',
    auschwitz: 'Auschwitz',
  };
  let photos = [];
  let visiblePhotos = [];
  let rendered = 0;
  let activePlace = 'majdanek';

  function normalizePhoto(photo, index) {
    const fallbackPlace = places[index % places.length];

    if (typeof photo === 'string') {
      return { src: photo, title: `Photo ${index + 1}`, place: fallbackPlace };
    }

    return {
      src: photo.src,
      title: photo.title || `Photo ${index + 1}`,
      place: places.includes(String(photo.place).toLowerCase())
        ? String(photo.place).toLowerCase()
        : fallbackPlace,
    };
  }

  function setStatus() {
    status.textContent = visiblePhotos.length
      ? `${placeLabels[activePlace]} · ${Math.min(rendered, visiblePhotos.length)} / ${visiblePhotos.length}`
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
    const nextPhotos = visiblePhotos.slice(rendered, rendered + batchSize);
    const fragment = document.createDocumentFragment();

    nextPhotos.forEach((photo) => {
      fragment.append(createPhotoCard(photo));
    });

    grid.append(fragment);
    rendered += nextPhotos.length;
    setStatus();

    if (rendered >= visiblePhotos.length && observer) {
      observer.disconnect();
    }
  }

  function setActiveFilter(place) {
    activePlace = place;
    visiblePhotos = photos.filter((photo) => photo.place === activePlace);
    rendered = 0;
    grid.innerHTML = '';
    grid.classList.toggle('gallery-grid-large--empty', !visiblePhotos.length);

    filterButtons.forEach((button) => {
      const isActive = button.dataset.galleryPlace === activePlace;
      button.classList.toggle('is-active', isActive);
      button.setAttribute('aria-pressed', String(isActive));
    });

    setStatus();

    if (!visiblePhotos.length) {
      return;
    }

    renderNextBatch();

    if (observer) {
      observer.disconnect();
      observer.observe(sentinel);
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

      if (!photos.length) {
        visiblePhotos = [];
        setStatus();
        grid.classList.add('gallery-grid-large--empty');
        return;
      }

      setActiveFilter(activePlace);
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

  filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      setActiveFilter(button.dataset.galleryPlace);
    });
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeLightbox();
    }
  });
})();
