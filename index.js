const HDWalletProvider = require("@truffle/hdwallet-provider");
const Web3 = require("web3");

const PRIVATE_KEY = "MY_PRIVATE_KEY";
const recipientAddress = "0xef4dea791c782c0b82f33d2df41d4188016d6494";
const numTransactions = 100;
const iterations = 50;
const amountToSend = "0.00006"; // 27 kelp
const chainId = 42161;

const RPC_URLS = [
  "https://arbitrum.llamarpc.com",
  "https://arb-pokt.nodies.app",
  "https://arbitrum.drpc.org",
  "https://endpoints.omniatech.io/v1/arbitrum/one/public",
];

function getRandomRPCUrl() {
  return RPC_URLS[Math.floor(Math.random() * RPC_URLS.length)];
}

async function sendTransactions() {
  for (let i = 0; i < iterations; i++) {
    const promiseArray = [];

    for (let i = 0; i < Math.floor(numTransactions / iterations); i++) {
      const provider = new HDWalletProvider(PRIVATE_KEY, getRandomRPCUrl());
      const web3 = new Web3(provider);

      const accounts = await web3.eth.getAccounts();
      const senderAddress = accounts[0];

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
        chainId,
        gas: gasLimit,
      };

      promiseArray.push(async () => {
        try {
          const receipt = await web3.eth.sendTransaction(transaction);
          console.log(`Transaction ${i + 1} sent: ${receipt.transactionHash}`);
          provider.engine.stop();
          return true;
        } catch (error) {
          console.error(`Error sending transaction ${i + 1}:`, error);
          provider.engine.stop();
          return false;
        }
      });
    }
    const results = await Promise.all(promiseArray.map((f) => f()));
    const successfulTransactions = results.filter((result) => result).length;

    console.log(
      `Sent ${successfulTransactions} out of ${numTransactions} transactions :: iteration ${
        i + 1
      }/${iterations}`
    );
  }

  // Wait 10 seconds.
  await new Promise((resolve) => setTimeout(resolve, 10000));
}

async function main() {
  await sendTransactions();
}

main();
