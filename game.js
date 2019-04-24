(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
const   Game = require('./lib/Game'),
        ShipFactory = require('./lib/ShipFactory');

(function($){$(function() {

let lastTimestamp = 0,
    maxFPS = 60,
    newShipEngineGroupMax = 0,
    newShipEngineGroups = [],
    newShipChassi = null,
    newShipCost = 0,
    $ships = $('#ships'),
    $newShipName = $('#newShipName'),
    $newShipChassiSelect = $('#newShipChassi'),
    $newShipFuelTankSelect = $('#newShipFuelTank'),
    $newShipThrusterSelect = $('#newShipThruster'),
    $newShipEngineCount = $('#newShipEngineCount'),
    $newShipFuelTankCount = $('#newShipFuelTankCount'),
    $newShipThrusterCount = $('#newShipThrusterCount'),
    $buildShipButton = $('#buildShipButton'),
    $buildShipEngineGroups = $('#engineGroups'),
    $addEngineGroupButton = $('#addEngineGroup');

function createShipElement(index, ship)
{
    return $(`<div class="col-3 ship">
    <div class="row">
        <div class="col">Ship name:</div>
        <div class="col shipName">${ship.name}</div>
    </div>
    <div class="row">
        <div class="col-6">Mass</div>
        <div class="col shipMass">${ship.mass}</div>
        <div class="col-1">kg</div>
    </div>
    <div class="row">
        <div class="col-6">Fuel</div>
        <div class="col shipFuel"></div>
        <div class="col-1">kg</div>
    </div>
    <div class="row">
        <div class="col-6">Acceleration</div>
        <div class="col shipAcceleration"></div>
        <div class="col-1">m/s<sup>2</sup></div>
    </div>
    <div class="row">
        <div class="col">Engine Groups:</div>
        <div class="col engineGroupCount">${ship.engineGroups.length}</div>
    </div>
    <div class="row">
        <div class="col-6">Velocity</div>
        <div class="col shipVelocity"></div>
        <div class="col-1">m/s</div>
    </div>
    <div class="row">
        <div class="col-6">Distance</div>
        <div class="col shipDistance"></div>
        <div class="col-1">m</div>
    </div>
</div>`);
}

function formatNumber(number, digits = 7)
{
    if(number.e < digits)
    {
        let fixed = Math.min(digits - number.e, digits);
        return number.toFixed(fixed);
    }
    return number.toPrecision(digits);
}

function updateShipElement(ship)
{
    $elem = ship.$elem;
    $('.shipMass', $elem).text(ship.mass);
    $('.shipDistance', $elem).text(formatNumber(ship.distance));
    $('.shipVelocity', $elem).text(formatNumber(ship.velocity));
    $('.shipFuel', $elem).text(formatNumber(ship.fuelRemaining));
    $('.engineGroupCount', $elem).text(ship.engineGroups.length);
    $('.shipAcceleration', $elem).text(formatNumber(ship.acceleration));
}

function draw()
{
    for(let i in Game.ships)
    {
        let ship = Game.ships[i];
        if(!ship.$elem)
        {
            ship.$elem = createShipElement(i, ship).appendTo($ships);
            $ships.append(ship.$elem);
        }
        updateShipElement(ship);
    }
    $('#globalTimer').text(Game.time.toFixed(1));
    $('#gameFunding').text(Game.funding.toFixed(2));
}

function unCamelCase(string)
{
    // found this here: https://stackoverflow.com/questions/4149276/javascript-camelcase-to-regular-form
    return string.replace(/([A-Z])/g, ' $1').replace(/^./, function(str){ return str.toUpperCase(); })
}

function makeBasicPartRow(key, part)
{
    let properName = unCamelCase(key);
    return $(`<div class="row"><div class="col-4">${properName}</div><div class="col">${part[key]}</div></div>`);

}

function makeBasicPartElement(part)
{
    let $containingCol = $('<div class="col-4"/>');
    let universalFields = ['name', 'baseMass', 'cost'];
    for(let key of universalFields)
    {
        makeBasicPartRow(key, part).appendTo($containingCol);
    }
    for(let key in part)
    {
        if(universalFields.indexOf(key) < 0)
        {
            makeBasicPartRow(key, part).appendTo($containingCol);
        }
    }
    return $containingCol;
}

function makePartOption(part)
{
    return $(`<option value="${part.name}">${part.name} (${part.cost})</option>`);
}

function initialiseBuildParts()
{
    let buildParts = ShipFactory.parts;
    for(let partType in buildParts)
    {
        let id = `#${partType}PartsDesignScreen`,
            $container = $('.card-body', id);
        for(let part of buildParts[partType])
        {
            makeBasicPartElement(part).appendTo($container);
        }
    }

    for(let chassi of ShipFactory.parts.chassi)
    {
        $newShipChassiSelect.append(makePartOption(chassi));
    }

    for(let fuelTank of ShipFactory.parts.fuelTank)
    {
        $newShipFuelTankSelect.append(makePartOption(fuelTank));
    }

    for(let thruster of ShipFactory.parts.thruster)
    {
        $newShipThrusterSelect.append(makePartOption(thruster));
    }
}


function gameLoop(timestamp)
{
    if (timestamp < lastTimestamp + (1000 / maxFPS))
    {
        requestAnimationFrame(gameLoop);
        return;
    }

    draw();
    requestAnimationFrame(gameLoop);
}

function disableModal()
{
    $newShipEngineCount.attr('disabled', 'disabled');
    $buildShipButton.attr('disabled', 'disabled');
}

function showMissionModal()
{
    let parts = ShipFactory.parts,
        $modal = $('#newMissionModal');
    newShipEngineGroupMax = 0;
    newShipEngineGroups = [];
    newShipChassi = null;
    newShipCost = 0;

    $('select', $modal).val('');
    $('input', $modal).val(function() {
        let min = $(this).attr('min');
        return min?min:'';
    });

    $('#engineGroups').empty();

    disableModal();
    $addEngineGroupButton.attr('disabled', 'disabled');
    $buildShipButton.attr('disabled', 'disabled');
    $buildShipEngineGroups.empty();

    $modal.modal('show');
}

function checkModalForValidity()
{
    let $modal = $('#newMissionModal'),
        valid = $newShipName.val() && newShipEngineGroups.length;

    $('select', $modal).each(function(){
        if(!$(this).val())
        {
            valid = false;
        }
    });

    if(valid)
    {
        $buildShipButton.removeAttr('disabled');
    }
}

function checkEngineLayoutForValidity()
{
    let valid = newShipEngineGroups.length < newShipEngineGroupMax && $newShipFuelTankSelect.val() && $newShipThrusterSelect.val() && $newShipChassiSelect.val();

    if(valid)
    {
        $addEngineGroupButton.removeAttr('disabled');
        return;
    }
    $addEngineGroupButton.attr('disabled', 'disabled');
}

function updateNewShipModalForChassi()
{
    let chassiName = $(this).val()
    newShipChassi = ShipFactory.getChassiByName(chassiName);

    if(newShipChassi)
    {
        $newShipEngineCount.removeAttr('disabled');
        $newShipEngineCount.attr('max', newShipChassi.engineGroupSlots);
        newShipEngineGroupMax = newShipChassi.engineGroupSlots;
        checkModalForValidity();
        newShipCost += newShipChassi.cost;
        updateShipCost();
        return;
    }

    disableModal();
}

function updateShipCost()
{
    $('#newShipCost').text(newShipCost);
}


function makeEngineGroupRow(engineLayout)
{

    let $row = $(`<div class="row align-items-center"><div class="col-3">Group ${newShipEngineGroups.length} of ${newShipEngineGroupMax}</div></div>`),
        $engineCol = $('<div class="col"></div>').appendTo($row),
        $engineCountCol = $(`<div class="col-2">x ${engineLayout.length}</div>`).appendTo($row);

    $(`<div class="row">${engineLayout.length}</div>`);
    let layout = engineLayout[0];
    for(let partType in layout)
    {
        let part = layout[partType][0], parts = layout[partType].length;
        $engineCol.append($(`<div class="row">
    <div class="col">${part.name}</div>
    <div class="col-3">x ${parts}</div>
</div>`));
    }

    return $row;
}

function addShipEngineGroup()
{
    let engineLayout = {
            thrusters:[],
            fuelTanks:[]
        },
        thrusterJSON = ShipFactory.getThrusterByName($newShipThrusterSelect.val()),
        thrusters = $newShipThrusterCount.val(),
        tankJSON = ShipFactory.getFuelTankByName($newShipFuelTankSelect.val()),
        tanks = $newShipFuelTankCount.val(),
        engineCount = $newShipEngineCount.val(),
        engines = [],
        groupCost = 0;
    for(let i = 0; i < thrusters; i++)
    {
        engineLayout.thrusters.push(thrusterJSON);
        groupCost += thrusterJSON.cost;
    }
    for(let i = 0; i < tanks; i++)
    {
        engineLayout.fuelTanks.push(tankJSON);
        groupCost += tankJSON.cost;
    }
    for(let i = 0; i < engineCount; i++)
    {
        engines.push(engineLayout);
    }
    newShipCost += groupCost;
    newShipEngineGroups.push({engines:engines});
    $buildShipEngineGroups.append(makeEngineGroupRow(engines));
    checkEngineLayoutForValidity();
    checkModalForValidity();
    updateShipCost();
}

function buildNewShip()
{
    let ship = ShipFactory.getShipFromJSON({
        name:$newShipName.val(),
        chassi:newShipChassi,
        engineGroups:newShipEngineGroups
    });
    Game.addShip(ship);
    $('#newMissionModal').modal('hide');
}

$('input[name=gameSpeed]').change(function(){
    Game.compression = ($(this).val());
});

$newShipThrusterSelect.change(checkModalForValidity).change(checkEngineLayoutForValidity);
$newShipFuelTankSelect.change(checkModalForValidity).change(checkEngineLayoutForValidity);
$newShipName.change(checkModalForValidity).change(checkEngineLayoutForValidity);
$newShipChassiSelect.change(updateNewShipModalForChassi).change(checkEngineLayoutForValidity);
$addEngineGroupButton.click(addShipEngineGroup);
$('#launchMissionButton').click(showMissionModal);
$buildShipButton.click(buildNewShip);

initialiseBuildParts();


Game.start();
draw();
requestAnimationFrame(gameLoop);

});})(jQuery);
},{"./lib/Game":6,"./lib/ShipFactory":9}],2:[function(require,module,exports){
const   ShipPart    = require('./ShipPart');

class Chassi extends ShipPart
{
    constructor(data)
    {
        super(data);
        if(!this.name)
        {
            this.name='Chassi';
        }
        this.engineGroupSlots = data.engineGroupSlots?data.engineGroupSlots:1;
    }
}

module.exports = Chassi;
},{"./ShipPart":10}],3:[function(require,module,exports){
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
        for(let fuelTankJSON of json.fuelTanks)
        {
            engine.addFuelTank(FuelTank.fromJSON(fuelTankJSON));
        }
        for(let thrusterJSON of json.thrusters)
        {
            engine.addThruster(Thruster.fromJSON(thrusterJSON));
        }
        return engine;
    }


    toJSON()
    {
        let json = super.toJSON();
        json.thrusters = [];
        json.fuelTanks = [];
        for(let engine of this.fuelTanks)
        {
            json.fuelTanks.push(engine.toJSON());
        }
        for(let thruster of this.thrusters)
        {
            json.thrusters.push(thruster.toJSON());
        }
        return json;
    }
}

module.exports = Engine;
},{"./FuelTank":5,"./ShipPart":10,"./Thruster":11,"big-js":13}],4:[function(require,module,exports){
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
},{"./Engine":3,"./ShipPart":10,"big-js":13}],5:[function(require,module,exports){
const   Big         = require('big-js'),
        ShipPart    = require('./ShipPart');

class FuelTank extends ShipPart
{
    constructor(data)
    {
        super(data);
        if(!this.name)
        {
            this.name = 'Fuel Tank';
        }

        /**
         * The volume of the fuel tank in m3
         */
        this.volume = new Big(data.volume?data.volume:1000);
        /**
         * The specific density of the fuel
         * This is used to calculate the mass of the fuel
         */
        this.density = new Big(data.density?data.density:1);

        /**
         * fuelRemaining is the amount of kg of fuel remaining
         */
        if(data.fuelRemaining)
        {
            this.fuelRemaining = new Big(data.fuelRemaining);
        }
        else
        {
            this.fuelRemaining = this.volume.div(this.density);
        }
        this.empty = this.fuelRemaining.lte(0);
    }

    useFuel(fuelAmount)
    {
        if(this.empty)
        {
            return 0;
        }

        let amountToSpend = fuelAmount;
        if(this.fuelRemaining.lt(fuelAmount))
        {
            amountToSpend = this.fuelRemaining;
        }
        this.fuelRemaining = this.fuelRemaining.minus(amountToSpend);
        this.empty = this.fuelRemaining.lte(0);
        return amountToSpend;
    }

    get mass()
    {
        return this.baseMass.add(this.fuelRemaining);
    }

    toJSON()
    {
        let json = super.toJSON();
        json.density = this.density.toString();
        json.fuelRemaining = this.fuelRemaining.toString();
        json.totalMass = this.mass.toString();
        return json;
    }
}

module.exports = FuelTank;
},{"./ShipPart":10,"big-js":13}],6:[function(require,module,exports){
const   ShipFactory = require('./ShipFactory'),
        Big = require('big-js');

class Game
{
    static addNewProbe()
    {
        this.addShip(ShipFactory.getNewProbe());
    }

    static addShip(ship)
    {
        this.ships.push(ship);
    }

    static simulate(seconds)
    {
        for(let ship of this.ships)
        {
            ship.simulate(seconds);
        }
    }


    static tick()
    {
        for(let i = 0; i < this.compression; i++)
        {
            this.simulate(this.tickLength);
            this.time += this.tickLength;
            this.ticks++;
        }

        if (this.ticking)
        {
            this.tickPromise = new Promise((resolve, reject) => {
                setTimeout(() => {
                    this.tick();
                    resolve(this);
                }, this.tickLength * 1000)
            });
        }
    }

    static async start()
    {
        this.ticking = true;
        this.tick();
        return this.tickPromise;
    }

    static async stop()
    {
        this.ticking = false;
        return this.tickPromise;
    }

    static report()
    {
        let report = `Ticks: ${this.ticks}\nSeconds:${Math.round(this.time)}\n`;
        for(let ship of this.ships)
        {
            report += `${ship.name} reached ${ship.velocity}m/s`;
        }
        return report;
    }

    static async toggle()
    {
        this.ticking = !this.ticking;
        if(this.ticking)
        {
            return this.start();
        }
        else
        {
            return this.stop();
        }
    }

    static get tickLength()
    {
        return 1/this.ticksPerSecond;
    }


}
Game.ships = [];
Game.ticking = false;
Game.ticksPerSecond = 100;
Game.compression = 1;
Game.time = 0;
Game.ticks = 0;
Game.funding = new Big(10000);

module.exports = Game;
},{"./ShipFactory":9,"big-js":13}],7:[function(require,module,exports){
class Listenable
{
    constructor()
    {
        this.eventHandlers = {};
    }

    on(event, handler)
    {
        this.eventHandlers[event] = this.eventHandlers[event]?this.eventHandlers[event]:[];
        this.eventHandlers[event].push(handler);
    }

    trigger(event)
    {
        if(this.eventHandlers[event])
        {
            for (let handler of this.eventHandlers[event])
            {
                handler(this);
            }
        }
    }
}

module.exports = Listenable;
},{}],8:[function(require,module,exports){
const   Big = require('big-js'),
        Chassi = require('./Chassi'),
        EngineGroup = require('./EngineGroup'),
        UniversalConstants = require('./UniversalConstants'),
        Listenable = require('./Listenable');

class Ship extends Listenable
{
    constructor(data)
    {
        super();
        /**
         * The name of the ship
         */
        this.name           = data.name;
        /**
         * The velocity of the ship
         */
        this.velocity       = new Big(data.velocity?data.velocity:0);

        /**
         * The distance the ship has travelled
         */
        this.distance       = new Big(data.distance?data.distance:0);
        /**
         * The relative time that has lapsed on the ship
         */
        this.relativeTime   = new Big(data.relativeTime?data.relativeTime:0);
        /**
         * The gamma of the ship;
         */
        this.gamma          = new Big(data.gamma?data.gamma:1);
        this.acceleration= 0;

        this.chassi = null;
        this.engineGroups = [];
        this.hasFuel = false;

        /**
         * The ships lorentz shift
         */
    }

    addEngineGroup(engineGroup)
    {
        if(this.engineGroups.length === this.chassi.engineGroupSlots)
        {
            console.log('Attempted to add extra engine slot beyond cap');
            return;
        }
        if(engineGroup.fuelRemaining)
        {
            this.hasFuel = true;
            this.engineGroups.push(engineGroup);
            engineGroup.on('fuelBurnedOut', (engineGroup)=>{this.ditchEngineGroup(engineGroup)});
            if(!this.currentEngineGroup)
            {
                this.currentEngineGroup = engineGroup;
            }
        }
    }

    ditchEngineGroup()
    {
        this.engineGroups.shift();
        if(this.engineGroups.length === 0)
        {
            this.trigger('allFuelConsumed');
        }
    }


    get mass()
    {
        let mass = this.chassi.mass;
        for(let group of this.engineGroups)
        {
            mass = mass.plus(group.mass);
        }
        return mass;
    }

    simulate(seconds)
    {
        this.acceleration = 0;

        if(this.engineGroups.length > 0)
        {
            let vSquared    = this.velocity.pow(2),
                r           = vSquared.div(UniversalConstants.C_SQUARED),
                gamma       = new Big(1).div(
                    new Big(1).minus(r).sqrt()
                );
            this.gamma = gamma;
            // let's try to use as much fuel as we can per second
            // the fuel tank may not have as much, so we'll ask it for the engine's fuel per seconds
            // but only burn as much as we have

            let burnDetails = this.engineGroups[0].burn(seconds);

            /*
            let fullBurnFuel = this.engines.fuelPerSecond.times(seconds);
            let fuelUsed = this.fuelTanks.useFuel(fullBurnFuel);
            let thrust = this.engines.burn(fuelUsed, seconds);
            */
            if(burnDetails.thrust.gt(0))
            {
                let acceleration = burnDetails.thrust.div(gamma.pow(3).times(this.mass));
                let deltaV = acceleration.times(seconds);
                this.velocity = this.velocity.plus(deltaV);

                this.acceleration = acceleration;
            }
        }
        let gammaSeconds = this.gamma.times(seconds);
        this.distance = this.distance.plus(gammaSeconds.times(this.velocity));
        this.relativeTime = this.relativeTime.plus(gammaSeconds);

    }

    get thrust()
    {
        return this.currentEngineGroup.thrust;
    }

    get fuelRemaining()
    {
        let remainingFuel = 0;
        for(let group of this.engineGroups)
        {
            remainingFuel = group.fuelRemaining.plus(remainingFuel);
        }
        return remainingFuel;
    }


    toJSON()
    {
        let json = {
            name:this.name,
            velocity:this.velocity.toString(),
            distance:this.distance.toString(),
            relativeTime:this.relativeTime.toString(),
            mass:this.mass.toString(),
            gamme:this.gamma.toString(),
            chassi:this.chassi.toJSON(),
            engineGroups:[],
        };
        for(let engineGroup of this.engineGroups)
        {
            json.engineGroups.push(engineGroup.toJSON());
        }
        return json;
    }


    /**
     * A method to load a ship from JSON
     * @param json
     * @returns {Ship}
     */
    static fromJSON(json)
    {
        let ship = new Ship(json);

        ship.chassi = Chassi.fromJSON(json.chassi);
        for(let engineGroupJSON of json.engineGroups)
        {
            ship.addEngineGroup(EngineGroup.fromJSON(engineGroupJSON));
        }
        return ship;
    }
}

module.exports = Ship;
},{"./Chassi":2,"./EngineGroup":4,"./Listenable":7,"./UniversalConstants":12,"big-js":13}],9:[function(require,module,exports){
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
            FUEL_TANK:{GEN1:{density: 0.1, volume: 10, baseMass: 1, name:'Generation I Fuel Tank', cost:2000}}
        };
    }

    static getPartByTypeAndName(partType, name)
    {
        let parts = this.parts[partType];
        let part = parts.find(function(part){
            return part.name === name;
        });
        return part;
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
},{"./Ship":8}],10:[function(require,module,exports){
const   Big = require('big-js'),
        Listenable = require('./Listenable');


class ShipPart extends Listenable
{
    constructor(data)
    {
        super();
        /**
         * The name of the ship part
         */
        this.name = data.name;
        /**
         * The base weight of the part in kg
         * @type {Big}
         */
        this.baseMass = new Big(data.baseMass?data.baseMass:1000);
        this.cost = new Big(data.cost?data.cost:100);
    }

    /**
     * return the total mass of the part
     */
    get mass()
    {
        return this.baseMass;
    }

    toJSON()
    {
        return {
            name:this.name,
            baseMass:this.baseMass.toString(),
            cost:this.cost
        };
    }

    static fromJSON(json)
    {
        return new this(json);
    }
}

module.exports = ShipPart;
},{"./Listenable":7,"big-js":13}],11:[function(require,module,exports){
const   Big         = require('big-js'),
    ShipPart    = require('./ShipPart');

class Thruster extends ShipPart
{
    constructor(data)
    {
        super(data);
        if(!this.name)
        {
            this.name = 'Thruster';
        }
        this.fuelPerSecond = new Big(data.fuelPerSecond?data.fuelPerSecond:1);
        this.thrust = new Big(data.thrust?data.thrust:1);
    }

    toJSON()
    {
        let json = super.toJSON();
        json.fuelPerSecond = this.fuelPerSecond.toString();
        json.thrust = this.thrust.toString();
        return json;
    }
}

module.exports = Thruster;
},{"./ShipPart":10,"big-js":13}],12:[function(require,module,exports){
const   Big = require('big-js'),
        C = new Big(299792458),
        C_SQUARED = C.pow(2),
        ONE = new Big(1);
module.exports = {
    C:C,
    C_SQUARED:C_SQUARED
};
},{"big-js":13}],13:[function(require,module,exports){
/* big.js v3.1.3 https://github.com/MikeMcl/big.js/LICENCE */
;(function (global) {
    'use strict';

/*
  big.js v3.1.3
  A small, fast, easy-to-use library for arbitrary-precision decimal arithmetic.
  https://github.com/MikeMcl/big.js/
  Copyright (c) 2014 Michael Mclaughlin <M8ch88l@gmail.com>
  MIT Expat Licence
*/

/***************************** EDITABLE DEFAULTS ******************************/

    // The default values below must be integers within the stated ranges.

    /*
     * The maximum number of decimal places of the results of operations
     * involving division: div and sqrt, and pow with negative exponents.
     */
    var DP = 20,                           // 0 to MAX_DP

        /*
         * The rounding mode used when rounding to the above decimal places.
         *
         * 0 Towards zero (i.e. truncate, no rounding).       (ROUND_DOWN)
         * 1 To nearest neighbour. If equidistant, round up.  (ROUND_HALF_UP)
         * 2 To nearest neighbour. If equidistant, to even.   (ROUND_HALF_EVEN)
         * 3 Away from zero.                                  (ROUND_UP)
         */
        RM = 1,                            // 0, 1, 2 or 3

        // The maximum value of DP and Big.DP.
        MAX_DP = 1E6,                      // 0 to 1000000

        // The maximum magnitude of the exponent argument to the pow method.
        MAX_POWER = 1E6,                   // 1 to 1000000

        /*
         * The exponent value at and beneath which toString returns exponential
         * notation.
         * JavaScript's Number type: -7
         * -1000000 is the minimum recommended exponent value of a Big.
         */
        E_NEG = -7,                   // 0 to -1000000

        /*
         * The exponent value at and above which toString returns exponential
         * notation.
         * JavaScript's Number type: 21
         * 1000000 is the maximum recommended exponent value of a Big.
         * (This limit is not enforced or checked.)
         */
        E_POS = 21,                   // 0 to 1000000

/******************************************************************************/

        // The shared prototype object.
        P = {},
        isValid = /^-?(\d+(\.\d*)?|\.\d+)(e[+-]?\d+)?$/i,
        Big;


    /*
     * Create and return a Big constructor.
     *
     */
    function bigFactory() {

        /*
         * The Big constructor and exported function.
         * Create and return a new instance of a Big number object.
         *
         * n {number|string|Big} A numeric value.
         */
        function Big(n) {
            var x = this;

            // Enable constructor usage without new.
            if (!(x instanceof Big)) {
                return n === void 0 ? bigFactory() : new Big(n);
            }

            // Duplicate.
            if (n instanceof Big) {
                x.s = n.s;
                x.e = n.e;
                x.c = n.c.slice();
            } else {
                parse(x, n);
            }

            /*
             * Retain a reference to this Big constructor, and shadow
             * Big.prototype.constructor which points to Object.
             */
            x.constructor = Big;
        }

        Big.prototype = P;
        Big.DP = DP;
        Big.RM = RM;
        Big.E_NEG = E_NEG;
        Big.E_POS = E_POS;

        return Big;
    }


    // Private functions


    /*
     * Return a string representing the value of Big x in normal or exponential
     * notation to dp fixed decimal places or significant digits.
     *
     * x {Big} The Big to format.
     * dp {number} Integer, 0 to MAX_DP inclusive.
     * toE {number} 1 (toExponential), 2 (toPrecision) or undefined (toFixed).
     */
    function format(x, dp, toE) {
        var Big = x.constructor,

            // The index (normal notation) of the digit that may be rounded up.
            i = dp - (x = new Big(x)).e,
            c = x.c;

        // Round?
        if (c.length > ++dp) {
            rnd(x, i, Big.RM);
        }

        if (!c[0]) {
            ++i;
        } else if (toE) {
            i = dp;

        // toFixed
        } else {
            c = x.c;

            // Recalculate i as x.e may have changed if value rounded up.
            i = x.e + i + 1;
        }

        // Append zeros?
        for (; c.length < i; c.push(0)) {
        }
        i = x.e;

        /*
         * toPrecision returns exponential notation if the number of
         * significant digits specified is less than the number of digits
         * necessary to represent the integer part of the value in normal
         * notation.
         */
        return toE === 1 || toE && (dp <= i || i <= Big.E_NEG) ?

          // Exponential notation.
          (x.s < 0 && c[0] ? '-' : '') +
            (c.length > 1 ? c[0] + '.' + c.join('').slice(1) : c[0]) +
              (i < 0 ? 'e' : 'e+') + i

          // Normal notation.
          : x.toString();
    }


    /*
     * Parse the number or string value passed to a Big constructor.
     *
     * x {Big} A Big number instance.
     * n {number|string} A numeric value.
     */
    function parse(x, n) {
        var e, i, nL;

        // Minus zero?
        if (n === 0 && 1 / n < 0) {
            n = '-0';

        // Ensure n is string and check validity.
        } else if (!isValid.test(n += '')) {
            throwErr(NaN);
        }

        // Determine sign.
        x.s = n.charAt(0) == '-' ? (n = n.slice(1), -1) : 1;

        // Decimal point?
        if ((e = n.indexOf('.')) > -1) {
            n = n.replace('.', '');
        }

        // Exponential form?
        if ((i = n.search(/e/i)) > 0) {

            // Determine exponent.
            if (e < 0) {
                e = i;
            }
            e += +n.slice(i + 1);
            n = n.substring(0, i);

        } else if (e < 0) {

            // Integer.
            e = n.length;
        }

        // Determine leading zeros.
        for (i = 0; n.charAt(i) == '0'; i++) {
        }

        if (i == (nL = n.length)) {

            // Zero.
            x.c = [ x.e = 0 ];
        } else {

            // Determine trailing zeros.
            for (; n.charAt(--nL) == '0';) {
            }

            x.e = e - i - 1;
            x.c = [];

            // Convert string to array of digits without leading/trailing zeros.
            for (e = 0; i <= nL; x.c[e++] = +n.charAt(i++)) {
            }
        }

        return x;
    }


    /*
     * Round Big x to a maximum of dp decimal places using rounding mode rm.
     * Called by div, sqrt and round.
     *
     * x {Big} The Big to round.
     * dp {number} Integer, 0 to MAX_DP inclusive.
     * rm {number} 0, 1, 2 or 3 (DOWN, HALF_UP, HALF_EVEN, UP)
     * [more] {boolean} Whether the result of division was truncated.
     */
    function rnd(x, dp, rm, more) {
        var u,
            xc = x.c,
            i = x.e + dp + 1;

        if (rm === 1) {

            // xc[i] is the digit after the digit that may be rounded up.
            more = xc[i] >= 5;
        } else if (rm === 2) {
            more = xc[i] > 5 || xc[i] == 5 &&
              (more || i < 0 || xc[i + 1] !== u || xc[i - 1] & 1);
        } else if (rm === 3) {
            more = more || xc[i] !== u || i < 0;
        } else {
            more = false;

            if (rm !== 0) {
                throwErr('!Big.RM!');
            }
        }

        if (i < 1 || !xc[0]) {

            if (more) {

                // 1, 0.1, 0.01, 0.001, 0.0001 etc.
                x.e = -dp;
                x.c = [1];
            } else {

                // Zero.
                x.c = [x.e = 0];
            }
        } else {

            // Remove any digits after the required decimal places.
            xc.length = i--;

            // Round up?
            if (more) {

                // Rounding up may mean the previous digit has to be rounded up.
                for (; ++xc[i] > 9;) {
                    xc[i] = 0;

                    if (!i--) {
                        ++x.e;
                        xc.unshift(1);
                    }
                }
            }

            // Remove trailing zeros.
            for (i = xc.length; !xc[--i]; xc.pop()) {
            }
        }

        return x;
    }


    /*
     * Throw a BigError.
     *
     * message {string} The error message.
     */
    function throwErr(message) {
        var err = new Error(message);
        err.name = 'BigError';

        throw err;
    }


    // Prototype/instance methods


    /*
     * Return a new Big whose value is the absolute value of this Big.
     */
    P.abs = function () {
        var x = new this.constructor(this);
        x.s = 1;

        return x;
    };


    /*
     * Return
     * 1 if the value of this Big is greater than the value of Big y,
     * -1 if the value of this Big is less than the value of Big y, or
     * 0 if they have the same value.
    */
    P.cmp = function (y) {
        var xNeg,
            x = this,
            xc = x.c,
            yc = (y = new x.constructor(y)).c,
            i = x.s,
            j = y.s,
            k = x.e,
            l = y.e;

        // Either zero?
        if (!xc[0] || !yc[0]) {
            return !xc[0] ? !yc[0] ? 0 : -j : i;
        }

        // Signs differ?
        if (i != j) {
            return i;
        }
        xNeg = i < 0;

        // Compare exponents.
        if (k != l) {
            return k > l ^ xNeg ? 1 : -1;
        }

        i = -1;
        j = (k = xc.length) < (l = yc.length) ? k : l;

        // Compare digit by digit.
        for (; ++i < j;) {

            if (xc[i] != yc[i]) {
                return xc[i] > yc[i] ^ xNeg ? 1 : -1;
            }
        }

        // Compare lengths.
        return k == l ? 0 : k > l ^ xNeg ? 1 : -1;
    };


    /*
     * Return a new Big whose value is the value of this Big divided by the
     * value of Big y, rounded, if necessary, to a maximum of Big.DP decimal
     * places using rounding mode Big.RM.
     */
    P.div = function (y) {
        var x = this,
            Big = x.constructor,
            // dividend
            dvd = x.c,
            //divisor
            dvs = (y = new Big(y)).c,
            s = x.s == y.s ? 1 : -1,
            dp = Big.DP;

        if (dp !== ~~dp || dp < 0 || dp > MAX_DP) {
            throwErr('!Big.DP!');
        }

        // Either 0?
        if (!dvd[0] || !dvs[0]) {

            // If both are 0, throw NaN
            if (dvd[0] == dvs[0]) {
                throwErr(NaN);
            }

            // If dvs is 0, throw +-Infinity.
            if (!dvs[0]) {
                throwErr(s / 0);
            }

            // dvd is 0, return +-0.
            return new Big(s * 0);
        }

        var dvsL, dvsT, next, cmp, remI, u,
            dvsZ = dvs.slice(),
            dvdI = dvsL = dvs.length,
            dvdL = dvd.length,
            // remainder
            rem = dvd.slice(0, dvsL),
            remL = rem.length,
            // quotient
            q = y,
            qc = q.c = [],
            qi = 0,
            digits = dp + (q.e = x.e - y.e) + 1;

        q.s = s;
        s = digits < 0 ? 0 : digits;

        // Create version of divisor with leading zero.
        dvsZ.unshift(0);

        // Add zeros to make remainder as long as divisor.
        for (; remL++ < dvsL; rem.push(0)) {
        }

        do {

            // 'next' is how many times the divisor goes into current remainder.
            for (next = 0; next < 10; next++) {

                // Compare divisor and remainder.
                if (dvsL != (remL = rem.length)) {
                    cmp = dvsL > remL ? 1 : -1;
                } else {

                    for (remI = -1, cmp = 0; ++remI < dvsL;) {

                        if (dvs[remI] != rem[remI]) {
                            cmp = dvs[remI] > rem[remI] ? 1 : -1;
                            break;
                        }
                    }
                }

                // If divisor < remainder, subtract divisor from remainder.
                if (cmp < 0) {

                    // Remainder can't be more than 1 digit longer than divisor.
                    // Equalise lengths using divisor with extra leading zero?
                    for (dvsT = remL == dvsL ? dvs : dvsZ; remL;) {

                        if (rem[--remL] < dvsT[remL]) {
                            remI = remL;

                            for (; remI && !rem[--remI]; rem[remI] = 9) {
                            }
                            --rem[remI];
                            rem[remL] += 10;
                        }
                        rem[remL] -= dvsT[remL];
                    }
                    for (; !rem[0]; rem.shift()) {
                    }
                } else {
                    break;
                }
            }

            // Add the 'next' digit to the result array.
            qc[qi++] = cmp ? next : ++next;

            // Update the remainder.
            if (rem[0] && cmp) {
                rem[remL] = dvd[dvdI] || 0;
            } else {
                rem = [ dvd[dvdI] ];
            }

        } while ((dvdI++ < dvdL || rem[0] !== u) && s--);

        // Leading zero? Do not remove if result is simply zero (qi == 1).
        if (!qc[0] && qi != 1) {

            // There can't be more than one zero.
            qc.shift();
            q.e--;
        }

        // Round?
        if (qi > digits) {
            rnd(q, dp, Big.RM, rem[0] !== u);
        }

        return q;
    };


    /*
     * Return true if the value of this Big is equal to the value of Big y,
     * otherwise returns false.
     */
    P.eq = function (y) {
        return !this.cmp(y);
    };


    /*
     * Return true if the value of this Big is greater than the value of Big y,
     * otherwise returns false.
     */
    P.gt = function (y) {
        return this.cmp(y) > 0;
    };


    /*
     * Return true if the value of this Big is greater than or equal to the
     * value of Big y, otherwise returns false.
     */
    P.gte = function (y) {
        return this.cmp(y) > -1;
    };


    /*
     * Return true if the value of this Big is less than the value of Big y,
     * otherwise returns false.
     */
    P.lt = function (y) {
        return this.cmp(y) < 0;
    };


    /*
     * Return true if the value of this Big is less than or equal to the value
     * of Big y, otherwise returns false.
     */
    P.lte = function (y) {
         return this.cmp(y) < 1;
    };


    /*
     * Return a new Big whose value is the value of this Big minus the value
     * of Big y.
     */
    P.sub = P.minus = function (y) {
        var i, j, t, xLTy,
            x = this,
            Big = x.constructor,
            a = x.s,
            b = (y = new Big(y)).s;

        // Signs differ?
        if (a != b) {
            y.s = -b;
            return x.plus(y);
        }

        var xc = x.c.slice(),
            xe = x.e,
            yc = y.c,
            ye = y.e;

        // Either zero?
        if (!xc[0] || !yc[0]) {

            // y is non-zero? x is non-zero? Or both are zero.
            return yc[0] ? (y.s = -b, y) : new Big(xc[0] ? x : 0);
        }

        // Determine which is the bigger number.
        // Prepend zeros to equalise exponents.
        if (a = xe - ye) {

            if (xLTy = a < 0) {
                a = -a;
                t = xc;
            } else {
                ye = xe;
                t = yc;
            }

            t.reverse();
            for (b = a; b--; t.push(0)) {
            }
            t.reverse();
        } else {

            // Exponents equal. Check digit by digit.
            j = ((xLTy = xc.length < yc.length) ? xc : yc).length;

            for (a = b = 0; b < j; b++) {

                if (xc[b] != yc[b]) {
                    xLTy = xc[b] < yc[b];
                    break;
                }
            }
        }

        // x < y? Point xc to the array of the bigger number.
        if (xLTy) {
            t = xc;
            xc = yc;
            yc = t;
            y.s = -y.s;
        }

        /*
         * Append zeros to xc if shorter. No need to add zeros to yc if shorter
         * as subtraction only needs to start at yc.length.
         */
        if (( b = (j = yc.length) - (i = xc.length) ) > 0) {

            for (; b--; xc[i++] = 0) {
            }
        }

        // Subtract yc from xc.
        for (b = i; j > a;){

            if (xc[--j] < yc[j]) {

                for (i = j; i && !xc[--i]; xc[i] = 9) {
                }
                --xc[i];
                xc[j] += 10;
            }
            xc[j] -= yc[j];
        }

        // Remove trailing zeros.
        for (; xc[--b] === 0; xc.pop()) {
        }

        // Remove leading zeros and adjust exponent accordingly.
        for (; xc[0] === 0;) {
            xc.shift();
            --ye;
        }

        if (!xc[0]) {

            // n - n = +0
            y.s = 1;

            // Result must be zero.
            xc = [ye = 0];
        }

        y.c = xc;
        y.e = ye;

        return y;
    };


    /*
     * Return a new Big whose value is the value of this Big modulo the
     * value of Big y.
     */
    P.mod = function (y) {
        var yGTx,
            x = this,
            Big = x.constructor,
            a = x.s,
            b = (y = new Big(y)).s;

        if (!y.c[0]) {
            throwErr(NaN);
        }

        x.s = y.s = 1;
        yGTx = y.cmp(x) == 1;
        x.s = a;
        y.s = b;

        if (yGTx) {
            return new Big(x);
        }

        a = Big.DP;
        b = Big.RM;
        Big.DP = Big.RM = 0;
        x = x.div(y);
        Big.DP = a;
        Big.RM = b;

        return this.minus( x.times(y) );
    };


    /*
     * Return a new Big whose value is the value of this Big plus the value
     * of Big y.
     */
    P.add = P.plus = function (y) {
        var t,
            x = this,
            Big = x.constructor,
            a = x.s,
            b = (y = new Big(y)).s;

        // Signs differ?
        if (a != b) {
            y.s = -b;
            return x.minus(y);
        }

        var xe = x.e,
            xc = x.c,
            ye = y.e,
            yc = y.c;

        // Either zero?
        if (!xc[0] || !yc[0]) {

            // y is non-zero? x is non-zero? Or both are zero.
            return yc[0] ? y : new Big(xc[0] ? x : a * 0);
        }
        xc = xc.slice();

        // Prepend zeros to equalise exponents.
        // Note: Faster to use reverse then do unshifts.
        if (a = xe - ye) {

            if (a > 0) {
                ye = xe;
                t = yc;
            } else {
                a = -a;
                t = xc;
            }

            t.reverse();
            for (; a--; t.push(0)) {
            }
            t.reverse();
        }

        // Point xc to the longer array.
        if (xc.length - yc.length < 0) {
            t = yc;
            yc = xc;
            xc = t;
        }
        a = yc.length;

        /*
         * Only start adding at yc.length - 1 as the further digits of xc can be
         * left as they are.
         */
        for (b = 0; a;) {
            b = (xc[--a] = xc[a] + yc[a] + b) / 10 | 0;
            xc[a] %= 10;
        }

        // No need to check for zero, as +x + +y != 0 && -x + -y != 0

        if (b) {
            xc.unshift(b);
            ++ye;
        }

         // Remove trailing zeros.
        for (a = xc.length; xc[--a] === 0; xc.pop()) {
        }

        y.c = xc;
        y.e = ye;

        return y;
    };


    /*
     * Return a Big whose value is the value of this Big raised to the power n.
     * If n is negative, round, if necessary, to a maximum of Big.DP decimal
     * places using rounding mode Big.RM.
     *
     * n {number} Integer, -MAX_POWER to MAX_POWER inclusive.
     */
    P.pow = function (n) {
        var x = this,
            one = new x.constructor(1),
            y = one,
            isNeg = n < 0;

        if (n !== ~~n || n < -MAX_POWER || n > MAX_POWER) {
            throwErr('!pow!');
        }

        n = isNeg ? -n : n;

        for (;;) {

            if (n & 1) {
                y = y.times(x);
            }
            n >>= 1;

            if (!n) {
                break;
            }
            x = x.times(x);
        }

        return isNeg ? one.div(y) : y;
    };


    /*
     * Return a new Big whose value is the value of this Big rounded to a
     * maximum of dp decimal places using rounding mode rm.
     * If dp is not specified, round to 0 decimal places.
     * If rm is not specified, use Big.RM.
     *
     * [dp] {number} Integer, 0 to MAX_DP inclusive.
     * [rm] 0, 1, 2 or 3 (ROUND_DOWN, ROUND_HALF_UP, ROUND_HALF_EVEN, ROUND_UP)
     */
    P.round = function (dp, rm) {
        var x = this,
            Big = x.constructor;

        if (dp == null) {
            dp = 0;
        } else if (dp !== ~~dp || dp < 0 || dp > MAX_DP) {
            throwErr('!round!');
        }
        rnd(x = new Big(x), dp, rm == null ? Big.RM : rm);

        return x;
    };


    /*
     * Return a new Big whose value is the square root of the value of this Big,
     * rounded, if necessary, to a maximum of Big.DP decimal places using
     * rounding mode Big.RM.
     */
    P.sqrt = function () {
        var estimate, r, approx,
            x = this,
            Big = x.constructor,
            xc = x.c,
            i = x.s,
            e = x.e,
            half = new Big('0.5');

        // Zero?
        if (!xc[0]) {
            return new Big(x);
        }

        // If negative, throw NaN.
        if (i < 0) {
            throwErr(NaN);
        }

        // Estimate.
        i = Math.sqrt(x.toString());

        // Math.sqrt underflow/overflow?
        // Pass x to Math.sqrt as integer, then adjust the result exponent.
        if (i === 0 || i === 1 / 0) {
            estimate = xc.join('');

            if (!(estimate.length + e & 1)) {
                estimate += '0';
            }

            r = new Big( Math.sqrt(estimate).toString() );
            r.e = ((e + 1) / 2 | 0) - (e < 0 || e & 1);
        } else {
            r = new Big(i.toString());
        }

        i = r.e + (Big.DP += 4);

        // Newton-Raphson iteration.
        do {
            approx = r;
            r = half.times( approx.plus( x.div(approx) ) );
        } while ( approx.c.slice(0, i).join('') !==
                       r.c.slice(0, i).join('') );

        rnd(r, Big.DP -= 4, Big.RM);

        return r;
    };


    /*
     * Return a new Big whose value is the value of this Big times the value of
     * Big y.
     */
    P.mul = P.times = function (y) {
        var c,
            x = this,
            Big = x.constructor,
            xc = x.c,
            yc = (y = new Big(y)).c,
            a = xc.length,
            b = yc.length,
            i = x.e,
            j = y.e;

        // Determine sign of result.
        y.s = x.s == y.s ? 1 : -1;

        // Return signed 0 if either 0.
        if (!xc[0] || !yc[0]) {
            return new Big(y.s * 0);
        }

        // Initialise exponent of result as x.e + y.e.
        y.e = i + j;

        // If array xc has fewer digits than yc, swap xc and yc, and lengths.
        if (a < b) {
            c = xc;
            xc = yc;
            yc = c;
            j = a;
            a = b;
            b = j;
        }

        // Initialise coefficient array of result with zeros.
        for (c = new Array(j = a + b); j--; c[j] = 0) {
        }

        // Multiply.

        // i is initially xc.length.
        for (i = b; i--;) {
            b = 0;

            // a is yc.length.
            for (j = a + i; j > i;) {

                // Current sum of products at this digit position, plus carry.
                b = c[j] + yc[i] * xc[j - i - 1] + b;
                c[j--] = b % 10;

                // carry
                b = b / 10 | 0;
            }
            c[j] = (c[j] + b) % 10;
        }

        // Increment result exponent if there is a final carry.
        if (b) {
            ++y.e;
        }

        // Remove any leading zero.
        if (!c[0]) {
            c.shift();
        }

        // Remove trailing zeros.
        for (i = c.length; !c[--i]; c.pop()) {
        }
        y.c = c;

        return y;
    };


    /*
     * Return a string representing the value of this Big.
     * Return exponential notation if this Big has a positive exponent equal to
     * or greater than Big.E_POS, or a negative exponent equal to or less than
     * Big.E_NEG.
     */
    P.toString = P.valueOf = P.toJSON = function () {
        var x = this,
            Big = x.constructor,
            e = x.e,
            str = x.c.join(''),
            strL = str.length;

        // Exponential notation?
        if (e <= Big.E_NEG || e >= Big.E_POS) {
            str = str.charAt(0) + (strL > 1 ? '.' + str.slice(1) : '') +
              (e < 0 ? 'e' : 'e+') + e;

        // Negative exponent?
        } else if (e < 0) {

            // Prepend zeros.
            for (; ++e; str = '0' + str) {
            }
            str = '0.' + str;

        // Positive exponent?
        } else if (e > 0) {

            if (++e > strL) {

                // Append zeros.
                for (e -= strL; e-- ; str += '0') {
                }
            } else if (e < strL) {
                str = str.slice(0, e) + '.' + str.slice(e);
            }

        // Exponent zero.
        } else if (strL > 1) {
            str = str.charAt(0) + '.' + str.slice(1);
        }

        // Avoid '-0'
        return x.s < 0 && x.c[0] ? '-' + str : str;
    };


    /*
     ***************************************************************************
     * If toExponential, toFixed, toPrecision and format are not required they
     * can safely be commented-out or deleted. No redundant code will be left.
     * format is used only by toExponential, toFixed and toPrecision.
     ***************************************************************************
     */


    /*
     * Return a string representing the value of this Big in exponential
     * notation to dp fixed decimal places and rounded, if necessary, using
     * Big.RM.
     *
     * [dp] {number} Integer, 0 to MAX_DP inclusive.
     */
    P.toExponential = function (dp) {

        if (dp == null) {
            dp = this.c.length - 1;
        } else if (dp !== ~~dp || dp < 0 || dp > MAX_DP) {
            throwErr('!toExp!');
        }

        return format(this, dp, 1);
    };


    /*
     * Return a string representing the value of this Big in normal notation
     * to dp fixed decimal places and rounded, if necessary, using Big.RM.
     *
     * [dp] {number} Integer, 0 to MAX_DP inclusive.
     */
    P.toFixed = function (dp) {
        var str,
            x = this,
            Big = x.constructor,
            neg = Big.E_NEG,
            pos = Big.E_POS;

        // Prevent the possibility of exponential notation.
        Big.E_NEG = -(Big.E_POS = 1 / 0);

        if (dp == null) {
            str = x.toString();
        } else if (dp === ~~dp && dp >= 0 && dp <= MAX_DP) {
            str = format(x, x.e + dp);

            // (-0).toFixed() is '0', but (-0.1).toFixed() is '-0'.
            // (-0).toFixed(1) is '0.0', but (-0.01).toFixed(1) is '-0.0'.
            if (x.s < 0 && x.c[0] && str.indexOf('-') < 0) {
        //E.g. -0.5 if rounded to -0 will cause toString to omit the minus sign.
                str = '-' + str;
            }
        }
        Big.E_NEG = neg;
        Big.E_POS = pos;

        if (!str) {
            throwErr('!toFix!');
        }

        return str;
    };


    /*
     * Return a string representing the value of this Big rounded to sd
     * significant digits using Big.RM. Use exponential notation if sd is less
     * than the number of digits necessary to represent the integer part of the
     * value in normal notation.
     *
     * sd {number} Integer, 1 to MAX_DP inclusive.
     */
    P.toPrecision = function (sd) {

        if (sd == null) {
            return this.toString();
        } else if (sd !== ~~sd || sd < 1 || sd > MAX_DP) {
            throwErr('!toPre!');
        }

        return format(this, sd - 1, 2);
    };


    // Export


    Big = bigFactory();

    //AMD.
    if (typeof define === 'function' && define.amd) {
        define(function () {
            return Big;
        });

    // Node and other CommonJS-like environments that support module.exports.
    } else if (typeof module !== 'undefined' && module.exports) {
        module.exports = Big;

    //Browser.
    } else {
        global.Big = Big;
    }
})(this);

},{}]},{},[1]);
