// Set VITE_DEV_MOCK=true in agrofrontend/.env to use mocks without any API server.
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
      "Remove and destroy all affected leaves immediately.",
      "Apply a copper-based fungicide or neem oil spray every 7 days.",
      "Water at the base of the plant — avoid wetting leaves.",
      "Ensure good air circulation by pruning crowded branches.",
      "Rotate crops next season to prevent recurrence."
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
      "Early Blight (Fungal): Avoid overhead watering, ensure good airflow.",
      "Late Blight (Fungal): Use resistant varieties, apply preventive fungicide.",
      "Tomato Mosaic Virus (Viral): Control aphids, remove infected plants.",
      "Bacterial Speck (Bacterial): Use disease-free seeds, avoid working with wet plants.",
      "Blossom End Rot (Abiotic): Maintain consistent watering and calcium levels."
    ],
    language: "en"
  }
}
