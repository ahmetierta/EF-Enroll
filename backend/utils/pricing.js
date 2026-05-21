const DURATION_OPTIONS = [1, 3, 6, 12];
const FIRST_TIME_DISCOUNT_PERCENT = 20;

function normalizeDurationMonths(durationMonths) {
  const parsedDuration = Number(durationMonths || 1);

  if (!DURATION_OPTIONS.includes(parsedDuration)) {
    return null;
  }

  return parsedDuration;
}

function calculateEnrollmentPricing(course, durationMonths, hasExistingEnrollments) {
  const monthlyPrice = Number(course?.cmimi || 0);
  const baseAmount = monthlyPrice * durationMonths;
  const isFirstTimeOffer = !hasExistingEnrollments;
  const discountPercent = isFirstTimeOffer ? FIRST_TIME_DISCOUNT_PERCENT : 0;
  const discountAmount = (baseAmount * discountPercent) / 100;
  const finalAmount = Math.max(baseAmount - discountAmount, 0);

  return {
    baseAmount: Number(baseAmount.toFixed(2)),
    discountPercent,
    finalAmount: Number(finalAmount.toFixed(2)),
    isFirstTimeOffer,
  };
}

module.exports = {
  DURATION_OPTIONS,
  FIRST_TIME_DISCOUNT_PERCENT,
  calculateEnrollmentPricing,
  normalizeDurationMonths,
};
