(function () {
  const grid = document.getElementById('galleryGrid');
  const status = document.getElementById('galleryStatus');
  const sentinel = document.getElementById('gallerySentinel');
  const lightbox = document.getElementById('galleryLightbox');
  const lightboxImage = document.getElementById('galleryLightboxImage');
  const lightboxCaption = document.getElementById('galleryLightboxCaption');
  const lightboxClose = document.getElementById('galleryLightboxClose');
  const filterButtons = Array.from(document.querySelectorAll('[data-gallery-day]'));

  if (!grid || !status || !sentinel || !lightbox || !lightboxImage || !lightboxClose) {
    return;
  }

  const batchSize = 24;
  const dayMeta = {
    1: { label: 'Day 1', place: 'Majdanek' },
    2: { label: 'Day 2', place: 'Majdanek' },
    3: { label: 'Day 3', place: 'Majdanek' },
    4: { label: 'Day 4', place: 'Belzec' },
    5: { label: 'Day 5', place: 'Belzec' },
    6: { label: 'Day 6', place: 'Auschwitz' },
    7: { label: 'Day 7', place: 'Auschwitz' },
  };
  const dayKeys = Object.keys(dayMeta);
  let photos = [];
  let visiblePhotos = [];
  let rendered = 0;
  let activeDay = '1';

  function normalizeDay(value) {
    const day = String(value || '').replace(/^day\s*/i, '');
    return dayMeta[day] ? day : null;
  }

  function fallbackDayForIndex(index, allPhotos) {
    const total = Math.max(allPhotos.length, 1);
    const dayIndex = Math.min(dayKeys.length - 1, Math.floor((index / total) * dayKeys.length));
    return dayKeys[dayIndex];
  }

  function normalizePhoto(photo, index, allPhotos) {
    const fallbackDay = fallbackDayForIndex(index, allPhotos);

    if (typeof photo === 'string') {
      return { src: photo, title: `Photo ${index + 1}`, day: fallbackDay };
    }

    return {
      src: photo.src,
      title: photo.title || `Photo ${index + 1}`,
      day: normalizeDay(photo.day) || fallbackDay,
    };
  }

  function setStatus() {
    const meta = dayMeta[activeDay];
    status.textContent = visiblePhotos.length
      ? `${meta.label} · ${meta.place} · ${Math.min(rendered, visiblePhotos.length)} / ${visiblePhotos.length}`
      : `${meta.label} · ${meta.place} · 0 / 0`;
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

  function setActiveFilter(day) {
    activeDay = dayMeta[day] ? day : '1';
    visiblePhotos = photos.filter((photo) => photo.day === activeDay);
    rendered = 0;
    grid.innerHTML = '';
    grid.classList.toggle('gallery-grid-large--empty', !visiblePhotos.length);

    filterButtons.forEach((button) => {
      const isActive = button.dataset.galleryDay === activeDay;
      button.classList.toggle('is-active', isActive);
      button.setAttribute('aria-pressed', String(isActive));
    });

    const scrollArea = grid.closest('.gallery-scroll');
    if (scrollArea) {
      scrollArea.scrollTo({ top: 0, behavior: 'smooth' });
    }

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

      setActiveFilter(activeDay);
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
      setActiveFilter(button.dataset.galleryDay);
    });
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeLightbox();
    }
  });
})();
