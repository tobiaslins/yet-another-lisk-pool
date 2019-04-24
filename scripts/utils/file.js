const fs = require("jsonfile");
const config = require("../../config.json");
const path = require("path");
const { updateRewards } = require("./lisk.js");

const BALANCE_FILE = path.resolve("data/balance.json");
const SIGNED_TRANSACTION_FILE = path.resolve("data/payout.json");
const DONATIONS_FILE = path.resolve("data/donations.json");

const getBalanceFile = () => {
  try {
    return fs.readFileSync(BALANCE_FILE);
  } catch (error) {
    const data = {
      lastpayout: config.epochPoolTime,
      accounts: {}
    };
    fs.writeFileSync(BALANCE_FILE, data, { spaces: 2 });
    return data;
  }
};

const getDonationsFile = () => {
  return fs.readFileSync(DONATIONS_FILE);
};

const overideBalanceFile = data =>
  fs.writeFileSync(BALANCE_FILE, data, { spaces: 2 });

// Update and save data to file
const saveRewards = (data, rewards, date, old) => {
  try {
    const updatedData = updateRewards(data, rewards, date, old);
    fs.writeFileSync(BALANCE_FILE, data, { spaces: 2 });
  } catch (error) {
    console.error("Cant write to file", error.message);
  }
};

const saveSignedTransactions = data =>
  fs.writeFileSync(SIGNED_TRANSACTION_FILE, data, { spaces: 2 });

const getSignedTransactionsFile = () => {
  try {
    return fs.readFileSync(SIGNED_TRANSACTION_FILE);
  } catch (error) {
    console.log("Can't read payout.json file");
    return [];
  }
};

module.exports = {
  saveRewards,
  getBalanceFile,
  getDonationsFile,
  overideBalanceFile,
  saveSignedTransactions,
  getSignedTransactionsFile
};
