const { client } = require("./utils/api.js");
const { fromRawLsk } = require("./utils/lisk.js");
const { getSignedTransactionsFile } = require("./utils/file.js");

(async () => {
  const transactions = getSignedTransactionsFile();
  console.log("Verify TXs ", transactions.length);
  console.log(
    fromRawLsk(
      transactions.reduce((p, c) => p + Number(c.amount) + Number(c.fee), 0)
    )
  );
})();
