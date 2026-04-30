export const VIBES = [
  { id: 'eat', icon: '🍛', name: 'Eat & Drink', desc: 'Street food, dhabas, and sit-down restaurants' },
  { id: 'cafe', icon: '☕', name: 'Cafes', desc: 'Coffee, chai, and slow mornings' },
  { id: 'night', icon: '🌙', name: 'Nightlife', desc: 'Bars, rooftops, late nights' },
  { id: 'out', icon: '🌿', name: 'Outdoors', desc: 'Parks, ruins, golden hour spots' },
  { id: 'gem', icon: '💎', name: 'Hidden Gems', desc: 'What locals actually love' },
  { id: 'art', icon: '🎨', name: 'Art & Culture', desc: 'Galleries, heritage, installations' },
];

export const SPOTS = {
  eat: [
    { name: 'Natraj Dahi Bhalle', area: 'Chandni Chowk', time: '12pm – 8pm', price: '₹ under 200', tags: ['street food', 'legendary', 'must try'], desc: 'The dahi bhalle here have been the same since 1940. The aloo tikki chaat is a side order you will regret skipping.', votes: 47, verified: true, handle: '@foodiedelhi', reviews: [{ h: '@olddelhi_walks', v: true, d: 'Jan 2025', t: 'Best I\'ve had in Delhi, no contest.' }, { h: '@morningwalk_ncr', v: false, d: 'Feb 2025', t: 'Do not skip the amchur.' }] },
    { name: 'Paranthe Wali Gali', area: 'Chandni Chowk', time: '8am – 10pm', price: '₹ under 150', tags: ['street food', 'heritage', 'old delhi'], desc: 'A lane frying paranthas since the 1870s. Chaotic, loud, delicious. Go in the morning.', votes: 38, verified: true, handle: '@dilli_heritage', reviews: [{ h: '@traveldilli', v: true, d: 'Dec 2024', t: 'Go before 9am, the lane is quieter.' }, { h: '@dilli_food_stories', v: false, d: 'Jan 2025', t: 'The stuffed pyaaz parantha changed something in me.' }] },
    { name: 'Karim\'s', area: 'Jama Masjid', time: '9am – 12am', price: '₹₹ 300–700', tags: ['mughlai', 'non-veg', 'historic'], desc: 'Open since 1913. The mutton nihari is the thing to order. Always packed with locals, not tourists.', votes: 52, verified: true, handle: '@kareemsdelhi', reviews: [{ h: '@foodroamer', v: true, d: 'Mar 2025', t: 'The mutton burra is underrated. Go on a weekday.' }, { h: '@olddelhiwalk', v: false, d: 'Feb 2025', t: 'Three generations of my family have eaten here.' }] },
    { name: 'Andaaz Apna Apna', area: 'Lajpat Nagar', time: 'Weekends only', price: '₹₹ 300–600', tags: ['haleem', 'weekend', 'limited hours'], desc: 'The haleem is slow-cooked and the real thing. Weekend only, runs out by 2pm. Go at 11am.', votes: 6, verified: false, handle: '@lajpatfoodie', reviews: [{ h: '@haleemlover', v: false, d: 'Mar 2025', t: 'Go at 11am or you won\'t get any.' }] },
  ],
  cafe: [
    { name: 'Jugmug Thela', area: 'Lodhi Colony', time: '9am – 7pm', price: '₹ under 300', tags: ['chai', 'artsy', 'work-friendly'], desc: 'Tiny container cafe in an artsy lane. Try the gulkand chai. Nobody rushes you out.', votes: 33, verified: true, handle: '@cafehopper_in', reviews: [{ h: '@slowmornings', v: false, d: 'Mar 2025', t: 'Gulkand chai hit different on a winter morning here.' }] },
    { name: 'Blueprint Coffee', area: 'Vasant Vihar', time: '8am – 8pm', price: '₹₹ 200–500', tags: ['specialty coffee', 'pour-over', 'quiet'], desc: 'Serious specialty coffee, no attitude. The pour-over takes 6 minutes and it\'s worth it.', votes: 19, verified: true, handle: '@brewsncr', reviews: [{ h: '@coffeeobsessed', v: true, d: 'Jan 2025', t: 'Best pour-over in Delhi.' }] },
    { name: 'The Piano Man', area: 'Safdarjung', time: '5pm – 12am', price: '₹₹ 500–1000', tags: ['jazz', 'live music', 'evening'], desc: 'Jazz café with live sessions Wednesday to Sunday evenings. Warm lighting, good cocktails.', votes: 41, verified: true, handle: '@jazzdelhi', reviews: [{ h: '@nightlife_ncr', v: false, d: 'Mar 2025', t: 'Wednesday sessions are smaller and more intimate.' }, { h: '@livemusicdelhi', v: true, d: 'Feb 2025', t: 'Come for the live music, stay for the whiskey sours.' }] },
  ],
  night: [
    { name: 'Raasta', area: 'Hauz Khas', time: '5pm – 1am', price: '₹₹ 500–1200', tags: ['rooftop', 'reggae', 'bar'], desc: 'Reggae bar on a rooftop in HKV. Drinks that won\'t destroy your wallet. Better on weeknights.', votes: 31, verified: true, handle: '@delhioutgoing', reviews: [{ h: '@reggaedelhi', v: false, d: 'Jan 2025', t: 'Go Thursday, avoid Friday-Saturday unless you like crowds.' }] },
    { name: 'PCO Bar', area: 'Vasant Vihar', time: '7pm – 1am', price: '₹₹₹ 1200–2500', tags: ['cocktails', 'speakeasy', 'small bar'], desc: 'One of Delhi\'s most interesting cocktail bars. 21-foot omakase bar, very limited seating. Book ahead.', votes: 36, verified: true, handle: '@cocktailsdelhi', reviews: [{ h: '@barhopper_ncr', v: true, d: 'Feb 2025', t: 'Had a cocktail with kokum and it worked somehow.' }] },
  ],
  out: [
    { name: 'Lodhi Garden', area: 'Lodhi Colony', time: '6am – 8pm', price: 'Free', tags: ['park', 'heritage', 'morning walk'], desc: '90 acres of Mughal tombs, ancient trees, and the best morning light in Delhi. Go at 7am.', votes: 37, verified: true, handle: '@morningdelhi', reviews: [{ h: '@lodhiregular', v: true, d: 'Mar 2025', t: 'Watched a Sufi concert next to Sikandar Lodi\'s tomb. Completely free.' }] },
    { name: 'Sunder Nursery', area: 'Nizamuddin', time: '7am – 7pm', price: '₹25 entry', tags: ['garden', 'heritage', 'sunset'], desc: '90 acres of heritage garden next to Humayun\'s Tomb. The golden hour light here is something else.', votes: 18, verified: false, handle: '@slowdelhi', reviews: [{ h: '@sundernursery_walks', v: false, d: 'Feb 2025', t: 'Went alone on a Sunday. Stayed two hours without realising it.' }] },
  ],
  gem: [
    { name: 'Agrasen ki Baoli', area: 'Connaught Place', time: '7am – 6pm', price: 'Free', tags: ['stepwell', '14th century', 'hidden'], desc: 'A 14th-century stepwell in the middle of CP. 103 steps down into quiet beauty. Most people don\'t know it exists.', votes: 44, verified: true, handle: '@delhisecrets', reviews: [{ h: '@architecturewalk', v: true, d: 'Feb 2025', t: 'Hard to believe it\'s in the middle of the city.' }] },
    { name: 'Majnu Ka Tila', area: 'North Delhi', time: 'All day', price: 'Free', tags: ['tibetan', 'momos', 'offbeat'], desc: 'Delhi\'s Tibetan enclave. Narrow lanes, Buddhist temples, great momos. Very few tourists know about it.', votes: 26, verified: true, handle: '@dillidiaries', reviews: [{ h: '@tibetanfood_ncr', v: false, d: 'Mar 2025', t: 'The momos at the small stalls are better than any restaurant version.' }] },
  ],
  art: [
    { name: 'Kiran Nadar Museum', area: 'Saket', time: '10:30am – 6:30pm', price: 'Free', tags: ['modern art', 'museum', 'free'], desc: 'The best free contemporary art museum in Delhi. Large collection of modern Indian and international work.', votes: 29, verified: true, handle: '@knma_delhi', reviews: [{ h: '@artcrawl_ncr', v: true, d: 'Jan 2025', t: 'The permanent collection has real surprises. Go without a plan.' }, { h: '@museumhopper', v: false, d: 'Feb 2025', t: 'The temporary shows are consistently strong.' }] },
    { name: 'Bikaner House', area: 'India Gate', time: '11am – 9pm', price: 'Free to enter', tags: ['heritage', 'galleries', 'restaurants'], desc: 'A 1929 palace turned cultural centre. Four restaurants inside, free galleries, and the best lunch terrace in Central Delhi.', votes: 20, verified: true, handle: '@bikanerhouse', reviews: [{ h: '@centraldelhiwalks', v: true, d: 'Mar 2025', t: 'The building itself is worth going for.' }] },
  ],
};