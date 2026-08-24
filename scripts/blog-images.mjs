// Curated topic-matched Unsplash photos per article (id) + keywords used for
// the mid-article image and as fallback if an id ever stops resolving.

export const ARTICLE_IMAGES = {
    // Business & Marketing
    "marketing-strategies-that-work": { id: "1460925895917-afdab827c52f", kw: "marketing,analytics" },
    "small-business-compete-big-brands": { id: "1556740738-b6a63e27c4df", kw: "small,business,shop" },
    "psychology-of-pricing": { id: "1554224155-6726b3ff858f", kw: "finance,calculator" },
    "building-a-memorable-brand": { id: "1493421419110-74f4e85ba126", kw: "branding,design" },
    "social-media-without-burnout": { id: "1611162617213-7d7a39e9b1d7", kw: "social,media,phone" },
    "email-funnels-that-convert": { id: "1596526131083-e8c633c948d2", kw: "email,laptop" },
    "local-seo-guide": { id: "1524661135-423995f22d0b", kw: "map,city" },
    "art-of-the-follow-up": { id: "1521791136064-7986c2920216", kw: "handshake,business" },
    "customer-feedback-into-revenue": { id: "1553877522-43269d4ea984", kw: "meeting,whiteboard" },
    "freelancer-to-agency": { id: "1522202176988-66273c2fd55f", kw: "team,office,laptop" },

    // Lifestyle
    "slow-morning-routine": { id: "1495474472287-4d71bcdd2085", kw: "coffee,morning" },
    "digital-minimalism": { id: "1512941937669-90a1b58e7e9c", kw: "smartphone,dark" },
    "eating-well-when-busy": { id: "1512621776951-a57141f2eefd", kw: "healthy,food,salad" },
    "rest-as-a-skill": { id: "1441974231531-c6227db76b6e", kw: "forest,calm,nature" },
    "home-that-works-for-you": { id: "1484154218962-a197022b5858", kw: "home,interior" },
    "weekend-reset-rituals": { id: "1499750310107-5fef28a66643", kw: "journal,coffee,desk" },
    "mindful-spending": { id: "1526304640581-d334cdbbf45e", kw: "money,budget" },
    "deep-conversation": { id: "1573497019940-1c28c88b4f3e", kw: "conversation,people" },
    "sustainable-swaps": { id: "1542601906990-b4d3fb778b09", kw: "sustainability,green" },
    "hobbies-matter": { id: "1452860606245-08befc0ff44b", kw: "guitar,hobby" },

    // Personal Development
    "habits-that-stick": { id: "1484480974693-6ca0a78fb36b", kw: "planner,habits" },
    "learn-anything-faster": { id: "1456513080510-7bf3a84b82f8", kw: "books,study" },
    "confidence-myth": { id: "1519834785169-98be25ec3f84", kw: "confidence,sunrise" },
    "deep-work-guide": { id: "1497032628192-86f99bcd76bc", kw: "focus,workspace" },
    "power-of-saying-no": { id: "1506784983877-45594efa4cbe", kw: "calendar,planning" },
    "journaling-for-skeptics": { id: "1517842645767-c639042777db", kw: "notebook,writing" },
    "receiving-feedback-well": { id: "1552664730-d307ca884978", kw: "feedback,team" },
    "escape-comparison-trap": { id: "1507003211169-0a1dd7228f2d", kw: "thinking,portrait" },
    "discipline-over-motivation": { id: "1476480862126-209bfaa8edc8", kw: "running,morning" },
    "meditation-for-beginners": { id: "1506126613408-eca07ce68773", kw: "meditation,peace" },

    // Tech & Gadgets
    "ai-assistants-2026": { id: "1677442136019-21780ecad995", kw: "artificial,intelligence" },
    "laptop-buying-guide": { id: "1496181133206-80ce9b88a853", kw: "laptop,desk" },
    "practical-smart-home": { id: "1558002038-1055907df827", kw: "smart,home,device" },
    "password-manager-guide": { id: "1614064641938-3bbee52942c7", kw: "security,lock" },
    "backup-strategy-321": { id: "1558494949-ef010cbdcc31", kw: "server,data" },
    "ewaste-old-gadgets": { id: "1550009158-9ebf69173e03", kw: "electronics,circuit" },
    "wearables-health-data": { id: "1523275335684-37898b6baf30", kw: "smartwatch,wearable" },
    "cloud-storage-compared": { id: "1451187580459-43490279c0fa", kw: "cloud,technology" },
    "home-office-tech": { id: "1547082299-de196ea013d6", kw: "desk,setup,monitor" },
    "automate-digital-chores": { id: "1485827404703-89b55fcc595e", kw: "robot,automation" },

    // Travel
    "one-bag-travel": { id: "1488646953014-85cb44e25828", kw: "backpack,traveler" },
    "budget-travel-guide": { id: "1469854523086-cc02fe5d8800", kw: "roadtrip,map" },
    "solo-travel-guide": { id: "1503220317375-aaad61436b1b", kw: "solo,travel,mountains" },
    "layover-city-guide": { id: "1436491865332-7a61a109cc05", kw: "airplane,sky" },
    "food-travel-guide": { id: "1504674900247-0877df9cc836", kw: "food,cuisine" },
    "phone-travel-photography": { id: "1516035069371-29a1b244cc32", kw: "camera,photography" },
    "slow-travel-philosophy": { id: "1507525428034-b723cf961d3e", kw: "beach,relax" },
    "long-haul-flight-guide": { id: "1569154941061-e231b4725ef1", kw: "airplane,cabin,window" },
    "sustainable-travel": { id: "1500835556837-99ac94a94552", kw: "airplane,sunset" },
    "weekend-getaway-playbook": { id: "1533105079780-92b9be482077", kw: "road,mountains,trip" },
}

export const unsplashUrl = (id, w = 1200, h = 675) =>
    `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&h=${h}&q=80`

export const fallbackUrl = (kw, lock) =>
    `https://loremflickr.com/1200/675/${kw}?lock=${lock}`
