import MarketingPage from "@/components/marketing/MarketingPageHomePalette";
import { getPublicPageConfig } from "@/lib/public-pages";

export default function MerchantInformationPage() {
  return <MarketingPage config={getPublicPageConfig("merchant-information")} />;
}
