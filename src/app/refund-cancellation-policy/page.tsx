import PolicyEssayPage from "@/components/marketing/PolicyEssayPage";
import { policyPageContent } from "@/lib/policy-pages";

export default function RefundCancellationPolicyPage() {
  return <PolicyEssayPage content={policyPageContent["refund-cancellation-policy"]} />;
}
