/**
 * PhaseIndicator Component
 * مكون لعرض المرحلة الحالية في Pipeline بدلاً من TypingIndicator
 */

import { motion, AnimatePresence } from "framer-motion";
import { 
  Bot, 
  Lightbulb, 
  Brain, 
  Database, 
  BookOpen, 
  Palette,
  Hammer,
  CheckCircle2,
  AlertCircle,
  Loader2
} from "lucide-react";
import { PHASES, PHASE_LABELS, PHASE_DESCRIPTIONS } from "../services/aiPipeline";

// Phase icons mapping
const PHASE_ICONS = {
  [PHASES.IDLE]: Loader2,
  [PHASES.PLANNING]: Lightbulb,
  [PHASES.THINKING]: Brain,
  [PHASES.DATA_FETCHING]: Database,
  [PHASES.READING]: BookOpen,
  [PHASES.VISUALIZATION]: Palette,
  [PHASES.BUILDING]: Hammer,
  [PHASES.COMPLETE]: CheckCircle2,
  [PHASES.ERROR]: AlertCircle
};

// Phase colors
const PHASE_COLORS = {
  [PHASES.IDLE]: 'text-muted-foreground',
  [PHASES.PLANNING]: 'text-yellow-500',
  [PHASES.THINKING]: 'text-purple-500',
  [PHASES.DATA_FETCHING]: 'text-blue-500',
  [PHASES.READING]: 'text-green-500',
  [PHASES.VISUALIZATION]: 'text-pink-500',
  [PHASES.BUILDING]: 'text-orange-500',
  [PHASES.COMPLETE]: 'text-emerald-500',
  [PHASES.ERROR]: 'text-red-500'
};

// Phase background colors
const PHASE_BG_COLORS = {
  [PHASES.IDLE]: 'bg-muted/20',
  [PHASES.PLANNING]: 'bg-yellow-500/10',
  [PHASES.THINKING]: 'bg-purple-500/10',
  [PHASES.DATA_FETCHING]: 'bg-blue-500/10',
  [PHASES.READING]: 'bg-green-500/10',
  [PHASES.VISUALIZATION]: 'bg-pink-500/10',
  [PHASES.BUILDING]: 'bg-orange-500/10',
  [PHASES.COMPLETE]: 'bg-emerald-500/10',
  [PHASES.ERROR]: 'bg-red-500/10'
};

// Progress percentage for each phase
const PHASE_PROGRESS = {
  [PHASES.IDLE]: 0,
  [PHASES.PLANNING]: 16,
  [PHASES.THINKING]: 33,
  [PHASES.DATA_FETCHING]: 50,
  [PHASES.READING]: 66,
  [PHASES.VISUALIZATION]: 83,
  [PHASES.BUILDING]: 95,
  [PHASES.COMPLETE]: 100,
  [PHASES.ERROR]: 0
};

/**
 * Main Phase Indicator Component
 */
export default function PhaseIndicator({ phase = PHASES.IDLE, showDescription = true }) {
  const Icon = PHASE_ICONS[phase] || Loader2;
  const label = PHASE_LABELS[phase] || 'جاري التحميل...';
  const description = PHASE_DESCRIPTIONS[phase] || '';
  const colorClass = PHASE_COLORS[phase];
  const bgColorClass = PHASE_BG_COLORS[phase];
  const progress = PHASE_PROGRESS[phase];

  return (
    <motion.div 
      className="flex gap-2 sm:gap-3 mb-3 sm:mb-4"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
    >
      {/* Avatar */}
      <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20 text-primary">
        <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
      </div>

      {/* Phase Card */}
      <motion.div 
        className={`
          rounded-2xl rounded-tl-md px-3 py-2.5 sm:px-4 sm:py-3 shadow-sm
          border border-border/60 ${bgColorClass}
          min-w-[200px] max-w-[300px]
        `}
        layoutId="phase-indicator"
      >
        {/* Phase Header */}
        <div className="flex items-center gap-2 mb-2">
          <motion.div
            animate={{ 
              rotate: phase !== PHASES.COMPLETE && phase !== PHASES.ERROR ? [0, 360] : 0 
            }}
            transition={{ 
              duration: 2, 
              repeat: phase !== PHASES.COMPLETE && phase !== PHASES.ERROR ? Infinity : 0,
              ease: "linear" 
            }}
          >
            <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${colorClass}`} />
          </motion.div>
          
          <span className={`text-sm sm:text-base font-medium ${colorClass}`}>
            {label}
          </span>
        </div>

        {/* Description */}
        <AnimatePresence mode="wait">
          {showDescription && description && (
            <motion.p
              key={phase}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="text-[11px] sm:text-xs text-muted-foreground mb-2"
            >
              {description}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-muted/30 rounded-full overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${colorClass.replace('text-', 'bg-')}`}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>

        {/* Phase Steps */}
        <div className="flex justify-between mt-2">
          {Object.values(PHASES).slice(1, 7).map((p, idx) => {
            const StepIcon = PHASE_ICONS[p];
            const isActive = phase === p;
            const isPast = PHASE_PROGRESS[phase] > PHASE_PROGRESS[p];
            
            return (
              <motion.div
                key={p}
                className={`
                  w-5 h-5 rounded-full flex items-center justify-center
                  ${isActive ? PHASE_BG_COLORS[p] : isPast ? 'bg-emerald-500/20' : 'bg-muted/20'}
                  ${isActive ? PHASE_COLORS[p] : isPast ? 'text-emerald-500' : 'text-muted-foreground/50'}
                `}
                animate={isActive ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 0.5, repeat: isActive ? Infinity : 0 }}
              >
                <StepIcon className="w-3 h-3" />
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
}

/**
 * Compact Phase Indicator for inline use
 */
export function CompactPhaseIndicator({ phase = PHASES.IDLE }) {
  const Icon = PHASE_ICONS[phase] || Loader2;
  const label = PHASE_LABELS[phase] || 'جاري التحميل...';
  const colorClass = PHASE_COLORS[phase];

  return (
    <motion.div 
      className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-muted/30"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <motion.div
        animate={{ 
          rotate: phase !== PHASES.COMPLETE && phase !== PHASES.ERROR ? [0, 360] : 0 
        }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      >
        <Icon className={`w-3 h-3 ${colorClass}`} />
      </motion.div>
      <span className={`text-[10px] sm:text-xs ${colorClass}`}>
        {label}
      </span>
    </motion.div>
  );
}

/**
 * Phase Timeline - shows all phases with current highlighted
 */
export function PhaseTimeline({ currentPhase = PHASES.IDLE }) {
  const phases = [
    PHASES.PLANNING,
    PHASES.THINKING,
    PHASES.DATA_FETCHING,
    PHASES.READING,
    PHASES.VISUALIZATION,
    PHASES.BUILDING
  ];

  return (
    <div className="flex items-center justify-center gap-1 py-2">
      {phases.map((phase, idx) => {
        const Icon = PHASE_ICONS[phase];
        const isActive = currentPhase === phase;
        const isPast = PHASE_PROGRESS[currentPhase] > PHASE_PROGRESS[phase];
        const isFuture = PHASE_PROGRESS[currentPhase] < PHASE_PROGRESS[phase];

        return (
          <div key={phase} className="flex items-center">
            <motion.div
              className={`
                w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center
                transition-all duration-300
                ${isActive ? `${PHASE_BG_COLORS[phase]} ${PHASE_COLORS[phase]} ring-2 ring-current` : ''}
                ${isPast ? 'bg-emerald-500/20 text-emerald-500' : ''}
                ${isFuture ? 'bg-muted/20 text-muted-foreground/40' : ''}
              `}
              animate={isActive ? { scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 0.8, repeat: isActive ? Infinity : 0 }}
              title={PHASE_LABELS[phase]}
            >
              <Icon className="w-3 h-3 sm:w-4 sm:h-4" />
            </motion.div>
            
            {idx < phases.length - 1 && (
              <div className={`
                w-4 sm:w-6 h-0.5 mx-0.5
                ${isPast ? 'bg-emerald-500' : 'bg-muted/30'}
              `} />
            )}
          </div>
        );
      })}
    </div>
  );
}
