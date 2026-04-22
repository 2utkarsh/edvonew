import PolicyEssayPage from "@/components/marketing/PolicyEssayPage";
import { policyPageContent } from "@/lib/policy-pages";

export default function StaticPublicTermsPage() {
  return <PolicyEssayPage content={policyPageContent.terms} />;
}
