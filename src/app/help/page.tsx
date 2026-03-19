import MarketingPage from "@/components/marketing/MarketingPageHomePalette";
import { getPublicPageConfig } from "@/lib/public-pages";

export default function HelpPage() {
  return <MarketingPage config={getPublicPageConfig("help")} />;
}
