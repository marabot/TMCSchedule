const firebaseLib = require('./utils/firebase.js');
const ethers= require("ethers");
require('dotenv').config();
var readline = require('readline');
const testAbi = require('./abi/TrigMyContractTest.json');

let provider;
let wallet;

let noncesTab= new Map();
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
    
    setInterval(async()=>{    
        const allTrigs = await firebaseLib.getAllTriggers();

        for(let i=0;i< allTrigs.length; i++){
            console.log("tryy !!! ");
           await tryToTrigger(allTrigs[i]);
        }    
   }, 10*1000 );   

    
}

go();


const tryToTrigger = async (trig)=>{       

        const nextTick = trig.lastTick + trig.interval;
      /*
        console.log("next + date.now");
        console.log(trig.interval);        
        console.log(trig.lastTick);
       
        console.log("nextTick : " + nextTick);
        console.log("now      : " + Date.now()/1000);
*/
        if ( (nextTick < Date.now()/1000 || trig.lastTick === 0) && trig.inWork ===true){
           
            await tick(trig);           
        }
};

const tick = async (trig)=>{
    
    let lastNonce;

    const TMCwalletIndex = await firebaseLib.getTMCWalletIndex(trig.maker);    
    const TMCwallet = ethers.Wallet.fromMnemonic(process.env.MNEMONIC_MAIN, `m/44'/60'/1'/0/` + TMCwalletIndex.toString());   
    const TMCwalletSigner = new ethers.Wallet(TMCwallet.privateKey, provider);  
    
    if (noncesTab.has(TMCwalletSigner.address)){
      
        lastNonce= noncesTab.get(TMCwalletSigner.address);       
        noncesTab.set(TMCwalletSigner.address, lastNonce+1);
        
        console.log("nonce %");
        console.log(lastNonce+1);  

    }else{
        lastNonce = await TMCwalletSigner.getTransactionCount();         
        noncesTab.set(TMCwalletSigner.address, lastNonce+1);

        console.log("nonce !");
        console.log(lastNonce);  
    }

    const parValues =  parseParams(trig.paramsValues);
    const parTypes =  parseParams(trig.paramsTypes);

    let params = [];
    for (let i =0;i<parTypes.length;i++){
       params.push({"type":parTypes[i],"name": "param"  + i});
    };   
   console.log(params);
  

    const abi= [     
            {
                "inputs": params,
                "name": trig.functionToCall,
                "outputs": [],
                "stateMutability": "payable",
                "type": "function"
            }
        ];
    
    
    const contractToCall = new ethers.Contract(trig.contractToCall, abi ,provider);
    const action = trig.functionToCall;
        
    var options = { gasPrice: 3000000000,gasLimit: 2000000 , nonce:lastNonce};
   
    //var options = { nonce:lastNonce}; 
    //var options = { nonce:newNonce}; 
    const paramsValue = ["1", "gbigbuhhhg"];
    
    let unsignedTx;
    switch (parValues.length){
            case 1:
                
                unsignedTx= await contractToCall.populateTransaction[action](parValues[0],options);  
                break;
            case 2:
                
                unsignedTx= await contractToCall.populateTransaction[action](parValues[0],parValues[1],options);  
                break
            case 3:
                
                unsignedTx= await contractToCall.populateTransaction[action](parValues[0],parValues[1],parValues[2],options);  
                break;

            default:
                unsignedTx= await contractToCall.populateTransaction[action](options);  
                break;
    }

    console.log("unsignedTx :");  
    console.log(unsignedTx); 
    /* const estGas = await provider.estimateGas({
        from: wallet.address,
        to: unsignedTx.to,
        data: unsignedTx.data,
        gasPrice: provider.getGasPrice(),
      }) 
   */
    //  wallet.sendTransaction(unsignedTx);
    firebaseLib.UpdateLastTick(trig.id,Date.now()/1000);
    TMCwalletSigner.sendTransaction(unsignedTx).then(function(receipt){
        console.log(receipt);
        firebaseLib.addCallToDB(trig.id, Date.now()/1000, receipt.hash);
    });
   /*
    console.log("nonce2");  
    console.log(lastNonce);
    */
   // console.log(estGas.toNumber());

};

function  parseParams(params){
   
    const ret = [];

    params.split(';').map((e)=>{
        if (e!="") ret.push(e);
    });

    return ret;
}
