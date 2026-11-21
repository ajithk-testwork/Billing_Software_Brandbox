
export interface LaundryService {
  id: string;
  name: string;
  description: string;
  features: string[];
  active: boolean;
  category: "Regular" | "Exclusive";
}

export interface GarmentPrice {
  id: string;
  garment: string;
  category: "Standard" | "Premium";
  minPrice: number;
  maxPrice: number;
  active: boolean;
}

export const SERVICES_KEY = "brandbox_services";
export const PRICES_KEY = "brandbox_pricing";

export const initialServices: LaundryService[] = [
  {
    id: "dry-cleaning",
    name: "Dry Cleaning",
    description: "Fabric-safe dry cleaning with expert stain removal for formal and delicate garments.",
    features: [
      "Organic cleaning solvents",
      "Advanced stain treatment",
      "Delicate fabric care",
      "Perfect finishing",
    ],
    active: true,
    category: "Regular",
  },
  {
    id: "stain-removing",
    name: "Stain Removing",
    description: "Professional stain removal for all fabric types with safe, effective treatments.",
    features: [
      "Expert stain analysis",
      "Fabric-safe solutions",
      "Pre-treatment process",
      "Guaranteed results",
    ],
    active: true,
    category: "Regular",
  },
  {
    id: "bleaching",
    name: "Bleaching",
    description: "Safe bleaching service to restore whiteness to your garments.",
    features: [
      "Controlled bleaching process",
      "Fabric protection",
      "Color restoration",
      "Quality assurance",
    ],
    active: true,
    category: "Regular",
  },
  {
    id: "roll-polishing",
    name: "Roll Polishing",
    description: "Professional roll polishing for crisp, polished finish on garments.",
    features: [
      "Industrial roll polish",
      "Smooth finish",
      "All fabric types",
      "Quick turnaround",
    ],
    active: true,
    category: "Regular",
  },
  {
    id: "roll-pressing",
    name: "Roll Pressing",
    description: "Sharp, wrinkle-free pressing using industrial roll press technology.",
    features: [
      "Wrinkle-free finish",
      "Bulk pressing available",
      "Professional quality",
    ],
    active: true,
    category: "Regular",
  },
  {
    id: "steam-pressing",
    name: "Steam Pressing",
    description: "Steam pressing for sharp creases and wrinkle-free garments.",
    features: [
      "Steam technology",
      "All fabric types",
      "Delicate handling",
      "Fast service",
    ],
    active: true,
    category: "Regular",
  },
  {
    id: "carpet-cleaning",
    name: "Carpet Cleaning",
    description: "Deep cleaning for carpets and rugs with professional equipment.",
    features: [
      "Deep extraction",
      "Stain removal",
      "Odor elimination",
      "Eco-friendly solutions",
    ],
    active: true,
    category: "Regular",
  },
  {
    id: "darning",
    name: "Darning",
    description: "Expert darning and repair services for damaged garments.",
    features: [
      "Invisible mending",
      "Expert craftsmanship",
      "Fabric matching",
      "Extended garment life",
    ],
    active: true,
    category: "Regular",
  },
  {
    id: "dyeing",
    name: "Dyeing",
    description: "Professional dyeing service to refresh or change garment colors.",
    features: [
      "Color matching",
      "Even dye application",
      "Fabric-safe dyes",
      "Custom color options",
    ],
    active: true,
    category: "Regular",
  },
  {
    id: "bridal-lehanga",
    name: "Bridal Lehanga",
    description: "Luxury care for bridal lehengas with delicate handling and premium finishing.",
    features: [
      "Hand wash & dry clean",
      "Stone & embroidery care",
      "Premium packaging",
      "White-glove service",
    ],
    active: true,
    category: "Exclusive",
  },
  {
    id: "bridal-gowns",
    name: "Bridal Gowns",
    description: "Expert care for bridal gowns ensuring they look perfect on your special day.",
    features: [
      "Specialized cleaning",
      "Lace & silk care",
      "Preservation packaging",
      "By-appointment service",
    ],
    active: true,
    category: "Exclusive",
  },
  {
    id: "bridal-sarees",
    name: "Bridal Sarees",
    description: "Premium care for bridal sarees with traditional and modern fabric expertise.",
    features: [
      "Silk & zari care",
      "Hand wash option",
      "Starch & press",
      "Premium folding",
    ],
    active: true,
    category: "Exclusive",
  },
  {
    id: "blazers",
    name: "Blazers",
    description: "Professional dry cleaning and pressing for blazers and formal jackets.",
    features: [
      "Structure preservation",
      "Lapel pressing",
      "Lining care",
      "Crisp finish",
    ],
    active: true,
    category: "Exclusive",
  },
  {
    id: "suits",
    name: "Suits",
    description: "Complete suit care with expert dry cleaning and precision pressing.",
    features: [
      "2-piece & 3-piece care",
      "Trouser crease",
      "Jacket shaping",
      "Premium packaging",
    ],
    active: true,
    category: "Exclusive",
  },
  {
    id: "sherwani",
    name: "Sherwani",
    description: "Specialized care for sherwanis with embroidery and embellishment protection.",
    features: [
      "Heavy embroidery care",
      "Fabric preservation",
      "Traditional folding",
      "Premium finishing",
    ],
    active: true,
    category: "Exclusive",
  },
];

export const initialPrices: GarmentPrice[] = [
  {
    id: "shirt",
    garment: "Shirt",
    category: "Standard",
    minPrice: 150,
    maxPrice: 150,
    active: true,
  },
  {
    id: "pants",
    garment: "Pants",
    category: "Standard",
    minPrice: 150,
    maxPrice: 150,
    active: true,
  },
  {
    id: "blazer",
    garment: "Blazer",
    category: "Premium",
    minPrice: 600,
    maxPrice: 600,
    active: true,
  },
  {
    id: "silk-saree",
    garment: "Silk Saree",
    category: "Standard",
    minPrice: 400,
    maxPrice: 400,
    active: true,
  },
  {
    id: "jacket",
    garment: "Jacket",
    category: "Standard",
    minPrice: 400,
    maxPrice: 400,
    active: true,
  },
  {
    id: "curtains",
    garment: "Curtains",
    category: "Premium",
    minPrice: 400,
    maxPrice: 1500,
    active: true,
  },
];

export function loadServices(): LaundryService[] {
  if (typeof window === "undefined") return initialServices;

  try {
    const saved = localStorage.getItem(SERVICES_KEY);
    return saved ? JSON.parse(saved) : initialServices;
  } catch {
    return initialServices;
  }
}

export function loadPrices(): GarmentPrice[] {
  if (typeof window === "undefined") return initialPrices;

  try {
    const saved = localStorage.getItem(PRICES_KEY);
    return saved ? JSON.parse(saved) : initialPrices;
  } catch {
    return initialPrices;
  }
}

export function saveServices(data: LaundryService[]) {
  localStorage.setItem(SERVICES_KEY, JSON.stringify(data));
}

export function savePrices(data: GarmentPrice[]) {
  localStorage.setItem(PRICES_KEY, JSON.stringify(data));
}
