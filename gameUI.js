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