const   Game = require('./lib/Game'),
        ShipFactory = require('./lib/ShipFactory'),
        Ship = require('./lib/Ship');

(function($){$(function() {

let lastTimestamp = 0,
    maxFPS = 60,
    newShipCost = 0,
    newShip = null,
    $ships = $('#ships'),
    $newShipChassiSelect = $('#newShipChassi'),
    $newShipEngines = $('#newShipEngines'),
    $newShipCost = $('#newShipCost'),
    $newShipButton = $('#newShipButton');

function createShipElement(index, ship)
{
    return $(`<div class="col-3 ship">
    <div class="row">
        <div class="col">Ship name:</div>
        <div class="col shipName"></div>
    </div>
    <div class="row">
        <div class="col">Destination</div>
        <div class="col destination"></div>    
    </div>
    <div class="row">
        <div class="col-6">Mass</div>
        <div class="col shipMass"></div>
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
        <div class="col engineGroupCount"></div>
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
    $('.shipDestination', $elem).text(ship.destination);
    $('.shipName', $elem).text(ship.name);
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

function makeBasicPartOption(part)
{
    return $(`<option value="${part.name}">${part.name} (${part.cost})</option>`);
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

function populatePartSelect($select, parts)
{
    for(let part of parts)
    {
        $select.append(makePartOption(part));
    }
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
            makeBasicPartElement(part.json).appendTo($container);
        }
    }
    populatePartSelect($newShipChassiSelect, buildParts.chassi);
}

function updateNewShipEngine()
{
    let $select = $(this),
        engineName = $select.val();

    if(engineName)
    {
        let engine = ShipFactory.getEngineByName(engineName);
        newShip.setEngineGroup($select.data('engineIndex'), engine);
    }
    $newShipCost.text(newShip.cost);

    checkShipValidity();
}

function checkShipValidity()
{
    if(newShip.isValid && Game.canAffordShip(newShip))
    {
        $newShipButton.removeAttr('disabled');
    }
}


function setNewShipChassi()
{
    let chassi  = ShipFactory.getChassiByName($(this).val());

    $newShipEngines.empty();
    newShip.setChassi(chassi);
    $newShipCost.text(newShip.cost);
    if(chassi)
    {
        for (let i = 0; i < chassi.engineGroupSlots.length; i++)
        {
            $newShipEngines.append($(`<div class="row">
        <div class="col"><select data-engine-index="${i}" data-count="${chassi.engineGroupSlots[i]}" class="newShipEngineSelect form-control"><option value="">Choose One</option></select></div>
        <div class="col-2">x${chassi.engineGroupSlots[i]}</div>
    </div>`));
        }
        for (let engine of ShipFactory.parts.engine)
        {
            makePartOption(engine).appendTo($('.newShipEngineSelect'));
        }
        $('.newShipEngineSelect').change(updateNewShipEngine);
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
initialiseBuildParts();

function showNewShipModal()
{
    let $modal = $('#newShipModal').modal('show');

    newShip = new Ship();
    $('input', $modal).val('');
    $('select', $modal).val('');
    $newShipEngines.empty();
    $newShipButton.attr('disabled', 'disabled');
}

function addNewShip()
{
    let $modal = $('#newShipModal').modal('hide');
    Game.addShip(newShip);
}

$newShipButton.click(addNewShip);

$newShipChassiSelect.change(setNewShipChassi);
$('#launchMissionButton').click(showNewShipModal);
$('#newShipName').change(function(){
    newShip.setName($(this).val());
    checkShipValidity();
});

Game.start();
draw();
requestAnimationFrame(gameLoop);

});})(jQuery);