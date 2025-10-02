export const translations = {
  ru: {
    // App
    appName: "Трекер инъекций",
    appDescription: "Приложение для отслеживания уколов GLP-1 (семаглутид) с отслеживанием веса, побочных эффектов, состояния. Возможность просмотра графиков, и дневника. Возможность выгрузки данных в файл. А также расчет BMI.",
    appVersion: "Версия",
    appAuthor: "Автор",
    
    // Navigation
    home: "Главная",
    charts: "Графики",
    history: "История",
    profile: "Профиль",
    
    // Home page
    welcome: "Добро пожаловать",
    quickActions: "Быстрые действия",
    logInjection: "Записать укол",
    logWeight: "Записать вес",
    logSideEffect: "Побочный эффект",
    logInjectionSite: "Место укола",
    stats: "Статистика",
    injections: "Уколов",
    averageWeight: "Средний вес",
    sideEffects: "Побочных эффектов",
    recentRecords: "Последние записи",
    
    // Profile
    profileSettings: "Настройки профиля",
    personalInfo: "Личная информация",
    notifications: "Уведомления",
    dataExport: "Экспорт данных",
    theme: "Тема",
    language: "Язык",
    dangerZone: "Опасная зона",
    deleteAllData: "Удалить все данные",
    name: "Имя",
    gender: "Пол",
    male: "Мужской",
    female: "Женский",
    age: "Возраст",
    height: "Рост (см)",
    currentWeight: "Текущий вес (кг)",
    targetWeight: "Целевой вес (кг)",
    medication: "Препарат",
    bmr: "Базальный метаболизм",
    customFields: "Дополнительные поля",
    addField: "Добавить поле",
    fieldName: "Название поля",
    fieldType: "Тип",
    text: "Текст",
    number: "Число",
    date: "Дата",
    save: "Сохранить",
    calculate: "Рассчитать",
    calculateBMR: "Рассчитать BMR",
    
    // Dialogs
    injectionDate: "Дата укола",
    dose: "Доза (мг)",
    notes: "Заметки",
    cancel: "Отмена",
    submit: "Отправить",
    weight: "Вес (кг)",
    sideEffect: "Побочный эффект",
    severity: "Серьёзность",
    mild: "Лёгкая",
    moderate: "Средняя",
    severe: "Тяжёлая",
    injectionSite: "Место укола",
    abdomen: "Живот",
    thigh: "Бедро",
    arm: "Рука",
    condition: "Состояние",
    
    // Charts
    weightProgress: "Прогресс веса",
    injectionHistory: "История уколов",
    sideEffectsOverTime: "Побочные эффекты",
    injectionSites: "Места уколов",
    weightTrend: "Динамика веса",
    
    // Theme
    light: "Светлая",
    dark: "Тёмная",
    system: "Системная",
    
    // Notifications
    enableNotifications: "Включить уведомления",
    notificationTime: "Время напоминания",
    notificationDays: "Дни напоминания",
    
    // Export
    exportData: "Экспортировать данные",
    exportJSON: "Экспорт в JSON",
    exportCSV: "Экспорт в CSV",
    
    // Messages
    saved: "Сохранено",
    deleted: "Удалено",
    error: "Ошибка",
  },
  en: {
    // App
    appName: "Injection Tracker",
    appDescription: "An application for tracking GLP-1 (semaglutide) injections with weight tracking, side effects, and condition. The ability to view charts and a diary. The ability to upload data to a file. As well as the BMI calculation.",
    appVersion: "Version",
    appAuthor: "Author",
    
    // Navigation
    home: "Home",
    charts: "Charts",
    history: "History",
    profile: "Profile",
    
    // Home page
    welcome: "Welcome",
    quickActions: "Quick Actions",
    logInjection: "Log Injection",
    logWeight: "Log Weight",
    logSideEffect: "Side Effect",
    logInjectionSite: "Injection Site",
    stats: "Statistics",
    injections: "Injections",
    averageWeight: "Average Weight",
    sideEffects: "Side Effects",
    recentRecords: "Recent Records",
    
    // Profile
    profileSettings: "Profile Settings",
    personalInfo: "Personal Information",
    notifications: "Notifications",
    dataExport: "Data Export",
    theme: "Theme",
    language: "Language",
    dangerZone: "Danger Zone",
    deleteAllData: "Delete All Data",
    name: "Name",
    gender: "Gender",
    male: "Male",
    female: "Female",
    age: "Age",
    height: "Height (cm)",
    currentWeight: "Current Weight (kg)",
    targetWeight: "Target Weight (kg)",
    medication: "Medication",
    bmr: "Basal Metabolic Rate",
    customFields: "Custom Fields",
    addField: "Add Field",
    fieldName: "Field Name",
    fieldType: "Type",
    text: "Text",
    number: "Number",
    date: "Date",
    save: "Save",
    calculate: "Calculate",
    calculateBMR: "Calculate BMR",
    
    // Dialogs
    injectionDate: "Injection Date",
    dose: "Dose (mg)",
    notes: "Notes",
    cancel: "Cancel",
    submit: "Submit",
    weight: "Weight (kg)",
    sideEffect: "Side Effect",
    severity: "Severity",
    mild: "Mild",
    moderate: "Moderate",
    severe: "Severe",
    injectionSite: "Injection Site",
    abdomen: "Abdomen",
    thigh: "Thigh",
    arm: "Arm",
    condition: "Condition",
    
    // Charts
    weightProgress: "Weight Progress",
    injectionHistory: "Injection History",
    sideEffectsOverTime: "Side Effects Over Time",
    injectionSites: "Injection Sites",
    weightTrend: "Weight Trend",
    
    // Theme
    light: "Light",
    dark: "Dark",
    system: "System",
    
    // Notifications
    enableNotifications: "Enable Notifications",
    notificationTime: "Notification Time",
    notificationDays: "Notification Days",
    
    // Export
    exportData: "Export Data",
    exportJSON: "Export as JSON",
    exportCSV: "Export as CSV",
    
    // Messages
    saved: "Saved",
    deleted: "Deleted",
    error: "Error",
  },
};

export type TranslationKey = keyof typeof translations.ru;
