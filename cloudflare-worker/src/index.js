/**
 * BraveMath Cloudflare Worker
 * Proxy for Google Drive files to hide direct links
 */

// Rate limiting storage (in-memory, resets on Worker restart)
const rateLimiter = new Map();

// Rate limit config
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 10; // 10 requests per minute per IP

// Validate Google Drive ID format (33 characters, alphanumeric + dash/underscore)
function isValidDriveId(driveId) {
  // Google Drive IDs are typically 33 characters (can be 28-44)
  // Format: alphanumeric, dash, underscore
  return /^[a-zA-Z0-9_-]{28,44}$/.test(driveId);
}

// Check rate limit for IP
function checkRateLimit(ip) {
  const now = Date.now();
  const requests = rateLimiter.get(ip) || [];
  
  // Remove old requests outside time window
  const recentRequests = requests.filter(timestamp => now - timestamp < RATE_LIMIT_WINDOW);
  
  // Check if over limit
  if (recentRequests.length >= RATE_LIMIT_MAX_REQUESTS) {
    return { allowed: false, remaining: 0 };
  }
  
  // Add current request
  recentRequests.push(now);
  rateLimiter.set(ip, recentRequests);
  
  return { 
    allowed: true, 
    remaining: RATE_LIMIT_MAX_REQUESTS - recentRequests.length 
  };
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Get client IP (Cloudflare provides this)
    const clientIP = request.headers.get('CF-Connecting-IP') || 'unknown';
    
    // Check rate limit
    const rateLimit = checkRateLimit(clientIP);
    if (!rateLimit.allowed) {
      return new Response('Too many requests. Please try again later.', {
        status: 429,
        headers: {
          ...corsHeaders,
          'Retry-After': '60',
          'X-RateLimit-Limit': RATE_LIMIT_MAX_REQUESTS,
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': Date.now() + RATE_LIMIT_WINDOW
        }
      });
    }

    // Route: /download/{driveId}
    if (url.pathname.startsWith('/download/')) {
      const driveId = url.pathname.split('/download/')[1];
      
      if (!driveId) {
        return new Response('Missing Drive ID', { 
          status: 400,
          headers: corsHeaders 
        });
      }

      // ✅ Validate Drive ID format (security fix)
      if (!isValidDriveId(driveId)) {
        return new Response('Invalid Drive ID format', {
          status: 400,
          headers: corsHeaders
        });
      }

      try {
        // Google Drive direct download URL
        const driveUrl = `https://drive.google.com/uc?export=download&id=${driveId}`;
        
        // Fetch from Google Drive
        const driveResponse = await fetch(driveUrl, {
          method: 'GET',
          redirect: 'follow'
        });

        if (!driveResponse.ok) {
          return new Response('Failed to fetch from Drive', { 
            status: driveResponse.status,
            headers: corsHeaders 
          });
        }

        // Clone response and add CORS headers
        const response = new Response(driveResponse.body, driveResponse);
        
        // Add custom headers
        response.headers.set('Access-Control-Allow-Origin', '*');
        response.headers.set('Cache-Control', 'public, max-age=86400'); // Cache for 24 hours
        response.headers.set('X-Powered-By', 'BraveMath');

        return response;

      } catch (error) {
        return new Response(`Error: ${error.message}`, { 
          status: 500,
          headers: corsHeaders 
        });
      }
    }

    // Route: /preview/{driveId}
    if (url.pathname.startsWith('/preview/')) {
      const driveId = url.pathname.split('/preview/')[1];
      
      if (!driveId) {
        return new Response('Missing Drive ID', { 
          status: 400,
          headers: corsHeaders 
        });
      }

      // ✅ Validate Drive ID format (security fix)
      if (!isValidDriveId(driveId)) {
        return new Response('Invalid Drive ID format', {
          status: 400,
          headers: corsHeaders
        });
      }

      // Tạo HTML page với iframe embed Google Drive (ẩn URL gốc)
      const previewHTML = `
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Preview - BraveMath</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            background: #000; 
            overflow: hidden;
            font-family: system-ui, -apple-system, sans-serif;
        }
        iframe { 
            position: absolute;
            top: 0;
            left: 0;
            width: 100%; 
            height: 100%; 
            border: none;
        }
        .loading {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: #fff;
            font-size: 18px;
        }
    </style>
</head>
<body>
    <div class="loading">Đang tải tài liệu...</div>
    <iframe src="https://drive.google.com/file/d/${driveId}/preview" 
            allow="autoplay" 
            allowfullscreen
            onload="document.querySelector('.loading').style.display='none'">
    </iframe>
</body>
</html>
      `;
      
      return new Response(previewHTML, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          ...corsHeaders
        }
      });
    }

    // Default route
    return new Response(JSON.stringify({
      service: 'BraveMath Proxy',
      version: '1.0.0',
      endpoints: [
        '/download/{driveId} - Download file from Google Drive',
        '/preview/{driveId} - Preview file in browser'
      ]
    }), {
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  },
};
