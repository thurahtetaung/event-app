import {
  Music2,
  Presentation,
  PartyPopper,
  Video,
  Globe,
  Users,
  Trophy,
  Palette,
  Film,
  Utensils
} from "lucide-react"
import { LucideIcon } from "lucide-react"

// Map of icon names to their components
export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  'Video': Video,
  'Presentation': Presentation,
  'Music2': Music2,
  'Palette': Palette,
  'Trophy': Trophy,
  'Users': Users,
  'PartyPopper': PartyPopper,
  'Globe': Globe,
  'Film': Film,
  'Utensils': Utensils
}

export const ICON_NAMES = Object.keys(CATEGORY_ICONS)

// Function to get the icon component for a given name
export function getCategoryIcon(iconName: string): LucideIcon {
  return CATEGORY_ICONS[iconName] || Globe
}

// Mapping of common categories to their default icons
export const CATEGORY_ICON_MAPPING: Record<string, string> = {
  'Conference': 'Video',
  'Workshop': 'Presentation',
  'Concert': 'Music2',
  'Exhibition': 'Palette',
  'Sports': 'Trophy',
  'Networking': 'Users',
  'Festival': 'PartyPopper',
  'Movie': 'Film',
  'Food & Dining': 'Utensils',
  'Other': 'Globe',
}

// Function to get the most appropriate icon for a category name
export function getIconForCategory(categoryName: string): LucideIcon {
  const iconName = CATEGORY_ICON_MAPPING[categoryName] || 'Globe'
  return getCategoryIcon(iconName)
}
