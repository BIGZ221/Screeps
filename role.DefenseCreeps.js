/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('role.DefenseCreeps');
 * mod.thing == 'a thing'; // true
 */
// TODO: Implement the automatic repair of Ramparts, Spawning and control of creeps to attack nearby enemies

const defenderCreepBody = [TOUGH,TOUGH,TOUGH,TOUGH,ATTACK,ATTACK,MOVE,MOVE]; // COST: 40 + 160 + 100 = 300
const healerCreepBody = [HEAL,]; // COST: 250 + 
const creepMemory = {

}

module.exports = {
run: function() {
    
    }
}