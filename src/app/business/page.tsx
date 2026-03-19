import MarketingPage from "@/components/marketing/MarketingPageHomePalette";
import { getPublicPageConfig } from "@/lib/public-pages";

export default function BusinessPage() {
  return <MarketingPage config={getPublicPageConfig("business")} />;
}
