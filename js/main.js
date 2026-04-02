/* ============================================================
   main.js — Shared JavaScript for WeaselCodes
   Contains all interactive logic for index.html:
   - Tab switching
   - Toggle image buttons (HTML tab)
   - Live CSS demo editor
   - Colour changer (JS tab)
   - Age calculator (JS tab)
   ============================================================ */

/* ============================================================
   Wait for the DOM to fully load before running any code.
   This ensures all elements exist before we try to access them.
   ============================================================ */
document.addEventListener('DOMContentLoaded', function() {

  /* ----------------------------------------------------------
     TAB SWITCHING
     Shows the selected tab panel and hides the others.
     Called by the tab buttons via onclick="showTab('html')" etc.
  ---------------------------------------------------------- */
  window.showTab = function(topic) {
    /* Get all tab buttons and panels */
    const buttons = document.querySelectorAll('.tab-btn');
    const panels  = document.querySelectorAll('.tab-panel');

    /* Remove active from every button and panel */
    buttons.forEach(function(btn) {
      btn.classList.remove('active');
      btn.setAttribute('aria-selected', 'false');
    });
    panels.forEach(function(panel) {
      panel.classList.remove('active');
    });

    /* Add active to the selected button and panel */
    document.getElementById('btn-' + topic).classList.add('active');
    document.getElementById('btn-' + topic).setAttribute('aria-selected', 'true');
    document.getElementById('panel-' + topic).classList.add('active');
  };

  /* ----------------------------------------------------------
     TOGGLE STRUCTURE OUTPUT IMAGE (HTML tab)
     Shows or hides the rendered HTML structure screenshot.
  ---------------------------------------------------------- */
  window.toggleStructureOutput = function() {
    const img = document.getElementById('structure-output-img');
    const btn = document.getElementById('structure-toggle-btn');
    if (img.style.display === 'none') {
      img.style.display = 'block';
      btn.textContent = 'Hide rendered output';
    } else {
      img.style.display = 'none';
      btn.textContent = 'Show rendered output';
    }
  };

  /* ----------------------------------------------------------
     TOGGLE ELEMENTS OUTPUT IMAGE (HTML tab)
     Shows or hides the common HTML elements screenshot.
  ---------------------------------------------------------- */
  window.toggleElementsOutput = function() {
    const img = document.getElementById('elements-output-img');
    const btn = document.getElementById('elements-toggle-btn');
    if (img.style.display === 'none') {
      img.style.display = 'block';
      btn.textContent = 'Hide rendered output';
    } else {
      img.style.display = 'none';
      btn.textContent = 'Show rendered output';
    }
  };

  /* ----------------------------------------------------------
     TOGGLE FORM OUTPUT IMAGE (HTML tab)
     Shows or hides the rendered HTML form screenshot.
  ---------------------------------------------------------- */
  window.toggleFormOutput = function() {
    const img = document.getElementById('form-output-img');
    const btn = document.getElementById('form-toggle-btn');
    if (img.style.display === 'none') {
      img.style.display = 'block';
      btn.textContent = 'Hide rendered output';
    } else {
      img.style.display = 'none';
      btn.textContent = 'Show rendered output';
    }
  };

  /* ----------------------------------------------------------
     TOGGLE TABLE OUTPUT IMAGE (HTML tab)
     Shows or hides the rendered HTML table screenshot.
  ---------------------------------------------------------- */
  window.toggleTableOutput = function() {
    const img = document.getElementById('table-output-img');
    const btn = document.getElementById('table-toggle-btn');
    if (img.style.display === 'none') {
      img.style.display = 'block';
      btn.textContent = 'Hide rendered output';
    } else {
      img.style.display = 'none';
      btn.textContent = 'Show rendered output';
    }
  };

  /* ----------------------------------------------------------
     LIVE CSS DEMO EDITOR (CSS tab)
     Updates the demo box styles in real time as the user
     adjusts the colour pickers and range sliders.
  ---------------------------------------------------------- */
  const demoBox    = document.getElementById('css-demo-box');
  const demoBg     = document.getElementById('demo-bg');
  const demoColor  = document.getElementById('demo-color');
  const demoSize   = document.getElementById('demo-size');
  const demoRadius = document.getElementById('demo-radius');

  /* Only attach listeners if the CSS demo elements exist */
  if (demoBox && demoBg && demoColor && demoSize && demoRadius) {

    /* Update background colour when picker changes */
    demoBg.addEventListener('input', function() {
      demoBox.style.backgroundColor = this.value;
    });

    /* Update text colour when picker changes */
    demoColor.addEventListener('input', function() {
      demoBox.style.color       = this.value;
      demoBox.style.borderColor = this.value;
    });

    /* Update font size when slider moves */
    demoSize.addEventListener('input', function() {
      demoBox.style.fontSize = this.value + 'px';
      document.getElementById('demo-size-label').textContent = this.value + 'px';
    });

    /* Update border radius when slider moves */
    demoRadius.addEventListener('input', function() {
      demoBox.style.borderRadius = this.value + 'px';
      document.getElementById('demo-radius-label').textContent = this.value + 'px';
    });
  }

  /* ----------------------------------------------------------
     COLOUR CHANGER (JS tab)
     Generates a random hex colour and applies it to the box.
  ---------------------------------------------------------- */
  window.changeColour = function() {
    const randomColour = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
    const box = document.getElementById('colour-box');
    if (box) {
      box.style.background = randomColour;
      document.getElementById('colour-code').textContent = randomColour;
    }
  };

  window.resetColour = function() {
    const box = document.getElementById('colour-box');
    if (box) {
      box.style.background = '#1a2235';
      document.getElementById('colour-code').textContent = '#1a2235';
    }
  };

  /* ----------------------------------------------------------
     AGE CALCULATOR (JS tab)
     Calculates the user's age in years and total days
     based on the birthday they enter.
  ---------------------------------------------------------- */
  window.calculateAge = function() {
    const input     = document.getElementById('birthday-input');
    const resultBox = document.getElementById('age-result');
    const errorMsg  = document.getElementById('age-error');

    if (!input || !resultBox || !errorMsg) return;

    /* Hide previous results */
    resultBox.style.display = 'none';
    errorMsg.style.display  = 'none';

    /* Check the user entered a date */
    if (!input.value) {
      errorMsg.textContent   = 'Please enter your date of birth first.';
      errorMsg.style.display = 'block';
      return;
    }

    const today    = new Date();
    const birthday = new Date(input.value);

    /* Reject future dates */
    if (birthday > today) {
      errorMsg.textContent   = 'That date is in the future. Are you a time traveller?';
      errorMsg.style.display = 'block';
      return;
    }

    /* Calculate years */
    let years = today.getFullYear() - birthday.getFullYear();
    const monthDiff = today.getMonth() - birthday.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthday.getDate())) {
      years--;
    }

    /* Calculate total days */
    const msPerDay  = 1000 * 60 * 60 * 24;
    const totalDays = Math.floor((today - birthday) / msPerDay);

    /* Display results */
    document.getElementById('age-years').textContent = 'You are ' + years + ' years old.';
    document.getElementById('age-days').textContent  = 'That is ' + totalDays.toLocaleString() + ' days of being alive.';
    resultBox.style.display = 'block';
  };

}); /* end DOMContentLoaded */
