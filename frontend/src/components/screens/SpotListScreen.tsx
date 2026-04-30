import { useState, useMemo, useEffect } from "react";
import { PageLayout, PageHeader, Breadcrumb, Chip } from "@/components/ui/Shared";
import { API_URL } from "@/lib/api";

interface Props {
  city: any;
  category: any;
  onBack: () => void;
  onSpotSelect: (spot: any) => void;
  onAddSpot: () => void;
}

export default function SpotListScreen({ city, category, onBack, onSpotSelect, onAddSpot }: Props) {
  const [activeFilter, setActiveFilter] = useState("all");
  const [spots, setSpots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!city?.id || !category?.id) return;
    fetch(`${API_URL}/api/spots?cityId=${city.id}&categoryId=${category.id}`)
      .then(res => res.json())
      .then(data => {
        setSpots(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [city, category]);

  const filters = useMemo(() => {
    const areas = new Set(spots.map(s => s.area));
    return ["all", ...Array.from(areas)];
  }, [spots]);

  const filteredSpots = spots.filter(s => activeFilter === "all" || s.area === activeFilter);

  return (
    <PageLayout>
      <Breadcrumb items={[
        { label: "where to?", onClick: () => { /* need global routing ideally, but let's just go back to S2 for now or call root */ } },
        { label: city?.name.toLowerCase(), onClick: onBack },
        { label: category?.name.toLowerCase() }
      ]} />

      <PageHeader
        icon={category?.icon}
        title={category?.name}
        sub={`${filteredSpots.length} spots · ${city?.name}`}
      />

      {loading ? (
        <div className="text-[13px] text-[#71717a] py-4">Loading spots...</div>
      ) : (
        <>
          <div className="flex flex-wrap gap-1.5 mb-5 border-b border-[#2a2a2a] pb-4">
            {filters.map(f => (
              <button
                key={f as string}
                onClick={() => setActiveFilter(f as string)}
                className={`px-2.5 py-1 text-[13px] rounded-md border transition-colors ${activeFilter === f
                    ? 'bg-[#1a1a1a] text-[white] border-[#52525b]'
                    : 'bg-[#0a0a0a] text-[#a1a1aa] border-[#2a2a2a] hover:bg-[#1a1a1a]'
                  }`}
              >
                {f === "all" ? "All" : f as string}
              </button>
            ))}
          </div>

          <div className="space-y-1">
            {filteredSpots.map((spot, i) => (
              <div
                key={spot.id || i}
                onClick={() => onSpotSelect(spot)}
                className="flex items-start gap-2.5 p-2 rounded-md hover:bg-[#1a1a1a] cursor-pointer transition-colors -mx-2"
              >
                <div className="text-[14px] w-[20px] pt-[1px] text-center text-[#71717a] flex-shrink-0">
                  {spot.verified ? '✓' : '○'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[14px] text-[white]">{spot.name}</div>
                  <div className="text-[12px] text-[#71717a] mt-[1px]">{spot.area}</div>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {spot.tags?.slice(0, 3).map((tag: string) => (
                      <Chip key={tag} size="sm">{tag}</Chip>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <div className="text-[12px] text-[#71717a]">▲ {spot.votes || 0}</div>
                  {!spot.verified && <Chip size="sm">unverified</Chip>}
                </div>
              </div>
            ))}
          </div>

          <div
            onClick={onAddSpot}
            className="flex items-center justify-center gap-2 p-1.5 mt-2 rounded-md cursor-pointer text-[#71717a] text-[14px] hover:bg-[#1a1a1a] hover:text-[#a1a1aa] transition-colors -mx-2"
          >
            <span>+</span><span>Add a spot</span>
          </div>
        </>
      )}
    </PageLayout>
  );
}