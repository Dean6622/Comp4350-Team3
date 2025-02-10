import {ClassValue, clsx} from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * cn() Used to merge multiple Tailwind CSS class names and automatically remove duplicate classes.
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}