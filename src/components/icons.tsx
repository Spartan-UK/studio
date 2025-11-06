import type { SVGProps } from "react";

export function SpartanIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 2l3.5 4.5L14 10h-4l-1.5-3.5L12 2z" />
      <path d="M18 10h2v4h-2z" />
      <path d="M4 10h2v4H4z" />
      <path d="M12 10v10" />
      <path d="M12 14a4 4 0 01-4-4h8a4 4 0 01-4 4z" />
      <path d="M8 22h8" />
    </svg>
  );
}
