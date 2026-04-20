export default function DocsPage() {
  return (
    <html>
      <head>
        <title>UnnayanAI API Documentation</title>
        <meta charSet="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css"/>
        <style>{`
          body { margin: 0; background: #f0fdf4; }
          .topbar { background: linear-gradient(135deg, #10b981, #0891b2) !important; }
          .topbar-wrapper img { content: none !important; }
          .topbar-wrapper::before { content: "🌾 UnnayanAI API"; color: white; font-weight: bold; font-size: 1.2rem; font-family: sans-serif; }
          .swagger-ui .info .title { color: #059669; }
          .swagger-ui .opblock.opblock-get .opblock-summary { border-color: #10b981; }
        `}</style>
      </head>
      <body>
        <div id="swagger-ui"/>
        <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"/>
        <script dangerouslySetInnerHTML={{ __html: `
          window.onload = () => {
            SwaggerUIBundle({
              url: "/api/docs",
              dom_id: "#swagger-ui",
              deepLinking: true,
              presets: [SwaggerUIBundle.presets.apis, SwaggerUIBundle.SwaggerUIStandalonePreset],
              layout: "BaseLayout",
              requestInterceptor: (req) => {
                const token = localStorage.getItem("token");
                if (token) req.headers.Authorization = "Bearer " + token;
                return req;
              }
            });
          };
        `}}/>
      </body>
    </html>
  );
}
