const   Ship                = require('./Ship');
let probesMade = 0,
    initialised  = false,
    parts = {};

class ShipFactory
{
    static get BASIC_SHIP_PARTS()
    {
        return {
            CHASSI:{GEN1:{name:'Generation I Probe Core', baseMass:1, engineGroupSlots:2, cost:1000}},
            THRUSTER:{GEN1:{thrust: 10, fuelPerSecond: 0.05, baseMass: 1, name:'Generation I Thruster', cost:2000}},
            FUEL_TANK:{GEN1:{density: 1, volume: 1, baseMass: 1, name:'Generation I Fuel Tank', cost:2000}}
        };
    }

    static get parts()
    {
        if(!initialised)
        {
            let basicParts = this.BASIC_SHIP_PARTS;
            let camelCaseKeys = {
                CHASSI:'chassi',
                THRUSTER:'thruster',
                FUEL_TANK:'fuelTank'
            };
            for(let i in basicParts)
            {
                for(let j in basicParts[i])
                {
                    parts[camelCaseKeys[i]] = [this.BASIC_SHIP_PARTS[i][j]];
                }
            }
            initialised = true;
        }
        console.log(parts);
        return parts;
    }

    static getNewProbe()
    {
        probesMade++;
        return Ship.fromJSON({
            name:`Probe ${probesMade}`,
            chassi:this.BASIC_SHIP_PARTS.CHASSI.GEN1,
            engineGroups:[
                {
                    engines:[{
                        thrusters: [this.BASIC_SHIP_PARTS.THRUSTER.GEN1],
                        fuelTanks: [this.BASIC_SHIP_PARTS.FUEL_TANK.GEN1]
                    }]
                },
                {
                    engines:[{
                        thrusters: [this.BASIC_SHIP_PARTS.THRUSTER.GEN1],
                        fuelTanks: [this.BASIC_SHIP_PARTS.FUEL_TANK.GEN1]
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