// Quick test to check current period calculation
function getCurrentPeriodNumber() {
    const now = new Date();
    const startDate = new Date(2025, 5, 30); // June 30, 2025 (month is 0-indexed)
    
    // If we're before the start date, return period 1
    if (now < startDate) {
      return 1;
    }
    
    // Calculate the number of days since the start
    const daysSinceStart = Math.floor((now.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000));
    
    // Each period is 4 weeks (28 days)
    const periodNumber = Math.floor(daysSinceStart / 28) + 1;
    
    // Cap at 13 periods
    return Math.min(periodNumber, 13);
}

function getPeriodDates(periodNumber) {
    // Always start from June 30, 2025, regardless of the year parameter
    // This ensures consistency across all years
    const baseStartDate = new Date(2025, 5, 30); // June 30, 2025 (Monday)
    
    // Calculate the start date for this period
    const startOfPeriod = new Date(baseStartDate);
    startOfPeriod.setDate(baseStartDate.getDate() + (periodNumber - 1) * 28);
    
    // Calculate the end date (27 days later to make it exactly 4 weeks)
    const endOfPeriod = new Date(startOfPeriod);
    endOfPeriod.setDate(startOfPeriod.getDate() + 27);
    
    return { start: startOfPeriod, end: endOfPeriod };
}

console.log('Current date:', new Date().toISOString());
console.log('Start date (June 30, 2025):', new Date(2025, 5, 30).toISOString());
console.log('Current period:', getCurrentPeriodNumber());

for (let i = 1; i <= 5; i++) {
    const dates = getPeriodDates(i);
    console.log(`Period ${i}: ${dates.start.toDateString()} - ${dates.end.toDateString()}`);
}
