import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "./ui/alert-dialog";

interface RestaurantSwitchDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  currentRestaurant: string;
  newRestaurant: string;
  itemCount: number;
}

export function RestaurantSwitchDialog({ 
  isOpen, 
  onClose, 
  onConfirm, 
  currentRestaurant, 
  newRestaurant, 
  itemCount 
}: RestaurantSwitchDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-destructive">
            Switch Restaurant?
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>
              You currently have <span className="font-medium">{itemCount}</span> {itemCount === 1 ? 'item' : 'items'} 
              from <span className="font-medium">{currentRestaurant}</span> in your cart.
            </p>
            <p>
              To order from <span className="font-medium">{newRestaurant}</span>, 
              we'll need to clear your current cart since FrontDash only allows ordering from one restaurant at a time.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm}
            className="bg-destructive hover:bg-destructive/90"
          >
            Clear Cart & Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}