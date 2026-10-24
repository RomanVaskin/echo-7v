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
    heroStatus: 'Status',
    overview: {
      eyebrow: 'Journey overview',
      titleLead: 'Ten nights,',
      titleAccent: 'one unhurried horizon.',
      primary:
        'Our signature voyage moves slowly through the islands — a short sail each day, long swims, sheltered anchorages at dusk. It is designed for travellers who want the sea itself to be the destination.',
      secondary:
        'Days are loosely shaped by wind and light. Snorkel reefs, step ashore in small harbour towns or simply stay on deck with a book. Your professional crew handles the sailing; you are welcome to take the helm whenever you like.',
    },
    route: {
      eyebrow: 'Sailing route',
      title: 'Chart the voyage',
      description: 'Select a stop to follow the route. Indicative route, subject to confirmation.',
      listTitle: 'Route stops',
      day: 'Day',
    },
    itinerary: {
      eyebrow: 'Day by day',
      title: 'Itinerary',
      description: 'Indicative itinerary. The exact route adapts to weather and sea conditions, as all good sailing does.',
      day: 'Day',
      days: [
        {
          place: 'St. Vincent',
          title: 'Embarkation',
          description:
            'Meet your crew, settle into your cabin and enjoy a welcome sundowner on deck before a quiet first night at anchor.',
        },
        {
          place: 'Bequia',
          title: 'Admiralty Bay',
          description:
            'A gentle first sail south. Afternoon ashore among boatbuilders, beach bars and the island’s unhurried rhythm.',
        },
        {
          place: 'Mustique',
          title: 'Britannia Bay',
          description: 'Calm turquoise water, snorkelling from the boat and an evening ashore.',
        },
        {
          place: 'Canouan',
          title: 'Open-water passage',
          description: 'A longer sail with time at the helm for those who wish, arriving at a sheltered bay.',
        },
        {
          place: 'Tobago Cays',
          title: 'Marine park',
          description: 'Anchor behind Horseshoe Reef. Swim with turtles and explore uninhabited cays by tender.',
        },
        {
          place: 'Mayreau',
          title: 'Salt Whistle Bay',
          description: 'A crescent of white sand and a slow day — paddleboards, hammocks and a beach dinner.',
        },
        {
          place: 'Union Island',
          title: 'Clifton Harbour',
          description: 'Kite-surfers, a lively market and a sunset view over the Grenadines.',
        },
        {
          place: 'Carriacou',
          title: 'Sandy Island',
          description: 'Cross into Grenadian waters. Snorkel the reef around a tiny sand spit and dine on board.',
        },
        {
          place: 'Petit St. Vincent',
          title: 'Final anchorage',
          description: 'A last full day at sea, followed by a farewell dinner under the stars.',
        },
        {
          place: 'Union Island',
          title: 'Disembarkation',
          description: 'Breakfast on deck before saying goodbye to the crew and continuing your travels.',
        },
      ],
    },
    yacht: {
      eyebrow: 'Yacht & accommodation',
      titleLead: 'A quiet home',
      titleAccent: 'on the water.',
      description:
        'Guests stay in private cabins with fresh linen and natural light, with generous deck space for sunbathing, dining and watching the islands drift by. Yacht specifications will be published once confirmed.',
      imageAlt: 'Teak-lined yacht cabin with linen bedding and soft daylight',
      specs: {
        vesselType: 'Vessel type',
        model: 'Model',
        cabins: 'Cabins',
        guests: 'Guests',
        crew: 'Crew',
        crewValue: 'Professional skipper',
      },
    },
    inclusions: {
      eyebrow: 'Inclusions',
      title: 'What’s included',
      description: 'Indicative list — final inclusions are confirmed with each departure.',
      includedTitle: 'Included',
      notIncludedTitle: 'Not included',
      included: [
        'Ten nights of cabin accommodation on board',
        'Professional skipper and crew',
        'Bed linen and towels',
        'Snorkelling equipment and paddleboards',
        'Welcome drinks and farewell dinner',
        'Pre-departure planning with our team',
      ],
      notIncluded: [
        'International and domestic flights',
        'Travel and medical insurance',
        'Marina, mooring and marine-park fees',
        'Meals and drinks ashore',
        'Crew gratuities',
        'Personal expenses',
      ],
    },
    gallery: {
      eyebrow: 'Gallery',
      images: [
        'Friends relaxing on the bow of a yacht at sunset',
        'A dinghy floating over a turquoise coral reef',
        'Hands on a yacht wheel with the ocean horizon beyond',
      ],
    },
    pricing: {
      eyebrow: 'Price & availability',
      titleLead: 'Reserve your',
      titleAccent: 'place on board.',
      description:
        'Pricing and departure dates will be announced shortly. Register your interest now to be among the first to hear.',
      price: 'Price per person',
      departures: 'Departure dates',
      duration: 'Duration',
      availability: 'Availability',
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
