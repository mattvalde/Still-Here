// ============================================================
//  sidebar.js
//  Injects the sidebar into EVERY page automatically.
//  Each page just needs: <script src="scripts/sidebar.js"></script>
//  To update nav links site-wide, edit only this file.
// ============================================================

(function () {
  const DARK_MODE_KEY = 'bearingWitnessDarkMode';
  const savedDarkMode = localStorage.getItem(DARK_MODE_KEY) === 'true';

  if (savedDarkMode) {
    document.body.classList.add('theme-dark');
  }

  // -- Nav items: edit here to update all pages at once ------
  const NAV_ITEMS = [
    { label: 'Home',          href: 'home.html'       },
    { label: 'About Us',      href: 'about.html'      },
    { label: 'Our Journey',   href: 'ourjourney.html' },
    { label: 'Our Cause',     href: 'cause.html'      },
    { label: 'Resources',     href: 'resources.html'  },
    { label: 'Image Gallery', href: 'gallery.html'    },
    { label: 'What Can I Do?', href: 'cause.html'      },

  ];

  // -- Highlight the link for the current page ---------------
  const currentFile = window.location.pathname.split('/').pop() || 'index.html';

  const navHTML = NAV_ITEMS.map(item => `
    <li>
      <a href="${item.href}"
         class="nav-link${currentFile === item.href ? ' nav-link--active' : ''}">
        ${item.label}
      </a>
    </li>
  `).join('');

  // -- Build the full sidebar HTML ---------------------------
  const sidebarHTML = `
    <aside class="sidebar" id="sidebar">
      <div class="sidebar-inner">

        <div class="sidebar-logo">
          <a href="index.html" aria-label="Home">
            <img class="logo-img logo-img--light" src="assets/images/bearingwitness.png" alt="Logo" />
            <img class="logo-img logo-img--dark" src="assets/images/bearingwitnesswhite.png" alt="Logo" />
          </a>
        </div>

        <nav class="sidebar-nav">
          <ul>${navHTML}</ul>
        </nav>

        <div class="sidebar-footer settings-wrap">
          <button class="sidebar-settings" id="settingsButton" type="button" aria-expanded="false" aria-controls="settingsPanel">Settings</button>
          <div class="settings-panel" id="settingsPanel">
            <label class="settings-toggle" for="darkModeToggle">
              <span>Dark mode toggle</span>
              <span class="theme-switch" title="Dark mode">
                <input type="checkbox" id="darkModeToggle" aria-label="Dark mode" ${savedDarkMode ? 'checked' : ''} />
                <span class="theme-switch__knob"></span>
              </span>
            </label>
          </div>
        </div>

      </div>
    </aside>

    <button class="sidebar-toggle" id="sidebarToggle" aria-label="Toggle sidebar">
      <span id="toggleArrow">&#8592;</span>
    </button>
  `;

  // -- Inject at the top of <body> ---------------------------
  document.body.insertAdjacentHTML('afterbegin', sidebarHTML);

  // -- Collapse / expand toggle ------------------------------
  const toggle = document.getElementById('sidebarToggle');
  const arrow  = document.getElementById('toggleArrow');
  const settingsButton = document.getElementById('settingsButton');
  const settingsPanel = document.getElementById('settingsPanel');
  const darkModeToggle = document.getElementById('darkModeToggle');

  const setArrow = (collapsed) => {
    const isMobile = window.matchMedia('(max-width: 760px)').matches;
    arrow.innerHTML = isMobile
      ? (collapsed ? '&#8595;' : '&#8593;')
      : (collapsed ? '&#8594;' : '&#8592;');
  };

  setArrow(document.body.classList.contains('sidebar-collapsed'));

  toggle.addEventListener('click', () => {
    const collapsed = document.body.classList.toggle('sidebar-collapsed');
    setArrow(collapsed);
  });

  settingsButton.addEventListener('click', (event) => {
    event.preventDefault();
    const isOpen = settingsPanel.classList.toggle('is-open');
    settingsButton.setAttribute('aria-expanded', String(isOpen));
  });

  darkModeToggle.addEventListener('change', () => {
    document.body.classList.toggle('theme-dark', darkModeToggle.checked);
    localStorage.setItem(DARK_MODE_KEY, String(darkModeToggle.checked));
  });

  document.addEventListener('click', (event) => {
    if (!settingsPanel.contains(event.target) && !settingsButton.contains(event.target)) {
      settingsPanel.classList.remove('is-open');
      settingsButton.setAttribute('aria-expanded', 'false');
    }
  });

  window.addEventListener('resize', () => {
    setArrow(document.body.classList.contains('sidebar-collapsed'));
  });

})();
