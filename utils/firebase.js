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
                        datas.label,
                        datas.maker,
                        datas.chain,
                        datas.contractToCall,
                        datas.functionToCall,
                        datas.paramValues,
                        datas.paramTypes,
                        datas.interval,
                        datas.inWork,
                        datas.lastTick,
                        datas.deleted, 
                        datas.createTime
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


async function UpdateLastTick(id, newValue){
    // Add a new document in collection "cities"
    const docRef = firestore.doc(db, "triggers", id);
    const result = await firestore.updateDoc(docRef, {
        lastTick : newValue
    });
   return result;
}


async function addCallToDB(triggerId, timeStamp, txHash){
    
    let docRef;
    try {
        docRef = await firestore.addDoc(firestore.collection(db, "calls"), {
        triggerId:triggerId,
        time: timeStamp,
        txHash : txHash
    });
    console.log("Document written with ID: ", docRef.id);
    } catch (e) {
    console.error("Error adding document: ", e);
    }
    return docRef.id;
}

async function addCallResultToDB(callId, fees, gasUsed, status){
    
    let docRef;
    try {
        docRef = await firestore.addDoc(firestore.collection(db, "callResults"), {
        callId:callId,
        fees: fees,
        gasUsed : gasUsed,
        status :status
    });
    console.log("Document written with ID: ", docRef.id);
    } catch (e) {
    console.error("Error adding document: ", e);
    }
    return docRef.id;
}

module.exports={getAllTriggers, getTMCWalletIndex, UpdateLastTick, addCallToDB,addCallResultToDB};