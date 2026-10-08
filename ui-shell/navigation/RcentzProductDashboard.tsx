const tones = {
  waffi: ['#4d9b73', '#d2af58'],
  jobman: ['#7185ba', '#63a4a1'],
  'hotel-management': ['#b48b67', '#73998f'],
  'real-estate': ['#639b91', '#839fc0'],
  'rcentz-vault': ['#8880b1', '#699d91']
} as const;

function House({ x, y, accent }: { x: number; y: number; accent: string }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect width="138" height="75" rx="7" fill={accent} opacity="0.1" />
      <path
        d="M20 36 57 12 97 35V64H20Z"
        fill="var(--surface-raised)"
        stroke={accent}
        strokeWidth="1.5"
      />
      <path
        d="M11 39 57 9 107 38"
        fill="none"
        stroke={accent}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <rect
        x="50"
        y="42"
        width="15"
        height="22"
        rx="2"
        fill={accent}
        opacity="0.65"
      />
      <rect
        x="29"
        y="40"
        width="12"
        height="12"
        rx="2"
        fill={accent}
        opacity="0.25"
      />
      <rect
        x="74"
        y="40"
        width="13"
        height="12"
        rx="2"
        fill={accent}
        opacity="0.25"
      />
      <path d="M15 69H117" stroke={accent} opacity="0.3" />
    </g>
  );
}

function Label({
  x,
  y,
  children,
  strong = false
}: {
  x: number;
  y: number;
  children: React.ReactNode;
  strong?: boolean;
}) {
  return (
    <text
      x={x}
      y={y}
      fontSize={strong ? 13 : 11}
      fontWeight={strong ? 600 : 400}
      fill={strong ? 'var(--foreground)' : 'var(--muted-foreground)'}
    >
      {children}
    </text>
  );
}

export function RcentzProductDashboard({ slug }: { slug: string }) {
  const key = slug in tones ? (slug as keyof typeof tones) : 'rcentz-vault';
  const [accent, secondary] = tones[key];
  const title =
    key === 'waffi'
      ? 'My Waffi'
      : key === 'jobman'
        ? 'My career workspace'
        : key === 'hotel-management'
          ? 'Hotel operations'
          : key === 'real-estate'
            ? 'Property management'
            : 'My Rcentz account';
  const nav =
    key === 'waffi'
      ? ['Overview', 'My orders', 'Saved items', 'Support']
      : key === 'jobman'
        ? ['Overview', 'Applications', 'Saved roles', 'Profile']
        : key === 'hotel-management'
          ? ['Overview', 'Reservations', 'Rooms', 'Guests']
          : key === 'real-estate'
            ? ['Overview', 'Properties', 'Enquiries', 'Visits']
            : ['Overview', 'Products', 'Projects', 'Activity'];
  const metrics =
    key === 'waffi'
      ? [
          ['My orders', '06'],
          ['On the way', '02'],
          ['Saved finds', '12']
        ]
      : key === 'jobman'
        ? [
            ['Applications', '08'],
            ['Interviews', '02'],
            ['Saved roles', '05']
          ]
        : key === 'hotel-management'
          ? [
              ['Occupied rooms', '32 / 48'],
              ['Arrivals today', '08'],
              ['Departures', '05']
            ]
          : key === 'real-estate'
            ? [
                ['Properties', '24'],
                ['New enquiries', '07'],
                ['Viewings', '04']
              ]
            : [
                ['My products', '03'],
                ['Projects', '02'],
                ['New updates', '05']
              ];
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 560 310"
      className="block w-full overflow-hidden rounded-lg border border-border bg-background"
    >
      <rect x="0" y="0" width="560" height="36" fill="var(--surface-subtle)" />
      <circle cx="15" cy="18" r="3" fill={accent} />
      <circle cx="25" cy="18" r="3" fill={secondary} />
      <circle cx="35" cy="18" r="3" fill="var(--border-strong)" />
      <Label x={50} y={22} strong>
        {title}
      </Label>
      <rect
        x="484"
        y="10"
        width="61"
        height="17"
        rx="8"
        fill={accent}
        opacity="0.15"
      />
      <text x="495" y="22" fontSize="9" fill={accent}>
        Demo view
      </text>
      <rect
        x="0"
        y="36"
        width="104"
        height="274"
        fill="var(--surface-subtle)"
      />
      <path d="M104 36V310" stroke="var(--border)" />
      {nav.map((item, index) => (
        <g key={item}>
          {index === 0 ? (
            <rect
              x="8"
              y={52 + index * 32}
              width="87"
              height="25"
              rx="5"
              fill={accent}
              opacity="0.15"
            />
          ) : null}
          <text
            x="18"
            y={68 + index * 32}
            fontSize="11"
            fontWeight={index === 0 ? 600 : 400}
            fill={index === 0 ? accent : 'var(--muted-foreground)'}
          >
            {item}
          </text>
        </g>
      ))}
      <Label x={120} y={61} strong>
        {key === 'waffi'
          ? 'Welcome back, Ada.'
          : key === 'jobman'
            ? 'Your next opportunity.'
            : key === 'hotel-management'
              ? 'Today at the hotel.'
              : key === 'real-estate'
                ? 'Your housing portfolio.'
                : 'Everything, connected.'}
      </Label>
      <Label x={120} y={78}>
        {key === 'waffi'
          ? 'Track your shopping, deliveries and discoveries.'
          : 'A clear overview of your activity.'}
      </Label>
      {metrics.map(([label, value], index) => (
        <g key={label}>
          <rect
            x={120 + index * 142}
            y="91"
            width="132"
            height="58"
            rx="7"
            fill={index === 0 ? accent : index === 1 ? secondary : accent}
            opacity={index === 2 ? 0.07 : 0.12}
          />
          <Label x={131 + index * 142} y={111}>
            {label}
          </Label>
          <text
            x={131 + index * 142}
            y="136"
            fontSize="21"
            fontWeight="600"
            fill={index === 1 ? secondary : accent}
          >
            {value}
          </text>
        </g>
      ))}
      {key === 'real-estate' ? (
        <g>
          <Label x={120} y={170} strong>
            Featured properties
          </Label>
          <House x={120} y={180} accent={accent} />
          <House x={264} y={180} accent={secondary} />
          <House x={408} y={180} accent={accent} />
          <Label x={120} y={271}>
            Garden residence
          </Label>
          <Label x={264} y={271}>
            City apartment
          </Label>
          <Label x={408} y={271}>
            Family home
          </Label>
          <Label x={120} y={294}>
            Arrange viewings · Track enquiries · Manage listings
          </Label>
        </g>
      ) : key === 'hotel-management' ? (
        <g>
          <Label x={120} y={172} strong>
            Room availability
          </Label>
          {Array.from({ length: 12 }, (_, index) => (
            <g key={index}>
              <rect
                x={120 + (index % 6) * 44}
                y={182 + Math.floor(index / 6) * 41}
                width="36"
                height="32"
                rx="5"
                fill={index % 4 === 0 ? secondary : accent}
                opacity={index % 4 === 0 ? 0.12 : 0.28}
              />
              <text
                x={130 + (index % 6) * 44}
                y={202 + Math.floor(index / 6) * 41}
                fontSize="10"
                fill="var(--foreground)"
              >
                {101 + index}
              </text>
            </g>
          ))}
          <rect
            x="393"
            y="161"
            width="150"
            height="105"
            rx="7"
            fill="var(--surface-subtle)"
          />
          <Label x={403} y={179} strong>
            Upcoming check-ins
          </Label>
          {['Ada · 14:00', 'James · 15:30', 'Maya · 17:00'].map(
            (item, index) => (
              <Label key={item} x={403} y={203 + index * 23}>
                {item}
              </Label>
            )
          )}
          <circle cx="124" cy="288" r="3" fill={accent} />
          <Label x={134} y={292}>
            Occupied
          </Label>
          <circle cx="216" cy="288" r="3" fill={secondary} />
          <Label x={226} y={292}>
            Available
          </Label>
        </g>
      ) : key === 'waffi' ? (
        <g>
          <Label x={120} y={171} strong>
            Your latest orders
          </Label>
          {[
            ['Home essentials', 'On the way'],
            ['Everyday wardrobe', 'Delivered'],
            ['Kitchen favourites', 'Processing']
          ].map(([name, status], index) => (
            <g key={name}>
              <rect
                x="120"
                y={180 + index * 35}
                width="263"
                height="29"
                rx="5"
                fill="var(--surface-subtle)"
              />
              <rect
                x="127"
                y={187 + index * 35}
                width="15"
                height="15"
                rx="3"
                fill={index % 2 ? secondary : accent}
                opacity="0.25"
              />
              <Label x={149} y={199 + index * 35}>
                {name}
              </Label>
              <text x="297" y={199 + index * 35} fontSize="9" fill={accent}>
                {status}
              </text>
            </g>
          ))}
          <rect
            x="395"
            y="161"
            width="148"
            height="124"
            rx="7"
            fill={accent}
            opacity="0.08"
          />
          <Label x={405} y={180} strong>
            Your delivery
          </Label>
          <path
            d="M413 234C424 200 446 248 466 213S502 202 525 214"
            fill="none"
            stroke={accent}
            strokeWidth="2"
          />
          <circle cx="466" cy="213" r="4" fill={accent} />
          <Label x={405} y={265}>
            Tracking your next arrival
          </Label>
        </g>
      ) : key === 'jobman' ? (
        <g>
          <Label x={120} y={171} strong>
            Application activity
          </Label>
          {[
            ['Frontend developer', 'Interview'],
            ['Product designer', 'In review'],
            ['Operations analyst', 'Submitted']
          ].map(([role, status], index) => (
            <g key={role}>
              <rect
                x="120"
                y={180 + index * 35}
                width="277"
                height="29"
                rx="5"
                fill="var(--surface-subtle)"
              />
              <Label x={130} y={199 + index * 35}>
                {role}
              </Label>
              <text
                x="313"
                y={199 + index * 35}
                fontSize="9"
                fill={index === 0 ? secondary : accent}
              >
                {status}
              </text>
            </g>
          ))}
          <rect
            x="409"
            y="161"
            width="134"
            height="124"
            rx="7"
            fill={accent}
            opacity="0.1"
          />
          <Label x={419} y={181} strong>
            Profile readiness
          </Label>
          <circle
            cx="474"
            cy="221"
            r="26"
            fill="none"
            stroke="var(--border)"
            strokeWidth="6"
          />
          <circle
            cx="474"
            cy="221"
            r="26"
            fill="none"
            stroke={accent}
            strokeWidth="6"
            strokeDasharray="135 164"
            transform="rotate(-90 474 221)"
          />
          <text x="460" y="225" fontSize="14" fontWeight="600" fill={accent}>
            82%
          </text>
          <Label x={419} y={271}>
            Keep your skills current
          </Label>
        </g>
      ) : (
        <g>
          <Label x={120} y={171} strong>
            Your connected products
          </Label>
          {[
            ['Waffi', 'Commerce'],
            ['JobMan', 'Opportunities'],
            ['Rcentz Systems', 'Project workspace']
          ].map(([name, detail], index) => (
            <g key={name}>
              <rect
                x="120"
                y={180 + index * 35}
                width="262"
                height="29"
                rx="5"
                fill="var(--surface-subtle)"
              />
              <circle
                cx="133"
                cy={194 + index * 35}
                r="4"
                fill={index === 1 ? secondary : accent}
              />
              <Label x={146} y={198 + index * 35}>
                {name}
              </Label>
              <text
                x="254"
                y={198 + index * 35}
                fontSize="9"
                fill="var(--muted-foreground)"
              >
                {detail}
              </text>
            </g>
          ))}
          <rect
            x="395"
            y="161"
            width="148"
            height="124"
            rx="7"
            fill={accent}
            opacity="0.1"
          />
          <Label x={405} y={181} strong>
            Your account
          </Label>
          <circle cx="469" cy="215" r="16" fill={accent} opacity="0.25" />
          <path
            d="M444 249Q469 220 494 249"
            fill="none"
            stroke={accent}
            strokeWidth="3"
            strokeLinecap="round"
          />
          <Label x={415} y={270}>
            One shared identity
          </Label>
        </g>
      )}
    </svg>
  );
}
