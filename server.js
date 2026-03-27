import express from 'express';
import cors from 'cors';
import Parser from 'rss-parser';

const app = express();
const parser = new Parser();
const PORT = process.env.PORT || 3000;

app.use(cors());

// Define our RSS feeds by category
const feeds = [
  // ALL / WORLD
  { url: 'http://feeds.bbci.co.uk/news/world/rss.xml', source: 'BBC News', category: 'All' },
  { url: 'https://rss.nytimes.com/services/xml/rss/nyt/World.xml', source: 'NYT', category: 'All' },
  { url: 'https://feeds.npr.org/1004/rss.xml', source: 'Npr World', category: 'All' },
  { url: 'https://www.aljazeera.com/xml/rss/all.xml', source: 'Al Jazeera', category: 'All' },
  { url: 'https://www.theguardian.com/world/rss', source: 'The Guardian World', category: 'All' },
  
  // POLITICS
  { url: 'https://rss.nytimes.com/services/xml/rss/nyt/Politics.xml', source: 'NYT Politics', category: 'Politics' },
  { url: 'https://feeds.npr.org/1014/rss.xml', source: 'NPR Politics', category: 'Politics' },
  { url: 'http://feeds.bbci.co.uk/news/politics/rss.xml', source: 'BBC Politics', category: 'Politics' },
  { url: 'https://www.theguardian.com/us-news/rss', source: 'The Guardian US', category: 'Politics' },
  
  // TECH
  { url: 'https://techcrunch.com/feed/', source: 'TechCrunch', category: 'Tech' },
  { url: 'https://www.wired.com/feed/rss', source: 'Wired', category: 'Tech' },
  { url: 'https://rss.nytimes.com/services/xml/rss/nyt/Technology.xml', source: 'NYT Tech', category: 'Tech' },
  { url: 'https://feeds.npr.org/1019/rss.xml', source: 'NPR Tech', category: 'Tech' },
  { url: 'https://www.theverge.com/rss/index.xml', source: 'The Verge', category: 'Tech' },
  { url: 'https://feeds.arstechnica.com/arstechnica/index', source: 'Ars Technica', category: 'Tech' },
  
  // BUSINESS
  { url: 'https://feeds.a.dj.com/rss/WSJcomUSBusiness.xml', source: 'WSJ', category: 'Business' },
  { url: 'https://rss.nytimes.com/services/xml/rss/nyt/Business.xml', source: 'NYT Business', category: 'Business' },
  { url: 'https://feeds.npr.org/1006/rss.xml', source: 'NPR Business', category: 'Business' },
  { url: 'https://www.economist.com/finance-and-economics/rss.xml', source: 'The Economist', category: 'Business' },
  { url: 'https://www.cnbc.com/id/10001147/device/rss/rss.html', source: 'CNBC Top News', category: 'Business' },
  
  // SCIENCE
  { url: 'https://rss.nytimes.com/services/xml/rss/nyt/Science.xml', source: 'NYT Science', category: 'Science' },
  { url: 'https://feeds.npr.org/1007/rss.xml', source: 'NPR Science', category: 'Science' },
  { url: 'http://feeds.bbci.co.uk/news/science_and_environment/rss.xml', source: 'BBC Science', category: 'Science' },
  { url: 'https://www.sciencenews.org/feed', source: 'Science News', category: 'Science' },
  { url: 'https://www.nasa.gov/rss/dyn/breaking_news.rss', source: 'NASA', category: 'Science' },
  
  // ENTERTAINMENT / ARTS
  { url: 'https://rss.nytimes.com/services/xml/rss/nyt/Arts.xml', source: 'NYT Arts', category: 'Entertainment' },
  { url: 'http://feeds.bbci.co.uk/news/entertainment_and_arts/rss.xml', source: 'BBC Entertainment', category: 'Entertainment' },
  { url: 'https://feeds.npr.org/1008/rss.xml', source: 'NPR Arts', category: 'Entertainment' },
  { url: 'https://variety.com/feed/', source: 'Variety', category: 'Entertainment' },
  { url: 'https://www.rollingstone.com/music/music-news/feed/', source: 'Rolling Stone', category: 'Entertainment' },

  // SPORTS
  { url: 'https://rss.nytimes.com/services/xml/rss/nyt/Sports.xml', source: 'NYT Sports', category: 'Sports', sport: 'All' },
  { url: 'http://feeds.bbci.co.uk/sport/rss.xml', source: 'BBC Sports', category: 'Sports', sport: 'All' },
  { url: 'https://www.espn.com/espn/rss/nfl/news', source: 'ESPN NFL', category: 'Sports', sport: 'Football' },
  { url: 'https://www.espn.com/espn/rss/nba/news', source: 'ESPN NBA', category: 'Sports', sport: 'Basketball' },
  { url: 'https://sports.yahoo.com/nfl/rss.xml', source: 'Yahoo NFL', category: 'Sports', sport: 'Football' },
  { url: 'https://sports.yahoo.com/nba/rss.xml', source: 'Yahoo NBA', category: 'Sports', sport: 'Basketball' },
  { url: 'http://feeds.bbci.co.uk/sport/football/rss.xml', source: 'BBC Football', category: 'Sports', sport: 'Soccer' },
  { url: 'https://www.espn.com/espn/rss/soccer/news', source: 'ESPN Soccer', category: 'Sports', sport: 'Soccer' },
  { url: 'https://www.theguardian.com/football/rss', source: 'The Guardian Football', category: 'Sports', sport: 'Soccer' },

  // HEALTH
  { url: 'https://rss.nytimes.com/services/xml/rss/nyt/Health.xml', source: 'NYT Health', category: 'Health' },
  { url: 'https://feeds.npr.org/1128/rss.xml', source: 'NPR Health', category: 'Health' },
  { url: 'http://feeds.bbci.co.uk/news/health/rss.xml', source: 'BBC Health', category: 'Health' },
  { url: 'https://www.medicalnewstoday.com/rss', source: 'Medical News Today', category: 'Health' },
];

// cache headlines
let cachedHeadlines = [];
let lastFetchTime = null;

// Helper method to format pubDate relative to Now
function getRelativeTime(pubDate) {
  if (!pubDate) return 'Recently';
  const date = new Date(pubDate);
  const now = new Date();
  const diffInMinutes = Math.floor((now - date) / (1000 * 60));
  
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  return `${Math.floor(diffInHours / 24)}d ago`;
}

// Function to fetch and update headlines
async function updateHeadlines() {
  console.log(`[${new Date().toISOString()}] Fetching latest RSS feeds...`);
  let newHeadlines = [];
  
  for (const feed of feeds) {
    try {
      const parsedFeed = await parser.parseURL(feed.url);
      
      // 50 from each feed
      const items = parsedFeed.items.slice(0, 50).map(item => ({
        title: item.title,
        source: feed.source,
        url: item.link,
        category: feed.category,
        sport: feed.sport || 'All',
        time: getRelativeTime(item.pubDate),
        pubDateObj: new Date(item.pubDate || Date.now()) // For sorting
      }));
      
      newHeadlines = newHeadlines.concat(items);
    } catch (err) {
      console.error(`Error fetching ${feed.source}:`, err.message);
    }
  }
  
  // Sort by newest first
  newHeadlines.sort((a, b) => b.pubDateObj - a.pubDateObj);
  
  // Remove the temporary date object used for sorting
  cachedHeadlines = newHeadlines.map(({ pubDateObj, ...rest }) => rest);
  lastFetchTime = new Date();
  console.log(`[${lastFetchTime.toISOString()}] Updated ${cachedHeadlines.length} headlines.`);
}

// Initial fetch
updateHeadlines();

// Poll every 1 minute (60,000 ms)
setInterval(updateHeadlines, 60 * 1000);

// API Endpoint
app.get('/api/headlines', (req, res) => {
  const category = req.query.category || 'All';
  const limit = parseInt(req.query.limit) || 20;
  const sport = req.query.sport || 'All';
  
  let filtered = cachedHeadlines;
  
  // Filter by category
  if (category === 'All') {
    // Filter Sports for User Readability
    filtered = filtered.filter(h => h.category !== 'Sports');
  } else {
    filtered = filtered.filter(h => h.category === category);
  }

  // Filter by sports subcategory (only when explicitly in Sports)
  if (category === 'Sports' && sport !== 'All') {
    filtered = filtered.filter(h => h.sport === sport);
  }
  
  // Return requested limit
  res.json(filtered.slice(0, limit));
});

app.get('/health', (_req, res) => {
  res.status(200).send('ok');
});

app.listen(PORT, () => {
  console.log(`RSS Polling Server running on http://localhost:${PORT}`);
});
