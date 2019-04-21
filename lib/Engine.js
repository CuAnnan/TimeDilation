const   Big         = require('big-js'),
        ShipPart    = require('./ShipPart');

class Engine extends ShipPart
{
    constructor(data)
    {
        super(data);
        if(!this.name)
        {
            this.name = 'Engine';
        }
        this.fuelPerSecond = new Big(data.fuelPerSecond?data.fuelPerSecond:1);
        this.thrust = new Big(data.thrust?data.thrust:1);
    }

    toJSON()
    {
        let json = super.toJSON();
        json.fuelPerSecond = this.fuelPerSecond.toString();
        return json;
    }
}

module.exports = Engine;