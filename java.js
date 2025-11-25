document.addEventListener('DOMContentLoaded', () => {
  document.body.classList.add('js-ready');

  const tabs = document.querySelectorAll('.tab');
  const sections = document.querySelectorAll('.section');
  const reveals = document.querySelectorAll('.reveal');
  const bgPhotos = document.querySelectorAll('.bg-photo');
  const galleryItems = document.querySelectorAll('[data-image]');
  const openButtons = document.querySelectorAll('[data-open]');
  const uploadTrigger = document.querySelector('#upload-trigger');
  const uploadInput = document.querySelector('#photo-upload');
  const galleryContainer = document.querySelector('.gallery');
  const uploadGrid = document.querySelector('.upload-grid');
  const lightbox = document.querySelector('.lightbox');
  const lightboxImg = document.querySelector('.lightbox img');
  const lightboxCaption = document.querySelector('.lightbox__caption');
  const lightboxDownload = document.querySelector('.lightbox .cta');

  const setActiveSection = (target, { scroll = true } = {}) => {
    if (!target) return;
    sections.forEach(section => {
      section.classList.toggle('active', section.id === target);
    });
    tabs.forEach(tab => {
      const isActive = tab.dataset.target === target;
      tab.classList.toggle('active', isActive);
      tab.setAttribute('aria-pressed', isActive);
    });
    bgPhotos.forEach(photo => photo.classList.toggle('active', photo.dataset.section === target));
    document.body.dataset.activeSection = target;
    if (scroll) {
      const main = document.querySelector('main');
      const top = main ? main.offsetTop - 40 : 0;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  tabs.forEach(tab => {
    tab.addEventListener('click', () => setActiveSection(tab.dataset.target));
  });

  // set initial background state
  const initialTab = document.querySelector('.tab.active');
  setActiveSection(initialTab?.dataset.target, { scroll: false });

  // Intersection observer for reveal animations
  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );

  revealElements();
  function revealElements() {
    reveals.forEach(el => observer.observe(el));
  }

  // Background canvas particles for subtle movement
  const canvas = document.querySelector('.bg-canvas');
  const ctx = canvas.getContext('2d');
  let particles = [];

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    particles = Array.from({ length: Math.min(80, Math.floor(canvas.width / 18)) }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.4 + 0.3,
      speed: Math.random() * 0.3 + 0.1,
      drift: Math.random() * 0.3 - 0.15
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, 'rgba(126, 243, 255, 0.12)');
    gradient.addColorStop(1, 'rgba(255, 107, 159, 0.1)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
      p.y += p.speed;
      p.x += p.drift;
      if (p.y > canvas.height + 10) p.y = -10;
      if (p.x > canvas.width + 10) p.x = -10;
      if (p.x < -10) p.x = canvas.width + 10;
    });
    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize);
  resize();
  draw();

  function openLightbox(src, title) {
    lightboxImg.src = src;
    lightboxImg.alt = title;
    lightboxCaption.textContent = title;
    lightboxDownload.href = src;
    lightbox.classList.add('active');
  }

  function closeLightbox() {
    lightbox.classList.remove('active');
  }

  function attachGalleryItem(item) {
    item.addEventListener('click', () => {
      const src = item.dataset.image;
      const title = item.dataset.title || 'Работа';
      openLightbox(src, title);
    });
  }

  galleryItems.forEach(attachGalleryItem);

  openButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('[data-image]');
      if (!card) return;
      openLightbox(card.dataset.image, card.dataset.title || 'Работа');
    });
  });

  lightbox?.addEventListener('click', e => {
    if (e.target === lightbox || e.target.classList.contains('lightbox__close')) {
      closeLightbox();
    }
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && lightbox?.classList.contains('active')) closeLightbox();
  });

  uploadTrigger?.addEventListener('click', () => uploadInput?.click());

  uploadInput?.addEventListener('change', event => {
    const files = Array.from(event.target.files || []);
    if (!files.length || (!galleryContainer && !uploadGrid)) return;

    files.forEach(file => {
      const objectUrl = URL.createObjectURL(file);
      const title = file.name.replace(/\.[^.]+$/, '') || 'Новое фото';

      const tile = document.createElement('div');
      tile.className = 'tile glass tile--frame reveal user-upload';
      tile.dataset.image = objectUrl;
      tile.dataset.title = title;
      tile.innerHTML = `<img src="${objectUrl}" alt="${title}" /><div class=\"tile__label\">${title}</div>`;

      const targetContainer = uploadGrid || galleryContainer;
      targetContainer.querySelectorAll?.('.placeholder').forEach(ph => ph.remove());
      targetContainer.appendChild(tile);
      const img = tile.querySelector('img');
      img?.addEventListener('load', () => tile.classList.add('loaded'));
      observer.observe(tile);
      attachGalleryItem(tile);
    });

    uploadInput.value = '';
  });
});