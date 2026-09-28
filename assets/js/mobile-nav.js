// Mobile navigation (hamburger menu) — shared across all pages
document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('header.site-nav').forEach(function (header) {
    var burger = header.querySelector('.burger');
    var nav = header.querySelector('nav.links');
    if (!burger || !nav) return;

    function closeMenu() {
      nav.classList.remove('nav-open');
      burger.setAttribute('aria-expanded', 'false');
    }

    burger.addEventListener('click', function (e) {
      e.stopPropagation();
      var isOpen = nav.classList.toggle('nav-open');
      burger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', closeMenu);
    });

    document.addEventListener('click', function (e) {
      if (!header.contains(e.target)) closeMenu();
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 900) closeMenu();
    });
  });
});
