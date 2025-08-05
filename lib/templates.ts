export interface Template {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
}

export const templates: Template[] = [
  {
    id: 'painting-company',
    name: 'Painting Company',
    description: 'Professional painting service reports with before/after photos',
    icon: '🎨',
    category: 'Construction'
  },
  {
    id: 'roofing-company',
    name: 'Roofing Company',
    description: 'Roof inspection and repair documentation',
    icon: '🏠',
    category: 'Construction'
  },
  {
    id: 'lawn-services',
    name: 'Lawn Care Services',
    description: 'Lawn maintenance and landscaping service reports',
    icon: '🌱',
    category: 'Landscaping'
  },
  {
    id: 'hvac-company',
    name: 'HVAC Services',
    description: 'Heating, ventilation, and air conditioning service reports',
    icon: '❄️',
    category: 'Construction'
  },
  {
    id: 'plumbing-company',
    name: 'Plumbing Services',
    description: 'Plumbing repair and installation documentation',
    icon: '🔧',
    category: 'Construction'
  }
];

export async function loadTemplate(templateId: string): Promise<string> {
  try {
    const response = await fetch(`/api/templates/${templateId}`);
    if (!response.ok) {
      throw new Error(`Failed to load template: ${response.statusText}`);
    }
    return await response.text();
  } catch (error) {
    console.error('Error loading template:', error);
    throw error;
  }
}