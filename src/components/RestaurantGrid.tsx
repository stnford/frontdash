import { useEffect, useState } from "react";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { api } from "../lib/api";

interface Restaurant {
  id: string;
  name: string;
  image: string;
  isOpen: boolean;
  cuisine: string;
}

interface RestaurantGridProps {
  onSelectRestaurant: (restaurant: Restaurant) => void;
}

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1200&q=80";

export function RestaurantGrid({ onSelectRestaurant }: RestaurantGridProps) {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.listRestaurants();
        const mapped: Restaurant[] = data.map((rest) => ({
          id: rest.restName,
          name: rest.restName,
          image: FALLBACK_IMAGE,
          isOpen: rest.isActive === "Y",
          cuisine: rest.contactName ? `Contact: ${rest.contactName}` : "Partner Restaurant"
        }));
        setRestaurants(mapped);
      } catch (err: any) {
        console.error(err);
        setError("Unable to load restaurants from the server.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return <div className="container mx-auto px-4 py-8 text-center text-muted-foreground">Loading restaurants...</div>;
  }

  if (error) {
    return <div className="container mx-auto px-4 py-8 text-center text-destructive">{error}</div>;
  }

  if (!restaurants.length) {
    return <div className="container mx-auto px-4 py-8 text-center text-muted-foreground">No restaurants available yet.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {restaurants.map((restaurant) => (
          <Card 
            key={restaurant.id} 
            className="group hover:shadow-lg transition-all duration-300 cursor-pointer border border-border bg-card/50 backdrop-blur-sm hover:bg-card"
            onClick={() => onSelectRestaurant(restaurant)}
          >
            <CardContent className="p-0">
              <div className="relative overflow-hidden rounded-t-lg">
                <ImageWithFallback 
                  src={restaurant.image}
                  alt={restaurant.name}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 right-3">
                  <Badge 
                    variant={restaurant.isOpen ? "default" : "secondary"}
                    className={restaurant.isOpen ? "bg-green-500 text-white" : "bg-gray-500 text-white"}
                  >
                    {restaurant.isOpen ? "Open" : "Closed"}
                  </Badge>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-foreground mb-1">{restaurant.name}</h3>
                <p className="text-sm text-muted-foreground">{restaurant.cuisine}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
