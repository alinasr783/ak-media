import { LogOut } from "lucide-react"
import { Button } from "../../components/ui/button"
import useLogout from "./useLogout"

export default function LogoutButton() {
  const { mutate: logout, isPending } = useLogout()

  return (
    <Button
      onClick={() => logout()}
      disabled={isPending}
      variant="outline"
      className="w-full flex items-center justify-center gap-2"
    >
      <LogOut className="h-4 w-4" />
      {isPending ? "جاري تسجيل الخروج..." : "تسجيل الخروج"}
    </Button>
  )
}
