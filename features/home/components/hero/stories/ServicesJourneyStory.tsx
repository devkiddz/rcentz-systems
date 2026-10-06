'use client';

import {
  Bell,
  LayoutDashboard,
  Database,
  Check,
  CheckCircle2,
  FileCheck,
  MapPin,
  Code2,
  Layers3,
  ClipboardList,
  MessageSquare,
  UserRound
} from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useEffect, useRef, useState, type PointerEvent, type MouseEvent } from 'react';

const STEPS = [
  {
    label: 'Service selected',
    customer: 'We need a business application.',
    status: 'Service selected',
    notification: 'Custom application development selected.',
    icon: Layers3
  },
  {
    label: 'Brief submitted',
    customer: 'Here is how our business works.',
    status: 'Project brief received',
    notification: 'Business requirements received.',
    icon: ClipboardList
  },
  {
    label: 'Scope agreed',
    customer: 'The plan fits our needs.',
    status: 'Scope confirmed',
    notification: 'Deliverables and milestones agreed.',
    icon: FileCheck
  },
  {
    label: 'Work in progress',
    customer: 'Our application is taking shape.',
    status: 'Design and development',
    notification: 'The team is building your application.',
    icon: Code2
  },
  {
    label: 'Client review',
    customer: 'Let us review it together.',
    status: 'Ready for review',
    notification: 'Your application is ready for feedback.',
    icon: MessageSquare
  },
  {
    label: 'Delivered',
    customer: 'Ready for our team to use.',
    status: 'Project delivered',
    notification: 'Application delivered with handover.',
    icon: Check
  }
] as const;

const GATEWAYS = ['Discovery', 'Build', 'Review'] as const;
const CRYPTO_RAILS = ['UI', 'API', 'DATA'] as const;

const STEP_DURATION = 3600;
const GATEWAY_DURATION = 1050;

const ORDER = {
  id: 'RC-2048',
  product: 'Custom Business Application',
  category: 'Web application development',
  quantity: 1,
  amount: 'Defined project scope',
  destination: 'Client workspace'
} as const;

type CommerceStep = (typeof STEPS)[number];

type SharedStoryProps = {
  current: CommerceStep;
  visibleStep: number;
  visibleGatewayIndex: number;
  reduceMotion: boolean;
  checkoutExpanded: boolean;
  paymentActive: boolean;
  notificationCount: number;
};

function DigitalPanelSurface() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]">
      <div
        className={[
          'absolute inset-0',
          'opacity-60',
          'bg-[linear-gradient(to_right,var(--theme-accent-faint)_1px,transparent_1px),linear-gradient(to_bottom,var(--theme-accent-faint)_1px,transparent_1px)]',
          'bg-[size:18px_18px]'
        ].join(' ')}
      />

      <div className="absolute left-[12%] top-[20%] h-px w-[28%] bg-theme-accent/15" />
      <div className="absolute left-[40%] top-[20%] h-[22%] w-px bg-theme-accent/15" />
      <div className="absolute bottom-[20%] right-[12%] h-px w-[24%] bg-theme-accent/15" />
      <div className="absolute bottom-[20%] right-[36%] h-[18%] w-px bg-theme-accent/15" />

      <span className="absolute left-[39%] top-[18%] size-1 rounded-full bg-theme-accent/70 shadow-[0_0_8px_var(--theme-accent)]" />
      <span className="absolute bottom-[18%] right-[34%] size-1 rounded-full bg-theme-accent/55 shadow-[0_0_8px_var(--theme-accent)]" />
      <span className="absolute right-[8%] top-[9%] size-1 rounded-full border border-theme-accent/50" />
    </div>
  );
}

function ProductContent() {
  return (
    <div className="relative z-10">
      <div className="flex h-[88px] items-center justify-center rounded-xl border border-theme-accent/15 bg-theme-accent-soft">
        <Layers3 className="size-9 text-theme-accent" />
      </div>

      <p className="mt-3 text-[15px] font-semibold">{ORDER.product}</p>
      <p className="mt-1 text-[11px] text-muted">{ORDER.category}</p>

      <div className="mt-3 flex items-center justify-between">
        <span className="text-[14px] font-semibold">{ORDER.amount}</span>
        <span className="font-mono text-[10px] text-theme-accent">selected</span>
      </div>
    </div>
  );
}

function OrderEngineContent({
  current,
  checkoutExpanded,
  paymentActive
}: Pick<SharedStoryProps, 'current' | 'checkoutExpanded' | 'paymentActive'>) {
  return (
    <div className="relative z-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-xl bg-theme-accent-soft">
            <ClipboardList className="size-4 text-theme-accent" />
          </span>

          <div>
            <p className="text-[15px] font-semibold">Project {ORDER.id}</p>
            <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
              Project workspace
            </p>
          </div>
        </div>


      </div>

      <AnimatePresence>
        {checkoutExpanded ? (
          <motion.div
            initial={{ y: 8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="mt-4 grid gap-2 border-t border-border pt-3">
            <div>
              <p className="text-[13px] font-medium">{ORDER.product}</p>
              <p className="mt-1 font-mono text-[10px] text-muted">
                {ORDER.category}
              </p>
            </div>

            <p className="text-[14px] font-semibold">{ORDER.amount}</p>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {paymentActive ? (
          <motion.div
            initial={{ y: 8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="mt-3 flex items-center justify-between rounded-xl border border-theme-accent/10 bg-background/65 px-3 py-2.5">
            <div className="flex items-center gap-2">
              <FileCheck className="size-4 text-theme-accent" />
              <span className="text-[11px]">Scope approved</span>
            </div>

            <CheckCircle2 className="size-4 text-theme-accent" />
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div className="mt-4 flex items-center gap-2">
        <span className="size-2 rounded-full bg-theme-accent" />

        <AnimatePresence mode="wait">
          <motion.span
            key={current.status}
            initial={{ y: 5, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -4, opacity: 0 }}
            className="font-mono text-[10px] uppercase tracking-[0.11em] text-muted">
            {current.status}
          </motion.span>
        </AnimatePresence>
      </div>
    </div>
  );
}

function DebitCardContent() {
  return (
    <div className="relative z-10">
      <p className="text-[12px] font-semibold">Project brief</p>
      <p className="mt-2 text-[11px] leading-4 text-muted">
        One workspace for customers, team tasks and business data.
      </p>
      <div className="mt-3 flex items-center gap-2 text-theme-accent">
        <CheckCircle2 className="size-4 shrink-0" />
        <span className="text-[10px] font-medium">Requirements confirmed</span>
      </div>
    </div>
  );
}

function PaymentRoutingContent({
  visibleGatewayIndex
}: Pick<SharedStoryProps, 'visibleGatewayIndex'>) {
  return (
    <div className="relative z-10">
      <div className="flex items-center gap-2">
        <span className="flex size-8 items-center justify-center rounded-lg bg-theme-accent-soft">
          <FileCheck className="size-4 text-theme-accent" />
        </span>

        <div>
          <p className="text-[12px] font-semibold sm:text-[13px]">Delivery workflow</p>
          <p className="mt-0.5 font-mono text-[8px] uppercase tracking-[0.11em] text-muted sm:text-[9px]">
            Project stages
          </p>
        </div>
      </div>

      <div className="mt-3 rounded-xl border border-border bg-background/65 px-3 py-2.5">
        <AnimatePresence mode="wait">
          <motion.div
            key={GATEWAYS[visibleGatewayIndex]}
            initial={{ y: 5, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -5, opacity: 0 }}
            className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-theme-accent" />
            <span className="truncate text-[12px] font-semibold sm:text-[13px]">{GATEWAYS[visibleGatewayIndex]}</span>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-3 border-t border-border pt-3">
        <div className="flex items-center gap-2">
          <Database className="size-4 text-theme-accent" />
          <p className="text-[10px] font-medium sm:text-[11px]">Connected layers</p>
        </div>

        <div className="mt-2 flex flex-wrap gap-1">
          {CRYPTO_RAILS.map(rail => (
            <span
              key={rail}
              className="rounded-full border border-theme-accent/20 bg-theme-accent-soft px-2 py-1 font-mono text-[8px] font-medium text-theme-accent sm:text-[9px]">
              {rail}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function ProjectDeliveryContent({
  current,
  visibleStep
}: Pick<SharedStoryProps, 'current' | 'visibleStep'>) {
  return (
    <div className="relative z-10">
      <div className="flex flex-col items-start gap-1.5">
        <div className="flex items-center gap-2">
          <Code2 className="size-4 text-theme-accent" />

          <div>
            <p className="text-[12px] font-semibold">Project delivery</p>
            <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-muted">Project {ORDER.id}</p>
          </div>
        </div>

        <span className="font-mono text-[9px] text-theme-accent">{current.label}</span>
      </div>

      <div className="relative mt-3 h-12">
        <svg
          aria-hidden="true"
          viewBox="0 0 500 54"
          preserveAspectRatio="none"
          className="absolute inset-0 h-full w-full text-theme-accent">
          <path
            d="M10 29 C110 5 180 48 275 26 C360 8 410 38 490 18"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            strokeDasharray="3 7"
            opacity="0.28"
          />
        </svg>

        <span className="absolute left-0 top-[20px] size-3 rounded-full border-2 border-background bg-theme-accent" />

        <div className="absolute right-0 top-[2px] flex items-center gap-1.5">
          <MapPin className="size-3 text-theme-accent" />
          <span className="text-[9px] text-muted sm:text-[10px]">{ORDER.destination}</span>
        </div>

        {visibleStep >= 4 ? (
          <motion.div
            initial={{ left: '2%', top: 15 }}
            animate={{
              left: visibleStep >= 5 ? '88%' : '62%',
              top: visibleStep >= 5 ? 3 : 14
            }}
            transition={{
              duration: 1.35,
              ease: [0.22, 1, 0.36, 1]
            }}
            className="absolute z-20 flex size-8 items-center justify-center rounded-full border border-theme-accent/30 bg-background shadow-lg">
            <MessageSquare className="size-4 text-theme-accent" />
          </motion.div>
        ) : null}
      </div>
    </div>
  );
}

function MobileServicesJourneyStory({
  current,
  visibleStep,
  reduceMotion,
  notificationCount,
  onStepChange,
}: SharedStoryProps & { onStepChange: (step: number) => void }) {
  const [selectedGroup, setSelectedGroup] = useState<number | null>(null);
  const group = reduceMotion
    ? selectedGroup ?? 2
    : Math.floor(visibleStep / 2);
  const displayedStep = reduceMotion ? group * 2 + 1 : visibleStep;
  const displayed = reduceMotion ? STEPS[displayedStep] : current;

  return (
    <div className="grid h-[26rem] grid-rows-[4rem_minmax(0,1fr)_2.5rem] gap-2">
      <div className="flex min-h-0 items-center gap-3 rounded-xl border border-border bg-background px-3 py-2">
        <span className="relative flex size-8 shrink-0 items-center justify-center rounded-full bg-theme-accent-soft">
          <Bell aria-hidden="true" className="size-4 text-theme-accent" />
          <span className="absolute -right-1 -top-1 rounded-full bg-status-danger px-1 text-[9px] text-destructive-foreground">
            {reduceMotion ? displayedStep + 1 : notificationCount}
          </span>
        </span>
        <div className="min-w-0">
          <p className="text-xs font-semibold">Project {ORDER.id}</p>
          <p className="mt-0.5 text-[11px] leading-4 text-muted-foreground">
            {displayed.notification}
          </p>
        </div>
      </div>

      <div className="relative min-h-0 overflow-hidden rounded-xl border border-border bg-background">
        <DigitalPanelSurface />
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={group}
            initial={reduceMotion ? false : { opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reduceMotion ? {} : { opacity: 0, x: -16 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 z-10 flex flex-col p-4">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold">
                {['Project brief', 'Design & build', 'Review & delivery'][group]}
              </p>
              <span className="text-[10px] text-theme-accent">
                {displayed.label}
              </span>
            </div>

            <div className="relative mt-3 min-h-0 flex-1">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={displayedStep}
                  initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduceMotion ? {} : { opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                  className="absolute inset-0">
                  {group === 0 ? (
                    displayedStep === 0 ? (
                      <ProductContent />
                    ) : (
                      <div>
                        <DebitCardContent />
                        <div className="mt-4 rounded-xl bg-theme-accent-soft p-3">
                          <p className="text-xs font-medium">Business needs</p>
                          <p className="mt-2 text-[11px] leading-5 text-muted-foreground">
                            Customer workspace ? Team workflows ? Connected information
                          </p>
                        </div>
                      </div>
                    )
                  ) : group === 1 ? (
                    <div>
                      <div className="flex items-center gap-3 rounded-xl bg-theme-accent-soft p-3">
                        {displayedStep === 2
                          ? <FileCheck aria-hidden="true" className="size-6 shrink-0 text-theme-accent" />
                          : <Code2 aria-hidden="true" className="size-6 shrink-0 text-theme-accent" />}
                        <div>
                          <p className="text-xs font-semibold">
                            {displayedStep === 2 ? 'Scope approved' : 'Application taking shape'}
                          </p>
                          <p className="mt-1 text-[11px] leading-4 text-muted-foreground">
                            {displayedStep === 2
                              ? 'Clear deliverables and agreed milestones.'
                              : 'Interfaces, workflows and data connected.'}
                          </p>
                        </div>
                      </div>
                      <p className="mt-4 text-[13px] font-medium">{ORDER.product}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {CRYPTO_RAILS.map(layer => (
                          <span
                            key={layer}
                            className="rounded-full border border-border px-3 py-1 text-[10px] text-theme-accent">
                            {layer}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <ProjectDeliveryContent
                        current={displayed}
                        visibleStep={displayedStep}
                      />
                      <div className="mt-4 flex items-center gap-2 rounded-xl bg-theme-accent-soft p-3">
                        <CheckCircle2 aria-hidden="true" className="size-4 shrink-0 text-theme-accent" />
                        <p className="text-[11px] leading-4">
                          {displayedStep === 4
                            ? 'Review the application and share feedback.'
                            : 'Application delivered with team handover.'}
                        </p>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="mt-3 flex min-h-10 shrink-0 items-center gap-2 border-t border-border pt-2">
              <UserRound aria-hidden="true" className="size-4 shrink-0 text-theme-accent" />
              <p className="text-[11px] leading-4 text-muted-foreground">
                {displayed.customer}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div
        role="group"
        aria-label="Project story stages"
        className="flex items-center justify-center gap-1">
        {['Brief', 'Build', 'Delivery'].map((label, index) => (
          <button
            key={label}
            type="button"
            aria-pressed={group === index}
            onClick={() => {
              if (reduceMotion) {
                setSelectedGroup(index);
              } else {
                onStepChange(index * 2);
              }
            }}
            className="inline-flex min-h-10 items-center gap-2 rounded-full px-3 text-[11px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <span
              aria-hidden="true"
              className={[
                'rounded-full transition-all duration-300',
                group === index
                  ? 'size-2.5 bg-status-danger'
                  : 'size-1.5 bg-muted-foreground/50',
              ].join(' ')}
            />
            <span className={group === index ? 'font-medium text-foreground' : 'text-muted-foreground'}>
              {label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function DesktopServicesJourneyStory({
  current,
  visibleStep,
  visibleGatewayIndex,
  reduceMotion,
  checkoutExpanded,
  paymentActive,
  notificationCount,
  onStepChange,
}: SharedStoryProps & { onStepChange: (step: number) => void }) {
  return (
    <div className="relative min-h-[370px]">
      {/* Left lane: selection moves out; the brief takes its place. */}
      <div className="absolute left-0 top-16 w-[26%]">
        <AnimatePresence mode="wait" initial={false}>
          {!checkoutExpanded ? (
            <motion.div
              key="selection"
              initial={false}
              animate={{ x: 0, y: 0, scale: 1, opacity: 1 }}
              exit={reduceMotion ? {} : { x: 70, y: -15, scale: 0.7, opacity: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="relative overflow-hidden rounded-2xl border border-border bg-background p-3">
              <DigitalPanelSurface />
              <ProductContent />
            </motion.div>
          ) : (
            <motion.div
              key="brief"
              initial={reduceMotion ? false : { x: -16, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={reduceMotion ? {} : { opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="relative overflow-hidden rounded-2xl border border-theme-accent/25 bg-background p-3">
              <DigitalPanelSurface />
              <DebitCardContent />
              <div className="relative z-10 mt-3 border-t border-border pt-2">
                <p className="text-[11px] font-semibold">Business needs</p>
                <div className="mt-2 space-y-1.5 text-[11px] text-muted-foreground">
                  <p>Customer workspace</p>
                  <p>Team workflows</p>
                  <p>Connected information</p>
                </div>
                <div className="mt-3 flex items-start gap-2 border-t border-border pt-2">
                  <UserRound className="mt-0.5 size-3.5 shrink-0 text-theme-accent" />
                  <p className="text-[11px] leading-4">{current.customer}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Centre lane: expanded workspace never enters another lane. */}
      <motion.div
        initial={false}
        animate={{ scale: checkoutExpanded ? 1 : 0.96 }}
        transition={{ duration: 0.7 }}
        className="absolute left-[28%] top-16 w-[44%] overflow-hidden rounded-2xl border border-border bg-background p-3">
        <DigitalPanelSurface />
        <OrderEngineContent
          current={current}
          checkoutExpanded={checkoutExpanded}
          paymentActive={paymentActive}
        />
      </motion.div>

      {/* Right lane: workflow exits before delivery enters. */}
      <div className="absolute right-0 top-16 w-[26%]">
        <AnimatePresence mode="wait" initial={false}>
          {visibleStep >= 3 ? (
            <motion.div
              key="delivery"
              initial={reduceMotion ? false : { y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={reduceMotion ? {} : { y: -12, opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="relative overflow-hidden rounded-2xl border border-border bg-background p-3">
              <DigitalPanelSurface />
              <ProjectDeliveryContent current={current} visibleStep={visibleStep} />
              <div className="relative z-10 mt-3 border-t border-border pt-2">
                <p className="text-[11px] font-semibold">Delivery checkpoints</p>
                <div className="mt-2 space-y-1.5 text-[11px] text-muted-foreground">
                  <p className="flex items-center gap-2">
                    <Check className="size-3 shrink-0 text-theme-accent" />
                    Scope confirmed
                  </p>
                  <p className="flex items-center gap-2">
                    {visibleStep >= 4
                      ? <Check className="size-3 shrink-0 text-theme-accent" />
                      : <span className="size-3 shrink-0 rounded-full border border-border" />}
                    Client review
                  </p>
                  <p className="flex items-center gap-2">
                    {visibleStep >= 5
                      ? <Check className="size-3 shrink-0 text-theme-accent" />
                      : <span className="size-3 shrink-0 rounded-full border border-border" />}
                    Handover
                  </p>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="workflow"
              initial={reduceMotion ? false : { x: 16, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={reduceMotion ? {} : { y: -12, opacity: 0 }}
              transition={{ duration: 0.45 }}
              className="relative overflow-hidden rounded-2xl border border-theme-accent/20 bg-background p-3">
              <DigitalPanelSurface />
              <PaymentRoutingContent visibleGatewayIndex={visibleGatewayIndex} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Updates remain readable in a dedicated bottom bar. */}
      <div className="absolute inset-x-0 top-0 flex min-h-12 items-center gap-2 rounded-xl border border-border bg-background px-3 py-2">
        <span className="relative flex size-9 shrink-0 items-center justify-center rounded-xl bg-theme-accent-soft">
          <Bell className="size-4 text-theme-accent" />
          <span className="absolute -right-1 -top-1 rounded-full bg-status-danger px-1 text-[10px] font-semibold text-destructive-foreground">
            {notificationCount}
          </span>
        </span>

        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold">Project updates</p>
          <AnimatePresence mode="wait" initial={false}>
            <motion.p
              key={current.notification}
              initial={reduceMotion ? false : { y: 8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={reduceMotion ? {} : { y: -8, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-1 text-[11px] leading-4 text-muted-foreground">
              {current.notification}
            </motion.p>
          </AnimatePresence>
        </div>


        <div className="flex shrink-0 items-center gap-2">
          <div
            role="img"
            aria-label="Illustrated customers"
            className="hidden items-center -space-x-2 xl:flex">
            {[0, 1, 2].map(index => (
              <motion.span
                key={index}
                aria-hidden="true"
                initial={false}
                animate={
                  reduceMotion
                    ? { y: 0, scale: 1 }
                    : {
                        y: Math.floor(visibleStep / 2) === index ? -2 : 0,
                        scale: Math.floor(visibleStep / 2) === index ? 1.08 : 1,
                      }
                }
                transition={{ duration: 0.4 }}
                className={[
                  'relative flex size-7 items-center justify-center rounded-full border-2 border-background',
                  Math.floor(visibleStep / 2) === index
                    ? 'z-10 bg-foreground text-background'
                    : 'bg-surface-muted text-muted-foreground',
                ].join(' ')}>
                <UserRound className="size-3.5" />
              </motion.span>
            ))}
          </div>

          <button
            type="button"
            title="Show the project dashboard in this illustration"
            onClick={() => onStepChange(3)}
            className="inline-flex h-7 items-center gap-1.5 rounded-full border border-border px-2.5 text-[10px] font-medium hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <LayoutDashboard aria-hidden="true" className="size-3" />
            Dashboard
          </button>
        </div>

      </div>

      <div
        role="group"
        aria-label="Project stages"
        className="absolute -inset-x-2 -bottom-2 flex h-9 items-center justify-center border-t border-border bg-surface-muted">
        {['Brief', 'Build', 'Delivery'].map((label, index) => (
          <button
            key={label}
            type="button"
            title={label}
            aria-label={label}
            aria-pressed={Math.floor(visibleStep / 2) === index}
            onClick={() => onStepChange(index * 2)}
            className="flex h-8 w-5 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <span
              aria-hidden="true"
              className={[
                'rounded-full transition-all duration-300',
                Math.floor(visibleStep / 2) === index
                  ? 'size-2.5 bg-status-danger'
                  : 'size-1.5 bg-muted-foreground/50',
              ].join(' ')}
            />
          </button>
        ))}
      </div>

    </div>
  );
}

export function ServicesJourneyStory() {
  const [step, setStep] = useState(0);
  const [gatewayIndex, setGatewayIndex] = useState(0);

  const reduceMotion = Boolean(useReducedMotion());
  const [hovered, setHovered] = useState(false);
  const [held, setHeld] = useState(false);
  const paused = hovered || held;
  const stepClock = useRef({
    step: 0,
    remaining: STEP_DURATION,
  });

  useEffect(() => {
    function release() {
      setHeld(false);
    }

    function clearPause() {
      setHeld(false);
      setHovered(false);
    }

    window.addEventListener('pointerup', release);
    window.addEventListener('pointercancel', release);
    window.addEventListener('blur', clearPause);

    return () => {
      window.removeEventListener('pointerup', release);
      window.removeEventListener('pointercancel', release);
      window.removeEventListener('blur', clearPause);
    };
  }, []);

  const pauseHandlers = {
    onPointerEnter: (event: PointerEvent<HTMLDivElement>) => {
      if (event.pointerType === 'mouse') setHovered(true);
    },
    onPointerLeave: (event: PointerEvent<HTMLDivElement>) => {
      if (event.pointerType === 'mouse') setHovered(false);
    },
    onPointerDown: () => setHeld(true),
    onPointerUp: () => setHeld(false),
    onPointerCancel: () => setHeld(false),
    onContextMenu: (event: MouseEvent<HTMLDivElement>) => {
      event.preventDefault();
    },
  };

  useEffect(() => {
    if (reduceMotion) return;

    const clock = stepClock.current;

    if (clock.step !== step) {
      clock.step = step;
      clock.remaining = step === STEPS.length - 1 ? 4500 : STEP_DURATION;
    }

    if (paused) return;

    const started = performance.now();
    const timeout = window.setTimeout(() => {
      setStep(current => (current + 1) % STEPS.length);
    }, clock.remaining);

    return () => {
      window.clearTimeout(timeout);
      clock.remaining = Math.max(
        0,
        clock.remaining - (performance.now() - started)
      );
    };
  }, [step, reduceMotion, paused]);

  useEffect(() => {
    if (reduceMotion || paused || step < 2) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setGatewayIndex(current => (current + 1) % GATEWAYS.length);
    }, GATEWAY_DURATION);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [gatewayIndex, reduceMotion, step, paused]);

  const visibleStep = reduceMotion ? STEPS.length - 1 : step;
  const visibleGatewayIndex = reduceMotion ? 0 : gatewayIndex;
  const current = STEPS[visibleStep];

  const checkoutExpanded = visibleStep >= 1;
  const paymentActive = visibleStep >= 2;
  const notificationCount = visibleStep + 1;

  const storyProps: SharedStoryProps = {
    current,
    visibleStep,
    visibleGatewayIndex,
    reduceMotion,
    checkoutExpanded,
    paymentActive,
    notificationCount
  };

  return (
    <>
      <div className="select-none lg:hidden" {...pauseHandlers}>
        <MobileServicesJourneyStory {...storyProps} onStepChange={setStep} />
      </div>

      <div className="hidden select-none lg:block" {...pauseHandlers}>
        <DesktopServicesJourneyStory {...storyProps} onStepChange={setStep} />
      </div>
    </>
  );
}
