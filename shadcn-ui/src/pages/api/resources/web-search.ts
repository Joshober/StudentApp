import { NextApiRequest, NextApiResponse } from 'next';

interface WebSearchResult {
  title: string;
  link: string;
  snippet: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Query parameter is required'
      });
    }

    // Try to use DuckDuckGo Instant Answer API first
    let results: WebSearchResult[] = [];
    
    try {
      const duckDuckGoResponse = await fetch(
        `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`
      );
      
      if (duckDuckGoResponse.ok) {
        const data = await duckDuckGoResponse.json();
        
        if (data.Abstract) {
          results.push({
            title: data.Heading || query,
            link: data.AbstractURL || `https://duckduckgo.com/?q=${encodeURIComponent(query)}`,
            snippet: data.Abstract
          });
        }
        
        // Add related topics
        if (data.RelatedTopics && data.RelatedTopics.length > 0) {
          data.RelatedTopics.slice(0, 3).forEach((topic: any) => {
            if (topic.Text) {
              results.push({
                title: topic.Text.split(' - ')[0] || topic.Text,
                link: topic.FirstURL || `https://duckduckgo.com/?q=${encodeURIComponent(topic.Text)}`,
                snippet: topic.Text
              });
            }
          });
        }
      }
    } catch (error) {
      console.log('DuckDuckGo API failed, using fallback results');
    }

    // If we don't have enough results, add some curated educational resources
    if (results.length < 5) {
      const educationalResults = [
        {
          title: `${query} - Free Online Course`,
          link: `https://www.coursera.org/search?query=${encodeURIComponent(query)}`,
          snippet: `Find free and paid courses on ${query} from top universities and companies worldwide.`
        },
        {
          title: `${query} Tutorial for Beginners`,
          link: `https://www.udemy.com/topic/${encodeURIComponent(query.toLowerCase())}/`,
          snippet: `Step-by-step tutorials and courses on ${query} for all skill levels.`
        },
        {
          title: `${query} Documentation`,
          link: `https://developer.mozilla.org/en-US/search?q=${encodeURIComponent(query)}`,
          snippet: `Official documentation and learning resources for ${query} from MDN Web Docs.`
        },
        {
          title: `${query} on GitHub`,
          link: `https://github.com/topics/${encodeURIComponent(query.toLowerCase())}`,
          snippet: `Explore open-source projects and code examples related to ${query} on GitHub.`
        },
        {
          title: `${query} Community Resources`,
          link: `https://stackoverflow.com/search?q=${encodeURIComponent(query)}`,
          snippet: `Find answers, discussions, and community resources for ${query} on Stack Overflow.`
        }
      ];

      // Add educational results to fill up to 5 results
      const remainingSlots = 5 - results.length;
      results.push(...educationalResults.slice(0, remainingSlots));
    }

    // Simulate API delay for better UX
    await new Promise(resolve => setTimeout(resolve, 300));

    res.status(200).json({
      success: true,
      results: results.slice(0, 5),
      query: query,
      source: results.length > 0 ? 'DuckDuckGo + Curated' : 'Curated'
    });
  } catch (error) {
    console.error('Error performing web search:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to perform web search'
    });
  }
} 