import MarketingPage from "@/components/marketing/MarketingPageHomePalette";
import { getPublicPageConfig } from "@/lib/public-pages";

export default function ShippingDeliveryPolicyPage() {
  return <MarketingPage config={getPublicPageConfig("shipping-delivery-policy")} />;
}
