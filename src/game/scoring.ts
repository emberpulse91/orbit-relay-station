export function roundScore(
  energyLeft: number,
  secondsLeft: number,
  domesLit: number,
): number {
  return Math.max(0, energyLeft) * 10 + Math.max(0, secondsLeft) * 5 + domesLit * 50;
}

export function starsFor(energyLeft: number, budget: number): number {
  if (budget <= 0) {
    return 1;
  }
  const share = energyLeft / budget;
  if (share >= 0.4) {
    return 3;
  }
  if (share >= 0.15) {
    return 2;
  }
  return 1;
}

/** Share of the ration left over on a win, as a whole percentage. */
export function efficiencyPercent(energySaved: number, budgetSpentOn: number): number {
  if (budgetSpentOn <= 0) {
    return 0;
  }
  return Math.round((energySaved / budgetSpentOn) * 100);
}
