const   Big         = require('big-js'),
        ShipPart    = require('./ShipPart'),
        Thruster    = require('./Thruster'),
        FuelTank    = require('./FuelTank');

/**
 * An Engine is a group of thrusters and a group of fuel tanks
 */
class Engine extends ShipPart
{
    constructor(data)
    {
        super(data);
        if(!this.name)
        {
            this.name = 'Engine';
        }
        this.thrusters = [];
        this.fuelTanks = [];
        /*
        Storing this reduces the need to calculate the thruster masses every time we want to calculate the mass of the engine
         */
        this.thrusterMass = new Big(0);
        this.fuelPerSecond = new Big(0);
        this.thrust = new Big(0);
    }

    /**
     * Add a thruster
     * @param {Thruster} thruster
     */
    addThruster(thruster)
    {
        this.thrusters.push(thruster);
        this.fuelPerSecond = this.fuelPerSecond.plus(thruster.fuelPerSecond);
        this.thrusterMass = this.thrusterMass.plus(thruster.mass);
        this.thrust = this.thrust.plus(thruster.thrust);
    }

    /**
     * Add an engine
     * @param {Engine} engine
     */
    addFuelTank(engine)
    {
        this.fuelTanks.push(engine);
    }

    get fuelRemaining()
    {
        let fuelRemaining = 0;
        for(let tank of this.fuelTanks)
        {
            fuelRemaining = tank.fuelRemaining.plus(fuelRemaining);
        }
        return fuelRemaining;
    }

    get mass()
    {
        let mass = this.thrusterMass;
        for(let fuelTank of this.fuelTanks)
        {
            mass = mass.plus(fuelTank.mass);
        }
        return mass;
    }

    /**
     * This method tries to burn the thursters  in the engine for a number of seconds
     * @param {Number} maxSeconds A big that is greater than zero. Could be  half a second, could be a second
     */
    burn(maxSeconds)
    {
        // set the burn time to the requested burn time
        let time = maxSeconds,
            // determine how much fuel that will take
            fuelRequired = this.fuelPerSecond.times(maxSeconds),
            // how much fuel this burn actually has
            fuelSourced = new Big(0),
            // a ticker to search through the tanks
            tanksSearched = 0,
            thrust = this.thrust;
        // search through the tanks, adding fuel from each one until enough fuel is added
        while(tanksSearched < this.fuelTanks.length && fuelSourced.lt(fuelRequired))
        {
            // add an amount from the current tank
            fuelSourced = fuelSourced.plus(this.fuelTanks[tanksSearched].useFuel(fuelRequired.minus(fuelSourced)));
            // check the next tank if necessary
            tanksSearched ++;
        }

        if(!fuelSourced.eq(fuelRequired))
        {
            time = fuelSourced.div(fuelRequired).times(time);
            thrust = thrust.times(time);
        }


        return {thrust: thrust, time:time};
    }

    static fromJSON(json)
    {
        let engine = super.fromJSON(json);
        engine.cost = 0;

        for(let fuelTankJSON of json.fuelTanks)
        {
            let fuelTank = FuelTank.fromJSON(fuelTankJSON);
            engine.addFuelTank(fuelTank);
            engine.cost = fuelTank.cost.plus(engine.cost);
        }
        for(let thrusterJSON of json.thrusters)
        {
            let thruster = Thruster.fromJSON(thrusterJSON);
            engine.addThruster(thruster);
            engine.cost = thruster.cost.plus(engine.cost);
        }
        return engine;
    }


    toJSON()
    {
        let json = super.toJSON();
        json.thrusters = [];
        json.fuelTanks = [];
        for(let fuelTank of this.fuelTanks)
        {
            json.fuelTanks.push(fuelTank.toJSON());
        }
        for(let thruster of this.thrusters)
        {
            json.thrusters.push(thruster.toJSON());
        }
        return json;
    }

    get json()
    {
        let json = super.toJSON(), thrusters = [], fuelTanks = [];
        for(let fuelTank of this.fuelTanks)
        {
            fuelTanks.push(fuelTank.name);
        }
        for(let thruster of this.thrusters)
        {
            thrusters.push(thruster.name);
        }
        json.fuelTanks = fuelTanks.join(', ');
        json.thrusters = thrusters.join(', ');
        return json;
    }
}

module.exports = Engine;