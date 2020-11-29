/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('role.attackSquad');
 * mod.thing == 'a thing'; // true
 */

 /*
 Squad layout:
    lead: Tough and move
        Enters first and takes most of the damage
    leadHealer: Heal and move
        Enters second and heals lead constantly
    attack: Attack, Tough, and move
        Enters third and attacks any enemies or structures in the room
    attackHealer: Heal and move
        Enters fourth and heals attack constantly
 */

const leadBody = [TOUGH,TOUGH,TOUGH,TOUGH,TOUGH, // 50
                  TOUGH,TOUGH,TOUGH,TOUGH,TOUGH, // 50
                  TOUGH,TOUGH,TOUGH,TOUGH,TOUGH, // 50
                  TOUGH,TOUGH,TOUGH,TOUGH,TOUGH, // 50
                  TOUGH,TOUGH,TOUGH,TOUGH,TOUGH, // 50
                  TOUGH,TOUGH,TOUGH,TOUGH,TOUGH, // 50
                  TOUGH,TOUGH,TOUGH,TOUGH,TOUGH, // 50
                  TOUGH,TOUGH,TOUGH,TOUGH,TOUGH, // 50
                  MOVE,MOVE,MOVE,MOVE] // 200   Total : 600

const healerBody = [HEAL,HEAL,MOVE,MOVE] // Total: 600

const attackerBody = [ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,MOVE,MOVE,MOVE,MOVE] // Total: 600

const attackSquadMemory = {
    cType: 'attacker',
    squadRole: undefined,

}

function spawnLeadCreep() {
    
}

module.exports = {

};