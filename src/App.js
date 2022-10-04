import logo from './logo.svg';
import './App.css';
import Web3Modal from 'web3modal';
import axios from 'axios';
import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import SafeView from './components/safeView';
function App() {
	const web3modal = new Web3Modal({ cacheProvider: true, network: 'rinkeby' });

	const [provider, setProvider] = useState(null);
	const [address, setAddress] = useState(null);
	const [safe, setSafe] = useState(null);
	const [safes, setSafes] = useState(null);
	const [receiver, setReceiver] = useState(null);
	const [amount, setAmount] = useState(null);
	const [message, setMessage] = useState(null);

	const connectWallet = async () => {
		const web3Provider = await web3modal.connect();
		const provider = new ethers.providers.Web3Provider(web3Provider);
		const signer = provider.getSigner();
		const address = await signer.getAddress();
		setProvider(provider);
		setAddress(address);
		console.log(address);
	};

	useEffect(() => {
		if (web3modal.cachedProvider) {
			connectWallet();
		}
	}, []);

	useEffect(() => {
		if (safe) {
			console.log(safe.safeAddress);
		}
	}, [safe]);

	const getSafesForUser = async () => {
		try {
			const signer = provider.getSigner();
			const message = `Allow third party app to access your data on Parcel ${Date.now()}`;
			const signature = await signer.signMessage(message);
			const network = await provider.getNetwork();
			const chainId = network.chainId;

			const auth = {
				walletAddress: address,
				auth_msg: message,
				signature: signature,
			};
			const safeInfo = await axios.post(`https://dev-gcn.samudai.xyz/api/parcel/get/safes`, {
				auth: auth,
				chainId: chainId,
			});
			if (safeInfo.status === 200) {
				const safes = safeInfo.data.data.safes;
				setSafes(safes);
			} else {
				setSafes(null);
			}
			console.log(safeInfo);
		} catch (err) {
			console.log(err);
		}
	};

	const createTransaction = async () => {
		try {
			const signer = provider.getSigner();
			const message = `Allow third party app to access your data on Parcel ${Date.now()}`;
			const signature = await signer.signMessage(message);
			const network = await provider.getNetwork();
			const chainId = network.chainId;
			const auth = {
				walletAddress: address,
				auth_msg: message,
				signature: signature,
			};
			const txData = {
				proposalName: 'Samudai Transaction',
				description: 'Test transaction from Samudai',
				disbursement: [
					{
						token_address: 'ETH',
						amount: amount,
						address: receiver,
						tag_name: 'test',
						category: 'Bounty',
						comment: 'test',
						amount_type: 'TOKEN',
						referenceLink: '',
					},
				],
			};
			const transaction = await axios.post(`https://dev-gcn.samudai.xyz/api/parcel/create`, {
				auth: auth,
				chainId: chainId,
				safeAddress: safe.safeAddress,
				txData: txData,
			});
			if (transaction.status === 200) {
				console.log(transaction.data.data);
				setMessage(`${transaction.data.data.status} created with id ${transaction.data.data.proposalId}`);
			}
		} catch (err) {
			console.log(err);
		}
	};

	return (
		<div className="App">
			<header className="App-header">
				{address ? (
					<>
						<p>Connected to {address}</p>
						<button onClick={getSafesForUser}>Get Safes</button>

						<p>Safes</p>

						<SafeView setSafe={setSafe} safes={safes} />

						<input type="text" placeholder="Receiver Address" onChange={(e) => setReceiver(e.target.value)} />
						<input type="text" placeholder="Value" onChange={(e) => setAmount(e.target.value)} />
						<button onClick={createTransaction}>Create Transaction</button>

						<p>{message}</p>
					</>
				) : (
					<button onClick={connectWallet}>Connect Wallet</button>
				)}
			</header>
		</div>
	);
}

export default App;
