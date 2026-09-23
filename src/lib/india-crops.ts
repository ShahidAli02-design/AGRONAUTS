// Major crops grown across India, grouped by category, for use in crop
// selectors (AI Crop Doctor, AI Quality Detector, Yield Predictor).
// - pricePerKg: approximate farmgate ₹/kg (×100 for ₹/quintal)
// - avgYieldQuintalsPerAcre: typical Indian farm yield, quintals/acre
// - maturityDays: typical days from sowing/planting to harvest
export interface IndiaCrop {
  id: string;
  name: string;
  category: string;
  pricePerKg: number;
  avgYieldQuintalsPerAcre: number;
  maturityDays: number;
}

export const INDIA_CROPS: IndiaCrop[] = [
  // Cereals / Grains
  { id: "Rice", name: "Rice / Paddy (भात)", category: "Cereals", pricePerKg: 22, avgYieldQuintalsPerAcre: 25, maturityDays: 120 },
  { id: "Wheat", name: "Wheat (गहू)", category: "Cereals", pricePerKg: 26, avgYieldQuintalsPerAcre: 18, maturityDays: 120 },
  { id: "Maize", name: "Maize / Corn (मका)", category: "Cereals", pricePerKg: 20, avgYieldQuintalsPerAcre: 24, maturityDays: 100 },
  { id: "Jowar", name: "Jowar / Sorghum (ज्वारी)", category: "Cereals", pricePerKg: 28, avgYieldQuintalsPerAcre: 12, maturityDays: 110 },
  { id: "Bajra", name: "Bajra / Pearl Millet (बाजरी)", category: "Cereals", pricePerKg: 24, avgYieldQuintalsPerAcre: 10, maturityDays: 80 },
  { id: "Ragi", name: "Ragi / Finger Millet (नाचणी)", category: "Cereals", pricePerKg: 35, avgYieldQuintalsPerAcre: 8, maturityDays: 110 },
  { id: "Barley", name: "Barley (जव)", category: "Cereals", pricePerKg: 21, avgYieldQuintalsPerAcre: 16, maturityDays: 115 },

  // Pulses
  { id: "Chickpea", name: "Chickpea / Chana (हरभरा)", category: "Pulses", pricePerKg: 55, avgYieldQuintalsPerAcre: 8, maturityDays: 100 },
  { id: "PigeonPea", name: "Pigeon Pea / Tur / Arhar (तूर)", category: "Pulses", pricePerKg: 90, avgYieldQuintalsPerAcre: 6, maturityDays: 150 },
  { id: "BlackGram", name: "Black Gram / Urad (उडीद)", category: "Pulses", pricePerKg: 85, avgYieldQuintalsPerAcre: 5, maturityDays: 75 },
  { id: "GreenGram", name: "Green Gram / Moong (मूग)", category: "Pulses", pricePerKg: 80, avgYieldQuintalsPerAcre: 5, maturityDays: 65 },
  { id: "Lentil", name: "Lentil / Masoor (मसूर)", category: "Pulses", pricePerKg: 70, avgYieldQuintalsPerAcre: 6, maturityDays: 110 },
  { id: "KidneyBeans", name: "Kidney Beans / Rajma (राजमा)", category: "Pulses", pricePerKg: 95, avgYieldQuintalsPerAcre: 7, maturityDays: 100 },
  { id: "FieldPea", name: "Field Pea / Matar (वाटाणा)", category: "Pulses", pricePerKg: 45, avgYieldQuintalsPerAcre: 8, maturityDays: 90 },

  // Oilseeds
  { id: "Groundnut", name: "Groundnut / Peanut (भुईमूग)", category: "Oilseeds", pricePerKg: 58, avgYieldQuintalsPerAcre: 10, maturityDays: 110 },
  { id: "Soybean", name: "Soybean (सोयाबीन)", category: "Oilseeds", pricePerKg: 46, avgYieldQuintalsPerAcre: 12, maturityDays: 95 },
  { id: "Mustard", name: "Mustard / Sarson (मोहरी)", category: "Oilseeds", pricePerKg: 52, avgYieldQuintalsPerAcre: 8, maturityDays: 110 },
  { id: "Sunflower", name: "Sunflower (सूर्यफूल)", category: "Oilseeds", pricePerKg: 60, avgYieldQuintalsPerAcre: 7, maturityDays: 90 },
  { id: "Sesame", name: "Sesame / Til (तीळ)", category: "Oilseeds", pricePerKg: 130, avgYieldQuintalsPerAcre: 3, maturityDays: 90 },
  { id: "Castor", name: "Castor / Erandi (एरंडी)", category: "Oilseeds", pricePerKg: 65, avgYieldQuintalsPerAcre: 8, maturityDays: 150 },
  { id: "Safflower", name: "Safflower / Karadi (करडई)", category: "Oilseeds", pricePerKg: 55, avgYieldQuintalsPerAcre: 5, maturityDays: 120 },

  // Vegetables
  { id: "Tomato", name: "Tomato (टोमॅटो)", category: "Vegetables", pricePerKg: 24.5, avgYieldQuintalsPerAcre: 140, maturityDays: 75 },
  { id: "Onion", name: "Onion (कांदा)", category: "Vegetables", pricePerKg: 18, avgYieldQuintalsPerAcre: 110, maturityDays: 120 },
  { id: "Potato", name: "Potato (बटाटा)", category: "Vegetables", pricePerKg: 20, avgYieldQuintalsPerAcre: 100, maturityDays: 90 },
  { id: "Brinjal", name: "Brinjal / Eggplant (वांगे)", category: "Vegetables", pricePerKg: 22, avgYieldQuintalsPerAcre: 120, maturityDays: 80 },
  { id: "Cabbage", name: "Cabbage (कोबी)", category: "Vegetables", pricePerKg: 14, avgYieldQuintalsPerAcre: 150, maturityDays: 75 },
  { id: "Cauliflower", name: "Cauliflower (फ्लॉवर)", category: "Vegetables", pricePerKg: 18, avgYieldQuintalsPerAcre: 100, maturityDays: 80 },
  { id: "Okra", name: "Okra / Bhindi (भेंडी)", category: "Vegetables", pricePerKg: 30, avgYieldQuintalsPerAcre: 60, maturityDays: 55 },
  { id: "Chilli", name: "Green Chilli (हिरवी मिरची)", category: "Vegetables", pricePerKg: 38, avgYieldQuintalsPerAcre: 40, maturityDays: 90 },
  { id: "Capsicum", name: "Capsicum (सिमला मिरची)", category: "Vegetables", pricePerKg: 40, avgYieldQuintalsPerAcre: 80, maturityDays: 70 },
  { id: "Carrot", name: "Carrot (गाजर)", category: "Vegetables", pricePerKg: 26, avgYieldQuintalsPerAcre: 80, maturityDays: 90 },
  { id: "Radish", name: "Radish / Mooli (मुळा)", category: "Vegetables", pricePerKg: 16, avgYieldQuintalsPerAcre: 100, maturityDays: 45 },
  { id: "Peas", name: "Green Peas / Matar (मटार)", category: "Vegetables", pricePerKg: 45, avgYieldQuintalsPerAcre: 40, maturityDays: 70 },
  { id: "BottleGourd", name: "Bottle Gourd / Dudhi (दुधी भोपळा)", category: "Vegetables", pricePerKg: 15, avgYieldQuintalsPerAcre: 100, maturityDays: 60 },
  { id: "BitterGourd", name: "Bitter Gourd / Karela (कारले)", category: "Vegetables", pricePerKg: 25, avgYieldQuintalsPerAcre: 50, maturityDays: 60 },
  { id: "RidgeGourd", name: "Ridge Gourd / Turai (दोडका)", category: "Vegetables", pricePerKg: 20, avgYieldQuintalsPerAcre: 60, maturityDays: 60 },
  { id: "Pumpkin", name: "Pumpkin / Bhopla (भोपळा)", category: "Vegetables", pricePerKg: 14, avgYieldQuintalsPerAcre: 90, maturityDays: 100 },
  { id: "Cucumber", name: "Cucumber / Kakadi (काकडी)", category: "Vegetables", pricePerKg: 18, avgYieldQuintalsPerAcre: 70, maturityDays: 55 },
  { id: "Spinach", name: "Spinach / Palak (पालक)", category: "Vegetables", pricePerKg: 20, avgYieldQuintalsPerAcre: 40, maturityDays: 35 },
  { id: "Fenugreek", name: "Fenugreek / Methi (मेथी)", category: "Vegetables", pricePerKg: 22, avgYieldQuintalsPerAcre: 30, maturityDays: 30 },
  { id: "Coriander", name: "Coriander Leaves / Kothimbir (कोथिंबीर)", category: "Vegetables", pricePerKg: 24, avgYieldQuintalsPerAcre: 20, maturityDays: 40 },
  { id: "Garlic", name: "Garlic (लसूण)", category: "Vegetables", pricePerKg: 65, avgYieldQuintalsPerAcre: 40, maturityDays: 130 },

  // Fruits
  { id: "Mango", name: "Mango / Alphonso (हापूस आंबा)", category: "Fruits", pricePerKg: 85, avgYieldQuintalsPerAcre: 40, maturityDays: 150 },
  { id: "Banana", name: "Banana (केळी)", category: "Fruits", pricePerKg: 22, avgYieldQuintalsPerAcre: 160, maturityDays: 300 },
  { id: "Grapes", name: "Grapes (द्राक्षे)", category: "Fruits", pricePerKg: 52, avgYieldQuintalsPerAcre: 120, maturityDays: 135 },
  { id: "Pomegranate", name: "Pomegranate (डाळिंब)", category: "Fruits", pricePerKg: 95, avgYieldQuintalsPerAcre: 60, maturityDays: 180 },
  { id: "Papaya", name: "Papaya (पपई)", category: "Fruits", pricePerKg: 18, avgYieldQuintalsPerAcre: 200, maturityDays: 270 },
  { id: "Guava", name: "Guava (पेरू)", category: "Fruits", pricePerKg: 32, avgYieldQuintalsPerAcre: 80, maturityDays: 180 },
  { id: "Apple", name: "Apple (सफरचंद)", category: "Fruits", pricePerKg: 110, avgYieldQuintalsPerAcre: 60, maturityDays: 200 },
  { id: "Orange", name: "Orange / Santra (संत्री)", category: "Fruits", pricePerKg: 45, avgYieldQuintalsPerAcre: 70, maturityDays: 240 },
  { id: "SweetLime", name: "Sweet Lime / Mosambi (मोसंबी)", category: "Fruits", pricePerKg: 40, avgYieldQuintalsPerAcre: 70, maturityDays: 240 },
  { id: "Watermelon", name: "Watermelon (कलिंगड)", category: "Fruits", pricePerKg: 12, avgYieldQuintalsPerAcre: 150, maturityDays: 85 },
  { id: "Muskmelon", name: "Muskmelon / Kharbuja (खरबूज)", category: "Fruits", pricePerKg: 20, avgYieldQuintalsPerAcre: 80, maturityDays: 80 },
  { id: "Pineapple", name: "Pineapple (अननस)", category: "Fruits", pricePerKg: 30, avgYieldQuintalsPerAcre: 100, maturityDays: 450 },
  { id: "Litchi", name: "Litchi (लिची)", category: "Fruits", pricePerKg: 120, avgYieldQuintalsPerAcre: 40, maturityDays: 200 },
  { id: "Sapota", name: "Sapota / Chikoo (चिकू)", category: "Fruits", pricePerKg: 40, avgYieldQuintalsPerAcre: 60, maturityDays: 240 },
  { id: "CustardApple", name: "Custard Apple / Sitafal (सीताफळ)", category: "Fruits", pricePerKg: 60, avgYieldQuintalsPerAcre: 40, maturityDays: 200 },
  { id: "Jackfruit", name: "Jackfruit / Fanas (फणस)", category: "Fruits", pricePerKg: 25, avgYieldQuintalsPerAcre: 80, maturityDays: 250 },

  // Spices
  { id: "Turmeric", name: "Turmeric / Haldi (हळद)", category: "Spices", pricePerKg: 75, avgYieldQuintalsPerAcre: 60, maturityDays: 240 },
  { id: "Ginger", name: "Ginger / Adrak (आले)", category: "Spices", pricePerKg: 55, avgYieldQuintalsPerAcre: 50, maturityDays: 240 },
  { id: "CuminSeed", name: "Cumin / Jeera (जिरे)", category: "Spices", pricePerKg: 220, avgYieldQuintalsPerAcre: 3, maturityDays: 110 },
  { id: "Cardamom", name: "Cardamom / Elaichi (वेलची)", category: "Spices", pricePerKg: 1200, avgYieldQuintalsPerAcre: 2, maturityDays: 300 },
  { id: "BlackPepper", name: "Black Pepper / Kali Mirch (मिरी)", category: "Spices", pricePerKg: 480, avgYieldQuintalsPerAcre: 4, maturityDays: 300 },
  { id: "Fennel", name: "Fennel / Saunf (बडीशेप)", category: "Spices", pricePerKg: 150, avgYieldQuintalsPerAcre: 6, maturityDays: 150 },

  // Cash / Fibre / Plantation crops
  { id: "Cotton", name: "Cotton (कापूस)", category: "Cash Crops", pricePerKg: 68, avgYieldQuintalsPerAcre: 14, maturityDays: 150 },
  { id: "Sugarcane", name: "Sugarcane (ऊस)", category: "Cash Crops", pricePerKg: 3.2, avgYieldQuintalsPerAcre: 350, maturityDays: 330 },
  { id: "Jute", name: "Jute (जूट)", category: "Cash Crops", pricePerKg: 45, avgYieldQuintalsPerAcre: 12, maturityDays: 120 },
  { id: "Tobacco", name: "Tobacco (तंबाखू)", category: "Cash Crops", pricePerKg: 180, avgYieldQuintalsPerAcre: 10, maturityDays: 130 },
  { id: "Tea", name: "Tea Leaves (चहा पाने)", category: "Plantation", pricePerKg: 250, avgYieldQuintalsPerAcre: 20, maturityDays: 365 },
  { id: "Coffee", name: "Coffee Beans (कॉफी)", category: "Plantation", pricePerKg: 320, avgYieldQuintalsPerAcre: 8, maturityDays: 365 },
  { id: "Coconut", name: "Coconut (नारळ)", category: "Plantation", pricePerKg: 30, avgYieldQuintalsPerAcre: 30, maturityDays: 365 },
  { id: "Arecanut", name: "Arecanut / Supari (सुपारी)", category: "Plantation", pricePerKg: 350, avgYieldQuintalsPerAcre: 15, maturityDays: 365 },
];
