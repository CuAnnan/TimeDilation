const   Ship                = require('./Ship');
let probesMade = 0,
    initialised  = false,
    parts = {};

class ShipFactory
{
    static get BASIC_SHIP_PARTS()
    {
        let parts = {
            CHASSI:{GEN1:{name:'Generation I Probe Core', baseMass:1, engineGroupSlots:[2,1], cost:1000}},
            THRUSTER:{GEN1:{thrust: 300, fuelPerSecond: 0.0005, baseMass: 1, name:'Generation I Thruster', cost:500}},
            FUEL_TANK:{GEN1:{density: 0.1, volume: 0.1, baseMass: 1, name:'Generation I Fuel Tank', cost:500}}
        };
        parts.ENGINE = {GEN1S:{name: 'Generation I Single', thrusters:[parts.THRUSTER.GEN1], fuelTanks:[parts.FUEL_TANK.GEN1]}, GEN1D:{name: 'Generation I Double', thrusters:[parts.THRUSTER.GEN1, parts.THRUSTER.GEN1], fuelTanks:[parts.FUEL_TANK.GEN1, parts.FUEL_TANK.GEN1]}};
        return parts;
    }

    static getPartByTypeAndName(partType, name)
    {
        let parts = this.parts[partType];
        let part = parts.find(function(part){
            return part.name === name;
        });
        return part;
    }

    static getEngineByName(name)
    {
        if(name)
        {
            return this.getPartByTypeAndName('engine', name);
        }
        return null;
    }

    static getChassiByName(name)
    {
        if(name)
        {
            return this.getPartByTypeAndName('chassi', name);
        }
        return null;
    }

    static getThrusterByName(name)
    {
        if(name)
        {
            return this.getPartByTypeAndName('thruster', name);
        }
        return null;
    }

    static getFuelTankByName(name)
    {
        if(name)
        {
            return this.getPartByTypeAndName('fuelTank', name);
        }
        return null;
    }


    static get parts()
    {
        if(!initialised)
        {
            let basicParts = this.BASIC_SHIP_PARTS;
            let camelCaseKeys = {
                CHASSI:{name:'chassi', class:require('./Chassi')},
                THRUSTER:{name:'thruster', class:require('./Thruster')},
                FUEL_TANK:{name:'fuelTank', class:require('./FuelTank')},
                ENGINE:{name:'engine', class:require('./Engine')}
            };
            for(let constKey in basicParts)
            {
                let match = camelCaseKeys[constKey];
                let newKey = match.name;
                parts[newKey] = [];
                for(let partKey in basicParts[constKey])
                {
                    let part = match.class.fromJSON(basicParts[constKey][partKey]);
                    parts[newKey].push(part);
                }
            }
            initialised = true;
        }

        return parts;
    }

    static getShipFromJSON(json)
    {
        return Ship.fromJSON(json);
    }

    static getNewProbe()
    {
        probesMade++;
        return Ship.fromJSON({
            name:`Probe ${probesMade}`,
            chassi:this.BASIC_SHIP_PARTS.CHASSI.GEN1,
            engineGroups:[
                this.BASIC_SHIP_PARTS.ENGINE.GEN1D,
                this.BASIC_SHIP_PARTS.ENGINE.GEN1D
            ]
        });
    }

    static getShipFromJSON(json)
    {
        return Ship.fromJSON(json);
    }
}

module.exports = ShipFactory;