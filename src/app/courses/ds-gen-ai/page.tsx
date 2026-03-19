import MarketingPage from "@/components/marketing/MarketingPageHomePalette";
import { getPublicPageConfig } from "@/lib/public-pages";

export default function FeaturedCoursePage() {
  return <MarketingPage config={getPublicPageConfig("courses-ds-gen-ai")} />;
}
