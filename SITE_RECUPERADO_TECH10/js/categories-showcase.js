document.addEventListener('DOMContentLoaded', function () {
  var showcase = document.querySelector('[data-categories-showcase]');
  var tabs = Array.from(document.querySelectorAll('[data-category-tab]'));
  var panels = Array.from(document.querySelectorAll('[data-category-panel]'));

  if (!showcase || !tabs.length || !panels.length) {
    return;
  }

  function activatePanel(target) {
    tabs.forEach(function (tab) {
      var isActive = tab.getAttribute('data-category-tab') === target;
      tab.classList.toggle('is-active', isActive);
      tab.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });

    panels.forEach(function (panel) {
      var isActive = panel.getAttribute('data-category-panel') === target;
      panel.classList.toggle('is-active', isActive);
    });
  }

  showcase.classList.add('is-interactive');
  activatePanel('services');

  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      activatePanel(tab.getAttribute('data-category-tab'));
    });
  });
});
