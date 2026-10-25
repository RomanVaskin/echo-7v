export const en = {
  meta: {
    siteTitle: 'seasmates — United by the Sea',
    siteDescription: 'Seasmates — sea journeys, sailing yachts, new routes and people united by the sea.',
    journeysTitle: 'All journeys',
    journeysDescription: 'Every seasmates sailing journey in one place: the Caribbean voyage and the routes in preparation.',
    caribbeanTitle: 'The Caribbean — 10 Nights',
    caribbeanDescription:
      'Our signature 10-night Caribbean sailing journey: quiet anchorages, turquoise lagoons and island life with a small crew.',
    teamTitle: 'Our Team',
    teamDescription:
      'The people behind every seasmates journey — sailors for whom the sea is more than a route.',
    blogTitle: 'Journal',
    blogDescription: 'Stories under sail: routes, discoveries, practical advice and inspiration for new sea journeys.',
    contactsTitle: 'Contacts',
    contactsDescription:
      'Tell us what kind of journey you are looking for, and we will help you find the right route and company.',
  },
  common: {
    tba: 'TBA',
    atSea: 'at sea',
    duration: 'Duration',
    dates: 'Dates',
    yacht: 'Yacht',
    guests: 'Guests',
    from: 'From',
    exploreJourney: 'Explore Journey',
    registerInterest: 'Register interest',
    featured: 'Upcoming journey',
    enquire: 'Enquire',
    loadingChart: 'Loading chart…',
    sailingYachtIn: 'Sailing yacht in',
    perPerson: '/ person',
    more: 'Explore',
  },
  status: {
    'enquiries-open': 'Enquiries open',
    limited: 'Limited availability',
    'coming-soon': 'Coming soon',
    'fully-booked': 'Fully booked',
  },
  regions: {
    Caribbean: 'Caribbean',
    Mediterranean: 'Mediterranean',
    'Indian Ocean': 'Indian Ocean',
  },
  journeys: {
    caribbean: {
      destination: 'The Caribbean',
      area: 'Island-hopping voyage',
      summary:
        'Ten nights between quiet anchorages, turquoise lagoons and palm-fringed islands — our signature journey.',
      // Journey card copy (English in both locales)
      cardTitle: 'Caribbean New Year Escape',
      tagline:
        'Sail into the New Year aboard a private yacht in the Caribbean, exploring tropical islands and turquoise waters. Enjoy an intimate escape for eight guests, with a private skipper and chef, and celebrate New Year’s Eve with a festive dinner under the stars.',
      dates: 'Dec 28, 2026 – Jan 7, 2027',
    },
    cyclades: {
      destination: 'The Cyclades',
      area: 'Greece',
      summary: 'Whitewashed villages, meltemi winds and long Aegean evenings.',
    },
    dalmatia: {
      destination: 'Dalmatian Coast',
      area: 'Croatia',
      summary: 'Pine-scented coves and stone harbour towns along the Adriatic.',
    },
    seychelles: {
      destination: 'Seychelles',
      area: 'Inner Islands',
      summary: 'Granite boulders, white sand and the warm Indian Ocean.',
    },
  } as Record<
    string,
    { destination: string; area: string; summary: string; cardTitle?: string; tagline?: string; dates?: string }
  >,
  header: {
    homeLabel: 'seasmates home',
    languageLabel: 'Language',
    mainNav: 'Main',
    mobileNav: 'Mobile',
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
    nav: {
      caribbean: 'The Caribbean',
      schedule: 'Schedule',
      howItWorks: 'How it works',
      journeys: 'Journeys',
      team: 'Our Team',
      blog: 'Journal',
      contacts: 'Contacts',
    },
  },
  footer: {
    tagline:
      'An international sailing club. Carefully selected journeys for small crews who prefer to travel by sea.',
    journeys: 'Journeys',
    caribbeanLink: 'The Caribbean — 10 nights',
    schedule: 'Sailing schedule',
    club: 'Club',
    howItWorks: 'How it works',
    enquire: 'Enquire',
    allJourneys: 'All journeys',
    team: 'Our Team',
    blog: 'Journal',
    contacts: 'Contacts',
    rights: 'All rights reserved.',
    tbaNote: 'Details marked TBA are subject to confirmation.',
  },
  hero: {
    imageAlt: 'A sailing yacht crossing deep open ocean at dusk',
    motto: 'United by the Sea',
    // Optional local translation of the motto, shown under it; empty in English.
    mottoTranslation: '',
    titleLead: 'Travel by sea,',
    titleAccent: 'in good company.',
    exploreJourneys: 'Explore Journeys',
  },
  intro: {
    aria: 'About seasmates',
    eyebrow: 'The club',
    lead: 'Thoughtfully curated journeys for small crews. Quiet anchorages, long passages, and the people you meet along the way.',
    imageAlt: 'Friends relaxing on the bow of a yacht at sunset',
    items: [
      { title: 'Small crews', text: 'Intimate groups, so every anchorage still feels like a discovery.' },
      { title: 'Curated routes', text: 'Each voyage is planned around calm water, light and local life.' },
      { title: 'Skippered', text: 'Professional crews sail — you decide how involved you want to be.' },
    ],
  },
  featuredJourney: {
    eyebrow: 'Featured journey',
    imageAlt: 'Catamaran anchored in a turquoise Caribbean lagoon at golden hour',
  },
  schedule: {
    eyebrow: 'Sailing schedule',
    title: 'Upcoming journeys',
    filterLabel: 'Filter journeys by region',
    all: 'All',
    carouselLabel: 'Upcoming journeys',
    previous: 'Previous journeys',
    next: 'Next journeys',
    card: {
      dates: 'Dates',
      duration: 'Duration',
      yacht: 'Yacht',
      guests: 'Guests',
      price: 'Price per person',
    },
  },
  allJourneys: {
    cta: 'All journeys',
    eyebrow: 'Sailing schedule',
    title: 'All journeys',
  },
  howItWorks: {
    eyebrow: 'How it works',
    titleLead: 'From first glance',
    titleAccent: 'to open water.',
    description: 'Every seasmates journey is arranged personally. There is no checkout — only a conversation with our team.',
    steps: [
      { title: 'Explore Your Journey', description: 'Discover our carefully curated sailing experiences.' },
      { title: 'Plan Your Escape', description: 'Connect with our team to discuss availability, accommodation and travel details.' },
      { title: 'Set Sail', description: 'Prepare for an unforgettable journey at sea.' },
    ],
  },
  enquirySection: {
    eyebrow: 'Enquire',
    home: {
      title: 'Have questions?',
      description: 'Leave your details, and we’ll help you find the right sailing experience.',
    },
    caribbean: {
      titleLead: 'Begin your',
      titleAccent: 'Caribbean voyage.',
      description:
        'Share a few details and our team will be in touch personally to discuss dates, cabins and travel arrangements.',
    },
  },
  form: {
    name: 'Name',
    contact: 'WhatsApp / Telegram',
    send: 'Send',
    sending: 'Sending…',
    received: 'Enquiry received',
    success: 'Thank you, {name}. We will be in touch shortly.',
    errors: {
      name: 'Please enter your name.',
      contact: 'Please enter a phone number for WhatsApp or a Telegram username.',
      review: 'Please review the highlighted fields.',
      delivery: 'We couldn’t send your enquiry right now. Please try again a little later.',
    },
  },
  reviews: {
    eyebrow: 'Reviews',
    title: 'Reviews',
  },
  social: {
    label: 'seasmates on social media',
    whatsapp: 'seasmates on WhatsApp',
    telegram: 'seasmates on Telegram',
    instagram: 'seasmates on Instagram',
  },

  teamPage: {
    eyebrow: 'Our Team',
    title: 'People united by the sea',
    lead: 'Behind every seasmates journey are people for whom the sea is more than a route. We create journeys where the atmosphere, the discoveries and good company matter.',
    imageAlt: 'A sailing yacht crossing open water',
    membersEyebrow: 'The crew',
    membersTitle: 'Our team',
    membersPending: 'We will introduce the team here very soon.',
    photoPending: 'Photo coming soon',
    approachEyebrow: 'Our approach',
    approachTitle: 'What matters to us',
    approach: [
      { title: 'The sea', text: 'We choose routes that let you feel the freedom of travelling under sail.' },
      { title: 'People', text: 'We want like-minded travellers to come together on board.' },
      { title: 'Impressions', text: 'We value not only the destinations, but the moments that happen along the way.' },
    ],
    cta: 'Choose a journey',
  },
  blogPage: {
    eyebrow: 'Journal',
    title: 'Stories under sail',
    lead: 'Routes, discoveries, practical advice and inspiration for new sea journeys.',
    filterLabel: 'Filter stories by category',
    all: 'All',
    categories: {
      destinations: 'Destinations',
      'yacht-life': 'Life on a yacht',
      tips: 'Tips for travellers',
      stories: 'seasmates stories',
    },
    empty: 'Stories from our journeys will appear here soon.',
    read: 'Read',
    back: 'Back to the journal',
    published: 'Published',
  },
  contactsPage: {
    eyebrow: 'Contacts',
    title: 'Let’s get acquainted',
    lead: 'Tell us what kind of journey you are looking for, and we will help you find the right route and company.',
    channelsTitle: 'Write to us',
    channelPending: 'link coming soon',
    channels: { whatsapp: 'WhatsApp', telegram: 'Telegram', instagram: 'Instagram' },
    formEyebrow: 'Enquire',
    formTitle: 'Have questions?',
    formDescription: 'Leave a request, and we will help you choose the format of your journey.',
    motto: 'United by the Sea',
    mottoTranslation: '',
  },

  caribbean: {
    breadcrumb: 'Journeys',
    breadcrumbLabel: 'Breadcrumb',
    overview: {
      eyebrow: 'Journey overview',
      titleLead: 'Ten nights,',
      titleAccent: 'one unhurried horizon.',
      primary:
        'Our signature voyage moves slowly through the islands — a short sail each day, long swims, sheltered anchorages at dusk. It is designed for travellers who want the sea itself to be the destination.',
    },
    highlights: {
      eyebrow: 'On this journey',
      title: 'Moments of the voyage',
      carouselLabel: 'Journey highlights',
      previous: 'Previous',
      next: 'Next',
      // Temporary themed cards; their photos are set in lib/caribbean.ts
      items: [
        { title: 'Life on board', text: 'A story about how a day on the yacht unfolds will appear here.' },
        { title: 'Islands', text: 'A story about the islands and anchorages of the route will appear here.' },
        { title: 'The sea', text: 'A story about time in and by the water will appear here.' },
        { title: 'At the helm', text: 'A story about sailing and how guests take part in the passages will appear here.' },
        { title: 'New Year at sea', text: 'A story about welcoming the New Year at sea will appear here.' },
      ],
    },
    map: {
      eyebrow: 'Route',
      label: 'Route map',
      placeholder: 'Route map',
    },
    days: {
      eyebrow: 'Day by day',
      title: 'The route, day by day',
      carouselLabel: 'Route by day',
      day: 'Day',
      photoPlaceholder: 'Photo coming soon',
      previous: 'Previous',
      next: 'Next',
      // Days 1–3: demonstration texts; the rest are placeholders until the confirmed programme arrives
      items: [
        { place: 'Martinique', text: 'Arrival at Le Marin marina, meeting the crew and settling in on board. A welcome dinner and first impressions of the Caribbean Sea.' },
        { place: 'Rodney Bay', text: 'A passage to Saint Lucia. Turquoise coves, scenic shores and a first taste of the Caribbean islands’ atmosphere.' },
        { place: 'The Majestic Pitons', text: 'Discovering the volcanic peaks of Saint Lucia. Panoramic views, a sea outing and time to unwind against the backdrop of the famous Pitons.' },
        { place: 'Day 4 location', text: 'The programme for this day will be published later.' },
        { place: 'Day 5 location', text: 'The programme for this day will be published later.' },
        { place: 'Day 6 location', text: 'The programme for this day will be published later.' },
        { place: 'Day 7 location', text: 'The programme for this day will be published later.' },
        { place: 'Day 8 location', text: 'The programme for this day will be published later.' },
        { place: 'Day 9 location', text: 'The programme for this day will be published later.' },
      ],
    },
    inclusions: {
      eyebrow: 'Terms',
      title: 'What the journey includes',
      note: 'A preliminary list for illustration only — the final terms will be confirmed separately.',
      includedTitle: 'What’s included',
      notIncludedTitle: 'Paid separately',
      included: ['Accommodation on the yacht', 'Route planning', 'Journey hosting', 'Shared programme activities'],
      notIncluded: ['Flights', 'Transfers', 'Personal expenses', 'Additional activities'],
    },
    yacht: {
      eyebrow: 'The yacht',
      description: 'The catamaran for this journey. A full description and photos will be added later.',
      exteriorTitle: 'The catamaran',
      cabinsTitle: 'Cabins',
      photoPlaceholder: 'Photo coming soon',
      carouselLabel: 'Yacht photos',
      previous: 'Previous',
      next: 'Next',
    },
    actions: {
      join: 'Join!',
      ask: 'Ask a question',
    },
    contact: {
      eyebrow: 'Contact us',
    },
    faq: {
      eyebrow: 'Questions',
      title: 'FAQ',
      items: [
        {
          question: 'Do I need any sailing experience?',
          answer:
            'No. Every journey is skippered by a professional crew. Guests are welcome to help with sailing, but you are equally welcome to simply relax.',
        },
        {
          question: 'Can I join as a solo traveller?',
          answer:
            'Yes. seasmates is a club for like-minded travellers, and many guests join on their own. Cabin arrangements are discussed individually.',
        },
        {
          question: 'How many guests will be on board?',
          answer:
            'Crews are kept intentionally small. The exact capacity will be confirmed together with the yacht details.',
        },
        {
          question: 'How do I get to the starting point?',
          answer:
            'Once dates are confirmed, our team will share recommended flight routes and arrival times for embarkation day.',
        },
        {
          question: 'What should I pack?',
          answer: 'Light, soft luggage is best. We share a detailed packing list after your place is confirmed.',
        },
        {
          question: 'How do I reserve a place?',
          answer:
            'Send an enquiry below. We will be in touch personally to discuss availability, accommodation and the next steps.',
        },
      ],
    },
  },
}
