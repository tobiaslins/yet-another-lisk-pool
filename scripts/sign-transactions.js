const { transaction } = require("lisk-elements").default;
const readline = require("readline");

const config = require("../config.json");
const {
  getBalanceFile,
  getDonationsFile,
  overideBalanceFile,
  saveSignedTransactions
} = require("./utils/file.js");
const { toRawLsk } = require("./utils/lisk.js");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.stdoutMuted = true;

rl.query = "Password : ";
rl.question(rl.query, function(password) {
  const passphrase = password;
  const secondPassphrase = process.argv[3];

  const getPayoutAddresses = ({ accounts }) =>
    Object.keys(accounts).filter(
      address => accounts[address].pending > config.minPayout
    );

  const getSignedTransactions = data =>
    data.map(({ address, amount }) =>
      transaction.transfer({
        recipientId: address,
        amount: toRawLsk(amount),
        passphrase,
        secondPassphrase
      })
    );

  const omit = (ids, obj) =>
    Object.keys(obj)
      .filter(id => !ids.includes(id))
      .reduce(
        (acc, id) => ({
          ...acc,
          [id]: obj[id]
        }),
        {}
      );

  (async () => {
    const data = getBalanceFile();
    const donations = getDonationsFile();

    const donationTransactions = getSignedTransactions(donations);

    const addressIds = getPayoutAddresses(data);
    const accountsToPay = addressIds.map(id => ({
      address: id,
      amount: data.accounts[id].pending - 0.1
    }));

    console.log("Sign transactions...");
    const signedTransactions = getSignedTransactions(accountsToPay);
    console.log("Save signed transactions to file...");
    console.log(signedTransactions);
    saveSignedTransactions([...donationTransactions, ...signedTransactions]);
    console.log("Remove signed transactions addresses from balance file");
    const updatedData = omit(addressIds, data.accounts);
    data.accounts = updatedData;
    overideBalanceFile(data);
  })();

  rl.close();
});
rl._writeToOutput = function _writeToOutput(stringToWrite) {
  if (rl.stdoutMuted)
    rl.output.write(
      "\x1B[2K\x1B[200D" +
        rl.query +
        "[" +
        (rl.line.length % 2 == 1 ? "=-" : "-=") +
        "]"
    );
  else rl.output.write(stringToWrite);
};
