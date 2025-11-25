import { Card } from "@/components/ui/card";
import { MapPin } from "lucide-react";

interface MapViewProps {
    address: string;
    lat?: number;
    lng?: number;
}

export const MapView = ({ address, lat = 37.7749, lng = -122.4194 }: MapViewProps) => {
    return (
        <Card className="overflow-hidden">
            <div className="relative h-[400px] bg-muted">
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center space-y-2">
                        <MapPin className="h-12 w-12 text-primary mx-auto" />
                        <p className="text-sm font-medium text-foreground">{address}</p>
                        <p className="text-xs text-muted-foreground">
                            Map visualization ({lat.toFixed(4)}, {lng.toFixed(4)})
                        </p>
                    </div>
                </div>
            </div>
        </Card>
    );
};
