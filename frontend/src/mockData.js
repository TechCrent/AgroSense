// Set VITE_DEV_MOCK=true in frontend/.env to use mocks without any API server.
export const DEV_MODE = import.meta.env.VITE_DEV_MOCK === 'true'

export const MOCK_CANDIDATES = [
  {
    name: "Solanum lycopersicum",
    common_name: "Tomato",
    confidence: 0.94,
    image_url: "https://upload.wikimedia.org/wikipedia/commons/8/89/Tomato_je.jpg"
  },
  {
    name: "Solanum tuberosum",
    common_name: "Potato",
    confidence: 0.61,
    image_url: "https://upload.wikimedia.org/wikipedia/commons/a/ab/Potato_je.jpg"
  },
  {
    name: "Physalis peruviana",
    common_name: "Cape Gooseberry",
    confidence: 0.43,
    image_url: "https://upload.wikimedia.org/wikipedia/commons/9/96/PhysalisPeruviana.jpg"
  }
]

export const MOCK_RESULT_INFECTED = {
  plant: {
    name: "Solanum lycopersicum",
    common_name: "Tomato",
    confidence: 0.97
  },
  health: {
    status: "infected",
    disease_name: "Early Blight",
    disease_type: "Fungal",
    confidence: 0.88
  },
  diagnosis: {
    summary: "Early Blight is a common fungal disease caused by Alternaria solani. It causes dark spots with concentric rings on lower leaves and spreads rapidly in warm, humid conditions.",
    steps: [
      "Remove all visibly infected leaves immediately. Place them in a sealed bag and dispose of them away from your garden — do not compost.",
      "Apply a copper-based fungicide (e.g. Copper Oxychloride) or neem oil spray directly to all leaf surfaces, top and bottom. Repeat every 7 days.",
      "Water only at the base of the plant using drip irrigation or a directed hose. Avoid getting leaves wet as moisture promotes fungal spread.",
      "Improve air circulation around the plant by removing crowded or overlapping branches using clean, sterilised pruning shears.",
      "Apply a balanced fertiliser to strengthen the plant's immune response. Avoid excess nitrogen which promotes soft, disease-prone growth.",
    ],
    language: "en"
  }
}

export const MOCK_RESULT_HEALTHY = {
  plant: {
    name: "Solanum lycopersicum",
    common_name: "Tomato",
    confidence: 0.95
  },
  health: {
    status: "healthy",
    disease_name: null,
    disease_type: null,
    confidence: 0.92
  },
  diagnosis: {
    summary: "Your tomato plant looks healthy! Here are common diseases to watch out for and how to prevent them.",
    steps: [
      "Early Blight (Fungal): Water at the base only, ensure 60cm spacing between plants, remove lower leaves touching soil. Apply preventive copper spray monthly.",
      "Late Blight (Fungal): Choose resistant varieties for next season. Avoid overhead watering. Apply preventive fungicide before the rainy season begins.",
      "Tomato Mosaic Virus (Viral): Control aphid populations with neem oil spray. Remove and destroy any plants showing mosaic or mottled leaf patterns immediately.",
      "Bacterial Speck (Bacterial): Use certified disease-free seeds. Do not work with plants when foliage is wet. Rotate crops each season.",
      "Blossom End Rot (Abiotic): Maintain consistent soil moisture with mulching. Add crushed eggshells or calcium supplement to soil to maintain calcium levels.",
    ],
    language: "en"
  }
}

export const MOCK_RESULT_AT_RISK = {
  plant: {
    name: "Solanum lycopersicum",
    common_name: "Tomato",
    confidence: 0.91
  },
  health: {
    status: "at_risk",
    disease_name: null,
    disease_type: null,
    confidence: 0.72
  },
  diagnosis: {
    summary: "Your plant shows mild stress or early symptoms. Increase monitoring and apply preventive care before symptoms worsen.",
    steps: [
      "Inspect leaves daily for new spots or yellowing.",
      "Reduce overhead watering and improve spacing for airflow.",
      "Apply a light preventive fungicide if humidity stays high.",
      "Feed with balanced fertiliser; avoid overfeeding nitrogen.",
      "Isolate from other nightshades if any lesions appear.",
    ],
    language: "en"
  }
}
