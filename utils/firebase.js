//import { initializeApp } from "firebase/app";
const initializeApp = require("firebase/app");
//import { getFirestore, addDoc,updateDoc, doc,getDocs, collection } from "firebase/firestore";

const firestore = require("firebase/firestore");

const Trigger = require("../entities/Trigger");

const firebaseConfig = {
    apiKey: "AIzaSyCgvr9RFTVPbQBKLFcdBCt3qwmhxogkmkM",
    authDomain: "trigggermycontract.firebaseapp.com",
    projectId: "trigggermycontract",
    storageBucket: "trigggermycontract.appspot.com",
    messagingSenderId: "976970159149",
    appId: "1:976970159149:web:008281e49a520dbcdf54a4",
    measurementId: "G-JPRH5K3QMW"
  };

const app = initializeApp.initializeApp(firebaseConfig);
const db = firestore.getFirestore(app);

async function getAllTriggers() {
    const tabReturn = [];
    const docs = await firestore.getDocs(firestore.collection(db, "triggers"));   

    docs.forEach((doc) => {
        const datas= doc.data();
       // console.log("doooc");
    console.log(doc.id);
            tabReturn.push(            
                    new Trigger(
                        doc.id,
                        datas.maker,
                        datas.contractToCall,
                        datas.functionToCall,
                        datas.interval,
                        datas.inWork,
                        datas.lastTick
                        )
            );   
        });    
    return tabReturn;
}

async function getTMCWalletIndex(userAddress){
    const docRef = firestore.doc(db, "accounts", userAddress);  
    const docSnap = await firestore.getDoc(docRef);

    return docSnap.data().mnemonicIndex;
}

 async function getTriggerByAddrFrom(address, web3){
   const tabReturn = [];
    const docs = await getDocs(collection(db, "users"));    

    docs.forEach((doc) => {
        const datas= doc.data();     
      
        if (datas.FromAddress == web3)

        tabReturn.push(
            Trigger(
                    datas.maker,
                    datas.contractToCall,
                    datas.functionToCall,
                    datas.interval,
                    datas.inWork,
                    datas.lastTick
                    )
        );   
    });    
    return tabReturn;
}



async function UpdateLastTick(id, newValue){
    // Add a new document in collection "cities"
    const docRef = firestore.doc(db, "triggers", id);
    const result = await firestore.updateDoc(docRef, {
        lastTick : newValue
    });
   return result;
}




async function addCallToDB(triggerId, timeStamp, txHash){
    try {
    const docRef = await firestore.addDoc(firestore.collection(db, "calls"), {
        triggerId:triggerId,
        time: timeStamp,
        txHash : txHash
    });
    console.log("Document written with ID: ", docRef.id);
    } catch (e) {
    console.error("Error adding document: ", e);
    }
}

module.exports={getAllTriggers, getTMCWalletIndex, UpdateLastTick, addCallToDB};