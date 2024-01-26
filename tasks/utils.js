const { DateTime } = require("luxon");
const { campaigns } = require("../config.js");

function getEpoch() {
  const midnightConfig = {
    hour: 0,
    minute: 0,
    second: 0,
    millisecond: 0,
  };
  const currentDate = DateTime.now();
  const daysUntilLastThursday = (currentDate.weekday - 4 + 7) % 7;
  const lastThursday = currentDate.minus({ days: daysUntilLastThursday });
  const lastThursdayMidnight = lastThursday.set(midnightConfig);
  const lastThursdayTimestamp = lastThursdayMidnight.toSeconds();
  const secondToLastThursday = lastThursdayMidnight.minus({
    days: 7,
  });
  const secondToLastThursdayMidnight = secondToLastThursday.set(midnightConfig);
  const secondToLastThursdayTimestamp =
    secondToLastThursdayMidnight.toSeconds();
  return {
    epochStart: secondToLastThursdayTimestamp,
    epochEnd: lastThursdayTimestamp,
  };
}

function getPointsAllocation(indicator, campaignName) {
  const { thresholds, points } = campaigns[campaignName];
  let allocation;
  for (let i = 0; i < thresholds.length; i++) {
    if (indicator >= thresholds[i]) {
      allocation = points[i];
    }
  }
  return allocation;
}

module.exports = { getEpoch, getPointsAllocation };
