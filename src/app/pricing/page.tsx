import MarketingPage from "@/components/marketing/MarketingPageHomePalette";
import { getPublicPageConfig } from "@/lib/public-pages";

export default function PricingPage() {
  return <MarketingPage config={getPublicPageConfig("pricing")} />;
}
