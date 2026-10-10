import type { ComponentProps } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
const shape = "h-10 gap-2 rounded-full px-5 font-medium shadow-sm disabled:shadow-none motion-reduce:transition-none";
export function finderButtonVariants(options: Parameters<typeof buttonVariants>[0] = {}) {
  return cn(buttonVariants(options), shape);
}
export function FinderButton({className, ...props}: ComponentProps<typeof Button>) {
  return <Button {...props} className={cn(shape, className)} />;
}
