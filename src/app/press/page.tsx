import MarketingPage from "@/components/marketing/MarketingPageHomePalette";
import { getPublicPageConfig } from "@/lib/public-pages";

export default function PressPage() {
  return <MarketingPage config={getPublicPageConfig("press")} />;
}
