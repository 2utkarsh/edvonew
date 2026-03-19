import MarketingPage from "@/components/marketing/MarketingPageHomePalette";
import { getPublicPageConfig } from "@/lib/public-pages";

export default function FaqPage() {
  return <MarketingPage config={getPublicPageConfig("faq")} />;
}
