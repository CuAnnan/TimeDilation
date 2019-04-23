const   Game = require('./lib/Game'),
        ShipFactory = require('./lib/ShipFactory');

(function($){$(function() {

let lastTimestamp = 0,
    maxFPS = 60,
    $ships = $('#ships');

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

function showMissionModal()
{
    let parts = ShipFactory.parts;
    $chassiSelect = $('#newMissionChassiSelect');
    for(let chassi of parts.chassi)
    {
        $chassiSelect.append($(`<option>${chassi.name}</option>`));
    }
    $('#newMissionModal').modal('show');
}



$('input[name=gameSpeed]').change(function(){
    Game.compression = ($(this).val());
});

$('#launchMissionButton').click(showMissionModal);

initialiseBuildParts();

Game.start();
draw();
requestAnimationFrame(gameLoop);

});})(jQuery);