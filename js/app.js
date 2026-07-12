document.addEventListener('DOMContentLoaded', () => {
  // Navigation & Tab Switching
  const navLinks = document.querySelectorAll('nav .links a, .desktop-icon');
  const sections = document.querySelectorAll('.tab-content');
  const windowTitle = document.querySelector('.window-title');
  const windowEl = document.getElementById('retro-window');
  let activeTab = 'home';

  function switchTab(tabId) {
    activeTab = tabId;
    
    // Update active state in nav links
    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href === `#${tabId}`) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    // Toggle section visibility
    sections.forEach(section => {
      if (section.id === `${tabId}-section`) {
        section.classList.add('active');
      } else {
        section.classList.remove('active');
      }
    });

    // Update window title
    windowTitle.textContent = tabId === 'home' ? 'index.md' : `${tabId}.md`;

    // Ensure window is open when navigating
    openWindow();

    // Scroll window content to top
    const contentEl = document.querySelector('.window-content');
    if (contentEl) contentEl.scrollTop = 0;
  }

  // Handle URL hash changes
  function handleHashChange() {
    const hash = window.location.hash.replace('#', '');
    const validTabs = ['home', 'projects', 'capabilities', 'about', 'contact'];
    if (hash && validTabs.includes(hash)) {
      switchTab(hash);
    } else {
      switchTab('home');
    }
  }

  // Bind clicks to navigation links and desktop icons
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href.startsWith('#')) {
        e.preventDefault();
        const tabId = href.replace('#', '');
        window.location.hash = tabId;
      }
    });
  });

  window.addEventListener('hashchange', handleHashChange);
  // Initial load check
  handleHashChange();

  // Window State Actions
  const closeBtn = document.querySelector('.win-btn.close');
  const minimizeBtn = document.querySelector('.win-btn.minimize');
  const resizeBtn = document.querySelector('.win-btn.resize');
  const desktopSpace = document.querySelector('.desktop-empty-space');

  let isOpen = true;
  let isMaximized = false;
  let x = 0;
  let y = 0;

  function openWindow() {
    isOpen = true;
    windowEl.style.display = 'flex';
    if (desktopSpace) desktopSpace.style.display = 'none';
  }

  function closeWindow() {
    isOpen = false;
    windowEl.style.display = 'none';
    if (desktopSpace) desktopSpace.style.display = 'block';
  }

  closeBtn.addEventListener('click', closeWindow);
  minimizeBtn.addEventListener('click', closeWindow);
  
  resizeBtn.addEventListener('click', () => {
    isMaximized = !isMaximized;
    if (isMaximized) {
      windowEl.classList.add('maximized');
      resizeBtn.textContent = '⧉';
      // Reset position to center when maximized
      x = 0;
      y = 0;
      updateWindowTransform();
    } else {
      windowEl.classList.remove('maximized');
      resizeBtn.textContent = '◻';
      updateWindowTransform();
    }
  });

  // Re-open window by clicking desktop icons (already triggers switchTab which calls openWindow)

  // Dragging Mechanics
  const headerEl = document.querySelector('.window-header');
  let isDragging = false;
  let startX, startY;

  function updateWindowTransform() {
    const scale = isMaximized ? 1.05 : 1;
    windowEl.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
  }

  function checkSnapPosition() {
    if (window.innerWidth < 640) return;
    const rect = windowEl.getBoundingClientRect();
    const threshold = 80;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    let shouldSnap = false;
    let targetX = x;
    let targetY = y;

    if (rect.left < threshold) {
      targetX = x + (20 - rect.left);
      shouldSnap = true;
    } else if (rect.right > viewportWidth - threshold) {
      targetX = x + (viewportWidth - 20 - rect.right);
      shouldSnap = true;
    }

    if (rect.top < threshold + 60) {
      targetY = y + (80 - rect.top);
      shouldSnap = true;
    } else if (rect.bottom > viewportHeight - threshold) {
      targetY = y + (viewportHeight - 20 - rect.bottom);
      shouldSnap = true;
    }

    if (shouldSnap) {
      x = targetX;
      y = targetY;
      isMaximized = true;
      windowEl.classList.add('maximized');
      resizeBtn.textContent = '⧉';
      updateWindowTransform();
    }
  }

  headerEl.addEventListener('mousedown', (e) => {
    if (window.innerWidth < 640) return;
    if (e.target.closest('.win-btn')) return;

    isDragging = true;
    windowEl.classList.add('dragging');
    windowEl.style.cursor = 'grabbing';
    
    startX = e.clientX - x;
    startY = e.clientY - y;

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  });

  function onMouseMove(e) {
    if (!isDragging) return;
    x = e.clientX - startX;
    y = e.clientY - startY;
    updateWindowTransform();
  }

  function onMouseUp() {
    isDragging = false;
    windowEl.classList.remove('dragging');
    windowEl.style.cursor = 'grab';
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
    checkSnapPosition();
  }

  // Touch support for mobile/tablets drag
  headerEl.addEventListener('touchstart', (e) => {
    if (window.innerWidth < 640) return;
    if (e.target.closest('.win-btn')) return;

    isDragging = true;
    windowEl.classList.add('dragging');
    
    const touch = e.touches[0];
    startX = touch.clientX - x;
    startY = touch.clientY - y;

    document.addEventListener('touchmove', onTouchMove, { passive: false });
    document.addEventListener('touchend', onTouchEnd);
  });

  function onTouchMove(e) {
    if (!isDragging) return;
    const touch = e.touches[0];
    x = touch.clientX - startX;
    y = touch.clientY - startY;
    updateWindowTransform();
    e.preventDefault(); // Prevent scrolling while dragging
  }

  function onTouchEnd() {
    isDragging = false;
    windowEl.classList.remove('dragging');
    document.removeEventListener('touchmove', onTouchMove);
    document.removeEventListener('touchend', onTouchEnd);
    checkSnapPosition();
  }

  // Handle window resizing to reset position if mobile layout is active
  window.addEventListener('resize', () => {
    if (window.innerWidth < 640) {
      x = 0;
      y = 0;
      isMaximized = false;
      windowEl.classList.remove('maximized');
      resizeBtn.textContent = '◻';
      windowEl.style.transform = 'none';
    }
  });
});
