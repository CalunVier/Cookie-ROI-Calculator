export function calculateBuildingROI(building) {
    if (building.amount <= 0) return 0;

    let baseCps = building.storedCps;
    let mult = Game.globalCpsMult;

    for (let i in Game.buffs) {
        if (Game.buffs[i].multCpS) {
            mult *= Game.buffs[i].multCpS;
        }
    }

    let currentCps = baseCps * building.amount * mult;
    let futureCps = baseCps * (building.amount + 1) * mult;
    let deltaCps = futureCps - currentCps;
    let roi = deltaCps / building.price;

    return roi;
}

export function calculatePaybackTime(roi) {
    if (roi <= 0) return Infinity;
    return 1 / roi;
}