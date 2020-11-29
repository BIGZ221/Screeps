var towerManager = require('towerManager');
var utilityCreepManager = require('role.UtilityCreeps');
var invaderCreepManager = require('role.InvaderCreeps');
var last = Date.now();
/*
---===TODO===---
* Change harvester creeps to deposit into the link
    * Add functionality for link to transfer to the other link
* Add storage manager creeps that take out of the link
    * When link is empty the creeps transfer from the storage and deposits energy into extensions
    * When link has energy the creeps transfer straight to the storage
* Change all code and functions that use " Game.spawns['Spawn1'] " to accept a room parameter allowing multi room support
    * I think I mostly did this but go back through everything and make sure
* Add Defense creeps (~4) that have healing, attack, and tough, that automatically attack any hostiles within a certain range
* Add Attacker creeps to take over room to my north and the room to the west of that
* Make sure room below me is not hostile
* Change towers so they are filled by maintainers instead of harvesters
*/

function cleanMemory() {
    if (Game.time % CREEP_LIFE_TIME === 0) {
        for (let name in Memory.creeps) {
            if (Game.creeps[name] === undefined) {
                delete Memory.creeps[name];
            }
        }
    console.log("---=== Cleaning Memory ===---");
    }
}

function genPixel() {
    if (Game.cpu.bucket > PIXEL_CPU_COST) {
        Game.cpu.generatePixel();
        let time = Date.now() - last;
        last = Date.now();
        console.log("Took", Math.floor(time/1000), "s to generate a pixel!");
    }
}

module.exports.loop = function () {
    utilityCreepManager.run();
    towerManager.run();
    cleanMemory();
    genPixel();
    //invaderCreepManager.run()
}