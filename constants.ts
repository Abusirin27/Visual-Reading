
import { FontOption, ReaderSettings, ShortcutMap, ReadingMode } from './types';

export const ARABIC_FONTS: FontOption[] = [
  { name: 'Amiri Quran', family: '"Amiri Quran", serif', isQuranic: true },
  { name: 'Amiri (Classic)', family: '"Amiri", serif', isQuranic: true },
  { name: 'Scheherazade New', family: '"Scheherazade New", serif', isQuranic: true },
  { name: 'Lateef', family: '"Lateef", serif', isQuranic: true },
  { name: 'Noto Naskh Arabic', family: '"Noto Naskh Arabic", serif', isQuranic: true },
  { name: 'Katibeh', family: '"Katibeh", serif', isQuranic: true },
  { name: 'Harmattan', family: '"Harmattan", sans-serif', isQuranic: true },
  { name: 'Markazi Text', family: '"Markazi Text", serif', isQuranic: true },
  { name: 'Kufam', family: '"Kufam", sans-serif', isQuranic: true },
  { name: 'Cairo', family: '"Cairo", sans-serif' },
  { name: 'Tajawal', family: '"Tajawal", sans-serif' },
  { name: 'Almarai', family: '"Almarai", sans-serif' },
  { name: 'Aref Ruqaa', family: '"Aref Ruqaa", serif' },
  { name: 'IBM Plex Sans Arabic', family: '"IBM Plex Sans Arabic", sans-serif' },
  { name: 'Mada', family: '"Mada", sans-serif' },
  { name: 'Reem Kufi', family: '"Reem Kufi", sans-serif' },
  { name: 'El Messiri', family: '"El Messiri", sans-serif' },
  { name: 'Lalezar', family: '"Lalezar", system-ui' },
  { name: 'Changa', family: '"Changa", sans-serif' },
  { name: 'Mirza', family: '"Mirza", serif' },
];

export const ESSENTIAL_COLORS = [
  { name: 'White', value: '#ffffff' },
  { name: 'Slate', value: '#e2e8f0' },
  { name: 'Yellow', value: '#facc15' },
  { name: 'Lime', value: '#a3e635' },
  { name: 'Cyan', value: '#22d3ee' },
  { name: 'Sky', value: '#38bdf8' },
  { name: 'Purple', value: '#c084fc' },
  { name: 'Pink', value: '#f472b6' },
  { name: 'Red', value: '#ef4444' },
];

export const TEXT_COLORS = ESSENTIAL_COLORS;

export const ALL_READING_MODES: ReadingMode[] = [
  'typewriter', 
  'rsvp', 
  'highlight', 
  'spotlight', 
  'magnify', 
  'scroller', 
  'karaoke', 
  'bounce', 
  'pulse',
  'blur',
  'wavy',
  'glitch',
  'gradient',
  'outline',
  'neon',
  'mirror',
  'jelly', 
  'flash',
  'dim',
  'boxed',
  'underline',
  'marker',
  'thick',
  'shake',
  'swing', 
  'slideDown' 
];

export const DEFAULT_SHORTCUTS: ShortcutMap = {
  togglePlay: ' ',
  prevWord: 'ArrowLeft',
  nextWord: 'ArrowRight',
  incFontSize: 'g',
  decFontSize: 's',
  incSpeed: 'i',
  decSpeed: 'd',
  toggleFullscreenApp: 'Shift',
  toggleFullscreenReader: 'z',
  incBrightness: 'ArrowUp',
  decBrightness: 'ArrowDown',
  reset: 'r',
  nextFont: 'f',
  nextColor: 'c',
  nextHighlightColor: 'v',
  incGlow: ']',
  decGlow: '[',
  toggleBold: 'b',
  toggleLang: 'l',
  nextMode: 'm',
  toggleEdit: 'e',
  clearText: 'Delete',
  togglePomodoro: 'p',
  toggleLibrary: 'o',
  toggleShortcuts: 'h',
  toggleStats: 't',
};

export const DEFAULT_SETTINGS: ReaderSettings = {
  wpm: 200,
  fontSize: 32, 
  fontFamily: ARABIC_FONTS[0].family,
  isBold: false,
  textAlign: 'right',
  readingMode: 'typewriter',
  brightness: 100,
  textColor: '#e2e8f0',
  highlightColor: '#38bdf8',
  backgroundColor: '#000000',
  glowIntensity: 0,
};

export const SAMPLE_TEXT = `بسم الله الرحمن الرحيم
والصلاة والسلام على رسول الله وعلى آله وصحبه أجمعين.

مرحبًا بك في تطبيق القراءة البصرية ✨

هذا التطبيق هو أداتك المتقدمة لتطوير مهارة القراءة السريعة وتعزيز التركيز البصري، من خلال تقنيات عرض حديثة وتجربة استخدام مرنة وقابلة للتخصيص. فيما يلي شرح مفصّل لوظائف التطبيق لمساعدتك على الاستفادة القصوى منه:

🔹 أولًا: شريط الأدوات العلوي

زر القراءة: لبدء العرض البصري للنص.

أيقونة التحرير: للتبديل بين وضع القراءة ووضع إدخال أو تعديل النص.

أيقونة المكتبة: وصول مباشر إلى مصادر علمية موثوقة مثل:
- الباحث القرآني
- الدرر السنية
- المكتبة الشاملة

أيقونة بومودورو: مؤقّت ذكي لتنظيم وقت القراءة والراحة وزيادة الإنتاجية.

أيقونة الإحصائيات: لمتابعة تقدّمك ومعرفة عدد الكلمات المقروءة والزمن المستغرق.

🔹 ثانيًا: شريط الإعدادات السفلي

السرعة (WPM): التحكم بعدد الكلمات المعروضة في الدقيقة حسب مستواك.

الخط والحجم: اختيار من مجموعة متنوعة من الخطوط العربية والقرآنية مع إمكانية ضبط حجم النص.

الألوان والتوهج: تخصيص لون النص، لون التمييز، ولون الخلفية بما يريح العين.

نمط التركيز (Z): إخفاء جميع عناصر الواجهة للاندماج الكامل في القراءة دون تشتيت.

🔹 ثالثًا: أنماط القراءة

يمكنك تغيير نمط العرض من الشريط السفلي لتجربة أساليب قراءة مختلفة، مثل:
- نمط الآلة الكاتبة
- نمط كلمة بكلمة
- نمط تسليط الضوء
- وغيرها من الأنماط المتقدمة

🔹 رابعًا: اختصارات لوحة المفاتيح

اضغط على أيقونة لوحة المفاتيح في الأعلى للاطلاع على جميع الاختصارات التي تتيح لك التحكم الكامل في التطبيق دون استخدام الفأرة، مما يجعل تجربتك أسرع وأكثر احترافية.

📌 ابدأ الآن بلصق نصك الخاص، واستمتع بتجربة قراءة فريدة تجمع بين السرعة، التركيز، والراحة البصرية.`;

export const TRANSLATIONS = {
  ar: {
    appTitle: 'القراءة البصرية',
    library: 'المكتبة',
    shortcuts: 'اختصارات',
    mode: 'النمط',
    edit: 'تحرير',
    close: 'إغلاق',
    read: 'قراءة',
    pause: 'توقف',
    reset: 'إعادة',
    fullscreen: 'ملء الشاشة',
    pasteText: 'الصق النص الذي تريد قراءته أو أدخل النص.',
    enterHint: 'اضغط Enter للقراءة. Shift+Enter لسطر جديد.',
    words: 'كلمة',
    loading: 'جاري التحميل...',
    donate: 'تبرع',
    menu: {
      turath: 'تراث',
      quran: 'الباحث القرآني',
      dorar: 'الدرر السنية',
    },
    auth: {
      login: 'دخول',
      register: 'حساب جديد',
      username: 'اسم المستخدم',
      email: 'البريد الإلكتروني',
      password: 'كلمة المرور',
      logout: 'تسجيل الخروج',
      submit: 'إرسال',
      haveAccount: 'لديك حساب بالفعل؟ سجل دخولك',
      noAccount: 'ليس لديك حساب؟ أنشئ حساباً',
      welcome: 'مرحباً',
      error: 'خطأ في البيانات',
      successRegister: 'تم إنشاء الحساب بنجاح',
      successLogin: 'تم تسجيل الدخول بنجاح'
    },
    donation: {
      title: 'دعم المشروع (تبرع برصيد)',
      subtitle: 'دعمكم يضمن استمرار وتطوير البرنامج مجاناً للجميع',
      selectNetwork: 'اختر الشبكة:',
      libyana: 'ليبيانا',
      almadar: 'المدار',
      scratchCard: 'ادخل رقم بطاقة التعبئة******',
      scratchPlaceholder: 'ادخل رقم بطاقة التعبئة******',
      submitCode: 'إرسال',
      success: 'شكراً لدعمك! سيتم مراجعة الكود قريباً.',
      error: 'يرجى إدخال كود الكرت بشكل صحيح.',
      hint: 'سيتم إرسال الكود بريدياً للمطورين للمراجعة والتحقق.',
    },
    settings: {
      speed: 'السرعة',
      wpm: 'كلمة/دقيقة',
      font: 'الخط',
      brightness: 'السطوع',
      size: 'الحجم',
      bold: 'غامق',
      quranic: '(قرآني)',
      color: 'اللون',
      highlightColor: 'لون الكلمة الأخيرة',
      backgroundColor: 'لون الخلفية',
      glow: 'توهج',
    },
    modes: {
      standard: 'قياسي',
      creative: 'إبداعي',
      experimental: 'تجريبي',
      typewriter: 'الآلة الكاتبة',
      rsvp: 'كلمة بكلمة (RSVP)',
      highlight: 'التركيز',
      spotlight: 'تسليط الضوء',
      magnify: 'المكبر',
      scroller: 'الملقن',
      karaoke: 'كاريوكي',
      bounce: 'ارتداد',
      pulse: 'نبض',
      blur: 'تمويه (Blur)',
      wavy: 'موجة (Wave)',
      glitch: 'تشويش (Glitch)',
      gradient: 'تدرج (Gradient)',
      outline: 'مفرغ (Outline)',
      neon: 'نيون (Neon)',
      mirror: 'مرآة (Mirror)',
      spread: 'تمدد (Spread)',
      flash: 'وميض (Flash)',
      dim: 'تعتيم (Dim)',
      boxed: 'إطار (Boxed)',
      underline: 'تسطير (Underline)',
      marker: 'قلم تمييز (Marker)',
      thick: 'سميك (Thick)',
      shake: 'اهتزاز (Shake)',
      jelly: 'هلام (Jelly)',
      swing: 'تأرجح (Swing)',
      slideDown: 'انزلاق (Slide Down)',
    },
    shortcutsModal: {
      title: 'اختصارات لوحة المفاتيح',
      pressKey: 'اضغط مفتاحاً...',
      space: 'مسافة',
      done: 'تم',
      desc: 'اضغط على مربع المفتاح للتعديل.',
      keys: {
        togglePlay: 'تشغيل / إيقاف',
        prevWord: 'الكلمة السابقة',
        nextWord: 'الكلمة التالية',
        incFontSize: 'تكبير الخط',
        decFontSize: 'تصغير الخط',
        incSpeed: 'زيادة السرعة',
        decSpeed: 'إنقاص السرعة',
        toggleFullscreenApp: 'ملء الشاشة (تطبيق)',
        toggleFullscreenReader: 'ملء الشاشة (قراءة)',
        incBrightness: 'زيادة السطوع (الشاشة)',
        decBrightness: 'إنقاص السطوع (الشاشة)',
        reset: 'العودة للبداية',
        nextFont: 'تغيير الخط',
        nextColor: 'تغيير لون النص',
        nextHighlightColor: 'تغيير لون التمييز',
        incGlow: 'زيادة توهج النص',
        decGlow: 'إنقاص توهج النص',
        toggleBold: 'تغيير السماكة (غامق)',
        toggleLang: 'تغيير اللغة (عربي/إنجليزي)',
        nextMode: 'تغيير نمط القراءة',
        toggleEdit: 'فتح / إغلاق المحرر',
        clearText: 'مسح النص (في المحرر)',
        togglePomodoro: 'فتح / إغلاق مؤقت بومودورو',
        toggleLibrary: 'فتح / إغلاق قائمة المكتبة',
        toggleShortcuts: 'عرض قائمة الاختصارات',
        toggleStats: 'عرض الإحصائيات',
      }
    },
    readerBar: {
      progress: 'التقدم',
      timeRem: 'المتبقي',
      wpmShort: 'ك/د',
      wordsLeft: 'متبقية',
    },
    pomodoro: {
      title: 'مؤقت بومودورو',
      focus: 'تركيز',
      shortBreak: 'استراحة قصيرة',
      longBreak: 'استراحة طويلة',
      custom: 'تخصيص',
      enterTime: 'أدخل الدقائق:',
      start: 'ابدأ',
      pause: 'توقف',
      reset: 'إعادة ضبط',
      breakTime: 'وقت الاستراحة',
      relax: 'استرخِ قليلاً واستعد نشاطك',
      skipBreak: 'تخطي الاستراحة'
    },
    statistics: {
      title: 'إحصائيات القراءة',
      totalWords: 'مجموع الكلمات',
      totalTime: 'الوقت الكلي',
      avgSpeed: 'متوسط السرعة',
      sessions: 'الجلسات',
      encouragement: 'استمر في التقدم!',
      noData: 'لا توجد جلسات مسجلة بعد',
      words: 'كلمة',
      level1: 'مبتدئ',
      level2: 'قارئ مواظب',
      level3: 'قارئ نهم',
      level4: 'عالم',
      level5: 'حكيم',
    },
    sleepTimer: {
      title: 'مؤقت النوم',
      custom: 'تخصيص',
      set: 'تعيين',
      min15: '15 دقيقة',
      min30: '30 دقيقة',
      min60: '60 دقيقة',
      off: 'إيقاف',
    }
  },
  en: {
    appTitle: 'Visual Reading',
    library: 'Library',
    shortcuts: 'Shortcuts',
    mode: 'Mode',
    edit: 'Edit',
    close: 'Close',
    read: 'Read',
    pause: 'Pause',
    reset: 'Reset',
    fullscreen: 'Fullscreen',
    pasteText: 'Paste the text you want to read or enter the text.',
    enterHint: 'Press Enter to read. Shift+Enter for new line.',
    words: 'words',
    loading: 'Loading...',
    donate: 'Donate',
    menu: {
      turath: 'Turath',
      quran: 'The Quranic Researcher',
      dorar: 'Dorar Saniyyah',
    },
    auth: {
      login: 'Login',
      register: 'Register',
      username: 'Username',
      email: 'Email',
      password: 'Password',
      logout: 'Logout',
      submit: 'Submit',
      haveAccount: 'Already have an account? Login',
      noAccount: 'No account? Create one',
      welcome: 'Welcome',
      error: 'Invalid Data',
      successRegister: 'Account created successfully',
      successLogin: 'Logged in successfully'
    },
    donation: {
      title: 'Support Project (Donate Credit)',
      subtitle: 'Your support ensures the app remains free for everyone',
      selectNetwork: 'Select Network:',
      libyana: 'Libyana',
      almadar: 'Al-Madar',
      scratchCard: 'Enter recharge card number******',
      scratchPlaceholder: 'Enter recharge card number******',
      submitCode: 'Send',
      success: 'Thank you! Code submitted for review.',
      error: 'Please enter a valid card code.',
      hint: 'The code will be sent to developers for review and verification.',
    },
    settings: {
      speed: 'Speed',
      wpm: 'WPM',
      font: 'Font Family',
      brightness: 'Brightness',
      size: 'Size',
      bold: 'Bold',
      quranic: '(Quranic)',
      color: 'Color',
      highlightColor: 'Last Word Color',
      backgroundColor: 'Background Color',
      glow: 'Glow',
    },
    modes: {
      standard: 'Standard',
      creative: 'Creative',
      experimental: 'Experimental',
      typewriter: 'Typewriter',
      rsvp: 'Single Word (RSVP)',
      highlight: 'Highlight Focus',
      spotlight: 'Focus Spotlight',
      magnify: 'Inline Magnifier',
      scroller: 'Teleprompter',
      karaoke: 'Karaoke Flow',
      bounce: 'Bounce',
      pulse: 'Pulse',
      blur: 'Blur Reveal',
      wavy: 'Wavy Flow',
      glitch: 'Glitch Tech',
      gradient: 'Gradient Fill',
      outline: 'Outline View',
      neon: 'Neon Glow',
      mirror: 'Mirror Reflection',
      spread: 'Spread Expand',
      flash: 'Flash Focus',
      dim: 'Extreme Dim',
      boxed: 'Boxed',
      underline: 'Underline',
      marker: 'Marker Highlight',
      thick: 'Thick Weight',
      shake: 'Shake',
      jelly: 'Jelly',
      swing: 'Swing',
      slideDown: 'Slide Down',
    },
    shortcutsModal: {
      title: 'Keyboard Shortcuts',
      pressKey: 'Press Key...',
      space: 'Space',
      done: 'Done',
      desc: 'Click on a key box to edit. Press the new key on your keyboard.',
      keys: {
        togglePlay: 'Play / Pause',
        prevWord: 'Previous Word',
        nextWord: 'Next Word',
        incFontSize: 'Increase Font Size',
        decFontSize: 'Decrease Font Size',
        incSpeed: 'Increase Speed',
        decSpeed: 'Decrease Speed',
        toggleFullscreenApp: 'Fullscreen App',
        toggleFullscreenReader: 'Fullscreen Reader (Focus)',
        incBrightness: 'Increase Brightness (Screen)',
        decBrightness: 'Decrease Brightness (Screen)',
        reset: 'Reset to Start',
        nextFont: 'Next Font',
        nextColor: 'Next Text Color',
        nextHighlightColor: 'Next Highlight Color',
        incGlow: 'Increase Text Glow',
        decGlow: 'Decrease Text Glow',
        toggleBold: 'Toggle Bold',
        toggleLang: 'Toggle Language (Ar/En)',
        nextMode: 'Next Reading Mode',
        toggleEdit: 'Open/Close Text Editor',
        clearText: 'Clear Text (Editor)',
        togglePomodoro: 'Open/Close Pomodoro Timer',
        toggleLibrary: 'Open/Close Library Menu',
        toggleShortcuts: 'Open/Close Shortcuts Help',
        toggleStats: 'Open/Close Statistics',
      }
    },
    readerBar: {
      progress: 'Progress',
      timeRem: 'Time Left',
      wpmShort: 'WPM',
      wordsLeft: 'words left',
    },
    pomodoro: {
      title: 'Pomodoro Timer',
      focus: 'Focus',
      shortBreak: 'Short Break',
      longBreak: 'Long Break',
      custom: 'Custom',
      enterTime: 'Enter minutes:',
      start: 'Start',
      pause: 'Pause',
      reset: 'Reset',
      breakTime: 'Break Time',
      relax: 'Relax and recharge',
      skipBreak: 'Skip Break'
    },
    statistics: {
      title: 'Reading Stats',
      totalWords: 'Total Words',
      totalTime: 'Total Time',
      avgSpeed: 'Avg Speed',
      sessions: 'Sessions',
      encouragement: 'Keep going!',
      noData: 'No sessions recorded yet',
      words: 'words',
      level1: 'Beginner',
      level2: 'Regular Reader',
      level3: 'Avid Reader',
      level4: 'Scholar',
      level5: 'Sage',
    },
    sleepTimer: {
      title: 'Sleep Timer',
      custom: 'Custom',
      set: 'Set',
      min15: '15 Minutes',
      min30: '30 Minutes',
      min60: '60 Minutes',
      off: 'Off',
    }
  }
};
