import MarketingPage from "@/components/marketing/MarketingPageHomePalette";
import { getPublicPageConfig } from "@/lib/public-pages";

export default function ResourcesPage() {
  return <MarketingPage config={getPublicPageConfig("resources")} />;
}
