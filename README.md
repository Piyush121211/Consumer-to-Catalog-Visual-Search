Pixel to Product: Consumer-to-Catalog Visual Search
​A real-time, multimodal visual search application that bridges the gap between physical objects in the real world and digital e-commerce catalogs. Simply snap a photo of any item, and the app will instantly identify it and fetch live shopping links, prices, and catalogs from across the web.
​*OVERVIEW
​This project was built to explore applied image processing, computer vision, and multimodal AI. It bypasses standard text-based search by allowing users to use a live camera feed to discover products.
​Instead of relying on basic image classification, this app uses a true Multimodal Pipeline (combining visual pixel data with extracted text features) to perform highly accurate internet scraping for real-time retail data.
​
*FEATURES
​Real-Time Camera Integration: Native WebRTC and HTML5 canvas integration for live mobile and desktop camera capture.
​Lightning-Fast AI Vision: Utilizes Groq's API (Meta Llama 4 Vision) for near-instant object detection, feature extraction, and bounding box coordinate calculation.
​Multimodal Web Scraping: Connects visual data and text descriptions to SerpApi's Google Lens engine for accurate real-world product matching.
​Direct E-Commerce Routing: Bypasses "dummy" carts and provides direct "Visit Website" routing to live retail stores (Amazon, Flipkart, etc.).
​Secure Image Bridging: Dynamically converts local Base64 image streams into secure public URLs via ImgBB for external API processing.
​
*TECH STACK
​Frontend:
​HTML5, CSS3, Vanilla JavaScript
​WebRTC (Live Camera Access)
​
*Backend & APIs:
​Node.js & Express.js
​Groq API: (Model: meta-llama/llama-4-scout-17b-16e-instruct) for Computer Vision & Image Processing.
​SerpApi: Google Lens Engine for live internet catalog scraping.
​ImgBB API: For temporary public image hosting and URL generation.
​
*THE IMAGE PROCESSING PIPELINE (HOW IT WORKS)
​Capture: The browser extracts a static frame from the live video feed and compresses it into a Base64 encoded string.
​Analyze: The Node.js server sends the Base64 matrix to the Groq Vision model, which identifies the object and generates a rich text description.
​Bridge: The backend strips local headers and uploads the raw image data to ImgBB, receiving a public https URL in return.
​Search: The public Image URL and Groq's text description are sent to SerpApi to execute a Multimodal Search.
​Render: The backend parses the live JSON shopping data and renders the matching digital products back to the user interface.
​
*LOCAL SETUP & INSTALLATION
​Prerequisites:
​Node.js installed
​API Keys for Groq, SerpApi, and ImgBB.

​->Installation Steps:
​Clone the repository
​Open your terminal and navigate to the project folder.
​Install dependencies by running: npm install
​Create a file named .env in the root directory and add your API keys like this:
GROQ_API_KEY=gsk_your_groq_key_here
SERPAPI_KEY=your_serpapi_key_here
IMGBB_API_KEY=your_imgbb_key_here
​Start the server by running: node server.js
​Open your browser and navigate to http://localhost:3000

​*AUTHOR
​Piyush Pandurang Chougale
LinkedIn:https://www.linkedin.com/in/piyush-chougale-33a3392bb?utm_source=share_via&utm_content=profile&utm_medium=member_android
