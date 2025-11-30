// DOM Elements
const currencySelect = document.getElementById('currency');
const salaryType = document.getElementById('salary-type');
const hourlyInput = document.getElementById('hourly-input');
const annualInput = document.getElementById('annual-input');
const hourlyRateInput = document.getElementById('hourly-rate');
const annualSalaryInput = document.getElementById('annual-salary');
const hoursPerWeek = document.getElementById('hours-per-week');
const weeksPerYear = document.getElementById('weeks-per-year');
const commuteTime = document.getElementById('commute-time');
const unpaidLunch = document.getElementById('unpaid-lunch');
const prepTime = document.getElementById('prep-time');
const commuteHint = document.getElementById('commute-hint');

const form = document.getElementById('wage-calculator');
const results = document.getElementById('results');
const officialRateEl = document.getElementById('official-rate');
const actualRateEl = document.getElementById('actual-rate');
const percentLostEl = document.getElementById('percent-lost');
const hoursUnpaidEl = document.getElementById('hours-unpaid');
const yearlyLostEl = document.getElementById('yearly-lost');
const realityTextEl = document.getElementById('reality-text');

const shareTwitterBtn = document.getElementById('share-twitter');
const shareLinkedInBtn = document.getElementById('share-linkedin');
const shareRedditBtn = document.getElementById('share-reddit');
const copyResultsBtn = document.getElementById('copy-results');
const recalculateBtn = document.getElementById('recalculate');

// Currency symbol storage
let currentCurrencySymbol = '$';

// Currency selector change
currencySelect.addEventListener('change', () => {
    const selected = currencySelect.options[currencySelect.selectedIndex];
    currentCurrencySymbol = selected.getAttribute('data-symbol');
    const avgCommute = selected.getAttribute('data-commute');

    // Update commute hint
    const regionNames = {
        'USD': 'US',
        'GBP': 'UK',
        'EUR': 'EU',
        'CAD': 'Canadian',
        'AUD': 'Australian',
        'INR': 'Indian'
    };
    const region = regionNames[selected.value] || '';
    commuteHint.textContent = `Average ${region} commute: ${avgCommute} minutes`;

    // Update all currency symbols in form
    document.querySelectorAll('.prefix').forEach(el => {
        el.textContent = currentCurrencySymbol;
    });
});

// Toggle salary type input
salaryType.addEventListener('change', () => {
    if (salaryType.value === 'hourly') {
        hourlyInput.classList.remove('hidden');
        annualInput.classList.add('hidden');
    } else {
        hourlyInput.classList.add('hidden');
        annualInput.classList.remove('hidden');
    }
});

// Calculate wage
form.addEventListener('submit', (e) => {
    e.preventDefault();
    calculateWage();
});

function calculateWage() {
    // Get inputs
    const isHourly = salaryType.value === 'hourly';
    let officialHourlyRate;

    if (isHourly) {
        officialHourlyRate = parseFloat(hourlyRateInput.value) || 0;
    } else {
        const annualSalary = parseFloat(annualSalaryInput.value) || 0;
        const hours = parseFloat(hoursPerWeek.value) || 40;
        const weeks = parseFloat(weeksPerYear.value) || 50;
        const totalHours = hours * weeks;
        officialHourlyRate = totalHours > 0 ? annualSalary / totalHours : 0;
    }

    const hours = parseFloat(hoursPerWeek.value) || 40;
    const weeks = parseFloat(weeksPerYear.value) || 50;
    const commute = parseFloat(commuteTime.value) || 0;
    const lunch = parseFloat(unpaidLunch.value) || 0;
    const prep = parseFloat(prepTime.value) || 0;

    // Validation
    if (officialHourlyRate <= 0 || hours <= 0 || weeks <= 0) {
        alert('Please fill in all required fields with valid numbers.');
        return;
    }

    // Calculate daily unpaid time (in hours)
    const daysPerWeek = 5; // Assuming 5-day work week
    const dailyUnpaidHours = (commute + lunch + prep) / 60;

    // Calculate total hours per week (paid + unpaid)
    const totalWeeklyHours = hours + (dailyUnpaidHours * daysPerWeek);

    // Calculate actual hourly rate
    const weeklyPay = officialHourlyRate * hours;
    const actualHourlyRate = weeklyPay / totalWeeklyHours;

    // Calculate stats
    const unpaidHoursPerWeek = totalWeeklyHours - hours;
    const percentLost = ((officialHourlyRate - actualHourlyRate) / officialHourlyRate) * 100;
    const yearlyLost = (officialHourlyRate - actualHourlyRate) * totalWeeklyHours * weeks;

    // Store results for sharing
    window.calculationResults = {
        officialRate: officialHourlyRate,
        actualRate: actualHourlyRate,
        percentLost: percentLost,
        unpaidHours: unpaidHoursPerWeek,
        yearlyLost: yearlyLost,
        totalWeeklyHours: totalWeeklyHours,
        paidHours: hours
    };

    // Display results
    displayResults(officialHourlyRate, actualHourlyRate, percentLost, unpaidHoursPerWeek, yearlyLost, totalWeeklyHours, hours);
}

function displayResults(official, actual, percent, unpaidHours, yearlyLost, totalHours, paidHours) {
    // Format numbers with current currency
    officialRateEl.textContent = `${currentCurrencySymbol}${official.toFixed(2)}`;
    actualRateEl.textContent = `${currentCurrencySymbol}${actual.toFixed(2)}`;
    percentLostEl.textContent = `${percent.toFixed(1)}%`;
    hoursUnpaidEl.textContent = unpaidHours.toFixed(1);
    yearlyLostEl.textContent = `${currentCurrencySymbol}${yearlyLost.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;

    // Reality text
    realityTextEl.innerHTML = `You spend <strong>${totalHours.toFixed(1)} hours per week</strong> on work-related activities, but only get paid for <strong>${paidHours} hours</strong>. That's <strong>${unpaidHours.toFixed(1)} hours of FREE LABOR</strong> every week.`;

    // Scroll to results
    results.classList.remove('hidden');
    results.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Share functionality
shareTwitterBtn.addEventListener('click', () => {
    const r = window.calculationResults;
    const text = `I'm losing ${currentCurrencySymbol}${r.yearlyLost.toLocaleString('en-US', { maximumFractionDigits: 0 })} per year in unpaid work time. My actual hourly rate is ${currentCurrencySymbol}${r.actualRate.toFixed(2)}, not ${currentCurrencySymbol}${r.officialRate.toFixed(2)}. Calculate yours: MyActualRate.com`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
});

shareLinkedInBtn.addEventListener('click', () => {
    const r = window.calculationResults;
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent('https://myactualrate.com')}`;
    window.open(url, '_blank');
});

shareRedditBtn.addEventListener('click', () => {
    const r = window.calculationResults;
    const title = `I'm losing ${currentCurrencySymbol}${r.yearlyLost.toLocaleString('en-US', { maximumFractionDigits: 0 })} per year in unpaid work time`;
    const text = `I calculated my REAL hourly wage and discovered I'm losing ${currentCurrencySymbol}${r.yearlyLost.toLocaleString('en-US', { maximumFractionDigits: 0 })} annually to unpaid time.

My employer says I make ${currentCurrencySymbol}${r.officialRate.toFixed(2)}/hour, but after factoring in my commute (unpaid), lunch break (unpaid), and getting ready for work, I actually make ${currentCurrencySymbol}${r.actualRate.toFixed(2)}/hour.\n\nThat's ${r.unpaidHours.toFixed(1)} hours of free labor every week, costing me ${currentCurrencySymbol}${r.yearlyLost.toLocaleString('en-US', { maximumFractionDigits: 0 })} per year.\n\nCalculate yours: MyActualRate.com`;
    const url = `https://reddit.com/submit?title=${encodeURIComponent(title)}&text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
});

copyResultsBtn.addEventListener('click', () => {
    const r = window.calculationResults;
    const text = `💸 MY ACTUAL RATE RESULTS 💸

I'm losing ${currentCurrencySymbol}${r.yearlyLost.toLocaleString('en-US', { maximumFractionDigits: 0 })} per year in unpaid work time.

Official Rate: ${currentCurrencySymbol}${r.officialRate.toFixed(2)}/hr
ACTUAL Rate: ${currentCurrencySymbol}${r.actualRate.toFixed(2)}/hr

Lost to unpaid time: ${r.percentLost.toFixed(1)}%
Unpaid hours per week: ${r.unpaidHours.toFixed(1)} hours

I spend ${r.totalWeeklyHours.toFixed(1)} hours/week on work but only get paid for ${r.paidHours} hours.

Calculate yours: MyActualRate.com`;

    navigator.clipboard.writeText(text).then(() => {
        const originalText = copyResultsBtn.innerHTML;
        copyResultsBtn.innerHTML = '<span class="icon">✅</span> Copied!';
        copyResultsBtn.style.background = '#00cc66';
        setTimeout(() => {
            copyResultsBtn.innerHTML = originalText;
            copyResultsBtn.style.background = '';
        }, 2000);
    }).catch(() => {
        alert('Copy failed. Please copy manually.');
    });
});

recalculateBtn.addEventListener('click', () => {
    results.classList.add('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Initialize currency symbols on page load
window.addEventListener('load', () => {
    // Set initial currency symbol from selected option
    const selected = currencySelect.options[currencySelect.selectedIndex];
    currentCurrencySymbol = selected.getAttribute('data-symbol');

    // Update all prefix symbols to match
    document.querySelectorAll('.prefix').forEach(el => {
        el.textContent = currentCurrencySymbol;
    });
});
