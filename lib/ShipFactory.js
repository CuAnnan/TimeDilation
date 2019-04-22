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
            chassi:{
                partMass:1
            },
            engineGroups:[
                {
                    engines:[{
                        thrusters: [
                            {thrust: 10, fuelPerSecond: 0.05, partMass: 1}
                        ],
                        fuelTanks: [{density: 1, volume: 1, partMass: 1}]
                    }]
                },
                {
                    engines:[{
                        thrusters: [
                            {thrust: 10, fuelPerSecond: 0.05, partMass: 1}
                        ],
                        fuelTanks: [{density: 1, volume: 1, partMass: 1}]
                    }]
                }
            ]
        });
    }

    static getShipFromJSON(json)
    {
        return Ship.fromJSON(json);
    }
}

module.exports = ShipFactory;