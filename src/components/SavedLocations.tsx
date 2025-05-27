import { MapPin } from 'lucide-react';

interface SavedLocation {
    id: number;
    user_id: string;
    city: string;
    country: string;
    created_at: string;
}

interface SavedLocationsProps {
    locations: SavedLocation[];
    onLocationSelect: (city: string) => void;
}

export function SavedLocations({ locations, onLocationSelect }: SavedLocationsProps) {
    if (!locations || locations.length === 0) {
        return null;
    }

    return (
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50">
            <h3 className="text-xl font-semibold mb-6 text-slate-300">Saved Locations</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {locations.map((location) => (
                    <button
                        key={location.id}
                        onClick={() => onLocationSelect(location.city)}
                        className="bg-slate-700/30 rounded-xl p-4 text-left hover:bg-slate-700/50 transition-colors duration-200 group"
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <MapPin className="w-4 h-4 text-blue-400" />
                            <p className="font-medium text-white group-hover:text-blue-400 transition-colors duration-200">
                                {location.city}
                            </p>
                        </div>
                        <p className="text-sm text-slate-400">{location.country}</p>
                    </button>
                ))}
            </div>
        </div>
    );
} 