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

export const AlertCircle = createIcon(
  <>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <circle cx="12" cy="16" r="0.5" fill="currentColor" stroke="none" />
  </>
);

export const CheckCircle2 = createIcon(
  <>
    <circle cx="12" cy="12" r="10" />
    <path d="m9 12 2 2 4-4" />
  </>
);

export const Clock = createIcon(
  <>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </>
);

export const Headset = createIcon(
  <>
    <path d="M4 13v2a3 3 0 0 0 3 3h1v-6H7a7 7 0 0 1 14 0v2a3 3 0 0 1-3 3h-1v-6h1" />
    <path d="M9 19v1a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-1" />
  </>
);

export const Info = createIcon(
  <>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="10" x2="12" y2="16" />
    <circle cx="12" cy="7" r="0.5" fill="currentColor" stroke="none" />
  </>
);

export const Loader2 = createIcon(<path d="M21 12a9 9 0 1 1-9-9" />);

export const Mail = createIcon(
  <>
    <rect x="4" y="5" width="16" height="14" rx="2" />
    <polyline points="22,7 12,13 2,7" />
  </>
);

export const PackageCheck = createIcon(
  <>
    <path d="M21 7.5v9a2 2 0 0 1-1 1.73l-7 4a2 2 0 0 1-2 0l-7-4A2 2 0 0 1 3 16.5v-9a2 2 0 0 1 1-1.73l7-4a2 2 0 0 1 2 0l7 4a2 2 0 0 1 1 1.73Z" />
    <path d="M3.3 6.96 12 12l8.7-5.04" />
    <path d="m9.5 15.5 2 2 4-4" />
  </>
);

export const ArrowRight = createIcon(
  <>
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </>
);

export const LockKeyhole = createIcon(
  <>
    <rect x="3" y="11" width="18" height="10" rx="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    <circle cx="12" cy="16" r="1.5" />
  </>
);

export const PhoneCall = createIcon(
  <>
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-4.57 19.79 19.79 0 0 1-4.57-8.63A2 2 0 0 1 7.62 8h2.54a2 2 0 0 1 2 1.72c.07.55.2 1.09.38 1.6a2 2 0 0 1-.45 2.05l-.7.7a16 16 0 0 0 5.66 5.66l.7-.7a2 2 0 0 1 2.05-.45c.51.18 1.05.31 1.6.38a2 2 0 0 1 1.72 2Z" />
    <path d="M15.05 5A5 5 0 0 1 19 8.94" />
    <path d="M15.05 1A9 9 0 0 1 23 8.94" />
  </>
);
