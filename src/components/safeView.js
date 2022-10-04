import React from 'react';

const SafeView = ({ setSafe, safes }) => {
	console.log(safes);
	return (
		<div>
			{safes && safes.length > 0 ? (
				safes.map((safe, index) => (
					<div key={index}>
						<h3>{safe.safeName}</h3>
						<p>{safe.safeAddress}</p>
						<button onClick={() => setSafe(safe)}>Select</button>
					</div>
				))
			) : (
				<p>No Safes</p>
			)}
		</div>
	);
};

export default SafeView;
