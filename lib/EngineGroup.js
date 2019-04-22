const   ShipPart = require('./ShipPart'),
        Engine = require('./Engine'),
        Big = require('big-js');

class EngineGroup extends ShipPart
{
    constructor(json)
    {
        super(json);
        this.engines = [];
    }

    toJSON()
    {
        let json = super.toJSON();
        json.engines = [];
        for(let engine of this.engines)
        {
            json.engines.push(engine.toJSON());
        }
        return json;
    }

    get mass()
    {
        let mass = 0;
        for(let engine of this.engines)
        {
            mass = engine.mass.plus(0);
        }
        return mass;
    }

    get fuelRemaining()
    {
        let fuelRemaining = 0;
        for(let engine of this.engines)
        {
            fuelRemaining = engine.fuelRemaining.plus(fuelRemaining);
        }
        return fuelRemaining;
    }

    get thrust()
    {
        let thrust = 0;
        for(let engine of this.engines)
        {
            thrust = engine.thrust.plus(thrust);
        }
        return thrust;
    }

    burn(maxSeconds)
    {
        let totalBurn = {thrust:new Big(0), time:0};
        if(this.fuelRemaining.gt(0))
        {
            for(let engine of this.engines)
            {
                let engineBurn = engine.burn(maxSeconds);
                totalBurn.thrust = engineBurn.thrust.plus(totalBurn.thrust);
                totalBurn.time = Math.max(totalBurn.time, engineBurn.time);
            }
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
        for(let engineJSON of json.engines)
        {
            engineGroup.engines.push(Engine.fromJSON(engineJSON));
        }

        return engineGroup;
    }
}

module.exports = EngineGroup;