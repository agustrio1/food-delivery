'use client';

import { useState, useEffect } from 'react';
import DishGrid from './dish-grid';
import CategorySlider from './category-slider';
import { Loader2 } from 'lucide-react';

export default function DishesByCategory({ initialDishes, categories }) {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [dishes, setDishes] = useState(initialDishes);
  const [loading, setLoading] = useState(false);

  const fetchDishesByCategory = async (categoryId) => {
    setLoading(true);
    try {
      const url = categoryId 
        ? `/api/dishes/category?categoryId=${categoryId}`
        : '/api/dishes';
      
      const response = await fetch(url);
      const data = await response.json();
      setDishes(data);
    } catch (error) {
      console.error('Error fetching dishes:', error);
      setDishes(initialDishes);
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
    if (categoryId === null) {
      // Show all dishes
      setDishes(initialDishes);
    } else {
      fetchDishesByCategory(categoryId);
    }
  };

  return (
    <>
      {/* Mobile-only CSS */}
      <style jsx global>{`
        .dishes-by-category-container {
          width: 100%;
        }
        
        @media (min-width: 768px) {
          .dishes-by-category-container {
            max-width: 375px !important;
            margin: 0 auto !important;
          }
        }
      `}</style>

      <div className="dishes-by-category-container">
        <div className="space-y-6">
          {/* Category Slider */}
          <CategorySlider 
            categories={categories} 
            selectedCategory={selectedCategory}
            onCategorySelect={handleCategorySelect}
          />

          {/* Dishes Grid */}
          <div className="relative px-4">
            {loading && (
              <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10 rounded-lg backdrop-blur-sm">
                <div className="flex items-center gap-3 bg-white px-4 py-3 rounded-xl shadow-lg border border-gray-100">
                  <Loader2 className="h-5 w-5 animate-spin text-amber-500" />
                  <span className="text-sm font-medium text-gray-700">Memuat menu...</span>
                </div>
              </div>
            )}
            
            <div className={loading ? 'opacity-50 pointer-events-none transition-opacity duration-200' : 'transition-opacity duration-200'}>
              <DishGrid dishes={dishes} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}