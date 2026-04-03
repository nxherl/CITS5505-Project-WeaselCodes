/* ============================================================
   main.js — Shared JavaScript for WeaselCodes
   Contains all interactive logic for index.html:
   - Tab switching
   - Toggle image buttons (HTML tab)
   - Live CSS demo editor
   - Colour changer (JS tab)
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
  /* ----------------------------------------------------------
     TOGGLE OUTPUT IMAGE — shared helper function
     Uses classList.contains to check visibility properly,
     avoiding the double-click bug caused by checking
     img.style.display (which only reads inline styles).
  ---------------------------------------------------------- */
  function toggleOutput(imgId, btnId) {
    const img = document.getElementById(imgId);
    const btn = document.getElementById(btnId);

    /* Check if the image has the hidden class (set by CSS) */
    if (img.classList.contains('toggle-img-visible')) {
      /* Currently visible — hide it */
      img.classList.remove('toggle-img-visible');
      btn.textContent = 'Show output';
    } else {
      /* Currently hidden — show it */
      img.classList.add('toggle-img-visible');
      btn.textContent = 'Hide output';
    }
  }

  window.toggleStructureOutput = function() {
    toggleOutput('structure-output-img', 'structure-toggle-btn');
  };

  window.toggleElementsOutput = function() {
    toggleOutput('elements-output-img', 'elements-toggle-btn');
  };

  window.toggleFormOutput = function() {
    toggleOutput('form-output-img', 'form-toggle-btn');
  };

  window.toggleTableOutput = function() {
    toggleOutput('table-output-img', 'table-toggle-btn');
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



}); /* end DOMContentLoaded */