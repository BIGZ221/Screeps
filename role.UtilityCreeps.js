require('creep.Prototypes');

const jobOrder = ['harvester', 'storager', 'builder', 'maintenance', 'upgrader'];
const creepMemory = {
                        cType: 'utility',
                        isFull: false,
                        currentJob: undefined
                    };
const cleanerCreepMemory = {
                        cType: 'cleaner',
                        isFull: false,
                        currentJob: undefined
                    };

const numHarvesters = 2;
const numStoragers = 1;
const numBuilders = 2;
const numMaintainers = 1;
const numUpgraders = 2;

function makeUtilityCreepBody(currRoom) { // 0.4/100 for Work 0.66/100 for Carry 0.53/100 for Move provides movement of 1 tile per tick on roads
    let bodyParts = [WORK,CARRY,MOVE];
    let totalExtensions = currRoom.find(FIND_MY_STRUCTURES, { filter: extensions => extensions.structureType === STRUCTURE_EXTENSION }).length * EXTENSION_ENERGY_CAPACITY[currRoom.controller.level];
    if (totalExtensions > 1700) {
        totalExtensions = 1700;
    }
    let numParts = [Math.ceil(totalExtensions * 0.4/100), Math.ceil(totalExtensions * 0.66/100), Math.ceil(totalExtensions * 0.53/100)];
    let body = [];
    for (let i = 0; i < bodyParts.length; i++) {
        for (let j = 0; j < numParts[i]; j++) {
            body.push(bodyParts[i]);
        }
    }
    return body;
}

function makeCleanerCreepBody(currRoom) {
    let bodyParts = [CARRY,MOVE];
    let totalExtensions = currRoom.find(FIND_MY_STRUCTURES, { filter: extensions => extensions.structureType === STRUCTURE_EXTENSION }).length * EXTENSION_ENERGY_CAPACITY[currRoom.controller.level];
    if (totalExtensions > 1700) {
        totalExtensions = 1700;
    }
    let numParts = [Math.ceil(totalExtensions * 0.45/100), Math.ceil(totalExtensions * 0.45/100)];
    let body = [];
    for (let i = 0; i < bodyParts.length; i++) {
        for (let j = 0; j < numParts[i]; j++) {
            body.push(bodyParts[i]);
        }
    }
    return body;
}

function getUtilityCreeps(currRoom) {
    let utilityCreeps = currRoom.find(FIND_MY_CREEPS, { filter: currCreep => currCreep.memory.cType === 'utility'});
    return utilityCreeps;
}

function getCleanerCreeps(currRoom) {
    let cleanerCreeps = currRoom.find(FIND_MY_CREEPS, { filter: currCreep => currCreep.memory.cType === 'cleaner'});
    return cleanerCreeps;
}

function emergencyCreepSpawn(currRoom) {
    let EmergencyCreepMemory = {
                        cType: 'utility',
                        isFull: false
                        };
    let currSpawn = currRoom.find(FIND_MY_SPAWNS);
    let status = currSpawn.spawnCreep([WORK,CARRY,MOVE],'Emergency',{memory:EmergencyCreepMemory});
    let emergencyMsg = "Game ran out of creeps, spawned emergency creep with status ".concat(status);
    Game.notify(emergencyMsg);
}

function getJobsNeeded(currRoom) {
    let creeps = getUtilityCreeps(currRoom);
    let jobArr = [0, 0, 0, 0, 0]; // [Harvesters, Storager, Builders, Maintenance, Upgraders]
    jobArr[0] = numHarvesters;
    jobArr[1] = numStoragers;
    jobArr[2] = creeps[0].getConstructionProjects().length > 0 ? numBuilders : 0;
    jobArr[3] = creeps[0].getDamagedRoadsWalls().length > 0 ? numMaintainers : 0;
    jobArr[4] = numUpgraders;
    return jobArr;
}

function spawnUtilityCreeps(currRoom) {
    let cName = 'utility'.concat(((Game.time % 1000).toString()).padStart(3,0));
    let cBody = makeUtilityCreepBody(currRoom);
    let cMemory = creepMemory;
    let currSpawn = currRoom.find(FIND_MY_SPAWNS)[0];
    if (currSpawn !== undefined) {
        currSpawn.spawnCreep(cBody,cName,{memory:cMemory});
    }
}

function spawnCleanupCreeps(currRoom) {
    let cName = 'cleanup'.concat(((Game.time % 1000).toString()).padStart(3,0));
    let cBody = makeCleanerCreepBody(currRoom);
    let cMemory = cleanerCreepMemory;
    let currSpawn = currRoom.find(FIND_MY_SPAWNS)[0];
    if (currSpawn !== undefined) {
        currSpawn.spawnCreep(cBody,cName,{memory:cMemory});
    }
}

function delegateJobs(currRoom) {
    let utilityCreeps = getUtilityCreeps(currRoom);
    let cleanerCreeps = getCleanerCreeps(currRoom);
    let jobsNeeded = getJobsNeeded(currRoom);
    let jobList = jobOrder; // [harvest, storager, builder, maintainer, upgrader]
    let sum = 0;
    let currCreep = 0;
    for (let i = 0; i < jobsNeeded.length; i++) {
        sum += jobsNeeded[i];
    }
    for (let i = 0; i < jobList.length; i++) {
        for (let j = 0; j < jobsNeeded[i]; j++) {
            if (utilityCreeps[currCreep] === undefined) {
                spawnUtilityCreeps(currRoom);
            } else if (utilityCreeps[currCreep].memory.currentJob !== jobList[i]) {
                utilityCreeps[currCreep].memory.currentJob = jobList[i];
                console.log(utilityCreeps[currCreep] + " assigned " + jobList[i]);
            }
            if (utilityCreeps[currCreep] !== undefined) {
                utilityCreeps[currCreep].memory.prefES = currCreep % 2;
            }
            currCreep += 1;
            currCreep %= sum;
        }
    }
    for (let k = sum; k < utilityCreeps.length; k++) {
        if (utilityCreeps[k].memory.currentJob === undefined) {
            utilityCreeps[k].memory.currentJob = 'upgrader';
            console.log(utilityCreeps[k] + " assigned upgrader");
        }
    }
    if (cleanerCreeps[0] === undefined) {
        spawnCleanupCreeps(currRoom);
    } else if (cleanerCreeps[0].memory.currentJob === undefined) {
        console.log('Cleaner given job');
        cleanerCreeps[0].memory.currentJob = 'cleaner';
    }
}

function linkTransfers(currRoom) {
    let creeps = getUtilityCreeps(currRoom);
    let links = creeps[0].getLinks();
    if (links.length !== 0) {
        if (links[1].cooldown === 0) {
            links[1].transferEnergy(links[0]);
        }
        if (links[2].cooldown === 0) {
            links[2].transferEnergy(links[0]);
        }
    }
}

module.exports = {
run: function(currRoom) {
    delegateJobs(currRoom);
    let utilityCreeps = getUtilityCreeps(currRoom);
    let cleanerCreeps = getCleanerCreeps(currRoom);
    let allCreeps = utilityCreeps.concat(cleanerCreeps);
    let numCreeps = Object.keys(Game.creeps).length;
    linkTransfers(currRoom);
    if (numCreeps === 0) {
        emergencyCreepSpawn(currRoom);
    }
    for (let i = 0; i < allCreeps.length; i++) {
        switch(allCreeps[i].memory.currentJob) {
            case 'harvester':
                allCreeps[i].harvestEnergy();
                break;
            case 'builder':
                allCreeps[i].buildCon();
                break;
            case 'maintenance':
                allCreeps[i].maintenance();
                break;
            case 'upgrader':
                allCreeps[i].upgradeRoomController();
                break;
            case 'cleaner':
                allCreeps[i].cleanup();
                break;
            case 'storager':
                allCreeps[i].storager();
                break;
        }
        
    }
}
};
