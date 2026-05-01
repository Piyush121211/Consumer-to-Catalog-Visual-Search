const express = require('express');
const cors = require('cors');
require('dotenv').config();
const path = require('path');
const Groq = require('groq-sdk');
const axios = require('axios');
const FormData = require('form-data');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static(path.join(__dirname)));

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const ANALYZE_SYSTEM_PROMPT = `You are an expert product analyst and visual search engine backend. 
When given an image, identify the PRIMARY item of interest (the main product or object).
Return ONLY valid JSON — no markdown, no backticks, no explanation.

JSON shape:
{
  "category": "short category (e.g. Sneakers, Handbag, Watch)",
  "itemName": "descriptive product name, 3-7 words",
  "attributes": [
    { "key": "Color", "val": "..." },
    { "key": "Style", "val": "..." },
    { "key": "Material", "val": "..." },
    { "key": "Occasion", "val": "..." }
  ],
  "confidence": 0.0-1.0,
  "detectionBox": { "top": 0.1, "left": 0.1, "width": 0.8, "height": 0.8 },
  "searchTerms": "comma-separated keywords for catalog search",
  "emoji": "single most fitting emoji for the product"
}

detectionBox values are fractions of image dimensions (0.0–1.0). Be precise.`;

app.post('/api/analyze', async (req, res) => {
  try {
    const { imageBase64 } = req.body;
    const dataUrl = `data:image/jpeg;base64,${imageBase64}`;

    const chatCompletion = await groq.chat.completions.create({
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      messages: [
        {
          role: "system",
          content: ANALYZE_SYSTEM_PROMPT
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Analyze this image and return the JSON for the primary product."
            },
            {
              type: "image_url",
              image_url: {
                url: dataUrl
              }
            }
          ]
        }
      ],
      temperature: 0.3
    });

    const text = chatCompletion.choices[0].message.content;
    const clean = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);
    res.json(parsed);

  } catch (err) {
    console.error('❌ Groq error:', err.response ? err.response.data : err.message);
    res.status(500).json({ error: { message: err.message } });
  }
});

app.post('/api/search', async (req, res) => {
  try {
    const { itemData, imageBase64 } = req.body;
    
    console.log('🔍 Starting Google Lens Multisearch...');

    // Step 1: Clean base64 string and upload to ImgBB
    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    
    const params = new URLSearchParams();
    params.append('key', process.env.IMGBB_API_KEY);
    params.append('image', cleanBase64);

    console.log('📤 Uploading image to ImgBB...');
    const imgbbResponse = await axios.post('https://api.imgbb.com/1/upload', params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    const publicImageUrl = imgbbResponse.data.data.url;
    console.log('✅ Image uploaded to ImgBB:', publicImageUrl);

    // Step 2: Use Google Lens via SerpApi
    console.log('🔍 Searching with Google Lens...');
    const lensResponse = await axios.get('https://serpapi.com/search.json', {
      params: {
        engine: 'google_lens',
        url: publicImageUrl,
        q: itemData.itemName,
        hl: 'en',
        gl: 'in',
        api_key: process.env.SERPAPI_API_KEY
      }
    });

    // Step 3: Parse Google Lens results
    const visualMatches = lensResponse.data.visual_matches || [];
    const products = visualMatches.slice(0, 8).map((item, index) => {
      let price = 1499;
      if (item.price && item.price.extracted_value) {
        price = item.price.extracted_value;
      } else if (item.price && item.price.value) {
        const match = item.price.value.match(/[\d,.]+/);
        if (match) {
          price = parseInt(match[0].replace(/[^0-9]/g, ''), 10);
        }
      }

      return {
        brand: item.source || 'Unknown',
        name: item.title || 'Product',
        price: price,
        matchScore: 0.95 - (index * 0.05),
        emoji: '🛒',
        color: '',
        tag: index === 0 ? 'Best Match' : '',
        image: item.thumbnail || '',
        link: item.link || ''
      };
    });

    console.log(`✅ Found ${products.length} products!`);
    res.json(products);

  } catch (err) {
    console.error("Search API Error:", err.response ? err.response.data : err.message);
    res.status(500).json({ error: { message: err.message } });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
