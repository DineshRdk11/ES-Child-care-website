// ES Child Care Centre - Interactive Scripts, Categorized Carousel/Slider & Lightbox
document.addEventListener('DOMContentLoaded', () => {
  // 1. Mobile Menu Drawer Toggle
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenuClose = document.getElementById('mobile-menu-close');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

  function openMobileMenu() {
    if (!mobileMenu) return;
    mobileMenu.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  function closeMobileMenu() {
    if (!mobileMenu) return;
    mobileMenu.classList.add('hidden');
    document.body.style.overflow = '';
  }

  if (mobileMenuBtn) mobileMenuBtn.addEventListener('click', openMobileMenu);
  if (mobileMenuClose) mobileMenuClose.addEventListener('click', closeMobileMenu);
  mobileNavLinks.forEach(link => link.addEventListener('click', closeMobileMenu));

  // 2. Sticky Navbar Glass Effect
  const navbar = document.getElementById('main-navbar');
  window.addEventListener('scroll', () => {
    if (!navbar) return;
    if (window.scrollY > 20) {
      navbar.classList.add('shadow-md', 'bg-white/95');
      navbar.classList.remove('bg-white/90');
    } else {
      navbar.classList.remove('shadow-md', 'bg-white/95');
      navbar.classList.add('bg-white/90');
    }
  });

  // 3. Stats Counter Animation
  const statsElements = document.querySelectorAll('.stat-number');
  let animated = false;

  const animateCounters = () => {
    statsElements.forEach(stat => {
      const target = parseFloat(stat.getAttribute('data-target'));
      const suffix = stat.getAttribute('data-suffix') || '';
      const prefix = stat.getAttribute('data-prefix') || '';
      const duration = 1600;
      const startTime = performance.now();

      const updateCount = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const ease = 1 - (1 - progress) * (1 - progress);
        const currentVal = target % 1 === 0 
          ? Math.floor(ease * target)
          : (ease * target).toFixed(1);

        stat.textContent = `${prefix}${currentVal}${suffix}`;

        if (progress < 1) {
          requestAnimationFrame(updateCount);
        } else {
          stat.textContent = `${prefix}${target}${suffix}`;
        }
      };

      requestAnimationFrame(updateCount);
    });
  };

  const statsSection = document.getElementById('stats-section');
  if (statsSection) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !animated) {
          animated = true;
          animateCounters();
        }
      });
    }, { threshold: 0.2 });

    observer.observe(statsSection);
  }

  // 4. Interactive FAQ Accordion
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const header = item.querySelector('.faq-header');
    const answer = item.querySelector('.faq-answer');

    header.addEventListener('click', () => {
      const isActive = item.classList.contains('active');

      faqItems.forEach(otherItem => {
        otherItem.classList.remove('active');
        const otherAnswer = otherItem.querySelector('.faq-answer');
        if (otherAnswer) otherAnswer.style.maxHeight = null;
      });

      if (!isActive) {
        item.classList.add('active');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });

  // 5. CAROUSEL / SLIDER ENGINE & LIGHTBOX MODAL
  const carouselTrack = document.getElementById('carousel-track');
  const allGalleryCards = Array.from(document.querySelectorAll('.gallery-card'));
  const carouselPrev = document.getElementById('carousel-prev');
  const carouselNext = document.getElementById('carousel-next');
  const floatingPrevBtn = document.getElementById('floating-prev-btn');
  const floatingNextBtn = document.getElementById('floating-next-btn');
  const carouselDotsContainer = document.getElementById('carousel-dots');
  const carouselDotsWrapper = document.getElementById('carousel-dots-container');
  const carouselCounter = document.getElementById('carousel-counter');
  const autoplayBtn = document.getElementById('carousel-autoplay-btn');
  const autoplayIcon = document.getElementById('autoplay-icon');
  const autoplayText = document.getElementById('autoplay-text');
  const galleryViewToggle = document.getElementById('gallery-view-toggle');
  const viewModeIcon = document.getElementById('view-mode-icon');
  const viewModeText = document.getElementById('view-mode-text');

  // Lightbox elements
  const lightboxModal = document.getElementById('lightbox-modal');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxTitle = document.getElementById('lightbox-title');
  const lightboxDesc = document.getElementById('lightbox-desc');
  const lightboxCategory = document.getElementById('lightbox-category');
  const lightboxClose = document.getElementById('lightbox-close');
  const lightboxPrev = document.getElementById('lightbox-prev');
  const lightboxNext = document.getElementById('lightbox-next');

  let currentSlideIndex = 0;
  let autoplayInterval = null;
  let isAutoplayActive = true;
  let isGridMode = false;

  function getVisibleCards() {
    return allGalleryCards.filter(card => !card.classList.contains('hidden'));
  }

  // Update Dynamic Dots and Counter
  function updateCarouselPagination() {
    const visibleCards = getVisibleCards();
    if (!carouselDotsContainer) return;

    carouselDotsContainer.innerHTML = '';
    visibleCards.forEach((card, idx) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = `carousel-dot ${idx === currentSlideIndex ? 'active' : ''}`;
      dot.setAttribute('aria-label', `Go to slide ${idx + 1}`);
      dot.addEventListener('click', (e) => {
        e.stopPropagation();
        scrollToSlide(idx);
      });
      carouselDotsContainer.appendChild(dot);
    });

    updateCounter();
  }

  function updateCounter() {
    const visibleCards = getVisibleCards();
    if (carouselCounter) {
      const total = visibleCards.length;
      const displayIndex = total > 0 ? Math.min(currentSlideIndex + 1, total) : 0;
      carouselCounter.textContent = `Slide ${displayIndex} of ${total}`;
    }

    if (carouselDotsContainer) {
      const dots = carouselDotsContainer.querySelectorAll('.carousel-dot');
      dots.forEach((dot, idx) => {
        if (idx === currentSlideIndex) {
          dot.classList.add('active');
        } else {
          dot.classList.remove('active');
        }
      });
    }
  }

  function scrollToSlide(index) {
    if (!carouselTrack || isGridMode) return;
    const visibleCards = getVisibleCards();
    if (visibleCards.length === 0) return;

    currentSlideIndex = (index + visibleCards.length) % visibleCards.length;
    const targetCard = visibleCards[currentSlideIndex];
    if (targetCard) {
      const targetLeft = targetCard.offsetLeft - carouselTrack.offsetLeft;
      carouselTrack.scrollTo({
        left: targetLeft,
        behavior: 'smooth'
      });
    }
    updateCounter();
  }

  function nextSlide() {
    scrollToSlide(currentSlideIndex + 1);
  }

  function prevSlide() {
    scrollToSlide(currentSlideIndex - 1);
  }

  // Track scroll event to keep active dot synchronized
  let scrollTimeout = null;
  if (carouselTrack) {
    carouselTrack.addEventListener('scroll', () => {
      if (isGridMode) return;
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        const visibleCards = getVisibleCards();
        if (visibleCards.length === 0) return;

        const trackLeft = carouselTrack.scrollLeft;
        let closestIndex = 0;
        let minDistance = Infinity;

        visibleCards.forEach((card, idx) => {
          const cardLeft = card.offsetLeft - carouselTrack.offsetLeft;
          const distance = Math.abs(cardLeft - trackLeft);
          if (distance < minDistance) {
            minDistance = distance;
            closestIndex = idx;
          }
        });

        currentSlideIndex = closestIndex;
        updateCounter();
      }, 60);
    });

    // Touch & Mouse Drag Capability
    let isDown = false;
    let startX = 0;
    let scrollLeftPos = 0;
    let hasDragged = false;

    carouselTrack.addEventListener('mousedown', (e) => {
      if (isGridMode) return;
      isDown = true;
      hasDragged = false;
      startX = e.pageX - carouselTrack.offsetLeft;
      scrollLeftPos = carouselTrack.scrollLeft;
      pauseAutoplay();
    });

    window.addEventListener('mouseup', () => {
      if (isDown) {
        isDown = false;
        if (isAutoplayActive) startAutoplay();
      }
    });

    carouselTrack.addEventListener('mousemove', (e) => {
      if (!isDown || isGridMode) return;
      const x = e.pageX - carouselTrack.offsetLeft;
      const walk = (x - startX) * 1.4;
      if (Math.abs(walk) > 5) hasDragged = true;
      carouselTrack.scrollLeft = scrollLeftPos - walk;
    });

    // Prevent lightbox opening if user was just dragging
    allGalleryCards.forEach(card => {
      card.addEventListener('click', (e) => {
        if (hasDragged) {
          e.preventDefault();
          e.stopPropagation();
          hasDragged = false;
          return;
        }
        openLightbox(card);
      });
    });
  }

  // Buttons Event Listeners
  if (carouselNext) carouselNext.addEventListener('click', () => { nextSlide(); resetAutoplayTimer(); });
  if (carouselPrev) carouselPrev.addEventListener('click', () => { prevSlide(); resetAutoplayTimer(); });
  if (floatingNextBtn) floatingNextBtn.addEventListener('click', () => { nextSlide(); resetAutoplayTimer(); });
  if (floatingPrevBtn) floatingPrevBtn.addEventListener('click', () => { prevSlide(); resetAutoplayTimer(); });

  // Autoplay Logic
  function startAutoplay() {
    if (autoplayInterval) clearInterval(autoplayInterval);
    if (!isAutoplayActive || isGridMode) return;

    autoplayInterval = setInterval(() => {
      nextSlide();
    }, 3800);

    if (autoplayIcon) autoplayIcon.textContent = '⏸';
    if (autoplayText) autoplayText.textContent = 'Pause';
  }

  function pauseAutoplay() {
    if (autoplayInterval) {
      clearInterval(autoplayInterval);
      autoplayInterval = null;
    }
  }

  function resetAutoplayTimer() {
    pauseAutoplay();
    if (isAutoplayActive) startAutoplay();
  }

  if (autoplayBtn) {
    autoplayBtn.addEventListener('click', () => {
      isAutoplayActive = !isAutoplayActive;
      if (isAutoplayActive) {
        startAutoplay();
      } else {
        pauseAutoplay();
        if (autoplayIcon) autoplayIcon.textContent = '▶';
        if (autoplayText) autoplayText.textContent = 'Play';
      }
    });
  }

  // Pause on hover
  if (carouselTrack) {
    carouselTrack.addEventListener('mouseenter', pauseAutoplay);
    carouselTrack.addEventListener('mouseleave', () => {
      if (isAutoplayActive) startAutoplay();
    });
  }

  // View Mode Switcher (Carousel Slider vs Grid View)
  if (galleryViewToggle && carouselTrack) {
    galleryViewToggle.addEventListener('click', () => {
      isGridMode = !isGridMode;
      if (isGridMode) {
        carouselTrack.classList.add('grid-mode');
        if (carouselDotsWrapper) carouselDotsWrapper.classList.add('hidden');
        if (floatingPrevBtn) floatingPrevBtn.classList.add('hidden');
        if (floatingNextBtn) floatingNextBtn.classList.add('hidden');
        if (viewModeIcon) viewModeIcon.textContent = '🎠';
        if (viewModeText) viewModeText.textContent = 'Slider View';
        pauseAutoplay();
      } else {
        carouselTrack.classList.remove('grid-mode');
        if (carouselDotsWrapper) carouselDotsWrapper.classList.remove('hidden');
        if (floatingPrevBtn) floatingPrevBtn.classList.remove('hidden');
        if (floatingNextBtn) floatingNextBtn.classList.remove('hidden');
        if (viewModeIcon) viewModeIcon.textContent = '▦';
        if (viewModeText) viewModeText.textContent = 'Grid View';
        scrollToSlide(0);
        if (isAutoplayActive) startAutoplay();
      }
    });
  }

  // Category Filter Tabs
  const filterBtns = document.querySelectorAll('.gallery-filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => {
        b.classList.remove('bg-brandgreen-700', 'text-white', 'shadow-md');
        b.classList.add('bg-white', 'text-slate-700', 'border', 'border-slate-200');
      });
      btn.classList.remove('bg-white', 'text-slate-700', 'border', 'border-slate-200');
      btn.classList.add('bg-brandgreen-700', 'text-white', 'shadow-md');

      const filterValue = btn.getAttribute('data-filter');
      allGalleryCards.forEach(card => {
        const category = card.getAttribute('data-category');
        if (filterValue === 'all' || category === filterValue) {
          card.classList.remove('hidden');
        } else {
          card.classList.add('hidden');
        }
      });

      currentSlideIndex = 0;
      if (carouselTrack) carouselTrack.scrollTo({ left: 0, behavior: 'smooth' });
      updateCarouselPagination();
      resetAutoplayTimer();
    });
  });

  // Initial setup of Carousel pagination
  updateCarouselPagination();
  startAutoplay();

  // LIGHTBOX MODAL FUNCTIONALITY
  let currentLightboxIndex = 0;

  function openLightbox(card) {
    if (!lightboxModal || !card) return;
    const visibleCards = getVisibleCards();
    currentLightboxIndex = visibleCards.indexOf(card);
    if (currentLightboxIndex === -1) currentLightboxIndex = 0;

    const img = card.querySelector('img');
    const title = card.getAttribute('data-title') || img.alt;
    const desc = card.getAttribute('data-desc') || '';
    const categoryTag = card.getAttribute('data-tag') || '';

    lightboxImg.src = img.src;
    lightboxImg.alt = title;
    if (lightboxTitle) lightboxTitle.textContent = title;
    if (lightboxDesc) lightboxDesc.textContent = desc;
    if (lightboxCategory) lightboxCategory.textContent = categoryTag;

    lightboxModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    pauseAutoplay();
  }

  function closeLightbox() {
    if (!lightboxModal) return;
    lightboxModal.classList.add('hidden');
    document.body.style.overflow = '';
    if (isAutoplayActive && !isGridMode) startAutoplay();
  }

  function showNextLightboxImage() {
    const visibleCards = getVisibleCards();
    if (visibleCards.length === 0) return;
    currentLightboxIndex = (currentLightboxIndex + 1) % visibleCards.length;
    openLightbox(visibleCards[currentLightboxIndex]);
  }

  function showPrevLightboxImage() {
    const visibleCards = getVisibleCards();
    if (visibleCards.length === 0) return;
    currentLightboxIndex = (currentLightboxIndex - 1 + visibleCards.length) % visibleCards.length;
    openLightbox(visibleCards[currentLightboxIndex]);
  }

  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightboxNext) lightboxNext.addEventListener('click', (e) => { e.stopPropagation(); showNextLightboxImage(); });
  if (lightboxPrev) lightboxPrev.addEventListener('click', (e) => { e.stopPropagation(); showPrevLightboxImage(); });

  if (lightboxModal) {
    lightboxModal.addEventListener('click', (e) => {
      if (e.target === lightboxModal || e.target.classList.contains('lightbox-backdrop')) {
        closeLightbox();
      }
    });
  }

  // 6. Interactive Appointment Booking Form & WhatsApp Integration
  const contactForm = document.getElementById('contact-form');
  const toast = document.getElementById('toast-notification');
  const toastMessage = document.getElementById('toast-message');

  function showToast(messageHtml, isSuccess = true) {
    if (!toast) return;
    if (toastMessage) toastMessage.innerHTML = messageHtml;
    
    toast.classList.remove('bg-red-600', 'bg-brandgreen-700', 'bg-emerald-700');
    toast.classList.add(isSuccess ? 'bg-emerald-700' : 'bg-red-600');
    toast.classList.add('show');

    setTimeout(() => {
      toast.classList.remove('show');
    }, 8000);
  }

  if (contactForm) {
    const dateInput = document.getElementById('form-date');
    const timeInput = document.getElementById('form-time');

    // Function to dynamically show ONLY available slots based on selected day
    function updateTimeSlots() {
      if (!timeInput) return;

      const isSunday = dateInput && dateInput.value && (new Date(dateInput.value + 'T00:00:00').getDay() === 0);

      if (isSunday) {
        // Show ONLY available Sunday slots
        timeInput.innerHTML = `
          <option value="Sunday Clinic (4:00 PM - 6:00 PM)">Sunday Evening: 4:00 PM – 6:00 PM</option>
          <option value="Urgent / Earliest Available">Urgent / Earliest Available</option>
        `;
        timeInput.value = 'Sunday Clinic (4:00 PM - 6:00 PM)';
      } else {
        // Show standard Mon-Sat slots
        const prevVal = timeInput.value;
        timeInput.innerHTML = `
          <option value="Morning (9:00 AM - 1:00 PM)">Morning: 9:00 AM – 1:00 PM (Mon–Sat)</option>
          <option value="Afternoon (1:00 PM - 5:00 PM)">Afternoon: 1:00 PM – 5:00 PM (Mon–Sat)</option>
          <option value="Evening (5:00 PM - 9:00 PM)">Evening: 5:00 PM – 9:00 PM (Mon–Sat)</option>
          <option value="Urgent / Earliest Available">Urgent / Earliest Available</option>
        `;
        if (prevVal && !prevVal.includes('Sunday')) {
          timeInput.value = prevVal;
        } else {
          timeInput.value = 'Morning (9:00 AM - 1:00 PM)';
        }
      }
    }

    // Restrict date picker to today onwards
    if (dateInput) {
      const today = new Date().toISOString().split('T')[0];
      dateInput.min = today;

      // Dynamically filter time slots when date changes
      dateInput.addEventListener('change', updateTimeSlots);
      dateInput.addEventListener('input', updateTimeSlots);
      updateTimeSlots();
    }

    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const nameInput = document.getElementById('form-name');
      const phoneInput = document.getElementById('form-email');
      const childInput = document.getElementById('form-child');
      const serviceInput = document.getElementById('form-service');
      const messageInput = document.getElementById('form-message');
      const submitBtn = contactForm.querySelector('button[type="submit"]');

      const parentName = nameInput ? nameInput.value.trim() : '';
      const phone = phoneInput ? phoneInput.value.trim() : '';
      const childInfo = childInput && childInput.value.trim() ? childInput.value.trim() : 'Not specified';
      const service = serviceInput ? serviceInput.value : 'General Paediatric Illness';
      const dateVal = dateInput && dateInput.value ? dateInput.value : 'Earliest Available';
      const timeVal = timeInput ? timeInput.value : 'Morning (9:00 AM - 1:00 PM)';
      const notes = messageInput ? messageInput.value.trim() : '';

      if (!parentName || !phone || !notes) {
        showToast('Please fill out all required fields (Parent Name, Phone Number, and Symptoms/Notes).', false);
        if (!parentName && nameInput) nameInput.focus();
        else if (!phone && phoneInput) phoneInput.focus();
        else if (!notes && messageInput) messageInput.focus();
        return;
      }

      // Format WhatsApp message with clear markdown layout & emojis
      const waMessage = 
        `*APPOINTMENT REQUEST - ES CHILD CARE CENTRE*\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `*Parent / Guardian:* ${parentName}\n` +
        `*Contact Phone:* ${phone}\n` +
        `*Child Name & Age:* ${childInfo}\n` +
        `*Consultation Type:* ${service}\n` +
        `*Preferred Date:* ${dateVal}\n` +
        `*Preferred Slot:* ${timeVal}\n` +
        `*Symptoms / Notes:* ${notes}\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `_Sent via eschildcare.in appointment form_`;

      const waUrl = `https://wa.me/916381486753?text=${encodeURIComponent(waMessage)}`;

      // Immediate visual feedback on the button
      const originalBtnHTML = submitBtn ? submitBtn.innerHTML : '';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
          <svg class="animate-spin -ml-1 mr-2 h-5 w-5 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke-width="4" stroke="currentColor"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Directing to WhatsApp...
        `;
      }

      // Direct navigation straight to WhatsApp without any popup or modal
      window.location.href = waUrl;

      // Reset button and form after redirect
      setTimeout(() => {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnHTML;
        }
        contactForm.reset();
        updateTimeSlots();
      }, 2000);
    });
  }

  // 7. Global Keyboard Handlers
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeMobileMenu();
      closeLightbox();
    }
    if (lightboxModal && !lightboxModal.classList.contains('hidden')) {
      if (e.key === 'ArrowRight') showNextLightboxImage();
      if (e.key === 'ArrowLeft') showPrevLightboxImage();
    } else {
      if (e.key === 'ArrowRight') nextSlide();
      if (e.key === 'ArrowLeft') prevSlide();
    }
  });

  // 8. Smooth Scrolling
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#' || targetId.length <= 1) return;
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        const headerOffset = 80;
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
});
