import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  Globe, 
  Download, 
  HelpCircle, 
  Check, 
  ShieldCheck, 
  Hourglass, 
  Briefcase, 
  ChevronDown, 
  Sparkles,
  Info,
  CalendarCheck2,
  BookmarkCheck,
  Scale,
  FileDown,
  FileText,
  History,
  Trash2,
  Save,
  Share2,
  Copy,
  Printer,
  AlertTriangle,
  ArrowLeftRight,
  Gift,
  Bell,
  Star,
  UserPlus,
  Heart,
  Plus,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { jsPDF } from 'jspdf';
import { Language, HistoryItem, BirthdayReminder } from './types';
import { TRANSLATIONS, FAQ_ITEMS } from './translations';
import { 
  calculateExactAge, 
  calculateDateDifference, 
  calculateDateDuration, 
  compileStandaloneHTML,
  calculateUpcomingBirthdayCountdown 
} from './utils';

const monthsDaysLocal = {
  EN: {
    monthsAndDaysTitle: "Months & Days Representation",
    monthsAndDaysDesc: "Specifically accounts for variable month lengths (leap years, 28/29/30/31-day months)",
    exactSpan: "Exact Span",
    and: "and"
  },
  DE: {
    monthsAndDaysTitle: "Monate & Tage Darstellung",
    monthsAndDaysDesc: "Berücksichtigt variable Monatslängen (Schaltjahre, 28/29/30/31 Tage)",
    exactSpan: "Genaue Zeitspanne",
    and: "und"
  },
  FR: {
    monthsAndDaysTitle: "Représentation en Mois & Jours",
    monthsAndDaysDesc: "Prend en compte la longueur variable des mois (années bissextiles, mois de 28/29/30/31 jours)",
    exactSpan: "Durée exacte",
    and: "et"
  },
  ES: {
    monthsAndDaysTitle: "Representación en Meses y Días",
    monthsAndDaysDesc: "Tiene en cuenta las duraciones variables de los meses (años bissextiles, meses de 28/29/30/31 días)",
    exactSpan: "Intervalo exacto",
    and: "y"
  },
  IT: {
    monthsAndDaysTitle: "Rappresentazione in Mesi e Giorni",
    monthsAndDaysDesc: "Tiene conto della lunghezza variabile dei mesi (anni bisestili, mesi di 28/29/30/31 giorni)",
    exactSpan: "Intervallo esatto",
    and: "e"
  }
};

const historyLocal = {
  EN: {
    exportCsv: "Export CSV",
    exportCsvDesc: "Export calculation history to a CSV spreadsheet file",
    exportSuccess: "History exported to CSV successfully!"
  },
  DE: {
    exportCsv: "CSV Exportieren",
    exportCsvDesc: "Berechnungshistorie in eine CSV-Datei exportieren",
    exportSuccess: "Verlauf erfolgreich in CSV exportiert!"
  },
  FR: {
    exportCsv: "Exporter en CSV",
    exportCsvDesc: "Exporter l'historique des calculs dans un fichier CSV",
    exportSuccess: "Historique exporté en CSV avec succès!"
  },
  ES: {
    exportCsv: "Exportar CSV",
    exportCsvDesc: "Exportar el historial de cálculos a un archivo CSV",
    exportSuccess: "¡Historial exportado a CSV con éxito!"
  },
  IT: {
    exportCsv: "Esporta CSV",
    exportCsvDesc: "Esporta la cronologia dei calcoli in un file CSV",
    exportSuccess: "Cronologia esportata in CSV con successo!"
  }
};

const presetsLocal = {
  EN: {
    quickPresetsTitle: "Quick Presets",
    newYearsDay: "New Year's Day",
    lastBirthday: "Last Birthday (1 Yr Ago)",
    minus18Years: "18 Years Ago (Adult)",
    presetApplied: "Preset date applied!"
  },
  DE: {
    quickPresetsTitle: "Schnell-Presets",
    newYearsDay: "Neujahrstag",
    lastBirthday: "Letzter Geburtstag (vor 1 Jahr)",
    minus18Years: "Vor 18 Jahren (Volljährig)",
    presetApplied: "Datumsvorlage angewendet!"
  },
  FR: {
    quickPresetsTitle: "Raccourcis rapides",
    newYearsDay: "Jour de l'An",
    lastBirthday: "Dernier anniversaire (-1 an)",
    minus18Years: "Il y a 18 ans (Majeur)",
    presetApplied: "Raccourci appliqué !"
  },
  ES: {
    quickPresetsTitle: "Ajustes rápidos",
    newYearsDay: "Año Nuevo",
    lastBirthday: "Último cumpleaños (-1 año)",
    minus18Years: "Hace 18 años (Adulto)",
    presetApplied: "¡Ajuste aplicado!"
  },
  IT: {
    quickPresetsTitle: "Preimpostazioni",
    newYearsDay: "Capodanno",
    lastBirthday: "Ultimo compleanno (-1 anno)",
    minus18Years: "18 anni fa (Maggiorenne)",
    presetApplied: "Preimpostazione applicata!"
  }
};

const getPresetDate = (type: 'newyear' | 'lastbirthday' | 'minus18') => {
  const base = new Date();
  const year = base.getFullYear();
  if (type === 'newyear') {
    return `${year}-01-01`;
  } else if (type === 'lastbirthday') {
    const targetDate = new Date(base);
    targetDate.setFullYear(year - 1);
    return targetDate.toISOString().split('T')[0];
  } else if (type === 'minus18') {
    const targetDate = new Date(base);
    targetDate.setFullYear(year - 18);
    return targetDate.toISOString().split('T')[0];
  }
  return '';
};

export default function App() {
  // Localization state
  const [lang, setLang] = useState<Language>('EN');
  const dict = TRANSLATIONS[lang];
  const faqs = FAQ_ITEMS[lang];
  const mLocal = monthsDaysLocal[lang] || monthsDaysLocal.EN;
  const hLocal = historyLocal[lang] || historyLocal.EN;
  const pLocal = presetsLocal[lang] || presetsLocal.EN;

  // Active Tab
  const [activeTab, setActiveTab] = useState<'age' | 'diff' | 'duration'>('age');

  // GDPR Consent states
  const [gdprDismissed, setGdprDismissed] = useState<boolean>(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState<boolean>(false);

  // Success toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Ticker for real-time calculation refresh (seconds tick)
  const [tick, setTick] = useState<number>(0);

  // --- Tab 1: Age Calculator States ---
  const [birthDate, setBirthDate] = useState<string>('1995-06-15');
  const [birthTime, setBirthTime] = useState<string>('08:30');
  const [calcDate, setCalcDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [targetMilestone, setTargetMilestone] = useState<number>(67);

  // --- Tab 2: Date Difference States ---
  const [startDate, setStartDate] = useState<string>('2026-01-01');
  const [endDate, setEndDate] = useState<string>('2026-12-31');
  const [excludeWeekends, setExcludeWeekends] = useState<boolean>(false);
  const [includeEndDate, setIncludeEndDate] = useState<boolean>(false);

  // --- Tab 3: Date Arithmetic States ---
  const [durStartDate, setDurStartDate] = useState<string>('2026-07-20');
  const [durOperation, setDurOperation] = useState<'add' | 'subtract'>('add');
  const [durYears, setDurYears] = useState<number>(1);
  const [durMonths, setDurMonths] = useState<number>(0);
  const [durWeeks, setDurWeeks] = useState<number>(0);
  const [durDays, setDurDays] = useState<number>(0);
  const [durSkipWeekends, setDurSkipWeekends] = useState<boolean>(false);

  // FAQ Expand state
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  // --- Calculation History States ---
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('smart_calc_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);

  useEffect(() => {
    localStorage.setItem('smart_calc_history', JSON.stringify(history));
  }, [history]);

  // Check if GDPR cookie consent was previously dismissed
  useEffect(() => {
    const consent = localStorage.getItem('smart_calc_gdpr_consent');
    if (consent === 'dismissed') {
      setGdprDismissed(true);
    }
  }, []);

  // --- Birthday Reminders & Countdown Widget States ---
  const defaultReminders: BirthdayReminder[] = [
    {
      id: 'rem-1',
      name: 'Mom',
      birthDate: '1968-05-15',
      note: 'Loves flowers & coffee',
      isPrimary: true,
      createdAt: new Date().toISOString()
    },
    {
      id: 'rem-2',
      name: 'Alex (Best Friend)',
      birthDate: '1995-11-08',
      note: 'Milestone birthday coming up!',
      isPrimary: false,
      createdAt: new Date().toISOString()
    }
  ];

  const [birthdayReminders, setBirthdayReminders] = useState<BirthdayReminder[]>(() => {
    try {
      const saved = localStorage.getItem('smart_age_birthday_reminders');
      return saved ? JSON.parse(saved) : defaultReminders;
    } catch {
      return defaultReminders;
    }
  });

  const [featuredReminderId, setFeaturedReminderId] = useState<string | null>(() => {
    try {
      const savedId = localStorage.getItem('smart_age_featured_reminder_id');
      return savedId || null;
    } catch {
      return null;
    }
  });

  const [addReminderModalOpen, setAddReminderModalOpen] = useState<boolean>(false);
  const [reminderName, setReminderName] = useState<string>('');
  const [reminderDate, setReminderDate] = useState<string>('');
  const [reminderNote, setReminderNote] = useState<string>('');

  useEffect(() => {
    try {
      localStorage.setItem('smart_age_birthday_reminders', JSON.stringify(birthdayReminders));
    } catch (e) {
      console.error('Failed to persist birthday reminders:', e);
    }
  }, [birthdayReminders]);

  useEffect(() => {
    if (featuredReminderId) {
      localStorage.setItem('smart_age_featured_reminder_id', featuredReminderId);
    } else {
      localStorage.removeItem('smart_age_featured_reminder_id');
    }
  }, [featuredReminderId]);

  const handleSaveBirthdayReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reminderName.trim() || !reminderDate) {
      return;
    }

    const newReminder: BirthdayReminder = {
      id: 'rem-' + Date.now(),
      name: reminderName.trim(),
      birthDate: reminderDate,
      note: reminderNote.trim() || undefined,
      isPrimary: birthdayReminders.length === 0,
      createdAt: new Date().toISOString()
    };

    setBirthdayReminders(prev => [newReminder, ...prev]);
    if (birthdayReminders.length === 0 || !featuredReminderId) {
      setFeaturedReminderId(newReminder.id);
    }

    setReminderName('');
    setReminderDate('');
    setReminderNote('');
    setAddReminderModalOpen(false);
    showToast(dict.reminderSavedToast || "Annual birthday reminder saved locally!");
  };

  const handleDeleteBirthdayReminder = (id: string) => {
    setBirthdayReminders(prev => prev.filter(r => r.id !== id));
    if (featuredReminderId === id) {
      setFeaturedReminderId(null);
    }
    showToast(dict.reminderDeletedToast || "Birthday reminder deleted!");
  };

  const handleSetPrimaryReminder = (id: string) => {
    setFeaturedReminderId(id);
    setBirthdayReminders(prev => prev.map(r => ({
      ...r,
      isPrimary: r.id === id
    })));
    showToast(dict.presetApplied || "Featured in countdown widget!");
  };

  const handleLoadReminderIntoCalc = (bDate: string) => {
    setBirthDate(bDate);
    setActiveTab('age');
    showToast(dict.historyLoadedToast || "Loaded into Age Calculator!");
  };

  const handleOpenAddReminderWithDate = (prefillDate?: string, defaultName?: string) => {
    setReminderDate(prefillDate || birthDate || new Date().toISOString().split('T')[0]);
    setReminderName(defaultName || '');
    setReminderNote('');
    setAddReminderModalOpen(false);
    setTimeout(() => {
      setAddReminderModalOpen(true);
    }, 50);
  };

  // --- Sharing States ---
  const [shareModalOpen, setShareModalOpen] = useState<boolean>(false);
  const [shareType, setShareType] = useState<'age' | 'diff' | 'duration'>('age');

  // Load shared query parameters on mount
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const urlTab = params.get('tab');
      const urlLang = params.get('lang');
      
      if (urlLang && ['EN', 'DE', 'FR', 'ES', 'IT'].includes(urlLang.toUpperCase())) {
        setLang(urlLang.toUpperCase() as Language);
      }

      if (urlTab === 'age') {
        setActiveTab('age');
        const bDate = params.get('birthDate');
        const bTime = params.get('birthTime');
        const cDate = params.get('calcDate');
        const milestone = params.get('milestone');
        
        if (bDate) setBirthDate(bDate);
        if (bTime) setBirthTime(bTime);
        if (cDate) setCalcDate(cDate);
        if (milestone) setTargetMilestone(parseInt(milestone) || 67);
      } else if (urlTab === 'diff') {
        setActiveTab('diff');
        const sDate = params.get('startDate');
        const eDate = params.get('endDate');
        const exclWe = params.get('excludeWeekends');
        const inclEnd = params.get('includeEndDate');
        
        if (sDate) setStartDate(sDate);
        if (eDate) setEndDate(eDate);
        if (exclWe) setExcludeWeekends(exclWe === 'true');
        if (inclEnd) setIncludeEndDate(inclEnd === 'true');
      } else if (urlTab === 'duration') {
        setActiveTab('duration');
        const sDate = params.get('durStartDate');
        const op = params.get('durOperation');
        const years = params.get('durYears');
        const months = params.get('durMonths');
        const weeks = params.get('durWeeks');
        const days = params.get('durDays');
        const skipWe = params.get('durSkipWeekends');
        
        if (sDate) setDurStartDate(sDate);
        if (op === 'add' || op === 'subtract') setDurOperation(op);
        if (years) setDurYears(parseInt(years) || 0);
        if (months) setDurMonths(parseInt(months) || 0);
        if (weeks) setDurWeeks(parseInt(weeks) || 0);
        if (days) setDurDays(parseInt(days) || 0);
        if (skipWe) setDurSkipWeekends(skipWe === 'true');
      }
    } catch (e) {
      console.error('Error loading shared link params:', e);
    }
  }, [lang]);

  // Helper to generate pre-filled localized share messages and links
  const generateShareData = (type: 'age' | 'diff' | 'duration') => {
    const baseUrl = window.location.origin + window.location.pathname;
    const params = new URLSearchParams();
    params.set('tab', type);
    params.set('lang', lang);
    
    let resultString = '';
    
    if (type === 'age') {
      params.set('birthDate', birthDate);
      params.set('birthTime', birthTime);
      params.set('calcDate', calcDate);
      params.set('milestone', String(targetMilestone));
      resultString = `${ageResults.years} ${dict.years.toLowerCase()}, ${ageResults.months} ${dict.months.toLowerCase()}, ${ageResults.days} ${dict.days.toLowerCase()}`;
    } else if (type === 'diff') {
      params.set('startDate', startDate);
      params.set('endDate', endDate);
      params.set('excludeWeekends', String(excludeWeekends));
      params.set('includeEndDate', String(includeEndDate));
      resultString = `${diffResults.totalDays} ${dict.totalCalendarDays.toLowerCase()} (${diffResults.workingDays} ${dict.workingDaysOnly.split('(')[0].trim().toLowerCase()})`;
    } else {
      params.set('durStartDate', durStartDate);
      params.set('durOperation', durOperation);
      params.set('durYears', String(durYears));
      params.set('durMonths', String(durMonths));
      params.set('durWeeks', String(durWeeks));
      params.set('durDays', String(durDays));
      params.set('durSkipWeekends', String(durSkipWeekends));
      resultString = `${durationResult.formatted || ''} (${durationResult.dayOfWeek || ''})`;
    }
    
    const fullUrl = `${baseUrl}?${params.toString()}`;
    
    let template = '';
    if (type === 'age') {
      template = dict.shareTemplateAge.replace('{result}', resultString);
    } else if (type === 'diff') {
      template = dict.shareTemplateDiff.replace('{result}', resultString);
    } else {
      template = dict.shareTemplateDuration.replace('{result}', resultString);
    }
    
    return {
      url: fullUrl,
      text: template,
      resultString
    };
  };

  // Real-time ticker effect
  useEffect(() => {
    const interval = setInterval(() => {
      setTick(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleDismissGdpr = () => {
    localStorage.setItem('smart_calc_gdpr_consent', 'dismissed');
    setGdprDismissed(true);
  };

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const triggerSingleFileDownload = () => {
    const rawHtml = compileStandaloneHTML();
    const blob = new Blob([rawHtml], { type: 'text/html' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'smart-calculator-netlify.html';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(dict.exportSuccessToast);
  };

  const handleQuickSelect = (type: 'last30' | 'next30' | 'jan1' | 'today') => {
    const todayObj = new Date();
    const formatYMD = (d: Date) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const r = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${r}`;
    };

    const todayStr = formatYMD(todayObj);

    switch (type) {
      case 'last30': {
        const past = new Date(todayObj);
        past.setDate(past.getDate() - 30);
        setStartDate(formatYMD(past));
        setEndDate(todayStr);
        break;
      }
      case 'next30': {
        const future = new Date(todayObj);
        future.setDate(future.getDate() + 30);
        setStartDate(todayStr);
        setEndDate(formatYMD(future));
        break;
      }
      case 'jan1': {
        const jan1 = new Date(todayObj.getFullYear(), 0, 1);
        setStartDate(formatYMD(jan1));
        setEndDate(todayStr);
        break;
      }
      case 'today': {
        setStartDate(todayStr);
        setEndDate(todayStr);
        break;
      }
    }
  };

  const handleExportPDF = () => {
    if (activeTab === 'diff' && isDiffDateInvalid) {
      showToast(dict.cannotExportInvalidError);
      return;
    }
    if (activeTab === 'age' && isAgeDateInvalid) {
      showToast(dict.cannotExportInvalidError);
      return;
    }

    const doc = new jsPDF();
    
    // Header Banner
    doc.setFillColor(30, 27, 75); // Indigo 950
    doc.rect(0, 0, 210, 38, 'F');
    
    // App Logo
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text(dict.pdfTitle, 15, 14);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(199, 210, 254); // Light slate/indigo
    doc.text(dict.pdfSub, 15, 21);
    
    // Metadata block
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(7);
    const todayStr = new Date().toLocaleString(lang === 'DE' ? 'de-DE' : lang === 'FR' ? 'fr-FR' : lang === 'ES' ? 'es-ES' : lang === 'IT' ? 'it-IT' : 'en-US');
    doc.text(`${dict.pdfGeneratedOn}: ${todayStr}`, 15, 29);
    
    // Content layout
    let y = 48;
    
    // Section Header Helper
    const drawSectionHeader = (title: string) => {
      doc.setFillColor(248, 250, 252); // Slate 50
      doc.rect(12, y - 5, 186, 8, 'F');
      
      doc.setDrawColor(226, 232, 240); // Slate 200
      doc.line(12, y - 5, 198, y - 5);
      doc.line(12, y + 3, 198, y + 3);
      doc.line(12, y - 5, 12, y + 3);
      doc.line(198, y - 5, 198, y + 3);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(79, 70, 229); // Indigo 600
      doc.text(title.toUpperCase(), 16, y);
      y += 10;
    };
    
    // Value Field Helper
    const drawField = (label: string, value: string, isBig = false) => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139); // Slate 500
      doc.text(label, 15, y);
      
      doc.setFont("helvetica", isBig ? "bold" : "normal");
      doc.setFontSize(isBig ? 11 : 8.5);
      doc.setTextColor(15, 23, 42); // Slate 900
      doc.text(value, 95, y);
      
      // Divider
      doc.setDrawColor(241, 245, 249); // Slate 100
      doc.line(15, y + 3, 195, y + 3);
      y += 8;
    };
    
    if (activeTab === 'age') {
      drawSectionHeader(dict.pdfDetails);
      drawField(dict.birthDateLabel, `${birthDate} ${birthTime ? `(${birthTime})` : ''}`);
      drawField(dict.calcDateLabel, calcDate);
      
      y += 4;
      drawSectionHeader(dict.pdfResults);
      drawField(dict.exactAgeTitle, `${ageResults.years} ${dict.years}, ${ageResults.months} ${dict.months}, ${ageResults.days} ${dict.days}`, true);
      drawField(dict.weeks, `${ageResults.weeks} ${lang === 'DE' ? 'Wochen' : lang === 'FR' ? 'semaines' : lang === 'ES' ? 'semanas' : lang === 'IT' ? 'settimane' : 'weeks'}`);
      drawField(dict.hours, ageResults.hours.toString());
      drawField(dict.minutes, ageResults.minutes.toString());
      drawField(dict.seconds, ageResults.seconds.toString());
      
      y += 4;
      drawSectionHeader(dict.nextBirthdayTitle);
      drawField(dict.countdownPrefix, `${ageResults.nextBirthday.months} ${dict.months}, ${ageResults.nextBirthday.days} ${dict.days} (${ageResults.nextBirthday.totalDaysLeft} ${lang === 'DE' ? 'Tage übrig' : lang === 'FR' ? 'jours restants' : lang === 'ES' ? 'días restantes' : lang === 'IT' ? 'giorni rimanenti' : 'days left'})`);
      
      y += 4;
      drawSectionHeader(dict.statsTitle);
      drawField(dict.westernZodiac, `${ageResults.westernZodiac.symbol} ${ageResults.westernZodiac.name}`);
      drawField(dict.chineseZodiac, `${ageResults.chineseZodiac.emoji} ${ageResults.chineseZodiac.name}`);
      drawField(dict.birthstone, ageResults.birthstone);
      drawField(dict.dayOfWeekBirth, ageResults.dayOfWeek);
      
      y += 4;
      drawSectionHeader(dict.progressTitle);
      drawField(dict.targetMilestoneLabel.split('(')[0], `${targetMilestone} ${dict.years}`);
      drawField(`${dict.yearsLived} (%)`, `${progressPercent.toFixed(1)}%`);
      
      y += 4;
      drawSectionHeader(lang === 'DE' ? 'Lebensstatistiken (Schätzungen)' : 'Life Metrics (Averages)');
      drawField(dict.approxHeartbeats, ageResults.heartbeats);
      drawField(dict.approxBreaths, ageResults.breaths);
      drawField(dict.approxSleep, ageResults.sleepHours);
    } 
    else if (activeTab === 'diff') {
      drawSectionHeader(dict.pdfDetails);
      drawField(dict.startDateLabel, startDate);
      drawField(dict.endDateLabel, endDate);
      drawField(dict.excludeWeekendsLabel.split('(')[0], excludeWeekends ? 'YES' : 'NO');
      drawField(dict.includeEndDateLabel.split('(')[0], includeEndDate ? 'YES' : 'NO');
      
      y += 4;
      drawSectionHeader(dict.pdfResults);
      drawField(dict.totalCalendarDays, diffResults.totalDays.toString(), true);
      drawField(dict.workingDaysOnly, diffResults.workingDays.toString(), true);
      
      y += 4;
      drawSectionHeader(dict.alternateFormats);
      drawField(dict.years, diffResults.years.toString());
      drawField(dict.months, diffResults.months.toString());
      drawField(dict.weeks, diffResults.weeks.toString());
      drawField(dict.days, diffResults.days.toString());
      
      y += 4;
      drawSectionHeader("Time Breakdown");
      drawField("Hours", new Intl.NumberFormat().format(diffResults.hours));
      drawField("Minutes", new Intl.NumberFormat().format(diffResults.minutes));
      drawField("Seconds", new Intl.NumberFormat().format(diffResults.seconds));
    }
    else if (activeTab === 'duration') {
      drawSectionHeader(dict.pdfDetails);
      drawField(dict.startDateLabel, durStartDate);
      drawField(dict.operationLabel, durOperation === 'add' ? dict.opAdd : dict.opSubtract);
      drawField(`${dict.years} / ${dict.months} / ${dict.weeks} / ${dict.days}`, `${durYears}y / ${durMonths}m / ${durWeeks}w / ${durDays}d`);
      drawField(dict.excludeWeekendsLabel.split('(')[0], durSkipWeekends ? 'YES' : 'NO');
      
      y += 4;
      drawSectionHeader(dict.pdfResults);
      drawField(dict.resultingDateLabel, durationResult.formatted || '--/--/----', true);
      drawField(dict.dayOfWeekBirth, durationResult.dayOfWeek || '---');
    }
    
    // Page footer
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(156, 163, 175); // Slate 400
    doc.text(`© 2026 ${dict.title}. Built for European Precision & Compliance.`, 15, 285);
    
    doc.save(`Precision_Report_${activeTab}_${birthDate || startDate}.pdf`);
    showToast("PDF report downloaded successfully!");
  };

  // Perform Calculations
  const ageResults = calculateExactAge(birthDate, birthTime, calcDate, lang);
  const diffResults = calculateDateDifference(startDate, endDate, excludeWeekends, includeEndDate);
  const durationResult = calculateDateDuration(
    durStartDate, 
    durOperation, 
    durYears, 
    durMonths, 
    durWeeks, 
    durDays, 
    durSkipWeekends, 
    lang
  );

  // Active Birthday Reminder for Countdown Widget
  const activeReminder = birthdayReminders.find(r => r.id === featuredReminderId) 
    || birthdayReminders.find(r => r.isPrimary) 
    || birthdayReminders[0] 
    || null;

  const activeBirthDateForCountdown = activeReminder ? activeReminder.birthDate : birthDate;
  const activeNameForCountdown = activeReminder ? activeReminder.name : "Your Birthday";
  const activeNoteForCountdown = activeReminder?.note;

  const featuredCountdown = calculateUpcomingBirthdayCountdown(activeBirthDateForCountdown, lang);

  // Validation Checks
  const isDiffDateInvalid = Boolean(startDate && endDate && new Date(startDate).getTime() > new Date(endDate).getTime());
  const isAgeDateInvalid = Boolean(birthDate && calcDate && new Date(birthDate).getTime() > new Date(calcDate).getTime());

  const handleSwapDiffDates = () => {
    const temp = startDate;
    setStartDate(endDate);
    setEndDate(temp);
    showToast(pLocal.presetApplied || "Dates swapped!");
  };

  // Milestone Progress calculations
  const ageDecimal = ageResults.years + (ageResults.months / 12) + (ageResults.days / 365);
  const progressPercent = Math.min(100, Math.max(0, (ageDecimal / targetMilestone) * 100));

  // --- Print Handler ---
  const handlePrint = () => {
    window.print();
  };

  // --- Calculation History Helpers ---
  const saveCalculationToHistory = (type: 'age' | 'diff' | 'duration') => {
    let inputs: Record<string, string> = {};
    let results: Record<string, string> = {};
    let summary = '';

    if (type === 'age') {
      if (!birthDate) return;
      if (isAgeDateInvalid) {
        showToast(dict.cannotExportInvalidError);
        return;
      }
      inputs = { birthDate, birthTime, calcDate, targetMilestone: String(targetMilestone) };
      results = {
        years: String(ageResults.years),
        months: String(ageResults.months),
        days: String(ageResults.days),
        weeks: String(ageResults.weeks),
      };
      summary = `${birthDate} ➔ ${calcDate}`;
    } else if (type === 'diff') {
      if (!startDate || !endDate) return;
      if (isDiffDateInvalid) {
        showToast(dict.cannotExportInvalidError);
        return;
      }
      inputs = { startDate, endDate, excludeWeekends: String(excludeWeekends), includeEndDate: String(includeEndDate) };
      results = {
        totalDays: String(diffResults.totalDays),
        workingDays: String(diffResults.workingDays),
      };
      summary = `${startDate} ➔ ${endDate}`;
    } else {
      if (!durStartDate) return;
      inputs = {
        durStartDate,
        durOperation,
        durYears: String(durYears),
        durMonths: String(durMonths),
        durWeeks: String(durWeeks),
        durDays: String(durDays),
        durSkipWeekends: String(durSkipWeekends),
      };
      results = {
        resultDate: durationResult.formatted || '',
        dayOfWeek: durationResult.dayOfWeek || '',
      };
      const opSign = durOperation === 'add' ? '+' : '−';
      summary = `${durStartDate} ${opSign} ${durYears}y ${durMonths}m ${durWeeks}w ${durDays}d`;
    }

    const newItem: HistoryItem = {
      id: String(Date.now()),
      type,
      timestamp: new Date().toLocaleTimeString(lang === 'DE' ? 'de-DE' : lang === 'FR' ? 'fr-FR' : lang === 'ES' ? 'es-ES' : lang === 'IT' ? 'it-IT' : 'en-US', { hour: '2-digit', minute: '2-digit' }),
      inputs,
      results,
      summary,
    };

    setHistory(prev => {
      // Avoid exact duplicates in history
      const filtered = prev.filter(item => 
        !(item.type === type && JSON.stringify(item.inputs) === JSON.stringify(inputs))
      );
      const updated = [newItem, ...filtered];
      return updated.slice(0, 50);
    });

    showToast(dict.historySavedToast);
  };

  const loadHistoryItem = (item: HistoryItem) => {
    setActiveTab(item.type);
    if (item.type === 'age') {
      if (item.inputs.birthDate) setBirthDate(item.inputs.birthDate);
      if (item.inputs.birthTime) setBirthTime(item.inputs.birthTime);
      if (item.inputs.calcDate) setCalcDate(item.inputs.calcDate);
      if (item.inputs.targetMilestone) setTargetMilestone(parseInt(item.inputs.targetMilestone) || 67);
    } else if (item.type === 'diff') {
      if (item.inputs.startDate) setStartDate(item.inputs.startDate);
      if (item.inputs.endDate) setEndDate(item.inputs.endDate);
      setExcludeWeekends(item.inputs.excludeWeekends === 'true');
      setIncludeEndDate(item.inputs.includeEndDate === 'true');
    } else if (item.type === 'duration') {
      if (item.inputs.durStartDate) setDurStartDate(item.inputs.durStartDate);
      if (item.inputs.durOperation) setDurOperation(item.inputs.durOperation as 'add' | 'subtract');
      if (item.inputs.durYears) setDurYears(parseInt(item.inputs.durYears) || 0);
      if (item.inputs.durMonths) setDurMonths(parseInt(item.inputs.durMonths) || 0);
      if (item.inputs.durWeeks) setDurWeeks(parseInt(item.inputs.durWeeks) || 0);
      if (item.inputs.durDays) setDurDays(parseInt(item.inputs.durDays) || 0);
      setDurSkipWeekends(item.inputs.durSkipWeekends === 'true');
    }
    setDrawerOpen(false);
    showToast(dict.historyLoadedToast);
  };

  const deleteHistoryItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setHistory(prev => prev.filter(item => item.id !== id));
  };

  const clearHistory = () => {
    setHistory([]);
    showToast(dict.historyClearedToast);
  };

  const handleExportCSV = () => {
    if (history.length === 0) return;

    // CSV headers
    const headers = ["ID", "Calculation Type", "Calculated At", "Summary", "Inputs", "Results"];
    
    // Map rows
    const rows = history.map(item => {
      // Format inputs as readable string
      const inputStr = Object.entries(item.inputs)
        .map(([key, val]) => `${key}: ${val}`)
        .join("; ");
        
      // Format results as readable string
      const resultStr = Object.entries(item.results)
        .map(([key, val]) => `${key}: ${val}`)
        .join("; ");

      // Map type to professional localized label
      let displayType = item.type.toUpperCase();
      if (item.type === 'age') displayType = dict.tabAge;
      else if (item.type === 'diff') displayType = dict.tabDiff;
      else if (item.type === 'duration') displayType = dict.tabDuration;

      return [
        item.id,
        displayType,
        item.timestamp,
        item.summary,
        inputStr,
        resultStr
      ];
    });

    // Helper to escape values for CSV
    const escapeCSV = (val: string) => {
      const stringified = String(val ?? '');
      if (stringified.includes(',') || stringified.includes('"') || stringified.includes('\n') || stringified.includes('\r')) {
        return `"${stringified.replace(/"/g, '""')}"`;
      }
      return stringified;
    };

    const csvContent = [
      headers.map(escapeCSV).join(','),
      ...rows.map(row => row.map(escapeCSV).join(','))
    ].join('\r\n');

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Calculation_History_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showToast(hLocal.exportSuccess);
  };

  const handleExportHistory30DaysPDF = () => {
    if (history.length === 0) {
      showToast(dict.noHistoryToExportError);
      return;
    }

    const thirtyDaysAgoMs = Date.now() - (30 * 24 * 60 * 60 * 1000);
    
    // Filter history items calculated in last 30 days
    const recentHistory = history.filter(item => {
      const itemTime = item.createdAt ? new Date(item.createdAt).getTime() : parseInt(item.id);
      if (!isNaN(itemTime)) {
        return itemTime >= thirtyDaysAgoMs;
      }
      return true;
    });

    const itemsToExport = recentHistory.length > 0 ? recentHistory : history;

    const doc = new jsPDF();
    
    // Header Banner
    doc.setFillColor(30, 27, 75); // Indigo 950
    doc.rect(0, 0, 210, 42, 'F');
    
    // Title & Logo
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text("30-DAY CALCULATION HISTORY SUMMARY REPORT", 15, 16);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(199, 210, 254);
    doc.text("Smart Age & Date Calculator Pro — European Standard Local Export", 15, 23);
    
    // Meta dates
    const nowStr = new Date().toLocaleString(lang === 'DE' ? 'de-DE' : lang === 'FR' ? 'fr-FR' : lang === 'ES' ? 'es-ES' : lang === 'IT' ? 'it-IT' : 'en-US');
    doc.setFontSize(7);
    doc.setTextColor(224, 231, 255);
    doc.text(`${dict.pdfGeneratedOn}: ${nowStr} | Period: Last 30 Days (${itemsToExport.length} Entry/Entries)`, 15, 33);

    let y = 52;

    // Helper for Section Headers
    const drawSectionHeader = (title: string) => {
      doc.setFillColor(248, 250, 252);
      doc.rect(12, y - 5, 186, 8, 'F');
      
      doc.setDrawColor(226, 232, 240);
      doc.line(12, y - 5, 198, y - 5);
      doc.line(12, y + 3, 198, y + 3);
      doc.line(12, y - 5, 12, y + 3);
      doc.line(198, y - 5, 198, y + 3);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(79, 70, 229);
      doc.text(title.toUpperCase(), 16, y);
      y += 10;
    };

    // Summary Statistics Header
    drawSectionHeader("30-Day Activity Overview");
    
    const ageCount = itemsToExport.filter(i => i.type === 'age').length;
    const diffCount = itemsToExport.filter(i => i.type === 'diff').length;
    const durCount = itemsToExport.filter(i => i.type === 'duration').length;

    // Stat Box 1
    doc.setFillColor(243, 244, 246);
    doc.rect(15, y, 55, 16, 'F');
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text(String(itemsToExport.length), 20, y + 8);
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text("Total Calculations", 20, y + 13);

    // Stat Box 2
    doc.setFillColor(238, 242, 255);
    doc.rect(75, y, 55, 16, 'F');
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(67, 56, 202);
    doc.text(String(ageCount), 80, y + 8);
    doc.setFontSize(7);
    doc.setTextColor(99, 102, 241);
    doc.text("Age Calculations", 80, y + 13);

    // Stat Box 3
    doc.setFillColor(236, 253, 245);
    doc.rect(135, y, 55, 16, 'F');
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(4, 120, 87);
    doc.text(String(diffCount + durCount), 140, y + 8);
    doc.setFontSize(7);
    doc.setTextColor(16, 185, 129);
    doc.text("Date Spans & Duration", 140, y + 13);

    y += 24;

    drawSectionHeader("30-Day Calculation Logs");

    itemsToExport.forEach((item, index) => {
      // Page break check
      if (y > 255) {
        doc.addPage();
        // Page Header
        doc.setFillColor(30, 27, 75);
        doc.rect(0, 0, 210, 15, 'F');
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.setTextColor(255, 255, 255);
        doc.text("30-DAY HISTORY REPORT - Continued", 15, 10);
        y = 26;
      }

      // Record Box
      doc.setFillColor(250, 250, 250);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(15, y, 180, 22, 2, 2, 'FD');

      // Tag
      const typeLabel = item.type === 'age' ? 'AGE CALCULATOR' : item.type === 'diff' ? 'DATE DIFFERENCE' : 'DATE ARITHMETIC';
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      if (item.type === 'age') doc.setTextColor(67, 56, 202);
      else if (item.type === 'diff') doc.setTextColor(4, 120, 87);
      else doc.setTextColor(126, 34, 206);
      
      doc.text(`#${index + 1}  [${typeLabel}]`, 20, y + 6);

      // Time
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(148, 163, 184);
      doc.text(item.timestamp, 150, y + 6);

      // Summary
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(30, 41, 59);
      doc.text(item.summary, 20, y + 12);

      // Results Line
      let resultText = '';
      if (item.type === 'age') {
        resultText = `${dict.years}: ${item.results.years || 0} | ${dict.months}: ${item.results.months || 0} | ${dict.days}: ${item.results.days || 0}`;
      } else if (item.type === 'diff') {
        resultText = `${dict.totalCalendarDays}: ${item.results.totalDays || 0} | ${dict.workingDaysOnly.split('(')[0]}: ${item.results.workingDays || 0}`;
      } else {
        resultText = `${dict.resultingDateLabel}: ${item.results.resultDate || ''} (${item.results.dayOfWeek || ''})`;
      }

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(71, 85, 105);
      doc.text(resultText, 20, y + 17);

      y += 26;
    });

    // Page footer
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(148, 163, 184);
      doc.text(`Page ${i} of ${pageCount} — Smart Age & Date Calculator Pro (30-Day History Report)`, 15, 288);
    }

    doc.save(`calculation_history_30days_report_${new Date().toISOString().split('T')[0]}.pdf`);
    showToast(dict.historyPdfExportedToast || "30-Day History PDF Report generated!");
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50 text-slate-800 font-sans">
      
      {/* 1. Header & Language Selection */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-40 shadow-xs px-6 py-2.5">
        <div id="header-container" className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="flex items-center gap-2">
            <div id="logo-icon" className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center text-white shadow-xs shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h1 id="main-header-title" className="text-base font-black tracking-tight text-indigo-950 uppercase flex items-center gap-1.5 leading-none">
                {dict.title}
                <span className="text-indigo-600 text-[9px] font-bold px-1.5 py-0.5 bg-indigo-50 rounded border border-indigo-100 uppercase tracking-widest">PRO</span>
              </h1>
              <p id="main-header-subtitle" className="text-[9px] text-slate-400 uppercase font-bold tracking-wider mt-0.5">{dict.subtitle}</p>
            </div>
          </div>
          
          {/* Europe Language Toggle & Navigation Integration */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setDrawerOpen(true)}
              className="relative flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-slate-700 text-[10px] font-bold uppercase tracking-wider hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700 transition cursor-pointer"
            >
              <History className="w-3.5 h-3.5 text-slate-500" />
              <span>{dict.historyTitle}</span>
              {history.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 text-[8px] font-bold text-white shadow-xs">
                  {history.length}
                </span>
              )}
            </button>

            <div className="flex items-center gap-1 text-slate-400 bg-slate-50 border border-slate-200 rounded p-1">
              <Globe className="w-3.5 h-3.5 text-slate-500" />
              <select 
                id="language-selector"
                value={lang} 
                onChange={(e) => setLang(e.target.value as Language)}
                className="bg-transparent border-none text-slate-700 text-[10px] font-bold uppercase tracking-wider focus:outline-none focus:ring-0 cursor-pointer pr-3"
              >
                <option value="EN">🇬🇧 EN</option>
                <option value="DE">🇩🇪 DE</option>
                <option value="FR">🇫🇷 FR</option>
                <option value="ES">🇪🇸 ES</option>
                <option value="IT">🇮🇹 IT</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      {/* 2. Main Workspace */}
      <main className="max-w-7xl mx-auto px-6 py-5 flex-grow w-full">
        
        {/* Market Trust Signal */}
        <div className="text-center max-w-2xl mx-auto mb-6">
          <span id="gdpr-pill" className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80 mb-2 uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            100% GDPR Compliant • CLIENT-SIDE PRECISION
          </span>
          <h2 id="tagline-headline" className="text-base font-black tracking-tight text-indigo-950 uppercase">
            {dict.subtitle}
          </h2>
          <p id="tagline-description" className="mt-1 text-[11px] text-slate-500 leading-normal max-w-xl mx-auto">
            {dict.tagline}
          </p>
        </div>

        {/* Tab Controls */}
        <div id="tabs-navigation" className="border-b border-slate-200 mb-6 flex justify-center sm:justify-start">
          <ul className="flex flex-wrap -mb-px text-xs font-bold uppercase tracking-wider text-center gap-3">
            <li>
              <button 
                id="tab-age-btn"
                onClick={() => setActiveTab('age')}
                className={`inline-flex items-center gap-1.5 px-3 py-2 border-b-2 transition-all ${
                  activeTab === 'age' 
                    ? 'border-indigo-600 text-indigo-600' 
                    : 'border-transparent text-slate-400 hover:text-indigo-600'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                {dict.tabAge}
              </button>
            </li>
            <li>
              <button 
                id="tab-diff-btn"
                onClick={() => setActiveTab('diff')}
                className={`inline-flex items-center gap-1.5 px-3 py-2 border-b-2 transition-all ${
                  activeTab === 'diff' 
                    ? 'border-indigo-600 text-indigo-600' 
                    : 'border-transparent text-slate-400 hover:text-indigo-600'
                }`}
              >
                <CalendarCheck2 className="w-3.5 h-3.5" />
                {dict.tabDiff}
              </button>
            </li>
            <li>
              <button 
                id="tab-duration-btn"
                onClick={() => setActiveTab('duration')}
                className={`inline-flex items-center gap-1.5 px-3 py-2 border-b-2 transition-all ${
                  activeTab === 'duration' 
                    ? 'border-indigo-600 text-indigo-600' 
                    : 'border-transparent text-slate-400 hover:text-indigo-600'
                }`}
              >
                <Hourglass className="w-3.5 h-3.5" />
                {dict.tabDuration}
              </button>
            </li>
          </ul>
        </div>

        {/* Active Tab View */}
        <div id="tab-content-wrapper">
          <AnimatePresence mode="wait">
            
            {/* TAB 1: AGE CALCULATOR */}
            {activeTab === 'age' && (
              <motion.div 
                key="age-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-4"
              >
                {/* Form Controls */}
                <div id="age-input-card" className="lg:col-span-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4 h-fit">
                  <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-1 h-3.5 bg-indigo-600 rounded-full"></span>
                    {dict.tabAge}
                  </h3>
                  
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider flex items-center justify-between">
                      <span className={`flex items-center gap-1 ${isAgeDateInvalid ? 'text-red-600 font-extrabold' : 'text-slate-400'}`}>
                        <Calendar className="w-3 h-3" />
                        {dict.birthDateLabel}
                      </span>
                      {isAgeDateInvalid && (
                        <span className="text-[9px] font-extrabold text-red-600 flex items-center gap-0.5 animate-pulse">
                          <AlertTriangle className="w-3 h-3" />
                          {dict.invalidDateTitle}
                        </span>
                      )}
                    </label>
                    <input 
                      type="date" 
                      id="input-birth-date"
                      value={birthDate}
                      onChange={(e) => setBirthDate(e.target.value)}
                      className={`w-full text-xs rounded p-2 focus:outline-none font-mono transition-all ${
                        isAgeDateInvalid 
                          ? 'bg-red-50/50 border-2 border-red-400 text-red-900 focus:ring-2 focus:ring-red-400' 
                          : 'bg-slate-50 border border-slate-200 text-slate-800 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500'
                      }`}
                    />
                    {isAgeDateInvalid && (
                      <p id="age-date-validation-error" className="text-[10px] font-semibold text-red-600 flex items-start gap-1 mt-1 leading-snug">
                        <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                        <span>{dict.invalidAgeError}</span>
                      </p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {dict.birthTimeLabel}
                    </label>
                    <input 
                      type="time" 
                      id="input-birth-time"
                      value={birthTime}
                      onChange={(e) => setBirthTime(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded p-2 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <BookmarkCheck className="w-3 h-3 text-slate-400" />
                      {dict.calcDateLabel}
                    </label>
                    <input 
                      type="date" 
                      id="input-calc-date"
                      value={calcDate}
                      onChange={(e) => setCalcDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded p-2 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 font-mono"
                    />
                  </div>

                  <button
                    type="button"
                    id="btn-save-reminder-from-input"
                    onClick={() => handleOpenAddReminderWithDate(birthDate)}
                    className="w-full py-2 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/80 rounded-lg text-xs font-bold transition-all duration-150 flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs active:scale-95"
                  >
                    <Gift className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span>{dict.addBirthdayReminderBtn}</span>
                  </button>

                  <hr className="border-slate-100" />

                  {/* Quick Presets */}
                  <div className="space-y-2" id="quick-presets-container">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-indigo-500 animate-pulse" />
                      {pLocal.quickPresetsTitle}
                    </label>
                    <div className="grid grid-cols-1 gap-2">
                      <button
                        type="button"
                        id="preset-new-year"
                        onClick={() => {
                          const val = getPresetDate('newyear');
                          setBirthDate(val);
                          showToast(pLocal.presetApplied);
                        }}
                        className="group w-full text-left p-2.5 bg-slate-50 hover:bg-indigo-50/60 text-slate-700 hover:text-indigo-700 rounded-lg border border-slate-200 hover:border-indigo-200 text-[11px] font-medium transition-all duration-150 flex items-center justify-between cursor-pointer"
                      >
                        <span className="truncate">{pLocal.newYearsDay}</span>
                        <span className="text-[9px] font-semibold text-slate-400 group-hover:text-indigo-500 font-mono bg-white group-hover:bg-indigo-100/50 px-1.5 py-0.5 rounded border border-slate-100 group-hover:border-indigo-100/30 transition-all">
                          {getPresetDate('newyear')}
                        </span>
                      </button>

                      <button
                        type="button"
                        id="preset-last-birthday"
                        onClick={() => {
                          const val = getPresetDate('lastbirthday');
                          setBirthDate(val);
                          showToast(pLocal.presetApplied);
                        }}
                        className="group w-full text-left p-2.5 bg-slate-50 hover:bg-indigo-50/60 text-slate-700 hover:text-indigo-700 rounded-lg border border-slate-200 hover:border-indigo-200 text-[11px] font-medium transition-all duration-150 flex items-center justify-between cursor-pointer"
                      >
                        <span className="truncate">{pLocal.lastBirthday}</span>
                        <span className="text-[9px] font-semibold text-slate-400 group-hover:text-indigo-500 font-mono bg-white group-hover:bg-indigo-100/50 px-1.5 py-0.5 rounded border border-slate-100 group-hover:border-indigo-100/30 transition-all">
                          {getPresetDate('lastbirthday')}
                        </span>
                      </button>

                      <button
                        type="button"
                        id="preset-18-years"
                        onClick={() => {
                          const val = getPresetDate('minus18');
                          setBirthDate(val);
                          showToast(pLocal.presetApplied);
                        }}
                        className="group w-full text-left p-2.5 bg-slate-50 hover:bg-indigo-50/60 text-slate-700 hover:text-indigo-700 rounded-lg border border-slate-200 hover:border-indigo-200 text-[11px] font-medium transition-all duration-150 flex items-center justify-between cursor-pointer"
                      >
                        <span className="truncate">{pLocal.minus18Years}</span>
                        <span className="text-[9px] font-semibold text-slate-400 group-hover:text-indigo-500 font-mono bg-white group-hover:bg-indigo-100/50 px-1.5 py-0.5 rounded border border-slate-100 group-hover:border-indigo-100/30 transition-all">
                          {getPresetDate('minus18')}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Results Visualizer */}
                <div id="age-results-pane" className="lg:col-span-8 space-y-4">
                  {isAgeDateInvalid ? (
                    <div id="age-invalid-alert-card" className="bg-gradient-to-br from-red-50 via-white to-amber-50/40 border-2 border-red-200 p-5 rounded-xl shadow-xs space-y-4">
                      <div className="flex items-start gap-3.5">
                        <div className="w-11 h-11 rounded-xl bg-red-100 border border-red-200 text-red-600 flex items-center justify-center shrink-0 shadow-2xs">
                          <AlertTriangle className="w-6 h-6 text-red-600" />
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-extrabold text-sm text-red-950 uppercase tracking-wider flex items-center gap-2">
                            {dict.invalidDateTitle}
                          </h4>
                          <p className="text-xs font-medium text-red-800 leading-relaxed">
                            {dict.invalidAgeError}
                          </p>
                          <div className="pt-1.5 flex flex-wrap items-center gap-3 text-[11px] font-mono text-red-700">
                            <span className="bg-red-100/80 px-2 py-0.5 rounded border border-red-200 text-red-900 font-bold shadow-2xs">
                              {dict.birthDateLabel}: <strong>{birthDate}</strong>
                            </span>
                            <span className="text-red-400 font-bold">➔</span>
                            <span className="bg-white/80 px-2 py-0.5 rounded border border-red-100 shadow-2xs">
                              {dict.calcDateLabel}: <strong className="text-red-900">{calcDate}</strong>
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2.5 pt-3 border-t border-red-150">
                        <button
                          type="button"
                          id="btn-reset-age-dates"
                          onClick={() => {
                            const todayStr = new Date().toISOString().split('T')[0];
                            setCalcDate(todayStr);
                            if (new Date(birthDate) > new Date()) {
                              setBirthDate(todayStr);
                            }
                            showToast(pLocal.presetApplied || "Reset dates!");
                          }}
                          className="py-2 px-3.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-all duration-150 flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                        >
                          {dict.resetDatesBtn}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                  {/* Live Age Counter Grid */}
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="text-[10px] font-bold text-slate-400 tracking-wider uppercase flex items-center gap-1.5">
                        <span className="w-1 h-3 bg-indigo-600 rounded-full"></span>
                        {dict.exactAgeTitle}
                      </h4>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setShareType('age');
                            setShareModalOpen(true);
                          }}
                          className="py-1 px-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[9px] font-bold uppercase tracking-wider rounded transition flex items-center gap-1 cursor-pointer border border-indigo-100"
                        >
                          <Share2 className="w-3 h-3 text-indigo-600" />
                          {dict.shareBtn}
                        </button>
                        <button
                          type="button"
                          onClick={() => saveCalculationToHistory('age')}
                          className="py-1 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[9px] font-bold uppercase tracking-wider rounded transition flex items-center gap-1 cursor-pointer border border-slate-200"
                        >
                          <Save className="w-3 h-3 text-slate-500" />
                          {dict.historySaveBtn}
                        </button>
                        <button
                          type="button"
                          onClick={handlePrint}
                          className="py-1 px-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[9px] font-bold uppercase tracking-wider rounded transition flex items-center gap-1 cursor-pointer border border-indigo-100"
                        >
                          <Printer className="w-3 h-3 text-indigo-600" />
                          {dict.printBtn}
                        </button>
                        <button
                          type="button"
                          onClick={handleExportPDF}
                          className="py-1 px-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[9px] font-bold uppercase tracking-wider rounded transition flex items-center gap-1 cursor-pointer shadow-xs"
                        >
                          <FileDown className="w-3 h-3" />
                          {dict.exportPdfBtn}
                        </button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="bg-indigo-50/70 p-3 rounded-lg border border-indigo-100 text-center">
                        <span className="block text-3xl font-black text-indigo-900 font-mono tracking-tight">{ageResults.years}</span>
                        <span className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider">{dict.years}</span>
                      </div>
                      <div className="bg-indigo-50/70 p-3 rounded-lg border border-indigo-100 text-center">
                        <span className="block text-3xl font-black text-indigo-900 font-mono tracking-tight">{ageResults.months}</span>
                        <span className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider">{dict.months}</span>
                      </div>
                      <div className="bg-indigo-50/70 p-3 rounded-lg border border-indigo-100 text-center">
                        <span className="block text-3xl font-black text-indigo-900 font-mono tracking-tight">{ageResults.days}</span>
                        <span className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider">{dict.days}</span>
                      </div>
                      <div className="bg-indigo-50/70 p-3 rounded-lg border border-indigo-100 text-center">
                        <span className="block text-3xl font-black text-indigo-900 font-mono tracking-tight">{ageResults.weeks}</span>
                        <span className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider">{dict.weeks}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mt-3 text-center">
                      <div className="bg-slate-50 p-2 rounded border border-slate-200/50">
                        <span className="block text-sm font-bold font-mono text-slate-800">{ageResults.hours}</span>
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{dict.hours}</span>
                      </div>
                      <div className="bg-slate-50 p-2 rounded border border-slate-200/50">
                        <span className="block text-sm font-bold font-mono text-slate-800">{ageResults.minutes}</span>
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{dict.minutes}</span>
                      </div>
                      <div className="bg-indigo-55/40 p-2 rounded border border-indigo-100 bg-indigo-50">
                        <span className="block text-sm font-black font-mono text-indigo-700">{ageResults.seconds}</span>
                        <span className="text-[9px] text-indigo-500 font-bold uppercase tracking-wider">{dict.seconds}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Countdown Card Widget */}
                    <div id="countdown-widget-card" className="bg-white p-4.5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                            <Gift className="w-4 h-4 text-indigo-600 shrink-0" />
                            <span>{activeNameForCountdown}'s Birthday</span>
                          </h4>
                          <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mt-0.5">
                            {dict.nextBirthdayCountdown}
                          </p>
                        </div>

                        {birthdayReminders.length > 0 && (
                          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 shadow-2xs">
                            <Star className="w-3 h-3 text-amber-500 fill-amber-400 shrink-0" />
                            <select
                              id="select-featured-reminder"
                              value={activeReminder ? activeReminder.id : ''}
                              onChange={(e) => {
                                if (e.target.value) {
                                  handleSetPrimaryReminder(e.target.value);
                                }
                              }}
                              className="bg-transparent text-[10px] font-bold text-slate-700 uppercase tracking-wider focus:outline-none cursor-pointer max-w-[120px] truncate"
                            >
                              {birthdayReminders.map(rem => (
                                <option key={rem.id} value={rem.id}>
                                  {rem.name} ({rem.birthDate})
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-4 gap-2 py-2 border-y border-slate-100 text-center font-mono">
                        <div className="bg-indigo-50/60 p-2 rounded border border-indigo-100/80">
                          <span className="block text-xl font-black text-indigo-950">{featuredCountdown.monthsLeft}</span>
                          <span className="text-[9px] text-indigo-600 font-bold uppercase tracking-wider font-sans">{dict.months}</span>
                        </div>
                        <div className="bg-indigo-50/60 p-2 rounded border border-indigo-100/80">
                          <span className="block text-xl font-black text-indigo-950">{featuredCountdown.daysLeft}</span>
                          <span className="text-[9px] text-indigo-600 font-bold uppercase tracking-wider font-sans">{dict.days}</span>
                        </div>
                        <div className="bg-slate-50 p-2 rounded border border-slate-200/60">
                          <span className="block text-lg font-bold text-slate-800">{String(featuredCountdown.hoursLeft).padStart(2, '0')}</span>
                          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider font-sans">{dict.hours}</span>
                        </div>
                        <div className="bg-slate-50 p-2 rounded border border-slate-200/60">
                          <span className="block text-lg font-bold text-indigo-700">{String(featuredCountdown.secondsLeft).padStart(2, '0')}</span>
                          <span className="text-[9px] text-indigo-500 font-bold uppercase tracking-wider font-sans">{dict.seconds}</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center justify-between gap-1 text-[10px] font-bold text-slate-600 bg-slate-50 rounded-lg p-2.5 border border-slate-200/70">
                          <span className="flex items-center gap-1 text-indigo-700">
                            <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                            {dict.turnsAge}: <strong className="text-indigo-950 text-xs font-mono">{featuredCountdown.turningAge}</strong>
                          </span>
                          <span className="text-slate-500 font-mono">
                            {featuredCountdown.dayOfWeek}, {featuredCountdown.nextBirthdayDateStr}
                          </span>
                        </div>

                        {activeNoteForCountdown && (
                          <p className="text-[10px] italic text-slate-600 bg-amber-50/70 border border-amber-200/60 rounded px-2.5 py-1">
                            💡 {activeNoteForCountdown}
                          </p>
                        )}

                        <div className="flex items-center justify-between gap-2 pt-1">
                          <div className="text-[10px] font-bold text-indigo-700 bg-indigo-50 rounded-md px-2.5 py-1 text-center uppercase tracking-wider border border-indigo-100">
                            🎉 {featuredCountdown.totalDaysLeft} {dict.daysLeftText}
                          </div>

                          <button
                            type="button"
                            id="btn-add-reminder-widget"
                            onClick={() => handleOpenAddReminderWithDate(activeBirthDateForCountdown, activeNameForCountdown !== "Your Birthday" ? activeNameForCountdown : "")}
                            className="text-[10px] font-bold text-indigo-700 hover:text-indigo-900 bg-indigo-50/80 hover:bg-indigo-100 border border-indigo-200 rounded px-2.5 py-1 transition flex items-center gap-1 cursor-pointer"
                          >
                            <UserPlus className="w-3 h-3 text-indigo-600 shrink-0" />
                            <span>{dict.addBirthdayReminderBtn}</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Astro & Zodiac Card */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                        <span className="w-1 h-3 bg-indigo-600 rounded-full"></span>
                        {dict.statsTitle}
                      </h4>
                      <div className="space-y-1.5 text-xs">
                        <div className="flex justify-between items-center p-2 rounded bg-slate-50 border border-slate-200/60">
                          <span className="text-slate-500 font-bold text-[9px] uppercase tracking-wider">{dict.westernZodiac}</span>
                          <span className="font-bold text-slate-800 flex items-center gap-1">
                            <span className="text-indigo-600">{ageResults.westernZodiac.symbol}</span>
                            {ageResults.westernZodiac.name}
                          </span>
                        </div>
                        <div className="flex justify-between items-center p-2 rounded bg-slate-50 border border-slate-200/60">
                          <span className="text-slate-500 font-bold text-[9px] uppercase tracking-wider">{dict.chineseZodiac}</span>
                          <span className="font-bold text-slate-800 flex items-center gap-1">
                            <span>{ageResults.chineseZodiac.emoji}</span>
                            {ageResults.chineseZodiac.name}
                          </span>
                        </div>
                        <div className="flex justify-between items-center p-2 rounded bg-slate-50 border border-slate-200/60">
                          <span className="text-slate-500 font-bold text-[9px] uppercase tracking-wider">{dict.birthstone}</span>
                          <span className="font-bold text-slate-800">{ageResults.birthstone}</span>
                        </div>
                        <div className="flex justify-between items-center p-2 rounded bg-slate-50 border border-slate-200/60">
                          <span className="text-slate-500 font-bold text-[9px] uppercase tracking-wider">{dict.dayOfWeekBirth}</span>
                          <span className="font-bold text-slate-700">{ageResults.dayOfWeek}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Career & Life Milestone Tracker */}
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                          <span className="w-1 h-3 bg-indigo-600 rounded-full"></span>
                          {dict.progressTitle}
                        </h4>
                        <p className="text-[10px] text-slate-400 mt-0.5 uppercase font-medium">{dict.progressDesc}</p>
                      </div>
                      <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded border border-slate-200">
                        <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400">{dict.targetMilestoneLabel.split('(')[0]}</label>
                        <input 
                          type="number" 
                          id="input-milestone-age"
                          value={targetMilestone}
                          onChange={(e) => setTargetMilestone(Math.max(1, parseInt(e.target.value) || 67))}
                          className="w-12 bg-white border border-slate-200 text-slate-800 text-xs font-black rounded p-0.5 text-center focus:ring-1 focus:ring-indigo-500 focus:outline-none" 
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden flex border border-slate-200/40">
                        <div 
                          className="bg-indigo-600 h-full rounded-full transition-all duration-500" 
                          style={{ width: `${progressPercent}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
                        <span className="text-indigo-600">{ageResults.years} {dict.yearsLived}</span>
                        <span className="text-slate-400">{Math.max(0, targetMilestone - ageResults.years)} {dict.yearsRemaining}</span>
                      </div>
                    </div>
                  </div>

                  {/* Animated Fun Averages Bento Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="border border-slate-200 bg-slate-50 p-3 rounded-lg text-center">
                      <span className="block text-xl font-black text-slate-800 font-mono">{ageResults.heartbeats}</span>
                      <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">{dict.approxHeartbeats}</span>
                    </div>
                    <div className="border border-slate-200 bg-slate-50 p-3 rounded-lg text-center">
                      <span className="block text-xl font-black text-slate-800 font-mono">{ageResults.breaths}</span>
                      <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">{dict.approxBreaths}</span>
                    </div>
                    <div className="border border-slate-200 bg-slate-50 p-3 rounded-lg text-center">
                      <span className="block text-xl font-black text-slate-800 font-mono">{ageResults.sleepHours}</span>
                      <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">{dict.approxSleep}</span>
                    </div>
                  </div>

                  {/* Saved Annual Birthday Reminders Manager Section */}
                  <div id="birthday-reminders-manager" className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                      <div className="space-y-0.5">
                        <h3 className="font-extrabold text-xs sm:text-sm text-slate-900 uppercase tracking-wider flex items-center gap-2">
                          <Gift className="w-4 h-4 text-indigo-600 shrink-0" />
                          <span>{dict.birthdayRemindersTitle}</span>
                          <span className="text-[10px] font-bold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full font-mono">
                            {birthdayReminders.length}
                          </span>
                        </h3>
                        <p className="text-[11px] text-slate-500">
                          {dict.birthdayRemindersDesc}
                        </p>
                      </div>

                      <button
                        type="button"
                        id="btn-open-add-reminder"
                        onClick={() => handleOpenAddReminderWithDate(birthDate)}
                        className="py-2 px-3.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-all duration-150 flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0 active:scale-95"
                      >
                        <Plus className="w-4 h-4 shrink-0" />
                        <span>{dict.addBirthdayReminderBtn}</span>
                      </button>
                    </div>

                    {birthdayReminders.length === 0 ? (
                      <div className="text-center py-8 px-4 bg-slate-50/70 rounded-xl border border-dashed border-slate-200 space-y-3">
                        <div className="w-12 h-12 bg-indigo-50 border border-indigo-100 rounded-full flex items-center justify-center mx-auto text-indigo-600 shadow-2xs">
                          <Gift className="w-6 h-6" />
                        </div>
                        <p className="text-xs font-medium text-slate-600 max-w-md mx-auto leading-relaxed">
                          {dict.noRemindersSaved}
                        </p>
                        <button
                          type="button"
                          onClick={() => handleOpenAddReminderWithDate(birthDate)}
                          className="py-1.5 px-3.5 bg-white hover:bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-bold rounded-lg transition-all cursor-pointer shadow-2xs inline-flex items-center gap-1.5"
                        >
                          <UserPlus className="w-3.5 h-3.5 text-indigo-600" />
                          <span>{dict.addBirthdayReminderBtn}</span>
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {birthdayReminders.map((reminder) => {
                          const cd = calculateUpcomingBirthdayCountdown(reminder.birthDate, lang);
                          const isFeatured = (reminder.id === featuredReminderId) || (!featuredReminderId && reminder.isPrimary);

                          return (
                            <div
                              key={reminder.id}
                              className={`p-3.5 rounded-xl border transition-all duration-150 flex flex-col justify-between gap-3 ${
                                isFeatured 
                                  ? 'bg-gradient-to-br from-indigo-50/80 via-white to-indigo-50/30 border-indigo-300 shadow-xs ring-1 ring-indigo-200' 
                                  : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                              }`}
                            >
                              <div className="space-y-1.5">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="space-y-0.5 min-w-0">
                                    <div className="flex items-center gap-1.5">
                                      <span className="font-extrabold text-xs text-slate-900 truncate">{reminder.name}</span>
                                      {isFeatured && (
                                        <span className="text-[8px] font-black uppercase tracking-wider bg-indigo-600 text-white px-1.5 py-0.5 rounded shadow-2xs shrink-0">
                                          Featured
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-[10px] font-mono font-bold text-slate-500">
                                      🎂 {reminder.birthDate}
                                    </div>
                                  </div>

                                  <button
                                    type="button"
                                    title="Toggle Featured in Countdown Widget"
                                    onClick={() => handleSetPrimaryReminder(reminder.id)}
                                    className={`p-1 rounded transition cursor-pointer ${
                                      isFeatured ? 'text-amber-500 bg-amber-50' : 'text-slate-300 hover:text-amber-400'
                                    }`}
                                  >
                                    <Star className="w-4 h-4 fill-current" />
                                  </button>
                                </div>

                                {reminder.note && (
                                  <p className="text-[10px] text-slate-500 line-clamp-2 bg-slate-50 p-1.5 rounded border border-slate-100 italic">
                                    "{reminder.note}"
                                  </p>
                                )}

                                <div className="bg-indigo-50/60 p-2 rounded-lg border border-indigo-100/70 text-[10px] space-y-0.5">
                                  <div className="flex justify-between items-center text-indigo-950 font-bold">
                                    <span>{dict.turnsAge} {cd.turningAge}</span>
                                    <span className="text-indigo-700 font-mono">in {cd.totalDaysLeft} days</span>
                                  </div>
                                  <div className="text-[9px] text-slate-500 font-mono">
                                    {cd.dayOfWeek}, {cd.nextBirthdayDateStr}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center justify-between gap-1.5 pt-2 border-t border-slate-100 text-[10px]">
                                <button
                                  type="button"
                                  onClick={() => handleLoadReminderIntoCalc(reminder.birthDate)}
                                  className="py-1 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded transition cursor-pointer flex items-center gap-1"
                                >
                                  <Clock className="w-3 h-3 text-slate-500" />
                                  <span>{dict.loadInCalculatorBtn}</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleDeleteBirthdayReminder(reminder.id)}
                                  className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition cursor-pointer"
                                  title={dict.deleteReminderBtn}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                    </>
                  )}
                </div>
              </motion.div>
            )}

            {/* TAB 2: DATE DIFFERENCE */}
            {activeTab === 'diff' && (
              <motion.div 
                key="diff-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-4"
              >
                {/* Form Controls */}
                <div id="diff-input-card" className="lg:col-span-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4 h-fit">
                  <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-1 h-3.5 bg-indigo-600 rounded-full"></span>
                    {dict.tabDiff}
                  </h3>
                  
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {dict.startDateLabel}
                    </label>
                    <input 
                      type="date" 
                      id="input-diff-start"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className={`w-full text-xs rounded p-2 focus:outline-none font-mono transition-all ${
                        isDiffDateInvalid
                          ? 'bg-slate-50 border border-red-200 text-slate-800'
                          : 'bg-slate-50 border border-slate-200 text-slate-800 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500'
                      }`}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider flex items-center justify-between">
                      <span className={`flex items-center gap-1 ${isDiffDateInvalid ? 'text-red-600 font-extrabold' : 'text-slate-400'}`}>
                        <Calendar className="w-3 h-3" />
                        {dict.endDateLabel}
                      </span>
                      {isDiffDateInvalid && (
                        <span className="text-[9px] font-extrabold text-red-600 flex items-center gap-0.5 animate-pulse">
                          <AlertTriangle className="w-3 h-3" />
                          {dict.invalidDateTitle}
                        </span>
                      )}
                    </label>
                    <input 
                      type="date" 
                      id="input-diff-end"
                      value={endDate}
                      min={startDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className={`w-full text-xs rounded p-2 focus:outline-none font-mono transition-all ${
                        isDiffDateInvalid 
                          ? 'bg-red-50/50 border-2 border-red-400 text-red-900 focus:ring-2 focus:ring-red-400' 
                          : 'bg-slate-50 border border-slate-200 text-slate-800 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500'
                      }`}
                    />
                    {isDiffDateInvalid && (
                      <p id="diff-date-validation-error" className="text-[10px] font-semibold text-red-600 flex items-start gap-1 mt-1 leading-snug">
                        <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                        <span>{dict.invalidDateDiffError}</span>
                      </p>
                    )}
                  </div>

                  {/* Date Difference Quick-Select Buttons */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                      {dict.quickSelectLabel}
                    </span>
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleQuickSelect('last30')}
                        className="py-1 px-1.5 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 text-slate-600 hover:text-indigo-700 text-[10px] font-bold uppercase tracking-wider rounded transition cursor-pointer text-center"
                      >
                        {dict.quickSelectLast30}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickSelect('next30')}
                        className="py-1 px-1.5 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 text-slate-600 hover:text-indigo-700 text-[10px] font-bold uppercase tracking-wider rounded transition cursor-pointer text-center"
                      >
                        {dict.quickSelectNext30}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickSelect('jan1')}
                        className="py-1 px-1.5 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 text-slate-600 hover:text-indigo-700 text-[10px] font-bold uppercase tracking-wider rounded transition cursor-pointer text-center animate-none"
                      >
                        {dict.quickSelectSinceJan1}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickSelect('today')}
                        className="py-1 px-1.5 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 text-slate-600 hover:text-indigo-700 text-[10px] font-bold uppercase tracking-wider rounded transition cursor-pointer text-center"
                      >
                        {dict.quickSelectToday}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-150">
                    <label className="flex items-center gap-2.5 cursor-pointer group">
                      <input 
                        type="checkbox" 
                        id="check-exclude-weekends"
                        checked={excludeWeekends}
                        onChange={(e) => setExcludeWeekends(e.target.checked)}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5" 
                      />
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider group-hover:text-slate-800 transition">{dict.excludeWeekendsLabel}</span>
                    </label>

                    <label className="flex items-center gap-2.5 cursor-pointer group">
                      <input 
                        type="checkbox" 
                        id="check-include-end"
                        checked={includeEndDate}
                        onChange={(e) => setIncludeEndDate(e.target.checked)}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5" 
                      />
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider group-hover:text-slate-800 transition">{dict.includeEndDateLabel}</span>
                    </label>
                  </div>
                </div>

                {/* Results Visualizer */}
                <div id="diff-results-pane" className="lg:col-span-8 space-y-4">
                  {isDiffDateInvalid ? (
                    <div id="diff-invalid-alert-card" className="bg-gradient-to-br from-red-50 via-white to-amber-50/40 border-2 border-red-200 p-5 rounded-xl shadow-xs space-y-4">
                      <div className="flex items-start gap-3.5">
                        <div className="w-11 h-11 rounded-xl bg-red-100 border border-red-200 text-red-600 flex items-center justify-center shrink-0 shadow-2xs">
                          <AlertTriangle className="w-6 h-6 text-red-600" />
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-extrabold text-sm text-red-950 uppercase tracking-wider flex items-center gap-2">
                            {dict.invalidDateTitle}
                          </h4>
                          <p className="text-xs font-medium text-red-800 leading-relaxed">
                            {dict.invalidDateDiffError}
                          </p>
                          <div className="pt-1.5 flex flex-wrap items-center gap-3 text-[11px] font-mono text-red-700">
                            <span className="bg-white/80 px-2 py-0.5 rounded border border-red-100 shadow-2xs">
                              {dict.startDateLabel}: <strong className="text-red-900">{startDate}</strong>
                            </span>
                            <span className="text-red-400 font-bold">➔</span>
                            <span className="bg-red-100/80 px-2 py-0.5 rounded border border-red-200 text-red-900 font-bold shadow-2xs">
                              {dict.endDateLabel}: <strong>{endDate}</strong>
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2.5 pt-3 border-t border-red-150">
                        <button
                          type="button"
                          id="btn-swap-dates"
                          onClick={handleSwapDiffDates}
                          className="py-2 px-3.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-all duration-150 flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                        >
                          <ArrowLeftRight className="w-3.5 h-3.5" />
                          {dict.swapDatesBtn}
                        </button>

                        <button
                          type="button"
                          id="btn-reset-dates"
                          onClick={() => handleQuickSelect('last30')}
                          className="py-2 px-3.5 bg-white hover:bg-red-50 text-red-700 border border-red-200 text-xs font-bold rounded-lg transition-all duration-150 cursor-pointer shadow-2xs"
                        >
                          {dict.resetDatesBtn}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                  <div className="bg-indigo-50/40 border border-indigo-100 p-4 rounded-xl shadow-sm">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="text-[10px] font-bold text-indigo-600 tracking-wider uppercase flex items-center gap-1.5">
                        <span className="w-1 h-3 bg-indigo-600 rounded-full"></span>
                        {dict.diffResultTitle}
                      </h4>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setShareType('diff');
                            setShareModalOpen(true);
                          }}
                          className="py-1 px-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[9px] font-bold uppercase tracking-wider rounded transition flex items-center gap-1 cursor-pointer border border-indigo-100"
                        >
                          <Share2 className="w-3 h-3 text-indigo-600" />
                          {dict.shareBtn}
                        </button>
                        <button
                          type="button"
                          onClick={() => saveCalculationToHistory('diff')}
                          className="py-1 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[9px] font-bold uppercase tracking-wider rounded transition flex items-center gap-1 cursor-pointer border border-slate-200"
                        >
                          <Save className="w-3 h-3 text-slate-500" />
                          {dict.historySaveBtn}
                        </button>
                        <button
                          type="button"
                          onClick={handlePrint}
                          className="py-1 px-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[9px] font-bold uppercase tracking-wider rounded transition flex items-center gap-1 cursor-pointer border border-indigo-100"
                        >
                          <Printer className="w-3 h-3 text-indigo-600" />
                          {dict.printBtn}
                        </button>
                        <button
                          type="button"
                          onClick={handleExportPDF}
                          className="py-1 px-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[9px] font-bold uppercase tracking-wider rounded transition flex items-center gap-1 cursor-pointer shadow-xs"
                        >
                          <FileDown className="w-3 h-3" />
                          {dict.exportPdfBtn}
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row justify-between items-stretch gap-3 bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
                      <div className="flex-1 flex flex-col justify-center text-center sm:text-left p-1">
                        <span className="block text-4xl font-black text-slate-900 font-mono tracking-tight">{diffResults.totalDays}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{dict.totalCalendarDays}</span>
                      </div>
                      
                      <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-3 flex items-center gap-3 flex-1">
                        <Briefcase className="w-5 h-5 text-emerald-600 shrink-0" />
                        <div>
                          <span className="block text-xl font-bold text-emerald-800 font-mono">{diffResults.workingDays}</span>
                          <span className="text-[9px] text-emerald-600 font-bold uppercase tracking-wider">{dict.workingDaysOnly}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Months & Days Apart */}
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-1 h-3 bg-indigo-600 rounded-full"></span>
                      {mLocal.monthsAndDaysTitle}
                    </h4>
                    <p className="text-[10px] text-slate-400 -mt-1 uppercase font-medium">
                      {mLocal.monthsAndDaysDesc}
                    </p>
                    
                    <div className="bg-indigo-50/30 border border-indigo-100 rounded-lg p-4 flex flex-col sm:flex-row items-center justify-around gap-4 text-center">
                      <div>
                        <span className="block text-3xl font-black text-indigo-950 font-mono">{diffResults.totalMonthsApart}</span>
                        <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">{dict.months}</span>
                      </div>
                      <div className="text-xl font-black text-slate-400 sm:block hidden">+</div>
                      <div>
                        <span className="block text-3xl font-black text-indigo-950 font-mono">{diffResults.monthsAndDaysDays}</span>
                        <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">{dict.days}</span>
                      </div>
                      <div className="sm:border-l border-indigo-100 sm:pl-6 text-center sm:text-left">
                        <span className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">{mLocal.exactSpan}</span>
                        <span className="block text-sm font-extrabold text-slate-800">
                          {diffResults.totalMonthsApart} {diffResults.totalMonthsApart === 1 ? (lang === 'DE' ? 'Monat' : lang === 'FR' ? 'mois' : lang === 'ES' ? 'mes' : lang === 'IT' ? 'mese' : 'Month') : dict.months} {mLocal.and} {diffResults.monthsAndDaysDays} {diffResults.monthsAndDaysDays === 1 ? (lang === 'DE' ? 'Tag' : lang === 'FR' ? 'jour' : lang === 'ES' ? 'día' : lang === 'IT' ? 'giorno' : 'Day') : dict.days}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Alternate Breakdowns */}
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-1 h-3 bg-indigo-600 rounded-full"></span>
                      {dict.alternateFormats}
                    </h4>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="bg-slate-50 p-3 rounded-lg text-center border border-slate-200/50">
                        <span className="block text-lg font-bold text-slate-800 font-mono">{diffResults.years}</span>
                        <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">{dict.years}</span>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-lg text-center border border-slate-200/50">
                        <span className="block text-lg font-bold text-slate-800 font-mono">{diffResults.months}</span>
                        <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">{dict.months}</span>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-lg text-center border border-slate-200/50">
                        <span className="block text-lg font-bold text-slate-800 font-mono">{diffResults.weeks}</span>
                        <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">{dict.weeks}</span>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-lg text-center border border-slate-200/50">
                        <span className="block text-lg font-bold text-slate-800 font-mono">{diffResults.days}</span>
                        <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">{dict.days}</span>
                      </div>
                    </div>

                    <div className="border-t border-slate-100 pt-3 grid grid-cols-1 sm:grid-cols-3 gap-2 text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                      <div className="flex justify-between items-center p-2 rounded bg-slate-50 border border-slate-200/40">
                        <span>Total Hours:</span>
                        <span className="font-bold text-slate-800 font-mono">
                          {new Intl.NumberFormat().format(diffResults.hours)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-2 rounded bg-slate-50 border border-slate-200/40">
                        <span>Total Minutes:</span>
                        <span className="font-bold text-slate-800 font-mono">
                          {new Intl.NumberFormat().format(diffResults.minutes)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-2 rounded bg-slate-50 border border-slate-200/40">
                        <span>Total Seconds:</span>
                        <span className="font-bold text-slate-800 font-mono">
                          {new Intl.NumberFormat().format(diffResults.seconds)}
                        </span>
                      </div>
                    </div>
                  </div>
                    </>
                  )}
                </div>
              </motion.div>
            )}

            {/* TAB 3: DURATION ADD/SUBTRACT */}
            {activeTab === 'duration' && (
              <motion.div 
                key="duration-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-4"
              >
                {/* Form Controls */}
                <div id="duration-input-card" className="lg:col-span-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4 h-fit">
                  <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-1 h-3.5 bg-indigo-600 rounded-full"></span>
                    {dict.tabDuration}
                  </h3>
                  
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {dict.startDateLabel}
                    </label>
                    <input 
                      type="date" 
                      id="input-dur-start"
                      value={durStartDate}
                      onChange={(e) => setDurStartDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded p-2 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      {dict.operationLabel}
                    </label>
                    <select 
                      id="select-dur-op"
                      value={durOperation}
                      onChange={(e) => setDurOperation(e.target.value as 'add' | 'subtract')}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded p-2 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 font-bold"
                    >
                      <option value="add">{dict.opAdd}</option>
                      <option value="subtract">{dict.opSubtract}</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div className="space-y-0.5">
                      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{dict.years}</label>
                      <input 
                        type="number" 
                        id="input-dur-years"
                        value={durYears}
                        min="0"
                        onChange={(e) => setDurYears(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded p-1.5 text-center font-bold focus:outline-none"
                      />
                    </div>
                    <div className="space-y-0.5">
                      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{dict.months}</label>
                      <input 
                        type="number" 
                        id="input-dur-months"
                        value={durMonths}
                        min="0"
                        onChange={(e) => setDurMonths(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded p-1.5 text-center font-bold focus:outline-none"
                      />
                    </div>
                    <div className="space-y-0.5">
                      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{dict.weeks}</label>
                      <input 
                        type="number" 
                        id="input-dur-weeks"
                        value={durWeeks}
                        min="0"
                        onChange={(e) => setDurWeeks(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded p-1.5 text-center font-bold focus:outline-none"
                      />
                    </div>
                    <div className="space-y-0.5">
                      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{dict.days}</label>
                      <input 
                        type="number" 
                        id="input-dur-days"
                        value={durDays}
                        min="0"
                        onChange={(e) => setDurDays(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded p-1.5 text-center font-bold focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-150">
                    <label className="flex items-center gap-2.5 cursor-pointer group">
                      <input 
                        type="checkbox" 
                        id="check-dur-skip-weekends"
                        checked={durSkipWeekends}
                        onChange={(e) => setDurSkipWeekends(e.target.checked)}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5" 
                      />
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider group-hover:text-slate-800 transition">{dict.excludeWeekendsLabel}</span>
                    </label>
                  </div>
                </div>

                {/* Results Pane */}
                <div id="duration-results-pane" className="lg:col-span-8">
                  <div className="bg-indigo-50/40 border border-indigo-100 p-6 rounded-xl shadow-sm text-center flex flex-col items-center justify-center min-h-[280px]">
                    <div className="w-full flex justify-between items-center mb-3">
                      <h4 className="text-[10px] font-bold text-indigo-600 tracking-wider uppercase flex items-center gap-1.5">
                        <span className="w-1 h-3 bg-indigo-600 rounded-full"></span>
                        {dict.resultingDateLabel}
                      </h4>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setShareType('duration');
                            setShareModalOpen(true);
                          }}
                          className="py-1 px-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[9px] font-bold uppercase tracking-wider rounded transition flex items-center gap-1 cursor-pointer border border-indigo-100"
                        >
                          <Share2 className="w-3 h-3 text-indigo-600" />
                          {dict.shareBtn}
                        </button>
                        <button
                          type="button"
                          onClick={() => saveCalculationToHistory('duration')}
                          className="py-1 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[9px] font-bold uppercase tracking-wider rounded transition flex items-center gap-1 cursor-pointer border border-slate-200"
                        >
                          <Save className="w-3 h-3 text-slate-500" />
                          {dict.historySaveBtn}
                        </button>
                        <button
                          type="button"
                          onClick={handlePrint}
                          className="py-1 px-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[9px] font-bold uppercase tracking-wider rounded transition flex items-center gap-1 cursor-pointer border border-indigo-100"
                        >
                          <Printer className="w-3 h-3 text-indigo-600" />
                          {dict.printBtn}
                        </button>
                        <button
                          type="button"
                          onClick={handleExportPDF}
                          className="py-1 px-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[9px] font-bold uppercase tracking-wider rounded transition flex items-center gap-1 cursor-pointer shadow-xs"
                        >
                          <FileDown className="w-3 h-3" />
                          {dict.exportPdfBtn}
                        </button>
                      </div>
                    </div>
                    
                    <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm inline-block min-w-[240px] max-w-full">
                      <span className="text-3xl font-black text-indigo-600 block mb-2 font-mono tracking-tight">
                        {durationResult.formatted || '--/--/----'}
                      </span>
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 uppercase tracking-wider">
                        {durationResult.dayOfWeek || '---'}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* 3. Advanced European Market SEO & Content Blocks */}
        <section id="seo-accordion-about" className="mt-12 border-t border-slate-200 pt-8 space-y-8">
          
          {/* FAQ Accordions Section */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <span className="w-1 h-3.5 bg-indigo-600 rounded-full"></span>
              {dict.faqTitle}
            </h3>
            
            <div className="space-y-2">
              {faqs.map((faq, idx) => (
                <div 
                  key={idx} 
                  className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden transition duration-150"
                >
                  <button
                    onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                    className="w-full flex justify-between items-center p-3.5 text-left font-bold text-slate-700 hover:text-indigo-600 transition focus:outline-none"
                  >
                    <span className="text-[11px] uppercase tracking-wider">{faq.question}</span>
                    <ChevronDown 
                      className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform duration-200 ${
                        expandedFaq === idx ? 'rotate-180 text-indigo-600' : ''
                      }`} 
                    />
                  </button>
                  
                  <AnimatePresence initial={false}>
                    {expandedFaq === idx && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.15 }}
                      >
                        <div className="px-3.5 pb-3.5 pt-1 text-[11px] text-slate-500 leading-normal border-t border-slate-100">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>

          {/* About Section */}
          <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <span className="w-1 h-3.5 bg-indigo-600 rounded-full"></span>
              {dict.aboutTitle}
            </h3>
            <p className="text-[11px] text-slate-500 leading-normal">{dict.aboutP1}</p>
            <p className="text-[11px] text-slate-500 leading-normal">{dict.aboutP2}</p>
            <p className="text-[11px] text-slate-500 leading-normal">{dict.aboutP3}</p>
          </div>
        </section>

        {/* 4. Single-File Export Panel */}
        <section className="mt-8 bg-indigo-50/50 border border-indigo-100 p-5 rounded-xl flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="space-y-1">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Download className="w-3.5 h-3.5 text-indigo-600" />
              {dict.exportTitle}
            </h3>
            <p className="text-[10px] text-slate-500 max-w-xl leading-normal uppercase font-semibold tracking-wide">
              {dict.exportDesc}
            </p>
          </div>
          <button 
            id="download-netlify-btn"
            onClick={triggerSingleFileDownload}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] uppercase tracking-wider px-4 py-2.5 rounded transition shadow-xs shrink-0 flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            {dict.exportBtn}
          </button>
        </section>
      </main>

      {/* 5. Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-[10px] font-bold uppercase tracking-wider text-slate-400">
        <div className="max-w-7xl mx-auto px-6 space-y-2">
          <p>© 2026 {dict.title}. Built for European Precision & Compliance.</p>
          <div className="flex justify-center gap-4">
            <button 
              id="footer-privacy-btn"
              onClick={() => setShowPrivacyModal(true)} 
              className="hover:text-indigo-600 transition underline flex items-center gap-1"
            >
              <Scale className="w-3.5 h-3.5" />
              {dict.gdprLearnMore}
            </button>
          </div>
        </div>
      </footer>

      {/* GDPR Consent Banner */}
      <AnimatePresence>
        {!gdprDismissed && (
          <motion.div 
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-0 left-0 right-0 bg-slate-900 text-white p-4 border-t border-slate-800 z-50 flex flex-col md:flex-row justify-between items-center gap-3 shadow-xl"
          >
            <div className="max-w-4xl flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
              <p className="text-[10px] text-slate-300 leading-normal font-medium">
                {dict.gdprNotice}
              </p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button 
                id="gdpr-accept-all"
                onClick={handleDismissGdpr} 
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold uppercase tracking-wider px-3.5 py-2 rounded transition cursor-pointer"
              >
                {dict.gdprAcceptAll}
              </button>
              <button 
                id="gdpr-accept-essential"
                onClick={handleDismissGdpr} 
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold uppercase tracking-wider px-3.5 py-2 rounded transition border border-slate-700 cursor-pointer"
              >
                {dict.gdprEssentialOnly}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* GDPR Privacy Modal */}
      <AnimatePresence>
        {showPrivacyModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4 z-50"
          >
            <motion.div 
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-xl border border-slate-200 max-w-2xl w-full p-5 space-y-3.5 max-h-[90vh] overflow-y-auto shadow-xl"
            >
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  {dict.privacyModalTitle}
                </h3>
              </div>
              <p className="text-[11px] text-slate-500 leading-normal">{dict.privacyModalBody1}</p>
              <p className="text-[11px] text-slate-500 leading-normal">{dict.privacyModalBody2}</p>
              <p className="text-[11px] text-slate-500 leading-normal">{dict.privacyModalBody3}</p>
              <div className="border-t border-slate-100 pt-3 flex justify-end">
                <button 
                  id="privacy-close-btn"
                  onClick={() => setShowPrivacyModal(false)}
                  className="bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-bold uppercase tracking-wider px-4 py-2 rounded transition cursor-pointer"
                >
                  {dict.close}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Calculation History Drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawerOpen(false)}
              className="absolute inset-0 bg-slate-950/40 backdrop-blur-xs cursor-pointer"
            />

            {/* Slide-out Panel container */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 26, stiffness: 220 }}
              className="relative w-full max-w-md bg-white border-l border-slate-200 shadow-2xl flex flex-col h-full z-10"
            >
              {/* Header */}
              <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-indigo-600 animate-pulse" />
                  <h2 className="text-xs font-bold text-slate-950 uppercase tracking-wider">
                    {dict.historyTitle} ({history.length})
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setDrawerOpen(false)}
                    className="text-slate-400 hover:text-indigo-600 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded hover:bg-slate-100 transition cursor-pointer"
                  >
                    {dict.historyClose}
                  </button>
                </div>
              </div>

              {/* Export Toolbar */}
              {history.length > 0 && (
                <div id="history-export-actions-bar" className="bg-indigo-50/60 border-b border-indigo-100/80 px-4 py-2.5 flex flex-col gap-2 shrink-0">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-indigo-600" />
                      <span>{dict.export30DaysPdfDesc}</span>
                    </span>
                    <span className="text-[9px] font-mono font-bold text-indigo-600 bg-indigo-100/80 px-1.5 py-0.5 rounded">
                      {history.length} Logs
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      id="btn-export-30days-pdf"
                      onClick={handleExportHistory30DaysPDF}
                      className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[10px] font-extrabold uppercase tracking-wider transition cursor-pointer shadow-xs active:scale-95"
                      title={dict.export30DaysPdfDesc}
                    >
                      <FileText className="w-3.5 h-3.5 text-white shrink-0" />
                      <span>{dict.export30DaysPdfBtn}</span>
                    </button>

                    <button
                      id="history-export-csv"
                      onClick={handleExportCSV}
                      className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-[10px] font-bold uppercase tracking-wider transition cursor-pointer shadow-2xs"
                      title={hLocal.exportCsvDesc}
                    >
                      <Download className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>CSV Export</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Scrollable list of history items */}
              <div className="flex-grow p-5 overflow-y-auto space-y-4">
                {history.length === 0 ? (
                  <div className="text-center py-16 text-slate-400 space-y-3">
                    <History className="w-10 h-10 mx-auto stroke-1" />
                    <p className="text-[10px] font-bold uppercase tracking-widest">{dict.historyEmpty}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {history.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => loadHistoryItem(item)}
                        className="group relative bg-slate-50 p-4 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/20 transition cursor-pointer flex flex-col gap-2.5"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-1.5">
                            <span className={`text-[8px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded border ${
                              item.type === 'age' 
                                ? 'bg-indigo-50 border-indigo-200 text-indigo-700' 
                                : item.type === 'diff' 
                                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                                  : 'bg-purple-50 border-purple-200 text-purple-700'
                            }`}>
                              {item.type === 'age' ? dict.tabAge : item.type === 'diff' ? dict.tabDiff : dict.tabDuration}
                            </span>
                            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">
                              {item.timestamp}
                            </span>
                          </div>
                          
                          <button
                            onClick={(e) => deleteHistoryItem(item.id, e)}
                            className="p-1 rounded text-slate-400 hover:text-red-500 hover:bg-red-50 transition cursor-pointer"
                            title={dict.historyDelete}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="space-y-1">
                          <p className="text-[10px] font-extrabold text-slate-700 uppercase tracking-wider leading-none">
                            {item.summary}
                          </p>
                          <div className="flex flex-wrap items-center gap-x-2 text-[9px] text-slate-500 uppercase font-semibold">
                            {item.type === 'age' && (
                              <span>
                                {dict.years}: <strong className="text-indigo-600 font-mono">{item.results.years}</strong> | {dict.months}: <strong className="text-indigo-600 font-mono">{item.results.months}</strong> | {dict.days}: <strong className="text-indigo-600 font-mono">{item.results.days}</strong>
                              </span>
                            )}
                            {item.type === 'diff' && (
                              <span>
                                {dict.totalCalendarDays}: <strong className="text-emerald-600 font-mono">{item.results.totalDays}</strong> | {dict.workingDaysOnly.split('(')[0]}: <strong className="text-emerald-600 font-mono">{item.results.workingDays}</strong>
                              </span>
                            )}
                            {item.type === 'duration' && (
                              <span>
                                {dict.resultingDateLabel}: <strong className="text-purple-600 font-mono">{item.results.resultDate}</strong> ({item.results.dayOfWeek})
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="absolute right-4 bottom-4 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-[8px] font-extrabold text-indigo-600 uppercase tracking-widest">
                          <span>{dict.historyLoad}</span>
                          <span>➔</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Clear History Footer button */}
              {history.length > 0 && (
                <div className="p-4 bg-slate-50 border-t border-slate-200">
                  <button
                    onClick={clearHistory}
                    className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 hover:border-red-300 rounded text-[10px] font-bold uppercase tracking-wider transition cursor-pointer animate-none"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    {dict.historyClearBtn}
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Localized Share Modal */}
      <AnimatePresence>
        {shareModalOpen && (() => {
          const shareData = generateShareData(shareType);
          return (
            <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShareModalOpen(false)}
                className="absolute inset-0 bg-slate-950/50 backdrop-blur-xs cursor-pointer"
              />

              {/* Modal Container */}
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 15 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 15 }}
                transition={{ type: "spring", damping: 25, stiffness: 350 }}
                className="relative w-full max-w-md bg-white rounded-xl border border-slate-200 shadow-2xl overflow-hidden z-10 flex flex-col"
              >
                {/* Header */}
                <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Share2 className="w-4 h-4 text-indigo-600 animate-pulse" />
                    <h2 className="text-xs font-bold text-slate-950 uppercase tracking-wider">
                      {dict.shareModalTitle}
                    </h2>
                  </div>
                  <button
                    onClick={() => setShareModalOpen(false)}
                    className="text-slate-400 hover:text-indigo-600 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded hover:bg-slate-100 transition cursor-pointer"
                  >
                    {dict.close}
                  </button>
                </div>

                {/* Body */}
                <div className="p-5 space-y-4">
                  <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wide leading-relaxed">
                    {dict.shareModalDesc}
                  </p>

                  {/* Message Preview */}
                  <div className="space-y-1">
                    <span className="text-[8px] font-extrabold text-slate-400 uppercase tracking-widest block">
                      Message Preview
                    </span>
                    <div className="bg-slate-50 rounded-lg p-3.5 border border-slate-150 relative">
                      <p className="text-[10px] font-semibold text-slate-700 leading-normal">
                        {shareData.text}
                      </p>
                      <span className="text-[9px] font-mono text-indigo-500 font-bold break-all mt-1.5 block hover:underline">
                        {shareData.url}
                      </span>
                    </div>
                  </div>

                  {/* Input link field */}
                  <div className="space-y-1">
                    <span className="text-[8px] font-extrabold text-slate-400 uppercase tracking-widest block">
                      Shareable URL
                    </span>
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        readOnly
                        value={shareData.url}
                        className="flex-1 bg-slate-50 border border-slate-200 text-slate-600 text-[10px] rounded p-2 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono select-all"
                        onClick={(e) => (e.target as HTMLInputElement).select()}
                      />
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(shareData.url);
                          setToastMessage(dict.shareCopiedToast);
                          setTimeout(() => setToastMessage(null), 3000);
                        }}
                        className="px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[9px] font-bold uppercase tracking-wider rounded transition flex items-center gap-1 cursor-pointer border border-slate-200 shrink-0"
                      >
                        <Copy className="w-3.5 h-3.5 text-slate-500" />
                        {dict.shareCopyLink}
                      </button>
                    </div>
                  </div>

                  {/* Share buttons grid */}
                  <div className="grid grid-cols-1 gap-2 pt-2">
                    {/* Twitter */}
                    <a
                      href={`https://x.com/intent/tweet?text=${encodeURIComponent(shareData.text)}&url=${encodeURIComponent(shareData.url)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-950 hover:bg-slate-900 text-white rounded text-[10px] font-bold uppercase tracking-wider transition shadow-sm cursor-pointer"
                    >
                      <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                      </svg>
                      {dict.shareTwitter}
                    </a>

                    {/* WhatsApp */}
                    <a
                      href={`https://api.whatsapp.com/send?text=${encodeURIComponent(shareData.text + ' ' + shareData.url)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#25D366] hover:bg-[#20ba59] text-white rounded text-[10px] font-bold uppercase tracking-wider transition shadow-sm cursor-pointer"
                    >
                      <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.717-1.456L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.965C16.528 3.977 14.07 2.95 11.478 2.95c-5.44 0-9.866 4.372-9.87 9.802 0 1.714.47 3.388 1.358 4.878l-.993 3.624 3.73-.974h.01c1.554.832 3.193 1.272 4.834 1.272zm11.107-7.53c-.307-.152-1.815-.885-2.096-.985-.281-.1-.485-.152-.689.152-.204.304-.79.985-.97 1.18-.18.196-.359.219-.665.067-.307-.152-1.295-.472-2.467-1.504-.913-.805-1.53-1.8-1.71-2.103-.18-.304-.018-.468.134-.62.137-.136.306-.354.459-.53.153-.177.204-.304.306-.508.102-.203.05-.382-.025-.534-.076-.152-.688-1.634-.943-2.232-.249-.593-.502-.511-.689-.52l-.587-.01c-.204 0-.536.076-.816.38-.28.304-1.071 1.033-1.071 2.518s1.097 2.915 1.25 3.118c.153.203 2.158 3.255 5.228 4.551.73.308 1.3.493 1.745.632.733.23 1.401.197 1.928.12.588-.086 1.815-.734 2.071-1.406.255-.672.255-1.246.179-1.366-.076-.12-.281-.196-.588-.348z"/>
                      </svg>
                      {dict.shareWhatsApp}
                    </a>

                    {/* LinkedIn */}
                    <a
                      href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareData.url)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0A66C2] hover:bg-[#0855a1] text-white rounded text-[10px] font-bold uppercase tracking-wider transition shadow-sm cursor-pointer"
                    >
                      <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                      {dict.shareLinkedIn}
                    </a>
                  </div>

                </div>
              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>

      {/* Add Birthday Reminder Modal */}
      <AnimatePresence>
        {addReminderModalOpen && (
          <div id="add-reminder-modal-overlay" className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-md w-full p-5 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                    <Gift className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-xs sm:text-sm text-slate-900 uppercase tracking-wider">
                      {dict.addBirthdayReminderBtn}
                    </h3>
                    <p className="text-[10px] text-slate-400">
                      Saved locally in browser storage (GDPR Compliant)
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  id="btn-close-reminder-modal"
                  onClick={() => setAddReminderModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveBirthdayReminder} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    {dict.reminderNameLabel} *
                  </label>
                  <input
                    type="text"
                    required
                    id="input-reminder-name"
                    value={reminderName}
                    onChange={(e) => setReminderName(e.target.value)}
                    placeholder={dict.reminderNamePlaceholder}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    {dict.reminderDateLabel} *
                  </label>
                  <input
                    type="date"
                    required
                    id="input-reminder-date"
                    value={reminderDate}
                    onChange={(e) => setReminderDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    {dict.reminderNoteLabel}
                  </label>
                  <input
                    type="text"
                    id="input-reminder-note"
                    value={reminderNote}
                    onChange={(e) => setReminderNote(e.target.value)}
                    placeholder={dict.reminderNotePlaceholder}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setAddReminderModalOpen(false)}
                    className="py-2 px-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition cursor-pointer"
                  >
                    {dict.close}
                  </button>
                  <button
                    type="submit"
                    id="btn-submit-save-reminder"
                    className="py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition cursor-pointer shadow-xs"
                  >
                    {dict.saveReminderBtn}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating compiled toast message */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-6 right-6 bg-slate-900 text-white px-4 py-2.5 rounded border border-slate-800 shadow-lg z-50 text-[10px] font-bold uppercase tracking-wider flex items-center gap-2 max-w-sm"
          >
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 6. Printer-Friendly Report (Visible only during printing) */}
      <div id="print-section" className="hidden print:block font-sans text-slate-900 p-8">
        <div className="border-b-2 border-slate-900 pb-4 mb-6">
          <div className="flex justify-between items-end">
            <div>
              <h1 className="text-xl font-black tracking-tight uppercase text-slate-900">
                {dict.title}
              </h1>
              <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mt-0.5">
                {dict.subtitle}
              </p>
            </div>
            <div className="text-right text-[10px] text-slate-500 font-bold uppercase tracking-wider">
              <div>Report Date: {new Date().toLocaleDateString(lang === 'DE' ? 'de-DE' : lang === 'FR' ? 'fr-FR' : lang === 'ES' ? 'es-ES' : lang === 'IT' ? 'it-IT' : 'en-GB', { dateStyle: 'long' })}</div>
              <div>System Status: Certified Accurate</div>
            </div>
          </div>
        </div>

        <h2 className="text-sm font-extrabold uppercase tracking-widest text-slate-800 mb-4 border-b border-slate-200 pb-1">
          {activeTab === 'age' ? 'Exact Age Report' : activeTab === 'diff' ? 'Date Difference Report' : 'Target Date offset Report'}
        </h2>

        {/* Input Parameters Section */}
        <div className="mb-6 bg-slate-50 p-4 rounded border border-slate-200">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
            Configuration Details
          </h3>
          <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-[11px]">
            {activeTab === 'age' && (
              <>
                <div><span className="font-bold text-slate-500 uppercase tracking-wider">Date of Birth:</span> {birthDate} {birthTime}</div>
                <div><span className="font-bold text-slate-500 uppercase tracking-wider">Calculation Date:</span> {calcDate}</div>
                <div><span className="font-bold text-slate-500 uppercase tracking-wider">Target Milestone:</span> {targetMilestone} years</div>
              </>
            )}
            {activeTab === 'diff' && (
              <>
                <div><span className="font-bold text-slate-500 uppercase tracking-wider">Start Date:</span> {startDate}</div>
                <div><span className="font-bold text-slate-500 uppercase tracking-wider">End Date:</span> {endDate}</div>
                <div><span className="font-bold text-slate-500 uppercase tracking-wider">Exclude Weekends:</span> {excludeWeekends ? 'Yes' : 'No'}</div>
                <div><span className="font-bold text-slate-500 uppercase tracking-wider">Include End Date:</span> {includeEndDate ? 'Yes' : 'No'}</div>
              </>
            )}
            {activeTab === 'duration' && (
              <>
                <div><span className="font-bold text-slate-500 uppercase tracking-wider">Start Date:</span> {durStartDate}</div>
                <div><span className="font-bold text-slate-500 uppercase tracking-wider">Operation:</span> {durOperation === 'add' ? 'Add Time' : 'Subtract Time'}</div>
                <div><span className="font-bold text-slate-500 uppercase tracking-wider">Duration offset:</span> {durYears}Y {durMonths}M {durWeeks}W {durDays}D</div>
                <div><span className="font-bold text-slate-500 uppercase tracking-wider">Skip Weekends:</span> {durSkipWeekends ? 'Yes' : 'No'}</div>
              </>
            )}
          </div>
        </div>

        {/* Calculation Results Section */}
        <div className="mb-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
            Calculated Results
          </h3>

          {activeTab === 'age' && (
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-3">
                <div className="bg-indigo-50/20 p-3 rounded border border-indigo-100 text-center">
                  <span className="block text-xl font-black text-slate-900 font-mono">{ageResults.years}</span>
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">{dict.years}</span>
                </div>
                <div className="bg-indigo-50/20 p-3 rounded border border-indigo-100 text-center">
                  <span className="block text-xl font-black text-slate-900 font-mono">{ageResults.months}</span>
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">{dict.months}</span>
                </div>
                <div className="bg-indigo-50/20 p-3 rounded border border-indigo-100 text-center">
                  <span className="block text-xl font-black text-slate-900 font-mono">{ageResults.days}</span>
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">{dict.days}</span>
                </div>
                <div className="bg-indigo-50/20 p-3 rounded border border-indigo-100 text-center">
                  <span className="block text-xl font-black text-slate-900 font-mono">{ageResults.weeks}</span>
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">{dict.weeks}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-slate-50 p-2 rounded border border-slate-200">
                  <span className="block text-xs font-bold font-mono text-slate-800">{ageResults.hours}</span>
                  <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider">{dict.hours}</span>
                </div>
                <div className="bg-slate-50 p-2 rounded border border-slate-200">
                  <span className="block text-xs font-bold font-mono text-slate-800">{ageResults.minutes}</span>
                  <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider">{dict.minutes}</span>
                </div>
                <div className="bg-slate-50 p-2 rounded border border-slate-200">
                  <span className="block text-xs font-bold font-mono text-slate-800">{ageResults.seconds}</span>
                  <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider">{dict.seconds}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="p-3 bg-slate-50 rounded border border-slate-200 text-xs">
                  <h4 className="font-bold uppercase tracking-wider text-[9px] text-slate-500 mb-1">{dict.statsTitle}</h4>
                  <div className="space-y-1">
                    <div><span className="font-semibold text-slate-500">{dict.westernZodiac}:</span> {ageResults.westernZodiac.symbol} {ageResults.westernZodiac.name}</div>
                    <div><span className="font-semibold text-slate-500">{dict.chineseZodiac}:</span> {ageResults.chineseZodiac.emoji} {ageResults.chineseZodiac.name}</div>
                    <div><span className="font-semibold text-slate-500">Life Decimal:</span> {ageDecimal.toFixed(4)} Years</div>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded border border-slate-200 text-xs">
                  <h4 className="font-bold uppercase tracking-wider text-[9px] text-slate-500 mb-1">{dict.nextBirthdayTitle}</h4>
                  <div className="space-y-1">
                    <div><span className="font-semibold text-slate-500">In:</span> {ageResults.nextBirthday.months} months, {ageResults.nextBirthday.days} days</div>
                    <div><span className="font-semibold text-slate-500">Total days remaining:</span> {ageResults.nextBirthday.totalDaysLeft} days</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'diff' && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-indigo-50/20 p-3 rounded border border-indigo-100">
                  <span className="block text-2xl font-black text-slate-900 font-mono">{diffResults.totalDays}</span>
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">{dict.totalCalendarDays}</span>
                </div>
                <div className="bg-indigo-50/20 p-3 rounded border border-indigo-100">
                  <span className="block text-2xl font-black text-slate-900 font-mono">{diffResults.workingDays}</span>
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">{dict.workingDaysOnly}</span>
                </div>
                <div className="bg-indigo-50/20 p-3 rounded border border-indigo-100">
                  <span className="block text-2xl font-black text-slate-900 font-mono">{diffResults.totalDays - diffResults.workingDays}</span>
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">{dict.weekendDaysOnly}</span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded border border-slate-200 text-xs space-y-1">
                <h4 className="font-bold uppercase tracking-wider text-[9px] text-slate-500 mb-1">Date Interval Representation</h4>
                <div><span className="font-semibold text-slate-500">Parsed Span:</span> {diffResults.years} {dict.years.toLowerCase()}, {diffResults.months} {dict.months.toLowerCase()}, {diffResults.days} {dict.days.toLowerCase()}</div>
                <div><span className="font-semibold text-slate-500">Total Calendar Weeks:</span> {diffResults.weeks} Weeks</div>
                <div><span className="font-semibold text-slate-500">Ratio of Working Days:</span> {((diffResults.workingDays / (diffResults.totalDays || 1)) * 100).toFixed(1)}% of total span</div>
              </div>
            </div>
          )}

          {activeTab === 'duration' && (
            <div className="space-y-4">
              <div className="bg-indigo-50/20 p-6 rounded border border-indigo-100 text-center">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Target Resulting Date</span>
                <span className="block text-2xl font-black text-slate-900 tracking-tight">{durationResult.formatted || '---'}</span>
                <span className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1 block">{durationResult.dayOfWeek || '---'}</span>
              </div>
            </div>
          )}
        </div>

        {/* Compliance Footer Block */}
        <div className="mt-12 pt-4 border-t border-slate-200 text-center text-[10px] text-slate-400 uppercase tracking-wider">
          <p>This document is a certified correct printout from the {dict.title}.</p>
          <p className="mt-1 font-semibold text-slate-500">Processed 100% locally on Client Browser Session • GDPR Fully Compliant</p>
        </div>
      </div>

    </div>
  );
}
