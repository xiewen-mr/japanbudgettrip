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
  const days = Math.max(1, Number(form.days.value) || 1);
  const travelers = Math.max(1, Number(form.travelers.value) || 1);
  const dailyRate = styleRates[form.style.value] || styleRates.comfort;
  const transferCost = cityCosts[form.cities.value] || cityCosts.two;
  const total = days * travelers * dailyRate + travelers * transferCost;

  totalEl.textContent = formatUsd(total);
  dailyEl.textContent = `${formatUsd(total / travelers / days)} per traveler per day`;
}

form.addEventListener("input", updateBudget);
updateBudget();
