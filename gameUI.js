const Game = require('./lib/Game');

(function($){$(function() {

let lastTimestamp = 0,
    maxFPS = 60,
    delta = 0,
    playing = false,
    $ships = $('#ships');

function createShipElement(index, ship)
{
    let $elem = $(`<div class="col-4 ship">
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
    return $elem;
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



let $radio = $('input[name=gameSpeed]').change(function(){
    let compression = ($(this).val());
    Game.compression = compression;
});

console.log('Should be starting the game');
Game.addNewProbe();

Game.start();
draw();
requestAnimationFrame(gameLoop);

});})(jQuery);