const fs = require("fs");
const {
  getRewards,
  getAccountsAndTotalVoteWeight,
  getTransactions
} = require("./utils/api.js");
const config = require("../config.json");
const { calculateRewards } = require("./utils/lisk.js");
const { getBalanceFile, saveRewards } = require("./utils/file.js");

const getDate = () => {
  const now = new Date();
  const startsOfTheDay = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );
  return startsOfTheDay.getTime();
};

(async () => {
  const data = getBalanceFile();
  const today = getDate(); // Calculate rewards only from start of the day not from execution time
  const { reward, sharingReward } = await getRewards(data.lastpayout, today);

  const test = await getTransactions();

  console.log(test.reduce((p, c) => p + Number(c.amount), 0) / 100000000);

  console.log(
    `Forged: ${reward} LSK from ${new Date(data.lastpayout).toLocaleString()}`
  );

  const donationAddresses = Object.keys(config.donationsPercent);

  let donations = [];
  for (const addr of donationAddresses) {
    const share = config.donationsPercent[addr];

    const lsk = (reward * share) / 100;

    console.log(
      "Sharing " +
        config.donationsPercent[addr] +
        "% with " +
        addr +
        ` ${lsk}LSK`
    );
    donations.push({ address: addr, amount: lsk });
  }
  fs.writeFileSync("./data/donations.json", JSON.stringify(donations), {
    spaces: 2
  });

  //   console.log(
  //     `Sharing ${config.sharedPercent}% with voters: ${sharingReward} LSK`
  //   );

  //   const { accounts, totalWeight } = await getAccountsAndTotalVoteWeight();

  //   console.log(`Total weight is ${totalWeight} LSK`);
  //   console.log("Calculate voters rewards...");

  //   const rewards = calculateRewards(accounts, sharingReward, totalWeight);
  //   console.log("Saving data...");
  //   saveRewards(data, rewards, today, test);
  //   console.log("Data saved to file.");
})();
