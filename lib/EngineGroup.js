const   ShipPart = require('./ShipPart'),
        Engine = require('./Engine'),
        Big = require('big-js');

class EngineGroup extends ShipPart
{
    constructor(json)
    {
        super(json);
        this.engine = null;
        this.count = 0;
    }

    setEngine(engine)
    {
        this.engine = engine;
        this.setCost();
        return this;
    }

    setCount(count)
    {
        this.count = count;
        this.setCost();
        return this;
    }

    setCost()
    {
        if(this.count && this.engine)
        {
            this.cost = this.engine.cost.times(this.count);
        }
    }

    toJSON()
    {
        let json = super.toJSON();
        json.engine = this.engine;
        json.count = this.count;
        return json;
    }

    get mass()
    {
        return this.engine.mass.times(this.count);
    }

    get fuelRemaining()
    {
        return this.engine.fuelRemaining.times(this.count);
    }

    get thrust()
    {
        return this.engine.thrust.times(this.count);
    }

    burn(maxSeconds)
    {
        let totalBurn = {thrust:new Big(0), time:0};
        if(this.fuelRemaining.gt(0))
        {
            let engineBurn = this.engine.burn(maxSeconds);
            totalBurn.thrust = engineBurn.thrust.times(this.count);
            totalBurn.time - Math.max(totalBurn.time, engineBurn.time);
        }
        if(this.fuelRemaining.eq(0))
        {
            this.trigger('fuelBurnedOut');
        }
        return totalBurn;
    }

    static fromJSON(json)
    {
        let engineGroup = super.fromJSON(json);
        engineGroup.engine = Engine.fromJSON(json);
        engineGroup.count = json.count;
        return engineGroup;
    }
}

module.exports = EngineGroup;