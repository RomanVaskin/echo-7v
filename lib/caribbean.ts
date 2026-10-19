/**
 * Editable placeholder content for the Caribbean 9-night journey.
 * The route below is indicative and should be replaced once confirmed.
 */

export type ItineraryDay = {
  day: number
  place: string
  title: string
  description: string
  coordinates: [number, number]
}

export const caribbeanItinerary: ItineraryDay[] = [
  {
    day: 1,
    place: 'St. Vincent',
    title: 'Embarkation',
    description:
      'Meet your crew, settle into your cabin and enjoy a welcome sundowner on deck before a quiet first night at anchor.',
    coordinates: [13.128, -61.196],
  },
  {
    day: 2,
    place: 'Bequia',
    title: 'Admiralty Bay',
    description:
      'A gentle first sail south. Afternoon ashore among boatbuilders, beach bars and the island’s unhurried rhythm.',
    coordinates: [13.006, -61.243],
  },
  {
    day: 3,
    place: 'Mustique',
    title: 'Britannia Bay',
    description: 'Calm turquoise water, snorkelling from the boat and an evening ashore.',
    coordinates: [12.877, -61.188],
  },
  {
    day: 4,
    place: 'Canouan',
    title: 'Open-water passage',
    description: 'A longer sail with time at the helm for those who wish, arriving at a sheltered bay.',
    coordinates: [12.711, -61.33],
  },
  {
    day: 5,
    place: 'Tobago Cays',
    title: 'Marine park',
    description: 'Anchor behind Horseshoe Reef. Swim with turtles and explore uninhabited cays by tender.',
    coordinates: [12.633, -61.355],
  },
  {
    day: 6,
    place: 'Mayreau',
    title: 'Salt Whistle Bay',
    description: 'A crescent of white sand and a slow day — paddleboards, hammocks and a beach dinner.',
    coordinates: [12.647, -61.389],
  },
  {
    day: 7,
    place: 'Union Island',
    title: 'Clifton Harbour',
    description: 'Kite-surfers, a lively market and a sunset view over the Grenadines.',
    coordinates: [12.598, -61.414],
  },
  {
    day: 8,
    place: 'Carriacou',
    title: 'Sandy Island',
    description: 'Cross into Grenadian waters. Snorkel the reef around a tiny sand spit and dine on board.',
    coordinates: [12.481, -61.476],
  },
  {
    day: 9,
    place: 'Petit St. Vincent',
    title: 'Final anchorage',
    description: 'A last full day at sea, followed by a farewell dinner under the stars.',
    coordinates: [12.54, -61.384],
  },
  {
    day: 10,
    place: 'Union Island',
    title: 'Disembarkation',
    description: 'Breakfast on deck before saying goodbye to the crew and continuing your travels.',
    coordinates: [12.596, -61.42],
  },
]

export const included = [
  'Nine nights of cabin accommodation on board',
  'Professional skipper and crew',
  'Bed linen and towels',
  'Snorkelling equipment and paddleboards',
  'Welcome drinks and farewell dinner',
  'Pre-departure planning with our team',
]

export const notIncluded = [
  'International and domestic flights',
  'Travel and medical insurance',
  'Marina, mooring and marine-park fees',
  'Meals and drinks ashore',
  'Crew gratuities',
  'Personal expenses',
]

export const faqs = [
  {
    question: 'Do I need any sailing experience?',
    answer:
      'No. Every journey is skippered by a professional crew. Guests are welcome to help with sailing, but you are equally welcome to simply relax.',
  },
  {
    question: 'Can I join as a solo traveller?',
    answer:
      'Yes. Seasemates is a club for like-minded travellers, and many guests join on their own. Cabin arrangements are discussed individually.',
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
    answer:
      'Light, soft luggage is best. We share a detailed packing list after your place is confirmed.',
  },
  {
    question: 'How do I reserve a place?',
    answer:
      'Send an enquiry below. We will be in touch personally to discuss availability, accommodation and the next steps.',
  },
]
