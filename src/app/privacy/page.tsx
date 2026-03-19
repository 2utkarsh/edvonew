import MarketingPage from "@/components/marketing/MarketingPageHomePalette";
import { getPublicPageConfig } from "@/lib/public-pages";

export default function PrivacyPage() {
  return <MarketingPage config={getPublicPageConfig("privacy")} />;
}
