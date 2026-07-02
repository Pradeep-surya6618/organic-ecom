export const products = [
  {
    id: 1,
    name: "Organic Red Apples",
    category: "fruits",
    price: 4.99,
    originalPrice: 6.99,
    rating: 4.8,
    reviews: 128,
    image: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400&h=400&fit=crop",
    badge: "Best Seller",
    description: "Crisp, sweet, and organically grown red apples from local farms.",
    inStock: true,
    weight: "1 kg",
    tags: ["organic", "fresh", "local"]
  },
  {
    id: 2,
    name: "Fresh Bananas",
    category: "fruits",
    price: 2.49,
    originalPrice: 3.49,
    rating: 4.6,
    reviews: 95,
    image: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&h=400&fit=crop",
    badge: "Sale",
    description: "Ripe, sweet bananas perfect for smoothies and snacks.",
    inStock: true,
    weight: "1 bunch",
    tags: ["organic", "potassium"]
  },
  {
    id: 3,
    name: "Organic Carrots",
    category: "vegetables",
    price: 3.29,
    originalPrice: null,
    rating: 4.7,
    reviews: 76,
    image: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400&h=400&fit=crop",
    badge: null,
    description: "Fresh organic carrots, rich in beta-carotene and vitamins.",
    inStock: true,
    weight: "500 g",
    tags: ["organic", "vitamin-a"]
  },
  {
    id: 4,
    name: "Broccoli Florets",
    category: "vegetables",
    price: 3.99,
    originalPrice: 5.49,
    rating: 4.5,
    reviews: 62,
    image: "https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?w=400&h=400&fit=crop",
    badge: "Popular",
    description: "Nutrient-dense broccoli florets, perfect for steaming or roasting.",
    inStock: true,
    weight: "400 g",
    tags: ["organic", "superfood"]
  },
  {
    id: 5,
    name: "Organic Avocados",
    category: "fruits",
    price: 5.99,
    originalPrice: null,
    rating: 4.9,
    reviews: 203,
    image: "https://images.unsplash.com/photo-1523049673856-6468baca294f?w=400&h=400&fit=crop",
    badge: "Premium",
    description: "Creamy, ripe avocados packed with healthy fats and nutrients.",
    inStock: true,
    weight: "3 pcs",
    tags: ["organic", "healthy-fats"]
  },
  {
    id: 6,
    name: "Fresh Spinach",
    category: "vegetables",
    price: 2.99,
    originalPrice: 3.99,
    rating: 4.4,
    reviews: 88,
    image: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&h=400&fit=crop",
    badge: "Sale",
    description: "Tender baby spinach leaves, washed and ready to use.",
    inStock: true,
    weight: "250 g",
    tags: ["organic", "iron-rich"]
  },
  {
    id: 7,
    name: "Organic Strawberries",
    category: "fruits",
    price: 6.49,
    originalPrice: null,
    rating: 4.8,
    reviews: 156,
    image: "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=400&h=400&fit=crop",
    badge: "Seasonal",
    description: "Sweet, juicy strawberries picked at peak ripeness.",
    inStock: true,
    weight: "500 g",
    tags: ["organic", "antioxidants"]
  },
  {
    id: 8,
    name: "Bell Peppers Mix",
    category: "vegetables",
    price: 4.49,
    originalPrice: 5.99,
    rating: 4.6,
    reviews: 71,
    image: "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=400&h=400&fit=crop",
    badge: null,
    description: "Colorful mix of red, yellow, and green bell peppers.",
    inStock: true,
    weight: "3 pcs",
    tags: ["organic", "vitamin-c"]
  },
  {
    id: 9,
    name: "Organic Honey",
    category: "pantry",
    price: 12.99,
    originalPrice: null,
    rating: 4.9,
    reviews: 234,
    image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400&h=400&fit=crop",
    badge: "Best Seller",
    description: "Raw, unfiltered organic honey from local beekeepers.",
    inStock: true,
    weight: "500 g",
    tags: ["organic", "raw", "local"]
  },
  {
    id: 10,
    name: "Quinoa Grain",
    category: "pantry",
    price: 7.99,
    originalPrice: 9.99,
    rating: 4.7,
    reviews: 112,
    image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=400&fit=crop",
    badge: "Sale",
    description: "Organic quinoa, a complete protein source for healthy meals.",
    inStock: true,
    weight: "1 kg",
    tags: ["organic", "gluten-free", "protein"]
  },
  {
    id: 11,
    name: "Organic Almonds",
    category: "nuts",
    price: 9.99,
    originalPrice: null,
    rating: 4.8,
    reviews: 189,
    image: "https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=400&h=400&fit=crop",
    badge: "Premium",
    description: "Raw organic almonds, perfect for snacking or baking.",
    inStock: true,
    weight: "500 g",
    tags: ["organic", "protein", "healthy-fats"]
  },
  {
    id: 12,
    name: "Fresh Basil",
    category: "herbs",
    price: 2.99,
    originalPrice: null,
    rating: 4.5,
    reviews: 45,
    image: "https://images.unsplash.com/photo-1618375569909-3c8616cf7733?w=400&h=400&fit=crop",
    badge: null,
    description: "Aromatic fresh basil leaves for cooking and garnishing.",
    inStock: true,
    weight: "100 g",
    tags: ["organic", "fresh", "aromatic"]
  }
];

export const categories = [
  { id: "all", name: "All Products", icon: "Grid3X3" },
  { id: "fruits", name: "Fruits", icon: "Apple" },
  { id: "vegetables", name: "Vegetables", icon: "Carrot" },
  { id: "pantry", name: "Pantry", icon: "Package" },
  { id: "nuts", name: "Nuts & Seeds", icon: "Nut" },
  { id: "herbs", name: "Fresh Herbs", icon: "Leaf" }
];

export const testimonials = [
  {
    id: 1,
    name: "Sarah Johnson",
    role: "Health Enthusiast",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face",
    text: "The quality of produce here is unmatched. Everything tastes so fresh and natural. I've been a loyal customer for 2 years!"
  },
  {
    id: 2,
    name: "Michael Chen",
    role: "Chef",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    text: "As a professional chef, I only use the best ingredients. Organic Store delivers consistently high-quality organic produce."
  },
  {
    id: 3,
    name: "Emily Rodriguez",
    role: "Mother of Three",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
    text: "I trust Organic Store for my family's health. The kids love the fresh fruits, and I love knowing they're eating clean food."
  }
];

export const features = [
  {
    icon: "Truck",
    title: "Free Delivery",
    description: "Free shipping on orders over ₹500. Same-day delivery available in select areas."
  },
  {
    icon: "ShieldCheck",
    title: "100% Organic",
    description: "All products are certified organic, non-GMO, and sourced from trusted local farms."
  },
  {
    icon: "RotateCcw",
    title: "Easy Returns",
    description: "Not satisfied? Return within 30 days for a full refund, no questions asked."
  },
  {
    icon: "Headphones",
    title: "24/7 Support",
    description: "Our friendly team is always here to help with any questions or concerns."
  }
];