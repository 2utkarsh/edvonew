import MarketingPage from "@/components/marketing/MarketingPageHomePalette";
import { getPublicPageConfig } from "@/lib/public-pages";

export default function AboutPage() {
  return <MarketingPage config={getPublicPageConfig("about")} />;
}
