import Image from "next/image"
import { cn } from "@/lib/utils"

interface AppLogoProps {
  className?: string
  priority?: boolean
}

export function AppLogo({ className, priority = false }: AppLogoProps) {
  return (
    <Image
      src="/Applogo.png"
      alt="Glodist"
      width={420}
      height={136}
      priority={priority}
      className={cn("h-auto w-auto object-contain", className)}
    />
  )
}
