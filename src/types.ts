export type Language = 'EN' | 'DE' | 'FR' | 'ES' | 'IT';

export interface TranslationDictionary {
  title: string;
  subtitle: string;
  tagline: string;
  gdprNotice: string;
  gdprAcceptAll: string;
  gdprEssentialOnly: string;
  gdprLearnMore: string;
  privacyModalTitle: string;
  privacyModalBody1: string;
  privacyModalBody2: string;
  privacyModalBody3: string;
  close: string;
  
  // Tabs
  tabAge: string;
  tabDiff: string;
  tabDuration: string;
  
  // Age Calc Form
  birthDateLabel: string;
  birthTimeLabel: string;
  calcDateLabel: string;
  calculateBtn: string;
  
  // Age Calc Results
  exactAgeTitle: string;
  years: string;
  months: string;
  weeks: string;
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
  
  // Birthday & Stats
  nextBirthdayTitle: string;
  countdownPrefix: string;
  statsTitle: string;
  dayOfWeekBirth: string;
  westernZodiac: string;
  chineseZodiac: string;
  birthstone: string;
  approxHeartbeats: string;
  approxBreaths: string;
  approxSleep: string;
  
  // Milestone Progress
  progressTitle: string;
  progressDesc: string;
  targetMilestoneLabel: string;
  yearsLived: string;
  yearsRemaining: string;
  
  // Date Difference
  startDateLabel: string;
  endDateLabel: string;
  excludeWeekendsLabel: string;
  includeEndDateLabel: string;
  diffResultTitle: string;
  workingDaysOnly: string;
  totalCalendarDays: string;
  alternateFormats: string;
  
  // Date Duration Adder
  operationLabel: string;
  opAdd: string;
  opSubtract: string;
  addDurationTitle: string;
  resultingDateLabel: string;
  
  // SEO Sections
  aboutTitle: string;
  aboutP1: string;
  aboutP2: string;
  aboutP3: string;
  faqTitle: string;
  
  // Export Tool
  exportTitle: string;
  exportDesc: string;
  exportBtn: string;
  exportSuccessToast: string;

  // Quick Select Buttons
  quickSelectLabel: string;
  quickSelectLast30: string;
  quickSelectNext30: string;
  quickSelectSinceJan1: string;
  quickSelectToday: string;

  // PDF Export
  exportPdfBtn: string;
  pdfTitle: string;
  pdfSub: string;
  pdfGeneratedOn: string;
  pdfDetails: string;
  pdfResults: string;
  historyTitle: string;
  historySaveBtn: string;
  historyClearBtn: string;
  historyEmpty: string;
  historyClose: string;
  historyLoad: string;
  historyDelete: string;
  historySavedToast: string;
  historyLoadedToast: string;
  historyClearedToast: string;
  shareBtn: string;
  shareModalTitle: string;
  shareModalDesc: string;
  shareTwitter: string;
  shareWhatsApp: string;
  shareLinkedIn: string;
  shareCopyLink: string;
  shareCopiedToast: string;
  shareTemplateAge: string;
  shareTemplateDiff: string;
  shareTemplateDuration: string;
  printBtn: string;
  
  // Date Validation Errors
  invalidDateTitle: string;
  invalidDateDiffError: string;
  invalidAgeError: string;
  swapDatesBtn: string;
  resetDatesBtn: string;
  cannotExportInvalidError: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface HistoryItem {
  id: string;
  type: 'age' | 'diff' | 'duration';
  timestamp: string;
  summary: string;
  inputs: Record<string, string>;
  results: Record<string, string>;
}
