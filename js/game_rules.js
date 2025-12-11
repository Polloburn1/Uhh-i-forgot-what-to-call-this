/* 
  game_rules.js
  High-Level Game Logic: Roles, Tasks, Meetings.
  Consolidated from: game_tasks, game_meetings
*/

export const Roles = {
    CREWMATE: 'crewmate',
    IMPOSTER: 'imposter'
};

export const TaskSystem = {
    tasks: [],

    assignTasks(players) {
        console.log('Assigning tasks to players...');
    },

    checkCompletion() {
        // Check if total task bar is full
    }
};

export const MeetingSystem = {
    active: false,
    votes: {},

    trigger(caller) {
        if (this.active) return;
        this.active = true;
        console.log('Emergency Meeting called by', caller);
    },

    vote(voter, target) {
        console.log(voter, 'voted for', target);
    }
};
