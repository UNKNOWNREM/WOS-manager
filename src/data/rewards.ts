import { BuildingReward, BuildingType } from '../types/Building';

export type RewardCycle = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export interface RewardConfig {
    [key: string]: BuildingReward[]; // key is building ID (F01, C01), value is array of 8 rewards (indices 0-7 for cycles 1-8)
}

// Initial placeholder data based on the provided image
// Note: "Stronghold" (4 items) -> Stronghold (S01-S04)
// Note: "Fortress" (12 items) -> Fortress (F01-F12)

const COMMON_REWARDS = {
    puzzle: { type: 'item', name: 'Common Wild Mark', quantity: 1, icon: '/reward/Common Wild Mark.png' },
    chest_gold: { type: 'chest', name: 'Lucky Hero Gear Chest', quantity: 1, icon: '/reward/Lucky Hero Gear Chest.png' },
    chest_blue: { type: 'chest', name: 'Pet Advancement Chest', quantity: 1, icon: '/reward/Pet Advancement Materials Custom Chest.png' },
    chest_red: { type: 'chest', name: 'Deployment Boost', quantity: 1, icon: '/reward/Deployment Capacity Boost II (12hrs).png' },
    crystal_red: { type: 'crystal', name: 'Fire Crystal', quantity: 1, icon: '/reward/Fire Crystal.png' },
    speedup: { type: 'speedup', name: 'Speedup 1h', quantity: 1, icon: '/reward/Speedup 1h.png' },
    hero_shard: { type: 'hero', name: 'Mythic Hero Shard', quantity: 1, icon: '/reward/Mythic General Hero Shard.png' },
    resource: { type: 'resource', name: 'Advanced Teleport', quantity: 1, icon: '/reward/advanced teleport.png' },
    manual: { type: 'item', name: 'Expedition Manual', quantity: 1, icon: '/reward/Mythic Expedition Skill Manual.png' },
    stone: { type: 'item', name: 'Enhancement XP', quantity: 1, icon: '/reward/Enhancement XP Component.png' },
};

// Create a default reward structure with 8 cycles for each building
// This is a simplified filler. Real data needs to be meticulously entered or managed via Admin UI.
// For now, I will generate a pattern that allows satisfying the UI requirements.

const createRewardCycle = (rewards: BuildingReward[]) => {
    // Ensure we have 8 rewards, repeating if necessary
    const cycle: BuildingReward[] = [];
    for (let i = 0; i < 8; i++) {
        cycle.push(rewards[i % rewards.length]);
    }
    return cycle;
};

// Mock data to populate the table initially
// In a real scenario, this would be a huge object exactly matching the image.
export const INITIAL_REWARDS: RewardConfig = {
    // Strongholds
    'S01': createRewardCycle([COMMON_REWARDS.puzzle, COMMON_REWARDS.chest_gold, COMMON_REWARDS.manual, COMMON_REWARDS.puzzle, COMMON_REWARDS.puzzle, COMMON_REWARDS.chest_gold, COMMON_REWARDS.manual, COMMON_REWARDS.puzzle]),
    'S02': createRewardCycle([COMMON_REWARDS.crystal_red, COMMON_REWARDS.puzzle, COMMON_REWARDS.chest_blue, COMMON_REWARDS.crystal_red, COMMON_REWARDS.crystal_red, COMMON_REWARDS.puzzle, COMMON_REWARDS.chest_blue, COMMON_REWARDS.crystal_red]),
    'S03': createRewardCycle([COMMON_REWARDS.chest_blue, COMMON_REWARDS.crystal_red, COMMON_REWARDS.puzzle, COMMON_REWARDS.chest_blue, COMMON_REWARDS.chest_blue, COMMON_REWARDS.crystal_red, COMMON_REWARDS.puzzle, COMMON_REWARDS.chest_blue]),
    'S04': createRewardCycle([COMMON_REWARDS.chest_gold, COMMON_REWARDS.manual, COMMON_REWARDS.crystal_red, COMMON_REWARDS.puzzle, COMMON_REWARDS.chest_gold, COMMON_REWARDS.manual, COMMON_REWARDS.crystal_red, COMMON_REWARDS.puzzle]),

    // Fortresses
    'F01': createRewardCycle([COMMON_REWARDS.puzzle, COMMON_REWARDS.hero_shard, COMMON_REWARDS.speedup, COMMON_REWARDS.stone, COMMON_REWARDS.resource, COMMON_REWARDS.hero_shard, COMMON_REWARDS.speedup, COMMON_REWARDS.stone]),
    'F02': createRewardCycle([COMMON_REWARDS.stone, COMMON_REWARDS.puzzle, COMMON_REWARDS.hero_shard, COMMON_REWARDS.stone, COMMON_REWARDS.resource, COMMON_REWARDS.resource, COMMON_REWARDS.hero_shard, COMMON_REWARDS.speedup]),
    'F03': createRewardCycle([COMMON_REWARDS.speedup, COMMON_REWARDS.stone, COMMON_REWARDS.puzzle, COMMON_REWARDS.hero_shard, COMMON_REWARDS.speedup, COMMON_REWARDS.stone, COMMON_REWARDS.resource, COMMON_REWARDS.hero_shard]),
    'F04': createRewardCycle([COMMON_REWARDS.hero_shard, COMMON_REWARDS.speedup, COMMON_REWARDS.stone, COMMON_REWARDS.manual, COMMON_REWARDS.stone, COMMON_REWARDS.speedup, COMMON_REWARDS.stone, COMMON_REWARDS.resource]),
    'F05': createRewardCycle([COMMON_REWARDS.puzzle, COMMON_REWARDS.hero_shard, COMMON_REWARDS.speedup, COMMON_REWARDS.manual, COMMON_REWARDS.resource, COMMON_REWARDS.hero_shard, COMMON_REWARDS.speedup, COMMON_REWARDS.stone]),
    'F06': createRewardCycle([COMMON_REWARDS.stone, COMMON_REWARDS.puzzle, COMMON_REWARDS.hero_shard, COMMON_REWARDS.speedup, COMMON_REWARDS.stone, COMMON_REWARDS.resource, COMMON_REWARDS.hero_shard, COMMON_REWARDS.speedup]),
    'F07': createRewardCycle([COMMON_REWARDS.speedup, COMMON_REWARDS.stone, COMMON_REWARDS.puzzle, COMMON_REWARDS.stone, COMMON_REWARDS.speedup, COMMON_REWARDS.stone, COMMON_REWARDS.resource, COMMON_REWARDS.hero_shard]),
    'F08': createRewardCycle([COMMON_REWARDS.hero_shard, COMMON_REWARDS.speedup, COMMON_REWARDS.stone, COMMON_REWARDS.stone, COMMON_REWARDS.stone, COMMON_REWARDS.speedup, COMMON_REWARDS.stone, COMMON_REWARDS.resource]),
    'F09': createRewardCycle([COMMON_REWARDS.puzzle, COMMON_REWARDS.hero_shard, COMMON_REWARDS.speedup, COMMON_REWARDS.hero_shard, COMMON_REWARDS.resource, COMMON_REWARDS.hero_shard, COMMON_REWARDS.speedup, COMMON_REWARDS.stone]),
    'F10': createRewardCycle([COMMON_REWARDS.stone, COMMON_REWARDS.puzzle, COMMON_REWARDS.hero_shard, COMMON_REWARDS.manual, COMMON_REWARDS.stone, COMMON_REWARDS.resource, COMMON_REWARDS.hero_shard, COMMON_REWARDS.speedup]),
    'F11': createRewardCycle([COMMON_REWARDS.speedup, COMMON_REWARDS.stone, COMMON_REWARDS.puzzle, COMMON_REWARDS.manual, COMMON_REWARDS.speedup, COMMON_REWARDS.stone, COMMON_REWARDS.resource, COMMON_REWARDS.hero_shard]),
    'F12': createRewardCycle([COMMON_REWARDS.hero_shard, COMMON_REWARDS.speedup, COMMON_REWARDS.stone, COMMON_REWARDS.speedup, COMMON_REWARDS.stone, COMMON_REWARDS.speedup, COMMON_REWARDS.stone, COMMON_REWARDS.resource]),
};

export const REWARD_CYCLES: RewardCycle[] = [1, 2, 3, 4, 5, 6, 7, 8];

/**
 * Get reward for a specific building at a specific cycle
 */
export const getReward = (
    rewards: RewardConfig,
    buildingId: string,
    cycle: RewardCycle
): BuildingReward | undefined => {
    const buildingRewards = rewards[buildingId];
    if (!buildingRewards) return undefined;

    // Cycle is 1-based, array is 0-based
    const index = (cycle - 1) % 8;
    return buildingRewards[index];
};
