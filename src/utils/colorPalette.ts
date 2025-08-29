// Comprehensive color palette for charts and UI elements
// These colors are designed to work well together and provide good contrast

export const chartColors = [
  // Primary vibrant colors
  '#3B82F6', // Blue
  '#EF4444', // Red
  '#10B981', // Green
  '#F59E0B', // Amber
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#84CC16', // Lime
  
  // Secondary colors
  '#6366F1', // Indigo
  '#F97316', // Orange
  '#14B8A6', // Teal
  '#A3E635', // Green-400
  '#F43F5E', // Rose
  '#06B6D4', // Sky
  '#8B5CF6', // Violet
  '#EC4899', // Pink-500
  
  // Tertiary colors
  '#0EA5E9', // Sky-500
  '#22C55E', // Green-500
  '#F59E0B', // Yellow-500
  '#EF4444', // Red-500
  '#8B5CF6', // Violet-500
  '#EC4899', // Pink-500
  '#06B6D4', // Cyan-500
  '#84CC16', // Lime-500
  
  // Additional colors for larger datasets
  '#A855F7', // Purple-600
  '#F43F5E', // Rose-500
  '#0D9488', // Teal-600
  '#65A30D', // Lime-600
  '#DC2626', // Red-600
  '#2563EB', // Blue-600
  '#7C3AED', // Violet-600
  '#DB2777', // Pink-600
];

// Alternative color schemes
export const alternativeColors = [
  // Warm colors
  '#FF6B6B', '#FF8E53', '#FFA726', '#FFCC02', '#FFEB3B',
  // Cool colors
  '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD',
  // Neutral colors
  '#A8E6CF', '#DCEDC1', '#FFD3B6', '#FFAAA5', '#FF8B94'
];

// Pastel color scheme
export const pastelColors = [
  '#FFB3BA', '#BAFFC9', '#BAE1FF', '#FFFFBA', '#FFB3F7',
  '#B3FFB3', '#B3D9FF', '#FFE6B3', '#E6B3FF', '#B3FFF0'
];

// Get color by index with fallback
export const getChartColor = (index: number, colorScheme: string[] = chartColors): string => {
  return colorScheme[index % colorScheme.length];
};

// Get multiple colors for a dataset
export const getChartColors = (count: number, colorScheme: string[] = chartColors): string[] => {
  const colors: string[] = [];
  for (let i = 0; i < count; i++) {
    colors.push(getChartColor(i, colorScheme));
  }
  return colors;
};

// Generate HSL colors programmatically (alternative approach)
export const generateHSLColors = (count: number): string[] => {
  const colors: string[] = [];
  for (let i = 0; i < count; i++) {
    const hue = (i * 137.5) % 360; // Golden angle approximation for good distribution
    const saturation = 70 + (i % 20); // Vary saturation between 70-90%
    const lightness = 55 + (i % 15); // Vary lightness between 55-70%
    colors.push(`hsl(${hue}, ${saturation}%, ${lightness}%)`);
  }
  return colors;
};

// Export default color scheme
export default chartColors;
