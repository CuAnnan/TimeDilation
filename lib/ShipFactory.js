const   ShipPart    = require('./ShipPart'),
        FuelTank    = require('./FuelTank'),
        Engine      = require('./Engine'),
        Ship        = require('./Ship');

probesMade = 0;

class ShipFactory
{
    static getNewProbe()
    {
        probesMade++;
        return Ship.fromJSON({
            name:`Probe ${probesMade}`,
            chassi:{},
            engine:{},
            fuelTank:{}
        });
    }

    static getShipFromJSON(json)
    {
        return Ship.fromJSON(json);
    }
}

module.exports = ShipFactory;