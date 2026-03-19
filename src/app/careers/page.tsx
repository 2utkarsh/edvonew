import MarketingPage from "@/components/marketing/MarketingPageHomePalette";
import { getPublicPageConfig } from "@/lib/public-pages";

export default function CareersPage() {
  return <MarketingPage config={getPublicPageConfig("careers")} />;
}
