import { useState, useEffect } from "react";
import { PageLayout, PageHeader, SectionLabel } from "@/components/ui/Shared";
import { API_URL } from "@/lib/api";

export default function HomeScreen({ onCitySelect }: { onCitySelect: (city: any) => void }) {
  const [cities, setCities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/cities`)
      .then(res => res.json())
      .then(data => {
        setCities(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <PageLayout>
      <PageHeader
        icon="🗺️"
        title="Where to?"
        sub="A community guide to India's best spots"
      />

      {loading ? (
        <div className="text-[13px] text-[#71717a] py-4">Loading cities...</div>
      ) : (
        <>
          <SectionLabel>Cities</SectionLabel>
          <div className="space-y-1 mb-8">
            {cities.map(city => (
              <div
                key={city.id}
                onClick={() => onCitySelect(city)}
                className="flex items-center justify-between p-2 rounded-md hover:bg-[#1a1a1a] cursor-pointer transition-colors -mx-2"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="text-[16px] w-[20px] text-center flex-shrink-0">{city.icon || '📍'}</div>
                  <div className="text-[14px] text-[white] flex-1">{city.name}</div>
                  <div className="text-[13px] text-[#71717a]">{city._count?.spots || 0} spots</div>
                </div>
                <div className="text-[12px] text-[#71717a] ml-3">→</div>
              </div>
            ))}
          </div>
        </>
      )}
    </PageLayout>
  );
}