const form = document.querySelector("#budget-form");
const totalEl = document.querySelector("#total");
const dailyEl = document.querySelector("#daily");

const styleRates = {
  budget: 76,
  comfort: 118,
  midrange: 168
};

const cityCosts = {
  one: 35,
  two: 95,
  three: 175
};

function formatUsd(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(value);
}

function updateBudget() {
  const fields = form.elements;
  const days = Math.max(1, Number(fields.days.value) || 1);
  const travelers = Math.max(1, Number(fields.travelers.value) || 1);
  const dailyRate = styleRates[fields.style.value] || styleRates.comfort;
  const transferCost = cityCosts[fields.cities.value] || cityCosts.two;
  const total = days * travelers * dailyRate + travelers * transferCost;

  totalEl.textContent = formatUsd(total);
  dailyEl.textContent = `${formatUsd(total / travelers / days)} per traveler per day`;
}

if (form) {
  form.addEventListener("input", updateBudget);
  updateBudget();
}

const challenge = document.querySelector("#budget-challenge");

const challengeRounds = [
  {
    title: "Pick your first arrival move.",
    copy: "You land tired, with one suitcase, and your hotel is near Ueno.",
    guide: "/guides/japan-airport-transfer-guide",
    options: [
      { label: "Take the direct airport rail route to Ueno", points: 3, feedback: "Good call. A direct rail route keeps cost and friction under control." },
      { label: "Take a taxi from Narita because it feels simpler", points: 0, feedback: "Comfortable, but expensive. Long airport taxi rides can wreck a careful budget." },
      { label: "Book the cheapest bus before checking the hotel stop", points: 1, feedback: "Maybe workable, but always check the final stop before booking." }
    ]
  },
  {
    title: "Choose your Tokyo hotel base.",
    copy: "You want value, easy food, and simple routes without paying Shibuya prices.",
    guide: "/guides/where-to-stay-in-tokyo-budget",
    options: [
      { label: "Stay near Ueno, Asakusa, or Ikebukuro", points: 3, feedback: "Strong budget base. These areas usually balance price, food, and transport well." },
      { label: "Book the cheapest room far from useful stations", points: 0, feedback: "Cheap nightly rates can cost more in time, transfers, and tired evenings." },
      { label: "Stay in Shinjuku only if the price is still reasonable", points: 2, feedback: "Convenient, but watch the room price and station complexity." }
    ]
  },
  {
    title: "Decide on long-distance transport.",
    copy: "Your route is Tokyo, Kyoto, and Osaka in seven days.",
    guide: "/guides/jr-pass-alternatives-2026",
    options: [
      { label: "Compare individual tickets before buying any pass", points: 3, feedback: "Correct. The nationwide JR Pass is not an automatic buy for this route." },
      { label: "Buy a nationwide JR Pass immediately", points: 0, feedback: "That can be overkill. Pass value depends on the exact long-distance legs." },
      { label: "Consider open-jaw flights to avoid backtracking", points: 2, feedback: "Smart route design. Flying into one city and out of another can reduce train costs." }
    ]
  },
  {
    title: "Handle mobile data.",
    copy: "You want maps, train lookups, translation, and restaurant searches without hunting for WiFi.",
    guide: "/guides/japan-esim-vs-pocket-wifi",
    options: [
      { label: "Pick eSIM for solo or couple travel", points: 3, feedback: "Efficient. eSIM is usually the lowest-friction choice for light groups." },
      { label: "Rent pocket WiFi only because everyone online says so", points: 1, feedback: "Maybe fine for groups, but solo travelers often pay more friction than needed." },
      { label: "Use only free WiFi to save money", points: 0, feedback: "Risky. Lost time and missed trains can cost more than a basic data plan." }
    ]
  },
  {
    title: "Add Mount Fuji to the trip.",
    copy: "You have one open day in Tokyo and want a Fuji view without blowing the budget.",
    guide: "/guides/mount-fuji-day-trip-from-tokyo-budget",
    options: [
      { label: "Check weather, reserve transport, and keep the day simple", points: 3, feedback: "Strong plan. Fuji rewards flexibility and a realistic route." },
      { label: "Try five Fuji stops in one day by local buses", points: 0, feedback: "That is usually too much. Local timing can turn the day into a rush." },
      { label: "Compare a guided tour if you want multiple stops", points: 2, feedback: "Reasonable. A tour can be good value when it replaces messy local transfers." }
    ]
  }
];

function initChallenge() {
  if (!challenge) return;

  const stepEl = document.querySelector("#challenge-step");
  const scoreEl = document.querySelector("#challenge-score");
  const titleEl = document.querySelector("#challenge-title");
  const copyEl = document.querySelector("#challenge-copy");
  const optionsEl = document.querySelector("#challenge-options");
  const gradeEl = document.querySelector("#challenge-grade");
  const feedbackEl = document.querySelector("#challenge-feedback");
  const linkEl = document.querySelector("#challenge-link");
  let roundIndex = 0;
  let score = 0;

  if (!stepEl || !scoreEl || !titleEl || !copyEl || !optionsEl || !gradeEl || !feedbackEl || !linkEl) return;

  function gradeForScore(value) {
    if (value >= 13) return "Efficient";
    if (value >= 9) return "Balanced";
    if (value >= 5) return "Costly";
    return "Start";
  }

  function renderRound() {
    const round = challengeRounds[roundIndex];
    stepEl.textContent = `Decision ${roundIndex + 1} of ${challengeRounds.length}`;
    scoreEl.textContent = `${score} pts`;
    titleEl.textContent = round.title;
    copyEl.textContent = round.copy;
    linkEl.href = round.guide;
    optionsEl.innerHTML = "";

    round.options.forEach((option) => {
      const button = document.createElement("button");
      button.className = "challenge-option";
      button.type = "button";
      button.textContent = option.label;
      button.addEventListener("click", () => chooseOption(button, option));
      optionsEl.append(button);
    });
  }

  function chooseOption(button, option) {
    score += option.points;
    gradeEl.textContent = gradeForScore(score);
    feedbackEl.textContent = option.feedback;
    scoreEl.textContent = `${score} pts`;
    optionsEl.querySelectorAll("button").forEach((item) => {
      item.disabled = true;
      item.classList.toggle("selected", item === button);
    });

    window.setTimeout(() => {
      if (roundIndex < challengeRounds.length - 1) {
        roundIndex += 1;
        renderRound();
      } else {
        stepEl.textContent = "Challenge complete";
        titleEl.textContent = "Your Japan budget instincts";
        copyEl.textContent = score >= 13
          ? "You avoided the biggest first-trip budget traps."
          : "Review the matching guides before booking flights, hotels, and transport.";
        linkEl.href = score >= 13 ? "/guides/japan-trip-cost-2026" : challengeRounds[roundIndex].guide;
        linkEl.textContent = score >= 13 ? "Review Trip Costs" : "Fix the Biggest Budget Trap";
      }
    }, 650);
  }

  renderRound();
}

initChallenge();

const quiz = document.querySelector("#trip-quiz");

const quizQuestions = [
  {
    title: "How many days do you have?",
    copy: "Pick the answer closest to your current plan.",
    options: [
      { label: "5 days or less", type: "tokyo" },
      { label: "6 to 9 days", type: "classic" },
      { label: "10 days or more", type: "slow" }
    ]
  },
  {
    title: "What do you care about most?",
    copy: "This decides whether your route should chase icons, food, scenery, or lower stress.",
    options: [
      { label: "Classic first-trip highlights", type: "classic" },
      { label: "Food and city nights", type: "food" },
      { label: "Views, slower days, and fewer crowds", type: "fuji" }
    ]
  },
  {
    title: "How do you feel about hotel changes?",
    copy: "Hotel changes are one of the easiest ways to add friction.",
    options: [
      { label: "Keep one base if possible", type: "tokyo" },
      { label: "Two or three bases is fine", type: "classic" },
      { label: "Fewer changes, more day trips", type: "slow" }
    ]
  },
  {
    title: "Which day trip sounds best?",
    copy: "Choose the one that would make the trip feel memorable.",
    options: [
      { label: "Mount Fuji or Kawaguchiko", type: "fuji" },
      { label: "Nara, Uji, or quieter temple towns", type: "slow" },
      { label: "Osaka food streets and markets", type: "food" }
    ]
  },
  {
    title: "What is your budget instinct?",
    copy: "This helps choose the next guide to read.",
    options: [
      { label: "Avoid crowd mistakes and wasted transfers", type: "slow" },
      { label: "See the famous route efficiently", type: "classic" },
      { label: "Stay flexible and keep Tokyo simple", type: "tokyo" }
    ]
  }
];

const quizResults = {
  tokyo: {
    title: "Tokyo-only saver",
    copy: "You should keep one base, use local trains, and spend your budget on neighborhoods, food, and one paid highlight.",
    link: "/guides/tokyo-5-day-budget-itinerary"
  },
  classic: {
    title: "Classic first-timer",
    copy: "Tokyo, Kyoto, and Osaka can work well for you if you keep the route simple and compare train costs before buying passes.",
    link: "/guides/first-japan-trip-checklist"
  },
  food: {
    title: "Food-focused Osaka route",
    copy: "Build the trip around Tokyo and Kansai food areas, then use cheap eats and smart hotel bases to control the total.",
    link: "/guides/japan-trip-cost-2026"
  },
  slow: {
    title: "Slow travel Kyoto/Nara route",
    copy: "You will probably enjoy fewer hotel changes, early temple visits, and calmer side trips more than a packed checklist.",
    link: "/guides/is-japan-too-crowded-2026"
  },
  fuji: {
    title: "Fuji + Tokyo route",
    copy: "You should keep Tokyo as the base, watch the weather, and plan Fuji transport before locking the rest of the day.",
    link: "/guides/mount-fuji-day-trip-from-tokyo-budget"
  }
};

function initQuiz() {
  if (!quiz) return;

  const stepEl = document.querySelector("#quiz-step");
  const progressEl = document.querySelector("#quiz-progress");
  const titleEl = document.querySelector("#quiz-title");
  const copyEl = document.querySelector("#quiz-copy");
  const optionsEl = document.querySelector("#quiz-options");
  const resultTitleEl = document.querySelector("#quiz-result-title");
  const resultCopyEl = document.querySelector("#quiz-result-copy");
  const resultLinkEl = document.querySelector("#quiz-result-link");
  const scores = { tokyo: 0, classic: 0, food: 0, slow: 0, fuji: 0 };
  let questionIndex = 0;

  if (!stepEl || !progressEl || !titleEl || !copyEl || !optionsEl || !resultTitleEl || !resultCopyEl || !resultLinkEl) return;

  function bestType() {
    return Object.keys(scores).sort((a, b) => scores[b] - scores[a])[0];
  }

  function renderQuestion() {
    const question = quizQuestions[questionIndex];
    stepEl.textContent = `Question ${questionIndex + 1} of ${quizQuestions.length}`;
    progressEl.textContent = `${questionIndex} picked`;
    titleEl.textContent = question.title;
    copyEl.textContent = question.copy;
    optionsEl.innerHTML = "";

    question.options.forEach((option) => {
      const button = document.createElement("button");
      button.className = "challenge-option";
      button.type = "button";
      button.textContent = option.label;
      button.addEventListener("click", () => chooseAnswer(button, option));
      optionsEl.append(button);
    });
  }

  function showResult() {
    const result = quizResults[bestType()];
    stepEl.textContent = "Quiz complete";
    progressEl.textContent = `${quizQuestions.length} picked`;
    titleEl.textContent = "Your route is ready";
    copyEl.textContent = "Start with the matching guide, then use the calculator to check the cost.";
    optionsEl.innerHTML = "";
    resultTitleEl.textContent = result.title;
    resultCopyEl.textContent = result.copy;
    resultLinkEl.href = result.link;
    resultLinkEl.textContent = "Read the Matching Guide";
  }

  function chooseAnswer(button, option) {
    scores[option.type] += 1;
    optionsEl.querySelectorAll("button").forEach((item) => {
      item.disabled = true;
      item.classList.toggle("selected", item === button);
    });

    window.setTimeout(() => {
      if (questionIndex < quizQuestions.length - 1) {
        questionIndex += 1;
        renderQuestion();
      } else {
        showResult();
      }
    }, 450);
  }

  renderQuestion();
}

initQuiz();

const mascotToggle = document.querySelector("#mascot-toggle");
const mascotCard = document.querySelector("#mascot-card");
const mascotTip = document.querySelector("#mascot-tip");
const mascotNext = document.querySelector("#mascot-next");
const mascotMood = document.querySelector("#mascot-mood");
const mascotWidget = document.querySelector(".mascot-widget");

const mascotTips = [
  { mood: "Great value", text: "Your lucky draw: compare airport trains before booking a taxi. The simplest route is often not the priciest one." },
  { mood: "Avoid trap", text: "Your lucky draw: a cheap hotel far from useful stations can cost more in transfers and tired evenings." },
  { mood: "Pass check", text: "Your lucky draw: the nationwide JR Pass is not automatic value in 2026. Price your exact legs first." },
  { mood: "Book early", text: "Your lucky draw: Tokyo hotels move fast around cherry blossom, autumn leaves, and holiday weeks." },
  { mood: "Data luck", text: "Your lucky draw: solo travelers usually get better value from eSIM than pocket WiFi." },
  { mood: "Fuji weather", text: "Your lucky draw: check Mount Fuji weather before spending a full day on the route." }
];

function initMascot() {
  if (!mascotToggle || !mascotCard || !mascotTip || !mascotNext || !mascotMood || !mascotWidget) return;

  let tipIndex = 0;
  let excitementTimer;

  function setTip(nextIndex) {
    tipIndex = nextIndex % mascotTips.length;
    mascotTip.textContent = mascotTips[tipIndex].text;
    mascotMood.textContent = mascotTips[tipIndex].mood;
  }

  function excite() {
    mascotWidget.classList.remove("is-excited");
    window.clearTimeout(excitementTimer);
    window.requestAnimationFrame(() => {
      mascotWidget.classList.add("is-excited");
      excitementTimer = window.setTimeout(() => mascotWidget.classList.remove("is-excited"), 520);
    });
  }

  function setOpen(isOpen) {
    mascotCard.hidden = !isOpen;
    mascotToggle.setAttribute("aria-expanded", String(isOpen));
    mascotWidget.classList.toggle("is-open", isOpen);
    if (isOpen) {
      setTip(tipIndex + 1);
      excite();
    }
  }

  mascotToggle.addEventListener("click", () => {
    setOpen(mascotCard.hidden);
  });

  mascotNext.addEventListener("click", () => {
    setTip(tipIndex + 1);
    excite();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setOpen(false);
  });

  setTip(Math.floor(Math.random() * mascotTips.length));
}

initMascot();
