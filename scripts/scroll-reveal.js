(function () {
  const revealItems = document.querySelectorAll('.reveal-bubble');

  if (!revealItems.length) {
    return;
  }

  if (!('IntersectionObserver' in window)) {
    revealItems.forEach((item) => item.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      entry.target.classList.toggle('is-visible', entry.isIntersecting);
    });
  }, {
    rootMargin: '-8% 0px -12%',
    threshold: 0.18,
  });

  revealItems.forEach((item) => observer.observe(item));
})();
