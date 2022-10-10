const firebaseLib = require('./utils/firebase.js');
const ethers= require("ethers");
require('dotenv').config();
var readline = require('readline');
const testAbi = require('./abi/TrigMyContractTest.json');

let provider;
let wallet;
let lastNonce;

///////////////// Escape button to stop the script ////////////////
readline.emitKeypressEvents(process.stdin);
if (process.stdin.isTTY)  process.stdin.setRawMode(true);
 
  process.stdin.on('keypress', ( e, key) => {
    if (key && (key.name === 'q' || key.name =="escape"))
    process.exit();
  });
///////////////////////////////////////////////////////////////////
  

NODE_ENDPOINT = process.env.ENDPOINT;    
CONTRACT_TEST = process.env.CONTRACT_TEST;

provider =  new ethers.providers.JsonRpcProvider(NODE_ENDPOINT); 


const go = async function(){

   await prepareWallets();
  // console.log(testAbi);

  

   /*const tttt= "toCall";
   const abii= [
	
	{
		"inputs": [],
		"name": tttt,
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	}
];

  console.log(abii);
    const contractToCall = new ethers.Contract(CONTRACT_TEST, abii,provider);

    const contractToCallSigned =  contractToCall.connect(wallet);

    const tx= await contractToCallSigned.toCall({gasLimit:3000000});
    const res= await tx.wait();
    console.log(res);
    */
    

    
    const allTrigs = await firebaseLib.getAllTriggers();
    //console.log(allTrigs);
    let first= true;

    lastNonce = await wallet.getTransactionCount();    
    console.log("nonce");
    console.log(lastNonce);
   
    console.log(allTrigs.length);
    for(let i=0;i< allTrigs.length; i++){
       await tryToTrigger(allTrigs[i]);
    }
       
       

    /*
    allTrigs.map(function(trig){
       
            const result= tryToTrigger(trig);
       
    })*/
    
}

go();

const tryToTrigger = async (trig)=>{
        // next trig<now
        let intervalTimeStamp;
        switch(trig.interval){
            case "every minute":
                intervalTimeStamp = 60;
                
            case "hourly":
                intervalTimeStamp = 3600;
                break;

            case "daily":
                intervalTimeStamp = 3600*12;
                break;

            case "weekly":
                intervalTimeStamp = 3600*12*7;
                break;
            
            case "monthly":
                intervalTimeStamp = 3600*12*30;
                break;

            default:
                break;
        }

        const nextTick = trig.lastTick + intervalTimeStamp;

        console.log("next + date.now");
        console.log(nextTick);
        console.log (Date.now());
       
        if ( nextTick < Date.now() || trig.lastTick == 0 ){
           
            await tick(trig);           
        }
};

const tick = async (trig)=>{
    console.log(trig.maker);
    const TMCwallet = await firebaseLib.getTMCWallet(trig.maker);
    console.log('wallet')
    console.log(TMCwallet);

    const abi= [     
            {
                "inputs": [],
                "name": trig.functionToCall,
                "outputs": [],
                "stateMutability": "payable",
                "type": "function"
            }
        ];
    
    console.log(abi);
    const contractToCall = new ethers.Contract(trig.contractToCall, abi ,provider);
    const action = trig.functionToCall;
    //const contractToCallSigned =  contractToCall.connect(wallet);
   
    //var options = { gasPrice: 3000000000,gasLimit: 2000000 , nonce:lastNonce++};
    var options = {  nonce:lastNonce++};

  
    const unsignedTx= await contractToCall.populateTransaction[action](options);
    console.log("unsignedTx");  
    console.log(unsignedTx); 
    /* const estGas = await provider.estimateGas({
        from: wallet.address,
        to: unsignedTx.to,
        data: unsignedTx.data,
        gasPrice: provider.getGasPrice(),
      }) 
   */
    wallet.sendTransaction(unsignedTx);
   
    console.log("nonce2");  
    console.log(lastNonce);
   // console.log(estGas.toNumber());

    //const tx= await contractToCallSigned.toCall({gasLimit:3000000});
    // const res= await tx.wait();

    //console.log(res);
    
    // call trig.tocall contract and function


};


async function prepareWallets(){

    console.log("preparing wallets");

    wallet = new ethers.Wallet(process.env.PRIVATE_KEY_ACCOUNT, provider);      
    
    console.log("Wallet 0 Created");     
}



//
console.log("end");