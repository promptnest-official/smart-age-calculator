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
  History,
  Trash2,
  Save
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { jsPDF } from 'jspdf';
import { Language, HistoryItem } from './types';
import { TRANSLATIONS, FAQ_ITEMS } from './translations';
import { 
  calculateExactAge, 
  calculateDateDifference, 
  calculateDateDuration, 
  compileStandaloneHTML 
} from './utils';

export default function App() {
  // Localization state
  const [lang, setLang] = useState<Language>('EN');
  const dict = TRANSLATIONS[lang];
  const faqs = FAQ_ITEMS[lang];

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

  // Milestone Progress calculations
  const ageDecimal = ageResults.years + (ageResults.months / 12) + (ageResults.days / 365);
  const progressPercent = Math.min(100, Math.max(0, (ageDecimal / targetMilestone) * 100));

  // --- Calculation History Helpers ---
  const saveCalculationToHistory = (type: 'age' | 'diff' | 'duration') => {
    let inputs: Record<string, string> = {};
    let results: Record<string, string> = {};
    let summary = '';

    if (type === 'age') {
      if (!birthDate) return;
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
      return updated.slice(0, 5);
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
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {dict.birthDateLabel}
                    </label>
                    <input 
                      type="date" 
                      id="input-birth-date"
                      value={birthDate}
                      onChange={(e) => setBirthDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded p-2 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 font-mono"
                    />
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
                </div>

                {/* Results Visualizer */}
                <div id="age-results-pane" className="lg:col-span-8 space-y-4">
                  
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
                          onClick={() => saveCalculationToHistory('age')}
                          className="py-1 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[9px] font-bold uppercase tracking-wider rounded transition flex items-center gap-1 cursor-pointer border border-slate-200"
                        >
                          <Save className="w-3 h-3 text-slate-500" />
                          {dict.historySaveBtn}
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
                    {/* Countdown Card */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                          <span className="w-1 h-3 bg-indigo-600 rounded-full"></span>
                          {dict.nextBirthdayTitle}
                        </h4>
                        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">{dict.countdownPrefix}</p>
                      </div>

                      <div className="flex items-center gap-3 py-3 my-3 border-y border-slate-100">
                        <div className="text-center flex-1">
                          <span className="block text-2xl font-black text-slate-800 font-mono">{ageResults.nextBirthday.months}</span>
                          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{dict.months}</span>
                        </div>
                        <div className="text-center flex-1 border-l border-slate-100">
                          <span className="block text-2xl font-black text-slate-800 font-mono">{ageResults.nextBirthday.days}</span>
                          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{dict.days}</span>
                        </div>
                        <div className="text-center flex-1 border-l border-slate-100">
                          <span className="block text-2xl font-black text-slate-800 font-mono">{ageResults.nextBirthday.hours}</span>
                          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{dict.hours}</span>
                        </div>
                      </div>

                      <div className="text-[10px] font-bold text-indigo-700 bg-indigo-50 rounded-lg p-2.5 text-center uppercase tracking-wider">
                        🎉 {ageResults.nextBirthday.totalDaysLeft} {lang === 'DE' ? 'Tage verbleibend' : lang === 'FR' ? 'jours restants' : lang === 'ES' ? 'días restantes' : lang === 'IT' ? 'giorni rimanenti' : 'days remaining'}
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
                      className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded p-2 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {dict.endDateLabel}
                    </label>
                    <input 
                      type="date" 
                      id="input-diff-end"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded p-2 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 font-mono"
                    />
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
                  
                  <div className="bg-indigo-50/40 border border-indigo-100 p-4 rounded-xl shadow-sm">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="text-[10px] font-bold text-indigo-600 tracking-wider uppercase flex items-center gap-1.5">
                        <span className="w-1 h-3 bg-indigo-600 rounded-full"></span>
                        {dict.diffResultTitle}
                      </h4>
                      <div className="flex items-center gap-1.5">
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
                          onClick={() => saveCalculationToHistory('duration')}
                          className="py-1 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[9px] font-bold uppercase tracking-wider rounded transition flex items-center gap-1 cursor-pointer border border-slate-200"
                        >
                          <Save className="w-3 h-3 text-slate-500" />
                          {dict.historySaveBtn}
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
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="text-slate-400 hover:text-indigo-600 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded hover:bg-slate-100 transition cursor-pointer"
                >
                  {dict.historyClose}
                </button>
              </div>

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

    </div>
  );
}
