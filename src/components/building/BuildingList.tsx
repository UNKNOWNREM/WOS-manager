import { useRef, useEffect, useCallback } from 'react';
import { Building } from '../../types/Building';
import BuildingCard from './BuildingCard';

interface BuildingListProps {
    buildings: Building[];
    selectedId: string | null;
    onSelect: (id: string) => void;
    onUpdate: (id: string, updates: Partial<Building>) => void;
    zoom: number;
}

/**
 * Building List Container Component
 * Displays scrollable list of building cards with virtual scrolling potential
 */
export default function BuildingList({
    buildings,
    selectedId,
    onSelect,
    onUpdate,
    zoom,
}: BuildingListProps) {
    const listRef = useRef<HTMLDivElement>(null);
    const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());

    // Scroll to selected building when selectedId changes externally
    useEffect(() => {
        if (selectedId && cardRefs.current.has(selectedId)) {
            const cardElement = cardRefs.current.get(selectedId);
            cardElement?.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
            });
        }
    }, [selectedId]);

    // Register card ref
    const registerCardRef = useCallback((id: string, element: HTMLDivElement | null) => {
        if (element) {
            cardRefs.current.set(id, element);
        } else {
            cardRefs.current.delete(id);
        }
    }, []);

    if (buildings.length === 0) {
        return (
            <div className="flex items-center justify-center h-full text-gray-400">
                <p>No buildings found</p>
            </div>
        );
    }

    return (
        <div
            ref={listRef}
            className="h-full overflow-y-auto p-3 space-y-2"
            style={{
                fontSize: `${zoom}rem`,
            }}
        >
            {buildings.map((building) => (
                <BuildingCard
                    key={building.id}
                    building={building}
                    isSelected={selectedId === building.id}
                    onSelect={() => onSelect(building.id)}
                    onUpdate={(updates) => onUpdate(building.id, updates)}
                    zoom={zoom}
                    ref={(el) => registerCardRef(building.id, el)}
                />
            ))}
        </div>
    );
}
