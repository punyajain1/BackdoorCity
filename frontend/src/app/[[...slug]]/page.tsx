import { Metadata } from 'next';
import AppContainer from "@/components/screens/AppContainer";
import { API_URL } from "@/lib/api";

const toSlug = (str: string) => str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

export async function generateMetadata({ params }: { params: Promise<{ slug?: string[] }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://backdoorcity-1.onrender.com'; // Fallback to your production URL

  const defaultMeta: Metadata = {
    title: "BackdoorCity",
    description: "India's underground city guide.",
    metadataBase: new URL(baseUrl),
    openGraph: {
      title: "BackdoorCity",
      description: "India's underground city guide.",
      images: ['/api/og'],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: "BackdoorCity",
      description: "India's underground city guide.",
      images: ['/api/og'],
    }
  };

  if (!slug || slug.length < 3) {
    return defaultMeta;
  }

  try {
    const [citiesRes, catsRes] = await Promise.all([
      fetch(`${API_URL}/api/cities`),
      fetch(`${API_URL}/api/categories`)
    ]);

    if (!citiesRes.ok || !catsRes.ok) return defaultMeta;

    const cities = await citiesRes.json();
    const categories = await catsRes.json();

    const city = cities.find((c: any) => toSlug(c.name) === slug[0]);
    const category = categories.find((c: any) => toSlug(c.name) === slug[1]);

    if (!city || !category) return defaultMeta;

    const spotsRes = await fetch(`${API_URL}/api/spots?cityId=${city.id}&categoryId=${category.id}`);
    if (!spotsRes.ok) return defaultMeta;

    const spots = await spotsRes.json();
    const spot = spots.find((s: any) => toSlug(s.name) === slug[2]);

    if (!spot) return defaultMeta;

    const searchParams = new URLSearchParams();
    searchParams.set('title', spot.name);
    searchParams.set('area', spot.area);
    searchParams.set('category', category.name);
    searchParams.set('city', city.name);

    const imageUrl = `/api/og?${searchParams.toString()}`;

    return {
      title: `${spot.name} | BackdoorCity`,
      description: spot.description || "Discover this spot on BackdoorCity.",
      metadataBase: new URL(baseUrl),
      openGraph: {
        title: `${spot.name} | BackdoorCity`,
        description: spot.description || "Discover this spot on BackdoorCity.",
        images: [imageUrl],
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: `${spot.name} | BackdoorCity`,
        description: spot.description || "Discover this spot on BackdoorCity.",
        images: [imageUrl],
      }
    };
  } catch (e) {
    console.error("Failed to generate metadata:", e);
    return defaultMeta;
  }
}

export default async function Home({ params }: { params: Promise<{ slug?: string[] }> }) {
  const resolvedParams = await params;
  return <AppContainer slug={resolvedParams.slug} />;
}
