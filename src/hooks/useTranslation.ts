'use client'

import { useState, useEffect, useCallback } from 'react'

export type Language = 'ka' | 'en' | 'de' | 'ru' | 'fr'

export interface Translation {
  [key: string]: string | Translation
}

const translations: Record<Language, Translation> = {
  ka: {
    header: {
      logo: 'BranchFeed',
      feed: 'Feed',
      create: 'Create',
      profile: 'Profile',
      signIn: 'Sign In',
      signUp: 'Sign Up',
      signOut: 'Sign Out',
      settings: 'Settings',
    },
    landing: {
      hero: {
        title: 'შექმენით განშტოებული ისტორიები',
        subtitle: 'თხრობეთ ინტერაქტიული ისტორიები A/B არჩევანებით. მიეცით თქვენს აუდიტორიას ნარატივის ფორმირების საშუალება.',
        signUp: 'დაწყება',
        signIn: 'შესვლა',
      },
      features: {
        title: 'რატომ BranchFeed?',
        branching: {
          title: 'განშტოებული ისტორიები',
          description: 'შექმენით ინტერაქტიული ნარატივები მრავალი გზით და არჩევანებით.',
        },
        choices: {
          title: 'A/B არჩევანები',
          description: 'მიეცით თქვენს აუდიტორიას ისტორიის მიმართულების არჩევის საშუალება.',
        },
        paths: {
          title: 'გზის თვალყურდევნება',
          description: 'თვალყურდევნეთ თქვენი აუდიტორიის მოგზაურობას სხვადასხვა ისტორიის გზებზე.',
        },
      },
    },
    auth: {
      signUp: {
        title: 'რეგისტრაცია',
        email: 'ელფოსტა',
        password: 'პაროლი',
        confirmPassword: 'დაადასტურეთ პაროლი',
        submit: 'ანგარიშის შექმნა',
        alreadyHaveAccount: 'უკვე გაქვთ ანგარიში?',
        signInLink: 'შესვლა',
      },
      signIn: {
        title: 'შესვლა',
        email: 'ელფოსტა',
        password: 'პაროლი',
        submit: 'შესვლა',
        noAccount: 'არ გაქვთ ანგარიში?',
        signUpLink: 'რეგისტრაცია',
      },
      errors: {
        emailRequired: 'ელფოსტა აუცილებელია',
        passwordRequired: 'პაროლი აუცილებელია',
        invalidEmail: 'არასწორი ელფოსტის მისამართი',
        weakPassword: 'პაროლი ძალიან სუსტია',
        passwordMismatch: 'პაროლები არ ემთხვევა',
        emailExists: 'ეს ელფოსტა უკვე გამოყენებულია',
        invalidCredentials: 'ელფოსტა ან პაროლი არასწორია',
        networkError: 'რაღაც შეცდომა მოხდა, სცადეთ თავიდან',
        emailNotConfirmed: 'გთხოვთ, დაადასტუროთ ელფოსტა',
      },
    },
    feed: {
      title: 'Feed',
      sortBy: 'Sort by',
      sort: {
        recent: 'Recent',
        popular: 'Popular',
        trending: 'Trending',
      },
      loadMore: 'Load More',
      empty: {
        title: 'No stories yet',
        description: 'Be the first to create a branching story!',
        action: 'Create Story',
      },
      errors: {
        loadFailed: 'Failed to load feed',
        tryAgain: 'Please try again',
      },
      stats: {
        likes: 'likes',
        views: 'views',
        paths: 'paths',
      },
      storyType: {
        branching: 'Branching Story',
      },
    },
    createStory: {
      title: 'Create Branching Story',
      next: 'Next',
      back: 'Back',
      publish: 'Publish Story',
      steps: {
        root: 'Root Story',
        branches: 'Branches',
        preview: 'Preview',
      },
      root: {
        title: 'Story Title',
        description: 'Description (Optional)',
        media: 'Upload Media (9:16 aspect ratio)',
      },
      branches: {
        title: 'Add Branch Nodes',
        addNode: 'Add Branch Node',
        empty: 'Add at least one branch node with A/B choices',
        choiceA: 'Choice A',
        choiceB: 'Choice B',
        nodeContent: 'Node Content',
        depth: 'Depth: {current} / {max}',
      },
      preview: {
        title: 'Story Preview',
        publish: 'Publish Story',
        publishing: 'Publishing...',
      },
      errors: {
        titleRequired: 'Title is required',
        mediaRequired: 'Media is required',
        nodesRequired: 'At least one branch node is required',
        maxDepthReached: 'Maximum depth reached',
        uploadFailed: 'Media upload failed',
        publishFailed: 'Failed to publish story',
      },
      success: {
        published: 'Story published successfully!',
      },
    },
    story: {
      errors: {
        notFound: 'Story not found',
        loadFailed: 'Failed to load story',
      },
      progress: {
        step: 'Step {current} of {max}',
        path: 'Path',
      },
      endOfPath: {
        title: 'End of Story',
        description: 'You have reached the end of this path!',
      },
      interactions: {
        comment: 'Comment',
        share: 'Share',
      },
      tree: {
        title: 'Story Tree',
      },
      paths: {
        title: 'All Paths',
        empty: 'No paths found in this story.',
        users: 'users',
        unexplored: 'Unexplored',
        noUsers: 'No users have explored this story yet.',
      },
    },
    settings: {
      title: 'Settings',
      tabs: {
        profile: 'Profile',
        language: 'Language',
      },
      profile: {
        title: 'Profile Settings',
        avatar: 'Avatar',
        username: 'Username',
        bio: 'Bio',
        uploadAvatar: 'Upload Avatar',
        changeAvatar: 'Change Avatar',
        save: 'Save Changes',
        saving: 'Saving...',
      },
      language: {
        title: 'Language Preference',
        saving: 'Saving...',
      },
      errors: {
        loadFailed: 'Failed to load settings',
        profileNotFound: 'Profile not found',
        usernameRequired: 'Username is required',
        avatarTooLarge: 'Avatar file is too large (max 5MB)',
        avatarUploadFailed: 'Failed to upload avatar. Please try again.',
        updateFailed: 'Failed to update settings',
      },
    },
  },
  en: {
    header: {
      logo: 'BranchFeed',
      feed: 'Feed',
      create: 'Create',
      profile: 'Profile',
      signIn: 'Sign In',
      signUp: 'Sign Up',
      signOut: 'Sign Out',
      settings: 'Settings',
    },
    landing: {
      hero: {
        title: 'Create Branching Stories',
        subtitle: 'Tell interactive stories with A/B choices. Let your audience shape the narrative.',
        signUp: 'Get Started',
        signIn: 'Sign In',
      },
      features: {
        title: 'Why BranchFeed?',
        branching: {
          title: 'Branching Stories',
          description: 'Create interactive narratives with multiple paths and choices.',
        },
        choices: {
          title: 'A/B Choices',
          description: 'Let your audience choose the direction of the story.',
        },
        paths: {
          title: 'Path Tracking',
          description: "Track your audience's journey through different story paths.",
        },
      },
    },
    auth: {
      signUp: {
        title: 'რეგისტრაცია',
        email: 'ელფოსტა',
        password: 'პაროლი',
        confirmPassword: 'დაადასტურეთ პაროლი',
        submit: 'ანგარიშის შექმნა',
        alreadyHaveAccount: 'უკვე გაქვთ ანგარიში?',
        signInLink: 'შესვლა',
      },
      signIn: {
        title: 'შესვლა',
        email: 'ელფოსტა',
        password: 'პაროლი',
        submit: 'შესვლა',
        noAccount: 'არ გაქვთ ანგარიში?',
        signUpLink: 'რეგისტრაცია',
      },
      errors: {
        emailRequired: 'ელფოსტა აუცილებელია',
        passwordRequired: 'პაროლი აუცილებელია',
        invalidEmail: 'არასწორი ელფოსტის მისამართი',
        weakPassword: 'პაროლი ძალიან სუსტია',
        passwordMismatch: 'პაროლები არ ემთხვევა',
        emailExists: 'ეს ელფოსტა უკვე გამოყენებულია',
        invalidCredentials: 'ელფოსტა ან პაროლი არასწორია',
        networkError: 'რაღაც შეცდომა მოხდა, სცადეთ თავიდან',
      },
    },
    feed: {
      title: 'Feed',
      sortBy: 'Sort by',
      sort: {
        recent: 'Recent',
        popular: 'Popular',
        trending: 'Trending',
      },
      loadMore: 'Load More',
      empty: {
        title: 'No stories yet',
        description: 'Be the first to create a branching story!',
        action: 'Create Story',
      },
      errors: {
        loadFailed: 'Failed to load feed',
        tryAgain: 'Please try again',
      },
      stats: {
        likes: 'likes',
        views: 'views',
        paths: 'paths',
      },
      storyType: {
        branching: 'Branching Story',
      },
    },
    story: {
      errors: {
        notFound: 'Story not found',
        loadFailed: 'Failed to load story',
      },
      progress: {
        step: 'Step {current} of {max}',
        path: 'Path',
      },
      endOfPath: {
        title: 'End of Story',
        description: 'You have reached the end of this path!',
      },
      interactions: {
        comment: 'Comment',
        share: 'Share',
      },
      tree: {
        title: 'Story Tree',
      },
      paths: {
        title: 'All Paths',
        empty: 'No paths found in this story.',
        users: 'users',
        unexplored: 'Unexplored',
        noUsers: 'No users have explored this story yet.',
      },
    },
    settings: {
      title: 'Settings',
      tabs: {
        profile: 'Profile',
        language: 'Language',
      },
      profile: {
        title: 'Profile Settings',
        avatar: 'Avatar',
        username: 'Username',
        bio: 'Bio',
        uploadAvatar: 'Upload Avatar',
        changeAvatar: 'Change Avatar',
        save: 'Save Changes',
        saving: 'Saving...',
      },
      language: {
        title: 'Language Preference',
        saving: 'Saving...',
      },
      errors: {
        loadFailed: 'Failed to load settings',
        profileNotFound: 'Profile not found',
        usernameRequired: 'Username is required',
        avatarTooLarge: 'Avatar file is too large (max 5MB)',
        avatarUploadFailed: 'Failed to upload avatar. Please try again.',
        updateFailed: 'Failed to update settings',
      },
    },
  },
  de: {
    header: {
      logo: 'BranchFeed',
      feed: 'Feed',
      create: 'Erstellen',
      profile: 'Profil',
      signIn: 'Anmelden',
      signUp: 'Registrieren',
      signOut: 'Abmelden',
      settings: 'Einstellungen',
    },
    landing: {
      hero: {
        title: 'Verzweigte Geschichten erstellen',
        subtitle: 'Erzähle interaktive Geschichten mit A/B-Optionen. Lass dein Publikum die Handlung gestalten.',
        signUp: 'Loslegen',
        signIn: 'Anmelden',
      },
      features: {
        title: 'Warum BranchFeed?',
        branching: {
          title: 'Verzweigte Geschichten',
          description: 'Erstelle interaktive Erzählungen mit mehreren Pfaden und Optionen.',
        },
        choices: {
          title: 'A/B-Optionen',
          description: 'Lass dein Publikum die Richtung der Geschichte wählen.',
        },
        paths: {
          title: 'Pfadverfolgung',
          description: 'Verfolge die Reise deines Publikums durch verschiedene Geschichtspfade.',
        },
      },
    },
    auth: {
      signUp: {
        title: 'Registrieren',
        email: 'E-Mail',
        password: 'Passwort',
        confirmPassword: 'Passwort bestätigen',
        submit: 'Konto erstellen',
        alreadyHaveAccount: 'Bereits ein Konto?',
        signInLink: 'Anmelden',
      },
      signIn: {
        title: 'Anmelden',
        email: 'E-Mail',
        password: 'Passwort',
        submit: 'Anmelden',
        noAccount: 'Kein Konto?',
        signUpLink: 'Registrieren',
      },
      errors: {
        emailRequired: 'E-Mail ist erforderlich',
        passwordRequired: 'Passwort ist erforderlich',
        invalidEmail: 'Ungültige E-Mail-Adresse',
        weakPassword: 'Passwort ist zu schwach',
        passwordMismatch: 'Passwörter stimmen nicht überein',
        emailExists: 'Diese E-Mail wird bereits verwendet',
        invalidCredentials: 'Ungültige E-Mail oder Passwort',
        networkError: 'Netzwerkfehler. Bitte versuchen Sie es erneut.',
        emailNotConfirmed: 'Bitte bestätigen Sie Ihre E-Mail',
      },
    },
    feed: {
      title: 'Feed',
      sortBy: 'Sortieren nach',
      sort: {
        recent: 'Neueste',
        popular: 'Beliebt',
        trending: 'Trending',
      },
      loadMore: 'Mehr laden',
      empty: {
        title: 'Noch keine Geschichten',
        description: 'Erstelle die erste verzweigte Geschichte!',
        action: 'Geschichte erstellen',
      },
      errors: {
        loadFailed: 'Feed konnte nicht geladen werden',
        tryAgain: 'Bitte versuchen Sie es erneut',
      },
      stats: {
        likes: 'Likes',
        views: 'Aufrufe',
        paths: 'Pfade',
      },
      storyType: {
        branching: 'Verzweigte Geschichte',
      },
    },
    settings: {
      title: 'Einstellungen',
      tabs: {
        profile: 'Profil',
        language: 'Sprache',
      },
      profile: {
        title: 'Profileinstellungen',
        avatar: 'Avatar',
        username: 'Benutzername',
        bio: 'Biografie',
        uploadAvatar: 'Avatar hochladen',
        changeAvatar: 'Avatar ändern',
        save: 'Änderungen speichern',
        saving: 'Speichern...',
      },
      language: {
        title: 'Spracheinstellung',
        saving: 'Speichern...',
      },
      errors: {
        loadFailed: 'Einstellungen konnten nicht geladen werden',
        profileNotFound: 'Profil nicht gefunden',
        usernameRequired: 'Benutzername ist erforderlich',
        avatarTooLarge: 'Avatar-Datei ist zu groß (max. 5 MB)',
        avatarUploadFailed: 'Avatar-Upload fehlgeschlagen. Bitte versuchen Sie es erneut.',
        updateFailed: 'Einstellungen konnten nicht aktualisiert werden',
      },
    },
  },
  ru: {
    header: {
      logo: 'BranchFeed',
      feed: 'Лента',
      create: 'Создать',
      profile: 'Профиль',
      signIn: 'Войти',
      signUp: 'Регистрация',
      signOut: 'Выйти',
      settings: 'Настройки',
    },
    landing: {
      hero: {
        title: 'Создавайте ветвящиеся истории',
        subtitle: 'Рассказывайте интерактивные истории с вариантами A/B. Позвольте вашей аудитории формировать повествование.',
        signUp: 'Начать',
        signIn: 'Войти',
      },
      features: {
        title: 'Почему BranchFeed?',
        branching: {
          title: 'Ветвящиеся истории',
          description: 'Создавайте интерактивные повествования с множеством путей и выборов.',
        },
        choices: {
          title: 'Варианты A/B',
          description: 'Позвольте вашей аудитории выбирать направление истории.',
        },
        paths: {
          title: 'Отслеживание путей',
          description: 'Отслеживайте путешествие вашей аудитории по различным путям истории.',
        },
      },
    },
    auth: {
      signUp: {
        title: 'Регистрация',
        email: 'Электронная почта',
        password: 'Пароль',
        confirmPassword: 'Подтвердите пароль',
        submit: 'Создать аккаунт',
        alreadyHaveAccount: 'Уже есть аккаунт?',
        signInLink: 'Войти',
      },
      signIn: {
        title: 'Войти',
        email: 'Электронная почта',
        password: 'Пароль',
        submit: 'Войти',
        noAccount: 'Нет аккаунта?',
        signUpLink: 'Регистрация',
      },
      errors: {
        emailRequired: 'Электронная почта обязательна',
        passwordRequired: 'Пароль обязателен',
        invalidEmail: 'Неверный адрес электронной почты',
        weakPassword: 'Пароль слишком слабый',
        passwordMismatch: 'Пароли не совпадают',
        emailExists: 'Этот адрес электронной почты уже используется',
        invalidCredentials: 'Неверный адрес электронной почты или пароль',
        networkError: 'Ошибка сети. Пожалуйста, попробуйте снова.',
        emailNotConfirmed: 'Пожалуйста, подтвердите вашу электронную почту',
      },
    },
    feed: {
      title: 'Лента',
      sortBy: 'Сортировать по',
      sort: {
        recent: 'Недавние',
        popular: 'Популярные',
        trending: 'В тренде',
      },
      loadMore: 'Загрузить еще',
      empty: {
        title: 'Пока нет историй',
        description: 'Создайте первую ветвящуюся историю!',
        action: 'Создать историю',
      },
      errors: {
        loadFailed: 'Не удалось загрузить ленту',
        tryAgain: 'Пожалуйста, попробуйте снова',
      },
      stats: {
        likes: 'лайков',
        views: 'просмотров',
        paths: 'путей',
      },
      storyType: {
        branching: 'Ветвящаяся история',
      },
    },
    settings: {
      title: 'Настройки',
      tabs: {
        profile: 'Профиль',
        language: 'Язык',
      },
      profile: {
        title: 'Настройки профиля',
        avatar: 'Аватар',
        username: 'Имя пользователя',
        bio: 'Биография',
        uploadAvatar: 'Загрузить аватар',
        changeAvatar: 'Изменить аватар',
        save: 'Сохранить изменения',
        saving: 'Сохранение...',
      },
      language: {
        title: 'Языковые настройки',
        saving: 'Сохранение...',
      },
      errors: {
        loadFailed: 'Не удалось загрузить настройки',
        profileNotFound: 'Профиль не найден',
        usernameRequired: 'Имя пользователя обязательно',
        avatarTooLarge: 'Файл аватара слишком большой (макс. 5 МБ)',
        avatarUploadFailed: 'Не удалось загрузить аватар. Пожалуйста, попробуйте снова.',
        updateFailed: 'Не удалось обновить настройки',
      },
    },
  },
  fr: {
    header: {
      logo: 'BranchFeed',
      feed: 'Flux',
      create: 'Créer',
      profile: 'Profil',
      signIn: 'Se connecter',
      signUp: 'S\'inscrire',
      signOut: 'Se déconnecter',
      settings: 'Paramètres',
    },
    landing: {
      hero: {
        title: 'Créez des histoires ramifiées',
        subtitle: 'Racontez des histoires interactives avec des choix A/B. Laissez votre public façonner le récit.',
        signUp: 'Commencer',
        signIn: 'Se connecter',
      },
      features: {
        title: 'Pourquoi BranchFeed?',
        branching: {
          title: 'Histoires ramifiées',
          description: 'Créez des récits interactifs avec plusieurs chemins et choix.',
        },
        choices: {
          title: 'Choix A/B',
          description: "Laissez votre public choisir la direction de l'histoire.",
        },
        paths: {
          title: 'Suivi des chemins',
          description: "Suivez le parcours de votre public à travers différents chemins d'histoire.",
        },
      },
    },
    feed: {
      title: 'Flux',
      sortBy: 'Trier par',
      sort: {
        recent: 'Récent',
        popular: 'Populaire',
        trending: 'Tendance',
      },
      loadMore: 'Charger plus',
      empty: {
        title: "Pas encore d'histoires",
        description: 'Soyez le premier à créer une histoire ramifiée!',
        action: 'Créer une histoire',
      },
      errors: {
        loadFailed: 'Échec du chargement du flux',
        tryAgain: 'Veuillez réessayer',
      },
      stats: {
        likes: "j'aime",
        views: 'vues',
        paths: 'chemins',
      },
      storyType: {
        branching: 'Histoire ramifiée',
      },
    },
    settings: {
      title: 'Paramètres',
      tabs: {
        profile: 'Profil',
        language: 'Langue',
      },
      profile: {
        title: 'Paramètres du profil',
        avatar: 'Avatar',
        username: "Nom d'utilisateur",
        bio: 'Biographie',
        uploadAvatar: "Télécharger l'avatar",
        changeAvatar: "Changer l'avatar",
        save: 'Enregistrer les modifications',
        saving: 'Enregistrement...',
      },
      language: {
        title: 'Préférence de langue',
        saving: 'Enregistrement...',
      },
      errors: {
        loadFailed: 'Échec du chargement des paramètres',
        profileNotFound: 'Profil non trouvé',
        usernameRequired: "Le nom d'utilisateur est requis",
        avatarTooLarge: "Le fichier d'avatar est trop volumineux (max 5 Mo)",
        avatarUploadFailed: "Échec du téléchargement de l'avatar. Veuillez réessayer.",
        updateFailed: 'Échec de la mise à jour des paramètres',
      },
    },
  },
}

export function useTranslation(language: Language = 'en') {
  const [currentLanguage, setCurrentLanguage] = useState<Language>(language)

  useEffect(() => {
    // Get language from localStorage or default to 'en'
    // Only access localStorage on client side
    if (typeof window !== 'undefined') {
      const savedLanguage = localStorage.getItem('language') as Language | null
      if (savedLanguage && translations[savedLanguage]) {
        setCurrentLanguage(savedLanguage)
      }
    }
  }, [])

  const t = useCallback(
    (key: string): string => {
      const keys = key.split('.')
      let value: any = translations[currentLanguage]

      for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
          value = value[k]
        } else {
          return key // Return key if translation not found
        }
      }

      return typeof value === 'string' ? value : key
    },
    [currentLanguage]
  )

  const setLanguage = useCallback((lang: Language) => {
    setCurrentLanguage(lang)
    if (typeof window !== 'undefined') {
      localStorage.setItem('language', lang)
    }
  }, [])

  return {
    t,
    language: currentLanguage,
    setLanguage,
  }
}

