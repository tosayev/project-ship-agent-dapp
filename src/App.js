import { useState, useEffect } from 'react'; // import hooks from React.js
import { ethers, utils } from "ethers"; // import ethers and utils from the ethers library.
import abi from "./contracts/shipAgent.json"; // import the .json version of the contract

function App() {
  // Define variables in the form of arays.  The first item is a state variable that is used to
  // store values which are referenced later using the React useState() hook.  The second item is
  // a function that lets us change our state.  The parameters of the useState() function are the
  // default values of the state variables (first item).
  const [isWalletConnected, setIsWalletConnected] = useState(false); // wallet connection default state is false
  const [currentAgencyName, setCurrentAgencyName] = useState(null); // agency name default value is null
  const [currentShipIMONumber, setCurrentShipIMONumber] = useState(null); // IMO number default value is null
  const [currentShipNetTonnage, setCurrentShipNetTonnage] = useState(null); // net tonnage default value is null
  const [isUserAgencyOwner, setIsUserAgencyOwner] = useState(false); // user by default is NOT the Agency Owner
  const [inputValue, setInputValue] = useState({ withdraw: "", deposit: "", agencyName: "", shipIMONumber: "", shipNetTonnage: "" }); // default values for withdraw amount, deposit amount, agencyName, shipIMONumber, shipNetTonnage is empty
  const [agencyOwnerAddress, setAgencyOwnerAddress] = useState(null); // default Agency Owner address is null
  const [customerTotalBalance, setCustomerTotalBalance] = useState(null); // customers default total balance is null
  const [customerAddress, setCustomerAddress] = useState(null); // customers default address is null
  const [error, setError] = useState(null); // default value for error output is null
  const [clearanceGranted, setClearanceGranted] = useState(false); // clearance by default is NOT granted

  const contractAddress = '0x4b952eA529aEd03E40aDB4a0b04776b9B68d07E7'; // define variable to store the contract address (after deploying it on the network in the previous step)
  const contractABI = abi.abi; // import the ABI project from the ABI of the .json version of the contract



  // Check if a MetaMask wallet is connected, throw an error if it isn't.
  const checkIfWalletIsConnected = async () => {
    try {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
        const account = accounts[0];
        setIsWalletConnected(true);
        setCustomerAddress(account);
        console.log("Account Connected: ", account);
      } else {
        setError("Please install a MetaMask wallet to use our agency.");
        console.log("No Metamask detected");
      }
    } catch (error) {
      console.log(error);
    }
  }

  // This function will check if the owner of the Agency has accessed the DApp.  If yes,
  // then the isUserAgencyOwner variable will be made "true" which will in turn open the
  // Agency Owner's admin panel to change the name of the agency.
  const getAgencyOwnerHandler = async () => {
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const shipAgentContract = new ethers.Contract(contractAddress, contractABI, signer);

        let owner = await shipAgentContract.agencyOwner();
        setAgencyOwnerAddress(owner);

        const [account] = await window.ethereum.request({ method: 'eth_requestAccounts' });

        if (owner.toLowerCase() === account.toLowerCase()) {
          setIsUserAgencyOwner(true);
        }
      } else {
        console.log("Ethereum object not found, install Metamask.");
        setError("Please install a MetaMask wallet to use our agency.");
      }
    } catch (error) {
      console.log(error)
    }
  }

  // If the Agency Owner is connected, the Agency Admin Panel will reveal itself and the Agency Owner
  // can name the Agency by writing it into the form and pressing "SET AGENCY NAME" which will activate
  // setAgencyNameHandler.  The Agency Name is imported as inputValue.agencyName.
  const setAgencyNameHandler = async (event) => {
    event.preventDefault();
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const shipAgentContract = new ethers.Contract(contractAddress, contractABI, signer);

        // setAgencyName function in the shipAgentContract smart contract is accessed to set the agency name
        const txn = await shipAgentContract.setAgencyName(utils.formatBytes32String(inputValue.agencyName));
        console.log("Setting Agency Name to: ", inputValue.agencyName);
        await txn.wait();
        console.log("Agency Name Changed to:", inputValue.agencyName, " TXN:", txn.hash);

        // Once the agency name is changed, getAgencyName() is called.
        getAgencyName();
      } else {
        console.log("Ethereum object not found, install Metamask.");
        setError("Please install a MetaMask wallet to use our agency.");
      }
    } catch (error) {
      console.log(error)
    }
  }

  // This function will access the shipAgentContract to get the agencyName and store it as currentAgencyName
  // which will then be used to display the agency name on the front-end.
  const getAgencyName = async () => {
    try {
      if (window.ethereum) {
        //read data
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const shipAgentContract = new ethers.Contract(contractAddress, contractABI, signer);
        
        let agencyName = await shipAgentContract.agencyName();
        if (agencyName.length===0) {
          console.log("No agency name registered yet.");
        } else {
          agencyName = utils.parseBytes32String(agencyName);
        }
        
        setCurrentAgencyName(agencyName.toString());
      } else {
        console.log("Ethereum object not found, install Metamask.");
        setError("Please install a MetaMask wallet to use our agency.");
      }
    } catch (error) {
      console.log(error);
    }
  }

  // The user must set the IMO number by putting into the form field and submitting it to the contract.
  const setShipIMONumberHandler = async (event) => {
    event.preventDefault();
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const shipAgentContract = new ethers.Contract(contractAddress, contractABI, signer);

        // setShipIMONumber function in the shipAgentContract smart contract is accessed to set the IMO number
        const txn = await shipAgentContract.setShipIMONumber(utils.formatBytes32String(inputValue.shipIMONumber));
        console.log("Setting IMO Number to:", inputValue.shipIMONumber);
        await txn.wait();
        console.log("IMO Number is set to:", inputValue.shipIMONumber, " TXN:", txn.hash);

        // Once the IMO Number is changed, getShipIMONumber() is called.
        getShipIMONumber();
      } else {
        console.log("Ethereum object not found, install Metamask.");
        setError("Please install a MetaMask wallet to use our agency.");
      }
    } catch (error) {
      console.log(error)
    }
  }

  // This function will access the shipAgentContract to get the shipIMONumber and store it as currentShipIMONumber
  // which will then be used to display the IMO number name on the front-end.
  const getShipIMONumber = async () => {
    try {
      if (window.ethereum) {
        //read data
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const shipAgentContract = new ethers.Contract(contractAddress, contractABI, signer);

        let shipIMONumber = await shipAgentContract.shipIMONumber();
        if (shipIMONumber.length===0) {
          console.log("No ship IMO number registered yet.");
        } else {
          shipIMONumber = utils.parseBytes32String(shipIMONumber);
        }
        
        
        setCurrentShipIMONumber(shipIMONumber.toString());
      } else {
        console.log("Ethereum object not found, install Metamask.");
        setError("Please install a MetaMask wallet to use our agency.");
      }
    } catch (error) {
      console.log(error);
    }
  }

  // The user must set the net tonnage by putting into the form field and submitting it to the contract.
  const setShipNetTonnageHandler = async (event) => {
    event.preventDefault();
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const shipAgentContract = new ethers.Contract(contractAddress, contractABI, signer);

        // setShipNetTonnage function in the shipAgentContract smart contract is accessed to set the net tonnage
        const txn = await shipAgentContract.setShipNetTonnage(utils.formatBytes32String(inputValue.shipNetTonnage));
        console.log("Setting Net Tonnage to:", inputValue.shipNetTonnage);
        await txn.wait();
        console.log("Net Tonnage changed to:", inputValue.shipNetTonnage, " TXN:", txn.hash);

        // Once the net tonnage is changed, getShipNetTonnage() is called.
        getShipNetTonnage();
      } else {
        console.log("Ethereum object not found, install Metamask.");
        setError("Please install a MetaMask wallet to use our agency.");
      }
    } catch (error) {
      console.log(error)
    }
  }

  // This function will access the shipAgentContract to get the shipNetTonnage and store it as currentShipNetTonnage
  // which will then be used to display the net tonnage on the front-end.
  const getShipNetTonnage = async () => {
    try {
      if (window.ethereum) {
        //read data
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const shipAgentContract = new ethers.Contract(contractAddress, contractABI, signer);

        let shipNetTonnage = await shipAgentContract.shipNetTonnage();
        if (shipNetTonnage.length===0) {
          console.log("No ship net tonnage registered yet.");
        } else {
          shipNetTonnage = utils.parseBytes32String(shipNetTonnage);
        }
        
        
        setCurrentShipNetTonnage(shipNetTonnage.toString());
      } else {
        console.log("Ethereum object not found, install Metamask.");
        setError("Please install a MetaMask wallet to use our agency.");
      }
    } catch (error) {
      console.log(error);
    }
  }

  // this function will get the customer's/ship's balance and store it as balance which will be used to
  // display the customer's/ship's balance on the front-end
  const customerBalanceHandler = async () => {
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const shipAgentContract = new ethers.Contract(contractAddress, contractABI, signer);

        let balance = await shipAgentContract.getShipAccountBalance();
        setCustomerTotalBalance(utils.formatEther(balance));
        console.log("Retrieved balance:", utils.formatEther(balance).toString(), "ETH");

      } else {
        console.log("Ethereum object not found, install Metamask.");
        setError("Please install a MetaMask wallet to use our agency.");
      }
    } catch (error) {
      console.log(error)
    }
  }

  // this function handles changes int he forms
  const handleInputChange = (event) => {
    setInputValue(prevFormData => ({ ...prevFormData, [event.target.name]: event.target.value }));
  }

  // this function deposits money into the customer's account
  const deposityMoneyHandler = async (event) => {
    try {
      event.preventDefault();
      if (window.ethereum) {
        //write data
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const shipAgentContract = new ethers.Contract(contractAddress, contractABI, signer);

        const txn = await shipAgentContract.depositMoney({ value: ethers.utils.parseEther(inputValue.deposit) });
        console.log("Deposting money...");
        await txn.wait();
        console.log("Deposited money...done", txn.hash);

        customerBalanceHandler();

      } else {
        console.log("Ethereum object not found, install Metamask.");
        setError("Please install a MetaMask wallet to use our agency.");
      }
    } catch (error) {
      console.log(error)
    }
  }

  // this function withdraws money from the customer's account.  Depending on the use case, it is either
  // used for the customer to withdraw money from the customer's account to their own wallet OR, when paying dues,
  // to withdraw money from the customer's account to the agency owner's wallet.
  const withDrawMoneyHandler = async (event) => {
    try {
      event.preventDefault();
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const shipAgentContract = new ethers.Contract(contractAddress, contractABI, signer);

        let myAddress = await signer.getAddress()
        console.log("provider signer...", myAddress);

        const txn = await shipAgentContract.withdrawMoney(myAddress, ethers.utils.parseEther(inputValue.withdraw));
        console.log("Withdrawing money...");
        await txn.wait();
        console.log("Money withdrawal...done", txn.hash);

        customerBalanceHandler();

      } else {
        console.log("Ethereum object not found, install Metamask.");
        setError("Please install a MetaMask wallet to use our agency.");
      }
    } catch (error) {
      console.log(error)
    }
  }

  // this function checks if the customer's balance is greater than or equal to the dues.  If the customer's
  // account balance is sufficient, the dues are deducted from the customer's account and transferred to the
  // agency owner's wallet.
  const requestClearanceHandler = async (event) => { // 7
    try {
      event.preventDefault();
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const shipAgentContract = new ethers.Contract(contractAddress, contractABI, signer);

        let dues = ((0.169323+0.08063)*currentShipNetTonnage/1000000).toFixed(8);

        if (customerTotalBalance >= dues ) {
          window.alert("You have enough money.  The dues will be deducted from your balance.");
          const txn = await shipAgentContract.withdrawMoney(agencyOwnerAddress, ethers.utils.parseEther(dues));
          console.log("Withdrawing money...");
          await txn.wait();
          console.log("Money withdrawal...done", txn.hash);

          customerBalanceHandler();
          setClearanceGranted(true);
        } else {
          window.alert("You need to add more money.");
        }

      } else {
        console.log("Ethereum object not found, install Metamask.");
        setError("Please install a MetaMask wallet to use our agency.");
      }
    } catch (error) {
      console.log(error)
    }
  }

  // useEffect() tells React that the below functions need to be run after the DApp renders.
  useEffect(() => {
    checkIfWalletIsConnected(); // check if a Wallet is connected
    getAgencyName(); // get the agency name and put it on top of the front-end if it exists
    getShipIMONumber(); // get the ship's IMO number and display it as registered IMO number if it exists
    getShipNetTonnage(); // get the ship's net tonnage and display it as registered net tonnage if it exists
    getAgencyOwnerHandler(); // get the agency owner's address
    customerBalanceHandler(); // get the customer's balance and display it as "Customer's Balanace on the front-end"
  }, [isWalletConnected])

  // this part builds the dapp front-end
  return (
    <main className="main-container">
      <h2 className="headline"><span className="headline-gradient">Ship Agency Contract Project</span></h2>
      <section className="customer-section px-10 pt-5 pb-10">
      <p>This is a DApp that's supposed to emulate payment of ship agents when crossing the Bosphorus.</p>
      <br></br>
      <p>User must record the vessel's IMO number and net tonnage.  Dues will be calculated based on the net tonnage.  For simplicity, only the Light Dues and Salvage Dues are calculated (in USD) and divided by 100,000 to get a number in ETH that's less than 0.1.</p>
      <br></br>
      <p>User must deposit money more than the dues before the user can request clearance for transit.</p>
        {error && <p className="text-2xl text-red-700">{error}</p>}
        <div className="mt-5">
          {currentAgencyName === "" && isUserAgencyOwner ?
            <p>"Setup the name of your agency." </p> :
            <p className="text-3xl font-bold">{currentAgencyName}</p>
          }
        </div>
        <div className="mt-7 mb-9">
          <form className="form-style">
            <input
              type="text"
              className="input-style"
              onChange={handleInputChange}
              name="shipIMONumber"
              placeholder="IMO Number"
              value={inputValue.shipIMONumber}
            />
            <button
              className="btn-purple"
              onClick={setShipIMONumberHandler}>Register IMO Number</button>
          </form>
        </div>
        <div className="mt-10 mb-10">
          <form className="form-style">
            <input
              type="text"
              className="input-style"
              onChange={handleInputChange}
              name="shipNetTonnage"
              placeholder="NT (minimum 800)"
              value={inputValue.shipNetTonnage}
            />
            <button
              className="btn-purple"
              onClick={setShipNetTonnageHandler}>Register Net Tonnage</button>
          </form>
        </div>
        <div className="mt-5">
          <p><span className="font-bold">Registered IMO Number: </span>{currentShipIMONumber}</p>
        </div>
        <div className="mt-5">
          <p><span className="font-bold">Registered Net Tonnage: </span>{Math.round(currentShipNetTonnage).toLocaleString('en-US')}</p>
        </div>
        <div className="mt-5">
          <p><span className="font-bold">Dues (ETH): </span>{((0.169323+0.08063)*currentShipNetTonnage/1000000).toFixed(8)}</p>
        </div>
        <div className="mt-5">
          <p><span className="font-bold">Customer Balance (ETH): </span>{customerTotalBalance}</p>
        </div>
        <div className="mt-10 mb-10">
          <form className="form-style">
            <input
              type="text"
              className="input-style"
              onChange={handleInputChange}
              name="deposit"
              placeholder="0.0000 ETH"
              value={inputValue.deposit}
            />
            <button
              className="btn-purple"
              onClick={deposityMoneyHandler}>Deposit Money In ETH</button>
          </form>
        </div>
        <div className="mt-10 mb-10">
          <form className="form-style">
            <input
              type="text"
              className="input-style"
              onChange={handleInputChange}
              name="withdraw"
              placeholder="0.0000 ETH"
              value={inputValue.withdraw}
            />
            <button
              className="btn-purple"
              onClick={withDrawMoneyHandler}>
              Withdraw Money In ETH
            </button>
          </form>
        </div>
        <div className="mt-10 mb-10">
          {
            clearanceGranted || (
            <form className="form-style">
              <button
                className="btn-purple"
                onClick={requestClearanceHandler}>
                Request Clearance
              </button>
            </form>
            )
          }
          {
            clearanceGranted && (
              <form className="form-style">
              <button
                className="btn-purple"
                disabled = {true}>
                Clearance Granted!
              </button>
            </form>
            )
          }
        </div>
        <div className="mt-5">
          <p><span className="font-bold">Agency Owner Address: </span>{agencyOwnerAddress}</p>
        </div>
        <div className="mt-5">
          {isWalletConnected && <p><span className="font-bold">Your Wallet Address: </span>{customerAddress}</p>}
          <button className="btn-connect" onClick={checkIfWalletIsConnected}>
            {isWalletConnected ? "Wallet Connected 🔒" : "Connect Wallet 🔑"}
          </button>
        </div>
      </section>
      {
        isUserAgencyOwner && (
          <section className="bank-owner-section">
            <h2 className="text-xl border-b-2 border-indigo-500 px-10 py-4 font-bold">Agency Admin Panel</h2>
            <div className="p-10">
              <form className="form-style">
                <input
                  type="text"
                  className="input-style"
                  onChange={handleInputChange}
                  name="agencyName"
                  placeholder="Enter a Name for Your Agency"
                  value={inputValue.agencyName}
                />
                <button
                  className="btn-grey"
                  onClick={setAgencyNameHandler}>
                  Set Agency Name
                </button>
              </form>
            </div>
          </section>
        )
      }
    </main>
  );
}
export default App;