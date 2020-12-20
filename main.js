var towerManager = require('towerManager');
var utilityCreepManager = require('role.UtilityCreeps');
var last = Date.now();

/*
---===TODO===---
* Add Defense creeps (~4) that have healing, attack, and tough, that automatically attack any hostiles within a certain range
* Add Attacker creeps to take over room to my north and the room to the west of that
* Make sure room below me is not hostile
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
    if (Game.cpu.bucket >= PIXEL_CPU_COST) {
        Game.cpu.generatePixel();
        let time = Date.now() - last;
        last = Date.now();
        console.log("Took", Math.floor(time/1000), "s to generate a pixel!");
        return false;
    } else {
        return true;
    }
}

module.exports.loop = function () {
    if (genPixel()){
        for (name in Game.rooms) {
            let currRoom = Game.rooms[name];
            utilityCreepManager.run(currRoom);
            towerManager.run(currRoom);
        }
       cleanMemory();
    }
}