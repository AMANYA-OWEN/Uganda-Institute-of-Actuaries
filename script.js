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

  // --- Resource library: search + category filter (resources.html) ---
  var libSearch = document.getElementById("lib-search");
  var libFilters = document.getElementById("lib-filters");
  var libList = document.getElementById("lib-list");
  var libEmpty = document.getElementById("lib-empty");

  if (libList) {
    var libItems = Array.prototype.slice.call(libList.querySelectorAll(".lib-item"));
    var activeCat = "all";

    function applyLibFilters() {
      var query = (libSearch && libSearch.value || "").trim().toLowerCase();
      var visibleCount = 0;
      libItems.forEach(function (item) {
        var matchesCat = activeCat === "all" || item.getAttribute("data-cat") === activeCat;
        var title = (item.getAttribute("data-title") || "").toLowerCase();
        var matchesQuery = query === "" || title.indexOf(query) !== -1;
        var show = matchesCat && matchesQuery;
        item.style.display = show ? "" : "none";
        if (show) visibleCount++;
      });
      if (libEmpty) libEmpty.style.display = visibleCount === 0 ? "block" : "none";
    }

    if (libSearch) {
      libSearch.addEventListener("input", applyLibFilters);
    }
    if (libFilters) {
      libFilters.addEventListener("click", function (e) {
        var chip = e.target.closest(".lib-chip");
        if (!chip) return;
        Array.prototype.forEach.call(libFilters.querySelectorAll(".lib-chip"), function (c) {
          c.setAttribute("aria-pressed", "false");
        });
        chip.setAttribute("aria-pressed", "true");
        activeCat = chip.getAttribute("data-cat");
        applyLibFilters();
      });
    }
  }

  // --- Contact form validation (contact.html) ---
  var contactForm = document.getElementById("contact-form");
  if (contactForm) {
    var statusBox = document.getElementById("form-status");

    function setFieldValid(fieldEl, valid) {
      fieldEl.classList.toggle("invalid", !valid);
    }

    function validateField(fieldEl) {
      var control = fieldEl.querySelector("input, select, textarea");
      if (!control) return true;
      var valid = control.checkValidity();
      setFieldValid(fieldEl, valid);
      return valid;
    }

    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var fields = Array.prototype.slice.call(contactForm.querySelectorAll(".form-field[data-field]"));
      var allValid = true;
      fields.forEach(function (fieldEl) {
        if (!validateField(fieldEl)) allValid = false;
      });

      if (!statusBox) return;
      if (!allValid) {
        statusBox.className = "form-status error";
        statusBox.textContent = "Please correct the highlighted fields before submitting.";
        return;
      }
      statusBox.className = "form-status success";
      statusBox.textContent = "Thank you \u2014 your enquiry has been recorded. The Institute aims to respond within two business days.";
      contactForm.reset();
      fields.forEach(function (fieldEl) { setFieldValid(fieldEl, true); });
    });

    Array.prototype.forEach.call(contactForm.querySelectorAll(".form-field[data-field] input, .form-field[data-field] select, .form-field[data-field] textarea"), function (control) {
      control.addEventListener("blur", function () {
        validateField(control.closest(".form-field"));
      });
    });
  }
});
