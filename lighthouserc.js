{
  "ci": {
    "collect": {
      "url": [
        "http://localhost:8080/",
        "http://localhost:8080/pages/denuncias.html",
        "http://localhost:8080/pages/noticias.html"
      ],
      "staticDistDir": ".",
      "numberOfRuns": 3
    },
    "assert": {
      "assertions": {
        "categories:performance": ["error", {"minScore": 0.8}],
        "categories:accessibility": ["error", {"minScore": 0.9}],
        "categories:best-practices": ["error", {"minScore": 0.8}],
        "categories:seo": ["error", {"minScore": 0.8}],
        "categories:pwa": ["warn", {"minScore": 0.6}]
      }
    },
    "upload": {
      "target": "temporary-public-storage"
    },
    "server": {
      "command": "npx serve . -l 8080",
      "port": 8080
    }
  }
}