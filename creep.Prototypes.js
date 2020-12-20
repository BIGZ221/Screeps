
Creep.prototype.getEnergySources = function() {
    return this.room.find(FIND_SOURCES, { filter: sources => sources.energy > 0 || sources.ticksToRegeneration < 20 }).map(sources => sources.id);
}

Creep.prototype.getLinks = function() {
    return this.room.find(FIND_MY_STRUCTURES, { filter: links => links.structureType === STRUCTURE_LINK });
}

Creep.prototype.getTowers = function() {
    return this.room.find(FIND_MY_STRUCTURES, { filter: towers => towers.structureType === STRUCTURE_TOWER && towers.store.getFreeCapacity(RESOURCE_ENERGY) > 0 });
}

Creep.prototype.getOpenStructures = function (strType) {
    return this.room.find(FIND_MY_STRUCTURES, { filter: structures => structures.structureType === strType && structures.store.getFreeCapacity(RESOURCE_ENERGY) > 0 });
}

Creep.prototype.getFullStructures = function(strType) {
    return this.room.find(FIND_MY_STRUCTURES, { filter: structures => structures.structureType === strType && structures.store.getUsedCapacity(RESOURCE_ENERGY) > 0 });
}

Creep.prototype.getConstructionProjects = function() {
    return this.room.find(FIND_MY_CONSTRUCTION_SITES);
}

Creep.prototype.getDamagedRamparts = function() {
    if (Memory.RampartRepairTo === undefined) {
        Memory.RampartRepairTo = 50000;
    }
    return this.room.find(FIND_STRUCTURES, { filter: ramparts => ramparts.structureType === STRUCTURE_RAMPART && ramparts.hits < Memory.RampartRepairTo });
}

Creep.prototype.getDamagedRoadsWalls = function() {
    if (Memory.WallRepairTo === undefined) {
        Memory.WallRepairTo = 150000;
    }
    let roads = this.room.find(FIND_STRUCTURES, { filter: roads => roads.structureType === STRUCTURE_ROAD && roads.hits < roads.hitsMax });
    let walls = this.room.find(FIND_STRUCTURES, { filter: walls => walls.structureType === STRUCTURE_WALL && walls.hits < Memory.WallRepairTo });
    return roads.concat(walls);
}

Creep.prototype.getDroppedItems = function() {
    let droppedEnergy = this.room.find(FIND_DROPPED_RESOURCES);
    let tombStones = this.room.find(FIND_TOMBSTONES, { filter: tombstones => tombstones.store.getUsedCapacity(RESOURCE_ENERGY) > 0 });
    let ruins = this.room.find(FIND_RUINS, { filter: ruins => ruins.store.getUsedCapacity(RESOURCE_ENERGY) > 0 });
    return [droppedEnergy, tombStones, ruins];
}

Creep.prototype.harvestEnergy = function() {
    let extensions = this.getOpenStructures(STRUCTURE_EXTENSION);
    let containers = this.getOpenStructures(STRUCTURE_CONTAINER);
    let storages = this.getOpenStructures(STRUCTURE_STORAGE);
    let links = this.getLinks();
    let energySources = this.getEnergySources();
    let roomSpawn = this.room.find(FIND_MY_SPAWNS)[0];
    let currStorage;
    if (energySources.length === 0) {
        return 0;
    }
    this.memory.currentEnergySource = energySources[this.memory.prefES % energySources.length];
    if (links.length !== 0 && this.pos.findClosestByPath(links).store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
        currStorage = this.pos.findClosestByPath(links);
    } else if (containers.length !== 0) {
        currStorage = this.pos.findClosestByPath(containers);
    } else if (extensions.length !== 0) {
        currStorage = this.pos.findClosestByPath(extensions);
    } else if (roomSpawn.store.getFreeCapacity(RESOURCE_ENERGY) !== 0) {
        currStorage = roomSpawn;
    } else if (storages.length !== 0) {
        currStorage = this.pos.findClosestByPath(storages);
    } else {
        console.log("---=== All storages are full ===---");
        return 0; // All Storages are full
    }
    if (this.memory.isFull === false) {
        if (this.harvest(Game.getObjectById(this.memory.currentEnergySource)) === ERR_NOT_IN_RANGE) {
            this.moveTo(Game.getObjectById(this.memory.currentEnergySource));
        }
    } else { // Current Creep is full
        if (this.transfer(currStorage, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
            this.moveTo(currStorage);
        }
    }
    if (this.store.getFreeCapacity() === 0) {
        this.memory.isFull = true;
    }
    if (this.store.getUsedCapacity() === 0) {
        this.memory.isFull = false;
    }
}

Creep.prototype.buildCon = function() {
    if (Game.time % 2 === 0) {  // Only build every other tick
        return 0;
    }
    let currRoom = this.room;
    let extensions = this.getFullStructures(STRUCTURE_EXTENSION);
    let storages = this.getFullStructures(STRUCTURE_STORAGE);
    let conProjects = this.getConstructionProjects();
    let currStorage;
    let currConProj;
    if (extensions.length === 0 && storages.length === 0) {
        return 0;
    }
    if (conProjects.length === 0) {
        return 0;
    }
    if (storages.length !== 0) {
        currStorage = this.pos.findClosestByPath(storages);
    } else if (extensions.length !== 0) {
        currStorage = this.pos.findClosestByPath(extensions);
    }
    if (this.memory.isFull === false) {
        if (this.withdraw(currStorage, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
            this.moveTo(currStorage);
        }
    } else {
        currConProj = this.pos.findClosestByRange(conProjects);
        if (this.build(currConProj) === ERR_NOT_IN_RANGE) {
            this.moveTo(currConProj);
        }
    }
    if (this.store.getFreeCapacity() === 0) {
        this.memory.isFull = true;
    }
    if (this.store.getUsedCapacity() === 0) {
        this.memory.isFull = false;
    }
}

Creep.prototype.maintenance = function() {
    let currRoom = this.room;
    let roadsWallsToRepair = this.getDamagedRoadsWalls();
    let rampartsToRepair = this.getDamagedRamparts();
    let extensions = this.getFullStructures(STRUCTURE_EXTENSION);
    let storages = this.getFullStructures(STRUCTURE_STORAGE);
    let towers = this.getTowers();
    let currStorage;
    let currToRepair;
    if (roadsWallsToRepair.length === 0) {
        return 0;
    }
    if (storages.length !== 0) {
        currStorage = this.pos.findClosestByPath(storages);
    } else if (extensions.length !== 0) {
        currStorage = this.pos.findClosestByPath(extensions);
    }
    if (this.memory.isFull === false) {
        if (this.withdraw(currStorage, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
            this.moveTo(currStorage);
        }
    } else {
        if (towers.length !== 0) {
            let closestTower = this.pos.findClosestByPath(towers);
            if (this.transfer(closestTower,RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                this.moveTo(closestTower);
            }
        } else if (rampartsToRepair.length !== 0) {
            currToRepair = this.pos.findClosestByRange(rampartsToRepair);
        } else {
            currToRepair = this.pos.findClosestByRange(roadsWallsToRepair);
        }
        if (this.repair(currToRepair) === ERR_NOT_IN_RANGE) {
            this.moveTo(currToRepair);
        }
    }
    if (this.store.getFreeCapacity() === 0) {
        this.memory.isFull = true;
    }
    if (this.store.getUsedCapacity() === 0) {
        this.memory.isFull = false;
    }
}

Creep.prototype.upgradeRoomController = function() {
    let currRoom = this.room;
    let roomController = this.room.controller;
    let extensions = this.getFullStructures(STRUCTURE_EXTENSION);
    let storages = this.getFullStructures(STRUCTURE_STORAGE);
    let currStorage;
    if (storages.length !== 0) {
        currStorage = this.pos.findClosestByPath(storages);
    } else if (extensions.length !== 0) {
        currStorage = this.pos.findClosestByPath(extensions);
    }
    if (this.memory.isFull === false) {
        if (this.withdraw(currStorage, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
            this.moveTo(currStorage);
        }
    } else {
        if (this.upgradeController(roomController) === ERR_NOT_IN_RANGE) {
            this.moveTo(roomController);
        }
    }
    if (this.store.getFreeCapacity() === 0) {
        this.memory.isFull = true;
    }
    if (this.store.getUsedCapacity() === 0) {
        this.memory.isFull = false;
    }
}

Creep.prototype.cleanup = function() {
    let currRoom = this.room;
    let droppedItems = this.getDroppedItems(); //[droppedEnergy, tombStones, ruins]
    let droppedEnergy = droppedItems[0];
    let tombstones = droppedItems[1];
    let ruins = droppedItems[2];
    let extensions = this.getOpenStructures(STRUCTURE_EXTENSION);
    let storages = this.getOpenStructures(STRUCTURE_STORAGE);
    let roomSpawn = this.room.find(FIND_MY_SPAWNS)[0];
    let currTarget;
    let currStorage;
    if (droppedEnergy.length === 0 && tombstones.length === 0 && ruins.length === 0 && this.memory.isFull === false) {
        this.moveTo(18,36);
        return 0;
    }
    if (extensions.length != 0) {
        currStorage = this.pos.findClosestByPath(extensions);
    } else if (storages.length !== 0) {
        currStorage = this.pos.findClosestByPath(storages);
    } else if (roomSpawn.store.getFreeCapacity(RESOURCE_ENERGY) !== 0) {
            currStorage = roomSpawn;
    } else {
        return 0; // All Storages are full
    }
    if (this.memory.isFull === false) {
        if (droppedEnergy.length !== 0) {
            currTarget = this.pos.findClosestByPath(droppedEnergy);
            if (this.pickup(currTarget) === ERR_NOT_IN_RANGE) {
                this.moveTo(currTarget);
            }
        } else if (tombstones.length !== 0) {
            currTarget = this.pos.findClosestByPath(tombstones);
            if (this.withdraw(currTarget, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                this.moveTo(currTarget);
            }
        } else if (ruins.length !== 0) {
            currTarget = this.pos.findClosestByPath(ruins);
            if (this.withdraw(currTarget, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                this.moveTo(currTarget);
            }
        }
    } else {
        if (this.transfer(currStorage,Object.keys(this.store)[0]) === ERR_NOT_IN_RANGE) {
            this.moveTo(currStorage);
        }
    }
    if (this.store.getFreeCapacity() === 0) {
        this.memory.isFull = true;
    }
    if (this.store.getUsedCapacity() === 0) {
        this.memory.isFull = false;
    }
}

Creep.prototype.storager = function() {
    let currRoom = this.room;
    let links = this.getLinks();
    let extensions = this.getOpenStructures(STRUCTURE_EXTENSION);
    let containers = this.getFullStructures(STRUCTURE_CONTAINER);
    let storages = this.getOpenStructures(STRUCTURE_STORAGE);
    let currStorage;
    let closestStorage;
    let closestLink = this.pos.findClosestByPath(links);
    let closestContainer = this.pos.findClosestByPath(containers);

    if (links.length !== 0) {
        if (closestLink.store.getUsedCapacity(RESOURCE_ENERGY) > 0) {
            currStorage = this.pos.findClosestByPath(storages);
        } else {
            if (extensions.length !== 0) {
                currStorage = this.pos.findClosestByPath(extensions);
                closestStorage = this.pos.findClosestByPath(storages);
            } else {
                currStorage = this.pos.findClosestByPath(storages);
            }
        }
    } else if (containers.length !== 0) {
        if (closestContainer.store.getUsedCapacity(RESOURCE_ENERGY) > 0) {
            currStorage = this.pos.findClosestByPath(storages);
        } else {
            if (extensions.length !== 0) {
                currStorage = this.pos.findClosestByPath(extensions);
                closestStorage = this.pos.findClosestByPath(storages);
            } else {
                currStorage = this.pos.findClosestByPath(storages);
            }
        }
    }
    if (currStorage === undefined) {
        currStorage = currRoom.find(FIND_MY_SPAWNS);
    }
    if (this.memory.isFull === false) {
        if (closestLink !== null && closestLink.store.getUsedCapacity(RESOURCE_ENERGY) > 0) {
            if (this.withdraw(closestLink,RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                this.moveTo(closestLink);
            }
        } else if (closestContainer !== null && closestContainer.store.getUsedCapacity(RESOURCE_ENERGY) > 0) {
            if (this.withdraw(closestContainer,RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                this.moveTo(closestContainer);
            }
        } else {
            if (this.withdraw(closestStorage,RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                this.moveTo(closestStorage);
            }
        }
    } else {
        if (this.transfer(currStorage,RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
            this.moveTo(currStorage);
        }
    }
    if (this.store.getFreeCapacity() === 0) {
        this.memory.isFull = true;
    }
    if (this.store.getUsedCapacity() === 0) {
        this.memory.isFull = false;
    }
}
