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

    wallet = new ethers.Wallet(process.env.PRIVATE_KEY_ACCOUNT, provider);  
    
    const allTrigs = await firebaseLib.getAllTriggers();

    for(let i=0;i< allTrigs.length; i++){
       await tryToTrigger(allTrigs[i]);
    }    
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

        /*
        console.log("next + date.now");
        console.log(nextTick);
        console.log (Date.now());
       */

        if ( nextTick < Date.now() || trig.lastTick == 0 ){
           
            await tick(trig);           
        }
};

const tick = async (trig)=>{
    
    const TMCwalletIndex = await firebaseLib.getTMCWalletIndex(trig.maker);    
    const TMCwallet = ethers.Wallet.fromMnemonic(process.env.MNEMONIC_MAIN, `m/44'/60'/1'/0/` + TMCwalletIndex.toString());    
    const TMCwalletSigner = new ethers.Wallet(TMCwallet.privateKey, provider);  
       

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
   
    //var options = { gasPrice: 3000000000,gasLimit: 2000000 , nonce:lastNonce++};
    //var options = { nonce:lastNonce++};  
  
    const unsignedTx= await contractToCall.populateTransaction[action]();
    console.log("unsignedTx");  
    console.log(unsignedTx); 
    /* const estGas = await provider.estimateGas({
        from: wallet.address,
        to: unsignedTx.to,
        data: unsignedTx.data,
        gasPrice: provider.getGasPrice(),
      }) 
   */
    //  wallet.sendTransaction(unsignedTx);
    TMCwalletSigner.sendTransaction(unsignedTx).then(function(receipt){
        console.log(receipt);

    });
   /*
    console.log("nonce2");  
    console.log(lastNonce);
    */
   // console.log(estGas.toNumber());

};