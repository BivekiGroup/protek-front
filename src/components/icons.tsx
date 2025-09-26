import React from "react";

type IconProps = React.SVGProps<SVGSVGElement> & { size?: number };

const createIcon = (paths: React.ReactNode) =>
  ({ size = 16, strokeWidth = 2, ...rest }: IconProps) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...rest}
    >
      {paths}
    </svg>
  );

export const ChevronsUpDown = createIcon(
  <>
    <polyline points="7 15 12 20 17 15" />
    <polyline points="7 9 12 4 17 9" />
  </>
);

export const ChevronUp = createIcon(<polyline points="6 15 12 9 18 15" />);

export const ChevronDown = createIcon(<polyline points="6 9 12 15 18 9" />);

export const Sparkles = createIcon(
  <>
    <path d="M12 3l1.4 3.6L17 8l-3.6 1.4L12 13l-1.4-3.6L7 8l3.6-1.4L12 3z" />
    <path d="M5 16l.8 2 .8-2 .8-2 .8 2 .8 2 .8-2" />
    <path d="M16 16l.6 1.5L18 18l-1.4.5L16 20l-.6-1.5L14 18l1.4-.5L16 16z" />
  </>
);
