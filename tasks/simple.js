const fs = require("fs/promises");
const path = require("path");

task("task:simple:create-alloc", "Creates allocation")
  .addParam("name", "Filename of JSON in ./data")
  .setAction(async ({ name }, { ethers }) => {
    console.log("Creating distribution for /data/" + name + ".json");
    const dataPath = path.join(__dirname, `../data/${name}.json`);
    const data = JSON.parse(await fs.readFile(dataPath, "utf-8"));

    const accounts = [];
    const amounts = [];
    for (let i = 0; i < data.length; i++) {
      const [account, amount] = data[i];
      accounts.push(account);
      amounts.push(BigInt(amount));
    }

    let tx;
    const simpleMinter = await ethers.getContract("SimpleMinter");
    tx = await simpleMinter.createAllocation(accounts, amounts);
    console.log("Created distribution at tx: ", tx.hash);

    return { tx };
  });
