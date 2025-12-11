export const DEFAULT_MAPS = [
    {
        id: 'default_map_01',
        name: 'Headquarters (Default)',
        isDefault: true,
        width: 800,
        height: 600,
        spawns: [{ x: 400, y: 300 }],
        tasks: [],
        walls: [], // Array of rects or pixel mask data
        base64: '' // Empty for now, will be filled with a default grid image later
    }
];
