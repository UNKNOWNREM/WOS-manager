/**
 * Migration utility for LocalStorage keys
 * Handles renaming of keys while preserving user data
 */

const MIGRATIONS = [
    { oldKey: 'buildings_v4', newKey: 'buildings' },
    { oldKey: 'rewards_config_v2', newKey: 'rewards_config' },
];

export function migrateStorage() {
    try {
        console.log('Checking for data migrations...');
        let migratedCount = 0;

        MIGRATIONS.forEach(({ oldKey, newKey }) => {
            // Check if new key already has data
            const newData = localStorage.getItem(newKey);
            if (newData) return; // Already migrated or fresh start

            // Check if old key has data
            const oldData = localStorage.getItem(oldKey);
            if (oldData) {
                console.log(`Migrating data from ${oldKey} to ${newKey}`);
                localStorage.setItem(newKey, oldData);
                // Optional: localStorage.removeItem(oldKey); // Keep for safety for now
                migratedCount++;
            }
        });

        if (migratedCount > 0) {
            console.log(`Successfully migrated ${migratedCount} keys.`);
        } else {
            console.log('No migrations needed.');
        }
    } catch (e) {
        console.error('Migration failed:', e);
    }
}
