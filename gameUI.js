const Game = require('./lib/Game');

(function($){$(function() {

let lastTimestamp = 0,
    maxFPS = 60,
    delta = 0,
    playing = false,
    $ships = $('#ships');

Game.addNewProbe();

function createShipElement(index, ship)
{
    let $elem = $('#shipColumnMaster').clone().removeAttr('style').removeAttr('id');
    $('.shipName', $elem).text(ship.name);
    $('.shipMass', $elem).text(ship.mass);
    $('.shipThrust', $elem).text(ship.thrust);
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
}


function gameLoop(timestamp)
{
    if (timestamp < lastTimestamp + (1000 / maxFPS))
    {
        requestAnimationFrame(gameLoop);
        return;
    }
    delta = timestamp - lastTimestamp;
    lastTimestamp = timestamp;

    draw();
    if (playing)
    {
        requestAnimationFrame(gameLoop);
    }
}

$('#gameStateToggleBtn').click(function(){
    Game.toggle();
    playing = !playing;
    $(this).text(playing?'Stop':'Start');
    if(playing)
    {
        lastTimestamp = 0;
        requestAnimationFrame(gameLoop);
    }
});

let $radio = $('input[name=gameSpeed]').change(function(){
    let compression = ($(this).val());
    Game.compression = compression;
});


draw();

});})(jQuery);