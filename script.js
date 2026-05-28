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
    if (value >= 8) return "Efficient";
    if (value >= 5) return "Balanced";
    if (value >= 2) return "Costly";
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
        copyEl.textContent = score >= 8
          ? "You avoided the biggest first-trip budget traps."
          : "Review the matching guides before booking flights, hotels, and transport.";
        linkEl.href = score >= 8 ? "/guides/japan-trip-cost-2026" : challengeRounds[roundIndex].guide;
        linkEl.textContent = score >= 8 ? "Review Trip Costs" : "Fix the Biggest Budget Trap";
      }
    }, 650);
  }

  renderRound();
}

initChallenge();

const mascotToggle = document.querySelector("#mascot-toggle");
const mascotCard = document.querySelector("#mascot-card");
const mascotTip = document.querySelector("#mascot-tip");
const mascotNext = document.querySelector("#mascot-next");

const mascotTips = [
  "Compare airport trains before booking a taxi. The simplest route is often not the most expensive one.",
  "Stay near a useful station, not only the cheapest room. Long transfers can quietly cost time and money.",
  "The nationwide JR Pass is not automatic value in 2026. Price your exact train legs first.",
  "Book Tokyo hotels early for cherry blossom, autumn leaves, and holiday weeks. Waiting can erase budget gains.",
  "For solo travelers, eSIM is usually easier than pocket WiFi. Groups may still save by sharing one device.",
  "Plan one paid highlight per day. Free neighborhoods, markets, parks, and viewpoints can carry the rest."
];

function initMascot() {
  if (!mascotToggle || !mascotCard || !mascotTip || !mascotNext) return;

  let tipIndex = 0;

  function setTip(nextIndex) {
    tipIndex = nextIndex % mascotTips.length;
    mascotTip.textContent = mascotTips[tipIndex];
  }

  function setOpen(isOpen) {
    mascotCard.hidden = !isOpen;
    mascotToggle.setAttribute("aria-expanded", String(isOpen));
  }

  mascotToggle.addEventListener("click", () => {
    setOpen(mascotCard.hidden);
  });

  mascotNext.addEventListener("click", () => {
    setTip(tipIndex + 1);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setOpen(false);
  });

  setTip(Math.floor(Math.random() * mascotTips.length));
}

initMascot();
