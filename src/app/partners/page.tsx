import MarketingPage from "@/components/marketing/MarketingPageHomePalette";
import { getPublicPageConfig } from "@/lib/public-pages";

export default function PartnersPage() {
  return <MarketingPage config={getPublicPageConfig("partners")} />;
}
