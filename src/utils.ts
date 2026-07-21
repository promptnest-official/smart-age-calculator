import { Language } from './types';
import { TRANSLATIONS, FAQ_ITEMS } from './translations';

// Western Zodiac lookup
export function getWesternZodiac(month: number, day: number, lang: Language): { name: string; symbol: string } {
  const zodiacs: { limitMonth: number; limitDay: number; names: Record<Language, string>; symbol: string }[] = [
    { limitMonth: 1, limitDay: 19, names: { EN: "Capricorn", DE: "Steinbock", FR: "Capricorne", ES: "Capricornio", IT: "Capricorno" }, symbol: "♑" },
    { limitMonth: 2, limitDay: 18, names: { EN: "Aquarius", DE: "Wassermann", FR: "Verseau", ES: "Acuario", IT: "Acquario" }, symbol: "♒" },
    { limitMonth: 3, limitDay: 20, names: { EN: "Pisces", DE: "Fische", FR: "Poissons", ES: "Piscis", IT: "Pesci" }, symbol: "♓" },
    { limitMonth: 4, limitDay: 19, names: { EN: "Aries", DE: "Widder", FR: "Bélier", ES: "Aries", IT: "Ariete" }, symbol: "♈" },
    { limitMonth: 5, limitDay: 20, names: { EN: "Taurus", DE: "Stier", FR: "Taureau", ES: "Tauro", IT: "Toro" }, symbol: "♉" },
    { limitMonth: 6, limitDay: 20, names: { EN: "Gemini", DE: "Zwillinge", FR: "Gémeaux", ES: "Géminis", IT: "Gemelli" }, symbol: "♊" },
    { limitMonth: 7, limitDay: 22, names: { EN: "Cancer", DE: "Krebs", FR: "Cancer", ES: "Cáncer", IT: "Cancro" }, symbol: "♋" },
    { limitMonth: 8, limitDay: 22, names: { EN: "Leo", DE: "Löwe", FR: "Lion", ES: "Leo", IT: "Leone" }, symbol: "♌" },
    { limitMonth: 9, limitDay: 22, names: { EN: "Virgo", DE: "Jungfrau", FR: "Vierge", ES: "Virgo", IT: "Vergine" }, symbol: "♍" },
    { limitMonth: 10, limitDay: 22, names: { EN: "Libra", DE: "Waage", FR: "Balance", ES: "Libra", IT: "Bilancia" }, symbol: "♎" },
    { limitMonth: 11, limitDay: 21, names: { EN: "Scorpio", DE: "Skorpion", FR: "Scorpion", ES: "Escorpio", IT: "Scorpione" }, symbol: "♏" },
    { limitMonth: 12, limitDay: 21, names: { EN: "Sagittarius", DE: "Schütze", FR: "Sagittaire", ES: "Sagitario", IT: "Sagittario" }, symbol: "♐" },
  ];

  // If after the limit day of month X, it belongs to month X's zodiac, else the previous one
  const matched = zodiacs.find(z => {
    if (month === z.limitMonth && day <= z.limitDay) return true;
    if (month === (z.limitMonth === 1 ? 12 : z.limitMonth - 1) && day > z.limitDay) return true;
    return false;
  });

  if (matched) {
    return { name: matched.names[lang], symbol: matched.symbol };
  }
  // Default fallback Capricorn
  return { name: zodiacs[0].names[lang], symbol: zodiacs[0].symbol };
}

// Chinese Zodiac lookup
export function getChineseZodiac(year: number, lang: Language): { name: string; emoji: string } {
  const animals: { names: Record<Language, string>; emoji: string }[] = [
    { names: { EN: "Rat", DE: "Ratte", FR: "Rat", ES: "Rata", IT: "Topo" }, emoji: "🐀" },
    { names: { EN: "Ox", DE: "Büffel", FR: "Bœuf", ES: "Buey", IT: "Bufalo" }, emoji: "🐂" },
    { names: { EN: "Tiger", DE: "Tiger", FR: "Tigre", ES: "Tigre", IT: "Tigre" }, emoji: "🐅" },
    { names: { EN: "Rabbit", DE: "Hase", FR: "Lapin", ES: "Conejo", IT: "Coniglio" }, emoji: "🐇" },
    { names: { EN: "Dragon", DE: "Drache", FR: "Dragon", ES: "Dragón", IT: "Drago" }, emoji: "🐉" },
    { names: { EN: "Snake", DE: "Schlange", FR: "Serpent", ES: "Serpiente", IT: "Serpente" }, emoji: "🐍" },
    { names: { EN: "Horse", DE: "Pferd", FR: "Cheval", ES: "Caballo", IT: "Cavallo" }, emoji: "🐎" },
    { names: { EN: "Goat", DE: "Ziege", FR: "Chèvre", ES: "Cabra", IT: "Capra" }, emoji: "🐐" },
    { names: { EN: "Monkey", DE: "Affe", FR: "Singe", ES: "Mono", IT: "Scimmia" }, emoji: "🐒" },
    { names: { EN: "Rooster", DE: "Hahn", FR: "Coq", ES: "Gallo", IT: "Gallo" }, emoji: "🐓" },
    { names: { EN: "Dog", DE: "Hund", FR: "Chien", ES: "Perro", IT: "Cane" }, emoji: "🐕" },
    { names: { EN: "Pig", DE: "Schwein", FR: "Cochon", ES: "Cerdo", IT: "Maiale" }, emoji: "🐖" },
  ];

  const index = (year - 4) % 12;
  const targetIndex = index < 0 ? index + 12 : index;
  const target = animals[targetIndex] || animals[0];
  return { name: target.names[lang], emoji: target.emoji };
}

// Birthstones lookup
export function getBirthstone(month: number, lang: Language): string {
  const stones: Record<number, Record<Language, string>> = {
    1: { EN: "Garnet (Constancy)", DE: "Granat (Beständigkeit)", FR: "Grenat (Constance)", ES: "Granate (Constancia)", IT: "Granato (Costanza)" },
    2: { EN: "Amethyst (Sincerity)", DE: "Amethyst (Aufrichtigkeit)", FR: "Améthyste (Sincérité)", ES: "Amatista (Sinceridad)", IT: "Ametista (Sincerità)" },
    3: { EN: "Aquamarine (Courage)", DE: "Aquamarin (Mut)", FR: "Aigue-marine (Courage)", ES: "Aguamarina (Valor)", IT: "Acquamarina (Coraggio)" },
    4: { EN: "Diamond (Innocence)", DE: "Diamant (Unschuld)", FR: "Diamant (Innocence)", ES: "Diamante (Inocencia)", IT: "Diamante (Innocenza)" },
    5: { EN: "Emerald (Love)", DE: "Smaragd (Liebe)", FR: "Émeraude (Amour)", ES: "Esmeralda (Amor)", IT: "Smeraldo (Amore)" },
    6: { EN: "Alexandrite (Health)", DE: "Alexandrit (Gesundheit)", FR: "Alexandrite (Santé)", ES: "Alejandrita (Salud)", IT: "Alessandrite (Salute)" },
    7: { EN: "Ruby (Nobility)", DE: "Rubin (Adel)", FR: "Rubis (Noblesse)", ES: "Rubí (Nobleza)", IT: "Rubino (Nobiltà)" },
    8: { EN: "Peridot (Joy)", DE: "Peridot (Freude)", FR: "Péridot (Joie)", ES: "Peridoto (Alegría)", IT: "Peridoto (Gioia)" },
    9: { EN: "Sapphire (Truth)", DE: "Saphir (Wahrheit)", FR: "Saphir (Vérité)", ES: "Zafiro (Verdad)", IT: "Zaffiro (Verità)" },
    10: { EN: "Opal (Hope)", DE: "Opal (Hoffnung)", FR: "Opale (Espoir)", ES: "Ópalo (Esperanza)", IT: "Opale (Speranza)" },
    11: { EN: "Topaz (Friendship)", DE: "Topas (Freundschaft)", FR: "Topaze (Amitié)", ES: "Topacio (Amistad)", IT: "Topazio (Amicizia)" },
    12: { EN: "Turquoise (Success)", DE: "Türkis (Erfolg)", FR: "Turquoise (Succès)", ES: "Turquesa (Éxito)", IT: "Turchese (Successo)" },
  };

  return stones[month]?.[lang] || stones[1][lang];
}

export interface AgeCalculationResult {
  years: number;
  months: number;
  weeks: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  
  nextBirthday: {
    months: number;
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    totalDaysLeft: number;
  };
  
  dayOfWeek: string;
  westernZodiac: { name: string; symbol: string };
  chineseZodiac: { name: string; emoji: string };
  birthstone: string;
  
  heartbeats: string;
  breaths: string;
  sleepHours: string;
}

// Age calculation logic
export function calculateExactAge(
  birthDateStr: string,
  birthTimeStr: string,
  targetDateStr: string,
  lang: Language
): AgeCalculationResult {
  const birth = new Date(`${birthDateStr}T${birthTimeStr || "00:00"}:00`);
  const target = targetDateStr ? new Date(targetDateStr) : new Date();

  // If birth date is in the future compared to target, fallback to equal dates
  const validatedBirth = birth.getTime() > target.getTime() ? target : birth;

  const diffMs = target.getTime() - validatedBirth.getTime();
  const totalSeconds = Math.floor(diffMs / 1000);
  const totalMinutes = Math.floor(totalSeconds / 60);
  const totalHours = Math.floor(totalMinutes / 60);
  const totalDays = Math.floor(totalHours / 24);
  const totalWeeks = Math.floor(totalDays / 7);

  // Years, Months, Days detailed calendar difference
  let calcYears = target.getFullYear() - validatedBirth.getFullYear();
  let calcMonths = target.getMonth() - validatedBirth.getMonth();
  let calcDays = target.getDate() - validatedBirth.getDate();
  let calcHours = target.getHours() - validatedBirth.getHours();
  let calcMinutes = target.getMinutes() - validatedBirth.getMinutes();
  let calcSeconds = target.getSeconds() - validatedBirth.getSeconds();

  if (calcSeconds < 0) {
    calcSeconds += 60;
    calcMinutes--;
  }
  if (calcMinutes < 0) {
    calcMinutes += 60;
    calcHours--;
  }
  if (calcHours < 0) {
    calcHours += 24;
    calcDays--;
  }
  if (calcDays < 0) {
    const prevMonthDate = new Date(target.getFullYear(), target.getMonth(), 0);
    calcDays += prevMonthDate.getDate();
    calcMonths--;
  }
  if (calcMonths < 0) {
    calcMonths += 12;
    calcYears--;
  }

  // Next Birthday countdown
  const currentYear = target.getFullYear();
  let nextBday = new Date(validatedBirth);
  nextBday.setFullYear(currentYear);
  // If next birthday is in the past for this year, set to next year
  if (nextBday.getTime() < target.getTime()) {
    nextBday.setFullYear(currentYear + 1);
  }

  const bdayDiffMs = nextBday.getTime() - target.getTime();
  const bdayTotalSec = Math.floor(bdayDiffMs / 1000);
  const bdayDays = Math.floor(bdayTotalSec / (3600 * 24));
  
  // Breakdown of next birthday remaining duration
  let bdayMonths = nextBday.getMonth() - target.getMonth();
  let bdayRemDays = nextBday.getDate() - target.getDate();
  let bdayHours = nextBday.getHours() - target.getHours();
  let bdayMin = nextBday.getMinutes() - target.getMinutes();
  let bdaySec = nextBday.getSeconds() - target.getSeconds();

  if (bdaySec < 0) {
    bdaySec += 60;
    bdayMin--;
  }
  if (bdayMin < 0) {
    bdayMin += 60;
    bdayHours--;
  }
  if (bdayHours < 0) {
    bdayHours += 24;
    bdayRemDays--;
  }
  if (bdayRemDays < 0) {
    const prevMonthB = new Date(nextBday.getFullYear(), nextBday.getMonth(), 0);
    bdayRemDays += prevMonthB.getDate();
    bdayMonths--;
  }
  if (bdayMonths < 0) {
    bdayMonths += 12;
  }

  // Format localized day of birth
  const daysOfWeekLocal: Record<Language, string[]> = {
    EN: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    DE: ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"],
    FR: ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"],
    ES: ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"],
    IT: ["Domenica", "Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato"]
  };
  const dayOfWeek = daysOfWeekLocal[lang][validatedBirth.getDay()];

  // Calculate Fun Stats
  // Averages: heart rate ~ 80 bpm, breaths ~ 16 per min, sleep ~ 8 hours per day (1/3 of life)
  const formatNum = (num: number) => new Intl.NumberFormat(lang === 'DE' ? 'de-DE' : lang === 'FR' ? 'fr-FR' : 'en-US').format(num);
  const heartbeats = formatNum(totalMinutes * 78);
  const breaths = formatNum(totalMinutes * 15);
  const sleepHours = formatNum(Math.floor(totalDays * 7.8));

  const birthMonth = validatedBirth.getMonth() + 1;
  const birthDay = validatedBirth.getDate();
  const birthYear = validatedBirth.getFullYear();

  return {
    years: calcYears,
    months: calcMonths,
    weeks: totalWeeks,
    days: calcDays,
    hours: calcHours,
    minutes: calcMinutes,
    seconds: calcSeconds,
    nextBirthday: {
      months: bdayMonths,
      days: bdayRemDays,
      hours: bdayHours,
      minutes: bdayMin,
      seconds: bdaySec,
      totalDaysLeft: bdayDays
    },
    dayOfWeek,
    westernZodiac: getWesternZodiac(birthMonth, birthDay, lang),
    chineseZodiac: getChineseZodiac(birthYear, lang),
    birthstone: getBirthstone(birthMonth, lang),
    heartbeats,
    breaths,
    sleepHours
  };
}

// Date Difference calculator
export interface DateDiffResult {
  totalDays: number;
  workingDays: number;
  years: number;
  months: number;
  days: number;
  weeks: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalMonthsApart: number;
  monthsAndDaysDays: number;
}

export function calculateDateDifference(
  startDateStr: string,
  endDateStr: string,
  excludeWeekends: boolean,
  includeEndDate: boolean
): DateDiffResult {
  if (!startDateStr || !endDateStr) {
    return { 
      totalDays: 0, 
      workingDays: 0, 
      years: 0, 
      months: 0, 
      days: 0, 
      weeks: 0, 
      hours: 0, 
      minutes: 0, 
      seconds: 0,
      totalMonthsApart: 0,
      monthsAndDaysDays: 0
    };
  }

  let start = new Date(startDateStr);
  let end = new Date(endDateStr);

  // swap if start is after end
  if (start.getTime() > end.getTime()) {
    const temp = start;
    start = end;
    end = temp;
  }

  // Include end date means adding exactly 1 day to the end date timestamp for calculation
  const workingEnd = includeEndDate ? new Date(end.getTime() + 24 * 3600 * 1000) : end;

  const totalMs = workingEnd.getTime() - start.getTime();
  const totalDays = Math.max(0, Math.floor(totalMs / (1000 * 3600 * 24)));
  const totalWeeks = Math.floor(totalDays / 7);

  // Calculate working days (excluding Saturday & Sunday)
  let workingDaysCount = 0;
  if (totalDays > 0) {
    const current = new Date(start);
    while (current.getTime() < workingEnd.getTime()) {
      const day = current.getDay();
      if (day !== 0 && day !== 6) { // 0 is Sunday, 6 is Saturday
        workingDaysCount++;
      }
      current.setDate(current.getDate() + 1);
    }
  }

  // Breakdown in exact calendar Years, Months, Days
  let years = workingEnd.getFullYear() - start.getFullYear();
  let months = workingEnd.getMonth() - start.getMonth();
  let days = workingEnd.getDate() - start.getDate();

  if (days < 0) {
    const prevMonthDate = new Date(workingEnd.getFullYear(), workingEnd.getMonth(), 0);
    days += prevMonthDate.getDate();
    months--;
  }
  if (months < 0) {
    months += 12;
    years--;
  }

  // --- Months & Days Apart calculation (specifically accounting for variable month lengths) ---
  const addMonths = (date: Date, m: number): Date => {
    const result = new Date(date);
    const originalDay = date.getDate();
    result.setMonth(result.getMonth() + m);
    if (result.getDate() !== originalDay) {
      result.setDate(0);
    }
    return result;
  };

  let totalMonthsApart = (workingEnd.getFullYear() - start.getFullYear()) * 12 + (workingEnd.getMonth() - start.getMonth());
  while (totalMonthsApart > 0 && addMonths(start, totalMonthsApart).getTime() > workingEnd.getTime()) {
    totalMonthsApart--;
  }
  while (addMonths(start, totalMonthsApart + 1).getTime() <= workingEnd.getTime()) {
    totalMonthsApart++;
  }

  const targetDateForDays = addMonths(start, totalMonthsApart);
  const diffMsForDays = workingEnd.getTime() - targetDateForDays.getTime();
  const monthsAndDaysDays = Math.max(0, Math.floor(diffMsForDays / (1000 * 3600 * 24)));

  return {
    totalDays,
    workingDays: excludeWeekends ? workingDaysCount : totalDays,
    years,
    months,
    days,
    weeks: totalWeeks,
    hours: totalDays * 24,
    minutes: totalDays * 24 * 60,
    seconds: totalDays * 24 * 3600,
    totalMonthsApart,
    monthsAndDaysDays
  };
}

// Date +- Duration adder/subtracter
export function calculateDateDuration(
  startDateStr: string,
  operation: 'add' | 'subtract',
  years: number,
  months: number,
  weeks: number,
  days: number,
  skipWeekends: boolean,
  lang: Language
): { formatted: string; dayOfWeek: string } {
  if (!startDateStr) return { formatted: '', dayOfWeek: '' };

  const start = new Date(startDateStr);
  const factor = operation === 'add' ? 1 : -1;

  // Perform Standard calendar add/subtract
  start.setFullYear(start.getFullYear() + (years * factor));
  start.setMonth(start.getMonth() + (months * factor));
  
  // Total calendar days to add/subtract
  let calendarDaysOffset = (weeks * 7) + days;

  if (skipWeekends && calendarDaysOffset > 0) {
    // If skipping weekends, we step 1-by-1 day adding/subtracting working days only
    let stepsLeft = calendarDaysOffset;
    while (stepsLeft > 0) {
      start.setDate(start.getDate() + factor);
      const day = start.getDay();
      if (day !== 0 && day !== 6) { // Exclude Sat/Sun
        stepsLeft--;
      }
    }
  } else {
    start.setDate(start.getDate() + (calendarDaysOffset * factor));
  }

  const daysOfWeekLocal: Record<Language, string[]> = {
    EN: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    DE: ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"],
    FR: ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"],
    ES: ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"],
    IT: ["Domenica", "Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato"]
  };

  const dayOfWeek = daysOfWeekLocal[lang][start.getDay()];
  
  // Standard EU formatting: DD/MM/YYYY
  const dayStr = String(start.getDate()).padStart(2, '0');
  const monthStr = String(start.getMonth() + 1).padStart(2, '0');
  const yearStr = start.getFullYear();

  return {
    formatted: `${dayStr}/${monthStr}/${yearStr}`,
    dayOfWeek
  };
}

// Generates the single file complete code HTML that users can copy or download directly to deploy on Netlify.
export function compileStandaloneHTML(): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Smart Age & Date Calculator Pro — Accurate European Utility</title>
    
    <!-- Premium SEO Meta Tags -->
    <meta name="description" content="Calculate exact age, next birthday countdown, working days, and date differences with GDPR-compliant privacy. Clean, fast, and 100% client-side." />
    <meta name="keywords" content="age calculator, date difference, working days Europe, birthday countdown, exact age tracker, date duration, GDPR-safe online tools" />
    <meta name="author" content="Smart Age & Date Calculator Pro" />
    <meta name="robots" content="index, follow" />
    
    <!-- Tailwind CSS Play CDN -->
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet" />
    
    <style>
      body {
        font-family: 'Inter', sans-serif;
        background-color: #f8fafc;
        color: #0f172a;
      }
      .display-font {
        font-family: 'Outfit', sans-serif;
      }
      .mono-font {
        font-family: 'JetBrains Mono', monospace;
      }
    </style>
  </head>
  <body class="min-h-screen flex flex-col justify-between bg-slate-50 text-slate-800 font-sans">
    <!-- Inline application container written in single file for Netlify deployment -->
    <header class="border-b border-slate-200 bg-white sticky top-0 z-40 shadow-xs px-6 py-2.5">
      <div class="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center text-white shadow-xs shrink-0 font-bold text-sm">
            ⏰
          </div>
          <div>
            <h1 class="text-base font-black tracking-tight text-indigo-950 uppercase flex items-center gap-1.5 leading-none">Smart Age & Date Calculator <span class="text-indigo-600 text-[9px] font-bold px-1.5 py-0.5 bg-indigo-50 rounded border border-indigo-100 uppercase tracking-widest ml-1">PRO</span></h1>
            <p class="text-[9px] text-slate-400 uppercase font-bold tracking-wider mt-0.5">Accurate European Standard Utility</p>
          </div>
        </div>
        
        <div class="flex items-center gap-2">
          <select id="langSelect" onchange="changeLanguage(this.value)" class="bg-slate-50 border border-slate-200 text-slate-700 text-[10px] uppercase tracking-wider font-bold rounded p-1.5 focus:ring-1 focus:ring-indigo-600 focus:border-indigo-600 focus:outline-none cursor-pointer">
            <option value="EN" selected>🇬🇧 EN</option>
            <option value="DE">🇩🇪 DE</option>
            <option value="FR">🇫🇷 FR</option>
            <option value="ES">🇪🇸 ES</option>
            <option value="IT">🇮🇹 IT</option>
          </select>
        </div>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-6 py-8 flex-grow w-full">
      <div class="text-center max-w-2xl mx-auto mb-8">
        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 text-[9px] font-bold uppercase tracking-wider mb-2">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          100% Client-Side Privacy (GDPR Compliant)
        </span>
        <h2 id="taglineSub" class="text-xl font-black uppercase tracking-tight text-slate-950">Precision Calculation Studio</h2>
        <p id="taglineText" class="mt-1 text-[11px] text-slate-400 uppercase tracking-wide font-semibold">Calculate exact milestones, dates, and durations instantaneously without compromising your personal details.</p>
      </div>

      <!-- Navigation Tabs -->
      <div class="flex justify-center border-b border-slate-200 mb-6 bg-white rounded border p-1 shadow-xs max-w-xl mx-auto">
        <div class="flex w-full gap-1" role="tablist">
          <button onclick="switchTab('age')" id="tabBtn-age" class="flex-1 text-center py-2 px-3 text-[10px] font-bold uppercase tracking-wider rounded transition-all duration-150 border bg-indigo-600 text-white border-indigo-600 cursor-pointer" type="button">
            🎂 <span id="tabLabelAge">Age & Milestones</span>
          </button>
          <button onclick="switchTab('diff')" id="tabBtn-diff" class="flex-1 text-center py-2 px-3 text-[10px] font-bold uppercase tracking-wider rounded transition-all duration-150 border border-transparent text-slate-500 hover:text-slate-700 cursor-pointer" type="button">
            🗓️ <span id="tabLabelDiff">Date Difference</span>
          </button>
          <button onclick="switchTab('duration')" id="tabBtn-duration" class="flex-1 text-center py-2 px-3 text-[10px] font-bold uppercase tracking-wider rounded transition-all duration-150 border border-transparent text-slate-500 hover:text-slate-700 cursor-pointer" type="button">
            ⏳ <span id="tabLabelDuration">Add/Subtract Duration</span>
          </button>
        </div>
      </div>

      <!-- Tab Content Area -->
      <div>
        <!-- TAB 1: AGE & MILESTONES -->
        <div id="tabContent-age" class="space-y-8">
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div class="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-5">
              <h3 class="font-bold text-lg text-slate-900 display-font flex items-center gap-2">
                ✍️ <span id="ageInputTitle">Calculate Age</span>
              </h3>
              
              <div class="space-y-1">
                <label id="lblBirthDate" class="text-xs font-semibold text-slate-600">Date of Birth</label>
                <input type="date" id="birthDate" value="1995-06-15" onchange="runAgeCalculation()" class="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl p-3 focus:ring-blue-500 focus:border-blue-500" />
              </div>

              <div class="space-y-1">
                <label id="lblBirthTime" class="text-xs font-semibold text-slate-600">Time of Birth (Optional)</label>
                <input type="time" id="birthTime" value="08:30" onchange="runAgeCalculation()" class="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl p-3 focus:ring-blue-500 focus:border-blue-500" />
              </div>

              <div class="space-y-1">
                <label id="lblCalcDate" class="text-xs font-semibold text-slate-600">Age as of Date</label>
                <input type="date" id="calcDate" class="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl p-3 focus:ring-blue-500 focus:border-blue-500" />
              </div>

              <button onclick="runAgeCalculation()" id="btnCalcAge" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm py-3 px-4 rounded-xl transition duration-200 shadow-sm shadow-blue-100 flex items-center justify-center gap-2">
                Calculate Exact Age
              </button>
            </div>

            <div class="lg:col-span-8 space-y-6">
              <div class="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100/60 p-6 rounded-2xl shadow-sm">
                <div class="flex justify-between items-center mb-3">
                  <h4 id="lblExactAgeRightNow" class="text-xs font-semibold text-blue-700 tracking-wider uppercase">Your Exact Age Right Now</h4>
                  <button type="button" onclick="exportPDF()" id="btnExportPDF-1" class="py-1 px-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[9px] font-bold uppercase tracking-wider rounded transition flex items-center gap-1 cursor-pointer">Export PDF</button>
                </div>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div class="bg-white p-4 rounded-xl shadow-sm border border-blue-100/30">
                    <span id="resYears" class="block text-3xl font-extrabold text-slate-950 mono-font">0</span>
                    <span id="lblYears" class="text-xs text-slate-500 font-medium">Years</span>
                  </div>
                  <div class="bg-white p-4 rounded-xl shadow-sm border border-blue-100/30">
                    <span id="resMonths" class="block text-3xl font-extrabold text-slate-950 mono-font">0</span>
                    <span id="lblMonths" class="text-xs text-slate-500 font-medium">Months</span>
                  </div>
                  <div class="bg-white p-4 rounded-xl shadow-sm border border-blue-100/30">
                    <span id="resDays" class="block text-3xl font-extrabold text-slate-950 mono-font">0</span>
                    <span id="lblDays" class="text-xs text-slate-500 font-medium">Days</span>
                  </div>
                  <div class="bg-white p-4 rounded-xl shadow-sm border border-blue-100/30">
                    <span id="resWeeks" class="block text-3xl font-extrabold text-slate-950 mono-font">0</span>
                    <span id="lblWeeks" class="text-xs text-slate-500 font-medium">Weeks</span>
                  </div>
                </div>

                <div class="grid grid-cols-3 gap-3 mt-4 text-center">
                  <div class="bg-slate-900/5 p-2 rounded-lg">
                    <span id="resHours" class="block text-sm font-bold text-slate-900 mono-font">0</span>
                    <span id="lblHours" class="text-[10px] text-slate-500">Hours</span>
                  </div>
                  <div class="bg-slate-900/5 p-2 rounded-lg">
                    <span id="resMinutes" class="block text-sm font-bold text-slate-900 mono-font">0</span>
                    <span id="lblMinutes" class="text-[10px] text-slate-500">Minutes</span>
                  </div>
                  <div class="bg-slate-900/5 p-2 rounded-lg">
                    <span id="resSeconds" class="block text-sm font-bold text-blue-600 mono-font animate-pulse">0</span>
                    <span id="lblSeconds" class="text-[10px] text-slate-500">Seconds</span>
                  </div>
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Countdown -->
                <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
                  <div>
                    <h4 id="lblNextBdayTitle" class="font-bold text-sm text-slate-900 display-font mb-2">Next Birthday Countdown</h4>
                    <p id="lblCountdownPrefix" class="text-xs text-slate-500 mb-4">Remaining time until your celebration:</p>
                  </div>
                  <div class="flex items-center gap-4 py-2 border-y border-slate-50">
                    <div class="text-center flex-1">
                      <span id="cntMonths" class="block text-2xl font-extrabold text-slate-800 mono-font">0</span>
                      <span id="lblCntMonths" class="text-[10px] text-slate-500">Months</span>
                    </div>
                    <div class="text-center flex-1 border-l border-slate-100">
                      <span id="cntDays" class="block text-2xl font-extrabold text-slate-800 mono-font">0</span>
                      <span id="lblCntDays" class="text-[10px] text-slate-500">Days</span>
                    </div>
                    <div class="text-center flex-1 border-l border-slate-100">
                      <span id="cntHours" class="block text-2xl font-extrabold text-slate-800 mono-font">0</span>
                      <span id="lblCntHours" class="text-[10px] text-slate-500">Hours</span>
                    </div>
                  </div>
                  <div class="mt-4 text-xs font-semibold text-blue-600 bg-blue-50/50 rounded-lg p-2.5 text-center">
                    🎂 <span id="cntTotalDays">0 days remaining</span>
                  </div>
                </div>

                <!-- Life Stats -->
                <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                  <h4 id="lblStatsTitle" class="font-bold text-sm text-slate-900 display-font">Zodiac & Stats</h4>
                  <div class="space-y-2.5 text-xs">
                    <div class="flex justify-between p-2 rounded-lg bg-slate-50">
                      <span id="lblZodiacWest">Western Zodiac</span>
                      <span id="valZodiacWest" class="font-semibold text-slate-800">♈ Aries</span>
                    </div>
                    <div class="flex justify-between p-2 rounded-lg bg-slate-50">
                      <span id="lblZodiacChinese">Chinese Zodiac</span>
                      <span id="valZodiacChinese" class="font-semibold text-slate-800">🐀 Rat</span>
                    </div>
                    <div class="flex justify-between p-2 rounded-lg bg-slate-50">
                      <span id="lblBstone">Birthstone</span>
                      <span id="valBstone" class="font-semibold text-slate-800">Emerald</span>
                    </div>
                    <div class="flex justify-between p-2 rounded-lg bg-slate-50">
                      <span id="lblBirthDayOfWeek">Day of Birth</span>
                      <span id="valBirthDayOfWeek" class="font-semibold text-slate-800">Thursday</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Life Milestone Tracker -->
              <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                <div class="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                  <div>
                    <h4 id="lblProgressTitle" class="font-bold text-sm text-slate-900 display-font">Life Milestone Progress</h4>
                    <p id="lblProgressDesc" class="text-xs text-slate-500">Current progress toward major landmark milestone age:</p>
                  </div>
                  <div class="flex items-center gap-2">
                    <label id="lblTargetAge" class="text-[10px] font-bold uppercase text-slate-400">Target:</label>
                    <input type="number" id="targetMilestone" value="67" min="1" max="120" onchange="runAgeCalculation()" class="w-16 bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold rounded-lg p-1 text-center" />
                  </div>
                </div>

                <div class="space-y-2">
                  <div class="w-full bg-slate-100 h-4 rounded-full overflow-hidden flex">
                    <div id="progressLived" class="bg-blue-600 h-full transition-all duration-500" style="width: 44%"></div>
                    <div id="progressLeft" class="bg-slate-200 h-full flex-grow"></div>
                  </div>
                  <div class="flex justify-between text-[11px] font-medium">
                    <span class="text-blue-600"><span id="txtLived">0</span> <span id="lblLivedText">Years Completed</span></span>
                    <span class="text-slate-500"><span id="txtRemaining">0</span> <span id="lblRemainingText">Years Remaining</span></span>
                  </div>
                </div>
              </div>

              <!-- Fun estimates -->
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div class="border border-slate-100 bg-slate-50/50 p-4 rounded-xl text-center">
                  <span class="block text-lg font-bold text-slate-800 mono-font" id="statHeart">0</span>
                  <span id="lblEstHeart" class="text-[10px] text-slate-500 uppercase tracking-wider">Heartbeats</span>
                </div>
                <div class="border border-slate-100 bg-slate-50/50 p-4 rounded-xl text-center">
                  <span class="block text-lg font-bold text-slate-800 mono-font" id="statBreaths">0</span>
                  <span id="lblEstBreaths" class="text-[10px] text-slate-500 uppercase tracking-wider">Breaths Taken</span>
                </div>
                <div class="border border-slate-100 bg-slate-50/50 p-4 rounded-xl text-center">
                  <span class="block text-lg font-bold text-slate-800 mono-font" id="statSleep">0</span>
                  <span id="lblEstSleep" class="text-[10px] text-slate-500 uppercase tracking-wider">Hours Asleep</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- TAB 2: DATE DIFFERENCE -->
        <div id="tabContent-diff" class="hidden space-y-8">
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div class="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-5">
              <h3 id="lblDiffTitle" class="font-bold text-lg text-slate-900 display-font flex items-center gap-2">
                🗓️ <span>Select Dates</span>
              </h3>
              
              <div class="space-y-1">
                <label id="lblDiffStart" class="text-xs font-semibold text-slate-600">Start Date</label>
                <input type="date" id="diffStartDate" value="2026-01-01" onchange="runDiffCalculation()" class="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl p-3 focus:ring-blue-500 focus:border-blue-500" />
              </div>

              <div class="space-y-1">
                <label id="lblDiffEnd" class="text-xs font-semibold text-slate-600">End Date</label>
                <input type="date" id="diffEndDate" value="2026-12-31" onchange="runDiffCalculation()" class="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl p-3 focus:ring-blue-500 focus:border-blue-500" />
              </div>

              <!-- Quick-Select Buttons -->
              <div class="space-y-2 pt-1">
                <span id="lblQuickSelect" class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Quick Date Range</span>
                <div class="grid grid-cols-2 gap-2">
                  <button type="button" id="btnQuickLast30" onclick="quickSelectDiff('last30')" class="py-1.5 px-2 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 text-slate-600 hover:text-indigo-700 text-[10px] font-bold uppercase tracking-wider rounded transition cursor-pointer text-center">Last 30 Days</button>
                  <button type="button" id="btnQuickNext30" onclick="quickSelectDiff('next30')" class="py-1.5 px-2 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 text-slate-600 hover:text-indigo-700 text-[10px] font-bold uppercase tracking-wider rounded transition cursor-pointer text-center">Next 30 Days</button>
                  <button type="button" id="btnQuickJan1" onclick="quickSelectDiff('jan1')" class="py-1.5 px-2 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 text-slate-600 hover:text-indigo-700 text-[10px] font-bold uppercase tracking-wider rounded transition cursor-pointer text-center">Since Jan 1st</button>
                  <button type="button" id="btnQuickToday" onclick="quickSelectDiff('today')" class="py-1.5 px-2 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 text-slate-600 hover:text-indigo-700 text-[10px] font-bold uppercase tracking-wider rounded transition cursor-pointer text-center">Today</button>
                </div>
              </div>

              <div class="space-y-4 pt-2">
                <label class="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" id="excludeWeekends" onchange="runDiffCalculation()" class="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                  <span id="lblExcludeWknd" class="text-xs text-slate-600">Exclude Weekends (Count Working Days Only)</span>
                </label>

                <label class="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" id="includeEndDate" onchange="runDiffCalculation()" class="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                  <span id="lblIncludeEnd" class="text-xs text-slate-600">Include End Date in Calculation (+1 day)</span>
                </label>
              </div>

              <button onclick="runDiffCalculation()" id="btnCalcDiff" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm py-3 px-4 rounded-xl transition duration-200 shadow-sm shadow-blue-100 flex items-center justify-center">
                Calculate Difference
              </button>
            </div>

            <div class="lg:col-span-8 space-y-6">
              <div class="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100/60 p-6 rounded-2xl shadow-sm">
                <div class="flex justify-between items-center mb-3">
                  <h4 id="lblCalculatedDateSpan" class="text-xs font-semibold text-blue-700 tracking-wider uppercase">Calculated Date Span</h4>
                  <button type="button" onclick="exportPDF()" id="btnExportPDF-2" class="py-1 px-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[9px] font-bold uppercase tracking-wider rounded transition flex items-center gap-1 cursor-pointer">Export PDF</button>
                </div>
                
                <div class="flex flex-col md:flex-row justify-between items-center gap-6 bg-white p-6 rounded-xl border border-blue-100/30 shadow-sm">
                  <div class="text-center md:text-left">
                    <span id="diffMainResult" class="block text-4xl font-extrabold text-slate-950 mono-font">364</span>
                    <span id="diffMainLabel" class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Calendar Days</span>
                  </div>
                  <div id="workingDaysBanner" class="bg-emerald-50 border border-emerald-100 rounded-xl p-4 text-center md:text-left flex items-center gap-3 w-full md:w-auto">
                    <span class="text-xl">💼</span>
                    <div>
                      <span id="diffWorkingDays" class="block text-xl font-bold text-emerald-800 mono-font">261</span>
                      <span id="lblWorkingDays" class="text-[10px] text-emerald-600 font-medium">Working Days (Monday to Friday)</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Breakdown formats -->
              <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                <h4 id="lblAlternateFormats" class="font-bold text-sm text-slate-900 display-font">Alternate Breakdown Formats</h4>
                
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div class="bg-slate-50 p-4 rounded-xl text-center">
                    <span id="diffBreakdownYears" class="block text-xl font-bold text-slate-800 mono-font">0</span>
                    <span class="text-[10px] text-slate-500">Years</span>
                  </div>
                  <div class="bg-slate-50 p-4 rounded-xl text-center">
                    <span id="diffBreakdownMonths" class="block text-xl font-bold text-slate-800 mono-font">11</span>
                    <span class="text-[10px] text-slate-500">Months</span>
                  </div>
                  <div class="bg-slate-50 p-4 rounded-xl text-center">
                    <span id="diffBreakdownWeeks" class="block text-xl font-bold text-slate-800 mono-font">52</span>
                    <span class="text-[10px] text-slate-500">Weeks</span>
                  </div>
                  <div class="bg-slate-50 p-4 rounded-xl text-center">
                    <span id="diffBreakdownDays" class="block text-xl font-bold text-slate-800 mono-font">30</span>
                    <span class="text-[10px] text-slate-500">Days</span>
                  </div>
                </div>

                <div class="border-t border-slate-100 pt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-500">
                  <div class="flex justify-between p-2 rounded-lg hover:bg-slate-50/50">
                    <span>Total Hours:</span>
                    <span id="diffHrs" class="font-semibold text-slate-700 mono-font">0</span>
                  </div>
                  <div class="flex justify-between p-2 rounded-lg hover:bg-slate-50/50">
                    <span>Total Minutes:</span>
                    <span id="diffMins" class="font-semibold text-slate-700 mono-font">0</span>
                  </div>
                  <div class="flex justify-between p-2 rounded-lg hover:bg-slate-50/50">
                    <span>Total Seconds:</span>
                    <span id="diffSecs" class="font-semibold text-slate-700 mono-font">0</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- TAB 3: ADD/SUBTRACT DURATION -->
        <div id="tabContent-duration" class="hidden space-y-8">
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div class="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-5">
              <h3 id="lblAddDurationTitle" class="font-bold text-lg text-slate-900 display-font flex items-center gap-2">
                ⏳ <span>Duration Arithmetic</span>
              </h3>
              
              <div class="space-y-1">
                <label id="lblDurationStart" class="text-xs font-semibold text-slate-600">Start Date</label>
                <input type="date" id="durStartDate" value="2026-07-20" onchange="runDurationCalculation()" class="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl p-3 focus:ring-blue-500 focus:border-blue-500" />
              </div>

              <div class="space-y-1">
                <label id="lblOperation" class="text-xs font-semibold text-slate-600">Operation</label>
                <select id="durOperation" onchange="runDurationCalculation()" class="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl p-3 focus:ring-blue-500 focus:border-blue-500 font-medium">
                  <option value="add">➕ Add (+)</option>
                  <option value="subtract">➖ Subtract (-)</option>
                </select>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div class="space-y-1">
                  <label class="text-[10px] font-bold text-slate-500">Years</label>
                  <input type="number" id="durYears" value="1" min="0" max="100" onchange="runDurationCalculation()" class="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl p-2 text-center" />
                </div>
                <div class="space-y-1">
                  <label class="text-[10px] font-bold text-slate-500">Months</label>
                  <input type="number" id="durMonths" value="0" min="0" max="12" onchange="runDurationCalculation()" class="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl p-2 text-center" />
                </div>
                <div class="space-y-1">
                  <label class="text-[10px] font-bold text-slate-500">Weeks</label>
                  <input type="number" id="durWeeks" value="0" min="0" max="52" onchange="runDurationCalculation()" class="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl p-2 text-center" />
                </div>
                <div class="space-y-1">
                  <label class="text-[10px] font-bold text-slate-500">Days</label>
                  <input type="number" id="durDays" value="0" min="0" max="365" onchange="runDurationCalculation()" class="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl p-2 text-center" />
                </div>
              </div>

              <div class="space-y-4 pt-2">
                <label class="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" id="durSkipWeekends" onchange="runDurationCalculation()" class="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                  <span id="lblDurExcludeWknd" class="text-xs text-slate-600">Exclude Weekends (Add/Sub working days only)</span>
                </label>
              </div>

              <button onclick="runDurationCalculation()" id="btnCalcDuration" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm py-3 px-4 rounded-xl transition duration-200 shadow-sm shadow-blue-100 flex items-center justify-center">
                Calculate Result
              </button>
            </div>

            <div class="lg:col-span-8 space-y-6">
              <div class="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100/60 p-6 rounded-2xl shadow-sm">
                <div class="flex justify-between items-center mb-3">
                  <h4 id="lblResultingTargetDate" class="text-xs font-semibold text-blue-700 tracking-wider uppercase">Resulting Target Date</h4>
                  <button type="button" onclick="exportPDF()" id="btnExportPDF-3" class="py-1 px-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[9px] font-bold uppercase tracking-wider rounded transition flex items-center gap-1 cursor-pointer">Export PDF</button>
                </div>
                
                <div class="bg-white p-8 rounded-xl border border-blue-100/30 shadow-sm inline-block min-w-[280px] max-w-full">
                  <span class="text-3xl font-extrabold text-blue-600 block mb-2 mono-font" id="durationResultDate">20/07/2027</span>
                  <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100" id="durationResultDay">
                    Monday
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Advanced European Market SEO Elements -->
      <section class="mt-16 border-t border-slate-100 pt-12 space-y-12">
        <!-- FAQ (Accordions) -->
        <div class="space-y-6">
          <h3 id="lblFaqHeader" class="text-2xl font-bold text-slate-900 display-font">Frequently Asked Questions (FAQ) — European Standard</h3>
          <div class="space-y-4" id="faqContainer">
            <!-- Dynamically populated in selected language -->
          </div>
        </div>

        <!-- About section -->
        <div class="bg-slate-50 p-8 rounded-2xl border border-slate-100 space-y-4">
          <h3 id="lblAboutTitle" class="text-xl font-bold text-slate-900 display-font">About Smart Age & Date Calculator Pro</h3>
          <p id="txtAboutP1" class="text-sm text-slate-600 leading-relaxed"></p>
          <p id="txtAboutP2" class="text-sm text-slate-600 leading-relaxed"></p>
          <p id="txtAboutP3" class="text-sm text-slate-600 leading-relaxed"></p>
        </div>
      </section>

      <!-- Netlify export panel -->
      <section class="mt-12 bg-blue-50 border border-blue-100/60 p-8 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-6">
        <div class="space-y-2">
          <h3 id="lblExportTitle" class="text-lg font-bold text-slate-900 display-font">Deploy Single-File Version to Netlify</h3>
          <p id="lblExportDesc" class="text-xs text-slate-500 max-w-xl">As requested, you can generate and download a single, 100% self-contained HTML file featuring all styles, translations, logic, and animations. You can drag-and-drop this file directly onto Netlify for instant deployment!</p>
        </div>
        <button onclick="downloadSelfContainedHTML()" id="btnExport" class="bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs px-5 py-3.5 rounded-xl transition shadow-md shadow-blue-200 shrink-0">
          Download Standalone HTML File
        </button>
      </section>
    </main>

    <footer class="border-t border-slate-100 bg-white py-8 mt-12 text-center text-xs text-slate-400">
      <div class="max-w-6xl mx-auto px-4 space-y-3">
        <p>© 2026 Smart Age & Date Calculator Pro. Built for European Precision.</p>
        <div class="flex justify-center gap-4">
          <button onclick="togglePrivacyModal(true)" id="lblPrivacyBtn" class="hover:text-blue-500 transition underline">GDPR & Privacy Policy</button>
        </div>
      </div>
    </footer>

    <!-- GDPR Cookie Consent banner -->
    <div id="gdprBanner" class="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-md text-white p-5 border-t border-slate-800 z-50 flex flex-col md:flex-row justify-between items-center gap-4 transition duration-300">
      <div class="max-w-4xl">
        <p id="txtGdprNotice" class="text-xs text-slate-300 leading-relaxed">We use essential local state to store your preferences. No personal information or date of birth is ever sent to a server.</p>
      </div>
      <div class="flex gap-2 shrink-0">
        <button onclick="dismissGdpr()" id="btnGdprAll" class="bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-4 py-2 rounded-lg transition">Accept All Cookies</button>
        <button onclick="dismissGdpr()" id="btnGdprEssential" class="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium px-4 py-2 rounded-lg transition">Accept Essential Only</button>
      </div>
    </div>

    <!-- GDPR Privacy Policy Modal -->
    <div id="privacyModal" class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 hidden">
      <div class="bg-white rounded-2xl border border-slate-100 max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto shadow-xl">
        <h3 id="lblModalTitle" class="text-xl font-bold text-slate-900 display-font border-b border-slate-100 pb-3">GDPR Compliance & Privacy Policy Statement</h3>
        <p id="lblModalB1" class="text-xs text-slate-600 leading-relaxed"></p>
        <p id="lblModalB2" class="text-xs text-slate-600 leading-relaxed"></p>
        <p id="lblModalB3" class="text-xs text-slate-600 leading-relaxed"></p>
        <div class="border-t border-slate-100 pt-4 flex justify-end">
          <button onclick="togglePrivacyModal(false)" id="lblModalCloseBtn" class="bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium px-4 py-2.5 rounded-lg transition">Close</button>
        </div>
      </div>
    </div>

    <script>
      // INLINE DICTIONARIES
      const TRANSLATIONS = ${JSON.stringify(TRANSLATIONS)};
      const FAQ_ITEMS = ${JSON.stringify(FAQ_ITEMS)};

      let currentLang = 'EN';
      let activeTab = 'age';
      let countdownTimer = null;

      // Local storage support for GDPR dismissals
      if (localStorage.getItem('gdpr_consent') === 'dismissed') {
        document.getElementById('gdprBanner').classList.add('hidden');
      }

      function dismissGdpr() {
        localStorage.setItem('gdpr_consent', 'dismissed');
        document.getElementById('gdprBanner').classList.add('hidden');
      }

      function togglePrivacyModal(show) {
        const modal = document.getElementById('privacyModal');
        if (show) {
          modal.classList.remove('hidden');
        } else {
          modal.classList.add('hidden');
        }
      }

      function switchTab(tabId) {
        activeTab = tabId;
        ['age', 'diff', 'duration'].forEach(t => {
          const content = document.getElementById('tabContent-' + t);
          const btn = document.getElementById('tabBtn-' + t);
          if (t === tabId) {
            content.classList.remove('hidden');
            btn.className = "inline-block p-4 border-b-2 rounded-t-lg border-blue-600 text-blue-600 font-semibold flex items-center gap-2";
          } else {
            content.classList.add('hidden');
            btn.className = "inline-block p-4 border-b-2 rounded-t-lg border-transparent hover:text-slate-600 hover:border-slate-300 text-slate-500 flex items-center gap-2";
          }
        });
      }

      function changeLanguage(lang) {
        currentLang = lang;
        updateUITranslations();
        runAgeCalculation();
        runDiffCalculation();
        runDurationCalculation();
      }

      function updateUITranslations() {
        const dict = TRANSLATIONS[currentLang];
        
        // Headers & Labels
        document.getElementById('taglineSub').innerText = dict.subtitle;
        document.getElementById('taglineText').innerText = dict.tagline;
        
        document.getElementById('tabLabelAge').innerText = dict.tabAge;
        document.getElementById('tabLabelDiff').innerText = dict.tabDiff;
        document.getElementById('tabLabelDuration').innerText = dict.tabDuration;
        
        document.getElementById('lblBirthDate').innerText = dict.birthDateLabel;
        document.getElementById('lblBirthTime').innerText = dict.birthTimeLabel;
        document.getElementById('lblCalcDate').innerText = dict.calcDateLabel;
        document.getElementById('btnCalcAge').innerText = dict.calculateBtn;
        document.getElementById('lblExactAgeRightNow').innerText = dict.exactAgeTitle;
        
        document.getElementById('lblYears').innerText = dict.years;
        document.getElementById('lblMonths').innerText = dict.months;
        document.getElementById('lblDays').innerText = dict.days;
        document.getElementById('lblWeeks').innerText = dict.weeks;
        document.getElementById('lblHours').innerText = dict.hours;
        document.getElementById('lblMinutes').innerText = dict.minutes;
        document.getElementById('lblSeconds').innerText = dict.seconds;
        
        document.getElementById('lblNextBdayTitle').innerText = dict.nextBirthdayTitle;
        document.getElementById('lblCountdownPrefix').innerText = dict.countdownPrefix;
        document.getElementById('lblStatsTitle').innerText = dict.statsTitle;
        
        document.getElementById('lblZodiacWest').innerText = dict.westernZodiac;
        document.getElementById('lblZodiacChinese').innerText = dict.chineseZodiac;
        document.getElementById('lblBstone').innerText = dict.birthstone;
        document.getElementById('lblBirthDayOfWeek').innerText = dict.dayOfWeekBirth;
        
        document.getElementById('lblProgressTitle').innerText = dict.progressTitle;
        document.getElementById('lblProgressDesc').innerText = dict.progressDesc;
        document.getElementById('lblTargetAge').innerText = dict.targetMilestoneLabel;
        document.getElementById('lblLivedText').innerText = dict.yearsLived;
        document.getElementById('lblRemainingText').innerText = dict.yearsRemaining;
        
        document.getElementById('lblEstHeart').innerText = dict.approxHeartbeats;
        document.getElementById('lblEstBreaths').innerText = dict.approxBreaths;
        document.getElementById('lblEstSleep').innerText = dict.approxSleep;
        
        // Tab 2
        document.getElementById('lblDiffTitle').innerText = dict.startDateLabel;
        document.getElementById('lblDiffStart').innerText = dict.startDateLabel;
        document.getElementById('lblDiffEnd').innerText = dict.endDateLabel;
        document.getElementById('lblQuickSelect').innerText = dict.quickSelectLabel;
        document.getElementById('btnQuickLast30').innerText = dict.quickSelectLast30;
        document.getElementById('btnQuickNext30').innerText = dict.quickSelectNext30;
        document.getElementById('btnQuickJan1').innerText = dict.quickSelectSinceJan1;
        document.getElementById('btnQuickToday').innerText = dict.quickSelectToday;
        document.getElementById('lblExcludeWknd').innerText = dict.excludeWeekendsLabel;
        document.getElementById('lblIncludeEnd').innerText = dict.includeEndDateLabel;
        document.getElementById('btnCalcDiff').innerText = dict.calculateBtn;
        document.getElementById('lblCalculatedDateSpan').innerText = dict.diffResultTitle;
        document.getElementById('lblWorkingDays').innerText = dict.workingDaysOnly;
        document.getElementById('diffMainLabel').innerText = dict.totalCalendarDays;
        document.getElementById('lblAlternateFormats').innerText = dict.alternateFormats;
        
        // Tab 3
        document.getElementById('lblAddDurationTitle').innerText = dict.addDurationTitle;
        document.getElementById('lblDurationStart').innerText = dict.startDateLabel;
        document.getElementById('lblOperation').innerText = dict.operationLabel;
        document.getElementById('lblDurExcludeWknd').innerText = dict.excludeWeekendsLabel;
        document.getElementById('lblResultingTargetDate').innerText = dict.resultingDateLabel;
        
        // About Section
        document.getElementById('lblAboutTitle').innerText = dict.aboutTitle;
        document.getElementById('txtAboutP1').innerText = dict.aboutP1;
        document.getElementById('txtAboutP2').innerText = dict.aboutP2;
        document.getElementById('txtAboutP3').innerText = dict.aboutP3;
        
        // FAQ
        document.getElementById('lblFaqHeader').innerText = dict.faqTitle;
        
        // Export Panel
        document.getElementById('lblExportTitle').innerText = dict.exportTitle;
        document.getElementById('lblExportDesc').innerText = dict.exportDesc;
        document.getElementById('btnExport').innerText = dict.exportBtn;
        
        // GDPR & Modal
        document.getElementById('txtGdprNotice').innerText = dict.gdprNotice;
        document.getElementById('btnGdprAll').innerText = dict.gdprAcceptAll;
        document.getElementById('btnGdprEssential').innerText = dict.gdprEssentialOnly;
        document.getElementById('lblPrivacyBtn').innerText = dict.gdprLearnMore;
        
        document.getElementById('lblModalTitle').innerText = dict.privacyModalTitle;
        document.getElementById('lblModalB1').innerText = dict.privacyModalBody1;
        document.getElementById('lblModalB2').innerText = dict.privacyModalBody2;
        document.getElementById('lblModalB3').innerText = dict.privacyModalBody3;
        document.getElementById('lblModalCloseBtn').innerText = dict.close;
        
        // Populate FAQs
        const container = document.getElementById('faqContainer');
        container.innerHTML = '';
        FAQ_ITEMS[currentLang].forEach((item, index) => {
          const detail = document.createElement('details');
          detail.className = "group bg-white p-4 rounded-xl border border-slate-100 shadow-sm cursor-pointer [&_summary::-webkit-details-marker]:hidden";
          detail.innerHTML = \`<summary class="flex justify-between items-center font-bold text-slate-800 text-sm list-none">
            <span>\${item.question}</span>
            <span class="transition group-open:rotate-180 text-blue-600">▼</span>
          </summary>
          <p class="mt-2.5 text-xs text-slate-500 leading-relaxed border-t border-slate-50 pt-2.5">\${item.answer}</p>\`;
          container.appendChild(detail);
        });
      }

      // CALCULATIONS ENGINE
      function getWesternZodiac(m, d) {
        const zodiacs = [
          { m: 1, d: 19, name: { EN: "Capricorn", DE: "Steinbock", FR: "Capricorne", ES: "Capricornio", IT: "Capricorno" }, sym: "♑" },
          { m: 2, d: 18, name: { EN: "Aquarius", DE: "Wassermann", FR: "Verseau", ES: "Acuario", IT: "Acquario" }, sym: "♒" },
          { m: 3, d: 20, name: { EN: "Pisces", DE: "Fische", FR: "Poissons", ES: "Piscis", IT: "Pesci" }, sym: "♓" },
          { m: 4, d: 19, name: { EN: "Aries", DE: "Widder", FR: "Bélier", ES: "Aries", IT: "Ariete" }, sym: "♈" },
          { m: 5, d: 20, name: { EN: "Taurus", DE: "Stier", FR: "Taureau", ES: "Tauro", IT: "Toro" }, sym: "♉" },
          { m: 6, d: 20, name: { EN: "Gemini", DE: "Zwillinge", FR: "Gémeaux", ES: "Géminis", IT: "Gemelli" }, sym: "♊" },
          { m: 7, d: 22, name: { EN: "Cancer", DE: "Krebs", FR: "Cancer", ES: "Cáncer", IT: "Cancro" }, sym: "♋" },
          { m: 8, d: 22, name: { EN: "Leo", DE: "Löwe", FR: "Lion", ES: "Leo", IT: "Leone" }, sym: "♌" },
          { m: 9, d: 22, name: { EN: "Virgo", DE: "Jungfrau", FR: "Vierge", ES: "Virgo", IT: "Vergine" }, sym: "♍" },
          { m: 10, d: 22, name: { EN: "Libra", DE: "Waage", FR: "Balance", ES: "Libra", IT: "Bilancia" }, sym: "♎" },
          { m: 11, d: 21, name: { EN: "Scorpio", DE: "Skorpion", FR: "Scorpion", ES: "Escorpio", IT: "Scorpione" }, sym: "♏" },
          { m: 12, d: 21, name: { EN: "Sagittarius", DE: "Schütze", FR: "Sagittaire", ES: "Sagitario", IT: "Sagittario" }, sym: "♐" }
        ];
        const match = zodiacs.find(z => {
          if (m === z.m && d <= z.d) return true;
          if (m === (z.m === 1 ? 12 : z.m - 1) && d > z.d) return true;
          return false;
        });
        return match ? match.sym + " " + match.name[currentLang] : "♑ Capricorn";
      }

      function getChineseZodiac(y) {
        const animals = [
          { name: { EN: "Rat", DE: "Ratte", FR: "Rat", ES: "Rata", IT: "Topo" }, emoji: "🐀" },
          { name: { EN: "Ox", DE: "Büffel", FR: "Bœuf", ES: "Buey", IT: "Bufalo" }, emoji: "🐂" },
          { name: { EN: "Tiger", DE: "Tiger", FR: "Tigre", ES: "Tigre", IT: "Tigre" }, emoji: "🐅" },
          { name: { EN: "Rabbit", DE: "Hase", FR: "Lapin", ES: "Conejo", IT: "Coniglio" }, emoji: "🐇" },
          { name: { EN: "Dragon", DE: "Drache", FR: "Dragon", ES: "Dragón", IT: "Drago" }, emoji: "🐉" },
          { name: { EN: "Snake", DE: "Schlange", FR: "Serpent", ES: "Serpiente", IT: "Serpente" }, emoji: "🐍" },
          { name: { EN: "Horse", DE: "Pferd", FR: "Cheval", ES: "Caballo", IT: "Cavallo" }, emoji: "🐎" },
          { name: { EN: "Goat", DE: "Ziege", FR: "Chèvre", ES: "Cabra", IT: "Capra" }, emoji: "🐐" },
          { name: { EN: "Monkey", DE: "Affe", FR: "Singe", ES: "Mono", IT: "Scimmia" }, emoji: "🐒" },
          { name: { EN: "Rooster", DE: "Hahn", FR: "Coq", ES: "Gallo", IT: "Gallo" }, emoji: "🐓" },
          { name: { EN: "Dog", DE: "Hund", FR: "Chien", ES: "Perro", IT: "Cane" }, emoji: "🐕" },
          { name: { EN: "Pig", DE: "Schwein", FR: "Cochon", ES: "Cerdo", IT: "Maiale" }, emoji: "🐖" }
        ];
        let index = (y - 4) % 12;
        if (index < 0) index += 12;
        return animals[index].emoji + " " + animals[index].name[currentLang];
      }

      function getBirthstone(m) {
        const stones = {
          1: { EN: "Garnet 🌌", DE: "Granat 🌌", FR: "Grenat 🌌", ES: "Granate 🌌", IT: "Granato 🌌" },
          2: { EN: "Amethyst 💎", DE: "Amethyst 💎", FR: "Améthyste 💎", ES: "Amatista 💎", IT: "Ametista 💎" },
          3: { EN: "Aquamarine 🌊", DE: "Aquamarin 🌊", FR: "Aigue-marine 🌊", ES: "Aguamarina 🌊", IT: "Acquamarina 🌊" },
          4: { EN: "Diamond 💍", DE: "Diamant 💍", FR: "Diamant 💍", ES: "Diamante 💍", IT: "Diamante 💍" },
          5: { EN: "Emerald 💚", DE: "Smaragd 💚", FR: "Émeraude 💚", ES: "Esmeralda 💚", IT: "Smeraldo 💚" },
          6: { EN: "Alexandrite 🐚", DE: "Alexandrit 🐚", FR: "Alexandrite 🐚", ES: "Alejandrita 🐚", IT: "Alessandrite 🐚" },
          7: { EN: "Ruby ❤️", DE: "Rubin ❤️", FR: "Rubis ❤️", ES: "Rubí ❤️", IT: "Rubino ❤️" },
          8: { EN: "Peridot 🍀", DE: "Peridot 🍀", FR: "Péridot 🍀", ES: "Peridoto 🍀", IT: "Peridoto 🍀" },
          9: { EN: "Sapphire 💙", DE: "Saphir 💙", FR: "Saphir 💙", ES: "Zafiro 💙", IT: "Zaffiro 💙" },
          10: { EN: "Opal 🌈", DE: "Opal 🌈", FR: "Opale 🌈", ES: "Ópalo 🌈", IT: "Opale 🌈" },
          11: { EN: "Topaz 💛", DE: "Topas 💛", FR: "Topaze 💛", ES: "Topacio 💛", IT: "Topazio 💛" },
          12: { EN: "Turquoise ❄️", DE: "Türkis ❄️", FR: "Turquoise ❄️", ES: "Turquesa ❄️", IT: "Turchese ❄️" }
        };
        return stones[m]?.[currentLang] || stones[1][currentLang];
      }

      function runAgeCalculation() {
        const birthDateStr = document.getElementById('birthDate').value;
        const birthTimeStr = document.getElementById('birthTime').value || '00:00';
        let calcDateStr = document.getElementById('calcDate').value;
        
        if (!birthDateStr) return;
        
        const birth = new Date(birthDateStr + 'T' + birthTimeStr);
        const target = calcDateStr ? new Date(calcDateStr) : new Date();
        
        // Handle negative ages
        const validBirth = birth.getTime() > target.getTime() ? target : birth;
        const diffMs = target.getTime() - validBirth.getTime();
        
        const totalSec = Math.floor(diffMs / 1000);
        const totalMin = Math.floor(totalSec / 60);
        const totalHr = Math.floor(totalMin / 60);
        const totalDays = Math.floor(totalHr / 24);
        const totalWks = Math.floor(totalDays / 7);

        let calcYears = target.getFullYear() - validBirth.getFullYear();
        let calcMonths = target.getMonth() - validBirth.getMonth();
        let calcDays = target.getDate() - validBirth.getDate();
        let calcHours = target.getHours() - validBirth.getHours();
        let calcMinutes = target.getMinutes() - validBirth.getMinutes();
        let calcSeconds = target.getSeconds() - validBirth.getSeconds();

        if (calcSeconds < 0) { calcSeconds += 60; calcMinutes--; }
        if (calcMinutes < 0) { calcMinutes += 60; calcHours--; }
        if (calcHours < 0) { calcHours += 24; calcDays--; }
        if (calcDays < 0) {
          const prevMonth = new Date(target.getFullYear(), target.getMonth(), 0);
          calcDays += prevMonth.getDate();
          calcMonths--;
        }
        if (calcMonths < 0) {
          calcMonths += 12;
          calcYears--;
        }

        // Output breakdown
        document.getElementById('resYears').innerText = calcYears;
        document.getElementById('resMonths').innerText = calcMonths;
        document.getElementById('resDays').innerText = calcDays;
        document.getElementById('resWeeks').innerText = totalWks;
        
        document.getElementById('resHours').innerText = totalHr;
        document.getElementById('resMinutes').innerText = totalMin;
        document.getElementById('resSeconds').innerText = totalSec;

        // Next Birthday Countdown
        const currYear = target.getFullYear();
        let nextBday = new Date(validBirth);
        nextBday.setFullYear(currYear);
        if (nextBday.getTime() < target.getTime()) {
          nextBday.setFullYear(currYear + 1);
        }
        
        const bdayDiffMs = nextBday.getTime() - target.getTime();
        const bdayTotSec = Math.floor(bdayDiffMs / 1000);
        const bdayDays = Math.floor(bdayTotSec / (3600 * 24));
        
        let bdayMonths = nextBday.getMonth() - target.getMonth();
        let bdayRemDays = nextBday.getDate() - target.getDate();
        let bdayHours = nextBday.getHours() - target.getHours();
        let bdayMin = nextBday.getMinutes() - target.getMinutes();
        let bdaySec = nextBday.getSeconds() - target.getSeconds();

        if (bdaySec < 0) { bdaySec += 60; bdayMin--; }
        if (bdayMin < 0) { bdayMin += 60; bdayHours--; }
        if (bdayHours < 0) { bdayHours += 24; bdayRemDays--; }
        if (bdayRemDays < 0) {
          const pm = new Date(nextBday.getFullYear(), nextBday.getMonth(), 0);
          bdayRemDays += pm.getDate();
          bdayMonths--;
        }
        if (bdayMonths < 0) bdayMonths += 12;

        document.getElementById('cntMonths').innerText = bdayMonths;
        document.getElementById('cntDays').innerText = bdayRemDays;
        document.getElementById('cntHours').innerText = bdayHours;
        document.getElementById('cntTotalDays').innerText = bdayDays + " " + (currentLang === 'DE' ? "Tage verbleibend" : currentLang === 'FR' ? "jours restants" : currentLang === 'ES' ? "días restantes" : currentLang === 'IT' ? "giorni rimanenti" : "days remaining");

        // Day of Week, Zodiac & Birthstone
        const weekDays = {
          EN: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
          DE: ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"],
          FR: ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"],
          ES: ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"],
          IT: ["Domenica", "Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato"]
        };
        document.getElementById('valBirthDayOfWeek').innerText = weekDays[currentLang][validBirth.getDay()];
        
        const m = validBirth.getMonth() + 1;
        const d = validBirth.getDate();
        const y = validBirth.getFullYear();
        document.getElementById('valZodiacWest').innerText = getWesternZodiac(m, d);
        document.getElementById('valZodiacChinese').innerText = getChineseZodiac(y);
        document.getElementById('valBstone').innerText = getBirthstone(m);

        // Life Milestone Progress
        const targetAgeInput = parseInt(document.getElementById('targetMilestone').value) || 67;
        const ageDecimal = calcYears + (calcMonths / 12) + (calcDays / 365);
        let progressPercent = Math.min(100, Math.max(0, (ageDecimal / targetAgeInput) * 100));
        
        document.getElementById('progressLived').style.width = progressPercent + "%";
        document.getElementById('txtLived').innerText = calcYears;
        document.getElementById('txtRemaining').innerText = Math.max(0, targetAgeInput - calcYears);

        // Fun estimates
        const formatLocale = currentLang === 'DE' ? 'de-DE' : currentLang === 'FR' ? 'fr-FR' : 'en-US';
        const numFormat = new Intl.NumberFormat(formatLocale);
        document.getElementById('statHeart').innerText = numFormat.format(totalMin * 78);
        document.getElementById('statBreaths').innerText = numFormat.format(totalMin * 15);
        document.getElementById('statSleep').innerText = numFormat.format(Math.floor(totalDays * 7.8));
      }

      function quickSelectDiff(type) {
        const todayObj = new Date();
        const formatYMD = (d) => {
          const y = d.getFullYear();
          const m = String(d.getMonth() + 1).padStart(2, '0');
          const r = String(d.getDate()).padStart(2, '0');
          return y + "-" + m + "-" + r;
        };

        const todayStr = formatYMD(todayObj);

        switch (type) {
          case 'last30': {
            const past = new Date(todayObj);
            past.setDate(past.getDate() - 30);
            document.getElementById('diffStartDate').value = formatYMD(past);
            document.getElementById('diffEndDate').value = todayStr;
            break;
          }
          case 'next30': {
            const future = new Date(todayObj);
            future.setDate(future.getDate() + 30);
            document.getElementById('diffStartDate').value = todayStr;
            document.getElementById('diffEndDate').value = formatYMD(future);
            break;
          }
          case 'jan1': {
            const jan1 = new Date(todayObj.getFullYear(), 0, 1);
            document.getElementById('diffStartDate').value = formatYMD(jan1);
            document.getElementById('diffEndDate').value = todayStr;
            break;
          }
          case 'today': {
            document.getElementById('diffStartDate').value = todayStr;
            document.getElementById('diffEndDate').value = todayStr;
            break;
          }
        }
        runDiffCalculation();
      }

      function runDiffCalculation() {
        const startStr = document.getElementById('diffStartDate').value;
        const endStr = document.getElementById('diffEndDate').value;
        const excludeWeekends = document.getElementById('excludeWeekends').checked;
        const includeEndDate = document.getElementById('includeEndDate').checked;

        if (!startStr || !endStr) return;

        let start = new Date(startStr);
        let end = new Date(endStr);

        if (start.getTime() > end.getTime()) {
          const temp = start;
          start = end;
          end = temp;
        }

        const workingEnd = includeEndDate ? new Date(end.getTime() + 24 * 3600 * 1000) : end;
        const totalMs = workingEnd.getTime() - start.getTime();
        const totalDays = Math.max(0, Math.floor(totalMs / (1000 * 3600 * 24)));

        let workingDaysCount = 0;
        if (totalDays > 0) {
          const current = new Date(start);
          while (current.getTime() < workingEnd.getTime()) {
            const day = current.getDay();
            if (day !== 0 && day !== 6) workingDaysCount++;
            current.setDate(current.getDate() + 1);
          }
        }

        let years = workingEnd.getFullYear() - start.getFullYear();
        let months = workingEnd.getMonth() - start.getMonth();
        let days = workingEnd.getDate() - start.getDate();

        if (days < 0) {
          const prevMonth = new Date(workingEnd.getFullYear(), workingEnd.getMonth(), 0);
          days += prevMonth.getDate();
          months--;
        }
        if (months < 0) {
          months += 12;
          years--;
        }

        document.getElementById('diffMainResult').innerText = totalDays;
        document.getElementById('diffWorkingDays').innerText = workingDaysCount;

        document.getElementById('diffBreakdownYears').innerText = years;
        document.getElementById('diffBreakdownMonths').innerText = months;
        document.getElementById('diffBreakdownWeeks').innerText = Math.floor(totalDays / 7);
        document.getElementById('diffBreakdownDays').innerText = days;

        const formatLocale = currentLang === 'DE' ? 'de-DE' : currentLang === 'FR' ? 'fr-FR' : 'en-US';
        const numFormat = new Intl.NumberFormat(formatLocale);
        document.getElementById('diffHrs').innerText = numFormat.format(totalDays * 24);
        document.getElementById('diffMins').innerText = numFormat.format(totalDays * 24 * 60);
        document.getElementById('diffSecs').innerText = numFormat.format(totalDays * 24 * 3600);
      }

      function runDurationCalculation() {
        const startStr = document.getElementById('durStartDate').value;
        const op = document.getElementById('durOperation').value;
        const years = parseInt(document.getElementById('durYears').value) || 0;
        const months = parseInt(document.getElementById('durMonths').value) || 0;
        const weeks = parseInt(document.getElementById('durWeeks').value) || 0;
        const days = parseInt(document.getElementById('durDays').value) || 0;
        const skipWeekends = document.getElementById('durSkipWeekends').checked;

        if (!startStr) return;

        let start = new Date(startStr);
        const factor = op === 'add' ? 1 : -1;

        start.setFullYear(start.getFullYear() + (years * factor));
        start.setMonth(start.getMonth() + (months * factor));

        let calendarDays = (weeks * 7) + days;
        if (skipWeekends && calendarDays > 0) {
          let steps = calendarDays;
          while (steps > 0) {
            start.setDate(start.getDate() + factor);
            const d = start.getDay();
            if (d !== 0 && d !== 6) steps--;
          }
        } else {
          start.setDate(start.getDate() + (calendarDays * factor));
        }

        const weekDays = {
          EN: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
          DE: ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"],
          FR: ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"],
          ES: ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"],
          IT: ["Domenica", "Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato"]
        };

        const resDay = String(start.getDate()).padStart(2, '0');
        const resMo = String(start.getMonth() + 1).padStart(2, '0');
        const resYr = start.getFullYear();

        document.getElementById('durationResultDate').innerText = resDay + "/" + resMo + "/" + resYr;
        document.getElementById('durationResultDay').innerText = weekDays[currentLang][start.getDay()];
      }

      function exportPDF() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Dictionary for headers and titles based on current language
        const dicts = {
          EN: {
            pdfTitle: "SMART AGE & DATE CALCULATOR",
            pdfSub: "Accurate European Standard Precision Report",
            pdfGeneratedOn: "Report generated on",
            pdfDetails: "Calculation Configuration Details",
            pdfResults: "Calculated Precision Results",
            birthDate: "Date of Birth",
            calcDate: "Age as of Date",
            exactAge: "Your Exact Age",
            nextBday: "Next Birthday Countdown",
            stats: "Astrological & Life Metrics",
            progress: "Life Progress & Retirement",
            years: "Years Lived",
            metrics: "Life Metrics (Averages)",
            startDate: "Start Date",
            endDate: "End Date",
            excludeWeekends: "Exclude Weekends",
            includeEndDate: "Include End Date",
            totalDays: "Total Calendar Days",
            workingDays: "Working Days (Mon-Fri)",
            alternate: "Alternate Breakdowns",
            resultingDate: "Resulting Target Date",
            dayOfWeek: "Day of the Week",
            operation: "Operation",
            duration: "Duration"
          },
          DE: {
            pdfTitle: "SMART AGE & DATE CALCULATOR",
            pdfSub: "Präzisionsbericht nach europäischem Standard",
            pdfGeneratedOn: "Bericht erstellt am",
            pdfDetails: "Berechnungs-Konfigurationsdetails",
            pdfResults: "Berechnete Präzisionsergebnisse",
            birthDate: "Geburtsdatum",
            calcDate: "Berechnungsdatum",
            exactAge: "Genaues Alter",
            nextBday: "Countdown zum nächsten Geburtstag",
            stats: "Astrologische & Lebensdaten",
            progress: "Lebensfortschritt & Rente",
            years: "Gelebte Jahre",
            metrics: "Lebensstatistiken (Schätzungen)",
            startDate: "Startdatum",
            endDate: "Enddatum",
            excludeWeekends: "Wochenenden ausschließen",
            includeEndDate: "Enddatum einschließen",
            totalDays: "Gesamte Kalendertage",
            workingDays: "Arbeitstage (Mo-Fr)",
            alternate: "Alternative Darstellungen",
            resultingDate: "Berechnetes Zieldatum",
            dayOfWeek: "Wochentag",
            operation: "Operation",
            duration: "Dauer"
          },
          FR: {
            pdfTitle: "SMART AGE & DATE CALCULATOR",
            pdfSub: "Rapport de précision conforme aux normes européennes",
            pdfGeneratedOn: "Rapport généré le",
            pdfDetails: "Détails de configuration du calcul",
            pdfResults: "Résultats de précision calculés",
            birthDate: "Date de naissance",
            calcDate: "Date de calcul",
            exactAge: "Votre âge exact",
            nextBday: "Compte à rebours anniversaire",
            stats: "Statistiques astrologiques & vie",
            progress: "Progression de vie & retraite",
            years: "Années accomplies",
            metrics: "Indicateurs de vie (Moyennes)",
            startDate: "Date de début",
            endDate: "Date de fin",
            excludeWeekends: "Exclure les week-ends",
            includeEndDate: "Inclure la date de fin",
            totalDays: "Total des jours calendaires",
            workingDays: "Jours ouvrés (Lun-Ven)",
            alternate: "Formats alternatifs",
            resultingDate: "Date cible résultante",
            dayOfWeek: "Jour de la semaine",
            operation: "Opération",
            duration: "Durée"
          },
          ES: {
            pdfTitle: "SMART AGE & DATE CALCULATOR",
            pdfSub: "Informe de precisión conforme al estándar europeo",
            pdfGeneratedOn: "Informe generado el",
            pdfDetails: "Detalles de configuración del cálculo",
            pdfResults: "Resultados de precisión calculados",
            birthDate: "Fecha de nacimiento",
            calcDate: "Calcular a la fecha",
            exactAge: "Su edad exacta",
            nextBday: "Cuenta atrás para cumpleaños",
            stats: "Estadísticas astrológicas y de vida",
            progress: "Progreso de vida y jubilación",
            years: "Años completados",
            metrics: "Métricas de vida (Promedios)",
            startDate: "Fecha inicial",
            endDate: "Fecha final",
            excludeWeekends: "Excluir fines de semana",
            includeEndDate: "Incluir fecha final",
            totalDays: "Total de días naturales",
            workingDays: "Días laborables (Lun-Vie)",
            alternate: "Formatos de desglose alternativos",
            resultingDate: "Fecha de destino resultante",
            dayOfWeek: "Día de la semana",
            operation: "Operación",
            duration: "Duración"
          },
          IT: {
            pdfTitle: "SMART AGE & DATE CALCULATOR",
            pdfSub: "Rapporto di precisione standard europeo",
            pdfGeneratedOn: "Rapporto generato il",
            pdfDetails: "Dettagli configurazione calcolo",
            pdfResults: "Risultati calcolati di precisione",
            birthDate: "Data di nascita",
            calcDate: "Calcola alla data del",
            exactAge: "Età esatta",
            nextBday: "Conto alla rovescia compleanno",
            stats: "Statistiche astrologiche e di vita",
            progress: "Progresso di vita e traguardi pensione",
            years: "Anni completati",
            metrics: "Statistiche di vita (Stime)",
            startDate: "Data di inizio",
            endDate: "Data di fine",
            excludeWeekends: "Escludi i fine settimana",
            includeEndDate: "Includi data finale",
            totalDays: "Totale giorni solari",
            workingDays: "Giorni lavorativi (Lun-Ven)",
            alternate: "Formati alternativi",
            resultingDate: "Data di destinazione calcolata",
            dayOfWeek: "Giorno della settimana",
            operation: "Operazione",
            duration: "Durata"
          }
        };

        const localDict = dicts[currentLang] || dicts.EN;
        
        // Header Banner
        doc.setFillColor(30, 27, 75); // Indigo 950
        doc.rect(0, 0, 210, 38, 'F');
        
        // App Logo
        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.text(localDict.pdfTitle, 15, 14);
        
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(199, 210, 254);
        doc.text(localDict.pdfSub, 15, 21);
        
        // Metadata block
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(7);
        const todayStr = new Date().toLocaleString();
        doc.text(localDict.pdfGeneratedOn + ": " + todayStr, 15, 29);
        
        // Content layout
        let y = 48;
        
        // Section Header Helper
        const drawSectionHeader = (title) => {
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
        const drawField = (label, value, isBig = false) => {
          doc.setFont("helvetica", "bold");
          doc.setFontSize(8);
          doc.setTextColor(100, 116, 139); // Slate 500
          doc.text(label, 15, y);
          
          doc.setFont("helvetica", isBig ? "bold" : "normal");
          doc.setFontSize(isBig ? 11 : 8.5);
          doc.setTextColor(15, 23, 42); // Slate 900
          doc.text(String(value), 95, y);
          
          // Divider
          doc.setDrawColor(241, 245, 249); // Slate 100
          doc.line(15, y + 3, 195, y + 3);
          y += 8;
        };
        
        if (activeTab === 'age') {
          drawSectionHeader(localDict.pdfDetails);
          const birthD = document.getElementById('birthDate').value;
          const birthT = document.getElementById('birthTime').value;
          const calcD = document.getElementById('calcDate').value;
          drawField(localDict.birthDate, birthD + (birthT ? ' (' + birthT + ')' : ''));
          drawField(localDict.calcDate, calcD);
          
          y += 4;
          drawSectionHeader(localDict.pdfResults);
          const yrs = document.getElementById('resYears').innerText;
          const mos = document.getElementById('resMonths').innerText;
          const dys = document.getElementById('resDays').innerText;
          const wks = document.getElementById('resWeeks').innerText;
          const hrs = document.getElementById('resHours').innerText;
          const mins = document.getElementById('resMinutes').innerText;
          const secs = document.getElementById('resSeconds').innerText;
          
          drawField(localDict.exactAge, yrs + ' y, ' + mos + ' m, ' + dys + ' d', true);
          drawField("Weeks", wks);
          drawField("Hours", hrs);
          drawField("Minutes", mins);
          drawField("Seconds", secs);
          
          y += 4;
          drawSectionHeader(localDict.nextBday);
          const nextMo = document.getElementById('nextBdayMonths').innerText;
          const nextDy = document.getElementById('nextBdayDays').innerText;
          const nextHr = document.getElementById('nextBdayHours').innerText;
          const daysLeft = document.getElementById('lblNextBdayDaysLeft').innerText;
          drawField(localDict.nextBday, nextMo + ' m, ' + nextDy + ' d, ' + nextHr + ' h (' + daysLeft + ')');
          
          y += 4;
          drawSectionHeader(localDict.stats);
          const wZod = document.getElementById('resZodiac').innerText;
          const cZod = document.getElementById('resChineseZodiac').innerText;
          const bStone = document.getElementById('resBirthstone').innerText;
          const dayOfBirth = document.getElementById('resDayOfWeek').innerText;
          drawField("Western Zodiac", wZod);
          drawField("Chinese Zodiac", cZod);
          drawField("Birthstone", bStone);
          drawField("Day of Birth", dayOfBirth);
          
          y += 4;
          drawSectionHeader(localDict.progress);
          const tMilestone = document.getElementById('milestoneAge').value;
          const progressTxt = document.getElementById('progressTextLeft').innerText;
          drawField("Target Age", tMilestone);
          drawField("Lived / Remaining", progressTxt);
          
          y += 4;
          drawSectionHeader(localDict.metrics);
          const heart = document.getElementById('statHeart').innerText;
          const breath = document.getElementById('statBreaths').innerText;
          const sleep = document.getElementById('statSleep').innerText;
          drawField("Heartbeats", heart);
          drawField("Breaths", breath);
          drawField("Sleep Hours", sleep);
        } 
        else if (activeTab === 'diff') {
          const sDate = document.getElementById('diffStartDate').value;
          const eDate = document.getElementById('diffEndDate').value;
          const excW = document.getElementById('excludeWeekends').checked ? 'YES' : 'NO';
          const incE = document.getElementById('includeEndDate').checked ? 'YES' : 'NO';
          
          drawSectionHeader(localDict.pdfDetails);
          drawField(localDict.startDate, sDate);
          drawField(localDict.endDate, eDate);
          drawField(localDict.excludeWeekends, excW);
          drawField(localDict.includeEndDate, incE);
          
          y += 4;
          drawSectionHeader(localDict.pdfResults);
          const totDays = document.getElementById('diffMainResult').innerText;
          const wrkDays = document.getElementById('diffWorkingDays').innerText;
          drawField(localDict.totalDays, totDays, true);
          drawField(localDict.workingDays, wrkDays, true);
          
          y += 4;
          drawSectionHeader(localDict.alternate);
          const bYrs = document.getElementById('diffBreakdownYears').innerText;
          const bMos = document.getElementById('diffBreakdownMonths').innerText;
          const bWks = document.getElementById('diffBreakdownWeeks').innerText;
          const bDys = document.getElementById('diffBreakdownDays').innerText;
          drawField("Years / Months / Weeks / Days", bYrs + 'y / ' + bMos + 'm / ' + bWks + 'w / ' + bDys + 'd');
          
          y += 4;
          drawSectionHeader("Time Breakdown");
          const dHrs = document.getElementById('diffHrs').innerText;
          const dMins = document.getElementById('diffMins').innerText;
          const dSecs = document.getElementById('diffSecs').innerText;
          drawField("Hours", dHrs);
          drawField("Minutes", dMins);
          drawField("Seconds", dSecs);
        }
        else if (activeTab === 'duration') {
          const sDate = document.getElementById('durStartDate').value;
          const op = document.getElementById('durOperation').value === 'add' ? 'Add (+)' : 'Subtract (-)';
          const yrs = document.getElementById('durYears').value;
          const mos = document.getElementById('durMonths').value;
          const wks = document.getElementById('durWeeks').value;
          const dys = document.getElementById('durDays').value;
          const excW = document.getElementById('durSkipWeekends').checked ? 'YES' : 'NO';
          
          drawSectionHeader(localDict.pdfDetails);
          drawField(localDict.startDate, sDate);
          drawField(localDict.operation, op);
          drawField(localDict.duration, yrs + 'y / ' + mos + 'm / ' + wks + 'w / ' + dys + 'd');
          drawField(localDict.excludeWeekends, excW);
          
          y += 4;
          drawSectionHeader(localDict.pdfResults);
          const rDate = document.getElementById('durationResultDate').innerText;
          const rDay = document.getElementById('durationResultDay').innerText;
          drawField(localDict.resultingDate, rDate, true);
          drawField(localDict.dayOfWeek, rDay);
        }
        
        // Page footer
        doc.setFont("helvetica", "bold");
        doc.setFontSize(7);
        doc.setTextColor(156, 163, 175); // Slate 400
        doc.text("© 2026 Smart Age & Date Calculator Pro. Built for European Precision & Compliance.", 15, 285);
        
        doc.save("Precision_Report_" + activeTab + ".pdf");
      }

      function downloadSelfContainedHTML() {
        const htmlContent = document.documentElement.outerHTML;
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'index.html';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      // INITIALIZE
      document.getElementById('calcDate').value = new Date().toISOString().split('T')[0];
      updateUITranslations();
      
      // Real-time ticking engine for age seconds
      setInterval(() => {
        if (activeTab === 'age') {
          runAgeCalculation();
        }
      }, 1000);
    </script>
  </body>
</html>`;
}
