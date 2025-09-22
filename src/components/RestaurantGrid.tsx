import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { ImageWithFallback } from "./figma/ImageWithFallback";

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

const restaurants = [
  {
    id: "1",
    name: "Tony's Pizza Palace",
    image: "https://images.unsplash.com/photo-1563245738-9169ff58eccf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwaXp6YSUyMHJlc3RhdXJhbnR8ZW58MXx8fHwxNzU4MDI4NDM4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    isOpen: true,
    cuisine: "Italian"
  },
  {
    id: "2",
    name: "Burger Junction",
    image: "https://images.unsplash.com/photo-1644447381290-85358ae625cb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXJnZXIlMjByZXN0YXVyYW50fGVufDF8fHx8MTc1ODAwMDE0Mnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    isOpen: true,
    cuisine: "American"
  },
  {
    id: "3",
    name: "Sakura Sushi",
    image: "https://images.unsplash.com/photo-1696449241254-11cf7f18ce32?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdXNoaSUyMHJlc3RhdXJhbnR8ZW58MXx8fHwxNzU3OTYyOTQxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    isOpen: false,
    cuisine: "Japanese"
  },
  {
    id: "4",
    name: "Casa Mexicana",
    image: "https://images.unsplash.com/photo-1653084019129-1f2303bb5bc0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHxtZXhpY2FuJTIwcmVzdGF1cmFudHxlbnwxfHx8fDE3NTgwNTU2NjB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    isOpen: true,
    cuisine: "Mexican"
  },
  {
    id: "5",
    name: "Nonna's Kitchen",
    image: "https://images.unsplash.com/photo-1532117472055-4d0734b51f31?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpdGFsaWFuJTIwcmVzdGF1cmFudHxlbnwxfHx8fDE3NTgwNTU2NjN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    isOpen: true,
    cuisine: "Italian"
  },
  {
    id: "6",
    name: "Golden Dragon",
    image: "https://images.unsplash.com/photo-1725781747036-8071bd5497fb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGluZXNlJTIwcmVzdGF1cmFudHxlbnwxfHx8fDE3NTc5OTU5NzF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    isOpen: true,
    cuisine: "Chinese"
  }
];

export function RestaurantGrid({ onSelectRestaurant }: RestaurantGridProps) {
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