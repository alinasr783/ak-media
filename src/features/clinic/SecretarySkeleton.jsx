import {SkeletonLine} from "../../components/ui/skeleton";

export default function SecretarySkeleton() {
  return (
    <div className="flex items-center justify-between p-4 border border-border rounded-lg">
      <div className="space-y-2">
        <SkeletonLine className="h-4 w-32" />
        <SkeletonLine className="h-4 w-24" />
      </div>
      <SkeletonLine className="h-10 w-24" />
    </div>
  );
}
