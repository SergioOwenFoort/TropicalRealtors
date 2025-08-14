// Quick test to show what the current period should be today (July 1, 2025)
const now = new Date();
const startDate = new Date(2025, 5, 30); // June 30, 2025

console.log('Current date:', now.toDateString());
console.log('Start date:', startDate.toDateString());

if (now < startDate) {
    console.log('Current period: 1 (before start date)');
} else {
    const daysSinceStart = Math.floor((now.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000));
    const periodNumber = Math.floor(daysSinceStart / 28) + 1;
    console.log('Days since start:', daysSinceStart);
    console.log('Current period:', Math.min(periodNumber, 13));
}
