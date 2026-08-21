document.addEventListener("DOMContentLoaded", function () {
  var toggle = document.querySelector(".nav-toggle");
  var links = document.querySelector(".nav-links");
  if (toggle && links) {
    toggle.addEventListener("click", function () {
      var isOpen = links.classList.toggle("open");
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
  }

  // --- KPI count-up ---------------------------------------------------
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var statItems = document.querySelectorAll(".stat-item[data-value]");

  function formatValue(value, decimals, prefix, suffix) {
    return (prefix || "") + value.toFixed(decimals) + (suffix || "");
  }

  function runCountUp(item) {
    var numberEl = item.querySelector(".stat-number");
    if (!numberEl) return;
    var target = parseFloat(item.getAttribute("data-value"));
    var decimals = parseInt(item.getAttribute("data-decimals") || "0", 10);
    var prefix = item.getAttribute("data-prefix") || "";
    var suffix = item.getAttribute("data-suffix") || "";

    if (reduceMotion || isNaN(target)) {
      numberEl.textContent = formatValue(target, decimals, prefix, suffix);
      return;
    }

    var duration = 1300;
    var startTime = null;

    function step(timestamp) {
      if (startTime === null) startTime = timestamp;
      var progress = Math.min((timestamp - startTime) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      numberEl.textContent = formatValue(target * eased, decimals, prefix, suffix);
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        numberEl.textContent = formatValue(target, decimals, prefix, suffix);
      }
    }
    window.requestAnimationFrame(step);
  }

  if (statItems.length) {
    if ("IntersectionObserver" in window) {
      var observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              runCountUp(entry.target);
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.4 }
      );
      statItems.forEach(function (item) { observer.observe(item); });
    } else {
      statItems.forEach(runCountUp);
    }
  }
});
