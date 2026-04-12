/* ============================================================
   quiz.js — All quiz logic for WeaselCodes
   Handles: AJAX loading, randomisation, DOM rendering,
   beforeunload warning, submission validation, scoring,
   reward API fetch, and localStorage attempt history.
   ============================================================ */

/* ---------- Constants ---------- */
const PASS_THRESHOLD  = 0.6;   /* 60% — 6 out of 10 correct to pass */
const STORAGE_KEY     = 'weaselcodes_attempts'; /* localStorage key */
const WEASEL_API_URL  = 'https://en.wikipedia.org/api/rest_v1/page/summary/Weasel'; /* Wikipedia Weasel API */
const QUESTIONS_FILE  = 'data/questions.json';

/* ---------- State variables ---------- */
let questions      = [];   /* questions loaded from JSON */
let userAnswers    = {};   /* stores selected answer index per question */
let quizSubmitted  = false; /* true after successful submission */
let quizStarted    = false; /* true after first answer selected */

/* ============================================================
   1. LOAD QUESTIONS VIA AJAX
   Fetches questions.json using XMLHttpRequest.
   Called automatically when the page loads.
   ============================================================ */
function loadQuestions() {
  const xhr = new XMLHttpRequest();

  /* Open a GET request to the local JSON file */
  xhr.open('GET', QUESTIONS_FILE);
  xhr.setRequestHeader('Accept', 'application/json');

  /* Runs when the request completes */
  xhr.onload = function() {
    if (xhr.status === 200) {
      /* Parse the JSON string into a JavaScript array */
      const data = JSON.parse(xhr.responseText);

      /* Shuffle the questions into a random order */
      questions = shuffleArray(data);

      /* Hide the loading message */
      document.getElementById('quiz-loading').hidden = true;

      /* Render the questions into the DOM */
      renderQuestions();

      /* Show the questions container and submit button */
      document.getElementById('questions-container').hidden = false;
      document.getElementById('submit-area').hidden = false;

    } else {
      /* Show error if request failed */
      showQuizError();
    }
  };

  /* Runs if the network request fails entirely */
  xhr.onerror = function() {
    showQuizError();
  };

  xhr.send();
}

/* ============================================================
   2. SHUFFLE ARRAY
   Takes an array and returns it in a random order.
   Uses the Fisher-Yates shuffle algorithm.
   ============================================================ */
function shuffleArray(array) {
  /* Create a copy so we don't modify the original */
  const shuffled = array.slice();

  /* Loop from the end of the array backwards */
  for (let i = shuffled.length - 1; i > 0; i--) {
    /* Pick a random index from 0 to i */
    const j = Math.floor(Math.random() * (i + 1));

    /* Swap the elements at i and j */
    const temp  = shuffled[i];
    shuffled[i] = shuffled[j];
    shuffled[j] = temp;
  }

  return shuffled;
}

/* ============================================================
   3. RENDER QUESTIONS INTO THE DOM
   Dynamically creates HTML for each question and injects
   it into the #questions-container div. Nothing is
   hardcoded in the HTML — all created here via JavaScript.
   ============================================================ */
function renderQuestions() {
  const container = document.getElementById('questions-container');
  container.innerHTML = '';

  /* Loop through each question and build a card */
  questions.forEach(function(q, index) {

    /* Create the question card div */
    const card = document.createElement('div');
    card.className = 'question-card';
    card.id = 'question-' + index;

    /* Build the inner HTML for the card */
    card.innerHTML =
      '<p class="question-number">Question ' + (index + 1) + ' of ' + questions.length + '</p>' +
      '<p class="question-text">' + q.question + '</p>' +
      '<ul class="options-list" id="options-' + index + '"></ul>';

    container.appendChild(card);

    /* Now add the answer options to the list */
    const optionsList = document.getElementById('options-' + index);

    q.options.forEach(function(option, optIndex) {

      const li = document.createElement('li');
      li.className = 'option-item';
      li.id = 'option-' + index + '-' + optIndex;

      li.innerHTML =
        '<input type="radio" name="question-' + index + '" id="radio-' + index + '-' + optIndex + '" value="' + optIndex + '" />' +
        '<label for="radio-' + index + '-' + optIndex + '" style="cursor: pointer; flex: 1;">' + option + '</label>';

      /* Add click listener to handle answer selection */
      li.addEventListener('click', function() {
        selectAnswer(index, optIndex);
      });

      optionsList.appendChild(li);
    });

  });
}

/* ============================================================
   4. SELECT AN ANSWER
   Called when a user clicks an option.
   Records the answer and triggers the beforeunload warning.
   ============================================================ */
function selectAnswer(questionIndex, optionIndex) {
  /* Ignore clicks after submission */
  if (quizSubmitted) return;

  /* Record the answer */
  userAnswers[questionIndex] = optionIndex;

  /* Set the radio button to checked */
  const radio = document.getElementById('radio-' + questionIndex + '-' + optionIndex);
  if (radio) radio.checked = true;

  /* Remove selected style from all options for this question */
  const allOptions = document.querySelectorAll('#options-' + questionIndex + ' .option-item');
  allOptions.forEach(function(opt) {
    opt.classList.remove('selected');
  });

  /* Add selected style to the clicked option */
  const selectedOption = document.getElementById('option-' + questionIndex + '-' + optionIndex);
  if (selectedOption) selectedOption.classList.add('selected');

  /* Remove the unanswered highlight if it was there */
  const card = document.getElementById('question-' + questionIndex);
  if (card) card.classList.remove('unanswered');

  /* Activate the beforeunload warning on first answer */
  if (!quizStarted) {
    quizStarted = true;
    window.addEventListener('beforeunload', handleBeforeUnload);
  }
}

/* ============================================================
   5. BEFOREUNLOAD WARNING
   Fires if the user tries to leave or close the tab after
   starting the quiz but before submitting.
   Cleared after successful submission.
   ============================================================ */
function handleBeforeUnload(event) {
  /* This triggers the browser's built-in "Leave site?" dialog */
  event.preventDefault();
  event.returnValue = '';
}

/* ============================================================
   6. SUBMIT QUIZ
   Called when the user clicks "Submit Quiz".
   Validates all questions are answered, calculates score,
   saves to localStorage, shows results, and fetches reward.
   ============================================================ */
function submitQuiz() {
  /* Check if all questions have been answered */
  let allAnswered = true;
  let firstUnanswered = null;

  questions.forEach(function(q, index) {
    if (userAnswers[index] === undefined) {
      allAnswered = false;

      /* Highlight the unanswered card */
      const card = document.getElementById('question-' + index);
      if (card) card.classList.add('unanswered');

      /* Track the first unanswered question to scroll to it */
      if (firstUnanswered === null) firstUnanswered = index;
    }
  });

  if (!allAnswered) {
    /* Show error message */
    const errorMsg = document.getElementById('submit-error');
    errorMsg.hidden = false;
    errorMsg.textContent = 'Please answer all questions before submitting. Unanswered questions are highlighted in red.';

    /* Scroll to the first unanswered question */
    const card = document.getElementById('question-' + firstUnanswered);
    if (card) card.scrollIntoView({ behavior: 'smooth', block: 'center' });

    return;
  }

  /* All answered — calculate the score */
  let correctCount = 0;

  questions.forEach(function(q, index) {
    if (userAnswers[index] === q.correct) {
      correctCount++;
    }
  });

  const percentage = Math.round((correctCount / questions.length) * 100);
  const passed     = percentage >= (PASS_THRESHOLD * 100);

  /* Mark quiz as submitted and remove the beforeunload warning */
  quizSubmitted = true;
  window.removeEventListener('beforeunload', handleBeforeUnload);

  /* Save this attempt to localStorage */
  saveAttempt(correctCount, percentage, passed);

  /* Show the results */
  showResults(correctCount, percentage, passed);

  /* If passed, fetch the weasel reward */
  if (passed) {
    fetchWeaselReward();
  }

  /* Scroll to results */
  document.getElementById('results-area').scrollIntoView({ behavior: 'smooth' });
}

/* ============================================================
   7. SHOW RESULTS
   Hides the quiz area and shows the results area with
   the score, percentage, and pass/fail status.
   ============================================================ */
function showResults(correctCount, percentage, passed) {
  /* Hide the quiz, show the results */
  document.getElementById('quiz-area').hidden = true;
  document.getElementById('results-area').hidden = false;

  /* Set the result icon and heading */
  const icon    = document.getElementById('result-icon');
  const heading = document.getElementById('result-heading');
  const message = document.getElementById('result-message');

  if (passed) {
    icon.textContent    = '🦡';
    heading.textContent = 'You passed! The weasel reveals its secrets.';
    heading.style.color = 'var(--success)';
    message.textContent = 'You have proven yourself worthy of the weasel code. The weasel has wisdom to share.';
  } else {
    icon.textContent    = '🐾';
    heading.textContent = 'Not quite. The weasel is disappointed.';
    heading.style.color = 'var(--danger)';
    message.textContent = 'You needed ' + Math.ceil(PASS_THRESHOLD * questions.length) + ' correct to pass. Review the tutorial and try again.';
  }

  /* Fill in the stat cards */
  document.getElementById('stat-score').textContent      = correctCount + ' / ' + questions.length;
  document.getElementById('stat-percentage').textContent = percentage + '%';
  document.getElementById('stat-result').textContent     = passed ? 'PASS' : 'FAIL';
  document.getElementById('stat-result').style.color     = passed ? 'var(--success)' : 'var(--danger)';

  /* Load and display attempt history */
  displayHistory();
}

/* ============================================================
   8. FETCH WEASEL REWARD VIA AJAX
   Called only when the user passes.
   Fetches a weasel summary and thumbnail image from the
   Wikipedia public REST API and displays it as the reward.
   ============================================================ */
function fetchWeaselReward() {
  /* Show the reward area */
  document.getElementById('reward-area').hidden = false;

  const xhr = new XMLHttpRequest();

  /* Open the request to the Wikipedia REST API */
  xhr.open('GET', WEASEL_API_URL);

  /* Tell the API we want JSON */
  xhr.setRequestHeader('Accept', 'application/json');

  xhr.onload = function() {
    /* Hide the loading message */
    document.getElementById('reward-loading').hidden = true;

    if (xhr.status === 200) {
      /* Parse the JSON response */
      const data = JSON.parse(xhr.responseText);

      /* Validate the response has the expected fields */
      if (data && data.extract && data.thumbnail && data.thumbnail.source) {

        /* Build the reward content */
        const rewardContent = document.getElementById('reward-content');
        rewardContent.innerHTML =
          '<img src="' + data.thumbnail.source + '" alt="A weasel" class="reward-weasel-img" />' +
          '<p class="reward-weasel-fact">' + data.extract + '</p>';

        rewardContent.hidden = false;

      } else {
        document.getElementById('reward-loading').textContent = 'Could not load weasel wisdom. But you still passed!';
        document.getElementById('reward-loading').hidden = false;
      }
    } else {
      document.getElementById('reward-loading').textContent = 'Could not load weasel wisdom. But you still passed!';
      document.getElementById('reward-loading').hidden = false;
    }
  };

  xhr.onerror = function() {
    document.getElementById('reward-loading').textContent = 'Could not load weasel wisdom. But you still passed!';
    document.getElementById('reward-loading').hidden = false;
  };

  xhr.send();
}

/* ============================================================
   9. SAVE ATTEMPT TO LOCALSTORAGE
   Saves the current attempt with score, percentage,
   date/time, and pass/fail to localStorage.
   Wrapped in try/catch for private browsing compatibility.
   ============================================================ */
function saveAttempt(correctCount, percentage, passed) {
  try {
    /* Read existing attempts from localStorage */
    const existing = localStorage.getItem(STORAGE_KEY);
    const attempts = existing ? JSON.parse(existing) : [];

    /* Build the new attempt object */
    const attempt = {
      score:      correctCount,
      total:      questions.length,
      percentage: percentage,
      passed:     passed,
      date:       new Date().toLocaleDateString(),
      time:       new Date().toLocaleTimeString()
    };

    /* Add to the front of the array (newest first) */
    attempts.unshift(attempt);

    /* Save back to localStorage */
    localStorage.setItem(STORAGE_KEY, JSON.stringify(attempts));

  } catch (error) {
    /* localStorage may be unavailable in private browsing */
    console.log('Could not save attempt to localStorage:', error);
  }
}

/* ============================================================
   10. DISPLAY ATTEMPT HISTORY
   Reads all previous attempts from localStorage and
   renders them as history entries below the results.
   ============================================================ */
function displayHistory() {
  const container = document.getElementById('history-container');

  try {
    const existing = localStorage.getItem(STORAGE_KEY);
    const attempts = existing ? JSON.parse(existing) : [];

    if (attempts.length === 0) {
      container.innerHTML = '<p style="color: var(--text-secondary); font-size: 0.9rem;">No previous attempts.</p>';
      return;
    }

    /* Clear the container */
    container.innerHTML = '';

    /* Loop through attempts and create a history entry for each */
    attempts.forEach(function(attempt, index) {
      const entry = document.createElement('div');
      entry.className = 'history-entry';

      const resultClass = attempt.passed ? 'pass' : 'fail';
      const resultText  = attempt.passed ? 'PASS' : 'FAIL';
      const label       = index === 0 ? ' (latest)' : '';

      entry.innerHTML =
        '<span class="history-entry-score">' + attempt.score + ' / ' + attempt.total + ' — ' + attempt.percentage + '%' + label + '</span>' +
        '<span class="history-entry-date">' + attempt.date + ' at ' + attempt.time + '</span>' +
        '<span class="history-entry-result ' + resultClass + '">' + resultText + '</span>';

      container.appendChild(entry);
    });

  } catch (error) {
    /* Handle corrupted or missing localStorage data gracefully */
    container.innerHTML = '<p style="color: var(--text-secondary); font-size: 0.9rem;">Could not load attempt history.</p>';
    console.log('Could not read attempts from localStorage:', error);
  }
}

/* ============================================================
   11. CLEAR HISTORY
   Removes all saved attempts from localStorage and
   refreshes the history display.
   ============================================================ */
function clearHistory() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    displayHistory();
  } catch (error) {
    console.log('Could not clear localStorage:', error);
  }
}

/* ============================================================
   12. RETRY QUIZ
   Reloads the page so the user can take the quiz again.
   Questions will be reshuffled on reload.
   ============================================================ */
function retryQuiz() {
  window.location.reload();
}

/* ============================================================
   13. SHOW QUIZ ERROR
   Displays the error state if AJAX loading fails.
   ============================================================ */
function showQuizError() {
  document.getElementById('quiz-loading').hidden = true;
  document.getElementById('quiz-error').hidden = false;
}

/* ============================================================
   START — Load questions when the page is ready
   ============================================================ */
loadQuestions();