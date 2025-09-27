'use client';

import { useRef, useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight,
  Utensils,
  Pizza,
  Coffee,
  IceCream,
  Apple,
  Sandwich,
  Fish,
  Salad,
  Beef,
  Soup,
  Cake,
  Cookie,
  Egg,
  Wheat,
  Carrot
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const categoryIcons = {
  'Fast Food': Sandwich,
  'Pizza': Pizza,
  'Asian': Soup,
  'Dessert': Cake,
  'Beverage': Coffee,
  'Indonesian': Utensils,
  'Western': Beef,
  'Healthy': Salad,
  'Snacks': Cookie,
  'Breakfast': Egg,
  'Makanan Utama': Utensils,
  'Minuman': Coffee,
  'Cemilan': Cookie,
  'Nasi': Wheat,
  'Mie': Soup,
  'Ayam': Beef,
  'Seafood': Fish,
  'Vegetarian': Carrot,
  'Ice Cream': IceCream,
  'Fruit': Apple
};

export default function CategorySlider({ categories, onCategorySelect, selectedCategory }) {
  const scrollContainerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScrollButtons = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = 200;
      const targetScroll = direction === 'left' 
        ? scrollContainerRef.current.scrollLeft - scrollAmount
        : scrollContainerRef.current.scrollLeft + scrollAmount;
      
      scrollContainerRef.current.scrollTo({
        left: targetScroll,
        behavior: 'smooth'
      });
      
      setTimeout(checkScrollButtons, 300);
    }
  };

  const getCategoryIcon = (categoryName) => {
    return categoryIcons[categoryName] || Utensils;
  };

  if (!categories.length) {
    return null;
  }

  return (
    <>
      {/* Mobile-only CSS */}
      <style jsx global>{`
        .category-slider {
          width: 100%;
        }
        
        @media (min-width: 768px) {
          .category-slider {
            max-width: 375px !important;
            margin: 0 auto !important;
          }
        }
      `}</style>

      <div className="category-slider px-4">
        <div className="relative">
          {canScrollLeft && (
            <Button
              variant="outline"
              size="sm"
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg border-gray-200 hover:bg-gray-50 w-8 h-8 p-0"
              onClick={() => scroll('left')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}
          
          {canScrollRight && (
            <Button
              variant="outline"
              size="sm"
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg border-gray-200 hover:bg-gray-50 w-8 h-8 p-0"
              onClick={() => scroll('right')}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}

          <div
            ref={scrollContainerRef}
            className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 scroll-smooth px-10"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            onScroll={checkScrollButtons}
          >
            <CategoryCard
              category={{ id: null, name: 'Semua' }}
              IconComponent={Utensils}
              index={0}
              isSelected={selectedCategory === null}
              onSelect={() => onCategorySelect && onCategorySelect(null)}
            />
            
            {categories.map((category, index) => (
              <CategoryCard
                key={category.id}
                category={category}
                IconComponent={getCategoryIcon(category.name)}
                index={index + 1}
                isSelected={selectedCategory === category.id}
                onSelect={() => onCategorySelect && onCategorySelect(category.id)}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function CategoryCard({ category, IconComponent, index, isSelected, onSelect }) {
  const colors = [
    'bg-amber-100 hover:bg-amber-200 text-amber-700 border-amber-200',
    'bg-orange-100 hover:bg-orange-200 text-orange-700 border-orange-200',
    'bg-red-100 hover:bg-red-200 text-red-700 border-red-200',
    'bg-pink-100 hover:bg-pink-200 text-pink-700 border-pink-200',
    'bg-purple-100 hover:bg-purple-200 text-purple-700 border-purple-200',
    'bg-indigo-100 hover:bg-indigo-200 text-indigo-700 border-indigo-200',
    'bg-blue-100 hover:bg-blue-200 text-blue-700 border-blue-200',
    'bg-green-100 hover:bg-green-200 text-green-700 border-green-200'
  ];

  const colorClass = colors[index % colors.length];
  const selectedClass = 'bg-amber-500 hover:bg-amber-600 text-white border-amber-500';

  return (
    <button
      onClick={onSelect}
      className="flex-shrink-0 group focus:outline-none focus:ring-2 focus:ring-amber-300 rounded-xl"
    >
      <div className={cn(
        'flex flex-col items-center p-3 rounded-xl transition-all duration-200 min-w-[80px] border',
        'shadow-sm hover:shadow-md transform hover:-translate-y-1',
        isSelected ? selectedClass : colorClass
      )}>
        <div className="mb-2 group-hover:scale-110 transition-transform duration-200">
          <IconComponent className="h-6 w-6" />
        </div>
        
        <span className="text-xs font-medium text-center leading-tight max-w-[70px] truncate">
          {category.name}
        </span>
      </div>
    </button>
  );
}