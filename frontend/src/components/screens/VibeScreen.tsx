import { useState, useEffect } from "react";
import { PageLayout, PageHeader, SectionLabel, Breadcrumb } from "@/components/ui/Shared";
import { API_URL } from "@/lib/api";

interface Props {
  city: any;
  onBack: () => void;
  onVibeSelect: (category: any) => void;
}

export default function VibeScreen({ city, onBack, onVibeSelect }: Props) {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/categories`)
      .then(res => res.json())
      .then(data => {
        setCategories(data);
        setLoading(false);
      })
      .catch(console.error);
  }, []);

  return (
    <PageLayout>
      <Breadcrumb items={[
        { label: "where to?", onClick: onBack },
        { label: city?.name.toLowerCase() }
      ]} />
      <PageHeader
        icon={city.icon || "🏙️"}
        title={city.name}
        sub="Real spots. Real people. No ads."
      />
      <SectionLabel>What are you planning?</SectionLabel>

      {loading ? (
        <div className="text-[13px] text-[#71717a] py-4">Loading categories...</div>
      ) : (
        <div className="space-y-1">
          {categories.map(c => {
            return (
              <div
                key={c.id}
                onClick={() => onVibeSelect(c)}
                className="flex items-center gap-3 p-2 rounded-md hover:bg-[#1a1a1a] cursor-pointer transition-colors -mx-2"
              >
                <div className="text-[16px] w-[20px] text-center flex-shrink-0">{c.icon}</div>
                <div className="text-[14px] text-[white] flex-1">{c.name}</div>
                <div className="text-[12px] text-[#71717a] ml-2">→</div>
              </div>
            );
          })}
        </div>
      )}
    </PageLayout>
  );
}