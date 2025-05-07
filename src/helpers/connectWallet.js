import Web3 from 'web3';

export const connectWallet = async ({setAccount}) => {
  if (window.ethereum) {
    try {
      // Request account access
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      // Create a Web3 instance
      const web3 = new Web3(window.ethereum);
      
      // Get the user's Ethereum account
      const accounts = await web3.eth.getAccounts();
      console.log('Connected Account:', accounts[0]);
      
      // Optionally, get the user's balance, network, etc.
      const balance = await web3.eth.getBalance(accounts[0]);
      console.log('Account Balance:', web3.utils.fromWei(balance, 'ether'));
      
      // Store the account and other details (useState or context)
      // For example:
      setAccount(accounts[0]);
    } catch (error) {
      console.error("User denied wallet connection or an error occurred:", error);
    }
  } else {
    console.log('MetaMask is not installed!');
  }
};
