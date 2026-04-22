import MarketingPage from "@/components/marketing/MarketingPageHomePalette";
import { getPublicPageConfig } from "@/lib/public-pages";

export default function RefundCancellationPolicyPage() {
  return <MarketingPage config={getPublicPageConfig("refund-cancellation-policy")} />;
}
