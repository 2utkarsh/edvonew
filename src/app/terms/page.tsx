import MarketingPage from "@/components/marketing/MarketingPageHomePalette";
import { getPublicPageConfig } from "@/lib/public-pages";

export default function TermsPage() {
  return <MarketingPage config={getPublicPageConfig("terms")} />;
}
