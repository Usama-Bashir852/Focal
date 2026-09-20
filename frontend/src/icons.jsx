// Small hand-built line-icon set, one consistent stroke weight, no icon
// library. Keeps the visual language specific to this app instead of the
// generic icon-pack look.

const base = {
  width: 22,
  height: 22,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

export function IconBoard(props) {
  return (
    <svg {...base} {...props}>
      <rect x="3" y="4" width="18" height="13" rx="1.5" />
      <path d="M8 21h8M12 17v4M7 9l3 3 2-2 4 4" />
    </svg>
  );
}

export function IconChat(props) {
  return (
    <svg {...base} {...props}>
      <path d="M4 5.5h16v10H9l-4 3.5v-3.5H4z" />
      <path d="M8 9.5h8M8 12.5h5" />
    </svg>
  );
}

export function IconVideo(props) {
  return (
    <svg {...base} {...props}>
      <rect x="3" y="6" width="12" height="12" rx="1.5" />
      <path d="M15 10.5l6-3v9l-6-3z" />
    </svg>
  );
}

export function IconBot(props) {
  return (
    <svg {...base} {...props}>
      <rect x="5" y="8" width="14" height="10" rx="2" />
      <path d="M12 8V4M9 4h6" />
      <circle cx="9.5" cy="13" r="1" fill="currentColor" stroke="none" />
      <circle cx="14.5" cy="13" r="1" fill="currentColor" stroke="none" />
      <path d="M2 13h3M19 13h3" />
    </svg>
  );
}

export function IconTimer(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="13" r="8" />
      <path d="M12 9v4l3 2M10 2h4" />
    </svg>
  );
}

export function IconKey(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="8" cy="15" r="4" />
      <path d="M11 12l9-9M17 6l2 2M14 9l2 2" />
    </svg>
  );
}

export function IconLogout(props) {
  return (
    <svg {...base} {...props}>
      <path d="M9 4H5a1 1 0 00-1 1v14a1 1 0 001 1h4" />
      <path d="M15 16l4-4-4-4M19 12H9" />
    </svg>
  );
}

export function IconPlus(props) {
  return (
    <svg {...base} {...props}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function IconRoom(props) {
  return (
    <svg {...base} {...props}>
      <path d="M4 21V9l8-5 8 5v12" />
      <path d="M9 21v-6h6v6" />
    </svg>
  );
}

export function IconCopy(props) {
  return (
    <svg {...base} {...props}>
      <rect x="9" y="9" width="11" height="11" rx="1.5" />
      <path d="M5 15H4a1 1 0 01-1-1V4a1 1 0 011-1h10a1 1 0 011 1v1" />
    </svg>
  );
}
