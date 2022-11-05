class Trigger {
    
    constructor(
        docId,
        label,
        maker,
        chain, 
        contractToCall,
        functionToCall,
        paramsValues, 
        paramsTypes,
        interval,
        inWork,
        lastTick,
        deleted, 
        createTime,
        
    ) {
        this.id = docId;
        this.label = label;
        this.maker = maker;
        this.chain = chain;
        this.contractToCall = contractToCall;
        this.functionToCall = functionToCall;
        this.paramsValues = paramsValues;
        this.paramsTypes = paramsTypes;
        this.interval = interval;
        this.inWork = inWork;
        this.lastTick = lastTick;
        this.deleted = deleted;
        this.createTime = createTime;
    }
}

module.exports = Trigger;