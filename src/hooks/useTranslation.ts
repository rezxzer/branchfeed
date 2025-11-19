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
      feedback: 'Feedback',
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
        endings: 'endings',
      },
      storyType: {
        branching: 'განშტოებული ისტორია',
      },
      continue: {
        label: 'გაგრძელება',
      },
      filters: {
        advanced: 'დამატებითი ფილტრები',
        clearAll: 'ყველას წაშლა',
        dateRange: 'თარიღის დიაპაზონი',
        'dateRange.all': 'ყველა დრო',
        'dateRange.last24h': 'ბოლო 24 საათი',
        'dateRange.last7d': 'ბოლო 7 დღე',
        'dateRange.last30d': 'ბოლო 30 დღე',
        'dateRange.custom': 'მორგებული',
        'dateRange.startDate': 'დაწყების თარიღი',
        'dateRange.endDate': 'დასრულების თარიღი',
        author: 'ავტორი',
        authorPlaceholder: 'ძიება ავტორის სახელით...',
        searching: 'ძიება...',
        tags: 'ტეგები',
      },
      following: {
        empty: {
          title: 'მიმდევარი მომხმარებლების ისტორიები არ არის',
          description: 'დაიწყე მომხმარებლების მიყოლა, რომ ნახო მათი ისტორიები აქ!',
          action: 'მომხმარებლების აღმოჩენა',
        },
        suggestions: {
          title: 'მიყოლე მეტი მომხმარებელი',
          description: 'მიყოლე ეს მომხმარებლები, რომ ნახო მათი ისტორიები feed-ში',
          follow: 'მიყოლა',
          following: 'მიყოლილი',
        },
      },
    },
    search: {
      endOfResults: 'შედეგების დასასრული',
      noResults: {
        title: 'შედეგები არ მოიძებნა',
        description: 'სცადეთ სხვა საკვანძო სიტყვები ან შეამოწმეთ მართლწერა',
      },
    },
    feedback: {
      title: 'გამოხმაურების გაგზავნა',
      description: 'დაგვეხმარეთ BranchFeed-ის გაუმჯობესებაში თქვენი აზრების, bug-ების ან ახალი feature-ების შეთავაზებით.',
      anonymous: 'შეგიძლიათ გამოხმაურების გაგზავნა ანონიმურად. შეხვიდეთ სისტემაში თქვენი submissions-ის თვალყურდევნებისთვის.',
      submitAnother: 'კიდევ ერთი გამოხმაურება',
      viewSubmissions: 'თქვენი გამოხმაურებები',
      viewSubmissionsDesc: 'თვალყურდევნეთ თქვენი გამოხმაურებების სტატუსს.',
      myFeedback: 'ჩემი გამოხმაურებები',
      info: {
        title: 'რა სახის გამოხმაურება შემიძლია გავაგზავნო?',
        bug: 'მოხსენება პრობლემების, შეცდომების ან მოულოდნელი ქცევის შესახებ.',
        feature: 'ახალი feature-ების ან ფუნქციონალის შეთავაზება.',
        improvement: 'არსებული feature-ების გაუმჯობესების იდეების გაზიარება.',
        general: 'თქვენი საერთო გამოცდილებისა და აზრების გაზიარება.',
      },
      types: {
        bug: 'Bug Report',
        feature: 'Feature Request',
        improvement: 'გაუმჯობესება',
        general: 'ზოგადი გამოხმაურება',
        other: 'სხვა',
      },
      form: {
        type: 'ტიპი',
        category: 'კატეგორია',
        categoryPlaceholder: 'მაგ., Feed, Story, Profile, Search',
        title: 'სათაური',
        titlePlaceholder: 'თქვენი გამოხმაურების მოკლე შინაარსი',
        description: 'აღწერა',
        descriptionPlaceholder: 'გთხოვთ, მოგვაწოდოთ დეტალური ინფორმაცია...',
        rating: 'რეიტინგი',
        noRating: 'რეიტინგის გარეშე',
        submit: 'გამოხმაურების გაგზავნა',
        submitting: 'იგზავნება...',
      },
      ratings: {
        excellent: 'შესანიშნავი',
        good: 'კარგი',
        average: 'საშუალო',
        poor: 'ცუდი',
        veryPoor: 'ძალიან ცუდი',
      },
      success: {
        title: 'გმადლობთ!',
        message: 'თქვენი გამოხმაურება წარმატებით გაიგზავნა.',
      },
    },
    common: {
      optional: 'არასავალდებულო',
      cancel: 'გაუქმება',
      characters: 'სიმბოლო',
      backToFeed: 'Feed-ში დაბრუნება',
      all: 'ყველა',
      save: 'შენახვა',
      saving: 'იგზავნება...',
      edit: 'რედაქტირება',
      anonymous: 'ანონიმური',
      created: 'შექმნილია',
      resolved: 'გადაწყვეტილია',
      page: 'გვერდი',
      of: 'დან',
      previous: 'წინა',
      next: 'შემდეგი',
      clearFilters: 'ფილტრების გასუფთავება',
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
    media: {
      error: {
        title: 'მედია ვერ ჩაიტვირთა',
        message: 'მედია ვერ ჩაიტვირთა. გთხოვთ, სცადეთ თავიდან.',
        retry: 'თავიდან',
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
      video: {
        title: 'ვიდეოს პარამეტრები',
        description: 'გააკონტროლეთ ვიდეოს ავტომატური გაშვება თქვენს ფიდში.',
        autoplay: {
          label: 'ვიდეოს ავტომატური გაშვების ჩართვა',
          description: 'ვიდეოები თქვენს ფიდში ავტომატურად დაიწყება, როცა ისინი ხილულ ზონაში მოხვდებიან. თქვენ მაინც შეგიძლიათ მათი ხელით შეჩერება.',
        },
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
    admin: {
      dashboard: {
        title: 'ადმინისტრატორის პანელი',
      },
      sidebar: {
        overview: 'მიმოხილვა',
        users: 'მომხმარებლები',
        moderation: 'მოდერაცია',
        feedback: 'Feedback',
        analytics: 'ანალიტიკა',
        monitoring: 'მონიტორინგი',
        settings: 'პარამეტრები',
      },
      stats: {
        totalUsers: 'მომხმარებლები',
        activeUsers: 'აქტიური მომხმარებლები (24სთ)',
        totalStories: 'სტორიები',
        totalPosts: 'პოსტები',
        totalLikes: 'ლაიკები',
        totalViews: 'ნახვები',
      },
      monitoring: {
        title: 'რეალურ დროში მონიტორინგი',
        description: 'თვალყურდევნეთ პლატფორმის მოვლენებს, შეცდომებს და შესრულების მეტრიკებს რეალურ დროში.',
        period: {
          '1h': 'ბოლო საათი',
          '24h': 'ბოლო 24 საათი',
          '7d': 'ბოლო 7 დღე',
          '30d': 'ბოლო 30 დღე',
        },
        autoRefresh: 'ავტომატური განახლება',
        totalEvents: 'სულ მოვლენები',
        errors: 'შეცდომები',
        errorRate: 'შეცდომის მაჩვენებელი',
        eventTypes: 'მოვლენის ტიპები',
        eventCountsByType: 'მოვლენების რაოდენობა ტიპის მიხედვით',
        recentErrors: 'ბოლო შეცდომები',
        performanceMetrics: 'შესრულების მეტრიკები',
        recentEvents: 'ბოლო მოვლენები',
        samples: 'ნიმუშები',
        noEvents: 'ჯერ არ არის ჩაწერილი მოვლენები',
        noEventsHint: 'მოვლენები აქ გამოჩნდება როცა ისინი ჩაიწერება. დარწმუნდით რომ event tracking ჩართულია.',
        migrationHint: 'შენიშვნა: დარწმუნდით რომ database migration გაშვებულია. გაუშვით migration file: supabase/migrations/20250115_34_add_event_tracking.sql',
      },
      logout: 'გასვლა',
    },
    watchLater: {
      add: 'დაამატე მოგვიანებით ყურებისთვის',
      remove: 'ამოიღე მოგვიანებით ყურების სიიდან',
      title: 'მოგვიანებით ყურება',
      empty: {
        title: 'ჯერ არ გაქვთ შენახული ვიდეოები',
        description: 'დაამატეთ ვიდეოები მოგვიანებით ყურებისთვის feed-ში.',
      },
      count: '0',
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
      feedback: 'Feedback',
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
        endings: 'endings',
      },
      storyType: {
        branching: 'Branching Story',
      },
      continue: {
        label: 'Continue',
      },
      filters: {
        advanced: 'Advanced Filters',
        clearAll: 'Clear All',
        dateRange: 'Date Range',
        'dateRange.all': 'All Time',
        'dateRange.last24h': 'Last 24 Hours',
        'dateRange.last7d': 'Last 7 Days',
        'dateRange.last30d': 'Last 30 Days',
        'dateRange.custom': 'Custom Range',
        'dateRange.startDate': 'Start Date',
        'dateRange.endDate': 'End Date',
        author: 'Author',
        authorPlaceholder: 'Search by author name...',
        searching: 'Searching...',
        tags: 'Tags',
      },
      following: {
        empty: {
          title: 'No stories from followed users',
          description: 'Start following users to see their stories here!',
          action: 'Discover Users',
        },
        suggestions: {
          title: 'Follow More Users',
          description: 'Follow these users to see their stories in your feed',
          follow: 'Follow',
          following: 'Following',
        },
      },
    },
    search: {
      endOfResults: 'End of results',
      noResults: {
        title: 'No results found',
        description: 'Try different keywords or check your spelling',
      },
    },
    media: {
      error: {
        title: 'Failed to load media',
        message: 'The media could not be loaded. Please try again.',
        retry: 'Retry',
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
      video: {
        title: 'Video Preferences',
        description: 'Control video autoplay behavior in your feed.',
        autoplay: {
          label: 'Enable video autoplay',
          description: 'Videos in your feed will automatically play when they come into view. You can still pause them manually.',
        },
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
    admin: {
      dashboard: {
        title: 'Admin Dashboard',
      },
      sidebar: {
        overview: 'Overview',
        users: 'Users',
        moderation: 'Moderation',
        feedback: 'Feedback',
        analytics: 'Analytics',
        monitoring: 'Monitoring',
        settings: 'Settings',
      },
      stats: {
        totalUsers: 'Total Users',
        activeUsers: 'Active Users (24h)',
        totalStories: 'Total Stories',
        totalPosts: 'Total Posts',
        totalLikes: 'Total Likes',
        totalViews: 'Total Views',
      },
      feedback: {
        title: 'User Feedback Management',
        description: 'Manage and analyze user feedback submissions.',
        empty: 'No feedback found',
        filters: {
          status: 'Status',
          type: 'Type',
          priority: 'Priority',
          category: 'Category',
          categoryPlaceholder: 'Filter by category...',
        },
        status: {
          label: 'Status',
          pending: 'Pending',
          reviewed: 'Reviewed',
          in_progress: 'In Progress',
          resolved: 'Resolved',
          dismissed: 'Dismissed',
        },
        priority: {
          label: 'Priority',
          low: 'Low',
          medium: 'Medium',
          high: 'High',
          critical: 'Critical',
        },
        adminNotes: 'Admin Notes',
        adminNotesPlaceholder: 'Add internal notes...',
        stats: {
          total: 'Total Feedback',
          pending: 'Pending',
          resolved: 'Resolved',
          averageRating: 'Avg Rating',
        },
      },
      monitoring: {
        title: 'Real-time Monitoring',
        description: 'Monitor platform events, errors, and performance metrics in real-time.',
        period: {
          '1h': 'Last Hour',
          '24h': 'Last 24 Hours',
          '7d': 'Last 7 Days',
          '30d': 'Last 30 Days',
        },
        autoRefresh: 'Auto-refresh',
        totalEvents: 'Total Events',
        errors: 'Errors',
        errorRate: 'Error Rate',
        eventTypes: 'Event Types',
        eventCountsByType: 'Event Counts by Type',
        recentErrors: 'Recent Errors',
        performanceMetrics: 'Performance Metrics',
        recentEvents: 'Recent Events',
        samples: 'samples',
        noEvents: 'No events recorded yet',
        noEventsHint: 'Events will appear here once they are recorded. Make sure event tracking is enabled in your application.',
        migrationHint: 'Note: Make sure the database migration has been run. Run the migration file: supabase/migrations/20250115_34_add_event_tracking.sql',
      },
      logout: 'Logout',
    },
    watchLater: {
      add: 'Add to watch later',
      remove: 'Remove from watch later',
      title: 'Watch Later',
      empty: {
        title: 'No videos saved yet',
        description: 'Add videos to your watch later queue from the feed.',
      },
      count: '0',
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
      loading: 'Weitere Geschichten werden geladen...',
      video: {
        autoplayAnnouncement: 'Video "{title}" wird jetzt abgespielt',
      },
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
        endings: 'Enden',
      },
      storyType: {
        branching: 'Verzweigte Geschichte',
      },
      continue: {
        label: 'Fortsetzen',
      },
      filters: {
        advanced: 'Erweiterte Filter',
        clearAll: 'Alle löschen',
        dateRange: 'Zeitraum',
        'dateRange.all': 'Alle Zeit',
        'dateRange.last24h': 'Letzte 24 Stunden',
        'dateRange.last7d': 'Letzte 7 Tage',
        'dateRange.last30d': 'Letzte 30 Tage',
        'dateRange.custom': 'Benutzerdefiniert',
        'dateRange.startDate': 'Startdatum',
        'dateRange.endDate': 'Enddatum',
        author: 'Autor',
        authorPlaceholder: 'Nach Autorenname suchen...',
        searching: 'Suche...',
        tags: 'Tags',
      },
    },
    search: {
      endOfResults: 'Ende der Ergebnisse',
      noResults: {
        title: 'Keine Ergebnisse gefunden',
        description: 'Versuchen Sie andere Schlüsselwörter oder überprüfen Sie Ihre Rechtschreibung',
      },
    },
    media: {
      error: {
        title: 'Medien konnten nicht geladen werden',
        message: 'Die Medien konnten nicht geladen werden. Bitte versuchen Sie es erneut.',
        retry: 'Wiederholen',
      },
    },
    settings: {
      title: 'Einstellungen',
      tabs: {
        profile: 'Profil',
        language: 'Sprache',
      },
      video: {
        title: 'Video-Einstellungen',
        description: 'Steuern Sie das automatische Abspielen von Videos in Ihrem Feed.',
        autoplay: {
          label: 'Video-Autoplay aktivieren',
          description: 'Videos in Ihrem Feed werden automatisch abgespielt, wenn sie ins Sichtfeld kommen. Sie können sie weiterhin manuell pausieren.',
        },
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
    admin: {
      dashboard: {
        title: 'Admin-Dashboard',
      },
      sidebar: {
        overview: 'Übersicht',
        users: 'Benutzer',
        moderation: 'Moderation',
        feedback: 'Feedback',
        analytics: 'Analysen',
        monitoring: 'Überwachung',
        settings: 'Einstellungen',
      },
      stats: {
        totalUsers: 'Benutzer gesamt',
        activeUsers: 'Aktive Benutzer (24h)',
        totalStories: 'Geschichten gesamt',
        totalPosts: 'Beiträge gesamt',
        totalLikes: 'Likes gesamt',
        totalViews: 'Aufrufe gesamt',
      },
      feedback: {
        title: 'Benutzer-Feedback-Verwaltung',
        description: 'Verwalten und analysieren Sie Benutzer-Feedback-Einreichungen.',
        empty: 'Kein Feedback gefunden',
        filters: {
          status: 'Status',
          type: 'Typ',
          priority: 'Priorität',
          category: 'Kategorie',
          categoryPlaceholder: 'Nach Kategorie filtern...',
        },
        status: {
          label: 'Status',
          pending: 'Ausstehend',
          reviewed: 'Überprüft',
          in_progress: 'In Bearbeitung',
          resolved: 'Gelöst',
          dismissed: 'Abgelehnt',
        },
        priority: {
          label: 'Priorität',
          low: 'Niedrig',
          medium: 'Mittel',
          high: 'Hoch',
          critical: 'Kritisch',
        },
        adminNotes: 'Admin-Notizen',
        adminNotesPlaceholder: 'Interne Notizen hinzufügen...',
        stats: {
          total: 'Gesamtes Feedback',
          pending: 'Ausstehend',
          resolved: 'Gelöst',
          averageRating: 'Durchschnittliche Bewertung',
        },
      },
      monitoring: {
        title: 'Echtzeit-Überwachung',
        description: 'Überwachen Sie Plattformereignisse, Fehler und Leistungsmetriken in Echtzeit.',
        period: {
          '1h': 'Letzte Stunde',
          '24h': 'Letzte 24 Stunden',
          '7d': 'Letzte 7 Tage',
          '30d': 'Letzte 30 Tage',
        },
        autoRefresh: 'Auto-Aktualisierung',
        totalEvents: 'Gesamt-Ereignisse',
        errors: 'Fehler',
        errorRate: 'Fehlerrate',
        eventTypes: 'Ereignistypen',
        eventCountsByType: 'Ereigniszählung nach Typ',
        recentErrors: 'Aktuelle Fehler',
        performanceMetrics: 'Leistungsmetriken',
        recentEvents: 'Aktuelle Ereignisse',
        samples: 'Proben',
        noEvents: 'Noch keine Ereignisse aufgezeichnet',
        noEventsHint: 'Ereignisse werden hier angezeigt, sobald sie aufgezeichnet werden. Stellen Sie sicher, dass die Ereignisverfolgung in Ihrer Anwendung aktiviert ist.',
        migrationHint: 'Hinweis: Stellen Sie sicher, dass die Datenbankmigration ausgeführt wurde. Führen Sie die Migrationsdatei aus: supabase/migrations/20250115_34_add_event_tracking.sql',
      },
      logout: 'Abmelden',
    },
    watchLater: {
      add: 'Zu später ansehen hinzufügen',
      remove: 'Von später ansehen entfernen',
      title: 'Später ansehen',
      empty: {
        title: 'Noch keine Videos gespeichert',
        description: 'Fügen Sie Videos aus dem Feed zu Ihrer Warteschlange hinzu.',
      },
      count: '0',
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
      loading: 'Загрузка дополнительных историй...',
      video: {
        autoplayAnnouncement: 'Видео "{title}" теперь воспроизводится',
      },
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
        endings: 'концовки',
      },
      storyType: {
        branching: 'Ветвящаяся история',
      },
      continue: {
        label: 'Продолжить',
      },
      filters: {
        advanced: 'Расширенные фильтры',
        clearAll: 'Очистить все',
        dateRange: 'Диапазон дат',
        'dateRange.all': 'Все время',
        'dateRange.last24h': 'Последние 24 часа',
        'dateRange.last7d': 'Последние 7 дней',
        'dateRange.last30d': 'Последние 30 дней',
        'dateRange.custom': 'Пользовательский',
        'dateRange.startDate': 'Дата начала',
        'dateRange.endDate': 'Дата окончания',
        author: 'Автор',
        authorPlaceholder: 'Поиск по имени автора...',
        searching: 'Поиск...',
        tags: 'Теги',
      },
      following: {
        empty: {
          title: 'Нет историй от отслеживаемых пользователей',
          description: 'Начните отслеживать пользователей, чтобы видеть их истории здесь!',
          action: 'Найти пользователей',
        },
        suggestions: {
          title: 'Отслеживать больше пользователей',
          description: 'Отслеживайте этих пользователей, чтобы видеть их истории в вашей ленте',
          follow: 'Отслеживать',
          following: 'Отслеживается',
        },
      },
    },
    search: {
      endOfResults: 'Конец результатов',
      noResults: {
        title: 'Результаты не найдены',
        description: 'Попробуйте другие ключевые слова или проверьте правописание',
      },
    },
    media: {
      error: {
        title: 'Не удалось загрузить медиа',
        message: 'Медиа не удалось загрузить. Пожалуйста, попробуйте снова.',
        retry: 'Повторить',
      },
    },
    settings: {
      title: 'Настройки',
      tabs: {
        profile: 'Профиль',
        language: 'Язык',
      },
      video: {
        title: 'Настройки видео',
        description: 'Управляйте автоматическим воспроизведением видео в вашей ленте.',
        autoplay: {
          label: 'Включить автоматическое воспроизведение видео',
          description: 'Видео в вашей ленте будут автоматически воспроизводиться, когда они попадают в поле зрения. Вы все еще можете приостановить их вручную.',
        },
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
    admin: {
      dashboard: {
        title: 'Панель администратора',
      },
      sidebar: {
        overview: 'Обзор',
        users: 'Пользователи',
        moderation: 'Модерация',
        feedback: 'Обратная связь',
        analytics: 'Аналитика',
        monitoring: 'Мониторинг',
        settings: 'Настройки',
      },
      stats: {
        totalUsers: 'Всего пользователей',
        activeUsers: 'Активные пользователи (24ч)',
        totalStories: 'Всего историй',
        totalPosts: 'Всего постов',
        totalLikes: 'Всего лайков',
        totalViews: 'Всего просмотров',
      },
      monitoring: {
        title: 'Мониторинг в реальном времени',
        description: 'Отслеживайте события платформы, ошибки и метрики производительности в реальном времени.',
        period: {
          '1h': 'Последний час',
          '24h': 'Последние 24 часа',
          '7d': 'Последние 7 дней',
          '30d': 'Последние 30 дней',
        },
        autoRefresh: 'Автообновление',
        totalEvents: 'Всего событий',
        errors: 'Ошибки',
        errorRate: 'Частота ошибок',
        eventTypes: 'Типы событий',
        eventCountsByType: 'Количество событий по типам',
        recentErrors: 'Последние ошибки',
        performanceMetrics: 'Метрики производительности',
        recentEvents: 'Последние события',
        samples: 'образцов',
        noEvents: 'События еще не записаны',
        noEventsHint: 'События появятся здесь после их записи. Убедитесь, что отслеживание событий включено в вашем приложении.',
        migrationHint: 'Примечание: Убедитесь, что миграция базы данных выполнена. Запустите файл миграции: supabase/migrations/20250115_34_add_event_tracking.sql',
      },
      logout: 'Выйти',
    },
    watchLater: {
      add: 'Добавить в "Посмотреть позже"',
      remove: 'Удалить из "Посмотреть позже"',
      title: 'Посмотреть позже',
      empty: {
        title: 'Пока нет сохраненных видео',
        description: 'Добавьте видео в очередь "Посмотреть позже" из ленты.',
      },
      count: '0',
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
      loading: 'Chargement d\'autres histoires...',
      video: {
        autoplayAnnouncement: 'La vidéo "{title}" est maintenant en cours de lecture',
      },
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
        endings: 'fins',
      },
      storyType: {
        branching: 'Histoire ramifiée',
      },
      continue: {
        label: 'Continuer',
      },
      filters: {
        advanced: 'Filtres avancés',
        clearAll: 'Tout effacer',
        dateRange: 'Plage de dates',
        'dateRange.all': 'Tout le temps',
        'dateRange.last24h': 'Dernières 24 heures',
        'dateRange.last7d': '7 derniers jours',
        'dateRange.last30d': '30 derniers jours',
        'dateRange.custom': 'Personnalisé',
        'dateRange.startDate': 'Date de début',
        'dateRange.endDate': 'Date de fin',
        author: 'Auteur',
        authorPlaceholder: 'Rechercher par nom d\'auteur...',
        searching: 'Recherche...',
        tags: 'Tags',
      },
    },
    search: {
      endOfResults: 'Fin des résultats',
      noResults: {
        title: 'Aucun résultat trouvé',
        description: 'Essayez d\'autres mots-clés ou vérifiez votre orthographe',
      },
    },
    media: {
      error: {
        title: 'Échec du chargement du média',
        message: 'Le média n\'a pas pu être chargé. Veuillez réessayer.',
        retry: 'Réessayer',
      },
    },
    settings: {
      title: 'Paramètres',
      tabs: {
        profile: 'Profil',
        language: 'Langue',
      },
      video: {
        title: 'Préférences vidéo',
        description: 'Contrôlez le comportement de lecture automatique des vidéos dans votre flux.',
        autoplay: {
          label: 'Activer la lecture automatique des vidéos',
          description: 'Les vidéos de votre flux seront automatiquement lues lorsqu\'elles entrent dans le champ de vision. Vous pouvez toujours les mettre en pause manuellement.',
        },
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
    admin: {
      dashboard: {
        title: 'Tableau de bord administrateur',
      },
      sidebar: {
        overview: 'Vue d\'ensemble',
        users: 'Utilisateurs',
        moderation: 'Modération',
        feedback: 'Feedback',
        analytics: 'Analyses',
        monitoring: 'Surveillance',
        settings: 'Paramètres',
      },
      stats: {
        totalUsers: 'Utilisateurs totaux',
        activeUsers: 'Utilisateurs actifs (24h)',
        totalStories: 'Histoires totales',
        totalPosts: 'Publications totales',
        totalLikes: 'J\'aime totaux',
        totalViews: 'Vues totales',
      },
      feedback: {
        title: 'Gestion des commentaires utilisateurs',
        description: 'Gérer et analyser les soumissions de commentaires utilisateurs.',
        empty: 'Aucun commentaire trouvé',
        filters: {
          status: 'Statut',
          type: 'Type',
          priority: 'Priorité',
          category: 'Catégorie',
          categoryPlaceholder: 'Filtrer par catégorie...',
        },
        status: {
          label: 'Statut',
          pending: 'En attente',
          reviewed: 'Examiné',
          in_progress: 'En cours',
          resolved: 'Résolu',
          dismissed: 'Rejeté',
        },
        priority: {
          label: 'Priorité',
          low: 'Faible',
          medium: 'Moyenne',
          high: 'Élevée',
          critical: 'Critique',
        },
        adminNotes: 'Notes administrateur',
        adminNotesPlaceholder: 'Ajouter des notes internes...',
        stats: {
          total: 'Total des commentaires',
          pending: 'En attente',
          resolved: 'Résolu',
          averageRating: 'Note moyenne',
        },
      },
      monitoring: {
        title: 'Surveillance en temps réel',
        description: 'Surveillez les événements de la plateforme, les erreurs et les métriques de performance en temps réel.',
        period: {
          '1h': 'Dernière heure',
          '24h': 'Dernières 24 heures',
          '7d': '7 derniers jours',
          '30d': '30 derniers jours',
        },
        autoRefresh: 'Actualisation automatique',
        totalEvents: 'Total des événements',
        errors: 'Erreurs',
        errorRate: 'Taux d\'erreur',
        eventTypes: 'Types d\'événements',
        eventCountsByType: 'Nombre d\'événements par type',
        recentErrors: 'Erreurs récentes',
        performanceMetrics: 'Métriques de performance',
        recentEvents: 'Événements récents',
        samples: 'échantillons',
        noEvents: 'Aucun événement enregistré pour le moment',
        noEventsHint: 'Les événements apparaîtront ici une fois enregistrés. Assurez-vous que le suivi des événements est activé dans votre application.',
        migrationHint: 'Remarque: Assurez-vous que la migration de la base de données a été exécutée. Exécutez le fichier de migration: supabase/migrations/20250115_34_add_event_tracking.sql',
      },
      logout: 'Déconnexion',
    },
    watchLater: {
      add: 'Ajouter à regarder plus tard',
      remove: 'Retirer de regarder plus tard',
      title: 'Regarder plus tard',
      empty: {
        title: 'Aucune vidéo sauvegardée',
        description: 'Ajoutez des vidéos à votre file d\'attente depuis le flux.',
      },
      count: '0',
    },
    feedback: {
      title: 'Envoyer des commentaires',
      description: 'Aidez-nous à améliorer BranchFeed en partageant vos pensées, en signalant des bugs ou en suggérant de nouvelles fonctionnalités.',
      anonymous: 'Vous pouvez envoyer des commentaires anonymement. Connectez-vous pour suivre vos soumissions.',
      submitAnother: 'Envoyer un autre commentaire',
      viewSubmissions: 'Voir vos soumissions',
      viewSubmissionsDesc: 'Suivez le statut de vos commentaires.',
      myFeedback: 'Mes commentaires',
      info: {
        title: 'Quel type de commentaire puis-je envoyer?',
        bug: 'Signaler des problèmes, des erreurs ou un comportement inattendu.',
        feature: 'Suggérer de nouvelles fonctionnalités ou fonctionnalités.',
        improvement: 'Partager des idées pour améliorer les fonctionnalités existantes.',
        general: 'Partager votre expérience globale et vos pensées.',
      },
      types: {
        bug: 'Rapport de bug',
        feature: 'Demande de fonctionnalité',
        improvement: 'Amélioration',
        general: 'Commentaire général',
        other: 'Autre',
      },
      form: {
        type: 'Type',
        category: 'Catégorie',
        categoryPlaceholder: 'par ex., Feed, Story, Profile, Search',
        title: 'Titre',
        titlePlaceholder: 'Résumé bref de vos commentaires',
        description: 'Description',
        descriptionPlaceholder: 'Veuillez fournir des informations détaillées...',
        rating: 'Note',
        noRating: 'Pas de note',
        submit: 'Envoyer des commentaires',
        submitting: 'Envoi...',
      },
      ratings: {
        excellent: 'Excellent',
        good: 'Bon',
        average: 'Moyen',
        poor: 'Mauvais',
        veryPoor: 'Très mauvais',
      },
      success: {
        title: 'Merci!',
        message: 'Vos commentaires ont été envoyés avec succès.',
      },
    },
    common: {
      optional: 'Optionnel',
      cancel: 'Annuler',
      characters: 'caractères',
      backToFeed: 'Retour au flux',
      all: 'Tous',
      save: 'Enregistrer',
      saving: 'Enregistrement...',
      edit: 'Modifier',
      anonymous: 'Anonyme',
      created: 'Créé',
      resolved: 'Résolu',
      page: 'Page',
      of: 'de',
      previous: 'Précédent',
      next: 'Suivant',
      clearFilters: 'Effacer les filtres',
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

