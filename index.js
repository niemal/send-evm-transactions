const HDWalletProvider = require("@truffle/hdwallet-provider");
const Web3 = require("web3");

const PRIVATE_KEY = "MY_PRIVATE_KEY";
const RPC_URL = "https://arbitrum.llamarpc.com";
const recipientAddress = "0xef4dea791c782c0b82f33d2df41d4188016d6494";
const numTransactions = 100;
const amountToSend = "0.00006"; // 27 kelp

async function sendTransactions() {
  const provider = new HDWalletProvider(PRIVATE_KEY, RPC_URL);
  const web3 = new Web3(provider);

  const accounts = await web3.eth.getAccounts();
  const senderAddress = accounts[0];

  console.log(`Sender address: ${senderAddress}`);
  console.log(`Recipient address: ${recipientAddress}`);
  console.log(`Number of transactions: ${numTransactions}`);
  console.log(`Amount to send per transaction: ${amountToSend} ETH`);

  const promiseArray = [];
  const value = web3.utils.toWei(amountToSend, "ether");
  const gasPrice = await web3.eth.getGasPrice();
  const gasLimit = await web3.eth.estimateGas({
    from: senderAddress,
    to: recipientAddress,
    value,
  });

  const transaction = {
    from: senderAddress,
    to: recipientAddress,
    value,
    gasPrice,
    gas: gasLimit,
  };

  for (let i = 0; i < numTransactions; i++) {
    promiseArray.push(async () => {
      try {
        const receipt = await web3.eth.sendTransaction(transaction);
        console.log(`Transaction ${i + 1} sent: ${receipt.transactionHash}`);
        return true;
      } catch (error) {
        console.error(`Error sending transaction ${i + 1}:`, error);
        return false;
      }
    });
  }

  const results = await Promise.all(promiseArray.map((f) => f()));
  const successfulTransactions = results.filter((result) => result).length;

  console.log(
    `Sent ${successfulTransactions} out of ${numTransactions} transactions.`
  );
  provider.engine.stop();
}

async function main() {
  await sendTransactions();
}

main();
