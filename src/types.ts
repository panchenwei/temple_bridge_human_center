export enum AppView {
  EXPLORE = 'explore',
  ROUTES = 'routes',
  STAMPS = 'stamps',
  PROFILE = 'profile',
}

export interface Spot {
  id: string;
  name: string;
  chineseName: string;
  description: string;
  whyMatters: string;
  story: string;
  poem?: string;
  image: string;
  oldImage: string;
  nowImage: string;
  category: 'bridge' | 'temple' | 'canal' | 'gate';
  x: number;
  y: number;
}

export interface RouteMarker {
  id: string;
  name: string;
  chineseName: string;
  description: string;
  story: string;
  poem?: string;
  x: number;
  y: number;
  challengeId: string;
}

export interface RouteDetail {
  id: string;
  title: string;
  chineseTitle: string;
  distance: string;
  duration: string;
  description: string;
  bestFor: string;
  markers: RouteMarker[];
  mapImage: string;
}

export interface JourneyProgress {
  score: number;
  completedChallenges: string[];
  visitedSpots: string[];
  unlockedStories: string[];
  collectedStamps: string[];
}

export interface ChallengeReward {
  id: string;
  points: number;
  stampId?: string;
  storyId?: string;
  spotId?: string;
}

export const INITIAL_PROGRESS: JourneyProgress = {
  score: 0,
  completedChallenges: [],
  visitedSpots: [],
  unlockedStories: [],
  collectedStamps: [],
};

export const SPOTS: Spot[] = [
  {
    id: 'maple-bridge',
    name: 'Maple Bridge',
    chineseName: '枫桥',
    description: 'The poetic gateway between canal life, night bells, and Tang dynasty memory.',
    whyMatters: 'This is the exact place where water traffic, city defense, market trade, and Zhang Ji’s poem meet.',
    story: '枫桥一带曾是水陆交通要冲，夜泊客船、城外钟声和江南水巷共同构成了《枫桥夜泊》的空间记忆。',
    poem: '月落乌啼霜满天，江枫渔火对愁眠。',
    image: '/images/spots/maple-bridge.jpg',
    oldImage: '/images/spots/maple-bridge-old.jpg',
    nowImage: '/images/spots/maple-bridge-now.jpg',
    category: 'bridge',
    x: 42,
    y: 58,
  },
  {
    id: 'hanshan-temple',
    name: 'Hanshan Temple',
    chineseName: '寒山寺',
    description: 'A temple famous for its midnight bell, Buddhist culture, and poetic atmosphere.',
    whyMatters: 'The temple bell turns the physical landscape into an acoustic landmark remembered for more than a thousand years.',
    story: '寒山寺始建于南朝，相传钟声可随水路远传。诗中的“夜半钟声”让寺院成为游客理解枫桥文化的核心入口。',
    poem: '姑苏城外寒山寺，夜半钟声到客船。',
    image: '/images/spots/hanshan-temple.jpg',
    oldImage: '/images/spots/hanshan-temple-old.jpg',
    nowImage: '/images/spots/hanshan-temple-now.jpg',
    category: 'temple',
    x: 64,
    y: 36,
  },
  {
    id: 'tieling-pass',
    name: 'Tieling Pass',
    chineseName: '铁铃关',
    description: 'A rare bridge-and-fortress complex connected with Ming dynasty city defense.',
    whyMatters: 'It shows that Maple Bridge was not only poetic, but also a strategic point on the waterway.',
    story: '铁铃关依水而设，与桥、河、城防联系紧密，是理解古代苏州防御体系和运河秩序的重要节点。',
    image: '/images/spots/tieling-pass.jpg',
    oldImage: '/images/spots/tieling-pass-old.jpg',
    nowImage: '/images/spots/tieling-pass-now.jpg',
    category: 'gate',
    x: 34,
    y: 66,
  },
  {
    id: 'grand-canal',
    name: 'Grand Canal',
    chineseName: '大运河',
    description: 'The ancient waterway that carried trade, grain, travelers, and stories through Gusu.',
    whyMatters: 'The canal explains why this place became prosperous before it became a famous poetic symbol.',
    story: '大运河连接南北，推动苏州形成水城格局。枫桥附近的商贸、码头和米市都与这条水路密不可分。',
    image: '/images/spots/grand-canal.jpg',
    oldImage: '/images/spots/grand-canal-old.jpg',
    nowImage: '/images/spots/grand-canal-now.jpg',
    category: 'canal',
    x: 52,
    y: 76,
  },
];

export const ROUTES_DATA: RouteDetail[] = [
  {
    id: 'quick-visit',
    title: 'Quick Visit',
    chineseTitle: '轻游路线',
    distance: '1.8km',
    duration: '45min',
    bestFor: 'First-time visitors with limited time',
    description: 'A compact introduction to the bridge, temple bell, and canal view.',
    mapImage: '/images/maps/quick-visit-map.jpg',
    markers: [
      {
        id: 'maple-bridge-stop',
        name: 'Maple Bridge Viewpoint',
        chineseName: '枫桥观景点',
        description: 'Start from the poetic bridge view and understand the site orientation.',
        story: 'Stand beside the bridge and compare the current canal view with the night scene described by Zhang Ji.',
        poem: '月落乌啼霜满天',
        x: 42,
        y: 58,
        challengeId: 'story-maple-bridge',
      },
      {
        id: 'bell-tower-stop',
        name: 'Hanshan Bell Tower',
        chineseName: '寒山钟楼',
        description: 'Listen for the cultural meaning of the midnight bell.',
        story: 'The 108 bell rings are connected with Buddhist ideas of releasing worldly worries.',
        poem: '夜半钟声到客船',
        x: 64,
        y: 36,
        challengeId: 'story-bell-tower',
      },
      {
        id: 'canal-pier-stop',
        name: 'Canal Pier',
        chineseName: '运河码头',
        description: 'Finish at the water edge and connect poetry with canal trade.',
        story: 'The pier helps visitors understand that the poem was born from real movement, boats, markets, and night travel.',
        x: 52,
        y: 76,
        challengeId: 'story-canal-pier',
      },
    ],
  },
  {
    id: 'poetry-route',
    title: 'Poetry Route',
    chineseTitle: '诗意路线',
    distance: '3.2km',
    duration: '90min',
    bestFor: 'Visitors interested in poetry and atmosphere',
    description: 'Follow the imagery of moon, frost, fishing lights, temple, and bell.',
    mapImage: '/images/maps/poetry-route-map.jpg',
    markers: [
      {
        id: 'poem-wall-stop',
        name: 'Poetry Inscription Wall',
        chineseName: '诗碑廊',
        description: 'Read the poem as a route map instead of only a text.',
        story: 'Each image in the poem corresponds to a sensory clue: moonlight, bird call, frost, river maple, fishing fire, and bell.',
        poem: '江枫渔火对愁眠',
        x: 48,
        y: 48,
        challengeId: 'story-poem-wall',
      },
      {
        id: 'jiangfeng-stop',
        name: 'Jiangfeng Riverside',
        chineseName: '江枫水岸',
        description: 'A quiet riverside point for connecting landscape and emotion.',
        story: 'The riverbank turns the poem’s homesickness into a visible scene: water, lights, silence, and distance.',
        x: 38,
        y: 70,
        challengeId: 'story-jiangfeng',
      },
      {
        id: 'hanshan-temple-stop',
        name: 'Hanshan Temple Courtyard',
        chineseName: '寒山寺庭院',
        description: 'End in the temple courtyard and unlock the bell story.',
        story: 'The temple transforms the route from sightseeing into a cultural memory of sound.',
        poem: '姑苏城外寒山寺',
        x: 66,
        y: 34,
        challengeId: 'story-hanshan-temple',
      },
    ],
  },
  {
    id: 'grand-canal-route',
    title: 'Grand Canal Route',
    chineseTitle: '运河路线',
    distance: '5.5km',
    duration: '2.5h',
    bestFor: 'Local residents and deeper cultural rediscovery',
    description: 'Trace the canal functions behind the poetic fame: gates, trade, transport, and defense.',
    mapImage: '/images/maps/grand-canal-route-map.jpg',
    markers: [
      {
        id: 'tieling-pass-stop',
        name: 'Tieling Pass',
        chineseName: '铁铃关',
        description: 'Understand how defense and waterways shaped the area.',
        story: 'Tieling Pass reveals a practical side of the scenic area: controlling routes, protecting trade, and guarding the city.',
        x: 34,
        y: 66,
        challengeId: 'story-tieling-pass',
      },
      {
        id: 'old-market-stop',
        name: 'Old Rice Market Memory',
        chineseName: '旧米市记忆',
        description: 'Discover why “asking the Maple Bridge price” became a commercial phrase.',
        story: 'Ming and Qing merchants gathered around the canal. Prices, boats, grain, and bridge traffic formed a busy market system.',
        x: 44,
        y: 62,
        challengeId: 'story-old-market',
      },
      {
        id: 'grand-canal-stop',
        name: 'Grand Canal Walkway',
        chineseName: '大运河步道',
        description: 'End with the larger historical network of the Grand Canal.',
        story: 'The canal connected regional economies and daily life. Maple Bridge is one poetic node inside this long water network.',
        x: 56,
        y: 78,
        challengeId: 'story-grand-canal',
      },
    ],
  },
];
