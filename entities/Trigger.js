class Trigger {
    
    constructor(
        docId,
        maker,
        contractToCall,
        functionToCall,
        interval,
        inWork,
        lastTick
        
    ) {
        this.id = docId;
        this.maker = maker;
        this.contractToCall = contractToCall;
        this.functionToCall = functionToCall;
        this.interval = interval;
        this.inWork = inWork;
        this.lastTick = lastTick;
    }
}

module.exports = Trigger;